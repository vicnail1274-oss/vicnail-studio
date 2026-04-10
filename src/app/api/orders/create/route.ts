import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { createPaymentForm } from "@/lib/ecpay/payment";
import { calculateShippingFee, type LogisticsType } from "@/lib/ecpay/logistics";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import crypto from "crypto";

interface OrderItemInput {
  productId: string;
  quantity: number;
  variant?: Record<string, string>;
}

interface ShippingInput {
  type: LogisticsType;
  name: string;
  phone: string;
  email: string;
  address?: string;
  storeId?: string;
  storeName?: string;
}

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 10 訂單 / 10 分鐘 / IP
    const ip = getClientIp(req);
    const rl = rateLimit(`order:${ip}`, 10, 10 * 60 * 1000);
    if (!rl.ok) {
      return NextResponse.json(
        { error: "請求過於頻繁，請稍後再試" },
        { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
      );
    }

    const body = await req.json();
    const {
      items,
      shipping,
      payment,
      notes,
    }: {
      items: OrderItemInput[];
      shipping: ShippingInput;
      payment: string;
      notes?: string;
    } = body;

    if (!items?.length || !shipping?.name || !shipping?.phone) {
      return NextResponse.json(
        { error: "缺少必要欄位" },
        { status: 400 }
      );
    }

    // 取得使用者（可選，允許未登入購物）
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 用 admin client 讀取商品資訊（繞過 RLS）
    const admin = await createAdminClient();

    // 查詢商品
    const productIds = items.map((i) => i.productId);
    const { data: products, error: productError } = await admin
      .from("products")
      .select("id, title, price, sale_price, stock, purchase_type, status")
      .in("id", productIds)
      .eq("status", "published");

    if (productError || !products?.length) {
      return NextResponse.json(
        { error: "商品不存在或已下架" },
        { status: 400 }
      );
    }

    // 驗證庫存並計算金額
    const orderItems: {
      item_type: "product";
      item_id: string;
      item_title: string;
      quantity: number;
      unit_price: number;
      total_price: number;
    }[] = [];

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `商品 ${item.productId} 不存在` },
          { status: 400 }
        );
      }
      if (
        product.purchase_type === "instock" &&
        product.stock < item.quantity
      ) {
        return NextResponse.json(
          { error: `${product.title} 庫存不足（剩餘 ${product.stock} 件）` },
          { status: 400 }
        );
      }

      const unitPrice = product.sale_price ?? product.price;
      orderItems.push({
        item_type: "product",
        item_id: product.id,
        item_title: product.title,
        quantity: item.quantity,
        unit_price: unitPrice,
        total_price: unitPrice * item.quantity,
      });
    }

    const subtotal = orderItems.reduce((s, i) => s + i.total_price, 0);
    const shippingFee = calculateShippingFee(shipping.type);
    const total = subtotal + shippingFee;

    // 產生訂單編號
    const orderNumber = `VN${Date.now().toString(36).toUpperCase()}${crypto.randomBytes(2).toString("hex").toUpperCase()}`;

    // 建立訂單
    const { data: order, error: orderError } = await admin
      .from("orders")
      .insert({
        user_id: user?.id || null,
        order_number: orderNumber,
        status: "pending",
        total,
        shipping_fee: shippingFee,
        payment_method: payment,
        shipping_name: shipping.name,
        shipping_phone: shipping.phone,
        shipping_address:
          shipping.address ||
          (shipping.storeName
            ? `${shipping.storeName}（${shipping.storeId}）`
            : "自取"),
        shipping_method: shipping.type,
        shipping_store_id: shipping.storeId || null,
        shipping_store_name: shipping.storeName || null,
        logistics_type: shipping.type,
        notes: notes || null,
        source: "web",
      })
      .select("id, order_number")
      .single();

    if (orderError || !order) {
      console.error("Create order error:", orderError);
      return NextResponse.json(
        { error: "建立訂單失敗" },
        { status: 500 }
      );
    }

    // 建立訂單明細
    const itemsWithOrderId = orderItems.map((item) => ({
      ...item,
      order_id: order.id,
    }));

    await admin.from("order_items").insert(itemsWithOrderId);

    // 扣庫存（現貨商品）— 用 WHERE stock >= quantity 防止競態條件
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (product?.purchase_type === "instock") {
        const { data: updated, error: stockError } = await admin
          .from("products")
          .update({ stock: product.stock - item.quantity })
          .eq("id", product.id)
          .gte("stock", item.quantity)
          .select("id");

        if (stockError || !updated?.length) {
          // 庫存不足，取消訂單
          await admin
            .from("orders")
            .update({ status: "cancelled" })
            .eq("id", order.id);
          return NextResponse.json(
            { error: `${product.title} 庫存不足，訂單已取消` },
            { status: 409 }
          );
        }
      }
    }

    // 產生 ECPay 付款表單
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vicnail-studio.com";
    const itemName = orderItems
      .map((i) => `${i.item_title} x${i.quantity}`)
      .join("#");

    const paymentMethodMap: Record<string, string[]> = {
      credit: ["Credit"],
      atm: ["ATM"],
      cvs_code: ["CVS"],
    };

    const { url, params } = createPaymentForm({
      orderNumber: order.order_number,
      orderUuid: order.id,
      totalAmount: total,
      itemName: itemName.slice(0, 200),
      returnUrl: `${baseUrl}/api/payment/ecpay/callback`,
      clientBackUrl: `${baseUrl}/zh-TW/account/orders`,
      paymentMethods: paymentMethodMap[payment],
    });

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.order_number,
      total,
      paymentUrl: url,
      paymentParams: params,
    });
  } catch (err) {
    console.error("Order creation error:", err);
    return NextResponse.json(
      { error: "伺服器錯誤" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import crypto from "crypto";

/**
 * LINE Messaging API Webhook
 * 接收群組訊息，解析下單格式，自動建立訂單
 */

// 驗證 LINE 簽章
function verifySignature(body: string, signature: string): boolean {
  const channelSecret = process.env.LINE_CHANNEL_SECRET;
  if (!channelSecret) return false;
  const hash = crypto
    .createHmac("SHA256", channelSecret)
    .update(body)
    .digest("base64");
  return hash === signature;
}

// 回覆 LINE 訊息
async function replyMessage(replyToken: string, text: string) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) return;
  await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      replyToken,
      messages: [{ type: "text", text }],
    }),
  });
}

// 解析下單訊息
interface ParsedOrder {
  product: string;
  quantity: number;
  shipping: string;
  name: string;
  phone: string;
  store?: string;
  address?: string;
}

function parseOrderMessage(text: string): ParsedOrder | null {
  const lines = text.split("\n").map((l) => l.trim());

  const data: Partial<ParsedOrder> = {};

  for (const line of lines) {
    const lower = line.toLowerCase();
    // 支援多種格式：「商品：xxx」「商品:xxx」「品項：xxx」
    if (/^(商品|品項|產品)[：:]/.test(line)) {
      data.product = line.replace(/^(商品|品項|產品)[：:]\s*/, "");
    } else if (/^(數量|qty)[：:]/.test(lower)) {
      const num = parseInt(line.replace(/^(數量|qty)[：:]\s*/i, ""));
      data.quantity = isNaN(num) ? 1 : num;
    } else if (/^(取貨|配送|物流|寄送)[：:]/.test(line)) {
      data.shipping = line.replace(/^(取貨|配送|物流|寄送)[：:]\s*/, "");
    } else if (/^(姓名|收件人|名字)[：:]/.test(line)) {
      data.name = line.replace(/^(姓名|收件人|名字)[：:]\s*/, "");
    } else if (/^(電話|手機|tel|phone)[：:]/.test(lower)) {
      data.phone = line.replace(/^(電話|手機|tel|phone)[：:]\s*/i, "");
    } else if (/^(門市|取貨門市|超商)[：:]/.test(line)) {
      data.store = line.replace(/^(門市|取貨門市|超商)[：:]\s*/, "");
    } else if (/^(地址|寄送地址)[：:]/.test(line)) {
      data.address = line.replace(/^(地址|寄送地址)[：:]\s*/, "");
    }
  }

  if (!data.product || !data.name || !data.phone) {
    return null;
  }

  return {
    product: data.product,
    quantity: data.quantity || 1,
    shipping: data.shipping || "7-11 超取",
    name: data.name,
    phone: data.phone,
    store: data.store,
    address: data.address,
  };
}

// 根據關鍵字判斷物流類型
function inferLogisticsType(shippingText: string): string {
  const t = shippingText.toLowerCase();
  if (t.includes("7-11") || t.includes("711") || t.includes("統一")) return "cvs_711";
  if (t.includes("全家") || t.includes("fami")) return "cvs_fami";
  if (t.includes("萊爾富") || t.includes("hilife")) return "cvs_hilife";
  if (t.includes("黑貓") || t.includes("宅配") || t.includes("宅急便")) return "home_tcat";
  if (t.includes("順豐") || t.includes("sf")) return "home_sf";
  if (t.includes("自取") || t.includes("面交")) return "self_pickup";
  return "cvs_711"; // 預設
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  // 驗證 LINE 簽章
  const signature = req.headers.get("x-line-signature") || "";
  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const body = JSON.parse(rawBody);
  const events = body.events || [];

  for (const event of events) {
    // 只處理文字訊息
    if (event.type !== "message" || event.message.type !== "text") continue;

    const text: string = event.message.text;
    const replyToken: string = event.replyToken;
    const userId: string = event.source.userId || "";
    const groupId: string = event.source.groupId || "";

    // 檢查是否為下單訊息
    if (text.includes("#下單")) {
      const parsed = parseOrderMessage(text);

      if (!parsed) {
        await replyMessage(
          replyToken,
          "下單格式有誤，請使用以下格式：\n\n#下單\n商品：商品名稱\n數量：1\n取貨：7-11 超取\n姓名：您的姓名\n電話：0912345678\n門市：門市名稱"
        );
        continue;
      }

      const admin = await createAdminClient();

      // 搜尋商品
      const { data: products } = await admin
        .from("products")
        .select("id, title, price, sale_price, stock, purchase_type")
        .eq("status", "published")
        .ilike("title", `%${parsed.product}%`)
        .limit(1);

      if (!products?.length) {
        await replyMessage(
          replyToken,
          `找不到商品「${parsed.product}」，請確認商品名稱。\n\n輸入 #商品 查看目前可購商品。`
        );
        continue;
      }

      const product = products[0];
      const unitPrice = product.sale_price ?? product.price;
      const total = unitPrice * parsed.quantity;
      const logisticsType = inferLogisticsType(parsed.shipping);

      // 產生訂單編號
      const orderNumber = `LN${Date.now().toString(36).toUpperCase()}${crypto.randomBytes(2).toString("hex").toUpperCase()}`;

      // 建立訂單
      const { data: order, error: orderError } = await admin
        .from("orders")
        .insert({
          order_number: orderNumber,
          status: "pending",
          total,
          shipping_fee: 0, // LINE 訂單運費另計
          payment_method: "line_transfer",
          shipping_name: parsed.name,
          shipping_phone: parsed.phone,
          shipping_address: parsed.store || parsed.address || "",
          shipping_method: logisticsType,
          shipping_store_name: parsed.store || null,
          logistics_type: logisticsType,
          source: "line",
          notes: `LINE 群組下單 | 群組: ${groupId}`,
        })
        .select("id, order_number")
        .single();

      if (orderError || !order) {
        await replyMessage(replyToken, "建立訂單失敗，請稍後再試或聯繫客服。");
        continue;
      }

      // 建立訂單明細
      await admin.from("order_items").insert({
        order_id: order.id,
        item_type: "product",
        item_id: product.id,
        item_title: product.title,
        quantity: parsed.quantity,
        unit_price: unitPrice,
        total_price: total,
      });

      // 扣庫存（現貨商品）— 原子條件更新防競態
      if (product.purchase_type === "instock") {
        const { data: stockUpdated } = await admin
          .from("products")
          .update({ stock: product.stock - parsed.quantity })
          .eq("id", product.id)
          .gte("stock", parsed.quantity)
          .select("id");

        if (!stockUpdated?.length) {
          // 庫存不足 → 取消訂單
          await admin.from("orders").update({ status: "cancelled" }).eq("id", order.id);
          await replyMessage(
            replyToken,
            `抱歉，「${product.title}」庫存不足，訂單已取消。`
          );
          continue;
        }
      }

      // 記錄 LINE 訂單
      await admin.from("line_orders").insert({
        line_user_id: userId,
        line_group_id: groupId,
        order_id: order.id,
        raw_message: text,
        parsed_data: parsed as unknown as Record<string, unknown>,
        status: "confirmed",
      });

      // 取得用戶名稱
      let displayName = "顧客";
      try {
        const profileRes = await fetch(
          `https://api.line.me/v2/bot/profile/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
            },
          }
        );
        if (profileRes.ok) {
          const profile = await profileRes.json();
          displayName = profile.displayName || "顧客";

          // 更新 LINE 訂單的 display name
          await admin
            .from("line_orders")
            .update({ line_display_name: displayName })
            .eq("order_id", order.id);
        }
      } catch { /* ignore */ }

      await replyMessage(
        replyToken,
        `${displayName} 下單成功！\n\n` +
          `訂單編號：${order.order_number}\n` +
          `商品：${product.title} x ${parsed.quantity}\n` +
          `金額：NT$ ${total.toLocaleString()}\n` +
          `配送：${parsed.shipping}\n` +
          `收件人：${parsed.name}\n\n` +
          `請等待店家確認並通知付款方式。`
      );
      continue;
    }

    // #查單 指令
    if (text.includes("#查單")) {
      const admin = await createAdminClient();
      const { data: lineOrders } = await admin
        .from("line_orders")
        .select("order_id, orders(order_number, status, total)")
        .eq("line_user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);

      if (!lineOrders?.length) {
        await replyMessage(replyToken, "您目前沒有訂單記錄。");
        continue;
      }

      const statusLabels: Record<string, string> = {
        pending: "待付款",
        paid: "已付款",
        shipped: "已出貨",
        completed: "已完成",
        cancelled: "已取消",
        refunded: "已退款",
      };

      const orderList = lineOrders
        .map((lo: { order_id: string | null; orders: { order_number: string; status: string; total: number } | null }) => {
          const o = lo.orders;
          if (!o) return null;
          return `${o.order_number} | ${statusLabels[o.status] || o.status} | NT$${o.total}`;
        })
        .filter(Boolean)
        .join("\n");

      await replyMessage(replyToken, `您的近期訂單：\n\n${orderList}`);
      continue;
    }

    // #商品 指令
    if (text.includes("#商品")) {
      const admin = await createAdminClient();
      const { data: products } = await admin
        .from("products")
        .select("title, price, sale_price, stock, purchase_type")
        .eq("status", "published")
        .order("sort_order", { ascending: true })
        .limit(20);

      if (!products?.length) {
        await replyMessage(replyToken, "目前沒有上架商品。");
        continue;
      }

      const typeLabels: Record<string, string> = {
        instock: "現貨",
        preorder: "預購",
        proxy: "代購",
      };

      const list = products
        .map((p) => {
          const price = p.sale_price ?? p.price;
          const tag = typeLabels[p.purchase_type] || "";
          return `[${tag}] ${p.title} — NT$${price.toLocaleString()}`;
        })
        .join("\n");

      await replyMessage(
        replyToken,
        `目前可購商品：\n\n${list}\n\n下單請輸入：\n#下單\n商品：商品名稱\n數量：1\n取貨：7-11 超取\n姓名：您的姓名\n電話：0912345678\n門市：門市名稱`
      );
      continue;
    }

    // #團購 指令
    if (text.includes("#團購")) {
      const admin = await createAdminClient();
      const { data: groupBuys } = await admin
        .from("group_buys")
        .select("title, description, end_date, target_qty, current_qty, status")
        .in("status", ["active", "upcoming"])
        .order("start_date", { ascending: true });

      if (!groupBuys?.length) {
        await replyMessage(replyToken, "目前沒有進行中的團購活動。");
        continue;
      }

      const list = groupBuys
        .map((g) => {
          const end = new Date(g.end_date).toLocaleDateString("zh-TW");
          const statusLabel = g.status === "upcoming" ? "即將開團" : "進行中";
          return `[${statusLabel}] ${g.title}\n${g.description || ""}\n截止：${end} | 已訂：${g.current_qty}${g.target_qty ? `/${g.target_qty}` : ""}`;
        })
        .join("\n\n");

      await replyMessage(replyToken, `團購活動：\n\n${list}`);
      continue;
    }

    // #取消 指令
    if (text.startsWith("#取消")) {
      const orderNum = text.replace("#取消", "").trim();
      if (!orderNum) {
        await replyMessage(replyToken, "請輸入訂單編號，例如：#取消 VNxxxx");
        continue;
      }

      const admin = await createAdminClient();

      // 驗證是否為此使用者的訂單
      const { data: lineOrder } = await admin
        .from("line_orders")
        .select("order_id, orders(id, order_number, status)")
        .eq("line_user_id", userId)
        .limit(1)
        .single();

      if (!lineOrder?.orders) {
        await replyMessage(replyToken, `找不到訂單 ${orderNum}。`);
        continue;
      }

      const order = lineOrder.orders as { id: string; order_number: string; status: string };
      if (order.status !== "pending") {
        await replyMessage(
          replyToken,
          `訂單 ${order.order_number} 狀態為「${order.status}」，無法取消。`
        );
        continue;
      }

      await admin
        .from("orders")
        .update({ status: "cancelled" })
        .eq("id", order.id);

      await admin
        .from("line_orders")
        .update({ status: "cancelled" })
        .eq("order_id", order.id);

      await replyMessage(
        replyToken,
        `訂單 ${order.order_number} 已取消。`
      );
    }
  }

  return NextResponse.json({ status: "ok" });
}

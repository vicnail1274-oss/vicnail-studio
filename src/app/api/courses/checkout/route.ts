import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { createPaymentForm } from "@/lib/ecpay/payment";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import crypto from "crypto";

/**
 * 課程直接購買（無 shipping，無庫存）
 *
 * Body: { courseIds: string[], promoCode?: string, contactName?: string, contactPhone?: string, contactEmail?: string }
 * Response: { orderId, orderNumber, total, paymentUrl, paymentParams }
 */
export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rl = rateLimit(`course-checkout:${ip}`, 10, 10 * 60 * 1000);
    if (!rl.ok) {
      return NextResponse.json(
        { error: "請求過於頻繁，請稍後再試" },
        { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
      );
    }

    const body = await req.json();
    const courseIds: string[] = Array.isArray(body.courseIds) ? body.courseIds : [];
    const promoCode = body.promoCode ? String(body.promoCode).trim().toUpperCase() : null;
    const payment = String(body.payment || "credit");

    if (!courseIds.length || courseIds.length > 10) {
      return NextResponse.json(
        { error: "請選擇 1-10 堂課程" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "請先登入會員" },
        { status: 401 }
      );
    }

    const admin = await createAdminClient();

    // 取得課程資訊
    const { data: courses, error: coursesError } = await admin
      .from("courses")
      .select("id, slug, title, price, sale_price, status")
      .in("id", courseIds)
      .eq("status", "published");

    if (coursesError || !courses?.length) {
      return NextResponse.json(
        { error: "課程不存在或已下架" },
        { status: 400 }
      );
    }

    // 檢查是否重複購買（已有 enrollment）
    const { data: existingEnrollments } = await admin
      .from("enrollments")
      .select("course_id")
      .eq("user_id", user.id)
      .in("course_id", courseIds);

    const alreadyOwned = new Set(existingEnrollments?.map((e) => e.course_id) ?? []);
    const newCourseIds = courseIds.filter((id) => !alreadyOwned.has(id));

    if (newCourseIds.length === 0) {
      return NextResponse.json(
        { error: "您已購買所選的全部課程" },
        { status: 409 }
      );
    }

    const purchaseCourses = courses.filter((c) => newCourseIds.includes(c.id));

    // 組訂單項目
    const orderItems = purchaseCourses.map((c) => {
      const unitPrice = c.sale_price ?? c.price;
      return {
        item_type: "course" as const,
        item_id: c.id,
        item_title: c.title,
        quantity: 1,
        unit_price: unitPrice,
        total_price: unitPrice,
      };
    });

    const subtotal = orderItems.reduce((s, i) => s + i.total_price, 0);

    // 套用優惠碼（如果有）
    let discountAmount = 0;
    let promoCodeId: string | null = null;
    let promoCodeStr: string | null = null;

    if (promoCode) {
      const { data: validateResult, error: validateError } = await admin.rpc(
        "validate_promo_code",
        {
          p_code: promoCode,
          p_user_id: user.id,
          p_subtotal: subtotal,
          p_course_ids: newCourseIds,
          p_product_ids: [],
        }
      );

      if (validateError) {
        console.error("validate_promo_code rpc error:", validateError);
      } else {
        const result = Array.isArray(validateResult) ? validateResult[0] : validateResult;
        if (result?.valid) {
          discountAmount = result.discount_amount ?? 0;
          promoCodeId = result.promo_id;
          promoCodeStr = promoCode;
        } else {
          return NextResponse.json(
            { error: result?.reason || "優惠碼無效" },
            { status: 400 }
          );
        }
      }
    }

    const total = Math.max(0, subtotal - discountAmount);

    // 全免費（優惠碼 100% 折抵）— 直接建 enrollment，跳過金流
    if (total === 0) {
      const orderNumber = `VN${Date.now().toString(36).toUpperCase()}${crypto.randomBytes(2).toString("hex").toUpperCase()}`;

      const { data: order, error: orderError } = await admin
        .from("orders")
        .insert({
          user_id: user.id,
          order_number: orderNumber,
          status: "paid",
          total: 0,
          original_total: subtotal,
          discount_amount: discountAmount,
          shipping_fee: 0,
          payment_method: "free",
          shipping_name: body.contactName || user.email || "",
          shipping_phone: body.contactPhone || "",
          promo_code: promoCodeStr,
          promo_code_id: promoCodeId,
          paid_at: new Date().toISOString(),
          notes: "100% 優惠碼免費",
          source: "web",
        })
        .select("id, order_number")
        .single();

      if (orderError || !order) {
        console.error("Create free order error:", orderError);
        return NextResponse.json(
          { error: "建立訂單失敗" },
          { status: 500 }
        );
      }

      await admin
        .from("order_items")
        .insert(orderItems.map((i) => ({ ...i, order_id: order.id })));

      // 建 enrollments
      const enrollmentRows = newCourseIds.map((courseId) => ({
        user_id: user.id,
        course_id: courseId,
        order_id: order.id,
        source: "promo_free" as const,
      }));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await admin.from("enrollments").upsert(enrollmentRows as any, {
        onConflict: "user_id,course_id",
      });

      // 記錄優惠碼兌換（內含 atomic used_count++）
      if (promoCodeId) {
        await admin.rpc("record_promo_redemption", {
          p_promo_id: promoCodeId,
          p_user_id: user.id,
          p_order_id: order.id,
          p_discount_amount: discountAmount,
        });
      }

      return NextResponse.json({
        orderId: order.id,
        orderNumber: order.order_number,
        total: 0,
        free: true,
        redirectUrl: `/zh-TW/account/courses`,
      });
    }

    // 一般付費流程
    const orderNumber = `VN${Date.now().toString(36).toUpperCase()}${crypto.randomBytes(2).toString("hex").toUpperCase()}`;

    const { data: order, error: orderError } = await admin
      .from("orders")
      .insert({
        user_id: user.id,
        order_number: orderNumber,
        status: "pending",
        total,
        original_total: subtotal,
        discount_amount: discountAmount,
        shipping_fee: 0,
        payment_method: payment,
        shipping_name: body.contactName || user.email || "",
        shipping_phone: body.contactPhone || "",
        promo_code: promoCodeStr,
        promo_code_id: promoCodeId,
        source: "web",
      })
      .select("id, order_number")
      .single();

    if (orderError || !order) {
      console.error("Create course order error:", orderError);
      return NextResponse.json(
        { error: "建立訂單失敗" },
        { status: 500 }
      );
    }

    await admin
      .from("order_items")
      .insert(orderItems.map((i) => ({ ...i, order_id: order.id })));

    // 產生 ECPay 付款表單
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vicnail-studio.com";
    const itemName = orderItems.map((i) => i.item_title).join("#");
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
      clientBackUrl: `${baseUrl}/zh-TW/account/courses?order=${order.order_number}`,
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
    console.error("Course checkout error:", err);
    return NextResponse.json(
      { error: "伺服器錯誤" },
      { status: 500 }
    );
  }
}

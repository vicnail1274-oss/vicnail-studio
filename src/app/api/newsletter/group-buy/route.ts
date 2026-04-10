import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { isAdminAuthed } from "@/lib/admin-auth";

/**
 * 發送團購通知 Email 給訂閱者
 * POST: 發送團購通知
 */
export async function POST(req: NextRequest) {
  if (!isAdminAuthed(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { groupBuyId } = await req.json();

    const admin = await createAdminClient();

    // 取得團購資訊
    const { data: groupBuy } = await admin
      .from("group_buys")
      .select("*, group_buy_items(*, products(title, price, sale_price, images))")
      .eq("id", groupBuyId)
      .single();

    if (!groupBuy) {
      return NextResponse.json(
        { error: "團購活動不存在" },
        { status: 404 }
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const gb = groupBuy as any;

    // 取得所有訂閱團購通知的訂閱者
    const { data: subscribers } = await admin
      .from("newsletter_subscribers")
      .select("email")
      .eq("is_active", true)
      .in("sub_type", ["groupbuy", "all"]);

    if (!subscribers?.length) {
      return NextResponse.json({
        sent: 0,
        message: "沒有訂閱團購通知的使用者",
      });
    }

    // 透過 n8n webhook 發送 Email
    const n8nWebhook = process.env.N8N_GROUPBUY_WEBHOOK;
    if (!n8nWebhook) {
      return NextResponse.json(
        { error: "N8N_GROUPBUY_WEBHOOK 未設定" },
        { status: 500 }
      );
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vicnail-studio.com";

    // 建構商品清單
    const productList = (gb.group_buy_items || [])
      .map((item: { products: { title: string; price: number; sale_price: number | null }; group_price: number }) => ({
        title: item.products?.title || "商品",
        originalPrice: item.products?.price || 0,
        groupPrice: item.group_price,
      }));

    const payload = {
      to: subscribers.map((s) => s.email),
      subject: `[VicNail] 團購開團：${gb.title}`,
      groupBuy: {
        title: gb.title,
        description: gb.description,
        startDate: gb.start_date,
        endDate: gb.end_date,
        targetQty: gb.target_qty,
        products: productList,
        shopUrl: `${siteUrl}/zh-TW/shop?group=${gb.id}`,
      },
    };

    const res = await fetch(n8nWebhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error("n8n webhook error:", await res.text());
      return NextResponse.json(
        { error: "發送通知失敗" },
        { status: 500 }
      );
    }

    // 更新團購 notify 狀態
    await admin
      .from("group_buys")
      .update({ notify_subscribers: false })
      .eq("id", groupBuyId);

    return NextResponse.json({
      sent: subscribers.length,
      message: `已發送給 ${subscribers.length} 位訂閱者`,
    });
  } catch (err) {
    console.error("Group buy notification error:", err);
    return NextResponse.json(
      { error: "伺服器錯誤" },
      { status: 500 }
    );
  }
}

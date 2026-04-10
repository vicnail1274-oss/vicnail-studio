import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { CheckCircle2, Package, ArrowRight, Home } from "lucide-react";
import { CartClearOnMount } from "@/components/shop/CartClearOnMount";

export const metadata: Metadata = {
  title: "訂單完成",
  description: "感謝您的訂購",
  robots: { index: false, follow: false },
};

interface Props {
  searchParams: Promise<{ order?: string }>;
}

const STATUS_LABELS: Record<string, { text: string; color: string }> = {
  pending: { text: "待付款", color: "text-yellow-600" },
  paid: { text: "已付款", color: "text-green-600" },
  shipped: { text: "已出貨", color: "text-blue-600" },
  completed: { text: "已完成", color: "text-green-700" },
  cancelled: { text: "已取消", color: "text-gray-500" },
  refunded: { text: "已退款", color: "text-red-500" },
};

const PAYMENT_LABELS: Record<string, string> = {
  credit: "信用卡",
  atm: "ATM 虛擬帳號",
  cvs_code: "超商代碼繳費",
};

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { order: orderNumber } = await searchParams;
  const supabase = await createClient();

  type OrderSummary = {
    id: string;
    order_number: string;
    status: string;
    total: number;
    shipping_fee: number;
    payment_method: string | null;
    shipping_name: string | null;
    shipping_address: string | null;
    created_at: string;
  };
  type OrderItemSummary = {
    item_title: string;
    quantity: number;
    total_price: number;
  };

  let order: OrderSummary | null = null;
  let items: OrderItemSummary[] = [];

  if (orderNumber) {
    const { data: orderData } = await supabase
      .from("orders")
      .select(
        "id, order_number, status, total, shipping_fee, payment_method, shipping_name, shipping_address, created_at"
      )
      .eq("order_number", orderNumber)
      .maybeSingle();
    order = (orderData as unknown as OrderSummary | null) ?? null;

    if (order) {
      const { data: itemData } = await supabase
        .from("order_items")
        .select("item_title, quantity, total_price")
        .eq("order_id", order.id);
      items = (itemData as unknown as OrderItemSummary[] | null) ?? [];
    }
  }

  return (
    <section className="min-h-[70vh] py-16 px-4 bg-gradient-to-b from-nail-cream to-white">
      <CartClearOnMount />
      <div className="max-w-2xl mx-auto">
        {/* 成功圖標 + 標題 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4 animate-[pop_0.4s_ease-out]">
            <CheckCircle2 size={48} className="text-green-600" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            感謝您的訂購！
          </h1>
          <p className="mt-2 text-muted-foreground">
            我們已收到您的訂單，將儘速為您處理
          </p>
        </div>

        {/* 訂單摘要 */}
        {order ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <p className="text-xs text-muted-foreground">訂單編號</p>
                <p className="font-mono font-semibold text-foreground">
                  {order.order_number}
                </p>
              </div>
              <span
                className={`text-sm font-semibold ${
                  STATUS_LABELS[order.status]?.color || "text-gray-600"
                }`}
              >
                {STATUS_LABELS[order.status]?.text || order.status}
              </span>
            </div>

            {/* 商品明細 */}
            <div className="py-4 border-b border-gray-100 space-y-2">
              {items.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">
                    {item.item_title} × {item.quantity}
                  </span>
                  <span className="text-muted-foreground">
                    NT$ {item.total_price.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* 金額 */}
            <div className="py-4 border-b border-gray-100 space-y-1 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>商品小計</span>
                <span>NT$ {(order.total - order.shipping_fee).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>運費</span>
                <span>NT$ {order.shipping_fee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2">
                <span>總金額</span>
                <span className="text-nail-gold">
                  NT$ {order.total.toLocaleString()}
                </span>
              </div>
            </div>

            {/* 收件資訊 */}
            <div className="pt-4 space-y-1 text-sm">
              <div className="flex">
                <span className="w-20 text-muted-foreground">付款方式</span>
                <span>{PAYMENT_LABELS[order.payment_method || ""] || order.payment_method || "—"}</span>
              </div>
              <div className="flex">
                <span className="w-20 text-muted-foreground">收件人</span>
                <span>{order.shipping_name}</span>
              </div>
              <div className="flex">
                <span className="w-20 text-muted-foreground">寄送地址</span>
                <span className="flex-1">{order.shipping_address}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6 text-center">
            <Package size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="text-muted-foreground">
              {orderNumber
                ? "找不到此訂單，請稍後重新整理或聯繫客服"
                : "訂單已送出，請至「我的訂單」查看詳情"}
            </p>
          </div>
        )}

        {/* 下一步提示 */}
        <div className="bg-nail-cream/60 rounded-xl p-4 text-sm text-foreground mb-8">
          <p className="font-semibold mb-1">📬 接下來</p>
          <ul className="space-y-1 text-muted-foreground ml-6 list-disc">
            <li>我們將在 24 小時內確認訂單並為您備貨</li>
            <li>出貨後會透過 Email 通知您物流追蹤碼</li>
            <li>如有任何疑問，歡迎加入 LINE 官方帳號聯繫客服</li>
          </ul>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/account/orders"
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-nail-gold text-white rounded-xl font-semibold hover:bg-nail-gold/90 transition-colors"
          >
            <Package size={18} /> 查看我的訂單
          </Link>
          <Link
            href="/shop"
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 text-foreground rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            繼續購物 <ArrowRight size={18} />
          </Link>
        </div>
        <Link
          href="/"
          className="mt-4 inline-flex items-center justify-center gap-1 w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Home size={14} /> 回首頁
        </Link>
      </div>

      <style>{`
        @keyframes pop {
          0% { transform: scale(0); }
          60% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
      `}</style>
    </section>
  );
}

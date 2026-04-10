import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Package, ChevronRight, ShoppingBag } from "lucide-react";

export const metadata: Metadata = {
  title: "我的訂單",
  description: "查看您的歷史訂單",
  robots: { index: false, follow: false },
};

type OrderRow = {
  id: string;
  order_number: string;
  status: "pending" | "paid" | "shipped" | "completed" | "cancelled" | "refunded";
  total: number;
  payment_method: string | null;
  created_at: string;
};

const STATUS_LABELS: Record<string, { text: string; color: string; bg: string }> = {
  pending: { text: "待付款", color: "text-yellow-700", bg: "bg-yellow-50" },
  paid: { text: "已付款", color: "text-green-700", bg: "bg-green-50" },
  shipped: { text: "已出貨", color: "text-blue-700", bg: "bg-blue-50" },
  completed: { text: "已完成", color: "text-green-800", bg: "bg-green-100" },
  cancelled: { text: "已取消", color: "text-gray-500", bg: "bg-gray-100" },
  refunded: { text: "已退款", color: "text-red-700", bg: "bg-red-50" },
};

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("zh-TW", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

export default async function MyOrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: orderData } = await supabase
    .from("orders")
    .select("id, order_number, status, total, payment_method, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  const orders = (orderData || []) as OrderRow[];

  return (
    <section className="min-h-[70vh] py-12 px-4 bg-gradient-to-b from-nail-cream to-white">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-display font-bold text-foreground">我的訂單</h1>
          <Link
            href="/account"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← 回帳號
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
            <ShoppingBag size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-muted-foreground mb-6">您還沒有任何訂單</p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-nail-gold text-white rounded-xl font-semibold hover:bg-nail-gold/90 transition-colors"
            >
              去逛逛 <ChevronRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const status = STATUS_LABELS[order.status] || {
                text: order.status,
                color: "text-gray-600",
                bg: "bg-gray-50",
              };
              return (
                <Link
                  key={order.id}
                  href={`/checkout/success?order=${order.order_number}`}
                  className="block bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-nail-gold/30 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Package size={16} className="text-muted-foreground flex-shrink-0" />
                        <p className="font-mono text-sm font-semibold text-foreground truncate">
                          {order.order_number}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${status.color} ${status.bg} mb-2`}
                      >
                        {status.text}
                      </span>
                      <p className="text-lg font-bold text-nail-gold">
                        NT$ {order.total.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

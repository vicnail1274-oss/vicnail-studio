"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Package,
  Truck,
  Check,
  X,
  Clock,
  RefreshCw,
  AlertTriangle,
  Copy,
} from "lucide-react";

interface Order {
  id: string;
  order_number: string;
  status: string;
  total: number;
  shipping_fee: number;
  payment_method: string | null;
  shipping_name: string | null;
  shipping_phone: string | null;
  shipping_method: string | null;
  shipping_address: string | null;
  shipping_store_name: string | null;
  tracking_number: string | null;
  logistics_type: string | null;
  source: string | null;
  notes: string | null;
  created_at: string;
  order_items: { item_title: string; quantity: number; unit_price: number }[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "待付款", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  paid: { label: "已付款", color: "bg-blue-100 text-blue-700", icon: Check },
  shipped: { label: "已出貨", color: "bg-purple-100 text-purple-700", icon: Truck },
  completed: { label: "已完成", color: "bg-green-100 text-green-700", icon: Check },
  cancelled: { label: "已取消", color: "bg-gray-100 text-gray-500", icon: X },
  refunded: { label: "已退款", color: "bg-red-100 text-red-600", icon: RefreshCw },
};

const SOURCE_LABELS: Record<string, string> = {
  web: "網站",
  line: "LINE",
  admin: "後台",
};

const REMINDER_THRESHOLD_HOURS = 24;

function hoursSince(iso: string): number {
  return (Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60);
}

function formatRelativeAge(iso: string): string {
  const h = hoursSince(iso);
  if (h < 1) return `${Math.round(h * 60)} 分鐘前`;
  if (h < 24) return `${Math.floor(h)} 小時前`;
  return `${Math.floor(h / 24)} 天前`;
}

/**
 * 產生催單訊息範本（給 Vic 一鍵複製貼到 LINE）
 * 走「熟學生」溫和語氣，不是冷冰冰的系統訊息
 */
function buildReminderMessage(order: {
  order_number: string;
  shipping_name: string | null;
  total: number;
  shipping_fee: number;
  created_at: string;
  order_items: { item_title: string; quantity: number; unit_price: number }[];
}): string {
  const name = order.shipping_name?.trim() || "親愛的";
  const ageH = Math.floor(hoursSince(order.created_at));
  const itemsText = (order.order_items || [])
    .map((it) => `・${it.item_title} x${it.quantity}`)
    .join("\n");

  return `Hi ${name} 👋
你 ${ageH < 24 ? `${ageH} 小時前` : `${Math.floor(ageH / 24)} 天前`}下的訂單還沒付款喔～
怕你忘記再提醒一下 🙈

📦 訂單編號：${order.order_number}
${itemsText}
💰 總計：NT$ ${order.total.toLocaleString()}${order.shipping_fee > 0 ? `（含運費 $${order.shipping_fee}）` : ""}

如果想繼續完成訂單，回我「+1」我幫你重發付款連結
有任何問題隨時跟我說 💕`;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  // filter: "" | status name | "reminder"（24h+ 待付款）
  const [filter, setFilter] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    // reminder 模式：拉 pending 全部，前端過濾 24h+
    const statusParam = filter === "reminder" ? "pending" : filter;
    const url = statusParam
      ? `/api/admin/orders?status=${statusParam}`
      : "/api/admin/orders";
    const res = await fetch(url);
    if (res.ok) setOrders(await res.json());
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  async function updateStatus(orderId: string, newStatus: string) {
    await fetch("/api/admin/orders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: orderId, status: newStatus }),
    });
    loadOrders();
  }

  async function addTracking(orderId: string) {
    const num = prompt("請輸入追蹤碼：");
    if (!num) return;
    await fetch("/api/admin/orders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: orderId,
        tracking_number: num,
        status: "shipped",
      }),
    });
    loadOrders();
  }

  async function copyReminderMessage(order: Order) {
    const msg = buildReminderMessage(order);
    try {
      await navigator.clipboard.writeText(msg);
      setCopiedId(order.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Clipboard 失敗 fallback：直接跳出讓 Vic 手動複製
      window.prompt("請手動複製以下訊息：", msg);
    }
  }

  // 顯示用清單：reminder 模式只看 24h+ pending
  const visibleOrders = useMemo(() => {
    if (filter !== "reminder") return orders;
    return orders.filter(
      (o) =>
        o.status === "pending" &&
        hoursSince(o.created_at) >= REMINDER_THRESHOLD_HOURS
    );
  }, [orders, filter]);

  // 待催單數量徽章（總是顯示，不受目前 filter 影響）
  const [reminderCount, setReminderCount] = useState<number | null>(null);
  useEffect(() => {
    fetch("/api/admin/orders?status=pending")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Order[]) => {
        const n = data.filter(
          (o) => hoursSince(o.created_at) >= REMINDER_THRESHOLD_HOURS
        ).length;
        setReminderCount(n);
      })
      .catch(() => setReminderCount(null));
  }, [orders]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">訂單管理</h1>

      {/* 篩選 */}
      <div className="flex gap-2 mb-6 flex-wrap items-center">
        {["", "pending", "paid", "shipped", "completed", "cancelled"].map(
          (s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-sm ${
                filter === s
                  ? "bg-pink-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {s === "" ? "全部" : STATUS_CONFIG[s]?.label || s}
            </button>
          )
        )}
        {/* 24h+ 待催單 — 特別標記 */}
        <button
          onClick={() => setFilter("reminder")}
          className={`px-3 py-1.5 rounded-full text-sm inline-flex items-center gap-1.5 ${
            filter === "reminder"
              ? "bg-amber-500 text-white"
              : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
          }`}
          title={`未付款超過 ${REMINDER_THRESHOLD_HOURS} 小時的訂單`}
        >
          <AlertTriangle size={14} />
          待催單
          {reminderCount !== null && reminderCount > 0 && (
            <span
              className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                filter === "reminder"
                  ? "bg-white/20 text-white"
                  : "bg-amber-500 text-white"
              }`}
            >
              {reminderCount}
            </span>
          )}
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">載入中...</p>
      ) : visibleOrders.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Package size={48} className="mx-auto mb-4" />
          <p>
            {filter === "reminder"
              ? "目前沒有需要催單的訂單 🎉"
              : "沒有訂單"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleOrders.map((order) => {
            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
            const StatusIcon = cfg.icon;
            const expanded = expandedId === order.id;
            const isOverdue =
              order.status === "pending" &&
              hoursSince(order.created_at) >= REMINDER_THRESHOLD_HOURS;

            return (
              <div
                key={order.id}
                className={`bg-white rounded-xl border overflow-hidden ${
                  isOverdue ? "border-amber-300 ring-1 ring-amber-100" : ""
                }`}
              >
                {/* 訂單概要 */}
                <button
                  onClick={() =>
                    setExpandedId(expanded ? null : order.id)
                  }
                  className="w-full p-4 flex items-center gap-4 text-left hover:bg-gray-50"
                >
                  <StatusIcon size={18} className={cfg.color.split(" ")[1]} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-sm">
                        {order.order_number}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}
                      >
                        {cfg.label}
                      </span>
                      {order.source && order.source !== "web" && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-700">
                          {SOURCE_LABELS[order.source] || order.source}
                        </span>
                      )}
                      {isOverdue && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 inline-flex items-center gap-1">
                          <AlertTriangle size={10} />
                          待催 {formatRelativeAge(order.created_at)}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {order.shipping_name} · {order.shipping_phone} ·{" "}
                      {new Date(order.created_at).toLocaleString("zh-TW")}
                    </div>
                  </div>
                  <span className="font-bold text-lg">
                    ${order.total.toLocaleString()}
                  </span>
                </button>

                {/* 展開詳情 */}
                {expanded && (
                  <div className="border-t px-4 py-3 bg-gray-50 space-y-3">
                    {/* 商品明細 */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 mb-1">
                        商品
                      </h4>
                      {order.order_items?.map((item, i) => (
                        <div
                          key={i}
                          className="flex justify-between text-sm"
                        >
                          <span>
                            {item.item_title} x{item.quantity}
                          </span>
                          <span>
                            ${(item.unit_price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      ))}
                      {order.shipping_fee > 0 && (
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>運費</span>
                          <span>${order.shipping_fee}</span>
                        </div>
                      )}
                    </div>

                    {/* 配送資訊 */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 mb-1">
                        配送
                      </h4>
                      <p className="text-sm">
                        {order.shipping_store_name || order.shipping_address || "自取"}
                        {order.tracking_number && (
                          <span className="ml-2 text-blue-600">
                            追蹤碼: {order.tracking_number}
                          </span>
                        )}
                      </p>
                    </div>

                    {order.notes && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 mb-1">
                          備註
                        </h4>
                        <p className="text-sm text-gray-600">{order.notes}</p>
                      </div>
                    )}

                    {/* 操作按鈕 */}
                    <div className="flex gap-2 pt-2 flex-wrap">
                      {order.status === "pending" && (
                        <>
                          <button
                            onClick={() => copyReminderMessage(order)}
                            className={`px-3 py-1.5 text-sm rounded-lg inline-flex items-center gap-1.5 transition-colors ${
                              copiedId === order.id
                                ? "bg-green-500 text-white"
                                : "bg-amber-500 text-white hover:bg-amber-600"
                            }`}
                            title="複製催單訊息到剪貼簿，貼到 LINE 給學生"
                          >
                            {copiedId === order.id ? (
                              <>
                                <Check size={14} /> 已複製到剪貼簿
                              </>
                            ) : (
                              <>
                                <Copy size={14} /> 複製催單訊息
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => updateStatus(order.id, "paid")}
                            className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
                          >
                            標記已付款
                          </button>
                          <button
                            onClick={() => updateStatus(order.id, "cancelled")}
                            className="px-3 py-1.5 bg-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-300"
                          >
                            取消訂單
                          </button>
                        </>
                      )}
                      {order.status === "paid" && (
                        <button
                          onClick={() => addTracking(order.id)}
                          className="px-3 py-1.5 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600"
                        >
                          填入追蹤碼 & 出貨
                        </button>
                      )}
                      {order.status === "shipped" && (
                        <button
                          onClick={() => updateStatus(order.id, "completed")}
                          className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600"
                        >
                          標記已完成
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

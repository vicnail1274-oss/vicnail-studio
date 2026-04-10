"use client";

import { useState, useEffect, useCallback } from "react";
import { Package, Truck, Check, X, Clock, RefreshCw } from "lucide-react";

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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    const url = filter
      ? `/api/admin/orders?status=${filter}`
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

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">訂單管理</h1>

      {/* 篩選 */}
      <div className="flex gap-2 mb-6 flex-wrap">
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
      </div>

      {loading ? (
        <p className="text-gray-500">載入中...</p>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Package size={48} className="mx-auto mb-4" />
          <p>沒有訂單</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
            const StatusIcon = cfg.icon;
            const expanded = expandedId === order.id;

            return (
              <div
                key={order.id}
                className="bg-white rounded-xl border overflow-hidden"
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
                    <div className="flex gap-2 pt-2">
                      {order.status === "pending" && (
                        <>
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

"use client";

import { useState, useEffect } from "react";
import { Plus, Send, Users, Calendar } from "lucide-react";

interface GroupBuy {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  target_qty: number;
  current_qty: number;
  status: string;
  notify_subscribers: boolean;
  group_buy_items?: { products: { title: string; price: number } | null; group_price: number }[];
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  upcoming: { label: "即將開團", color: "bg-amber-100 text-amber-700" },
  active: { label: "進行中", color: "bg-green-100 text-green-700" },
  closed: { label: "已截止", color: "bg-gray-100 text-gray-600" },
  completed: { label: "已完成", color: "bg-blue-100 text-blue-700" },
  cancelled: { label: "已取消", color: "bg-red-100 text-red-600" },
};

export default function AdminGroupBuysPage() {
  const [groupBuys, setGroupBuys] = useState<GroupBuy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    target_qty: 0,
    status: "upcoming",
  });

  async function loadGroupBuys() {
    const res = await fetch("/api/admin/group-buys");
    if (res.ok) setGroupBuys(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    loadGroupBuys();
  }, []);

  async function createGroupBuy() {
    if (!form.title || !form.start_date || !form.end_date) {
      alert("請填寫團購名稱和日期");
      return;
    }
    await fetch("/api/admin/group-buys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowForm(false);
    setForm({ title: "", description: "", start_date: "", end_date: "", target_qty: 0, status: "upcoming" });
    loadGroupBuys();
  }

  async function updateStatus(id: string, status: string) {
    await fetch("/api/admin/group-buys", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    loadGroupBuys();
  }

  async function sendNotification(id: string) {
    if (!confirm("確定要發送團購通知給所有訂閱者？")) return;
    const res = await fetch("/api/newsletter/group-buy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupBuyId: id }),
    });
    const data = await res.json();
    alert(data.message || data.error || "已發送");
    loadGroupBuys();
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">團購管理</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
        >
          <Plus size={18} /> 新增團購
        </button>
      </div>

      {/* 新增表單 */}
      {showForm && (
        <div className="bg-white rounded-xl border p-6 mb-6 space-y-4">
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="團購名稱"
          />
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg resize-none"
            rows={2}
            placeholder="團購說明"
          />
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium">開始日期</label>
              <input
                type="datetime-local"
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="text-xs font-medium">截止日期</label>
              <input
                type="datetime-local"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="text-xs font-medium">目標數量（0=不限）</label>
              <input
                type="number"
                value={form.target_qty}
                onChange={(e) => setForm({ ...form, target_qty: Number(e.target.value) })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
          </div>
          <button
            onClick={createGroupBuy}
            className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
          >
            建立團購
          </button>
        </div>
      )}

      {/* 團購列表 */}
      {loading ? (
        <p className="text-gray-500">載入中...</p>
      ) : groupBuys.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Users size={48} className="mx-auto mb-4" />
          <p>還沒有團購活動</p>
        </div>
      ) : (
        <div className="space-y-4">
          {groupBuys.map((gb) => {
            const cfg = STATUS_LABELS[gb.status] || STATUS_LABELS.upcoming;
            return (
              <div
                key={gb.id}
                className="bg-white rounded-xl border p-5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold">{gb.title}</h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}
                      >
                        {cfg.label}
                      </span>
                    </div>
                    {gb.description && (
                      <p className="text-sm text-gray-500 mb-2">
                        {gb.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(gb.start_date).toLocaleDateString("zh-TW")} ~{" "}
                        {new Date(gb.end_date).toLocaleDateString("zh-TW")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={12} />
                        {gb.current_qty}
                        {gb.target_qty > 0 && ` / ${gb.target_qty}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {gb.status === "upcoming" && (
                      <button
                        onClick={() => updateStatus(gb.id, "active")}
                        className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600"
                      >
                        開團
                      </button>
                    )}
                    {gb.status === "active" && (
                      <button
                        onClick={() => updateStatus(gb.id, "closed")}
                        className="px-3 py-1.5 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600"
                      >
                        截止
                      </button>
                    )}
                    {gb.notify_subscribers && (
                      <button
                        onClick={() => sendNotification(gb.id)}
                        className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 flex items-center gap-1"
                      >
                        <Send size={14} /> 通知訂閱者
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

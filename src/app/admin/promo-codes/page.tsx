"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Ticket, Power, Trash2, Copy } from "lucide-react";
import Link from "next/link";

interface PromoCode {
  id: string;
  code: string;
  description: string | null;
  discount_type: "percentage" | "fixed_amount" | "free";
  discount_value: number;
  applies_to: string;
  min_purchase_amount: number;
  max_uses: number | null;
  max_uses_per_user: number;
  used_count: number;
  starts_at: string;
  expires_at: string | null;
  is_active: boolean;
}

function formatDiscount(p: PromoCode) {
  if (p.discount_type === "percentage") return `${p.discount_value}% 折`;
  if (p.discount_type === "fixed_amount") return `折 NT$${p.discount_value}`;
  return "100% 免費";
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("zh-TW");
}

export default function AdminPromoCodesPage() {
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/promo-codes");
    if (res.ok) setCodes(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleActive(c: PromoCode) {
    await fetch("/api/admin/promo-codes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: c.id, is_active: !c.is_active }),
    });
    load();
  }

  async function deactivate(id: string, code: string) {
    if (!confirm(`停用優惠碼「${code}」？歷史訂單不受影響。`)) return;
    await fetch(`/api/admin/promo-codes?id=${id}`, { method: "DELETE" });
    load();
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    alert(`已複製：${code}`);
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Ticket size={24} className="text-pink-500" />
          優惠碼管理
        </h1>
        <Link
          href="/admin/promo-codes/edit"
          className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
        >
          <Plus size={18} /> 新增優惠碼
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-500">載入中...</p>
      ) : codes.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Ticket size={48} className="mx-auto mb-4" />
          <p>還沒有優惠碼</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="p-3">優惠碼</th>
                <th className="p-3">折扣</th>
                <th className="p-3">使用次數</th>
                <th className="p-3">有效期</th>
                <th className="p-3">狀態</th>
                <th className="p-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {codes.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="p-3">
                    <button
                      onClick={() => copyCode(c.code)}
                      className="font-mono font-semibold text-pink-600 hover:underline inline-flex items-center gap-1"
                      title="點擊複製"
                    >
                      {c.code}
                      <Copy size={12} className="text-gray-400" />
                    </button>
                    {c.description && (
                      <div className="text-xs text-gray-400 mt-0.5">
                        {c.description}
                      </div>
                    )}
                  </td>
                  <td className="p-3">
                    <span className="font-semibold">{formatDiscount(c)}</span>
                    {c.min_purchase_amount > 0 && (
                      <div className="text-xs text-gray-400">
                        滿 NT${c.min_purchase_amount} 可用
                      </div>
                    )}
                  </td>
                  <td className="p-3">
                    {c.used_count} {c.max_uses && `/ ${c.max_uses}`}
                    <div className="text-xs text-gray-400">
                      每人限用 {c.max_uses_per_user} 次
                    </div>
                  </td>
                  <td className="p-3 text-gray-600">
                    <div>{formatDate(c.starts_at)}</div>
                    <div className="text-xs text-gray-400">
                      → {formatDate(c.expires_at)}
                    </div>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        c.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {c.is_active ? "啟用" : "停用"}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/promo-codes/edit?id=${c.id}`}
                        className="p-1.5 text-gray-400 hover:text-blue-500"
                      >
                        <Edit2 size={16} />
                      </Link>
                      <button
                        onClick={() => toggleActive(c)}
                        className="p-1.5 text-gray-400 hover:text-amber-500"
                        title={c.is_active ? "停用" : "啟用"}
                      >
                        <Power size={16} />
                      </button>
                      <button
                        onClick={() => deactivate(c.id, c.code)}
                        className="p-1.5 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

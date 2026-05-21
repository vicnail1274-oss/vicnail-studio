"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Save, Wand2 } from "lucide-react";
import Link from "next/link";

export default function AdminPromoCodeEditPage() {
  return (
    <Suspense fallback={<div className="p-8 text-gray-500">載入中...</div>}>
      <PromoCodeEditInner />
    </Suspense>
  );
}

function PromoCodeEditInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const promoId = searchParams.get("id");
  const isEdit = !!promoId;

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    code: "",
    description: "",
    discount_type: "percentage" as "percentage" | "fixed_amount" | "free",
    discount_value: 10,
    applies_to: "all",
    min_purchase_amount: 0,
    max_uses: "",
    max_uses_per_user: 1,
    starts_at: new Date().toISOString().slice(0, 16),
    expires_at: "",
    is_active: true,
  });

  useEffect(() => {
    if (promoId) {
      fetch("/api/admin/promo-codes")
        .then((r) => r.json())
        .then((list) => {
          const p = list.find((x: { id: string }) => x.id === promoId);
          if (!p) return;
          setForm({
            code: p.code || "",
            description: p.description || "",
            discount_type: p.discount_type || "percentage",
            discount_value: p.discount_value || 10,
            applies_to: p.applies_to || "all",
            min_purchase_amount: p.min_purchase_amount || 0,
            max_uses: p.max_uses ? String(p.max_uses) : "",
            max_uses_per_user: p.max_uses_per_user || 1,
            starts_at: p.starts_at ? p.starts_at.slice(0, 16) : "",
            expires_at: p.expires_at ? p.expires_at.slice(0, 16) : "",
            is_active: !!p.is_active,
          });
        });
    }
  }, [promoId]);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function genRandomCode() {
    const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    update("code", code);
  }

  async function save() {
    if (!form.code) {
      alert("請輸入優惠碼");
      return;
    }
    if (!/^[A-Z0-9_-]+$/.test(form.code)) {
      alert("優惠碼只能包含大寫英文、數字、底線、連字號");
      return;
    }
    setSaving(true);
    const payload = {
      ...(isEdit ? { id: promoId } : {}),
      code: form.code,
      description: form.description || null,
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      applies_to: form.applies_to,
      min_purchase_amount: Number(form.min_purchase_amount),
      max_uses: form.max_uses ? Number(form.max_uses) : null,
      max_uses_per_user: Number(form.max_uses_per_user),
      starts_at: form.starts_at
        ? new Date(form.starts_at).toISOString()
        : new Date().toISOString(),
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      is_active: form.is_active,
    };

    const res = await fetch("/api/admin/promo-codes", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push("/admin/promo-codes");
    } else {
      const err = await res.json();
      alert(err.error || "儲存失敗");
    }
    setSaving(false);
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Link
        href="/admin/promo-codes"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft size={16} /> 返回優惠碼列表
      </Link>

      <h1 className="text-2xl font-bold mb-6">
        {isEdit ? "編輯優惠碼" : "新增優惠碼"}
      </h1>

      <div className="space-y-5 bg-white rounded-xl border p-6">
        <div>
          <label className="block text-sm font-medium mb-1">優惠碼 *</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={form.code}
              onChange={(e) => update("code", e.target.value.toUpperCase())}
              className="flex-1 px-4 py-2 border rounded-lg font-mono"
              placeholder="EARLY20"
              maxLength={32}
            />
            <button
              type="button"
              onClick={genRandomCode}
              className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm flex items-center gap-1"
            >
              <Wand2 size={14} /> 隨機
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            學生輸入時不分大小寫，會自動轉大寫
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">說明（內部備註）</label>
          <input
            type="text"
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="例：2026 雙 11 早鳥優惠"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">折扣類型 *</label>
            <select
              value={form.discount_type}
              onChange={(e) => update("discount_type", e.target.value as "percentage" | "fixed_amount" | "free")}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="percentage">百分比折扣</option>
              <option value="fixed_amount">固定金額折扣</option>
              <option value="free">100% 免費</option>
            </select>
          </div>
          {form.discount_type !== "free" && (
            <div>
              <label className="block text-sm font-medium mb-1">
                折扣值 *{" "}
                <span className="text-xs text-gray-400">
                  {form.discount_type === "percentage" ? "（1-100）" : "（NT$）"}
                </span>
              </label>
              <input
                type="number"
                value={form.discount_value}
                onChange={(e) => update("discount_value", Number(e.target.value))}
                className="w-full px-4 py-2 border rounded-lg"
                min={1}
                max={form.discount_type === "percentage" ? 100 : undefined}
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">適用範圍</label>
          <select
            value={form.applies_to}
            onChange={(e) => update("applies_to", e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="all">全站（課程 + 商品）</option>
            <option value="courses">只限課程</option>
            <option value="products">只限商品</option>
          </select>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">最低消費 (NT$)</label>
            <input
              type="number"
              value={form.min_purchase_amount}
              onChange={(e) =>
                update("min_purchase_amount", Number(e.target.value))
              }
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="0 = 無限制"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">總用量上限</label>
            <input
              type="number"
              value={form.max_uses}
              onChange={(e) => update("max_uses", e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="留空 = 無限"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">每人限用</label>
            <input
              type="number"
              value={form.max_uses_per_user}
              onChange={(e) =>
                update("max_uses_per_user", Number(e.target.value))
              }
              className="w-full px-4 py-2 border rounded-lg"
              min={1}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">開始時間</label>
            <input
              type="datetime-local"
              value={form.starts_at}
              onChange={(e) => update("starts_at", e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">截止時間</label>
            <input
              type="datetime-local"
              value={form.expires_at}
              onChange={(e) => update("expires_at", e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="留空 = 永久"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => update("is_active", e.target.checked)}
            className="rounded"
          />
          <span className="text-sm">啟用</span>
        </label>

        <button
          onClick={save}
          disabled={saving}
          className="w-full py-3 bg-pink-500 text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-pink-600 disabled:bg-gray-300"
        >
          <Save size={18} />
          {saving ? "儲存中..." : isEdit ? "更新優惠碼" : "建立優惠碼"}
        </button>
      </div>
    </div>
  );
}

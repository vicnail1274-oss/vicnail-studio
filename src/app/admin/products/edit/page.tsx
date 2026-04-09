"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function AdminProductEditPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("id");
  const isEdit = !!productId;

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: 0,
    sale_price: "",
    stock: 0,
    category: "tools",
    status: "draft",
    purchase_type: "instock",
    preorder_deadline: "",
    estimated_delivery: "",
    min_order_qty: 1,
    images: [] as string[],
    imageInput: "",
    shipping_weight: 0,
    sort_order: 0,
  });

  useEffect(() => {
    if (productId) {
      fetch("/api/admin/products")
        .then((r) => r.json())
        .then((products) => {
          const p = products.find((x: { id: string }) => x.id === productId);
          if (p) {
            setForm({
              title: p.title || "",
              description: p.description || "",
              price: p.price || 0,
              sale_price: p.sale_price ? String(p.sale_price) : "",
              stock: p.stock || 0,
              category: p.category || "tools",
              status: p.status || "draft",
              purchase_type: p.purchase_type || "instock",
              preorder_deadline: p.preorder_deadline
                ? p.preorder_deadline.slice(0, 16)
                : "",
              estimated_delivery: p.estimated_delivery || "",
              min_order_qty: p.min_order_qty || 1,
              images: p.images || [],
              imageInput: "",
              shipping_weight: p.shipping_weight || 0,
              sort_order: p.sort_order || 0,
            });
          }
        });
    }
  }, [productId]);

  function updateField(key: string, value: string | number | string[]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function addImage() {
    if (form.imageInput.trim()) {
      updateField("images", [...form.images, form.imageInput.trim()]);
      updateField("imageInput", "");
    }
  }

  function removeImage(idx: number) {
    updateField(
      "images",
      form.images.filter((_, i) => i !== idx)
    );
  }

  async function handleSave() {
    if (!form.title) {
      alert("請輸入商品名稱");
      return;
    }
    setSaving(true);

    const payload = {
      ...(isEdit ? { id: productId } : {}),
      title: form.title,
      description: form.description || null,
      price: Number(form.price),
      sale_price: form.sale_price ? Number(form.sale_price) : null,
      stock: Number(form.stock),
      category: form.category,
      status: form.status,
      purchase_type: form.purchase_type,
      preorder_deadline: form.preorder_deadline || null,
      estimated_delivery: form.estimated_delivery || null,
      min_order_qty: Number(form.min_order_qty),
      images: form.images,
      shipping_weight: Number(form.shipping_weight),
      sort_order: Number(form.sort_order),
    };

    const res = await fetch("/api/admin/products", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push("/admin/products");
    } else {
      const err = await res.json();
      alert(err.error || "儲存失敗");
    }
    setSaving(false);
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft size={16} /> 返回商品列表
      </Link>

      <h1 className="text-2xl font-bold mb-6">
        {isEdit ? "編輯商品" : "新增商品"}
      </h1>

      <div className="space-y-6 bg-white rounded-xl border p-6">
        {/* 基本資訊 */}
        <div>
          <label className="block text-sm font-medium mb-1">商品名稱 *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">商品描述</label>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">原價 *</label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => updateField("price", e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              特價（留空為無特價）
            </label>
            <input
              type="number"
              value={form.sale_price}
              onChange={(e) => updateField("sale_price", e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
              placeholder="可選"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">庫存</label>
            <input
              type="number"
              value={form.stock}
              onChange={(e) => updateField("stock", e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">分類</label>
            <select
              value={form.category}
              onChange={(e) => updateField("category", e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
            >
              <option value="tools">工具</option>
              <option value="gel">凝膠</option>
              <option value="materials">材料</option>
              <option value="accessories">配件</option>
              <option value="other">其他</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">購買類型</label>
            <select
              value={form.purchase_type}
              onChange={(e) => updateField("purchase_type", e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
            >
              <option value="instock">現貨</option>
              <option value="preorder">預購</option>
              <option value="proxy">代購</option>
            </select>
          </div>
        </div>

        {/* 預購/代購額外欄位 */}
        {form.purchase_type !== "instock" && (
          <div className="grid grid-cols-2 gap-4 p-4 bg-amber-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium mb-1">
                {form.purchase_type === "preorder"
                  ? "預購截止日"
                  : "預計到貨日文字"}
              </label>
              {form.purchase_type === "preorder" ? (
                <input
                  type="datetime-local"
                  value={form.preorder_deadline}
                  onChange={(e) =>
                    updateField("preorder_deadline", e.target.value)
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                />
              ) : (
                <input
                  type="text"
                  value={form.estimated_delivery}
                  onChange={(e) =>
                    updateField("estimated_delivery", e.target.value)
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="例：2026 年 5 月中旬"
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                預計出貨說明
              </label>
              <input
                type="text"
                value={form.estimated_delivery}
                onChange={(e) =>
                  updateField("estimated_delivery", e.target.value)
                }
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="例：到貨後 3 個工作天出貨"
              />
            </div>
          </div>
        )}

        {/* 圖片 */}
        <div>
          <label className="block text-sm font-medium mb-1">商品圖片</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={form.imageInput}
              onChange={(e) => updateField("imageInput", e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg"
              placeholder="貼上圖片 URL"
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addImage())}
            />
            <button
              type="button"
              onClick={addImage}
              className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              新增
            </button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {form.images.map((url, i) => (
              <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border group">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs"
                >
                  移除
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 狀態 + 排序 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">狀態</label>
            <select
              value={form.status}
              onChange={(e) => updateField("status", e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
            >
              <option value="draft">草稿</option>
              <option value="published">已上架</option>
              <option value="archived">已下架</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">排序</label>
            <input
              type="number"
              value={form.sort_order}
              onChange={(e) => updateField("sort_order", e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="數字越小越前面"
            />
          </div>
        </div>

        {/* 儲存 */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 bg-pink-500 text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-pink-600 disabled:bg-gray-300"
        >
          <Save size={18} />
          {saving ? "儲存中..." : isEdit ? "更新商品" : "建立商品"}
        </button>
      </div>
    </div>
  );
}

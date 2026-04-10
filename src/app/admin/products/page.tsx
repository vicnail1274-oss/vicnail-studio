"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Eye, EyeOff, Package } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Product {
  id: string;
  title: string;
  price: number;
  sale_price: number | null;
  stock: number;
  category: string | null;
  status: string;
  purchase_type: string;
  images: string[];
  created_at: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: "草稿", color: "bg-gray-100 text-gray-600" },
  published: { label: "已上架", color: "bg-green-100 text-green-700" },
  archived: { label: "已下架", color: "bg-red-100 text-red-600" },
};

const TYPE_LABELS: Record<string, string> = {
  instock: "現貨",
  preorder: "預購",
  proxy: "代購",
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadProducts() {
    const res = await fetch("/api/admin/products");
    if (res.ok) {
      setProducts(await res.json());
    }
    setLoading(false);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function toggleStatus(product: Product) {
    const newStatus = product.status === "published" ? "archived" : "published";
    await fetch("/api/admin/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: product.id, status: newStatus }),
    });
    loadProducts();
  }

  async function deleteProduct(id: string) {
    if (!confirm("確定要刪除此商品？")) return;
    await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
    loadProducts();
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">商品管理</h1>
        <Link
          href="/admin/products/edit"
          className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
        >
          <Plus size={18} /> 新增商品
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-500">載入中...</p>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Package size={48} className="mx-auto mb-4" />
          <p>還沒有商品</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="p-3">商品</th>
                <th className="p-3">類型</th>
                <th className="p-3">價格</th>
                <th className="p-3">庫存</th>
                <th className="p-3">狀態</th>
                <th className="p-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-gray-100 overflow-hidden flex-shrink-0 relative">
                        {p.images?.[0] ? (
                          <Image
                            src={p.images[0]}
                            alt=""
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <Package size={16} />
                          </div>
                        )}
                      </div>
                      <span className="font-medium truncate max-w-[200px]">
                        {p.title}
                      </span>
                    </div>
                  </td>
                  <td className="p-3 text-gray-600">
                    {TYPE_LABELS[p.purchase_type] || p.purchase_type}
                  </td>
                  <td className="p-3">
                    {p.sale_price ? (
                      <div>
                        <span className="font-semibold">${p.sale_price}</span>
                        <span className="text-gray-400 line-through ml-1 text-xs">
                          ${p.price}
                        </span>
                      </div>
                    ) : (
                      <span>${p.price}</span>
                    )}
                  </td>
                  <td className="p-3">{p.stock}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        STATUS_LABELS[p.status]?.color || ""
                      }`}
                    >
                      {STATUS_LABELS[p.status]?.label || p.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/products/edit?id=${p.id}`}
                        className="p-1.5 text-gray-400 hover:text-blue-500"
                        title="編輯"
                      >
                        <Edit2 size={16} />
                      </Link>
                      <button
                        onClick={() => toggleStatus(p)}
                        className="p-1.5 text-gray-400 hover:text-amber-500"
                        title={
                          p.status === "published" ? "下架" : "上架"
                        }
                      >
                        {p.status === "published" ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                      <button
                        onClick={() => deleteProduct(p.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500"
                        title="刪除"
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

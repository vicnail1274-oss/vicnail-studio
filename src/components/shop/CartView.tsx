"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getCart,
  updateCartQuantity,
  removeFromCart,
  getCartTotal,
  type CartItem,
} from "@/lib/cart-store";

export function CartView() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [flashId, setFlashId] = useState<string | null>(null);

  useEffect(() => {
    setItems(getCart());
    function onUpdate() {
      setItems(getCart());
    }
    window.addEventListener("cart-updated", onUpdate);
    return () => window.removeEventListener("cart-updated", onUpdate);
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }

  function handleQuantity(item: CartItem, delta: number) {
    const newQty = item.quantity + delta;
    updateCartQuantity(item.productId, item.variant, newQty);
    setItems(getCart());
    const key = `${item.productId}_${JSON.stringify(item.variant || {})}`;
    setFlashId(key);
    setTimeout(() => setFlashId(null), 600);
  }

  function handleRemove(item: CartItem) {
    removeFromCart(item.productId, item.variant);
    setItems(getCart());
    showToast("已移除");
  }

  const total = getCartTotal(items);

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <ShoppingBag size={48} className="mx-auto mb-4 text-gray-300" />
        <p className="text-muted-foreground mb-4">購物車是空的</p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 bg-nail-gold text-white rounded-xl font-medium hover:bg-nail-gold/90 transition-colors"
        >
          去逛逛 <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-4">
        {items.map((item) => {
          const price = item.salePrice ?? item.price;
          return (
            <div
              key={`${item.productId}_${JSON.stringify(item.variant || {})}`}
              className="flex gap-4 p-4 bg-white rounded-xl border border-gray-100"
            >
              {/* 圖片 */}
              <div className="w-20 h-20 rounded-lg bg-gray-50 overflow-hidden flex-shrink-0 relative">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="80px"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <ShoppingBag size={24} />
                  </div>
                )}
              </div>

              {/* 資訊 */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground truncate">
                  {item.title}
                </h3>
                {item.variant &&
                  Object.entries(item.variant).map(([k, v]) => (
                    <p key={k} className="text-xs text-muted-foreground">
                      {k}: {v}
                    </p>
                  ))}
                <p className="text-sm font-semibold mt-1">
                  NT$ {price.toLocaleString()}
                </p>
              </div>

              {/* 數量控制 */}
              <div className="flex flex-col items-end justify-between">
                <button
                  onClick={() => handleRemove(item)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleQuantity(item, -1)}
                    disabled={item.quantity <= 1}
                    className={cn(
                      "w-7 h-7 rounded border flex items-center justify-center",
                      item.quantity <= 1
                        ? "border-gray-100 text-gray-300"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    <Minus size={14} />
                  </button>
                  <span
                    className={cn(
                      "text-sm font-semibold w-6 text-center transition-colors duration-300",
                      flashId === `${item.productId}_${JSON.stringify(item.variant || {})}` && "text-nail-gold"
                    )}
                  >
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleQuantity(item, 1)}
                    disabled={item.quantity >= 99}
                    className={cn(
                      "w-7 h-7 rounded border flex items-center justify-center",
                      item.quantity >= 99
                        ? "border-gray-100 text-gray-300 cursor-not-allowed"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 合計 + 結帳 */}
      <div className="mt-8 p-6 bg-gray-50 rounded-xl">
        <div className="flex items-center justify-between text-lg">
          <span className="text-muted-foreground">商品小計</span>
          <span className="font-bold text-foreground">
            NT$ {total.toLocaleString()}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          運費將於結帳時計算
        </p>

        <Link
          href="/checkout"
          className="mt-4 w-full py-3 bg-nail-gold text-white rounded-xl font-semibold text-lg flex items-center justify-center gap-2 hover:bg-nail-gold/90 transition-colors"
        >
          前往結帳 <ArrowRight size={18} />
        </Link>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-[toast-in_0.3s_ease-out]">
          <div className="px-5 py-3 bg-gray-900 text-white rounded-xl shadow-lg text-sm font-medium">
            {toast}
          </div>
          <style>{`
            @keyframes toast-in {
              from { opacity: 0; transform: translateY(12px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}

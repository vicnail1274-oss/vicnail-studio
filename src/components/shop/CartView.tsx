"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Link as I18nLink } from "@/i18n/navigation";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Truck,
  Sparkles,
  GraduationCap,
  Loader2,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getCart,
  saveCart,
  updateCartQuantity,
  removeFromCart,
  getCartTotal,
  getCartByType,
  getShippingNature,
  type CartItem,
} from "@/lib/cart-store";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/ecpay/shipping";

export function CartView() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [flashId, setFlashId] = useState<string | null>(null);
  const [courseSubmitting, setCourseSubmitting] = useState(false);
  const [courseError, setCourseError] = useState<string | null>(null);
  const [needLogin, setNeedLogin] = useState(false);

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

  async function handleCourseCheckout() {
    setCourseError(null);
    setNeedLogin(false);
    const courseIds = getCartByType(getCart(), "course").map((c) => c.productId);
    if (courseIds.length === 0) return;

    setCourseSubmitting(true);
    try {
      const res = await fetch("/api/courses/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseIds, payment: "credit" }),
      });

      if (res.status === 401) {
        setNeedLogin(true);
        setCourseSubmitting(false);
        return;
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setCourseError(err.error || "課程結帳失敗");
        setCourseSubmitting(false);
        return;
      }

      const data = await res.json();

      // 結帳成功 → 從購物車移除課程項目（只留商品）
      const products = getCartByType(getCart(), "product");
      saveCart(products);
      setItems(getCart());

      // 100% 免費（優惠碼全免）
      if (data.free) {
        window.location.href = data.redirectUrl || "/zh-TW/account/courses";
        return;
      }

      // 正常付款 — 動態建表單提交到 ECPay
      const form = document.createElement("form");
      form.method = "POST";
      form.action = data.paymentUrl;
      form.style.display = "none";
      for (const [key, value] of Object.entries(data.paymentParams)) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = String(value);
        form.appendChild(input);
      }
      document.body.appendChild(form);
      form.submit();
    } catch {
      setCourseError("課程結帳失敗，請稍後再試");
      setCourseSubmitting(false);
    }
  }

  const products = getCartByType(items, "product");
  const courses = getCartByType(items, "course");
  const productTotal = getCartTotal(products);
  const courseTotal = getCartTotal(courses);

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <ShoppingBag size={48} className="mx-auto mb-4 text-gray-300" />
        <p className="text-muted-foreground mb-4">購物車是空的</p>
        <I18nLink
          href="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 bg-nail-gold text-white rounded-xl font-medium hover:bg-nail-gold/90 transition-colors"
        >
          去逛逛 <ArrowRight size={16} />
        </I18nLink>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* ===== 商品區 ===== */}
      {products.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ShoppingBag size={18} className="text-nail-gold" />
            商品
          </h2>

          {/* 出貨方式提示（純現貨盡速出貨 vs 混單一起等） */}
          {getShippingNature(products) === "instock" ? (
            <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 flex items-start gap-2 text-sm text-green-800">
              <Truck size={16} className="flex-shrink-0 mt-0.5 text-green-600" />
              <span>
                全部為<span className="font-semibold">現貨</span>商品，付款完成後將<span className="font-semibold">盡速出貨</span> 🚀
              </span>
            </div>
          ) : (
            <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2 text-sm text-amber-800">
              <Clock size={16} className="flex-shrink-0 mt-0.5 text-amber-600" />
              <span>
                此訂單含<span className="font-semibold">預購／代購</span>商品（先付款後代購），所有商品將於<span className="font-semibold">到齊後一併寄出</span>。想單獨快速取得現貨，請分開下單。
              </span>
            </div>
          )}

          <div className="space-y-4">
            {products.map((item) => {
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

          {/* 免運進度條 */}
          {(() => {
            const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - productTotal);
            const progress = Math.min(100, (productTotal / FREE_SHIPPING_THRESHOLD) * 100);
            const reached = remaining === 0;
            return (
              <div className="mt-6 p-4 bg-gradient-to-r from-nail-cream to-white rounded-xl border border-nail-gold/20">
                <div className="flex items-center gap-2 mb-2">
                  {reached ? (
                    <>
                      <Sparkles size={16} className="text-nail-gold" />
                      <p className="text-sm font-semibold text-nail-gold">
                        🎉 恭喜！已符合免運條件
                      </p>
                    </>
                  ) : (
                    <>
                      <Truck size={16} className="text-muted-foreground" />
                      <p className="text-sm text-foreground">
                        再買 <span className="font-bold text-nail-gold">NT$ {remaining.toLocaleString()}</span> 即可享 <span className="font-semibold">免運</span>
                      </p>
                    </>
                  )}
                </div>
                <div className="w-full h-2 bg-white rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      reached ? "bg-gradient-to-r from-nail-gold to-amber-400" : "bg-nail-gold/80"
                    )}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            );
          })()}

          {/* 商品合計 + 結帳 */}
          <div className="mt-4 p-6 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between text-lg">
              <span className="text-muted-foreground">商品小計</span>
              <span className="font-bold text-foreground">
                NT$ {productTotal.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              運費將於結帳時計算（滿 NT$ {FREE_SHIPPING_THRESHOLD.toLocaleString()} 免運）
            </p>

            <I18nLink
              href="/checkout"
              className="mt-4 w-full py-3 bg-nail-gold text-white rounded-xl font-semibold text-lg flex items-center justify-center gap-2 hover:bg-nail-gold/90 transition-colors"
            >
              商品結帳 <ArrowRight size={18} />
            </I18nLink>
          </div>
        </div>
      )}

      {/* ===== 課程區 ===== */}
      {courses.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <GraduationCap size={18} className="text-nail-gold" />
            課程
          </h2>
          <div className="space-y-4">
            {courses.map((item) => {
              const price = item.salePrice ?? item.price;
              return (
                <div
                  key={`course_${item.productId}`}
                  className="flex gap-4 p-4 bg-white rounded-xl border border-nail-gold/30"
                >
                  {/* 圖片 */}
                  <div className="w-20 h-20 rounded-lg bg-nail-cream/40 overflow-hidden flex-shrink-0 relative">
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
                      <div className="w-full h-full flex items-center justify-center text-nail-gold/40">
                        <GraduationCap size={24} />
                      </div>
                    )}
                  </div>

                  {/* 資訊 */}
                  <div className="flex-1 min-w-0">
                    <span className="inline-block text-[11px] font-semibold text-nail-gold bg-nail-gold/10 rounded px-2 py-0.5 mb-1">
                      課程
                    </span>
                    <h3 className="font-medium text-foreground truncate">
                      {item.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">終身觀看</p>
                    <p className="text-sm font-semibold mt-1">
                      NT$ {price.toLocaleString()}
                    </p>
                  </div>

                  {/* 移除（課程無數量控制，固定 1） */}
                  <div className="flex flex-col items-end justify-start">
                    <button
                      onClick={() => handleRemove(item)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 課程合計 + 結帳 */}
          <div className="mt-4 p-6 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between text-lg">
              <span className="text-muted-foreground">課程小計</span>
              <span className="font-bold text-foreground">
                NT$ {courseTotal.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              課程無需運費，付款完成後立即開通終身觀看權
            </p>

            {needLogin && (
              <div className="mt-4 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg px-4 py-3 text-sm">
                請先登入會員才能購買課程。
                <Link
                  href="/zh-TW/auth/login?redirect=/zh-TW/cart"
                  className="ml-1 font-semibold underline hover:text-amber-800"
                >
                  前往登入
                </Link>
              </div>
            )}

            {courseError && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm">
                {courseError}
              </div>
            )}

            <button
              onClick={handleCourseCheckout}
              disabled={courseSubmitting}
              className="mt-4 w-full py-3 bg-nail-gold text-white rounded-xl font-semibold text-lg flex items-center justify-center gap-2 hover:bg-nail-gold/90 disabled:bg-gray-300 transition-colors"
            >
              {courseSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  處理中⋯⋯
                </>
              ) : (
                <>
                  結帳課程 <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      )}

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

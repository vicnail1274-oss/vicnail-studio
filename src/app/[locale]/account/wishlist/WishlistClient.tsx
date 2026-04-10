"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Heart, ShoppingCart, Package, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getWishlist,
  removeFromWishlist,
  clearWishlist,
} from "@/lib/wishlist-store";
import { addToCart } from "@/lib/cart-store";

type Product = {
  id: string;
  title: string;
  price: number;
  sale_price: number | null;
  images: string[] | null;
  stock: number;
  purchase_type: "instock" | "preorder" | "proxy";
};

export function WishlistClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }

  function load() {
    const ids = getWishlist();
    if (ids.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/products/by-ids?ids=${ids.join(",")}`)
      .then((r) => r.json())
      .then((data) => {
        const sorted = ids
          .map((id) => data.products?.find((p: Product) => p.id === id))
          .filter(Boolean) as Product[];
        setProducts(sorted);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    function sync() {
      load();
    }
    window.addEventListener("wishlist-updated", sync);
    return () => window.removeEventListener("wishlist-updated", sync);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleRemove(id: string) {
    removeFromWishlist(id);
    showToast("已從願望清單移除");
  }

  function handleAddToCart(p: Product) {
    addToCart({
      productId: p.id,
      title: p.title,
      price: p.price,
      salePrice: p.sale_price ?? undefined,
      image: p.images?.[0],
      quantity: 1,
    });
    showToast("已加入購物車");
  }

  function handleClearAll() {
    if (typeof window === "undefined") return;
    if (!window.confirm("確定要清空整個願望清單嗎？")) return;
    clearWishlist();
    showToast("願望清單已清空");
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square bg-gray-100 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <Heart size={48} className="mx-auto mb-4 text-gray-300" />
        <p className="text-muted-foreground mb-6">
          願望清單還是空的 — 去逛逛挑幾件喜歡的吧
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-nail-gold text-white text-sm font-medium hover:bg-nail-gold/90 transition-colors"
        >
          <Package size={16} />
          前往商品專區
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          共 {products.length} 件
        </p>
        <button
          onClick={handleClearAll}
          className="text-xs text-gray-400 hover:text-red-500 inline-flex items-center gap-1 transition-colors"
        >
          <Trash2 size={12} />
          清空全部
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((p) => {
          const displayPrice = p.sale_price ?? p.price;
          const outOfStock = p.purchase_type === "instock" && p.stock <= 0;

          return (
            <div
              key={p.id}
              className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group relative"
            >
              <button
                onClick={() => handleRemove(p.id)}
                aria-label="移除"
                className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/90 backdrop-blur shadow-sm flex items-center justify-center text-pink-500 hover:bg-pink-50 transition-colors"
              >
                <Heart size={14} fill="currentColor" />
              </button>

              <Link href={`/shop/${p.id}`}>
                <div className="relative aspect-square bg-gray-50 overflow-hidden">
                  {p.images?.[0] ? (
                    <Image
                      src={p.images[0]}
                      alt={p.title}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Package size={36} />
                    </div>
                  )}
                  {outOfStock && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">已售完</span>
                    </div>
                  )}
                </div>
              </Link>

              <div className="p-3">
                <Link href={`/shop/${p.id}`}>
                  <h3 className="text-sm font-medium text-foreground line-clamp-2 hover:text-nail-gold transition-colors min-h-[2.5rem]">
                    {p.title}
                  </h3>
                </Link>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-base font-bold text-foreground">
                    ${displayPrice.toLocaleString()}
                  </span>
                  <button
                    onClick={() => handleAddToCart(p)}
                    disabled={outOfStock}
                    className={cn(
                      "p-1.5 rounded-lg transition-colors",
                      outOfStock
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-nail-gold/10 text-nail-gold hover:bg-nail-gold hover:text-white"
                    )}
                  >
                    <ShoppingCart size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="px-5 py-3 bg-gray-900 text-white rounded-xl shadow-lg text-sm font-medium">
            {toast}
          </div>
        </div>
      )}
    </>
  );
}

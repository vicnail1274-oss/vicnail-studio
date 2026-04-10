"use client";

import { useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import {
  ShoppingCart,
  ArrowLeft,
  Minus,
  Plus,
  Clock,
  Package,
  Truck,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { addToCart } from "@/lib/cart-store";
import { StockNotifyForm } from "./StockNotifyForm";

interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  stock: number;
  category: string | null;
  images: string[];
  variants: { name: string; options: string[] }[];
  purchase_type: string;
  preorder_deadline: string | null;
  estimated_delivery: string | null;
}

export function ProductDetail({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, string>
  >({});
  const [selectedImage, setSelectedImage] = useState(0);
  const [added, setAdded] = useState(false);
  const [variantErrors, setVariantErrors] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const displayPrice = product.sale_price ?? product.price;
  const outOfStock =
    product.purchase_type === "instock" && product.stock <= 0;

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }

  function handleAdd() {
    if (product.variants?.length) {
      const missing = product.variants
        .filter((v) => !selectedVariants[v.name])
        .map((v) => v.name);
      if (missing.length) {
        setVariantErrors(missing);
        return;
      }
    }
    setVariantErrors([]);

    addToCart({
      productId: product.id,
      title: product.title,
      price: product.price,
      salePrice: product.sale_price ?? undefined,
      image: product.images?.[0],
      variant: Object.keys(selectedVariants).length
        ? selectedVariants
        : undefined,
      quantity,
    });
    setAdded(true);
    showToast("已加入購物車");
    setTimeout(() => setAdded(false), 2000);
  }

  function getPreorderCountdown() {
    if (!product.preorder_deadline) return null;
    const deadline = new Date(product.preorder_deadline);
    const now = new Date();
    const diffMs = deadline.getTime() - now.getTime();
    if (diffMs <= 0) return "已截止";
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return `剩餘 ${days} 天`;
  }

  const purchaseTypeInfo: Record<
    string,
    { label: string; desc: string; color: string }
  > = {
    instock: {
      label: "現貨",
      desc: "付款後 1-3 個工作天出貨",
      color: "text-green-600",
    },
    preorder: {
      label: "預購",
      desc: product.estimated_delivery
        ? `預計 ${product.estimated_delivery} 出貨`
        : "到貨後依訂購順序出貨",
      color: "text-amber-600",
    },
    proxy: {
      label: "代購",
      desc: product.estimated_delivery
        ? `預計 ${product.estimated_delivery} 到貨`
        : "海外代購，到貨時間依產地而定",
      color: "text-blue-600",
    },
  };
  const typeInfo = purchaseTypeInfo[product.purchase_type] || purchaseTypeInfo.instock;

  return (
    <div>
      <Link
        href="/shop"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft size={16} /> 返回商品列表
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 左側：圖片 */}
        <div>
          <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden mb-3 relative">
            {product.images?.[selectedImage] ? (
              <Image
                src={product.images[selectedImage]}
                alt={product.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <Package size={64} />
              </div>
            )}
          </div>

          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={cn(
                    "w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 relative",
                    i === selectedImage
                      ? "border-nail-gold"
                      : "border-gray-200"
                  )}
                >
                  <Image
                    src={img}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="64px"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 右側：商品資訊 */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {product.title}
          </h1>

          {/* 購買類型 */}
          <div className={cn("flex items-center gap-2 mt-2", typeInfo.color)}>
            {product.purchase_type === "instock" && <Package size={16} />}
            {product.purchase_type === "preorder" && <Clock size={16} />}
            {product.purchase_type === "proxy" && <Truck size={16} />}
            <span className="text-sm font-medium">{typeInfo.label}</span>
            <span className="text-sm">— {typeInfo.desc}</span>
          </div>

          {product.preorder_deadline && (
            <p className="text-sm text-red-500 mt-1">
              預購截止：
              {new Date(product.preorder_deadline).toLocaleDateString("zh-TW")}{" "}
              {new Date(product.preorder_deadline).toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" })}
              {(() => {
                const countdown = getPreorderCountdown();
                return countdown ? ` （${countdown}）` : "";
              })()}
            </p>
          )}

          {/* 價格 */}
          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-foreground">
              NT$ {displayPrice.toLocaleString()}
            </span>
            {product.sale_price && (
              <span className="text-lg text-muted-foreground line-through">
                NT$ {product.price.toLocaleString()}
              </span>
            )}
          </div>

          {/* 庫存 */}
          {product.purchase_type === "instock" && (
            <p
              className={cn(
                "text-sm mt-2",
                product.stock <= 5 ? "text-red-500" : "text-muted-foreground"
              )}
            >
              {outOfStock
                ? "已售完"
                : product.stock <= 5
                  ? `僅剩 ${product.stock} 件`
                  : `庫存 ${product.stock} 件`}
            </p>
          )}

          {/* 規格選擇 */}
          {product.variants?.map((v) => {
            const hasError = variantErrors.includes(v.name);
            return (
              <div key={v.name} className="mt-4">
                <label className={cn("text-sm font-medium", hasError ? "text-red-500" : "text-foreground")}>
                  {v.name} {hasError && "— 請選擇"}
                </label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {v.options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setSelectedVariants((prev) => ({
                          ...prev,
                          [v.name]: opt,
                        }));
                        setVariantErrors((prev) => prev.filter((n) => n !== v.name));
                      }}
                      className={cn(
                        "px-3 py-1.5 rounded-lg border text-sm transition-colors",
                        selectedVariants[v.name] === opt
                          ? "border-nail-gold bg-nail-gold/10 text-nail-gold"
                          : hasError
                            ? "border-red-300 text-gray-600 hover:border-red-400"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}

          {/* 數量 */}
          <div className="mt-6">
            <label className="text-sm font-medium text-foreground">數量</label>
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50"
              >
                <Minus size={16} />
              </button>
              <span className="text-lg font-semibold w-8 text-center">
                {quantity}
              </span>
              <button
                onClick={() => {
                  const maxQty = product.purchase_type === "instock" ? product.stock : 99;
                  setQuantity(Math.min(maxQty, quantity + 1));
                }}
                disabled={
                  product.purchase_type === "instock"
                    ? quantity >= product.stock
                    : quantity >= 99
                }
                className={cn(
                  "w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center",
                  (product.purchase_type === "instock" ? quantity >= product.stock : quantity >= 99)
                    ? "text-gray-300 cursor-not-allowed"
                    : "hover:bg-gray-50"
                )}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* 加入購物車 */}
          <div className="mt-8 flex gap-3">
            <button
              onClick={handleAdd}
              disabled={outOfStock}
              className={cn(
                "flex-1 py-3 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-colors",
                outOfStock
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : added
                    ? "bg-green-500 text-white"
                    : "bg-nail-gold text-white hover:bg-nail-gold/90"
              )}
            >
              {added ? (
                <>
                  <Check size={20} /> 已加入
                </>
              ) : outOfStock ? (
                <>已售完</>
              ) : (
                <>
                  <ShoppingCart size={20} /> 加入購物車
                </>
              )}
            </button>
          </div>

          {/* 缺貨時：到貨通知 */}
          {outOfStock && <StockNotifyForm productId={product.id} />}

          {/* 商品描述 */}
          {product.description && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <h2 className="text-lg font-semibold mb-3">商品說明</h2>
              <div className="prose prose-sm text-muted-foreground whitespace-pre-wrap">
                {product.description}
              </div>
            </div>
          )}

          {/* 配送說明 */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl text-sm text-muted-foreground space-y-2">
            <h3 className="font-medium text-foreground">配送方式</h3>
            <p>- 7-11 / 全家 / 萊爾富超商取貨（運費 $65）</p>
            <p>- 黑貓宅急便（運費 $120）</p>
            <p>- 順豐速運（運費 $180）</p>
            <p>- 工作室自取（免運）</p>
          </div>
        </div>
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

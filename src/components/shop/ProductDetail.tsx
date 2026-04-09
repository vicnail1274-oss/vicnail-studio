"use client";

import { useState } from "react";
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

  const displayPrice = product.sale_price ?? product.price;
  const outOfStock =
    product.purchase_type === "instock" && product.stock <= 0;

  function handleAdd() {
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
    setTimeout(() => setAdded(false), 2000);
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
          <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden mb-3">
            {product.images?.[selectedImage] ? (
              <img
                src={product.images[selectedImage]}
                alt={product.title}
                className="w-full h-full object-cover"
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
                    "w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0",
                    i === selectedImage
                      ? "border-nail-gold"
                      : "border-gray-200"
                  )}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
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
              {new Date(product.preorder_deadline).toLocaleDateString("zh-TW")}
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
          {product.variants?.map((v) => (
            <div key={v.name} className="mt-4">
              <label className="text-sm font-medium text-foreground">
                {v.name}
              </label>
              <div className="flex flex-wrap gap-2 mt-2">
                {v.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() =>
                      setSelectedVariants((prev) => ({
                        ...prev,
                        [v.name]: opt,
                      }))
                    }
                    className={cn(
                      "px-3 py-1.5 rounded-lg border text-sm transition-colors",
                      selectedVariants[v.name] === opt
                        ? "border-nail-gold bg-nail-gold/10 text-nail-gold"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

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
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50"
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
              ) : (
                <>
                  <ShoppingCart size={20} /> 加入購物車
                </>
              )}
            </button>
          </div>

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
    </div>
  );
}

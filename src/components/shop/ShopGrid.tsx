"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { ShoppingCart, Clock, Package, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import { addToCart } from "@/lib/cart-store";
import { GroupBuyBanner } from "./GroupBuyBanner";

interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  stock: number;
  category: string | null;
  images: string[];
  purchase_type: "instock" | "preorder" | "proxy";
  preorder_deadline: string | null;
  estimated_delivery: string | null;
  slug: string | null;
}

interface GroupBuy {
  id: string;
  title: string;
  description: string | null;
  cover_image: string | null;
  start_date: string;
  end_date: string;
  target_qty: number;
  current_qty: number;
  status: string;
}

const PURCHASE_TYPE_LABELS: Record<string, { label: string; color: string; icon: typeof Package }> = {
  instock: { label: "現貨", color: "bg-green-100 text-green-700", icon: Package },
  preorder: { label: "預購", color: "bg-amber-100 text-amber-700", icon: Clock },
  proxy: { label: "代購", color: "bg-blue-100 text-blue-700", icon: Truck },
};

const CATEGORIES = [
  { key: "all", label: "全部" },
  { key: "tools", label: "工具" },
  { key: "gel", label: "凝膠" },
  { key: "materials", label: "材料" },
  { key: "accessories", label: "配件" },
  { key: "other", label: "其他" },
];

export function ShopGrid({
  products,
  groupBuys,
}: {
  products: Product[];
  groupBuys: GroupBuy[];
}) {
  const [category, setCategory] = useState("all");
  const [addedId, setAddedId] = useState<string | null>(null);

  const filtered =
    category === "all"
      ? products
      : products.filter((p) => p.category === category);

  function handleAddToCart(product: Product) {
    addToCart({
      productId: product.id,
      title: product.title,
      price: product.price,
      salePrice: product.sale_price ?? undefined,
      image: product.images?.[0],
      quantity: 1,
    });
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  }

  return (
    <div className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 進行中的團購 */}
        {groupBuys.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-display font-bold mb-4">
              進行中的團購
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {groupBuys.map((gb) => (
                <GroupBuyBanner key={gb.id} groupBuy={gb} />
              ))}
            </div>
          </div>
        )}

        {/* 分類篩選 */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setCategory(cat.key)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                category === cat.key
                  ? "bg-nail-gold text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* 商品列表 */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Package size={48} className="mx-auto mb-4 opacity-30" />
            <p>目前沒有商品，敬請期待！</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((product, i) => {
              const typeInfo = PURCHASE_TYPE_LABELS[product.purchase_type] || PURCHASE_TYPE_LABELS.instock;
              const TypeIcon = typeInfo.icon;
              const displayPrice = product.sale_price ?? product.price;
              const outOfStock = product.purchase_type === "instock" && product.stock <= 0;

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group"
                >
                  {/* 商品圖片 */}
                  <Link href={`/shop/${product.id}`}>
                    <div className="relative aspect-square bg-gray-50 overflow-hidden">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Package size={48} />
                        </div>
                      )}

                      {/* 購買類型標籤 */}
                      <span
                        className={cn(
                          "absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1",
                          typeInfo.color
                        )}
                      >
                        <TypeIcon size={12} />
                        {typeInfo.label}
                      </span>

                      {outOfStock && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">已售完</span>
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* 商品資訊 */}
                  <div className="p-4">
                    <Link href={`/shop/${product.id}`}>
                      <h3 className="font-semibold text-foreground line-clamp-2 hover:text-nail-gold transition-colors">
                        {product.title}
                      </h3>
                    </Link>

                    {product.estimated_delivery && (
                      <p className="text-xs text-muted-foreground mt-1">
                        預計出貨：{product.estimated_delivery}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-foreground">
                          ${displayPrice.toLocaleString()}
                        </span>
                        {product.sale_price && (
                          <span className="text-sm text-muted-foreground line-through">
                            ${product.price.toLocaleString()}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={outOfStock}
                        className={cn(
                          "p-2 rounded-lg transition-colors",
                          outOfStock
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : addedId === product.id
                              ? "bg-green-500 text-white"
                              : "bg-nail-gold/10 text-nail-gold hover:bg-nail-gold hover:text-white"
                        )}
                      >
                        <ShoppingCart size={18} />
                      </button>
                    </div>

                    {product.purchase_type === "instock" && product.stock > 0 && product.stock <= 5 && (
                      <p className="text-xs text-red-500 mt-1">
                        僅剩 {product.stock} 件
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

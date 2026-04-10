"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Package } from "lucide-react";
import { getRecentlyViewed } from "@/lib/recently-viewed";

type Product = {
  id: string;
  title: string;
  price: number;
  sale_price: number | null;
  images: string[] | null;
};

export function RecentlyViewedList({ excludeId }: { excludeId?: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const ids = getRecentlyViewed().filter((id) => id !== excludeId);
    if (ids.length === 0) {
      setLoaded(true);
      return;
    }
    fetch(`/api/products/by-ids?ids=${ids.join(",")}`)
      .then((r) => r.json())
      .then((data) => {
        // 按原 ids 順序排序
        const sorted = ids
          .map((id) => data.products?.find((p: Product) => p.id === id))
          .filter(Boolean) as Product[];
        setProducts(sorted.slice(0, 6));
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [excludeId]);

  if (!loaded || products.length === 0) return null;

  return (
    <section className="mt-10 pt-8 border-t border-gray-100">
      <h2 className="text-lg md:text-xl font-display font-bold text-foreground mb-4">
        最近瀏覽過
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scroll-smooth snap-x">
        {products.map((p) => {
          const displayPrice = p.sale_price ?? p.price;
          const cover = p.images?.[0];
          return (
            <Link
              key={p.id}
              href={`/shop/${p.id}`}
              className="group block flex-shrink-0 w-32 snap-start"
            >
              <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden relative mb-2">
                {cover ? (
                  <Image
                    src={cover}
                    alt={p.title}
                    fill
                    sizes="128px"
                    className="object-cover group-hover:scale-105 transition-transform"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <Package size={24} />
                  </div>
                )}
              </div>
              <p className="text-xs font-medium text-foreground line-clamp-2 group-hover:text-nail-gold transition-colors">
                {p.title}
              </p>
              <p className="text-xs font-bold text-nail-gold mt-0.5">
                NT$ {displayPrice.toLocaleString()}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

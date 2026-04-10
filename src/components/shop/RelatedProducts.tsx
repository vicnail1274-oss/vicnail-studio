import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { Package } from "lucide-react";

type RelatedProduct = {
  id: string;
  title: string;
  price: number;
  sale_price: number | null;
  images: string[] | null;
  category: string | null;
};

interface Props {
  currentProductId: string;
  category: string | null;
}

export async function RelatedProducts({ currentProductId, category }: Props) {
  const supabase = await createClient();

  // 優先同類別，不足就用最新商品補
  let products: RelatedProduct[] = [];

  if (category) {
    const { data } = await supabase
      .from("products")
      .select("id, title, price, sale_price, images, category")
      .eq("status", "published")
      .eq("category", category)
      .neq("id", currentProductId)
      .order("created_at", { ascending: false })
      .limit(4);
    products = (data as unknown as RelatedProduct[] | null) ?? [];
  }

  if (products.length < 4) {
    const { data } = await supabase
      .from("products")
      .select("id, title, price, sale_price, images, category")
      .eq("status", "published")
      .neq("id", currentProductId)
      .order("created_at", { ascending: false })
      .limit(8);
    const extras = ((data as unknown as RelatedProduct[] | null) ?? []).filter(
      (p) => !products.find((x) => x.id === p.id)
    );
    products = [...products, ...extras].slice(0, 4);
  }

  if (products.length === 0) return null;

  return (
    <section className="mt-16 pt-10 border-t border-gray-100">
      <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-6">
        你可能也會喜歡
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((p) => {
          const displayPrice = p.sale_price ?? p.price;
          const cover = p.images?.[0];
          return (
            <Link
              key={p.id}
              href={`/shop/${p.id}`}
              className="group block"
            >
              <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden relative mb-3">
                {cover ? (
                  <Image
                    src={cover}
                    alt={p.title}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <Package size={32} />
                  </div>
                )}
              </div>
              <h3 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-nail-gold transition-colors">
                {p.title}
              </h3>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-sm font-bold text-nail-gold">
                  NT$ {displayPrice.toLocaleString()}
                </span>
                {p.sale_price && (
                  <span className="text-xs text-muted-foreground line-through">
                    NT$ {p.price.toLocaleString()}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

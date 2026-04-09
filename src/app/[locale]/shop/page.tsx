import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ShopGrid } from "@/components/shop/ShopGrid";

export const metadata: Metadata = {
  title: "商品專區",
  description: "VicNail Studio 美甲工具、凝膠材料 — 現貨、預購、代購",
};

export default async function ShopPage() {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("status", "published")
    .order("sort_order", { ascending: true });

  const { data: activeGroupBuys } = await supabase
    .from("group_buys")
    .select("*, group_buy_items(*, products(*))")
    .in("status", ["active", "upcoming"])
    .order("start_date", { ascending: true });

  return (
    <>
      {/* Hero */}
      <section className="py-16 px-4 bg-gradient-to-b from-nail-cream to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground">
            商品專區
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            精選美甲工具與材料 — 現貨直送・預購團購・海外代購
          </p>
        </div>
      </section>

      <ShopGrid
        products={products || []}
        groupBuys={activeGroupBuys || []}
      />
    </>
  );
}

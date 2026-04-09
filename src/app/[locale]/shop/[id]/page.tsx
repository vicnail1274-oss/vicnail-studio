import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductDetail } from "@/components/shop/ProductDetail";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string; locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("title, description")
    .eq("id", id)
    .single();

  return {
    title: data?.title || "商品詳情",
    description: data?.description || "",
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("status", "published")
    .single();

  if (!product) notFound();

  return (
    <section className="py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <ProductDetail product={product} />
      </div>
    </section>
  );
}

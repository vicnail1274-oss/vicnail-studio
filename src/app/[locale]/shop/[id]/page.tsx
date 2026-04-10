import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductDetail } from "@/components/shop/ProductDetail";
import type { Product } from "@/lib/supabase/types";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string; locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("title, description, images")
    .eq("id", id)
    .single() as { data: { title: string; description: string | null; images: string[] | null } | null };

  const title = data?.title || "商品詳情";
  const description = data?.description || "VicNail Studio 商品";
  const ogImage = data?.images?.[0];

  return {
    title,
    description,
    openGraph: {
      title: `${title} — VicNail Studio`,
      description,
      type: "website",
      ...(ogImage && { images: [{ url: ogImage }] }),
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} — VicNail Studio`,
      description,
      ...(ogImage && { images: [ogImage] }),
    },
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
        <ProductDetail product={product as Product} />
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Check, ArrowRight } from "lucide-react";
import { addToCart } from "@/lib/cart-store";

interface AddCourseToCartButtonProps {
  courseId: string;
  title: string;
  price: number;
  salePrice?: number | null;
  image?: string | null;
}

export function AddCourseToCartButton({
  courseId,
  title,
  price,
  salePrice,
  image,
}: AddCourseToCartButtonProps) {
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addToCart({
      productId: courseId,
      title,
      price,
      salePrice: salePrice ?? undefined,
      image: image ?? undefined,
      type: "course",
      quantity: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  if (added) {
    return (
      <div className="flex flex-col gap-2">
        <div className="w-full py-3 bg-nail-gold/10 text-nail-gold border border-nail-gold/30 rounded-xl font-semibold flex items-center justify-center gap-2">
          <Check size={18} />
          已加入購物車
        </div>
        <Link
          href="/zh-TW/cart"
          className="w-full py-3 bg-nail-gold text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-nail-gold/90 transition-colors"
        >
          前往購物車 <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <button
      onClick={handleAdd}
      className="w-full py-3 bg-nail-gold text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-nail-gold/90 transition-colors"
    >
      <ShoppingBag size={18} />
      加入購物車
    </button>
  );
}

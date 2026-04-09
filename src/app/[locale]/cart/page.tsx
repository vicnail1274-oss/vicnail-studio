import type { Metadata } from "next";
import { CartView } from "@/components/shop/CartView";

export const metadata: Metadata = {
  title: "購物車",
  description: "查看您的購物車",
};

export default function CartPage() {
  return (
    <section className="py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-display font-bold mb-8">購物車</h1>
        <CartView />
      </div>
    </section>
  );
}

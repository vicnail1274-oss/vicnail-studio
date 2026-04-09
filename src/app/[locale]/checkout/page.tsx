import type { Metadata } from "next";
import { CheckoutForm } from "@/components/shop/CheckoutForm";

export const metadata: Metadata = {
  title: "結帳",
  description: "完成訂單付款",
};

export default function CheckoutPage() {
  return (
    <section className="py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-display font-bold mb-8">結帳</h1>
        <CheckoutForm />
      </div>
    </section>
  );
}

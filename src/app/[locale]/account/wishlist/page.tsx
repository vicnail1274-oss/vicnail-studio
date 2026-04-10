import type { Metadata } from "next";
import { WishlistClient } from "./WishlistClient";

export const metadata: Metadata = {
  title: "我的願望清單",
  description: "你收藏的 VicNail Studio 商品",
  robots: { index: false, follow: false },
};

export default function WishlistPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-display font-bold text-foreground mb-2">
        我的願望清單
      </h1>
      <p className="text-sm text-muted-foreground mb-8">
        收藏喜歡的商品，下次回來直接下單
      </p>
      <WishlistClient />
    </div>
  );
}

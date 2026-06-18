"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { RotateCcw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const params = useParams();
  const locale = (params?.locale as string) === "en" ? "en" : "zh-TW";
  const isZh = locale === "zh-TW";

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-gradient-to-b from-nail-cream to-white px-4 py-20 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-nail-pink/30">
        <RotateCcw size={28} className="text-nail-gold" />
      </div>
      <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
        {isZh ? "發生了一點問題" : "Something went wrong"}
      </h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        {isZh
          ? "頁面載入時遇到錯誤，請稍後再試或重新載入。"
          : "We hit an error while loading this page. Please try again."}
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => reset()}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-nail-gold px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-nail-gold/90"
        >
          <RotateCcw size={16} />
          {isZh ? "重新載入" : "Try again"}
        </button>
        <Link
          href={`/${locale}`}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-nail-gold/30 px-8 py-3 text-sm font-medium text-nail-gold transition-colors hover:bg-nail-gold/5"
        >
          <Home size={16} />
          {isZh ? "回首頁" : "Back home"}
        </Link>
      </div>
    </div>
  );
}

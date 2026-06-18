import Link from "next/link";
import { getLocale } from "next-intl/server";
import { Home, GraduationCap } from "lucide-react";

export default async function NotFound() {
  const locale = (await getLocale()) === "en" ? "en" : "zh-TW";
  const isZh = locale === "zh-TW";

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-gradient-to-b from-nail-cream to-white px-4 py-20 text-center">
      <h1 className="font-display text-7xl font-bold leading-none text-nail-gold sm:text-8xl">
        404
      </h1>
      <p className="mt-4 text-xl font-medium text-foreground">
        {isZh ? "找不到這個頁面" : "Page not found"}
      </p>
      <p className="mt-2 max-w-md text-muted-foreground">
        {isZh
          ? "您要找的頁面可能已被移除或變更網址。"
          : "The page you are looking for may have been moved or removed."}
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href={`/${locale}`}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-nail-gold px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-nail-gold/90"
        >
          <Home size={16} />
          {isZh ? "回首頁" : "Back home"}
        </Link>
        <Link
          href={isZh ? "/zh-TW/courses" : "/en"}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-nail-gold/30 px-8 py-3 text-sm font-medium text-nail-gold transition-colors hover:bg-nail-gold/5"
        >
          <GraduationCap size={16} />
          {isZh ? "瀏覽課程" : "Browse site"}
        </Link>
      </div>
    </div>
  );
}

"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { Globe } from "lucide-react";

export function LanguageSwitcher({ isAiSection }: { isAiSection: boolean }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLocale = () => {
    const next = locale === "zh-TW" ? "en" : "zh-TW";
    router.replace(pathname, { locale: next });
  };

  return (
    <button
      onClick={toggleLocale}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
        isAiSection
          ? "border-white/20 text-gray-300 hover:text-white hover:border-ai-cyan/50"
          : "border-nail-gold/30 text-muted-foreground hover:text-nail-gold hover:border-nail-gold/60"
      )}
    >
      <Globe size={14} />
      {locale === "zh-TW" ? "EN" : "中文"}
    </button>
  );
}

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

const navItems = [
  { href: "/", key: "home", zhOnly: false },
  { href: "/courses", key: "courses", zhOnly: true },
  { href: "/nail/knowledge", key: "nailKnowledge", zhOnly: false },
  { href: "/nail/news", key: "nailNews", zhOnly: false },
  { href: "/ai", key: "ai", zhOnly: false },
  { href: "/about", key: "about", zhOnly: false },
] as const;

export function Header({ locale }: { locale: string }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAiSection = pathname.startsWith("/ai");

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-colors duration-300",
        isAiSection
          ? "bg-ai-dark/80 backdrop-blur-md border-b border-white/10"
          : "bg-white/80 backdrop-blur-md border-b border-nail-pink/30"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span
              className={cn(
                "text-xl font-display font-bold tracking-tight",
                isAiSection ? "text-white" : "text-foreground"
              )}
            >
              VicNail
            </span>
            <span
              className={cn(
                "text-xl font-display font-light",
                isAiSection ? "text-ai-cyan" : "text-nail-gold"
              )}
            >
              Studio
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              if (item.zhOnly && locale !== "zh-TW") return null;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? isAiSection
                        ? "text-ai-cyan bg-white/10"
                        : "text-nail-gold bg-nail-pink/50"
                      : isAiSection
                        ? "text-gray-300 hover:text-white hover:bg-white/5"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  {t(item.key)}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher isAiSection={isAiSection} />

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={cn(
                "md:hidden p-2 rounded-md",
                isAiSection
                  ? "text-gray-300 hover:text-white"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div
          className={cn(
            "md:hidden border-t",
            isAiSection
              ? "bg-ai-dark/95 border-white/10"
              : "bg-white/95 border-nail-pink/30"
          )}
        >
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => {
              if (item.zhOnly && locale !== "zh-TW") return null;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "block px-3 py-2 rounded-md text-base font-medium transition-colors",
                    isActive
                      ? isAiSection
                        ? "text-ai-cyan bg-white/10"
                        : "text-nail-gold bg-nail-pink/50"
                      : isAiSection
                        ? "text-gray-300 hover:text-white"
                        : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t(item.key)}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}

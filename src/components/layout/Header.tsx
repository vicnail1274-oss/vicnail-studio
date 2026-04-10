"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { cn } from "@/lib/utils";
import { Menu, X, ShoppingCart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const navItems = [
  { href: "/", key: "home", zhOnly: false },
  { href: "/courses", key: "courses", zhOnly: true },
  { href: "/shop", key: "shop", zhOnly: true },
  { href: "/services", key: "services", zhOnly: false },
  { href: "/nail/knowledge", key: "nailKnowledge", zhOnly: false },
  { href: "/nail/news", key: "nailNews", zhOnly: false },
  { href: "/ai", key: "ai", zhOnly: false },
  { href: "/about", key: "about", zhOnly: false },
] as const;

export function Header({ locale }: { locale: string }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const isAiSection = pathname.startsWith("/ai");

  // 取得目前登入用戶
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // 購物車數量
  useEffect(() => {
    function updateCartCount() {
      try {
        const raw = localStorage.getItem("vicnail_cart");
        const items = raw ? JSON.parse(raw) : [];
        setCartCount(items.reduce((s: number, i: { quantity: number }) => s + i.quantity, 0));
      } catch { setCartCount(0); }
    }
    updateCartCount();
    window.addEventListener("cart-updated", updateCartCount);
    return () => window.removeEventListener("cart-updated", updateCartCount);
  }, []);

  // 點外部關閉用戶選單
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setUserMenuOpen(false);
    window.location.href = "/";
  }

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "我";
  const avatarLetter = displayName[0]?.toUpperCase() ?? "U";

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
            <span className={cn("text-xl font-display font-bold tracking-tight", isAiSection ? "text-white" : "text-foreground")}>
              VicNail
            </span>
            <span className={cn("text-xl font-display font-light", isAiSection ? "text-ai-cyan" : "text-nail-gold")}>
              Studio
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              if (item.zhOnly && locale !== "zh-TW") return null;
              const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? isAiSection ? "text-ai-cyan bg-white/10" : "text-nail-gold bg-nail-pink/50"
                      : isAiSection ? "text-gray-300 hover:text-white hover:bg-white/5" : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  {t(item.key)}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* 購物車 */}
            {locale === "zh-TW" && (
              <Link
                href="/cart"
                className={cn(
                  "relative p-2 rounded-md transition-colors",
                  isAiSection ? "text-gray-300 hover:text-white" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </Link>
            )}

            <LanguageSwitcher isAiSection={isAiSection} />

            {/* 登入狀態 */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="w-8 h-8 rounded-full bg-pink-500 text-white text-sm font-bold flex items-center justify-center hover:bg-pink-400 transition-colors"
                  title={displayName}
                >
                  {avatarLetter}
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-10 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    <div className="px-4 py-3 border-b border-gray-50">
                      <p className="text-sm font-semibold text-gray-900">
                        {(() => {
                          const h = new Date().getHours();
                          const greeting = h < 5 ? "夜深了" : h < 11 ? "早安" : h < 14 ? "午安" : h < 18 ? "午後好" : "晚安";
                          return `${greeting}，${displayName} 👋`;
                        })()}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{user.email}</p>
                    </div>
                    <Link
                      href="/account"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      個人中心
                    </Link>
                    <Link
                      href="/account/courses"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      我的課程
                    </Link>
                    <Link
                      href="/account/orders"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      我的訂單
                    </Link>
                    <hr className="my-1 border-gray-50" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                    >
                      登出
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className={cn(
                  "hidden md:flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  isAiSection
                    ? "bg-white/10 text-white hover:bg-white/20"
                    : "bg-pink-50 text-pink-600 hover:bg-pink-100"
                )}
              >
                登入
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={cn("md:hidden p-2 rounded-md", isAiSection ? "text-gray-300 hover:text-white" : "text-muted-foreground hover:text-foreground")}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className={cn("md:hidden border-t", isAiSection ? "bg-ai-dark/95 border-white/10" : "bg-white/95 border-nail-pink/30")}>
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => {
              if (item.zhOnly && locale !== "zh-TW") return null;
              const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "block px-3 py-2 rounded-md text-base font-medium transition-colors",
                    isActive
                      ? isAiSection ? "text-ai-cyan bg-white/10" : "text-nail-gold bg-nail-pink/50"
                      : isAiSection ? "text-gray-300 hover:text-white" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t(item.key)}
                </Link>
              );
            })}

            {/* 手機版登入/登出 */}
            <div className="pt-2 border-t border-gray-100 mt-2">
              {user ? (
                <div className="space-y-1">
                  <Link href="/account" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm text-gray-700">
                    👤 {displayName}
                  </Link>
                  <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm text-red-500">
                    登出
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 text-sm font-medium text-pink-600"
                >
                  登入 / 註冊
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

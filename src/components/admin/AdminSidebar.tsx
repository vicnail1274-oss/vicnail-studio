"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  Package,
  ShoppingCart,
  Users,
  Home,
} from "lucide-react";

const navItems = [
  { href: "/admin/articles", label: "文章管理", icon: FileText },
  { href: "/admin/products", label: "商品管理", icon: Package },
  { href: "/admin/orders", label: "訂單管理", icon: ShoppingCart },
  { href: "/admin/group-buys", label: "團購管理", icon: Users },
];

export function AdminSidebar() {
  const pathname = usePathname();

  // 不在登入頁顯示 sidebar
  if (pathname === "/admin/login") return null;

  return (
    <aside className="fixed left-0 top-0 h-full w-56 bg-white border-r border-gray-200 flex flex-col z-40">
      <div className="p-4 border-b border-gray-100">
        <Link href="/admin/articles" className="text-lg font-bold text-pink-500">
          VicNail Admin
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-pink-50 text-pink-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-100">
        <Link
          href="/zh-TW"
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
        >
          <Home size={16} /> 回前台
        </Link>
      </div>
    </aside>
  );
}

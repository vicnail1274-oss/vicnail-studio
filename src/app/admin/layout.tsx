import type { Metadata } from "next";
import "../globals.css";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const metadata: Metadata = {
  title: "VicNail 後台管理",
  robots: "noindex,nofollow",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body className="bg-gray-50 text-gray-900 min-h-screen antialiased flex">
        <AdminSidebar />
        <main className="flex-1 ml-56">{children}</main>
      </body>
    </html>
  );
}

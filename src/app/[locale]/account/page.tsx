import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type ProfileRow = {
  display_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  locale: string;
};

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profileData } = await supabase
    .from("profiles")
    .select("display_name, avatar_url, phone, locale")
    .eq("id", user.id)
    .maybeSingle();
  const profile = profileData as ProfileRow | null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">個人帳號</h1>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
        {/* 頭像 + 基本資料 */}
        <div className="p-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center text-2xl font-bold text-pink-600">
            {profile?.display_name?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{profile?.display_name ?? "未設定名稱"}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>

        {/* 選單 */}
        <nav className="p-2">
          {[
            { href: "/account/courses", icon: "🎬", label: "我的課程" },
            { href: "/account/orders", icon: "📦", label: "我的訂單" },
            { href: "/account/profile", icon: "✏️", label: "編輯資料" },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
              <span className="ml-auto text-gray-300">→</span>
            </a>
          ))}
        </nav>

        {/* 登出 */}
        <div className="p-4">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}

function LogoutButton() {
  return (
    <form action="/api/auth/logout" method="POST">
      <button
        type="submit"
        className="w-full text-center text-sm text-gray-400 hover:text-red-500 transition-colors py-2"
      >
        登出
      </button>
    </form>
  );
}

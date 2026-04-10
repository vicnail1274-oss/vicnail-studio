import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Link } from "@/i18n/navigation";

export const metadata: Metadata = {
  title: "編輯資料",
  description: "修改您的個人資料",
  robots: { index: false, follow: false },
};

type ProfileRow = {
  display_name: string | null;
  phone: string | null;
  locale: string;
};

async function updateProfile(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const displayName = (formData.get("display_name") as string | null)?.trim() || null;
  const phoneRaw = (formData.get("phone") as string | null)?.trim() || null;
  const locale = (formData.get("locale") as string | null)?.trim() || "zh-TW";

  // 台灣手機格式驗證（允許空值）
  if (phoneRaw) {
    const normalized = phoneRaw.replace(/\s/g, "");
    if (!/^(09\d{8}|0\d{1,2}-?\d{6,8})$/.test(normalized)) {
      throw new Error("電話格式錯誤");
    }
  }

  // 長度驗證
  if (displayName && displayName.length > 50) {
    throw new Error("名稱過長");
  }
  if (!["zh-TW", "en"].includes(locale)) {
    throw new Error("語系錯誤");
  }

  await supabase
    .from("profiles")
    .update({
      display_name: displayName,
      phone: phoneRaw,
      locale,
    })
    .eq("id", user.id);

  revalidatePath("/account");
  revalidatePath("/account/profile");
  redirect("/account");
}

export default async function ProfileEditPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data } = await supabase
    .from("profiles")
    .select("display_name, phone, locale")
    .eq("id", user.id)
    .maybeSingle();
  const profile = (data as ProfileRow | null) || {
    display_name: null,
    phone: null,
    locale: "zh-TW",
  };

  return (
    <section className="min-h-[70vh] py-12 px-4 bg-gradient-to-b from-nail-cream to-white">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-display font-bold text-foreground">編輯資料</h1>
          <Link
            href="/account"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← 取消
          </Link>
        </div>

        <form
          action={updateProfile}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5"
        >
          {/* Email (不可編輯) */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">
              電子郵件
            </label>
            <input
              type="email"
              value={user.email || ""}
              disabled
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-muted-foreground">Email 無法修改</p>
          </div>

          {/* 顯示名稱 */}
          <div>
            <label
              htmlFor="display_name"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              顯示名稱
            </label>
            <input
              id="display_name"
              name="display_name"
              type="text"
              maxLength={50}
              defaultValue={profile.display_name || ""}
              placeholder="輸入您的名字"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-nail-gold focus:ring-1 focus:ring-nail-gold outline-none transition-colors"
            />
          </div>

          {/* 電話 */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              聯絡電話
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              defaultValue={profile.phone || ""}
              placeholder="0912345678"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-nail-gold focus:ring-1 focus:ring-nail-gold outline-none transition-colors"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              台灣手機（09xxxxxxxx）或市話
            </p>
          </div>

          {/* 語系 */}
          <div>
            <label
              htmlFor="locale"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              介面語言
            </label>
            <select
              id="locale"
              name="locale"
              defaultValue={profile.locale}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:border-nail-gold focus:ring-1 focus:ring-nail-gold outline-none transition-colors"
            >
              <option value="zh-TW">繁體中文</option>
              <option value="en">English</option>
            </select>
          </div>

          {/* 送出按鈕 */}
          <div className="pt-2 flex gap-3">
            <Link
              href="/account"
              className="flex-1 text-center py-3 bg-white border border-gray-200 text-foreground rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              取消
            </Link>
            <button
              type="submit"
              className="flex-1 py-3 bg-nail-gold text-white rounded-xl font-semibold hover:bg-nail-gold/90 transition-colors"
            >
              儲存變更
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

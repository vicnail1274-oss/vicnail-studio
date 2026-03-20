import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "VicNail Studio Privacy Policy — how we collect and use your data.",
};

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isZhTW = locale === "zh-TW";

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-display font-bold mb-8">
        {isZhTW ? "隱私政策" : "Privacy Policy"}
      </h1>
      <p className="text-sm text-gray-500 mb-8">
        {isZhTW ? "最後更新：2026 年 3 月" : "Last updated: March 2026"}
      </p>

      <div className="prose prose-gray max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-3">
            {isZhTW ? "1. 資料收集" : "1. Information We Collect"}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {isZhTW
              ? "VicNail Studio 可能收集您在瀏覽網站時的使用數據，包括頁面瀏覽記錄、瀏覽器類型、裝置資訊及 IP 位址。我們使用 Google Analytics 和 Google AdSense 來分析網站流量並提供相關廣告。"
              : "VicNail Studio may collect usage data as you browse our website, including page views, browser type, device information, and IP address. We use Google Analytics and Google AdSense to analyze site traffic and serve relevant advertisements."}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">
            {isZhTW ? "2. Cookie 使用" : "2. Use of Cookies"}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {isZhTW
              ? "本網站使用 Cookie 和類似技術來改善使用者體驗。Google AdSense 使用 Cookie 根據您的瀏覽歷程顯示個人化廣告。您可以在瀏覽器設定中停用 Cookie，但這可能影響部分網站功能。"
              : "This website uses cookies and similar technologies to improve user experience. Google AdSense uses cookies to display personalized ads based on your browsing history. You may disable cookies in your browser settings, though this may affect some site functionality."}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">
            {isZhTW ? "3. 廣告" : "3. Advertising"}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {isZhTW
              ? "我們使用 Google AdSense 在網站上顯示廣告。Google 可能使用 Cookie 根據您之前造訪本網站或其他網站的紀錄向您顯示廣告。您可以前往 Google 廣告設定頁面選擇退出個人化廣告。"
              : "We use Google AdSense to display advertisements on our site. Google may use cookies to serve ads based on your prior visits to our website or other websites. You may opt out of personalized advertising by visiting Google's Ads Settings."}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">
            {isZhTW ? "4. 資料使用目的" : "4. How We Use Your Data"}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {isZhTW
              ? "收集的資料僅用於：改善網站內容與使用體驗、分析網站流量趨勢、提供與您興趣相關的廣告。我們不會將您的個人資料出售給第三方。"
              : "Collected data is used solely to: improve website content and user experience, analyze site traffic trends, and serve advertisements relevant to your interests. We do not sell your personal information to third parties."}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">
            {isZhTW ? "5. 聯絡我們" : "5. Contact Us"}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {isZhTW
              ? "如您對本隱私政策有任何疑問，歡迎透過電子郵件與我們聯繫："
              : "If you have any questions about this Privacy Policy, please contact us at:"}
          </p>
          <p className="mt-2">
            <a
              href="mailto:hello@vicnail-studio.com"
              className="text-nail-gold hover:underline"
            >
              hello@vicnail-studio.com
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}

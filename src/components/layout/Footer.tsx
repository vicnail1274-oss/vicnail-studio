import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Instagram, Facebook, Mail } from "lucide-react";

export function Footer({ locale }: { locale: string }) {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");

  return (
    <footer className="bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl font-display font-bold">VicNail</span>
              <span className="text-xl font-display font-light text-nail-gold">
                Studio
              </span>
            </div>
            <p className="text-sm text-gray-400 max-w-xs">
              {locale === "zh-TW"
                ? "美甲藝術與 AI 科技的跨界探索"
                : "Where nail artistry meets AI innovation"}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
              {t("quickLinks")}
            </h3>
            <ul className="space-y-2">
              {locale === "zh-TW" && (
                <li>
                  <Link
                    href="/courses"
                    className="text-sm text-gray-400 hover:text-nail-gold transition-colors"
                  >
                    {nav("courses")}
                  </Link>
                </li>
              )}
              <li>
                <Link
                  href="/nail/knowledge"
                  className="text-sm text-gray-400 hover:text-nail-gold transition-colors"
                >
                  {nav("nailKnowledge")}
                </Link>
              </li>
              <li>
                <Link
                  href="/nail/news"
                  className="text-sm text-gray-400 hover:text-nail-gold transition-colors"
                >
                  {nav("nailNews")}
                </Link>
              </li>
              <li>
                <Link
                  href="/ai"
                  className="text-sm text-gray-400 hover:text-ai-cyan transition-colors"
                >
                  {nav("ai")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
              {t("followUs")}
            </h3>
            <div className="flex gap-4">
              <a
                href="#"
                className="text-gray-400 hover:text-nail-gold transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-nail-gold transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a
                href="mailto:hello@vicnail-studio.com"
                className="text-gray-400 hover:text-nail-gold transition-colors"
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">{t("copyright")}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <Link
              href="/privacy"
              className="hover:text-gray-300 transition-colors"
            >
              {locale === "zh-TW" ? "隱私政策" : "Privacy Policy"}
            </Link>
            <a
              href="mailto:hello@vicnail-studio.com"
              className="hover:text-gray-300 transition-colors"
            >
              hello@vicnail-studio.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

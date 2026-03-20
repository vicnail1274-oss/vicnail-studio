import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Inter, Noto_Sans_TC, Playfair_Display } from "next/font/google";
import "../globals.css";
import { cn } from "@/lib/utils";
import Script from "next/script";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WebsiteJsonLd } from "@/components/seo/JsonLd";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const notoSansTC = Noto_Sans_TC({
  subsets: ["latin"],
  variable: "--font-noto",
  weight: ["300", "400", "500", "700"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: {
    default: "VicNail Studio — 美甲藝術 × AI 科技",
    template: "%s | VicNail Studio",
  },
  description:
    "Professional nail art education and AI technology insights. 專業美甲教學與 AI 科技分享。",
  metadataBase: new URL("https://vicnail-studio.com"),
  openGraph: {
    type: "website",
    siteName: "VicNail Studio",
    title: "VicNail Studio — 美甲藝術 × AI 科技",
    description: "專業美甲教學與 AI 自動化的跨界探索",
    locale: "zh_TW",
    url: "https://vicnail-studio.com",
    images: [
      {
        url: "/og-default.svg",
        width: 1200,
        height: 630,
        alt: "VicNail Studio — 美甲藝術 × AI 科技",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VicNail Studio",
    description: "專業美甲教學與 AI 自動化的跨界探索",
    images: ["/og-default.svg"],
  },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as typeof routing.locales[number])) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={cn(inter.variable, notoSansTC.variable, playfair.variable)}
      suppressHydrationWarning
    >
      <head>
        <WebsiteJsonLd />
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${process.env.NEXT_PUBLIC_GA_ID}');`}
            </Script>
          </>
        )}
        {process.env.NEXT_PUBLIC_ADSENSE_ID && (
          <Script
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_ID}`}
            strategy="afterInteractive"
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <NextIntlClientProvider messages={messages}>
          <Header locale={locale} />
          <main className="pt-16">{children}</main>
          <Footer locale={locale} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

import type { Article } from "@/lib/mdx";

// ── Nail Services + LocalBusiness JSON-LD ───────────────────────────────────

export function NailServicesJsonLd({
  locale,
  services,
  pageUrl = "https://vicnail-studio.com",
}: {
  locale: "zh-TW" | "en";
  services: { name: string; description: string; url: string }[];
  pageUrl?: string;
}) {
  const isZh = locale === "zh-TW";

  const localBusiness = {
    "@context": "https://schema.org",
    "@type": "NailSalon",
    name: "VicNail Studio",
    description: isZh
      ? "台北專業美甲工作室，提供凝膠指甲、日式彩繪、光療指甲、手足保養及美甲課程。"
      : "Professional nail salon in Taipei offering gel nails, Japanese nail art, gel polish, manicure & pedicure, and nail courses.",
    url: pageUrl,
    image: "https://vicnail-studio.com/og-default.svg",
    priceRange: "$$",
    currenciesAccepted: "TWD",
    paymentAccepted: "Cash, Line Pay",
    areaServed: {
      "@type": "City",
      name: isZh ? "台北市" : "Taipei",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: isZh ? "美甲服務項目" : "Nail Services",
      itemListElement: services.map((s, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: s.name,
            description: s.description,
            url: s.url,
            provider: {
              "@type": "LocalBusiness",
              name: "VicNail Studio",
            },
          },
        },
      })),
    },
    sameAs: ["https://www.instagram.com/vicnail_studio/"],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }}
    />
  );
}

export function ArticleJsonLd({ article, url }: { article: Article; url: string }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.date,
    author: {
      "@type": "Person",
      name: article.author || "Vic",
    },
    publisher: {
      "@type": "Organization",
      name: "VicNail Studio",
    },
    url,
    keywords: article.tags.join(", "),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function WebsiteJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "VicNail Studio",
    url: "https://vicnail-studio.com",
    description: "Professional nail art education & AI automation experiments",
    publisher: {
      "@type": "Organization",
      name: "VicNail Studio",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function BreadcrumbListJsonLd({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function ItemListJsonLd({
  name,
  description,
  items,
}: {
  name: string;
  description: string;
  items: { name: string; url: string; description: string; image?: string }[];
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    description,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: item.url,
      name: item.name,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

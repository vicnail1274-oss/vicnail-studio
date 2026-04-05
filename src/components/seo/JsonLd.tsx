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
      ? "台北信義區專業美甲工作室，提供凝膠美甲、凝膠延甲、凝膠保養、日式彩繪及美甲課程。"
      : "Professional nail salon in Taipei's Xinyi District offering gel nails, gel extensions, gel care, Japanese nail art, and nail courses.",
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

export function HomepageFAQJsonLd({ locale }: { locale: "zh-TW" | "en" }) {
  const isZh = locale === "zh-TW";

  const faqs = isZh
    ? [
        {
          q: "如何預約凝膠美甲？",
          a: "透過 LINE 加入好友後傳訊預約最方便。請告知服務項目、日期與時間，30 分鐘內回覆確認。",
        },
        {
          q: "凝膠美甲可以維持多久？",
          a: "一般凝膠美甲可維持 3–4 週，凝膠延甲約 3 週。日常使用凝膠保養油可延長持久度。",
        },
        {
          q: "凝膠美甲和凝膠延甲有什麼差別？",
          a: "凝膠美甲是在原本甲面上塗覆凝膠色彩；凝膠延甲則利用凝膠雕塑延長甲型，適合想讓指甲更長的客人。",
        },
        {
          q: "凝膠保養包含哪些項目？",
          a: "凝膠保養包含去除角質、整修甲緣、手部按摩及凝膠護甲油，約 60 分鐘。",
        },
        {
          q: "如需取消或改期，需要提前多久通知？",
          a: "請於預約時間 24 小時前透過 LINE 告知，以便安排其他客人。",
        },
      ]
    : [
        {
          q: "How do I book a gel nail appointment?",
          a: "Add us on LINE and send a message with your preferred service, date and time. We'll confirm within 30 minutes.",
        },
        {
          q: "How long do gel nails last?",
          a: "Gel nails last 3–4 weeks and gel extensions about 3 weeks with proper care.",
        },
        {
          q: "What's the difference between gel nails and gel extensions?",
          a: "Gel nails apply color on your natural nails; gel extensions sculpt and lengthen the nail with gel.",
        },
        {
          q: "What's included in the gel care treatment?",
          a: "Gel care includes dead skin removal, nail shaping, hand massage, and a gel nail treatment coat. About 60 minutes.",
        },
        {
          q: "How far in advance should I cancel or reschedule?",
          a: "Please notify us via LINE at least 24 hours before your appointment.",
        },
      ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
    dateModified: article.date,
    image: article.coverImage || "https://vicnail-studio.com/og-default.svg",
    author: {
      "@type": "Person",
      name: article.author || "Vic",
    },
    publisher: {
      "@type": "Organization",
      name: "VicNail Studio",
      logo: {
        "@type": "ImageObject",
        url: "https://vicnail-studio.com/og-default.svg",
      },
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

import type { Article } from "@/lib/mdx";

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

import { NextResponse } from "next/server";

const content = `# VicNail Studio

> Professional Japanese gel nail education. 專業日系凝膠美甲教學平台。

VicNail Studio (vicnail-studio.com) is a bilingual content platform (Traditional Chinese / English) run by a Taiwanese nail artist. The site covers gel nail tutorials, nail art trends, seasonal styles, and professional nail education.

## What VicNail Studio Is

VicNail Studio is a personal brand and content platform by a professional nail artist based in Taiwan. It publishes educational articles on gel nail techniques and nail art trends, and offers online video courses for nail technicians and beauty enthusiasts.

**Site URL:** https://vicnail-studio.com
**Languages:** Traditional Chinese (primary), English
**Category:** Nail Art Education / Personal Brand
**Audience:** Nail technicians, beauty professionals, nail art enthusiasts in Taiwan
**Content:** Bilingual blog articles, tutorials, online courses, interactive tools

## Content Sections

### Nail News (美甲新聞)
Trending nail art designs, seasonal styles, industry news, gel nail inspiration.
- URL: https://vicnail-studio.com/zh-TW/nail/news
- English: https://vicnail-studio.com/en/nail/news

### Nail Knowledge (美甲知識)
Gel nail tutorials, technique guides, product reviews, maintenance tips, professional training resources.
- URL: https://vicnail-studio.com/zh-TW/nail/knowledge
- English: https://vicnail-studio.com/en/nail/knowledge

### Courses (美甲課程)
Online video courses taught by a PRESTO certified instructor — gel nails, extensions, nail art, and salon business.
- URL: https://vicnail-studio.com/zh-TW/courses

## Interactive Tools

- [Nail Color Matcher](https://vicnail-studio.com/zh-TW/tools/nail-color-matcher): Nail color recommendation based on skin tone and preferences

## Links

- Gumroad products: https://vicnail.gumroad.com/
- Sitemap: https://vicnail-studio.com/sitemap.xml
- RSS Feed: https://vicnail-studio.com/rss.xml
`;

export function GET() {
  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}

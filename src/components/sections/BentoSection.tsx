"use client";

import { useTranslations, useLocale } from "next-intl";
import { BentoGrid, BentoCard } from "@/components/magicui/BentoGrid";
import { Palette, BookOpen, Newspaper, Bot } from "lucide-react";

export function BentoSection() {
  const t = useTranslations("sections");
  const locale = useLocale();

  const items = [
    ...(locale === "zh-TW"
      ? [
          {
            title: t("courses"),
            description: t("coursesDesc"),
            href: "/courses",
            icon: <Palette />,
            dark: false,
            className: "md:col-span-2 lg:col-span-1",
          },
        ]
      : []),
    {
      title: t("knowledge"),
      description: t("knowledgeDesc"),
      href: "/nail/knowledge",
      icon: <BookOpen />,
      dark: false,
      className: "",
    },
    {
      title: t("news"),
      description: t("newsDesc"),
      href: "/nail/news",
      icon: <Newspaper />,
      dark: false,
      className: "",
    },
    {
      title: t("ai"),
      description: t("aiDesc"),
      href: "/ai",
      icon: <Bot />,
      dark: true,
      className: locale === "zh-TW" ? "md:col-span-2 lg:col-span-3" : "md:col-span-2 lg:col-span-1",
    },
  ];

  return (
    <section className="py-20 px-4">
      <BentoGrid>
        {items.map((item) => (
          <BentoCard key={item.href} {...item} />
        ))}
      </BentoGrid>
    </section>
  );
}

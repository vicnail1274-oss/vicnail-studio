"use client";

import { Spotlight } from "@/components/aceternity/Spotlight";
import { TextGenerateEffect } from "@/components/aceternity/TextGenerateEffect";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  const t = useTranslations("hero");

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-nail-cream via-white to-white">
      {/* Spotlight effect */}
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="#B76E79"
      />

      {/* Decorative gradient orbs */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-nail-pink/40 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-ai-purple/10 rounded-full blur-3xl" />

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <TextGenerateEffect
          words={t("title")}
          className="text-5xl md:text-7xl lg:text-8xl font-display tracking-tight text-foreground"
        />

        <p className="mt-6 text-xl md:text-2xl font-display font-light text-nail-gold animate-fade-up">
          {t("subtitle")}
        </p>

        <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto animate-fade-up">
          {t("description")}
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-fade-up">
          <Button
            asChild
            size="lg"
            className="bg-nail-gold hover:bg-nail-gold/90 text-white rounded-full px-8 text-base"
          >
            <Link href="/courses">{t("ctaCourses")}</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-ai-purple/30 text-ai-purple hover:bg-ai-purple/5 rounded-full px-8 text-base"
          >
            <Link href="/ai">{t("ctaAi")}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

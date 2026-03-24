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

        {/* Trust badges */}
        <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground animate-fade-up">
          <span className="flex items-center gap-1">
            <span className="text-yellow-400">★★★★★</span>
            <span>{t("trustReviews")}</span>
          </span>
          <span className="hidden sm:block text-nail-gold/40">|</span>
          <span>{t("trustCertified")}</span>
          <span className="hidden sm:block text-nail-gold/40">|</span>
          <span>{t("trustLocation")}</span>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center animate-fade-up">
          {/* Primary CTA: Book now via LINE */}
          <Button
            asChild
            size="lg"
            className="bg-nail-gold hover:bg-nail-gold/90 text-white rounded-full px-8 text-base font-semibold shadow-lg shadow-nail-gold/20"
          >
            <a href="https://lin.ee/vicnail" target="_blank" rel="noopener noreferrer">
              {t("ctaBook")}
            </a>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-nail-gold/30 text-nail-gold hover:bg-nail-pink/30 rounded-full px-8 text-base"
          >
            <Link href="/services">{t("ctaServices")}</Link>
          </Button>
        </div>

        {/* Secondary links */}
        <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center text-sm animate-fade-up">
          <Link href="/courses" className="text-muted-foreground hover:text-nail-gold transition-colors underline underline-offset-4">
            {t("ctaCourses")}
          </Link>
          <span className="hidden sm:block text-nail-gold/40">·</span>
          <Link href="/ai" className="text-muted-foreground hover:text-ai-purple transition-colors underline underline-offset-4">
            {t("ctaAi")}
          </Link>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function FounderSection() {
  const t = useTranslations("founder");

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-white to-nail-cream/50">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row items-center gap-10"
        >
          {/* Avatar placeholder */}
          <div className="flex-shrink-0">
            <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-nail-gold/20 to-nail-pink/40 flex items-center justify-center border border-nail-gold/20">
              <span className="text-6xl font-display text-nail-gold">V</span>
            </div>
          </div>

          {/* Text */}
          <div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              {t("title")}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              {t("description")}
            </p>
            <Button
              asChild
              variant="outline"
              className="border-nail-gold/30 text-nail-gold hover:bg-nail-gold/5 rounded-full"
            >
              <Link href="/about">{t("cta")}</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

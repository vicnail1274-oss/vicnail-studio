import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

interface Credential {
  zh: string;
  en: string;
}

const CREDENTIALS: Credential[] = [
  {
    zh: "JNA 日本美甲師協會 衛生士合格",
    en: "JNA Japan Nailist Association — Certified Hygienist",
  },
  {
    zh: "JNEC 三級日本美甲師檢定合格",
    en: "JNEC Level 3 Japanese Nailist Certification",
  },
  {
    zh: "OMC 美容美髮世界組織 國際評審",
    en: "OMC Hairworld — International Judge",
  },
  {
    zh: "PRESTO 台灣區認證講師",
    en: "PRESTO Taiwan Certified Educator",
  },
];

export function CertificationSection({ locale }: { locale: string }) {
  const isZh = locale === "zh-TW";

  return (
    <section className="py-20 bg-nail-cream/40">
      <div className="max-w-5xl mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-nail-gold uppercase tracking-widest mb-2">
            {isZh ? "檢定考照" : "Certification"}
          </p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            {isZh ? "日本美甲檢定考照輔導" : "Japanese Nail Certification Coaching"}
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {isZh
              ? "由具備日本檢定資歷與國際評審經驗的 Vic 親自輔導，從技術到應考一步步陪你拿下專業證照。"
              : "Guided personally by Vic — a certified Japanese nailist and international competition judge — from technique to exam day, step by step toward your professional credential."}
          </p>
        </div>

        {/* Credential highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {CREDENTIALS.map((c) => (
            <div
              key={c.zh}
              className="flex items-start gap-3 bg-white rounded-2xl p-5 border border-nail-pink/30"
            >
              <span className="text-nail-gold text-lg leading-none mt-0.5">◆</span>
              <p className="text-sm text-foreground font-medium leading-relaxed">
                {isZh ? c.zh : c.en}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button
            asChild
            size="lg"
            className="bg-nail-gold hover:bg-nail-gold/90 text-white rounded-full px-8"
          >
            <Link href="/certification">
              {isZh ? "了解檢定考照" : "Explore Certification"}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

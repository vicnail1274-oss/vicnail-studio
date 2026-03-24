import { Award, Shield, Heart, Palette } from "lucide-react";

const REASONS_ZH = [
  {
    icon: Award,
    title: "專業認證美甲師",
    description: "持有日本 JNA、JNE 認證，定期赴日進修最新技術。",
  },
  {
    icon: Palette,
    title: "日本頂級材料",
    description: "全面採用日本進口凝膠與材料，持色更久、更健康。",
  },
  {
    icon: Shield,
    title: "衛生安全保證",
    description: "所有工具一客一消毒，嚴格執行衛生標準，讓你安心變美。",
  },
  {
    icon: Heart,
    title: "一對一細心服務",
    description: "採預約制，每次只服務一位客人，享受專屬的美甲時光。",
  },
];

const REASONS_EN = [
  {
    icon: Award,
    title: "Certified Nail Artists",
    description:
      "JNA & JNE certified professionals with regular training in Japan.",
  },
  {
    icon: Palette,
    title: "Premium Japanese Products",
    description:
      "100% imported Japanese gels and materials for lasting, healthy results.",
  },
  {
    icon: Shield,
    title: "Hygiene Guaranteed",
    description:
      "All tools sterilized per client. Strict hygiene standards, always.",
  },
  {
    icon: Heart,
    title: "One-on-One Service",
    description:
      "Appointment-only, one client at a time — your private nail session.",
  },
];

export function WhyChooseUs({ isZh }: { isZh: boolean }) {
  const reasons = isZh ? REASONS_ZH : REASONS_EN;

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-3">
            {isZh ? "為什麼選擇 VicNail Studio？" : "Why Choose VicNail Studio?"}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {isZh
              ? "我們用專業與熱情，為每一位客人打造獨一無二的指尖體驗。"
              : "We combine expertise and passion to create a unique nail experience for every client."}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {reasons.map((reason, i) => (
            <div
              key={i}
              className="text-center p-6 rounded-2xl border border-nail-pink/20 hover:border-nail-gold/30 hover:shadow-md transition-all duration-200"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-nail-cream mb-4">
                <reason.icon className="w-6 h-6 text-nail-gold" />
              </div>
              <h3 className="text-base font-bold text-foreground mb-2">
                {reason.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {reason.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

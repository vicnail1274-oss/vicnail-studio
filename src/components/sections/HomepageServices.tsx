"use client";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

interface Service {
  emoji: string;
  nameZh: string;
  nameEn: string;
  descZh: string;
  descEn: string;
  price: string;
  duration: string;
}

const SERVICES: Service[] = [
  {
    emoji: "💅",
    nameZh: "凝膠美甲",
    nameEn: "Gel Nails",
    descZh: "日式凝膠，持色持久、不傷甲面。提供多款色系與造型，打造專屬妳的指尖風格。",
    descEn: "Japanese gel nails — long-lasting color, gentle on nails. Wide color selection for your unique style.",
    price: "NT$800 起",
    duration: "約 90 分鐘",
  },
  {
    emoji: "✨",
    nameZh: "凝膠延甲",
    nameEn: "Gel Extensions",
    descZh: "以凝膠雕塑延伸甲型，自然貼合、強韌耐用。適合喜歡長指甲效果的你。",
    descEn: "Sculpted gel extensions — natural-looking, strong and durable. Perfect for those who love longer nails.",
    price: "NT$1,500 起",
    duration: "約 120 分鐘",
  },
  {
    emoji: "🌸",
    nameZh: "凝膠保養",
    nameEn: "Gel Care",
    descZh: "含角質護理、手部按摩與凝膠滋養，讓雙手在忙碌生活中也能保持柔嫩光澤。",
    descEn: "Cuticle care, hand massage, and gel nourishment to keep your hands soft and radiant.",
    price: "NT$600 起",
    duration: "約 60 分鐘",
  },
];

export function HomepageServices({ locale }: { locale: string }) {
  const isZh = locale === "zh-TW";

  return (
    <section className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-nail-gold uppercase tracking-widest mb-2">
            {isZh ? "服務項目" : "Services"}
          </p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            {isZh ? "專業凝膠指甲服務" : "Professional Gel Nail Services"}
          </h2>
          <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
            {isZh
              ? "台北信義區專業美甲工作室，嚴選日本品牌凝膠，讓您的指尖煥發光彩。"
              : "Nail studio in Taipei's Xinyi District. Premium Japanese gel brands for stunning nails."}
          </p>
        </div>

        {/* Service cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SERVICES.map((service) => (
            <div
              key={service.nameZh}
              className="group relative bg-nail-cream/50 rounded-2xl p-6 border border-nail-pink/40 hover:border-nail-gold/50 hover:shadow-lg transition-all duration-300"
            >
              <div className="text-4xl mb-4">{service.emoji}</div>
              <h3 className="text-xl font-display font-semibold text-foreground mb-1">
                {isZh ? service.nameZh : service.nameEn}
              </h3>
              <div className="flex items-center gap-3 mb-3 text-sm text-muted-foreground">
                <span className="font-medium text-nail-gold">{service.price}</span>
                <span>·</span>
                <span>{service.duration}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {isZh ? service.descZh : service.descEn}
              </p>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            asChild
            size="lg"
            className="bg-nail-gold hover:bg-nail-gold/90 text-white rounded-full px-8"
          >
            <a href="https://lin.ee/vicnail" target="_blank" rel="noopener noreferrer">
              {isZh ? "LINE 立即預約" : "Book via LINE"}
            </a>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-nail-gold/30 text-nail-gold hover:bg-nail-pink/30 rounded-full px-8"
          >
            <Link href="/services">
              {isZh ? "查看全部服務" : "View All Services"}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

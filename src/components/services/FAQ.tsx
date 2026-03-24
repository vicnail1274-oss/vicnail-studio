"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FAQItem {
  q: string;
  a: string;
}

const FAQ_ZH: FAQItem[] = [
  {
    q: "需要事先預約嗎？",
    a: "是的，VicNail Studio 採全預約制，請透過 LINE 或 Instagram 私訊預約。建議至少提前 2–3 天預約，以確保您心儀的時段。",
  },
  {
    q: "凝膠美甲可以維持多久？",
    a: "使用日本頂級凝膠品牌，一般可維持 3–4 週。持久度也會依個人生活習慣而有些微差異，我們會在服務後提供完整的保養建議。",
  },
  {
    q: "第一次做美甲需要注意什麼？",
    a: "建議預約前不要自行修剪指甲或指緣，讓美甲師為您做最適合的處理。服務前 24 小時避免手部去角質，以減少敏感反應。",
  },
  {
    q: "可以自己帶圖片指定款式嗎？",
    a: "當然可以！歡迎攜帶參考圖片，我們的美甲師會根據您的需求進行溝通與調整，為您打造最合適的設計。",
  },
  {
    q: "孕婦可以做美甲嗎？",
    a: "建議孕期前三個月避免美甲服務。三個月後若身體狀況穩定，可選擇通風良好的環境進行無味凝膠美甲。請事先告知美甲師您的身體狀況。",
  },
  {
    q: "付款方式有哪些？",
    a: "我們接受現金與 LINE Pay 付款。",
  },
];

const FAQ_EN: FAQItem[] = [
  {
    q: "Do I need to make an appointment?",
    a: "Yes, VicNail Studio is appointment-only. Please book via LINE or Instagram DM. We recommend booking 2–3 days in advance to secure your preferred time.",
  },
  {
    q: "How long does gel nail art last?",
    a: "With our premium Japanese gel brands, nails typically last 3–4 weeks. Longevity may vary slightly based on lifestyle. We provide full aftercare advice.",
  },
  {
    q: "What should I know before my first visit?",
    a: "Please don't trim your nails or cuticles before your appointment — let our artist handle it. Avoid hand exfoliation 24 hours prior to minimize sensitivity.",
  },
  {
    q: "Can I bring reference photos?",
    a: "Absolutely! Feel free to bring inspiration photos. Our artist will discuss and customize the design to suit your style and nail shape.",
  },
  {
    q: "Is it safe during pregnancy?",
    a: "We recommend avoiding nail services during the first trimester. After that, odorless gel options are available if your doctor approves. Please inform us in advance.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept cash and LINE Pay.",
  },
];

function FAQAccordion({ item }: { item: FAQItem }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-nail-pink/20 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left group"
      >
        <span className="text-sm font-medium text-foreground pr-4 group-hover:text-nail-gold transition-colors">
          {item.q}
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform duration-200",
            open && "rotate-180 text-nail-gold"
          )}
        />
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-300",
          open ? "max-h-40 opacity-100 pb-4" : "max-h-0 opacity-0"
        )}
      >
        <p className="text-sm text-muted-foreground leading-relaxed pl-0">
          {item.a}
        </p>
      </div>
    </div>
  );
}

export function FAQ({ isZh }: { isZh: boolean }) {
  const items = isZh ? FAQ_ZH : FAQ_EN;

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-3">
            {isZh ? "常見問題" : "Frequently Asked Questions"}
          </h2>
          <p className="text-muted-foreground">
            {isZh
              ? "預約前最常被問到的問題，這裡一次幫您解答。"
              : "Everything you need to know before booking your appointment."}
          </p>
        </div>

        <div className="bg-nail-cream/30 rounded-2xl border border-nail-pink/20 px-6">
          {items.map((item, i) => (
            <FAQAccordion key={i} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

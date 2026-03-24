"use client";

import { useState } from "react";

interface FAQItem {
  questionZh: string;
  questionEn: string;
  answerZh: string;
  answerEn: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    questionZh: "如何預約凝膠美甲？",
    questionEn: "How do I book a gel nail appointment?",
    answerZh:
      "透過 LINE 加入好友後傳訊預約最方便。請告知希望的服務項目（凝膠美甲／凝膠延甲／凝膠保養）、日期與時間，我會在 30 分鐘內回覆確認。",
    answerEn:
      "The easiest way is to add us on LINE and send a message. Let us know the service you want (gel nails / gel extensions / gel care), your preferred date and time, and we'll confirm within 30 minutes.",
  },
  {
    questionZh: "凝膠美甲可以維持多久？",
    questionEn: "How long do gel nails last?",
    answerZh:
      "一般凝膠美甲在正常保養下可以維持 3–4 週，凝膠延甲約 3 週。日常使用凝膠保養油、避免指甲受力，可延長持久度。",
    answerEn:
      "Gel nails typically last 3–4 weeks with proper care, and gel extensions about 3 weeks. Using cuticle oil daily and avoiding stress on nails can extend longevity.",
  },
  {
    questionZh: "凝膠美甲和凝膠延甲有什麼差別？",
    questionEn: "What's the difference between gel nails and gel extensions?",
    answerZh:
      "凝膠美甲是在原本甲面上塗覆凝膠色彩，適合有一定長度的自然甲。凝膠延甲則利用凝膠雕塑延長甲型，適合想讓指甲更長或修飾甲型的客人。",
    answerEn:
      "Gel nails apply gel color on top of your natural nails, ideal if you have decent length. Gel extensions sculpt and lengthen the nail using gel, perfect if you want longer nails or to reshape your nail form.",
  },
  {
    questionZh: "凝膠保養包含哪些項目？",
    questionEn: "What's included in the gel care treatment?",
    answerZh:
      "凝膠保養包含：去除老廢角質、整修甲緣、手部滋潤按摩、塗覆凝膠護甲油。整個療程約 60 分鐘，讓雙手更柔嫩有光澤。",
    answerEn:
      "Gel care includes: dead skin removal, nail shaping, moisturizing hand massage, and a gel nail treatment coat. The full treatment takes about 60 minutes for softer, more radiant hands.",
  },
  {
    questionZh: "如需取消或改期，需要提前多久通知？",
    questionEn: "How far in advance should I notify you to cancel or reschedule?",
    answerZh:
      "請於預約時間 24 小時前透過 LINE 告知，以便安排其他客人。若臨時無法到場，請盡早通知，感謝您的配合！",
    answerEn:
      "Please notify us via LINE at least 24 hours before your appointment so we can accommodate other clients. If something comes up last minute, please let us know as early as possible. Thank you!",
  },
];

export function FAQSection({ locale }: { locale: string }) {
  const isZh = locale === "zh-TW";
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20 bg-nail-cream/20">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-nail-gold uppercase tracking-widest mb-2">
            {isZh ? "常見問題" : "FAQ"}
          </p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            {isZh ? "預約前您想知道的" : "Everything You Want to Know"}
          </h2>
        </div>

        {/* FAQ accordion */}
        <div className="space-y-3">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-white rounded-xl border border-nail-pink/30 overflow-hidden"
              >
                <button
                  className="w-full text-left flex items-center justify-between px-5 py-4 gap-4 hover:bg-nail-cream/30 transition-colors"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                >
                  <span className="font-medium text-foreground text-sm md:text-base">
                    {isZh ? item.questionZh : item.questionEn}
                  </span>
                  <span
                    className={`flex-shrink-0 text-nail-gold transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-nail-pink/20 pt-3">
                    {isZh ? item.answerZh : item.answerEn}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* CTA at bottom */}
        <div className="mt-10 text-center">
          <p className="text-muted-foreground text-sm mb-4">
            {isZh ? "還有其他問題嗎？直接 LINE 我們！" : "Still have questions? Just ask us on LINE!"}
          </p>
          <a
            href="https://lin.ee/vicnail"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-white bg-[#06C755] hover:bg-[#05a847] rounded-full px-6 py-2.5 transition-colors"
          >
            {isZh ? "LINE 聯絡我們" : "Contact via LINE"}
          </a>
        </div>
      </div>
    </section>
  );
}

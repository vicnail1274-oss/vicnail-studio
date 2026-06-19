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
    questionZh: "完全零基礎可以學嗎？",
    questionEn: "Can I learn with zero experience?",
    answerZh:
      "可以！我們的課程專為零基礎設計，從持工具、手部結構到上色、延甲一步步帶。Vic 老師手把手教學、進度依個人調整，承諾教到你真正學會為止。",
    answerEn:
      "Absolutely! Our courses are built for complete beginners — we start from holding the tools and nail anatomy, then walk you step by step through color application and extensions. Vic teaches hands-on, paces each student individually, and commits to teaching until you've truly mastered it.",
  },
  {
    questionZh: "怎麼報名上課？",
    questionEn: "How do I sign up for a course?",
    answerZh:
      "透過 LINE 加入好友後傳訊諮詢最方便。告訴我們你想學的方向（凝膠美甲／凝膠延甲／彩繪）與目前程度，我會在 30 分鐘內回覆，協助你安排適合的課程與上課時間。",
    answerEn:
      "The easiest way is to add us on LINE and send a message. Tell us what you'd like to learn (gel nails / gel extensions / nail art) and your current level — we'll reply within 30 minutes and help you arrange the right course and class schedule.",
  },
  {
    questionZh: "課程可以無限複習、跟課嗎？",
    questionEn: "Can I review and re-attend classes without limit?",
    answerZh:
      "可以！結業後仍可無限次免費回來跟課複習，遇到瓶頸或想精進都歡迎再來。我們在意的是你真的學會、做得出來，而不是上完幾堂課就結束。",
    answerEn:
      "Yes! After completing your course you're welcome to come back and re-attend classes for free, as many times as you need — whether you hit a wall or just want to sharpen your skills. We care that you can truly do it, not just that you finished a set number of lessons.",
  },
  {
    questionZh: "有教 JNEC 日本美甲檢定考照嗎？",
    questionEn: "Do you offer JNEC Japanese nail certification prep?",
    answerZh:
      "有！我們提供 JNEC 日本美甲檢定的考照輔導，針對檢定項目與評分標準逐項練習，從手法到應試細節全程指導，協助你穩穩拿證照。",
    answerEn:
      "Yes! We offer prep for the JNEC Japanese nail certification, practicing each exam component against the official scoring criteria. From technique to test-day details, we guide you all the way to passing with confidence.",
  },
  {
    questionZh: "上課地點與時間？",
    questionEn: "Where and when are the classes?",
    answerZh:
      "上課地點在新北市板橋區（捷運亞東醫院站步行約 5 分鐘）。採預約諮詢制，上課時間可依你的需求彈性安排，請先透過 LINE 與我們約定。",
    answerEn:
      "Classes are held in Banqiao District, New Taipei City (about a 5-minute walk from Yadong Hospital MRT Station). We run by appointment, and class times can be arranged flexibly around your schedule — just reach out on LINE to set it up.",
  },
  {
    questionZh: "學完可以開店、接案接單嗎？",
    questionEn: "Can I open a studio or take clients after the course?",
    answerZh:
      "可以！課程以實戰接單為目標，除了紮實技術，也會分享開店與接案的實務經驗。學會後你就具備獨立接單、經營個人工作室的能力，許多學員結業後都已開始接客。",
    answerEn:
      "Yes! The course is built around real-world readiness — alongside solid technique, we share practical experience on opening a studio and taking clients. Once you've mastered the skills you'll be ready to take bookings and run your own studio, and many graduates are already serving clients.",
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
            {isZh ? "報名上課前想知道的" : "Everything You Want to Know Before Enrolling"}
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
            {isZh ? "還有其他關於課程的問題嗎？直接 LINE 我們！" : "Still have questions about the courses? Just ask us on LINE!"}
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

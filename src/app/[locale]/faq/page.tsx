import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { ChevronDown, Mail, MessageCircle, Truck, CreditCard, RefreshCw, Package } from "lucide-react";

export const metadata: Metadata = {
  title: "常見問題 FAQ",
  description: "關於訂購、付款、運送、退換貨等常見問題",
  openGraph: {
    title: "常見問題 | VicNail Studio",
    description: "關於訂購、付款、運送、退換貨等常見問題",
  },
};

type FaqItem = { q: string; a: string };
type FaqSection = {
  title: string;
  icon: typeof Truck;
  items: FaqItem[];
};

const SECTIONS: FaqSection[] = [
  {
    title: "訂購與付款",
    icon: CreditCard,
    items: [
      {
        q: "可以用哪些付款方式？",
        a: "我們支援信用卡（Visa / Master / JCB）、ATM 虛擬帳號轉帳、超商代碼繳費三種。所有金流由綠界 ECPay 處理，個資全程加密傳輸。",
      },
      {
        q: "需要註冊帳號才能下單嗎？",
        a: "不需要。訪客也可以直接下單購物，填寫姓名、電話和 Email 即可。若您有帳號，下單後系統會自動把訂單掛到您的帳號下方便追蹤。",
      },
      {
        q: "ATM 轉帳的期限是多久？",
        a: "ATM 虛擬帳號建立後 3 天內需完成轉帳，逾期系統會自動取消訂單。超商代碼則為 7 天。信用卡則是即時扣款。",
      },
      {
        q: "下單後可以修改訂單內容嗎？",
        a: "已付款的訂單無法直接修改，請透過 LINE 官方帳號聯繫客服，我們會協助處理。",
      },
    ],
  },
  {
    title: "運送與物流",
    icon: Truck,
    items: [
      {
        q: "運費怎麼算？",
        a: "超商取貨（7-11 / 全家 / 萊爾富）運費 65 元、黑貓宅急便 120 元、順豐速運 180 元。單筆訂單滿 NT$ 1,500 即享免運，自取免運。",
      },
      {
        q: "什麼時候會出貨？",
        a: "現貨商品付款完成後 1-3 個工作天內出貨。預購 / 代購商品依商品頁標示的預計到貨時間為準。",
      },
      {
        q: "出貨後多久會收到？",
        a: "超商取貨 2-3 天到店、黑貓宅配 1-2 天到府、順豐 1-3 天到府。偏遠地區可能會多 1-2 天。",
      },
      {
        q: "可以追蹤物流進度嗎？",
        a: "出貨後我們會透過 Email 寄送物流追蹤碼，您也可以到「我的訂單」頁面查看即時進度。",
      },
    ],
  },
  {
    title: "退換貨",
    icon: RefreshCw,
    items: [
      {
        q: "商品可以退換貨嗎？",
        a: "依消費者保護法，您有商品到貨後 7 天的鑑賞期（非試用期）。商品必須保持全新、未拆封、完整包裝，才可申請退貨。",
      },
      {
        q: "哪些商品不能退換？",
        a: "為了衛生考量，已拆封的美甲用品（如卸甲水、底膠、彩膠等液體類）無法退換。預購 / 代購商品如有品質問題可退換，但不接受七天鑑賞。",
      },
      {
        q: "退貨運費由誰負擔？",
        a: "若為商品瑕疵或寄送錯誤，運費由我們負擔。若為個人因素退貨（如不喜歡、尺寸不對），來回運費由買家負擔。",
      },
      {
        q: "退款要多久才會收到？",
        a: "我們收到退貨並確認商品狀態後，會在 3-5 個工作天內原路退款。信用卡退款實際入帳時間依發卡銀行而定，通常 7-14 天。",
      },
    ],
  },
  {
    title: "商品與庫存",
    icon: Package,
    items: [
      {
        q: "商品顏色跟照片有色差怎麼辦？",
        a: "我們盡可能在自然光下拍攝商品，但螢幕色差與光線仍可能造成些微差異。若收到後有明顯色差，請在 7 天內聯繫我們協助處理。",
      },
      {
        q: "缺貨商品什麼時候會補？",
        a: "商品頁若顯示已售完，可以點「補貨後通知我」留下 Email，補貨後系統會自動寄通知給您。",
      },
      {
        q: "什麼是預購 / 代購商品？",
        a: "預購商品會在指定截止日期前統一下單，到貨後依訂購順序出貨。代購商品則是從海外代為採買，到貨時間依產地物流而定。",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <section className="py-16 px-4 bg-gradient-to-b from-nail-cream to-white min-h-[70vh]">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
            常見問題
          </h1>
          <p className="text-muted-foreground">
            找不到答案？歡迎透過 LINE 或 Email 聯繫我們
          </p>
        </div>

        <div className="space-y-8">
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.title}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-full bg-nail-gold/10 flex items-center justify-center">
                    <Icon size={20} className="text-nail-gold" />
                  </div>
                  <h2 className="text-xl font-display font-bold text-foreground">
                    {section.title}
                  </h2>
                </div>
                <div className="space-y-2">
                  {section.items.map((item, i) => (
                    <details
                      key={i}
                      className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                    >
                      <summary className="flex items-center justify-between p-5 cursor-pointer list-none hover:bg-gray-50 transition-colors">
                        <span className="font-semibold text-foreground pr-4">
                          Q. {item.q}
                        </span>
                        <ChevronDown
                          size={20}
                          className="text-muted-foreground flex-shrink-0 group-open:rotate-180 transition-transform"
                        />
                      </summary>
                      <div className="px-5 pb-5 pt-0 text-muted-foreground leading-relaxed border-t border-gray-50">
                        <p className="pt-3">{item.a}</p>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* 聯絡 CTA */}
        <div className="mt-12 p-6 md:p-8 bg-gradient-to-br from-nail-gold/5 to-pink-50 rounded-2xl border border-nail-gold/20 text-center">
          <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-2">
            還有其他問題？
          </h2>
          <p className="text-muted-foreground mb-5">
            我們很樂意為您解答，歡迎直接聯繫
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={process.env.NEXT_PUBLIC_LINE_URL || "https://line.me/R/ti/p/@vicnail"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#06C755] text-white rounded-xl font-semibold hover:bg-[#05a847] transition-colors"
            >
              <MessageCircle size={18} /> LINE 官方帳號
            </a>
            <Link
              href="/about"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 text-foreground rounded-xl font-semibold hover:border-nail-gold hover:text-nail-gold transition-colors"
            >
              <Mail size={18} /> Email 聯繫
            </Link>
          </div>
        </div>
      </div>

      {/* FAQ Schema.org JSON-LD（SEO） */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: SECTIONS.flatMap((s) =>
              s.items.map((item) => ({
                "@type": "Question",
                name: item.q,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: item.a,
                },
              }))
            ),
          }),
        }}
      />
    </section>
  );
}

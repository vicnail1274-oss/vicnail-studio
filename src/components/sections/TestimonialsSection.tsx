const REVIEWS = [
  {
    name: "Emily C.",
    avatar: "E",
    rating: 5,
    textZh: "完全零基礎報名，從沒拿過工具到現在能獨立完成凝膠美甲。Vic 老師教得超細，每個步驟都顧到，還能無限複習，真的學到紮實技術！",
    textEn: "I enrolled with zero experience — from never holding a tool to now completing a full gel set on my own. Vic teaches in incredible detail and covers every step, plus unlimited review. I really learned solid skills!",
    date: "2025-12",
  },
  {
    name: "Jessica L.",
    avatar: "J",
    rating: 5,
    textZh: "本來只是興趣，學完延甲課程後居然開始接單了！老師把甲型、結構講得很清楚，現在客人都稱讚我做的延甲自然又耐用。",
    textEn: "I started just as a hobby, but after the extensions course I'm actually taking clients now! Vic explained nail shape and structure so clearly — my clients love how natural and durable my extensions are.",
    date: "2026-01",
  },
  {
    name: "Mandy W.",
    avatar: "M",
    rating: 5,
    textZh: "跟著老師考過了 JNEC 日本檢定！考照輔導非常到位，每個評分細節都帶我練到熟，應試一點都不緊張，順利拿到證照。",
    textEn: "I passed the JNEC Japanese certification with Vic's guidance! The exam prep was thorough — she drilled every scoring detail until I was confident. I wasn't nervous on test day and got certified smoothly.",
    date: "2026-01",
  },
  {
    name: "Amy H.",
    avatar: "A",
    rating: 5,
    textZh: "結業後成功開了自己的工作室！除了技術，老師也分享很多開店與接案經驗，讓我少走很多冤枉路。遇到問題回來跟課還是很熱心解答。",
    textEn: "After graduating I opened my own studio! Beyond technique, Vic shared so much about running a studio and taking clients — it saved me from countless mistakes. Whenever I come back to re-attend, she's always happy to help.",
    date: "2026-02",
  },
  {
    name: "Claire T.",
    avatar: "C",
    rating: 5,
    textZh: "上過很多課，Vic 老師是教最細的一位。進度依我的程度調整，不會的地方一遍遍帶到會為止，還能無限複習，真心推薦給想認真學的人！",
    textEn: "I've taken many classes, and Vic teaches with the most detail by far. She paces to my level and walks me through tricky parts again and again until I get it — plus unlimited review. Highly recommend for anyone serious about learning!",
    date: "2026-03",
  },
];

export function TestimonialsSection({ locale }: { locale: string }) {
  const isZh = locale === "zh-TW";

  return (
    <section className="py-20 bg-nail-cream/30">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-nail-gold uppercase tracking-widest mb-2">
            {isZh ? "學員見證" : "Student Stories"}
          </p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            {isZh ? "學員真實回饋" : "What Our Students Say"}
          </h2>
          <div className="mt-3 flex items-center justify-center gap-2">
            <span className="text-yellow-400 text-lg">★★★★★</span>
            <span className="text-muted-foreground text-sm">
              {isZh ? "5.0 · 50+ 位結業學員好評" : "5.0 · 50+ Graduate Reviews"}
            </span>
          </div>
        </div>

        {/* Review cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {REVIEWS.map((review) => (
            <div
              key={review.name}
              className="bg-white rounded-2xl p-5 border border-nail-pink/30 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-nail-gold/20 flex items-center justify-center text-nail-gold font-semibold text-sm">
                  {review.avatar}
                </div>
                <div>
                  <p className="font-medium text-sm text-foreground">{review.name}</p>
                  <p className="text-xs text-muted-foreground">{review.date}</p>
                </div>
                <div className="ml-auto text-yellow-400 text-sm">★★★★★</div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {isZh ? review.textZh : review.textEn}
              </p>
              {/* Google badge */}
              <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground/60">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Google</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

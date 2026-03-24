const REVIEWS = [
  {
    name: "Emily C.",
    avatar: "E",
    rating: 5,
    textZh: "凝膠美甲做得超好看！色澤飽滿，持久度也非常棒，做完三週還沒脫落。Vic 老師很細心，強烈推薦！",
    textEn: "The gel nails look gorgeous! Rich color and great lasting power — still perfect three weeks later. Vic is so attentive. Highly recommended!",
    date: "2025-12",
  },
  {
    name: "Jessica L.",
    avatar: "J",
    rating: 5,
    textZh: "第一次做凝膠延甲，本來很擔心不自然，但成品完全超越預期！甲型漂亮又耐用，下次還要來。",
    textEn: "First time doing gel extensions — was worried they'd look unnatural, but the result exceeded my expectations! Beautiful shape and very durable.",
    date: "2026-01",
  },
  {
    name: "Mandy W.",
    avatar: "M",
    rating: 5,
    textZh: "凝膠保養做完手好嫩！老師講解得很清楚，讓我了解如何在家保養。環境整潔，服務很專業。",
    textEn: "My hands felt so soft after the gel care treatment! The nail artist explained everything clearly. Clean environment, very professional service.",
    date: "2026-01",
  },
  {
    name: "Amy H.",
    avatar: "A",
    rating: 5,
    textZh: "預約很方便，LINE 回覆超快速！做的過程很舒服，老師也會建議適合的顏色，完全滿意！",
    textEn: "Booking was so easy and LINE replies were super fast! The process was comfortable and Vic suggested great colors. Completely satisfied!",
    date: "2026-02",
  },
  {
    name: "Claire T.",
    avatar: "C",
    rating: 5,
    textZh: "已經是回頭客了，每次凝膠美甲都讓我愛不釋手。Vic 技術很棒，而且很懂最新流行趨勢，每次都有驚喜！",
    textEn: "I'm a returning client. Every set of gel nails makes me fall in love all over again. Vic's technique is amazing and she always knows the latest trends!",
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
            {isZh ? "顧客見證" : "Reviews"}
          </p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            {isZh ? "真實顧客好評" : "What Our Clients Say"}
          </h2>
          <div className="mt-3 flex items-center justify-center gap-2">
            <span className="text-yellow-400 text-lg">★★★★★</span>
            <span className="text-muted-foreground text-sm">
              {isZh ? "Google 5.0 · 50+ 則評論" : "Google 5.0 · 50+ Reviews"}
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

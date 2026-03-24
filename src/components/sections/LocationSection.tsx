export function LocationSection({ locale }: { locale: string }) {
  const isZh = locale === "zh-TW";

  return (
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-sm font-medium text-nail-gold uppercase tracking-widest mb-2">
            {isZh ? "聯絡我們" : "Contact"}
          </p>
          <h2 className="text-3xl font-display font-bold text-foreground">
            {isZh ? "工作室資訊" : "Studio Info"}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Address */}
          <div className="bg-nail-cream/40 rounded-2xl p-6 text-center border border-nail-pink/30">
            <div className="text-3xl mb-3">📍</div>
            <h3 className="font-semibold text-foreground mb-2">
              {isZh ? "工作室地址" : "Address"}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {isZh
                ? "台北市信義區\n（詳細地址預約後提供）"
                : "Xinyi District, Taipei\n(Address provided upon booking)"}
            </p>
          </div>

          {/* LINE booking */}
          <div className="bg-nail-cream/40 rounded-2xl p-6 text-center border border-nail-pink/30">
            <div className="text-3xl mb-3">💬</div>
            <h3 className="font-semibold text-foreground mb-2">
              {isZh ? "LINE 預約" : "LINE Booking"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {isZh
                ? "透過 LINE 預約最方便，通常 30 分鐘內回覆"
                : "Booking via LINE is easiest. Usually replies within 30 min."}
            </p>
            <a
              href="https://lin.ee/vicnail"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-white bg-[#06C755] hover:bg-[#05a847] rounded-full px-5 py-2 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.105.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
              </svg>
              {isZh ? "加入 LINE 預約" : "Book on LINE"}
            </a>
          </div>

          {/* Hours */}
          <div className="bg-nail-cream/40 rounded-2xl p-6 text-center border border-nail-pink/30">
            <div className="text-3xl mb-3">🕐</div>
            <h3 className="font-semibold text-foreground mb-2">
              {isZh ? "營業時間" : "Hours"}
            </h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>{isZh ? "週一至週五：11:00 – 20:00" : "Mon–Fri: 11:00 – 20:00"}</p>
              <p>{isZh ? "週六至週日：10:00 – 19:00" : "Sat–Sun: 10:00 – 19:00"}</p>
              <p className="text-xs mt-2 text-nail-gold/80">
                {isZh ? "* 僅接受預約制" : "* By appointment only"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

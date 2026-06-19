"use client";

import { motion } from "framer-motion";
import { CalendarDays, GraduationCap, Repeat, CalendarCheck } from "lucide-react";

const days = ["週三", "週五", "週六", "週日"];

const slots = [
  { label: "上午", time: "10:00 – 13:00" },
  { label: "下午", time: "14:00 – 17:00" },
  { label: "晚間", time: "19:00 – 22:00" },
];

const systems = [
  {
    Icon: GraduationCap,
    title: "排新進度（主修）",
    desc: "該時段為「空堂」時可指定想上的新進度，老師針對你的個人進度一對一或小班重點指導，依你的程度安排，不被別人的進度綁住。",
  },
  {
    Icon: Repeat,
    title: "預約旁聽（複習）",
    desc: "該時段已由其他同學預約、且為你報名過的課程，可預約免費旁聽。課程效期內不限次數回來複習，真正「聽到飽、學到會」。",
  },
];

export function ClassSystemSection() {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-white to-nail-cream">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-nail-gold uppercase tracking-widest mb-2">
            Class System
          </p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            上課時間與上課制度
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            彈性排課・無限複習跟課，讓你依自己的步調學到熟練為止。
          </p>
        </div>

        {/* Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl border border-nail-pink/40 p-6 sm:p-8 mb-8"
        >
          <h3 className="flex items-center gap-2 text-lg font-display font-semibold text-foreground mb-5">
            <CalendarDays size={20} className="text-nail-gold" />
            每週排課時段
          </h3>

          {/* Open days */}
          <div className="flex flex-wrap gap-2 mb-6">
            {days.map((d) => (
              <span
                key={d}
                className="inline-flex items-center px-4 py-1.5 rounded-full bg-nail-pink/40 text-nail-gold text-sm font-medium"
              >
                {d}
              </span>
            ))}
            <span className="inline-flex items-center text-sm text-muted-foreground px-2 py-1.5">
              每週開放
            </span>
          </div>

          {/* Time slots */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {slots.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-nail-pink/40 bg-nail-cream/50 px-4 py-4 text-center"
              >
                <p className="text-sm text-nail-gold font-medium mb-1">
                  {s.label}
                </p>
                <p className="text-base font-semibold text-foreground">
                  {s.time}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Class system explanation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {systems.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="group flex items-start gap-4 bg-white rounded-2xl p-6 border border-nail-pink/40 hover:border-nail-gold/50 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-nail-pink/40 flex items-center justify-center group-hover:bg-nail-gold/15 transition-colors">
                <s.Icon size={24} className="text-nail-gold" />
              </div>
              <div>
                <h3 className="text-lg font-display font-semibold text-foreground mb-1">
                  {s.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {s.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Scheduling system note (text only, no link / embed) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="flex items-start gap-3 rounded-2xl bg-nail-cream/60 border border-nail-pink/30 px-5 py-4"
        >
          <CalendarCheck size={20} className="text-nail-gold flex-shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            學員享有專屬排課系統，可透明查看教室行事曆並自由預約上課時段——可上單堂
            3 小時，或連上兩堂 6 小時，依你的時間彈性安排。
          </p>
        </motion.div>
      </div>
    </section>
  );
}

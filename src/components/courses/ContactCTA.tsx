"use client";

import { motion } from "framer-motion";
import {
  MessageCircle,
  Instagram,
  MapPin,
  Train,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function ContactCTA() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          {/* Schedule Info */}
          <div className="mb-12 p-6 rounded-2xl bg-nail-cream/50 border border-nail-pink/20">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Clock size={18} className="text-nail-gold" />
              上課時段
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              每週開放：週三、週五、週六、週日
            </p>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="bg-white rounded-lg p-3 text-center">
                <p className="font-medium text-foreground">上午</p>
                <p className="text-muted-foreground">10:00 - 13:00</p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <p className="font-medium text-foreground">下午</p>
                <p className="text-muted-foreground">14:00 - 17:00</p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <p className="font-medium text-foreground">晚間</p>
                <p className="text-muted-foreground">19:00 - 22:00</p>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="mb-12 p-6 rounded-2xl bg-nail-cream/50 border border-nail-pink/20">
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <MapPin size={18} className="text-nail-gold" />
              教室資訊
            </h3>
            <p className="text-sm font-medium text-foreground mb-1">
              VIC NAIL 美甲教學工作室
            </p>
            <p className="text-sm text-muted-foreground mb-3">
              新北市板橋區南雅南路二段144巷42號7樓
            </p>
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <Train size={14} className="mt-0.5 flex-shrink-0 text-nail-gold" />
              <span>
                捷運亞東醫院站 2 號出口（步行約 5 分鐘）
              </span>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <h2 className="text-2xl font-display font-bold text-foreground mb-4">
              準備好開始您的美甲旅程了嗎？
            </h2>
            <p className="text-muted-foreground mb-8">
              無論是培養第二專長，還是決心創業，VIC NAIL 都是您最強的後盾。
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-[#06C755] hover:bg-[#06C755]/90 text-white rounded-full px-8"
              >
                <MessageCircle size={18} className="mr-2" />
                加入官方 LINE 預約諮詢
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-nail-gold/30 text-nail-gold hover:bg-nail-gold/5 rounded-full px-8"
              >
                <Instagram size={18} className="mr-2" />
                Instagram 私訊
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

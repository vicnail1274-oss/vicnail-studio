"use client";

import { motion } from "framer-motion";
import { Award, Trophy, GraduationCap, BadgeCheck } from "lucide-react";

export function InstructorProfile() {
  return (
    <section className="py-16 px-4 bg-nail-cream/30">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-col md:flex-row items-start gap-10">
            {/* Avatar */}
            <div className="flex-shrink-0 mx-auto md:mx-0">
              <div className="w-44 h-44 rounded-2xl bg-gradient-to-br from-nail-gold/20 to-nail-pink/40 flex items-center justify-center border-2 border-nail-gold/20">
                <span className="text-5xl font-display text-nail-gold">V</span>
              </div>
              <p className="text-center mt-3 text-sm text-muted-foreground">
                Educational Director
              </p>
            </div>

            {/* Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-display font-bold text-foreground mb-1">
                Vic（東東老師）
              </h2>
              <p className="text-nail-gold text-sm mb-4">
                「將複雜的技術拆解為易懂的邏輯。」
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                從基礎到高階，堅持學會為止的教學初衷，帶領學員從零開始打造職涯競爭力。
              </p>

              {/* Credentials Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Brand Authority */}
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                    <Award size={16} className="text-nail-gold" />
                    品牌權威講師
                  </h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>PRESTO 台灣區認證講師</li>
                    <li>喜成美的事業特約講師</li>
                  </ul>
                </div>

                {/* Competition */}
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                    <Trophy size={16} className="text-nail-gold" />
                    國際賽事評審 & 冠軍
                  </h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>亞洲盃指甲彩繪靜態組 冠軍（2016）</li>
                    <li>OMC 美容美髮世界組織 國際評審</li>
                    <li>亞洲盃藝術美甲 評審</li>
                  </ul>
                </div>

                {/* Teaching */}
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                    <GraduationCap size={16} className="text-nail-gold" />
                    專業教學資歷
                  </h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>前 美國愛藝術美甲檢定中心 研發部主任</li>
                    <li>莊敬高職 美容科教師</li>
                    <li>文化大學推廣部 藝術美甲講師</li>
                  </ul>
                </div>

                {/* Certifications */}
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                    <BadgeCheck size={16} className="text-nail-gold" />
                    專業證照
                  </h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>JNA 日本美甲師協會 衛生士合格</li>
                    <li>JNEC 三級日本美甲師檢定合格</li>
                    <li>國家美容乙級/丙級證照</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Send, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function NewsletterCTA({ locale, dark = false }: { locale: string; dark?: boolean }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const isZh = locale === "zh-TW";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");

    // Send to n8n webhook (configure URL in env)
    try {
      const webhookUrl = process.env.NEXT_PUBLIC_NEWSLETTER_WEBHOOK;
      if (webhookUrl) {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, source: "vicnail-studio", timestamp: new Date().toISOString() }),
        });
      }
    } catch {
      // Silent fail — don't block UX
    }

    setStatus("success");
    setEmail("");
  };

  return (
    <motion.section
      className={cn(
        "py-16 px-4",
        dark ? "bg-gray-950" : "bg-gradient-to-r from-nail-cream via-nail-blush to-nail-cream"
      )}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      <div className="max-w-xl mx-auto text-center">
        <Mail
          size={32}
          className={cn("mx-auto mb-4", dark ? "text-ai-cyan" : "text-nail-gold")}
        />
        <h2
          className={cn(
            "text-2xl font-display font-bold mb-2",
            dark ? "text-white" : "text-foreground"
          )}
        >
          {isZh ? "訂閱最新內容" : "Stay Updated"}
        </h2>
        <p className={cn("text-sm mb-6", dark ? "text-gray-400" : "text-muted-foreground")}>
          {isZh
            ? "美甲新知 + AI 實驗心得，直送信箱"
            : "Nail tips + AI experiments, delivered to your inbox"}
        </p>

        {status === "success" ? (
          <div className="flex items-center justify-center gap-2 text-green-500">
            <Check size={18} />
            <span>{isZh ? "訂閱成功！" : "Subscribed!"}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={isZh ? "輸入 Email" : "Your email"}
              required
              className={cn(
                "flex-1 px-4 py-2.5 rounded-lg text-sm outline-none transition-colors",
                dark
                  ? "bg-gray-900 border border-gray-700 text-white placeholder:text-gray-500 focus:border-ai-cyan"
                  : "bg-white border border-nail-pink/30 text-foreground placeholder:text-gray-400 focus:border-nail-gold"
              )}
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className={cn(
                "px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5",
                dark
                  ? "bg-ai-purple text-white hover:bg-ai-purple/80"
                  : "bg-nail-gold text-white hover:bg-nail-gold/90"
              )}
            >
              <Send size={14} />
              {isZh ? "訂閱" : "Subscribe"}
            </button>
          </form>
        )}
      </div>
    </motion.section>
  );
}

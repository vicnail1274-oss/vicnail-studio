"use client";

import { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function BookingCTA({ isZh }: { isZh: boolean }) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (dismissed) return null;

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-40 flex items-center gap-2 transition-all duration-500",
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-20 opacity-0 pointer-events-none"
      )}
    >
      <button
        onClick={() => setDismissed(true)}
        className="w-7 h-7 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center hover:bg-gray-300 transition-colors shadow"
        aria-label={isZh ? "關閉" : "Close"}
      >
        <X className="w-3.5 h-3.5" />
      </button>

      <a
        href="https://line.me/ti/p/vicnail_studio"
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full shadow-lg",
          "bg-[#06C755] text-white font-semibold text-sm",
          "hover:bg-[#05b04c] hover:shadow-xl hover:scale-105",
          "active:scale-95 transition-all duration-200",
          "animate-pulse hover:animate-none"
        )}
      >
        <MessageCircle className="w-5 h-5" />
        {isZh ? "LINE 預約諮詢" : "Book via LINE"}
      </a>
    </div>
  );
}

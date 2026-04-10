"use client";

import { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";

const LINE_URL =
  process.env.NEXT_PUBLIC_LINE_URL || "https://line.me/R/ti/p/@vicnail";
const DISMISS_KEY = "vicnail_line_btn_dismissed";

export function FloatingLineButton() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    try {
      const dismissedAt = localStorage.getItem(DISMISS_KEY);
      // 關閉 24 小時內不再顯示
      if (dismissedAt && Date.now() - parseInt(dismissedAt) < 24 * 3600 * 1000) {
        return;
      }
    } catch {}
    // 5 秒後再出現，不打擾
    const timer = setTimeout(() => setVisible(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {}
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 animate-[line-in_0.4s_ease-out]">
      {expanded && (
        <div className="mb-3 p-4 bg-white rounded-2xl shadow-xl border border-gray-100 max-w-[260px]">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#06C755] flex items-center justify-center">
                <MessageCircle size={16} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">VicNail</p>
                <p className="text-xs text-green-600">● 線上服務中</p>
              </div>
            </div>
            <button
              onClick={dismiss}
              className="text-gray-400 hover:text-gray-600"
              aria-label="關閉"
            >
              <X size={16} />
            </button>
          </div>
          <p className="text-sm text-foreground mb-3">
            嗨 👋 有任何問題都可以直接 LINE 我，看到訊息會立刻回覆～
          </p>
          <a
            href={LINE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center py-2 bg-[#06C755] text-white rounded-xl text-sm font-semibold hover:bg-[#05a847] transition-colors"
          >
            開啟 LINE 對話
          </a>
        </div>
      )}

      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-14 h-14 rounded-full bg-[#06C755] text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center relative"
        aria-label="LINE 客服"
      >
        <MessageCircle size={26} />
        {!expanded && (
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 border-2 border-white animate-pulse" />
        )}
      </button>

      <style>{`
        @keyframes line-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

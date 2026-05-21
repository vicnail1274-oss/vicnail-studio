"use client";

import { useEffect, useState } from "react";

/**
 * 動態浮水印 — 防止學生外流影片
 *
 * 顯示 user email + 時戳，半透明，每 30 秒換位置（防裁切）
 */
export function Watermark({ email }: { email: string }) {
  const [pos, setPos] = useState({ top: 10, left: 10 });
  const [time, setTime] = useState("");

  useEffect(() => {
    function tick() {
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const dd = String(now.getDate()).padStart(2, "0");
      const hh = String(now.getHours()).padStart(2, "0");
      const min = String(now.getMinutes()).padStart(2, "0");
      setTime(`${yyyy}-${mm}-${dd} ${hh}:${min}`);

      // 隨機位置（4 個角輪流）
      const corners = [
        { top: 10, left: 10 },
        { top: 10, right: 10, left: undefined },
        { bottom: 10, left: 10, top: undefined },
        { bottom: 10, right: 10, top: undefined, left: undefined },
      ];
      const next = corners[Math.floor(Math.random() * corners.length)];
      setPos(next as { top: number; left: number });
    }
    tick();
    const interval = setInterval(tick, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="absolute pointer-events-none select-none z-20 text-white/40 text-xs font-mono drop-shadow-md"
      style={{
        top: pos.top !== undefined ? `${pos.top}%` : undefined,
        left: pos.left !== undefined ? `${pos.left}%` : undefined,
        // @ts-expect-error CSS dynamic property
        right: (pos as { right?: number }).right !== undefined ? `${(pos as { right: number }).right}%` : undefined,
        // @ts-expect-error CSS dynamic property
        bottom: (pos as { bottom?: number }).bottom !== undefined ? `${(pos as { bottom: number }).bottom}%` : undefined,
        textShadow: "0 0 4px rgba(0,0,0,0.8)",
      }}
    >
      {email} · {time}
    </div>
  );
}

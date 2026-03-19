"use client";

import { cn } from "@/lib/utils";

type AdSize = "leaderboard" | "rectangle" | "large-rectangle" | "skyscraper" | "in-feed";

const sizeMap: Record<AdSize, { w: number; h: number; label: string }> = {
  leaderboard: { w: 728, h: 90, label: "728×90" },
  rectangle: { w: 300, h: 250, label: "300×250" },
  "large-rectangle": { w: 300, h: 600, label: "300×600" },
  skyscraper: { w: 160, h: 600, label: "160×600" },
  "in-feed": { w: 0, h: 250, label: "In-Feed" },
};

export function AdSlot({
  size,
  slotId,
  dark = false,
  className,
}: {
  size: AdSize;
  slotId?: string;
  dark?: boolean;
  className?: string;
}) {
  const { w, h, label } = sizeMap[size];

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-lg border-2 border-dashed transition-colors",
        dark
          ? "border-gray-700 bg-gray-900/50 text-gray-600"
          : "border-gray-200 bg-gray-50 text-gray-400",
        size === "in-feed" ? "w-full" : undefined,
        className
      )}
      style={{
        width: w === 0 ? "100%" : w,
        height: h,
        maxWidth: "100%",
      }}
      data-ad-slot={slotId}
      data-ad-size={label}
    >
      <div className="text-center text-xs">
        <div className="font-mono">{label}</div>
        <div className="mt-1 opacity-60">AD</div>
      </div>
    </div>
  );
}

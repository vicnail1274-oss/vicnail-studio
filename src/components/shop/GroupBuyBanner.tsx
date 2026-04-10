"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Users, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface GroupBuy {
  id: string;
  title: string;
  description: string | null;
  cover_image: string | null;
  start_date: string;
  end_date: string;
  target_qty: number;
  current_qty: number;
  status: string;
}

export function GroupBuyBanner({ groupBuy }: { groupBuy: GroupBuy }) {
  const endDate = new Date(groupBuy.end_date);
  const now = new Date();
  const daysLeft = Math.max(
    0,
    Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  );
  const progress =
    groupBuy.target_qty > 0
      ? Math.min(100, (groupBuy.current_qty / groupBuy.target_qty) * 100)
      : 0;
  const isUpcoming = groupBuy.status === "upcoming";

  return (
    <Link href={`/shop?group=${groupBuy.id}`}>
      <div
        className={cn(
          "relative rounded-2xl overflow-hidden border-2 p-6 hover:shadow-lg transition-shadow",
          isUpcoming
            ? "border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50"
            : "border-nail-gold bg-gradient-to-r from-nail-cream to-pink-50"
        )}
      >
        <div className="flex items-start justify-between">
          <div>
            {isUpcoming && (
              <span className="inline-block px-2 py-0.5 bg-amber-200 text-amber-800 text-xs font-medium rounded-full mb-2">
                即將開團
              </span>
            )}
            <h3 className="text-xl font-bold text-foreground">
              {groupBuy.title}
            </h3>
            {groupBuy.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {groupBuy.description}
              </p>
            )}
          </div>

          {groupBuy.cover_image && (
            <div className="w-20 h-20 rounded-xl overflow-hidden ml-4 flex-shrink-0 relative">
              <Image
                src={groupBuy.cover_image}
                alt={groupBuy.title}
                fill
                className="object-cover"
                sizes="80px"
                unoptimized
              />
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar size={14} />
            {isUpcoming ? "開團日" : "剩餘"}{" "}
            {isUpcoming
              ? new Date(groupBuy.start_date).toLocaleDateString("zh-TW")
              : `${daysLeft} 天`}
          </span>
          <span className="flex items-center gap-1">
            <Users size={14} />
            已訂 {groupBuy.current_qty}
            {groupBuy.target_qty > 0 && ` / ${groupBuy.target_qty}`}
          </span>
        </div>

        {/* 進度條 */}
        {groupBuy.target_qty > 0 && !isUpcoming && (
          <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-nail-gold rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </Link>
  );
}

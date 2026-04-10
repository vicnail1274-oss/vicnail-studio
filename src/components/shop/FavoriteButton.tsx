"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { isInWishlist, toggleWishlist } from "@/lib/wishlist-store";

interface Props {
  productId: string;
  size?: "sm" | "md" | "lg";
  variant?: "icon" | "card";
  className?: string;
  onToast?: (msg: string) => void;
}

const SIZE_MAP = {
  sm: 14,
  md: 18,
  lg: 22,
};

export function FavoriteButton({
  productId,
  size = "md",
  variant = "icon",
  className,
  onToast,
}: Props) {
  const [active, setActive] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setActive(isInWishlist(productId));
    function sync() {
      setActive(isInWishlist(productId));
    }
    window.addEventListener("wishlist-updated", sync);
    return () => window.removeEventListener("wishlist-updated", sync);
  }, [productId]);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const nowActive = toggleWishlist(productId);
    setActive(nowActive);
    onToast?.(nowActive ? "已加入願望清單" : "已從願望清單移除");
  }

  if (variant === "card") {
    return (
      <button
        onClick={handleClick}
        aria-label={active ? "從願望清單移除" : "加入願望清單"}
        className={cn(
          "absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur shadow-sm flex items-center justify-center transition-all hover:scale-110",
          active ? "text-pink-500" : "text-gray-400 hover:text-pink-400",
          className
        )}
      >
        <Heart
          size={SIZE_MAP[size]}
          fill={active ? "currentColor" : "none"}
          strokeWidth={2}
        />
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      aria-label={active ? "從願望清單移除" : "加入願望清單"}
      className={cn(
        "p-3 rounded-xl border-2 transition-colors flex items-center justify-center",
        active
          ? "border-pink-500 bg-pink-50 text-pink-500"
          : "border-gray-200 text-gray-400 hover:border-pink-300 hover:text-pink-400",
        className
      )}
    >
      <Heart
        size={SIZE_MAP[size]}
        fill={active && mounted ? "currentColor" : "none"}
        strokeWidth={2}
      />
    </button>
  );
}

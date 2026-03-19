"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";

export function BentoGrid({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto",
        className
      )}
    >
      {children}
    </div>
  );
}

export function BentoCard({
  title,
  description,
  href,
  icon,
  className,
  dark = false,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  className?: string;
  dark?: boolean;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        href={href}
        className={cn(
          "group relative flex flex-col justify-between overflow-hidden rounded-2xl p-6 h-full min-h-[200px] transition-shadow duration-300",
          dark
            ? "bg-ai-dark border border-white/10 hover:shadow-[0_0_30px_rgba(124,58,237,0.15)]"
            : "bg-white border border-nail-pink/30 hover:shadow-[0_0_30px_rgba(183,110,121,0.15)]",
          className
        )}
      >
        <div>
          <div
            className={cn(
              "mb-3 text-2xl",
              dark ? "text-ai-cyan" : "text-nail-gold"
            )}
          >
            {icon}
          </div>
          <h3
            className={cn(
              "text-lg font-semibold mb-2",
              dark ? "text-white" : "text-foreground"
            )}
          >
            {title}
          </h3>
          <p
            className={cn(
              "text-sm",
              dark ? "text-gray-400" : "text-muted-foreground"
            )}
          >
            {description}
          </p>
        </div>
        <div
          className={cn(
            "mt-4 text-sm font-medium flex items-center gap-1 transition-transform group-hover:translate-x-1",
            dark ? "text-ai-cyan" : "text-nail-gold"
          )}
        >
          <span>→</span>
        </div>
      </Link>
    </motion.div>
  );
}

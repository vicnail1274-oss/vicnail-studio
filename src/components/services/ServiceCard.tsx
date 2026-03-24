"use client";

import { useState } from "react";
import { Clock, ChevronRight, ChevronDown } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export interface ServiceData {
  slug: string;
  icon: string;
  title: string;
  subtitle: string;
  description: string;
  duration: string;
  highlight: string;
  price?: string;
  details?: string[];
}

export function ServiceCard({
  service,
  isZh,
  isCourse,
}: {
  service: ServiceData;
  isZh: boolean;
  isCourse: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      id={service.slug}
      className={cn(
        "group relative rounded-2xl border p-6 transition-all duration-300",
        "hover:shadow-xl hover:-translate-y-1",
        isCourse
          ? "border-nail-gold/40 bg-nail-cream/50"
          : "border-nail-pink/30 bg-white"
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <span className="text-3xl" role="img" aria-label={service.title}>
          {service.icon}
        </span>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-nail-pink/20 text-nail-gold">
          {service.highlight}
        </span>
      </div>

      <h2 className="text-xl font-display font-bold text-foreground mb-1">
        {service.title}
      </h2>
      <p className="text-xs text-nail-gold font-medium mb-3">
        {service.subtitle}
      </p>

      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        {service.description}
      </p>

      {service.details && service.details.length > 0 && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs font-medium text-nail-gold hover:text-nail-gold-light transition-colors mb-3"
          >
            {isZh ? "查看服務細節" : "View Details"}
            <ChevronDown
              className={cn(
                "w-3.5 h-3.5 transition-transform duration-200",
                expanded && "rotate-180"
              )}
            />
          </button>
          <div
            className={cn(
              "overflow-hidden transition-all duration-300",
              expanded ? "max-h-60 opacity-100 mb-4" : "max-h-0 opacity-0"
            )}
          >
            <ul className="space-y-1.5 pl-1">
              {service.details.map((detail, i) => (
                <li
                  key={i}
                  className="text-xs text-muted-foreground flex items-start gap-2"
                >
                  <span className="text-nail-gold mt-0.5">•</span>
                  {detail}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          <span>{service.duration}</span>
        </div>
        {service.price && (
          <span className="text-sm font-semibold text-nail-gold">
            {service.price}
          </span>
        )}
      </div>

      {isCourse ? (
        <Link
          href="/courses"
          className="inline-flex items-center gap-1 text-sm font-medium text-nail-gold hover:underline transition-colors"
        >
          {isZh ? "查看課程詳情" : "View Courses"}
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      ) : (
        <a
          href="https://line.me/ti/p/vicnail_studio"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200",
            "bg-nail-gold/10 text-nail-gold hover:bg-nail-gold hover:text-white"
          )}
        >
          {isZh ? "立即預約此服務" : "Book This Service"}
          <ChevronRight className="w-3.5 h-3.5" />
        </a>
      )}

      <div className="sr-only" aria-hidden="true">
        {service.slug}
      </div>
    </div>
  );
}

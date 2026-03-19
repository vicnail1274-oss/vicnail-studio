import { Link } from "@/i18n/navigation";
import { ArrowLeft, Calendar, User, Tag } from "lucide-react";
import type { Article } from "@/lib/mdx";
import { cn } from "@/lib/utils";
import { AdSlot } from "@/components/ads/AdSlot";
import { SidebarAds } from "@/components/ads/SidebarAds";

export function ArticleContent({
  article,
  backPath,
  backLabel,
  dark = false,
  relatedArticles,
}: {
  article: Article;
  backPath: string;
  backLabel: string;
  dark?: boolean;
  relatedArticles?: React.ReactNode;
}) {
  // Split content in half for mid-article ad
  const midPoint = article.content.indexOf("</p>", Math.floor(article.content.length / 2));
  const contentFirst = midPoint > 0 ? article.content.slice(0, midPoint + 4) : article.content;
  const contentSecond = midPoint > 0 ? article.content.slice(midPoint + 4) : "";

  return (
    <article className={cn("py-12 px-4", dark && "bg-ai-dark min-h-screen")}>
      <div className="max-w-7xl mx-auto">
        {/* Back link */}
        <Link
          href={backPath}
          className={cn(
            "inline-flex items-center gap-1 text-sm mb-6 transition-colors",
            dark
              ? "text-gray-400 hover:text-ai-cyan"
              : "text-muted-foreground hover:text-nail-gold"
          )}
        >
          <ArrowLeft size={14} />
          {backLabel}
        </Link>

        {/* Top leaderboard ad */}
        <div className="flex justify-center mb-8">
          <AdSlot size="leaderboard" slotId="article-top" dark={dark} />
        </div>

        {/* Two-column layout */}
        <div className="flex gap-8">
          {/* Main content */}
          <div className="flex-1 min-w-0 max-w-3xl">
            {/* Header */}
            <header className="mb-8">
              <h1
                className={cn(
                  "text-3xl md:text-4xl font-display font-bold mb-4",
                  dark ? "text-white" : "text-foreground"
                )}
              >
                {article.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm">
                {article.author && (
                  <span
                    className={cn(
                      "flex items-center gap-1",
                      dark ? "text-gray-400" : "text-muted-foreground"
                    )}
                  >
                    <User size={14} />
                    {article.author}
                  </span>
                )}
                <span
                  className={cn(
                    "flex items-center gap-1",
                    dark ? "text-gray-400" : "text-muted-foreground"
                  )}
                >
                  <Calendar size={14} />
                  {article.date}
                </span>
                {article.source === "bot" && (
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-xs",
                    dark ? "bg-ai-purple/20 text-ai-neon" : "bg-blue-100 text-blue-600"
                  )}>
                    AI Generated
                  </span>
                )}
              </div>

              {article.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs",
                        dark
                          ? "bg-ai-purple/20 text-ai-cyan"
                          : "bg-nail-pink/50 text-nail-gold"
                      )}
                    >
                      <Tag size={10} />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </header>

            {/* Content first half */}
            <div
              className={cn(
                "prose max-w-none",
                dark
                  ? "prose-invert prose-headings:text-white prose-a:text-ai-cyan"
                  : "prose-headings:text-foreground prose-a:text-nail-gold"
              )}
              dangerouslySetInnerHTML={{ __html: contentFirst }}
            />

            {/* Mid-article ad */}
            {contentSecond && (
              <>
                <div className="flex justify-center my-8">
                  <AdSlot size="rectangle" slotId="article-mid" dark={dark} />
                </div>

                {/* Content second half */}
                <div
                  className={cn(
                    "prose max-w-none",
                    dark
                      ? "prose-invert prose-headings:text-white prose-a:text-ai-cyan"
                      : "prose-headings:text-foreground prose-a:text-nail-gold"
                  )}
                  dangerouslySetInnerHTML={{ __html: contentSecond }}
                />
              </>
            )}

            {/* Bottom leaderboard ad */}
            <div className="flex justify-center mt-10 mb-8">
              <AdSlot size="leaderboard" slotId="article-bottom" dark={dark} />
            </div>

            {/* Related articles slot */}
            {relatedArticles}
          </div>

          {/* Sidebar ads */}
          <SidebarAds dark={dark} />
        </div>
      </div>
    </article>
  );
}

import { Link } from "@/i18n/navigation";
import { ArrowLeft, Calendar, User, Tag } from "lucide-react";
import type { Article } from "@/lib/mdx";
import { cn } from "@/lib/utils";

export function ArticleContent({
  article,
  backPath,
  backLabel,
  dark = false,
}: {
  article: Article;
  backPath: string;
  backLabel: string;
  dark?: boolean;
}) {
  return (
    <article className={cn("py-12 px-4", dark && "bg-ai-dark min-h-screen")}>
      <div className="max-w-3xl mx-auto">
        {/* Back link */}
        <Link
          href={backPath}
          className={cn(
            "inline-flex items-center gap-1 text-sm mb-8 transition-colors",
            dark
              ? "text-gray-400 hover:text-ai-cyan"
              : "text-muted-foreground hover:text-nail-gold"
          )}
        >
          <ArrowLeft size={14} />
          {backLabel}
        </Link>

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

        {/* Content (rendered as HTML from MDX) */}
        <div
          className={cn(
            "prose max-w-none",
            dark
              ? "prose-invert prose-headings:text-white prose-a:text-ai-cyan"
              : "prose-headings:text-foreground prose-a:text-nail-gold"
          )}
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </div>
    </article>
  );
}

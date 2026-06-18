"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Star, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface CourseReview {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
}

function StarRow({
  value,
  size = 16,
  onChange,
}: {
  value: number;
  size?: number;
  onChange?: (n: number) => void;
}) {
  const interactive = !!onChange;
  return (
    <div
      className="inline-flex items-center gap-0.5"
      role={interactive ? "radiogroup" : undefined}
      aria-label={interactive ? "課程評分" : undefined}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange?.(n)}
          disabled={!interactive}
          role={interactive ? "radio" : undefined}
          aria-checked={interactive ? n === value : undefined}
          aria-label={`${n} 顆星`}
          className={cn(
            "transition-transform rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-nail-gold/40",
            interactive ? "hover:scale-110 cursor-pointer" : "cursor-default",
          )}
        >
          <Star
            size={size}
            className={n <= value ? "text-nail-gold" : "text-gray-300"}
            fill={n <= value ? "currentColor" : "none"}
            strokeWidth={2}
          />
        </button>
      ))}
    </div>
  );
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function CourseReviews({
  courseId,
  locale = "zh-TW",
  canReview = false,
}: {
  courseId: string;
  locale?: string;
  canReview?: boolean;
}) {
  const loginHref = `/${locale}/auth/login`;

  const [reviews, setReviews] = useState<CourseReview[]>([]);
  const [avg, setAvg] = useState<number | null>(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // 表單
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formMsg, setFormMsg] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/course-reviews?courseId=${courseId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.reviews) {
          setReviews(data.reviews);
          setAvg(data.avg);
          setCount(data.count);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [courseId]);

  useEffect(() => {
    load();
  }, [load]);

  const myReview = user ? reviews.find((r) => r.user_id === user.id) : null;

  // 進入編輯模式時，預填現有評價
  useEffect(() => {
    if (showForm && myReview) {
      setRating(myReview.rating);
      setComment(myReview.comment || "");
    }
  }, [showForm, myReview]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormMsg(null);
    try {
      const res = await fetch("/api/course-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormMsg(data.error || "送出失敗");
        return;
      }
      setFormMsg("謝謝你的評價！");
      setShowForm(false);
      load();
    } catch {
      setFormMsg("網路錯誤，請稍後重試");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("確定要刪除這則評價嗎？")) return;
    const res = await fetch(`/api/course-reviews?id=${id}`, {
      method: "DELETE",
    });
    if (res.ok) load();
  }

  return (
    <section className="mt-12 pt-8 border-t border-nail-pink/20">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl md:text-2xl font-display font-bold text-foreground">
          學員評價
        </h2>
        {user && canReview && !myReview && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-sm font-medium text-nail-gold hover:underline"
          >
            寫評價 +
          </button>
        )}
      </div>

      {/* 平均評分摘要 */}
      {count > 0 && avg !== null && (
        <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-nail-cream/50 border border-nail-pink/20">
          <div className="text-3xl font-bold text-nail-gold">{avg}</div>
          <div>
            <StarRow value={Math.round(avg)} />
            <p className="text-xs text-muted-foreground mt-0.5">
              {count} 則評價
            </p>
          </div>
        </div>
      )}

      {/* 評價表單（已登入且已購買） */}
      {showForm && user && canReview && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 p-4 rounded-xl border border-nail-pink/30 bg-white"
        >
          <p className="text-sm font-medium text-foreground mb-2">你的評分</p>
          <StarRow value={rating} size={24} onChange={setRating} />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, 1000))}
            rows={4}
            aria-label="課程心得"
            placeholder="分享你的上課心得（選填，最多 1000 字）"
            className="mt-3 w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-nail-gold focus:ring-2 focus:ring-nail-gold/20"
          />
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-gray-400">{comment.length}/1000</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setFormMsg(null);
                }}
                className="px-4 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-1.5 rounded-lg bg-nail-gold text-white text-sm font-medium hover:bg-nail-gold/90 disabled:opacity-60 inline-flex items-center gap-2"
              >
                {submitting && <Loader2 size={14} className="animate-spin" />}
                {myReview ? "更新評價" : "送出評價"}
              </button>
            </div>
          </div>
          {formMsg && <p className="mt-2 text-xs text-nail-gold">{formMsg}</p>}
        </form>
      )}

      {/* 未登入 / 未購買提示 */}
      {!user && (
        <p className="mb-6 text-sm text-muted-foreground p-4 rounded-xl bg-gray-50">
          想留下評價嗎？
          <a href={loginHref} className="text-nail-gold hover:underline ml-1">
            登入帳號
          </a>
        </p>
      )}
      {user && !canReview && (
        <p className="mb-6 text-sm text-muted-foreground p-4 rounded-xl bg-gray-50">
          購買課程後即可分享你的學習心得 ✨
        </p>
      )}

      {/* 評價列表 */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          還沒有評價，成為第一個分享心得的學員吧 ✨
        </p>
      ) : (
        <ul className="space-y-4">
          {reviews.map((r) => {
            const isMine = user?.id === r.user_id;
            const name = r.display_name || "匿名學員";
            return (
              <li
                key={r.id}
                className="p-4 rounded-xl border border-gray-100 bg-white"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    {r.avatar_url ? (
                      <Image
                        src={r.avatar_url}
                        alt={name}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-nail-pink/15 text-nail-pink text-sm font-bold flex items-center justify-center flex-shrink-0">
                        {(name[0] || "?").toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {name}
                        {isMine && (
                          <span className="ml-2 text-xs text-nail-gold">
                            （你的評價）
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDate(r.created_at)}
                      </p>
                    </div>
                  </div>
                  <StarRow value={r.rating} />
                </div>
                {r.comment && (
                  <p className="mt-3 text-sm text-gray-700 whitespace-pre-wrap">
                    {r.comment}
                  </p>
                )}
                {isMine && (
                  <div className="mt-2 flex gap-3 text-xs">
                    {canReview && (
                      <button
                        onClick={() => setShowForm(true)}
                        className="text-nail-gold hover:underline"
                      >
                        編輯
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      刪除
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

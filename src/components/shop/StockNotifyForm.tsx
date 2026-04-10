"use client";

import { useState } from "react";
import { Bell, Check } from "lucide-react";

export function StockNotifyForm({ productId }: { productId: string }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Email 格式錯誤");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/stock-notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "訂閱失敗");
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "發生錯誤");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-green-700 text-sm">
        <Check size={16} />
        <span>已登記！補貨時會用 Email 通知您</span>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-3 w-full py-3 bg-white border border-gray-200 text-foreground rounded-xl font-semibold flex items-center justify-center gap-2 hover:border-nail-gold hover:text-nail-gold transition-colors"
      >
        <Bell size={18} /> 補貨後通知我
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-2">
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:border-nail-gold focus:ring-1 focus:ring-nail-gold outline-none"
          autoFocus
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 bg-nail-gold text-white rounded-xl font-semibold hover:bg-nail-gold/90 disabled:bg-gray-300 transition-colors"
        >
          {loading ? "..." : "訂閱"}
        </button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <p className="text-xs text-muted-foreground">
        我們只會寄一次到貨通知，不會發垃圾信
      </p>
    </form>
  );
}

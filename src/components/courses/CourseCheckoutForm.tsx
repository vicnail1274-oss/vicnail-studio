"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  GraduationCap,
  Ticket,
  Check,
  X,
  CreditCard,
  Loader2,
} from "lucide-react";

interface Course {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  thumbnail_url: string | null;
  total_lessons: number;
  total_duration_seconds: number;
}

interface UserInfo {
  email: string;
  name: string;
  phone: string;
}

const PAYMENT_OPTIONS = [
  { value: "credit", label: "信用卡", icon: "💳" },
  { value: "atm", label: "ATM 轉帳", icon: "🏧" },
  { value: "cvs_code", label: "超商代碼", icon: "🏪" },
];

export function CourseCheckoutForm({
  course,
  user,
}: {
  course: Course;
  user: UserInfo;
}) {
  const [contactName, setContactName] = useState(user.name);
  const [contactPhone, setContactPhone] = useState(user.phone);
  const [payment, setPayment] = useState("credit");
  const [promoCode, setPromoCode] = useState("");
  const [promoStatus, setPromoStatus] = useState<
    "idle" | "validating" | "valid" | "invalid"
  >("idle");
  const [promoMessage, setPromoMessage] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const unitPrice = course.sale_price ?? course.price;
  const subtotal = unitPrice;
  const total = Math.max(0, subtotal - discountAmount);

  // 自動驗證優惠碼（debounce 500ms）
  useEffect(() => {
    const trimmed = promoCode.trim();
    if (!trimmed) {
      setPromoStatus("idle");
      setDiscountAmount(0);
      setPromoMessage("");
      return;
    }
    setPromoStatus("validating");
    const t = setTimeout(async () => {
      try {
        const res = await fetch("/api/promo-codes/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: trimmed,
            subtotal,
            course_ids: [course.id],
          }),
        });
        const data = await res.json();
        if (data.valid) {
          setPromoStatus("valid");
          setDiscountAmount(data.discount_amount || 0);
          setPromoMessage(
            data.promo?.description
              ? `已套用：${data.promo.description}`
              : "優惠碼已套用"
          );
        } else {
          setPromoStatus("invalid");
          setDiscountAmount(0);
          setPromoMessage(data.reason || "優惠碼無效");
        }
      } catch {
        setPromoStatus("invalid");
        setPromoMessage("驗證失敗，請稍後再試");
      }
    }, 500);
    return () => clearTimeout(t);
  }, [promoCode, subtotal, course.id]);

  async function handleCheckout() {
    if (!contactName.trim()) {
      setError("請輸入姓名");
      return;
    }
    if (!contactPhone.trim()) {
      setError("請輸入電話");
      return;
    }
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/courses/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseIds: [course.id],
          promoCode: promoStatus === "valid" ? promoCode.trim() : null,
          payment,
          contactName,
          contactPhone,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "建立訂單失敗");
        setSubmitting(false);
        return;
      }

      const data = await res.json();

      // 100% 免費（優惠碼全免）
      if (data.free) {
        window.location.href = data.redirectUrl || "/zh-TW/account/courses";
        return;
      }

      // 正常付款 — 動態建表單提交到 ECPay
      const form = document.createElement("form");
      form.method = "POST";
      form.action = data.paymentUrl;
      form.style.display = "none";

      for (const [key, value] of Object.entries(data.paymentParams)) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = String(value);
        form.appendChild(input);
      }

      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      setError(err instanceof Error ? err.message : "未知錯誤");
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* 課程預覽 */}
      <div className="bg-white border border-nail-pink/30 rounded-xl p-4 flex gap-4">
        <div className="w-24 h-16 rounded-lg bg-nail-cream/40 relative flex-shrink-0 overflow-hidden">
          {course.thumbnail_url ? (
            <Image
              src={course.thumbnail_url}
              alt={course.title}
              fill
              sizes="96px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-nail-pink/30">
              <GraduationCap size={28} />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold">{course.title}</h3>
          <p className="text-xs text-muted-foreground">
            {course.total_lessons} 堂 · 終身觀看
          </p>
        </div>
        <div className="text-right">
          <div className="font-bold">NT${unitPrice.toLocaleString()}</div>
        </div>
      </div>

      {/* 聯絡資料 */}
      <div className="bg-white border rounded-xl p-5 space-y-4">
        <h3 className="font-semibold">聯絡資料</h3>
        <div>
          <label className="block text-sm text-muted-foreground mb-1">
            Email（學生帳號）
          </label>
          <input
            type="email"
            value={user.email}
            disabled
            className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-muted-foreground"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-muted-foreground mb-1">
              姓名 *
            </label>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-1">
              電話 *
            </label>
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="09xxxxxxxx"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
          </div>
        </div>
      </div>

      {/* 優惠碼 */}
      <div className="bg-white border rounded-xl p-5 space-y-3">
        <h3 className="font-semibold flex items-center gap-2">
          <Ticket size={18} className="text-nail-gold" />
          優惠碼（可選）
        </h3>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            placeholder="輸入優惠碼"
            className="flex-1 px-4 py-2 border rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
          {promoStatus === "validating" && (
            <Loader2 size={20} className="animate-spin text-gray-400" />
          )}
          {promoStatus === "valid" && (
            <Check size={20} className="text-green-500" />
          )}
          {promoStatus === "invalid" && (
            <X size={20} className="text-red-500" />
          )}
        </div>
        {promoMessage && (
          <p
            className={`text-sm ${
              promoStatus === "valid" ? "text-green-600" : "text-red-500"
            }`}
          >
            {promoMessage}
          </p>
        )}
      </div>

      {/* 付款方式 */}
      <div className="bg-white border rounded-xl p-5 space-y-3">
        <h3 className="font-semibold flex items-center gap-2">
          <CreditCard size={18} />
          付款方式
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {PAYMENT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPayment(opt.value)}
              className={`flex flex-col items-center gap-1 py-3 border-2 rounded-xl transition-colors ${
                payment === opt.value
                  ? "border-nail-gold bg-nail-gold/10"
                  : "border-gray-200 hover:border-nail-gold/50"
              }`}
            >
              <span className="text-2xl">{opt.icon}</span>
              <span className="text-xs font-medium">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 結算 */}
      <div className="bg-nail-cream/40 rounded-xl p-5 space-y-2">
        <div className="flex justify-between text-sm">
          <span>小計</span>
          <span>NT${subtotal.toLocaleString()}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>優惠折扣</span>
            <span>−NT${discountAmount.toLocaleString()}</span>
          </div>
        )}
        <div className="border-t pt-2 flex justify-between text-xl font-bold">
          <span>應付金額</span>
          <span>NT${total.toLocaleString()}</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <button
        onClick={handleCheckout}
        disabled={submitting}
        className="w-full py-4 bg-nail-gold text-white rounded-xl font-semibold text-lg hover:bg-nail-gold/90 disabled:bg-gray-300 transition-colors"
      >
        {submitting ? (
          <>
            <Loader2 size={20} className="inline animate-spin mr-2" />
            處理中⋯⋯
          </>
        ) : total === 0 ? (
          "免費開通課程"
        ) : (
          `前往付款 NT$${total.toLocaleString()}`
        )}
      </button>

      <p className="text-xs text-muted-foreground text-center">
        付款由綠界 ECPay 安全處理。完成後立即開通課程觀看權。
      </p>
    </div>
  );
}

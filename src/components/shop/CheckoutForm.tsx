"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Store,
  Truck,
  MapPin,
  CreditCard,
  Building2,
  Wallet,
  ArrowLeft,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import {
  getCart,
  getCartTotal,
  type CartItem,
} from "@/lib/cart-store";
import { calculateShippingFee, getLogisticsLabel, type LogisticsType } from "@/lib/ecpay";

const SHIPPING_OPTIONS: {
  key: LogisticsType;
  label: string;
  icon: typeof Store;
  desc: string;
}[] = [
  { key: "cvs_711", label: "7-11 超商取貨", icon: Store, desc: "2-3 天到店" },
  { key: "cvs_fami", label: "全家超商取貨", icon: Store, desc: "2-3 天到店" },
  { key: "cvs_hilife", label: "萊爾富超商取貨", icon: Store, desc: "2-3 天到店" },
  { key: "home_tcat", label: "黑貓宅急便", icon: Truck, desc: "1-2 天到府" },
  { key: "home_sf", label: "順豐速運", icon: Truck, desc: "1-3 天到府" },
  { key: "self_pickup", label: "工作室自取", icon: MapPin, desc: "台北信義區" },
];

const PAYMENT_OPTIONS = [
  { key: "credit", label: "信用卡", icon: CreditCard },
  { key: "atm", label: "ATM 轉帳", icon: Building2 },
  { key: "cvs_code", label: "超商代碼繳費", icon: Wallet },
];

export function CheckoutForm() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [shipping, setShipping] = useState<LogisticsType>("cvs_711");
  const [payment, setPayment] = useState("credit");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    storeId: "",
    storeName: "",
    notes: "",
  });

  useEffect(() => {
    setItems(getCart());
    try {
      const saved = localStorage.getItem("vicnail_checkout");
      if (saved) {
        const parsed = JSON.parse(saved);
        setForm((prev) => ({ ...prev, ...parsed }));
      }
    } catch {}
  }, []);

  const subtotal = getCartTotal(items);
  const shippingFee = calculateShippingFee(shipping);
  const total = subtotal + shippingFee;
  const isCvs = shipping.startsWith("cvs_");
  const isHomeDelivery = shipping.startsWith("home_");

  function updateField(key: string, value: string) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      try {
        const { name, phone, email, address } = next;
        localStorage.setItem("vicnail_checkout", JSON.stringify({ name, phone, email, address }));
      } catch {}
      return next;
    });
  }

  // 台灣手機/市話驗證
  const phoneRegex = /^(09\d{8}|0[2-8]\d{7,8})$/;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) return;

    const cleanPhone = form.phone.replace(/[-\s]/g, "");
    if (!phoneRegex.test(cleanPhone)) {
      alert("請輸入正確的台灣手機或市話號碼（例如 0912345678）");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            variant: item.variant,
          })),
          shipping: {
            type: shipping,
            name: form.name,
            phone: form.phone,
            email: form.email,
            address: form.address,
            storeId: form.storeId,
            storeName: form.storeName,
          },
          payment,
          notes: form.notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "建立訂單失敗");
        setSubmitting(false);
        return;
      }

      // 如果有 ECPay 付款表單，跳轉
      if (data.paymentUrl) {
        // 驗證 URL 為受信任的 ECPay 域名
        const TRUSTED_ECPAY_DOMAINS = [
          "payment.ecpay.com.tw",
          "payment-stage.ecpay.com.tw",
        ];
        try {
          const paymentHost = new URL(data.paymentUrl).hostname;
          if (!TRUSTED_ECPAY_DOMAINS.includes(paymentHost)) {
            alert("付款連結異常，請聯繫客服");
            setSubmitting(false);
            return;
          }
        } catch {
          alert("付款連結格式錯誤");
          setSubmitting(false);
          return;
        }

        // 建立隱藏表單送出到 ECPay
        const ecpayForm = document.createElement("form");
        ecpayForm.method = "POST";
        ecpayForm.action = data.paymentUrl;
        Object.entries(data.paymentParams as Record<string, string>).forEach(
          ([key, value]) => {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = key;
            input.value = value;
            ecpayForm.appendChild(input);
          }
        );
        document.body.appendChild(ecpayForm);
        ecpayForm.submit();
      } else {
        router.push(`/account/orders`);
      }
    } catch {
      alert("網路錯誤，請稍後再試");
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p className="mb-4">購物車是空的</p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-nail-gold hover:underline"
        >
          <ArrowLeft size={16} /> 去逛逛
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 訂單摘要 */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-2">
        <h2 className="font-semibold text-foreground mb-2">訂單商品</h2>
        {items.map((item) => (
          <div
            key={`${item.productId}_${JSON.stringify(item.variant || {})}`}
            className="flex justify-between text-sm"
          >
            <span className="text-muted-foreground">
              {item.title} x {item.quantity}
            </span>
            <span className="font-medium">
              ${((item.salePrice ?? item.price) * item.quantity).toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      {/* 收件資訊 */}
      <div>
        <h2 className="text-lg font-semibold mb-4">收件資訊</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground">
              姓名 *
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-nail-gold/30 focus:border-nail-gold"
              placeholder="收件人姓名"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">
              手機 *
            </label>
            <input
              type="tel"
              required
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-nail-gold/30 focus:border-nail-gold"
              placeholder="09xx-xxx-xxx"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-foreground">
              Email *
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-nail-gold/30 focus:border-nail-gold"
              placeholder="訂單通知用"
            />
          </div>
        </div>
      </div>

      {/* 配送方式 */}
      <div>
        <h2 className="text-lg font-semibold mb-4">配送方式</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SHIPPING_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const fee = calculateShippingFee(opt.key);
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => setShipping(opt.key)}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-colors",
                  shipping === opt.key
                    ? "border-nail-gold bg-nail-gold/5"
                    : "border-gray-100 hover:border-gray-200"
                )}
              >
                <Icon
                  size={20}
                  className={
                    shipping === opt.key
                      ? "text-nail-gold"
                      : "text-muted-foreground"
                  }
                />
                <div className="flex-1">
                  <div className="font-medium text-sm">{opt.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {opt.desc}
                  </div>
                </div>
                <span className="text-sm font-medium">
                  {fee === 0 ? "免運" : `$${fee}`}
                </span>
              </button>
            );
          })}
        </div>

        {/* 超商門市選擇 */}
        {isCvs && (
          <div className="mt-4 p-4 bg-amber-50 rounded-xl">
            <p className="text-sm text-amber-700 mb-2">
              請輸入取貨門市資訊：
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={form.storeId}
                onChange={(e) => updateField("storeId", e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-nail-gold/30"
                placeholder="門市代號"
              />
              <input
                type="text"
                value={form.storeName}
                onChange={(e) => updateField("storeName", e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-nail-gold/30"
                placeholder="門市名稱"
              />
            </div>
          </div>
        )}

        {/* 宅配地址 */}
        {isHomeDelivery && (
          <div className="mt-4">
            <label className="text-sm font-medium text-foreground">
              配送地址 *
            </label>
            <input
              type="text"
              required
              value={form.address}
              onChange={(e) => updateField("address", e.target.value)}
              className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-nail-gold/30"
              placeholder="完整地址"
            />
          </div>
        )}
      </div>

      {/* 付款方式 */}
      <div>
        <h2 className="text-lg font-semibold mb-4">付款方式</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PAYMENT_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => setPayment(opt.key)}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-colors",
                  payment === opt.key
                    ? "border-nail-gold bg-nail-gold/5"
                    : "border-gray-100 hover:border-gray-200"
                )}
              >
                <Icon
                  size={20}
                  className={
                    payment === opt.key
                      ? "text-nail-gold"
                      : "text-muted-foreground"
                  }
                />
                <span className="font-medium text-sm">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 備註 */}
      <div>
        <label className="text-sm font-medium text-foreground">
          訂單備註（選填）
        </label>
        <textarea
          value={form.notes}
          onChange={(e) => updateField("notes", e.target.value)}
          rows={2}
          className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-nail-gold/30 resize-none"
          placeholder="特殊需求或備註"
        />
      </div>

      {/* 合計 + 送出 */}
      <div className="bg-gray-50 rounded-xl p-6 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">商品小計</span>
          <span>NT$ {subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            運費（{getLogisticsLabel(shipping)}）
          </span>
          <span>
            {shippingFee === 0 ? "免運" : `NT$ ${shippingFee.toLocaleString()}`}
          </span>
        </div>
        <hr className="border-gray-200" />
        <div className="flex justify-between text-lg font-bold">
          <span>合計</span>
          <span className="text-nail-gold">
            NT$ {total.toLocaleString()}
          </span>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className={cn(
            "w-full py-3 rounded-xl font-semibold text-lg transition-colors",
            submitting
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-nail-gold text-white hover:bg-nail-gold/90"
          )}
        >
          {submitting ? "處理中..." : "確認訂單並前往付款"}
        </button>
      </div>
    </form>
  );
}

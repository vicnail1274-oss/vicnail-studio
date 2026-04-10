import { Check, Clock, CreditCard, Package, Truck, Home } from "lucide-react";
import { cn } from "@/lib/utils";

type OrderStatus =
  | "pending"
  | "paid"
  | "shipped"
  | "completed"
  | "cancelled"
  | "refunded";

interface Props {
  status: OrderStatus;
  trackingNumber?: string | null;
}

const STEPS = [
  { key: "pending", label: "訂單成立", icon: Clock },
  { key: "paid", label: "已付款", icon: CreditCard },
  { key: "shipped", label: "已出貨", icon: Truck },
  { key: "completed", label: "已送達", icon: Home },
];

const ORDER: Record<OrderStatus, number> = {
  pending: 0,
  paid: 1,
  shipped: 2,
  completed: 3,
  cancelled: -1,
  refunded: -1,
};

export function OrderTimeline({ status, trackingNumber }: Props) {
  const currentIdx = ORDER[status];

  if (currentIdx < 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-xl text-center text-sm text-muted-foreground">
        {status === "cancelled" ? "此訂單已取消" : "此訂單已退款"}
      </div>
    );
  }

  return (
    <div className="py-2">
      <div className="flex items-start justify-between relative">
        {/* 連接線（背景） */}
        <div className="absolute top-5 left-[10%] right-[10%] h-0.5 bg-gray-200" />
        {/* 連接線（進度） */}
        <div
          className="absolute top-5 left-[10%] h-0.5 bg-nail-gold transition-all duration-500"
          style={{
            width: `${Math.max(0, Math.min(1, currentIdx / 3)) * 80}%`,
          }}
        />

        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isDone = idx <= currentIdx;
          const isCurrent = idx === currentIdx;
          return (
            <div
              key={step.key}
              className="flex flex-col items-center relative z-10 flex-1"
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                  isDone
                    ? "bg-nail-gold border-nail-gold text-white"
                    : "bg-white border-gray-200 text-gray-300",
                  isCurrent && "ring-4 ring-nail-gold/20 scale-110"
                )}
              >
                {isDone && !isCurrent ? (
                  <Check size={18} />
                ) : (
                  <Icon size={16} />
                )}
              </div>
              <p
                className={cn(
                  "mt-2 text-xs font-medium text-center",
                  isDone ? "text-foreground" : "text-gray-400"
                )}
              >
                {step.label}
              </p>
            </div>
          );
        })}
      </div>

      {trackingNumber && status !== "pending" && (
        <div className="mt-4 p-3 bg-blue-50 rounded-xl flex items-center gap-2 text-sm text-blue-700">
          <Package size={16} />
          <span>物流單號：</span>
          <code className="font-mono font-semibold">{trackingNumber}</code>
        </div>
      )}
    </div>
  );
}

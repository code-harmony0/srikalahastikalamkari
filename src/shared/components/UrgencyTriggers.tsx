"use client";

import React from "react";
import { Clock, Flame } from "lucide-react";
import { cn } from "@/shared/utils";
import { MADE_TO_ORDER_DAYS } from "@/shared/lib/inventory";

interface StockAlertProps {
  stock: number;
  lowStockThreshold?: number;
}

export function StockAlert({ stock, lowStockThreshold = 5 }: StockAlertProps) {
  if (stock <= 0) {
    return (
      <div className="flex items-center gap-2 text-[#A07840] bg-[#FDFBF6] px-3 py-2 rounded-lg">
        <Clock className="w-4 h-4" />
        <span className="text-sm font-medium">
          Made to order · {MADE_TO_ORDER_DAYS}
        </span>
      </div>
    );
  }

  if (stock <= lowStockThreshold) {
    return (
      <div className="flex items-center gap-2 text-amber-700 bg-amber-50 px-3 py-2 rounded-lg animate-pulse">
        <Flame className="w-4 h-4" />
        <span className="text-sm font-medium">
          Only {stock} left — order soon!
        </span>
      </div>
    );
  }

  return null; // Don't show anything for normal stock levels
}

interface SaleCountdownProps {
  endDate: Date;
  label?: string;
}

export function SaleCountdown({ endDate, label = "Sale ends in" }: SaleCountdownProps) {
  const [timeLeft, setTimeLeft] = React.useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = endDate.getTime() - new Date().getTime();
    
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      expired: false,
    };
  }

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  if (timeLeft.expired) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 bg-gradient-to-r from-red-500 to-rose-500 text-white px-4 py-2 rounded-lg">
      <Clock className="w-4 h-4" />
      <span className="text-sm font-medium">{label}</span>
      <div className="flex gap-1.5">
        {timeLeft.days > 0 && (
          <TimeBlock value={timeLeft.days} label="d" />
        )}
        <TimeBlock value={timeLeft.hours} label="h" />
        <TimeBlock value={timeLeft.minutes} label="m" />
        <TimeBlock value={timeLeft.seconds} label="s" />
      </div>
    </div>
  );
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-center">
      <span className="font-mono font-bold text-lg">
        {value.toString().padStart(2, "0")}
      </span>
      <span className="text-xs opacity-80 ml-0.5">{label}</span>
    </div>
  );
}

interface SavingsBadgeProps {
  originalPrice: number;
  salePrice: number;
  className?: string;
}

export function SavingsBadge({ originalPrice, salePrice, className }: SavingsBadgeProps) {
  const savings = originalPrice - salePrice;
  const percentage = Math.round((savings / originalPrice) * 100);

  if (savings <= 0) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full",
        className
      )}
    >
      You save {percentage}%
    </span>
  );
}

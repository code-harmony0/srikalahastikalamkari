"use client";

import { Edit, Trash2, Calendar, Users, Percent, IndianRupee } from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_amount: number;
  max_discount_amount: number | null;
  usage_limit: number | null;
  used_count: number;
  starts_at: string;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

interface CouponCardProps {
  coupon: Coupon;
  onToggleActive: (coupon: Coupon) => void;
  onEdit: (coupon: Coupon) => void;
  onDelete: (id: string) => void;
}

export default function CouponCard({ coupon, onToggleActive, onEdit, onDelete }: CouponCardProps) {
  return (
    <div
      className={`rounded-xl overflow-hidden transition-all hover:shadow-md ${
        coupon.is_active 
          ? 'bg-white border border-emerald-200' 
          : 'bg-slate-50 border border-slate-200'
      }`}
    >
      <div className="flex">
        {/* Left: Discount Badge */}
        <div 
          className={`w-32 flex flex-col items-center justify-center py-6 ${
            coupon.is_active 
              ? 'bg-emerald-600' 
              : 'bg-slate-400'
          }`}
        >
          <div className="text-white text-center">
            <div className="flex items-center justify-center gap-1">
              {coupon.discount_type === "percentage" ? (
                <>
                  <span className="text-4xl font-black">{coupon.discount_value}</span>
                  <Percent className="w-6 h-6 mt-1" />
                </>
              ) : (
                <>
                  <IndianRupee className="w-5 h-5" />
                  <span className="text-4xl font-black">{coupon.discount_value}</span>
                </>
              )}
            </div>
            <div className="text-sm font-bold mt-1 opacity-90 uppercase tracking-wider">OFF</div>
          </div>
        </div>

        {/* Right: Info + Actions */}
        <div className="flex-1 p-4 flex items-center justify-between gap-4">
          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span 
                className={`font-mono text-xl font-black tracking-tight ${
                  coupon.is_active ? 'text-slate-900' : 'text-slate-500'
                }`}
              >
                {coupon.code}
              </span>
              {coupon.is_active ? (
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                  Active
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-xs font-semibold rounded-full">
                  Inactive
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 mb-2 truncate">
              {coupon.description || "No description"}
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span className="font-medium text-slate-600">{coupon.used_count}/{coupon.usage_limit || "∞"}</span>
                used
              </span>
              {coupon.min_order_amount > 0 && (
                <span className="flex items-center gap-1">
                  <IndianRupee className="w-3 h-3" />
                  <span className="font-medium text-slate-600">{coupon.min_order_amount}</span>
                  min
                </span>
              )}
              {coupon.expires_at && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="font-medium text-slate-600">
                    {new Date(coupon.expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleActive(coupon)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                coupon.is_active 
                  ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' 
                  : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
              }`}
            >
              {coupon.is_active ? "Deactivate" : "Activate"}
            </button>
            <button
              onClick={() => onEdit(coupon)}
              className="p-2.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(coupon.id)}
              className="p-2.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

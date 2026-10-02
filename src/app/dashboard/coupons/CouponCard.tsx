"use client";

import { Calendar, Users, Percent, IndianRupee, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

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
  // Check if actually expired
  const isExpired = coupon.expires_at ? new Date(coupon.expires_at) < new Date() : false;
  const isEffectivelyActive = coupon.is_active && !isExpired;

  return (
    <div
      className={`rounded-2xl overflow-hidden transition-all flex flex-col ${
        isEffectivelyActive 
          ? 'bg-white border border-slate-200 shadow-sm hover:shadow-md' 
          : 'bg-slate-50/50 border border-slate-200/60 opacity-70'
      }`}
    >
      {/* Top Section - Discount & Code */}
      <div className={`p-5 border-b flex items-center justify-between ${isEffectivelyActive ? 'border-slate-100 bg-slate-50/30' : 'border-slate-200/50'}`}>
        <div className="flex items-center gap-4">
          {/* Discount Badge */}
          <div className={`flex items-center justify-center shrink-0 w-16 h-16 rounded-2xl ${
            isEffectivelyActive ? 'bg-slate-900 text-white' : 'bg-slate-300 text-slate-600'
          }`}>
            <div className="text-center flex items-center justify-center -space-x-0.5">
              {coupon.discount_type === "percentage" ? (
                <>
                  <span className="text-2xl font-bold tracking-tight">{coupon.discount_value}</span>
                  <Percent className="w-4 h-4 mb-1" />
                </>
              ) : (
                <>
                  <IndianRupee className="w-4 h-4 mb-0.5" />
                  <span className="text-2xl font-bold tracking-tight">{coupon.discount_value}</span>
                </>
              )}
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`font-mono text-xl font-black tracking-tight ${isEffectivelyActive ? 'text-slate-900' : 'text-slate-500'}`}>
                {coupon.code}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {coupon.is_active ? (
                isExpired ? (
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold uppercase tracking-wider rounded-full">
                    Expired
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded-full">
                    Active
                  </span>
                )
              ) : (
                <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded-full">
                  Inactive
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="p-2 -mr-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none">
            <MoreHorizontal className="w-5 h-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            <DropdownMenuItem onClick={() => onEdit(coupon)} className="cursor-pointer">
              <Edit className="w-4 h-4 mr-2" /> Edit Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(coupon.id)} className="cursor-pointer text-red-600 focus:text-red-600">
              <Trash2 className="w-4 h-4 mr-2" /> Delete Coupon
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Bottom Section - Details & Main Action */}
      <div className="p-5 flex flex-col justify-between flex-1 gap-4">
        <div className="space-y-3 flex-1">
          {coupon.description && (
            <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
              {coupon.description}
            </p>
          )}
          
          <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs text-slate-500 pt-2">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">
                <span className="font-medium text-slate-700">{coupon.used_count}</span>
                /{coupon.usage_limit || "∞"} used
              </span>
            </div>
            
            {coupon.min_order_amount > 0 && (
              <div className="flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">
                  Min: <span className="font-medium text-slate-700">{coupon.min_order_amount}</span>
                </span>
              </div>
            )}
            
            {coupon.max_discount_amount && (
              <div className="flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">
                  Max: <span className="font-medium text-slate-700">{coupon.max_discount_amount}</span>
                </span>
              </div>
            )}
            
            {coupon.expires_at && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className={`truncate ${isExpired ? 'text-red-600 font-medium' : ''}`}>
                  {isExpired ? 'Expired ' : 'Ends '}
                  <span className={!isExpired ? "font-medium text-slate-700" : ""}>
                    {new Date(coupon.expires_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => onToggleActive(coupon)}
          className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${
            coupon.is_active 
              ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' 
              : 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm'
          }`}
        >
          {coupon.is_active ? "Deactivate Coupon" : "Activate Coupon"}
        </button>
      </div>
    </div>
  );
}
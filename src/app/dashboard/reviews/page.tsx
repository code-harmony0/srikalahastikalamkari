"use client";

import React, { useState } from "react";
import { useAdminReviews, Review } from "@/shared/hooks/use-reviews";
import { StarRating } from "@/shared/ui/star-rating";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { OptimizedImage } from "@/components/shared/OptimizedImage";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/app/dashboard/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import {
  MessageSquare,
  CheckCircle2,
  XCircle,
  Trash2,
  Star,
  Loader2,
  MoreHorizontal,
  Box,
  AlertCircle
} from "lucide-react";
import { cn } from "@/shared/utils";

type FilterStatus = "all" | "pending" | "approved" | "rejected";

export default function ReviewsPage() {
  const { reviews, isLoading, approveReview, rejectReview, deleteReview, toggleFeatured } = useAdminReviews();
  const [filter, setFilter] = useState<FilterStatus>("all");

  const filteredReviews = reviews.filter((r) => {
    const isRejected = !r.is_approved && r.helpful_count < 0;
    const isPending = !r.is_approved && r.helpful_count >= 0;
    
    if (filter === "pending") return isPending;
    if (filter === "approved") return r.is_approved;
    if (filter === "rejected") return isRejected;
    return true;
  });

  const pendingCount = reviews.filter((r) => !r.is_approved && r.helpful_count >= 0).length;

  const handleApprove = async (id: string) => {
    await approveReview(id);
    toast.success("Review approved");
  };

  const handleReject = async (id: string) => {
    await rejectReview(id);
    toast.success("Review rejected");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this review?")) return;
    await deleteReview(id);
    toast.success("Review deleted");
  };

  const handleToggleFeatured = async (id: string, current: boolean) => {
    await toggleFeatured(id, current);
    toast.success(current ? "Removed from featured" : "Added to featured");
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto min-h-screen bg-white">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Reviews</h1>
          <p className="text-slate-500 mt-2 text-base">Moderate customer feedback before it appears on your storefront.</p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm mb-6">
        <div className="flex gap-2 w-full overflow-x-auto">
          {(["all", "pending", "approved", "rejected"] as FilterStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-colors capitalize whitespace-nowrap flex items-center gap-2",
                filter === status
                  ? "bg-slate-100 text-slate-900 shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              )}
            >
              {status}
              {status === "pending" && pendingCount > 0 && (
                <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div>
        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
              <span className="text-sm font-medium">Loading reviews...</span>
            </div>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="h-6 w-6 text-slate-300" />
            </div>
            <h3 className="text-sm font-medium text-slate-500 mb-1">
              {filter === "pending" ? "No pending reviews" : 
               filter === "rejected" ? "No rejected reviews" : "No reviews found"}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              {filter === "pending"
                ? "All reviews have been moderated."
                : "Adjust your filters or check back later."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {filteredReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onApprove={handleApprove}
                onReject={handleReject}
                onDelete={handleDelete}
                onToggleFeatured={handleToggleFeatured}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface ReviewCardProps {
  review: Review;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleFeatured: (id: string, current: boolean) => void;
}

function ReviewCard({ review, onApprove, onReject, onDelete, onToggleFeatured }: ReviewCardProps) {
  const isRejected = !review.is_approved && review.helpful_count < 0;
  const isPending = !review.is_approved && review.helpful_count >= 0;
  
  const productImage = review.products?.images?.[0];
  const productName = review.products?.name || "Unknown Product";

  const getStatusBadge = () => {
    if (isPending) {
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 px-3 py-1 flex items-center gap-1.5 w-fit rounded-full font-medium shadow-sm">
          <AlertCircle className="h-3.5 w-3.5" />
          <span className="capitalize">Pending</span>
        </Badge>
      );
    }
    if (isRejected) {
      return (
        <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200 px-3 py-1 flex items-center gap-1.5 w-fit rounded-full font-medium shadow-sm">
          <XCircle className="h-3.5 w-3.5" />
          <span className="capitalize">Rejected</span>
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 px-3 py-1 flex items-center gap-1.5 w-fit rounded-full font-medium shadow-sm">
        <CheckCircle2 className="h-3.5 w-3.5" />
        <span className="capitalize">Approved</span>
      </Badge>
    );
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition-colors hover:border-slate-300 flex flex-col h-full">
      <div className="flex justify-between items-start mb-3 gap-4">
        <div className="flex items-center gap-3 bg-slate-50/50 p-2 rounded-xl border border-slate-100 flex-1 min-w-0">
          <div className="w-10 h-10 shrink-0 bg-white rounded-lg overflow-hidden relative flex items-center justify-center border border-slate-200/60 shadow-sm">
            {productImage ? (
              <OptimizedImage
                src={productImage}
                alt={productName}
                fill
                className="object-cover"
                imageType="thumbnail"
                sizes="40px"
              />
            ) : (
              <Box className="w-4 h-4 text-slate-400" />
            )}
          </div>
          <div className="min-w-0 pr-2">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">Product</p>
            <p className="text-sm font-semibold text-slate-900 truncate">{productName}</p>
          </div>
        </div>
        
        <div>{getStatusBadge()}</div>
      </div>

      <div className="mb-4 flex-1">
        <div className="flex items-center flex-wrap gap-x-3 gap-y-2 mb-2">
          <span className="font-bold text-slate-900 text-sm">{review.customer_name}</span>
          <StarRating rating={review.rating} size="sm" />
          
          <div className="flex items-center gap-1.5 ml-auto">
            {review.is_featured && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 px-2 py-0.5 flex items-center gap-1 rounded-full font-medium shadow-sm">
                <Star className="w-3 h-3 fill-current" />
                <span>Featured</span>
              </Badge>
            )}
            {review.is_verified_purchase && (
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 px-2 py-0.5 rounded-full font-medium shadow-sm">
                Verified
              </Badge>
            )}
          </div>
        </div>

        {review.title && (
          <h4 className="font-semibold text-slate-900 mb-1">{review.title}</h4>
        )}
        {review.content && (
          <p className="text-sm text-slate-500 line-clamp-3 mt-1 leading-relaxed">{review.content}</p>
        )}
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
        <span className="text-xs font-medium text-slate-400">
          {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
        
        <div className="flex items-center gap-2">
          {isPending && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-3 text-xs border-slate-200 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-100 transition-all rounded-lg gap-1.5"
              onClick={() => onApprove(review.id)}
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Approve
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600 bg-slate-50">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              {isPending && (
                <DropdownMenuItem 
                  onClick={() => onReject(review.id)}
                  className="text-red-600 focus:text-red-600 cursor-pointer"
                >
                  <XCircle className="h-4 w-4 mr-2" /> Reject Review
                </DropdownMenuItem>
              )}
              {isRejected && (
                <DropdownMenuItem 
                  onClick={() => onApprove(review.id)}
                  className="text-emerald-600 focus:text-emerald-600 cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" /> Re-Approve
                </DropdownMenuItem>
              )}
              {review.is_approved && (
                <DropdownMenuItem onClick={() => onToggleFeatured(review.id, review.is_featured)} className="cursor-pointer">
                  <Star className={cn("w-4 h-4 mr-2", review.is_featured ? "fill-purple-500 text-purple-500" : "text-slate-500")} /> 
                  {review.is_featured ? "Unfeature" : "Feature"}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onDelete(review.id)} className="cursor-pointer text-red-600 focus:text-red-600">
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
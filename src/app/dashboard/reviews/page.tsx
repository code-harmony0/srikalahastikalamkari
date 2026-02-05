"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAllReviews, Review } from "@/shared/hooks/use-reviews";
import { StarRating } from "@/shared/ui/star-rating";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
  MessageSquare,
  CheckCircle2,
  XCircle,
  Trash2,
  Star,
  Loader2,
  Eye,
  Filter,
} from "lucide-react";
import { cn } from "@/shared/utils";

type FilterStatus = "all" | "pending" | "approved";

export default function ReviewsPage() {
  const { reviews, isLoading, approveReview, deleteReview, toggleFeatured, refetch } = useAllReviews();
  const [filter, setFilter] = useState<FilterStatus>("all");

  const filteredReviews = reviews.filter((r) => {
    if (filter === "pending") return !r.is_approved;
    if (filter === "approved") return r.is_approved;
    return true;
  });

  const pendingCount = reviews.filter((r) => !r.is_approved).length;

  const handleApprove = async (id: string) => {
    await approveReview(id);
    toast.success("Review approved");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    await deleteReview(id);
    toast.success("Review deleted");
  };

  const handleToggleFeatured = async (id: string, current: boolean) => {
    await toggleFeatured(id, current);
    toast.success(current ? "Removed from featured" : "Added to featured");
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Reviews</h1>
          <p className="text-slate-500 text-sm mt-1">
            Moderate customer reviews
            {pendingCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                {pendingCount} pending
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit">
        {(["all", "pending", "approved"] as FilterStatus[]).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-colors capitalize",
              filter === status
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            {status}
            {status === "pending" && pendingCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-amber-500 text-white text-xs rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
          <MessageSquare className="w-12 h-12 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-700">
            {filter === "pending" ? "No pending reviews" : "No reviews yet"}
          </h3>
          <p className="text-slate-500 text-sm mt-1">
            {filter === "pending"
              ? "All reviews have been moderated"
              : "Reviews will appear here when customers submit them"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onApprove={handleApprove}
              onDelete={handleDelete}
              onToggleFeatured={handleToggleFeatured}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ReviewCardProps {
  review: Review;
  onApprove: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleFeatured: (id: string, current: boolean) => void;
}

function ReviewCard({ review, onApprove, onDelete, onToggleFeatured }: ReviewCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-white rounded-xl border p-5",
        !review.is_approved ? "border-amber-200 bg-amber-50/30" : "border-slate-100"
      )}
    >
      <div className="flex items-start gap-4">
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <span className="font-medium text-slate-900">{review.customer_name}</span>
            <StarRating rating={review.rating} size="sm" />
            <span className="text-xs text-slate-400">
              {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
            </span>
            
            {/* Status Badges */}
            <div className="flex items-center gap-2">
              {!review.is_approved && (
                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                  Pending
                </span>
              )}
              {review.is_featured && (
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  Featured
                </span>
              )}
              {review.is_verified_purchase && (
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                  Verified
                </span>
              )}
            </div>
          </div>

          {/* Title & Content */}
          {review.title && (
            <h4 className="font-semibold text-slate-800 mb-1">{review.title}</h4>
          )}
          {review.content && (
            <p className="text-sm text-slate-600">{review.content}</p>
          )}

          {/* Meta */}
          <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
            <span>Product ID: {review.product_id.slice(0, 8)}...</span>
            <span>{review.helpful_count} helpful votes</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {!review.is_approved && (
            <button
              onClick={() => onApprove(review.id)}
              className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-600"
              title="Approve"
            >
              <CheckCircle2 className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={() => onToggleFeatured(review.id, review.is_featured)}
            className={cn(
              "p-2 rounded-lg transition-colors",
              review.is_featured
                ? "bg-purple-50 text-purple-600"
                : "hover:bg-slate-100 text-slate-400"
            )}
            title={review.is_featured ? "Remove from featured" : "Add to featured"}
          >
            <Star className={cn("w-5 h-5", review.is_featured && "fill-current")} />
          </button>
          <button
            onClick={() => onDelete(review.id)}
            className="p-2 rounded-lg hover:bg-red-50 text-red-500"
            title="Delete"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

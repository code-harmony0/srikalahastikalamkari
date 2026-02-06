"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReviews, Review } from "@/shared/hooks/use-reviews";
import { StarRating, RatingDistribution } from "@/shared/ui/star-rating";
import { formatDistanceToNow } from "date-fns";
import {
  MessageSquare,
  ThumbsUp,
  CheckCircle2,
  ChevronDown,
  Send,
  User,
  Loader2,
  Star,
} from "lucide-react";
import { cn } from "@/shared/utils";
import { toast } from "sonner";
import { useAuth } from "@/shared/contexts/AuthContext";
import { hasPurchasedProduct } from "@/services/orders";
import { useEffect } from "react";


interface ProductReviewsProps {
  productId: string;
  productName: string;
}

export function ProductReviews({ productId, productName }: ProductReviewsProps) {
  const {
    reviews,
    averageRating,
    totalReviews,
    ratingDistribution,
    isLoading,
    submitReview,
    markHelpful,
  } = useReviews(productId);


  const [showAll, setShowAll] = useState(false);
  const displayedReviews = showAll ? reviews : reviews.slice(0, 3);

  if (isLoading) {
    return (
      <div className="py-12 flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#C19A5B]" />
      </div>
    );
  }

  return (
    <div className="py-12 border-t border-[#EAD6C3]">
      {/* Header */}
      {totalReviews === 0 ? (
        <div className="text-center py-16 bg-[#FFF8F0] rounded-2xl border border-[#EAD6C3] px-6">
          <div className="w-16 h-16 bg-[#EAD6C3]/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#EAD6C3]">
            <Star className="w-8 h-8 text-[#A4552A]" fill="currentColor" />
          </div>
          <h3 className="font-playfair text-xl font-bold text-[#3B2C23] mb-2">
            Be the First to Own a Masterpiece
          </h3>
          <p className="text-[#7A6A5C] max-w-md mx-auto mb-6 leading-relaxed">
            This authentic Kalamkari piece is waiting for its home. Purchase now and perform the first review to share your experience with the world.
          </p>
          <div className="inline-flex items-center justify-center px-4 py-1.5 bg-[#FFF4E8] rounded-full border border-[#EAD6C3]/50 text-xs font-medium text-[#A4552A]">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
            Verified Purchase Required for Review
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedReviews.map((review) => (
            <ReviewCard key={review.id} review={review} onHelpful={markHelpful} />
          ))}

          {reviews.length > 3 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="w-full py-3 text-[#A4552A] font-medium flex items-center justify-center gap-2 hover:bg-[#FFF8F0] rounded-lg transition-colors"
            >
              {showAll ? "Show Less" : `Show All ${reviews.length} Reviews`}
              <ChevronDown
                className={cn(
                  "w-4 h-4 transition-transform",
                  showAll && "rotate-180"
                )}
              />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

interface ReviewCardProps {
  review: Review;
  onHelpful: (id: string) => void;
}

function ReviewCard({ review, onHelpful }: ReviewCardProps) {
  const [hasVoted, setHasVoted] = useState(false);

  const handleHelpful = () => {
    if (hasVoted) return;
    onHelpful(review.id);
    setHasVoted(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-[#EAD6C3] p-5"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#FFF8F0] border border-[#EAD6C3] flex items-center justify-center">
            <User className="w-5 h-5 text-[#C19A5B]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-[#3B2C23]">
                {review.customer_name}
              </span>
              {review.is_verified_purchase && (
                <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified
                </span>
              )}
            </div>
            <span className="text-xs text-[#3B2C23]/50">
              {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
            </span>
          </div>
        </div>
        <StarRating rating={review.rating} size="sm" />
      </div>

      {/* Content */}
      {review.title && (
        <h4 className="font-semibold text-[#3B2C23] mb-1">{review.title}</h4>
      )}
      {review.content && (
        <p className="text-sm text-[#3B2C23]/70 leading-relaxed">{review.content}</p>
      )}

      {/* Footer */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[#EAD6C3]/50">
        <button
          onClick={handleHelpful}
          disabled={hasVoted}
          className={cn(
            "flex items-center gap-1.5 text-xs transition-colors",
            hasVoted
              ? "text-[#A4552A] cursor-default"
              : "text-[#3B2C23]/50 hover:text-[#A4552A]"
          )}
        >
          <ThumbsUp className="w-3.5 h-3.5" />
          Helpful ({review.helpful_count})
        </button>
      </div>
    </motion.div>
  );
}

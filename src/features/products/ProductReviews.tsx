"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useReviews, Review } from "@/shared/hooks/use-reviews";
import { StarRating } from "@/shared/ui/star-rating";
import { formatDistanceToNow } from "date-fns";
import { ThumbsUp, CheckCircle2, ChevronDown, User } from "lucide-react";
import { cn } from "@/shared/utils";

interface ProductReviewsProps {
  productId: string;
  productName: string;
}

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-royal))] focus-visible:ring-offset-2";

/**
 * Approved reviews for one piece. Renders nothing until real reviews exist,
 * so the product page never shows an empty "be the first" box.
 */
export function ProductReviews({ productId }: ProductReviewsProps) {
  const { reviews, totalReviews, isLoading, markHelpful } = useReviews(productId);
  const [showAll, setShowAll] = useState(false);

  if (isLoading || totalReviews === 0) return null;

  const displayedReviews = showAll ? reviews : reviews.slice(0, 3);

  return (
    <div className="mt-10 space-y-4">
      {displayedReviews.map((review) => (
        <ReviewCard key={review.id} review={review} onHelpful={markHelpful} />
      ))}

      {reviews.length > 3 && (
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-sm font-sans text-[14px] font-semibold text-[hsl(var(--brand-ink))] underline decoration-[hsl(var(--brand-gold))] decoration-2 underline-offset-[6px] hover:decoration-[hsl(var(--brand-ink))]",
              focusRing,
            )}
          >
            {showAll ? "Show fewer reviews" : `Show all ${reviews.length} reviews`}
            <ChevronDown className={cn("h-4 w-4 transition-transform", showAll && "rotate-180")} />
          </button>
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
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-sm border border-[hsl(var(--brand-gold)/0.55)] bg-white p-5 sm:p-6"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[hsl(var(--brand-gold)/0.55)] bg-white">
            <User className="h-5 w-5 text-[hsl(var(--brand-ink))]" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-sans text-[15px] font-semibold text-[hsl(var(--brand-ink))]">
                {review.customer_name}
              </span>
              {review.is_verified_purchase && (
                <span className="flex items-center gap-1 rounded-full bg-[hsl(var(--brand-leaf-tint))] px-2 py-0.5 font-sans text-[12px] font-medium text-[#1F6B3A]">
                  <CheckCircle2 className="h-3 w-3" />
                  Verified buyer
                </span>
              )}
            </div>
            <span className="font-sans text-[13px] text-[hsl(var(--brand-muted))]">
              {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
            </span>
          </div>
        </div>
        <StarRating rating={review.rating} size="sm" />
      </div>

      {review.title && (
        <h3 className="mb-1 font-sans text-[15px] font-semibold text-[hsl(var(--brand-ink))]">{review.title}</h3>
      )}
      {review.content && (
        <p className="font-sans text-[15px] leading-relaxed text-[hsl(var(--brand-ink-soft))]">{review.content}</p>
      )}

      <div className="mt-4 flex items-center gap-4 border-t border-dotted border-[hsl(var(--brand-gold-ornament)/0.6)] pt-3">
        <button
          type="button"
          onClick={handleHelpful}
          disabled={hasVoted}
          className={cn(
            "flex min-h-[40px] items-center gap-1.5 rounded-sm font-sans text-[13px] font-medium transition-colors",
            focusRing,
            hasVoted
              ? "cursor-default text-[hsl(var(--brand-ink))]"
              : "text-[hsl(var(--brand-ink-soft))] hover:text-[hsl(var(--brand-ink))]",
          )}
        >
          <ThumbsUp className={cn("h-4 w-4", hasVoted && "fill-current")} />
          Helpful ({review.helpful_count})
        </button>
      </div>
    </motion.article>
  );
}

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
} from "lucide-react";
import { cn } from "@/shared/utils";
import { toast } from "sonner";

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

  const [showForm, setShowForm] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    rating: 5,
    title: "",
    content: "",
  });

  const displayedReviews = showAll ? reviews : reviews.slice(0, 3);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customer_name || !formData.rating) {
      toast.error("Please fill in required fields");
      return;
    }

    setSubmitting(true);
    const success = await submitReview({
      product_id: productId,
      customer_name: formData.customer_name,
      customer_email: formData.customer_email || null,
      rating: formData.rating,
      title: formData.title || null,
      content: formData.content || null,
    });

    if (success) {
      toast.success("Review submitted!", {
        description: "Your review will appear after moderation.",
      });
      setFormData({
        customer_name: "",
        customer_email: "",
        rating: 5,
        title: "",
        content: "",
      });
      setShowForm(false);
    } else {
      toast.error("Failed to submit review");
    }
    setSubmitting(false);
  };

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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-playfair text-2xl font-bold text-[#3B2C23]">
            Customer Reviews
          </h2>
          <p className="text-sm text-[#3B2C23]/60 mt-1">
            {totalReviews} review{totalReviews !== 1 ? "s" : ""} for {productName}
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-[#3B2C23] text-white text-sm font-medium rounded-lg hover:bg-[#3B2C23]/90 transition-colors flex items-center gap-2"
        >
          <MessageSquare className="w-4 h-4" />
          Write a Review
        </button>
      </div>

      {/* Summary Section */}
      {totalReviews > 0 && (
        <div className="grid md:grid-cols-2 gap-8 mb-10 p-6 bg-[#FFF8F0] rounded-2xl border border-[#EAD6C3]">
          {/* Average Rating */}
          <div className="text-center md:text-left">
            <div className="text-5xl font-bold text-[#3B2C23] mb-2">
              {averageRating.toFixed(1)}
            </div>
            <StarRating rating={averageRating} size="lg" />
            <p className="text-sm text-[#3B2C23]/60 mt-2">
              Based on {totalReviews} review{totalReviews !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Distribution */}
          <RatingDistribution distribution={ratingDistribution} total={totalReviews} />
        </div>
      )}

      {/* Review Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl border border-[#EAD6C3] p-6 space-y-4"
            >
              <h3 className="font-playfair text-lg font-bold text-[#3B2C23] mb-4">
                Share Your Experience
              </h3>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-[#3B2C23]/80 mb-2">
                  Your Rating *
                </label>
                <StarRating
                  rating={formData.rating}
                  size="lg"
                  interactive
                  onChange={(rating) => setFormData({ ...formData, rating })}
                />
              </div>

              {/* Name & Email */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#3B2C23]/80 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 border border-[#EAD6C3] rounded-lg focus:outline-none focus:border-[#C19A5B]"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#3B2C23]/80 mb-1">
                    Email (optional)
                  </label>
                  <input
                    type="email"
                    value={formData.customer_email}
                    onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-[#EAD6C3] rounded-lg focus:outline-none focus:border-[#C19A5B]"
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-[#3B2C23]/80 mb-1">
                  Review Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 border border-[#EAD6C3] rounded-lg focus:outline-none focus:border-[#C19A5B]"
                  placeholder="Summarize your experience"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-[#3B2C23]/80 mb-1">
                  Your Review
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2.5 border border-[#EAD6C3] rounded-lg focus:outline-none focus:border-[#C19A5B] resize-none"
                  placeholder="Share your thoughts about this product..."
                />
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2.5 border border-[#EAD6C3] text-[#3B2C23] rounded-lg hover:bg-[#FFF8F0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-[#A4552A] text-white rounded-lg hover:bg-[#8B3F20] disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Submit Review
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reviews List */}
      {totalReviews === 0 ? (
        <div className="text-center py-12 bg-[#FFF8F0] rounded-2xl border border-[#EAD6C3]">
          <MessageSquare className="w-12 h-12 mx-auto text-[#C19A5B]/40 mb-4" />
          <h3 className="font-playfair text-lg font-bold text-[#3B2C23]">
            No reviews yet
          </h3>
          <p className="text-sm text-[#3B2C23]/60 mt-1">
            Be the first to review this product!
          </p>
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

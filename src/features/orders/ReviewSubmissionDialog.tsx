"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/shared/contexts/AuthContext";
import { useReviews } from "@/shared/hooks/use-reviews";
import { StarRating } from "@/shared/ui/star-rating";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/ui/dialog";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import { OptimizedImage } from "@/components/shared/OptimizedImage";

interface ReviewSubmissionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  productImage: string;
}

export function ReviewSubmissionDialog({
  isOpen,
  onClose,
  productId,
  productName,
  productImage,
}: ReviewSubmissionDialogProps) {
  const { user } = useAuth();
  const { submitReview } = useReviews(productId);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    rating: 5,
    title: "",
    content: "",
  });

  // Pre-fill form for logged-in users
  useEffect(() => {
    if (user && isOpen) {
      setFormData(prev => ({
        ...prev,
        customer_name: user.displayName || prev.customer_name,
        customer_email: user.email || prev.customer_email,
      }));
    }
  }, [user, isOpen]);

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
      onClose();
    } else {
      toast.error("Failed to submit review");
    }
    setSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white border border-[#C19A5B]/20">
        <DialogHeader>
          <DialogTitle className="font-playfair text-2xl font-bold text-[#1A1512]">
            Write a Review
          </DialogTitle>
          <DialogDescription className="text-[#1A1512]/60">
            Share your experience with this product
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-4 py-4 border-b border-[#C19A5B]/10 mb-4">
          <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-[#C19A5B]/20">
            <OptimizedImage
              src={productImage}
              alt={productName}
              fill
              className="object-cover"
              imageType="thumbnail"
              sizes="64px"
              placeholder="empty"
            />
          </div>
          <div>
            <h4 className="font-medium text-[#1A1512] line-clamp-1">
              {productName}
            </h4>
            <p className="text-xs text-[#1A1512]/60">Verified Purchase</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating */}
          <div className="flex flex-col items-center py-2 bg-white rounded-xl border border-[#C19A5B]/20">
            <label className="text-sm font-medium text-[#1A1512]/80 mb-2">
              Rate this product
            </label>
            <StarRating
              rating={formData.rating}
              size="lg"
              interactive
              onChange={(rating) => setFormData({ ...formData, rating })}
            />
          </div>

          {/* Name & Title */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1A1512]/80 mb-1">
                Your Name *
              </label>
              <input
                type="text"
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                required
                className="w-full px-3 py-2 border border-[#C19A5B]/20 rounded-lg focus:outline-none focus:border-[#C19A5B] bg-white text-sm text-[#1A1512]"
                placeholder="Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1512]/80 mb-1">
                Review Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-[#C19A5B]/20 rounded-lg focus:outline-none focus:border-[#C19A5B] bg-white text-sm text-[#1A1512]"
                placeholder="Title"
              />
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-[#1A1512]/80 mb-1">
              Your Review
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-[#C19A5B]/20 rounded-lg focus:outline-none focus:border-[#C19A5B] bg-white resize-none text-sm text-[#1A1512]"
              placeholder="What did you like or dislike?"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#C19A5B]/20 text-[#1A1512] rounded-lg hover:bg-[#C19A5B]/10 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-[#1A1512] text-white rounded-lg hover:bg-[#C19A5B] disabled:opacity-50 flex items-center gap-2 text-sm font-medium"
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
      </DialogContent>
    </Dialog>
  );
}

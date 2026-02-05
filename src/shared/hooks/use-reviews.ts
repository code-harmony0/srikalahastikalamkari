"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  getAllReviews as getAllReviewsAction,
  approveReview as approveReviewAction,
  deleteReview as deleteReviewAction,
  toggleReviewFeatured as toggleReviewFeaturedAction,
} from "@/app/dashboard/reviews/actions";

export interface Review {
  id: string;
  product_id: string;
  customer_name: string;
  customer_email: string | null;
  rating: number;
  title: string | null;
  content: string | null;
  is_verified_purchase: boolean;
  is_approved: boolean;
  is_featured: boolean;
  helpful_count: number;
  created_at: string;
}

interface UseReviewsReturn {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { [key: number]: number };
  isLoading: boolean;
  error: string | null;
  submitReview: (review: Omit<Review, 'id' | 'is_approved' | 'is_featured' | 'helpful_count' | 'created_at' | 'is_verified_purchase'>) => Promise<boolean>;
  markHelpful: (reviewId: string) => Promise<void>;
}

export function useReviews(productId: string): UseReviewsReturn {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    if (!productId) return;
    
    setIsLoading(true);
    const { data, error: fetchError } = await supabase
      .from("reviews" as any)
      .select("*")
      .eq("product_id", productId)
      .eq("is_approved", true)
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError("Failed to load reviews");
    } else {
      setReviews((data as unknown as Review[]) || []);
    }
    setIsLoading(false);
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Calculate stats
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) * 10) / 10
    : 0;

  const ratingDistribution = reviews.reduce((acc, r) => {
    acc[r.rating] = (acc[r.rating] || 0) + 1;
    return acc;
  }, {} as { [key: number]: number });

  const submitReview = async (review: Omit<Review, 'id' | 'is_approved' | 'is_featured' | 'helpful_count' | 'created_at' | 'is_verified_purchase'>): Promise<boolean> => {
    try {
      const { error: insertError } = await supabase
        .from("reviews" as any)
        .insert({
          ...review,
          is_approved: false, // Requires moderation
          is_verified_purchase: false,
          helpful_count: 0,
        } as any);

      if (insertError) {
        setError("Failed to submit review");
        return false;
      }
      return true;
    } catch (err) {
      setError("Failed to submit review");
      return false;
    }
  };

  const markHelpful = async (reviewId: string): Promise<void> => {
    const review = reviews.find(r => r.id === reviewId);
    if (!review) return;

    await supabase
      .from("reviews" as any)
      .update({ helpful_count: review.helpful_count + 1 } as any)
      .eq("id", reviewId);

    // Update local state
    setReviews(prev => prev.map(r => 
      r.id === reviewId ? { ...r, helpful_count: r.helpful_count + 1 } : r
    ));
  };

  return {
    reviews,
    averageRating,
    totalReviews,
    ratingDistribution,
    isLoading,
    error,
    submitReview,
    markHelpful,
  };
}

/**
 * Hook for admin to fetch all reviews (including unapproved)
 */
export function useAllReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAllReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAllReviewsAction();
      setReviews((data as unknown as Review[]) || []);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchAllReviews();
  }, [fetchAllReviews]);

  const approveReview = async (id: string) => {
    try {
      await approveReviewAction(id);
      fetchAllReviews();
    } catch (error) {
      console.error("Failed to approve review:", error);
    }
  };

  const deleteReview = async (id: string) => {
    try {
      await deleteReviewAction(id);
      fetchAllReviews();
    } catch (error) {
      console.error("Failed to delete review:", error);
    }
  };

  const toggleFeatured = async (id: string, current: boolean) => {
    try {
      await toggleReviewFeaturedAction(id, current);
      fetchAllReviews();
    } catch (error) {
      console.error("Failed to toggle featured:", error);
    }
  };

  return {
    reviews,
    isLoading,
    approveReview,
    deleteReview,
    toggleFeatured,
    refetch: fetchAllReviews,
  };
}

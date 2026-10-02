"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminReviews,
  approveReview as approveReviewAction,
  rejectReview as rejectReviewAction,
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
  products?: {
    name: string;
    images: string[];
  };
}

interface UseReviewsReturn {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { [key: number]: number };
  isLoading: boolean;
  error: string | null;
  submitReview: (review: Omit<Review, 'id' | 'is_approved' | 'is_featured' | 'helpful_count' | 'created_at' | 'is_verified_purchase' | 'products'>) => Promise<boolean>;
  markHelpful: (reviewId: string) => Promise<void>;
}

export function useReviews(productId: string): UseReviewsReturn {
  const queryClient = useQueryClient();

  const { data: reviews = [], isLoading, error } = useQuery({
    queryKey: ["reviews", "product", productId],
    queryFn: async () => {
      if (!productId) return [];
      const { data, error: fetchError } = await supabase
        .from("reviews" as any)
        .select("*")
        .eq("product_id", productId)
        .eq("is_approved", true)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      return (data as unknown as Review[]) || [];
    },
    enabled: !!productId,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) * 10) / 10
    : 0;

  const ratingDistribution = reviews.reduce((acc, r) => {
    acc[r.rating] = (acc[r.rating] || 0) + 1;
    return acc;
  }, {} as { [key: number]: number });

  const submitReview = async (review: Omit<Review, 'id' | 'is_approved' | 'is_featured' | 'helpful_count' | 'created_at' | 'is_verified_purchase' | 'products'>): Promise<boolean> => {
    try {
      const { error: insertError } = await supabase
        .from("reviews" as any)
        .insert({
          ...review,
          is_approved: false,
          is_verified_purchase: false,
          helpful_count: 0,
        } as any);

      if (insertError) {
        return false;
      }
      return true;
    } catch (err) {
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

    queryClient.setQueryData(["reviews", "product", productId], (old: Review[] | undefined) => {
      if (!old) return old;
      return old.map(r => r.id === reviewId ? { ...r, helpful_count: r.helpful_count + 1 } : r);
    });
  };

  return {
    reviews,
    averageRating,
    totalReviews,
    ratingDistribution,
    isLoading,
    error: error ? error.message : null,
    submitReview,
    markHelpful,
  };
}

export function useApprovedReviews() {
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["reviews", "approved-feed"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews" as never)
        .select("*")
        .eq("is_approved", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to fetch approved reviews:", error);
        return [];
      }
      return (data as unknown as Review[]) ?? [];
    },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
  });

  return { reviews, isLoading };
}

export function useAdminReviews() {
  const queryClient = useQueryClient();
  
  const { data: reviews = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: async () => {
      const data = await getAdminReviews();
      return (data as unknown as Review[]) || [];
    },
    refetchOnWindowFocus: true,
  });

  const approveReview = async (id: string) => {
    try {
      await approveReviewAction(id);
      await refetch();
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    } catch (error) {
      console.error("Failed to approve review:", error);
    }
  };
  
  const rejectReview = async (id: string) => {
    try {
      await rejectReviewAction(id);
      await refetch();
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    } catch (error) {
      console.error("Failed to reject review:", error);
    }
  };

  const deleteReview = async (id: string) => {
    try {
      await deleteReviewAction(id);
      await refetch();
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    } catch (error) {
      console.error("Failed to delete review:", error);
    }
  };

  const toggleFeatured = async (id: string, current: boolean) => {
    try {
      await toggleReviewFeaturedAction(id, current);
      await refetch();
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    } catch (error) {
      console.error("Failed to toggle featured:", error);
    }
  };

  return {
    reviews,
    isLoading,
    approveReview,
    rejectReview,
    deleteReview,
    toggleFeatured,
    refetch,
  };
}

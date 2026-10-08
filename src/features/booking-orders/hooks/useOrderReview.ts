import { useState, useEffect, useCallback } from "react";
import { reviewsApi } from "@/api/reviews.api";
import type { ReviewItem, CreateReviewPayload } from "@/types/api";

export function useOrderReview(orderId?: string, tailorId?: string) {
  const [review, setReview] = useState<ReviewItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchReview = useCallback(async () => {
    if (!orderId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await reviewsApi.getOrderReview(orderId, tailorId);
      if (res?.data) {
        setReview(res.data);
      } else {
        setReview(null);
      }
    } catch {
      setReview(null);
    } finally {
      setIsLoading(false);
    }
  }, [orderId, tailorId]);

  useEffect(() => {
    fetchReview();
  }, [fetchReview]);

  const submitReview = useCallback(
    async (payload: CreateReviewPayload) => {
      if (!orderId) throw new Error("Order ID is required");
      setIsSubmitting(true);
      try {
        const res = await reviewsApi.createOrderReview(orderId, {
          ...payload,
          tailorId: payload.tailorId || tailorId,
        });
        const saved = res.data;
        if (saved) {
          setReview(saved);
        }
        return saved;
      } finally {
        setIsSubmitting(false);
      }
    },
    [orderId, tailorId]
  );

  return {
    review,
    setReview,
    isReviewed: Boolean(review && (review.rating || 0) > 0),
    isLoading,
    isSubmitting,
    fetchReview,
    submitReview,
  };
}

import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { apiClient } from './client';
import { ApiResponse, ReviewItem, CreateReviewPayload } from '../types/api';

const REVIEW_CACHE_PREFIX = 'sui_dhaga_review_';

async function cacheReviewLocally(orderId: string, review: ReviewItem): Promise<void> {
  try {
    const key = `${REVIEW_CACHE_PREFIX}${orderId}`;
    const value = JSON.stringify(review);
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  } catch (err) {
    console.warn('[reviewsApi] Failed to cache review locally', err);
  }
}

async function getCachedReviewLocally(orderId: string): Promise<ReviewItem | null> {
  try {
    const key = `${REVIEW_CACHE_PREFIX}${orderId}`;
    let raw: string | null = null;
    if (Platform.OS === 'web') {
      raw = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    } else {
      raw = await SecureStore.getItemAsync(key);
    }
    if (raw) return JSON.parse(raw);
    return null;
  } catch {
    return null;
  }
}

export const reviewsApi = {
  /**
   * Submit or update a review for an order
   */
  async createOrderReview(
    orderId: string,
    payload: CreateReviewPayload
  ): Promise<ApiResponse<ReviewItem>> {
    const response = await apiClient<ReviewItem>(`/orders/${orderId}/review`, {
      method: 'POST',
      body: JSON.stringify({
        rating: payload.rating,
        comment: payload.comment,
        images: payload.images,
        tailorId: payload.tailorId || payload.tailor_id,
        tailor_id: payload.tailorId || payload.tailor_id,
      }),
    });

    if (response.data) {
      await cacheReviewLocally(orderId, response.data);
    }
    return response;
  },

  /**
   * Get review for a specific order
   */
  async getOrderReview(orderId: string, tailorId?: string): Promise<ApiResponse<ReviewItem | null>> {
    // 1. First try dedicated backend endpoint
    try {
      const res = await apiClient<ReviewItem>(`/orders/${orderId}/review`, {
        method: 'GET',
      });
      if (res.data) {
        await cacheReviewLocally(orderId, res.data);
        return res;
      }
    } catch {
      // Backend may not have deployed the GET route yet or user is offline
    }

    // 2. Fallback: check if tailor reviews list has this order
    if (tailorId) {
      try {
        const tailorReviewsRes = await this.getTailorReviews(tailorId);
        const match = (tailorReviewsRes.data || []).find(
          (r: any) => String(r.orderId || r.order_id) === String(orderId)
        );
        if (match) {
          await cacheReviewLocally(orderId, match);
          return {
            success: true,
            message: 'Review found in tailor list',
            data: match,
          };
        }
      } catch {}
    }

    // 3. Fallback: check local storage cache
    const cached = await getCachedReviewLocally(orderId);
    if (cached) {
      return {
        success: true,
        message: 'Review loaded from cache',
        data: cached,
      };
    }

    return {
      success: true,
      message: 'No review found',
      data: null,
    };
  },

  /**
   * Fetch all reviews for a tailor
   */
  async getTailorReviews(tailorId: string): Promise<ApiResponse<ReviewItem[]>> {
    return apiClient<ReviewItem[]>(`/tailors/${tailorId}/reviews`, {
      method: 'GET',
    });
  },

  /**
   * Upload an outfit photo for the review
   */
  async uploadReviewImage(uri: string, name?: string): Promise<string> {
    try {
      const formData = new FormData();
      const rawName = name || uri.split('/').pop() || `review-${Date.now()}.png`;
      const cleanName = rawName.includes('.') ? rawName : `${rawName}.png`;
      const ext = cleanName.split('.').pop()?.toLowerCase() || 'png';
      const mimeType = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : ext === 'webp' ? 'image/webp' : 'image/png';

      if (Platform.OS === 'web') {
        try {
          const response = await fetch(uri);
          const blob = await response.blob();
          formData.append('image', blob, cleanName);
        } catch {
          formData.append('image', { uri, name: cleanName, type: mimeType } as any);
        }
      } else {
        formData.append('image', { uri, name: cleanName, type: mimeType } as any);
      }
      formData.append('folder', 'reviews');
      formData.append('bucket', 'order-designs');

      const res = await apiClient<{ url?: string; fileUrl?: string }>('/uploads/image', {
        method: 'POST',
        body: formData,
      });
      return (res.data as any)?.url || (res.data as any)?.fileUrl || uri;
    } catch {
      return uri;
    }
  },
};

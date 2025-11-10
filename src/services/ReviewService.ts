import api from "./axios";
import { ApiResponse } from "@/types";

export interface ReviewUser {
  userId: number;
  fullName: string;
  email: string;
  username?: string;
  phone?: string;
  gender?: string;
  identityCard?: string;
  address?: string;
  status?: string | null;
  createdAt?: string | null;
  currentMembershipId?: number | null;
  membershipExpiry?: string | null;
  availableCoupons?: number | null;
}

export interface Review {
  reviewId: number;
  reviewer: ReviewUser;
  targetUser: ReviewUser;
  orderId: number;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface UserRatingSummary {
  userId: number;
  fullName: string;
  averageRating: number;
  totalReviews: number;
  fiveStarReviews: number;
  fourStarReviews: number;
  threeStarReviews: number;
  twoStarReviews: number;
  oneStarReviews: number;
}

export interface CreateReviewPayload {
  orderId: number;
  targetUserId: number;
  rating: number;
  comment: string;
}

export interface UpdateReviewPayload {
  rating: number;
  comment: string;
}

const extractData = <T>(response: ApiResponse<T>): T => {
  if (!response.success) {
    throw new Error(response.message || "Request failed");
  }

  if (response.data === undefined || response.data === null) {
    throw new Error("No data returned from server");
  }

  return response.data;
};

export const ReviewService = {
  createReview: async (payload: CreateReviewPayload): Promise<Review> => {
    const response = await api.post<ApiResponse<Review>>("/reviews", payload);
    return extractData(response.data);
  },

  updateReview: async (
    reviewId: number,
    payload: UpdateReviewPayload
  ): Promise<Review> => {
    const response = await api.put<ApiResponse<Review>>(
      `/reviews/${reviewId}`,
      payload
    );
    return extractData(response.data);
  },

  getReviewById: async (reviewId: number): Promise<Review> => {
    const response = await api.get<ApiResponse<Review>>(`/reviews/${reviewId}`);
    return extractData(response.data);
  },

  getReviewsByUser: async (userId: number): Promise<Review[]> => {
    const response = await api.get<ApiResponse<Review[]>>(
      `/reviews/user/${userId}`
    );
    return extractData(response.data);
  },

  getUserRatingSummary: async (
    userId: number
  ): Promise<UserRatingSummary> => {
    const response = await api.get<ApiResponse<UserRatingSummary>>(
      `/reviews/user/${userId}/rating`
    );
    return extractData(response.data);
  },

  getReviewsByOrder: async (orderId: number): Promise<Review[]> => {
    const response = await api.get<ApiResponse<Review[] | Review>>(
      `/reviews/order/${orderId}`
    );
    const data = extractData(response.data);
    return Array.isArray(data) ? data : [data];
  },

  getMyReviewByOrder: async (
    orderId: number
  ): Promise<Review | null> => {
    const response = await api.get<ApiResponse<Review | null>>(
      `/reviews/order/${orderId}/my-review`
    );
    return extractData(response.data);
  },
};



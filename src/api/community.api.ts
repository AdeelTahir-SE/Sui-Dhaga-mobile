import { apiClient } from './client';
import { ApiResponse, CommunityComment, CommunityPost, CreateCommunityPostPayload } from '../types/api';

export interface GetCommunityPostsParams {
  page?: number;
  limit?: number;
  category?: string;
  tag?: string;
  search?: string;
  authorId?: string;
}

export const communityApi = {
  getPosts: async (params?: GetCommunityPostsParams): Promise<ApiResponse<CommunityPost[]>> => {
    return apiClient<CommunityPost[]>('/community/posts', {
      method: 'GET',
      params: params as Record<string, string | number | boolean | undefined>,
    });
  },

  getPostById: async (postId: string): Promise<ApiResponse<CommunityPost>> => {
    return apiClient<CommunityPost>(`/community/posts/${postId}`, {
      method: 'GET',
    });
  },

  createPost: async (data: FormData | CreateCommunityPostPayload): Promise<ApiResponse<CommunityPost>> => {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    return apiClient<CommunityPost>('/community/posts', {
      method: 'POST',
      body: isFormData ? data : JSON.stringify(data),
    });
  },

  updatePost: async (postId: string, data: Partial<CreateCommunityPostPayload>): Promise<ApiResponse<CommunityPost>> => {
    return apiClient<CommunityPost>(`/community/posts/${postId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deletePost: async (postId: string): Promise<ApiResponse<null>> => {
    return apiClient<null>(`/community/posts/${postId}`, {
      method: 'DELETE',
    });
  },

  toggleLike: async (postId: string): Promise<ApiResponse<{ liked: boolean; post: CommunityPost }>> => {
    return apiClient<{ liked: boolean; post: CommunityPost }>(`/community/posts/${postId}/like`, {
      method: 'POST',
    });
  },

  toggleSave: async (postId: string): Promise<ApiResponse<{ saved: boolean; post: CommunityPost }>> => {
    return apiClient<{ saved: boolean; post: CommunityPost }>(`/community/posts/${postId}/save`, {
      method: 'POST',
    });
  },

  getComments: async (postId: string): Promise<ApiResponse<CommunityComment[]>> => {
    return apiClient<CommunityComment[]>(`/community/posts/${postId}/comments`, {
      method: 'GET',
    });
  },

  addComment: async (postId: string, content: string): Promise<ApiResponse<CommunityComment>> => {
    return apiClient<CommunityComment>(`/community/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },
};

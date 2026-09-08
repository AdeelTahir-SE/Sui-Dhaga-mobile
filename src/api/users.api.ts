import { Platform } from 'react-native';
import { apiClient } from './client';
import { ApiResponse, User } from '../types/api';

export interface AvatarUploadResponseData {
  avatar_url?: string;
  avatarUrl?: string;
  avatar?: string;
  url?: string;
  user?: User;
}

export interface ImageAssetInput {
  uri: string;
  name?: string | null;
  fileName?: string | null;
  type?: string | null;
  mimeType?: string | null;
}

export function extractAvatarUrl(data: any): string | null {
  if (!data) return null;
  if (typeof data === 'string' && (data.startsWith('http') || data.startsWith('data:') || data.startsWith('blob:'))) {
    return data;
  }
  return (
    data.avatar_url ||
    data.avatarUrl ||
    data.avatar ||
    data.url ||
    data.user?.avatar_url ||
    data.user?.avatarUrl ||
    data.user?.avatar ||
    data.profile?.avatar_url ||
    data.profile?.avatarUrl ||
    data.data?.avatar_url ||
    data.data?.avatarUrl ||
    null
  );
}

export async function buildAvatarFormData(
  input: ImageAssetInput | FormData
): Promise<FormData> {
  if (
    (typeof FormData !== 'undefined' && input instanceof FormData) ||
    (input && typeof (input as any).append === 'function')
  ) {
    return input as FormData;
  }

  const asset = input as ImageAssetInput;
  const formData = new FormData();
  const fileUri = asset.uri;

  let filename = asset.fileName || asset.name || fileUri.split('/').pop() || 'avatar.jpg';
  if (!filename.includes('.')) {
    filename = `${filename}.jpg`;
  }

  const match = /\.(\w+)$/.exec(filename);
  const ext = match ? match[1].toLowerCase() : 'jpeg';
  let mimeType = asset.mimeType || asset.type || `image/${ext === 'jpg' ? 'jpeg' : ext}`;
  if (mimeType === 'image/jpg') mimeType = 'image/jpeg';

  if (Platform.OS === 'web') {
    try {
      const response = await fetch(fileUri);
      const blob = await response.blob();
      formData.append('avatar', blob, filename);
      return formData;
    } catch {
      // Fallback
    }
  }

  // Native React Native FormData object for XMLHttpRequest
  formData.append('avatar', {
    uri: fileUri,
    name: filename,
    type: mimeType,
  } as any);

  return formData;
}

export const usersApi = {
  async getMe(): Promise<ApiResponse<User>> {
    return apiClient<User>('/users/me', {
      method: 'GET',
    });
  },

  async uploadAvatar(
    fileOrFormData: ImageAssetInput | FormData
  ): Promise<ApiResponse<AvatarUploadResponseData>> {
    const body = await buildAvatarFormData(fileOrFormData);
    return apiClient<AvatarUploadResponseData>('/users/me/avatar', {
      method: 'POST',
      body,
    });
  },

  async updateProfile(payload: Partial<User>): Promise<ApiResponse<User>> {
    return apiClient<User>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
};

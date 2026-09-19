import * as FileSystem from "expo-file-system/legacy";
import { Image as ExpoImage } from "expo-image";
import { CommunityComment, CommunityPost } from "../types/api";
import { isVideoMedia } from "../features/measurements-community-checkout/components/CommunityMediaCarousel";

// ==================== 1. COMMENTS CACHE ====================
// In-memory cache preserving comments per postId so opening comments is instant
const commentsCache = new Map<string, { comments: CommunityComment[]; timestamp: number }>();

export function getCachedComments(postId: string): CommunityComment[] | null {
  const cached = commentsCache.get(postId);
  if (!cached) return null;
  return cached.comments;
}

export function setCachedComments(postId: string, comments: CommunityComment[]): void {
  commentsCache.set(postId, { comments, timestamp: Date.now() });
}

export function appendCachedComment(postId: string, newComment: CommunityComment): void {
  const existing = getCachedComments(postId) || [];
  setCachedComments(postId, [...existing, newComment]);
}

// ==================== 2. VIDEO DISK & MEMORY CACHE ====================
const videoMemoryCache = new Map<string, string>();
const activeDownloads = new Map<string, Promise<string>>();

function getHashedFilename(url: string): string {
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    hash = (hash << 5) - hash + url.charCodeAt(i);
    hash |= 0;
  }
  const cleanExt = url.split("?")[0].split(".").pop() || "mp4";
  return `cached_video_${Math.abs(hash)}.${cleanExt}`;
}

export async function getCachedVideoUri(remoteUri?: string | null): Promise<string | null> {
  if (!remoteUri) return null;
  if (remoteUri.startsWith("file://") || remoteUri.startsWith("content://")) {
    return remoteUri;
  }

  // Check in-memory resolution
  if (videoMemoryCache.has(remoteUri)) {
    return videoMemoryCache.get(remoteUri)!;
  }

  try {
    const filename = getHashedFilename(remoteUri);
    const localUri = `${FileSystem.cacheDirectory}community_videos/${filename}`;

    const info = await FileSystem.getInfoAsync(localUri);
    if (info.exists && info.size && info.size > 0) {
      videoMemoryCache.set(remoteUri, localUri);
      return localUri;
    }

    // Trigger background cache download if not already running
    if (!activeDownloads.has(remoteUri)) {
      const downloadPromise = (async () => {
        try {
          const dir = `${FileSystem.cacheDirectory}community_videos/`;
          const dirInfo = await FileSystem.getInfoAsync(dir);
          if (!dirInfo.exists) {
            await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
          }
          const result = await FileSystem.downloadAsync(remoteUri, localUri);
          if (result && result.uri) {
            videoMemoryCache.set(remoteUri, result.uri);
            return result.uri;
          }
        } catch {
          // Graceful fallback
        } finally {
          activeDownloads.delete(remoteUri);
        }
        return remoteUri;
      })();

      activeDownloads.set(remoteUri, downloadPromise);
    }
  } catch {
    // If filesystem inspection fails, stream remote URI directly
  }

  return remoteUri;
}

// ==================== 3. PRELOAD & PREFETCH FOR FEED ====================
export function prefetchPostMedia(post: CommunityPost): void {
  if (!post.images || post.images.length === 0) return;

  post.images.forEach((uri) => {
    if (!uri) return;
    if (isVideoMedia(uri)) {
      // Start background download into cache
      getCachedVideoUri(uri).catch(() => {});
    } else {
      // Prefetch and cache image into disk and memory
      ExpoImage.prefetch(uri, "memory-disk").catch(() => {});
    }
  });

  if (post.author?.avatarUrl || post.author?.avatar) {
    const avatar = post.author.avatarUrl || post.author.avatar;
    if (avatar) {
      ExpoImage.prefetch(avatar, "memory-disk").catch(() => {});
    }
  }
}

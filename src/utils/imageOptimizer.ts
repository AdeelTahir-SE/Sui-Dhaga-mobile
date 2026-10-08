/**
 * Image optimization utilities for Sui Dhaga.
 * Automatically transforms Supabase storage image requests to deliver WebP and resized thumbnails.
 */

// Elegant neutral warm blurhash placeholder for image skeletons
export const DEFAULT_BLURHASH = "e6G[w?0000~qj[offQof00_3j[ayWBj[ay";

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: "webp" | "origin";
}

/**
 * Returns an optimized image URL when hosted on Supabase Storage.
 * Supabase Pro/Enterprise projects support `/render/image/public/...`,
 * while standard projects support query string parameters when behind an image CDN.
 */
export function getOptimizedImageUrl(
  url?: string | null,
  options: ImageOptimizationOptions = { width: 600, quality: 75, format: "webp" }
): string | undefined {
  if (!url) return undefined;
  if (typeof url !== "string") return url as any;

  const trimmed = url.trim();
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return trimmed;
  }

  // Check if it is a Supabase Storage URL
  if (trimmed.includes(".supabase.co/storage/v1/object/public/")) {
    const { width = 600, quality = 75, height } = options;
    const urlObj = new URL(trimmed);
    urlObj.searchParams.set("width", width.toString());
    urlObj.searchParams.set("quality", quality.toString());
    if (height) {
      urlObj.searchParams.set("height", height.toString());
    }
    return urlObj.toString();
  }

  return trimmed;
}

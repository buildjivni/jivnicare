// src/lib/imageHelper.ts
/**
 * Returns a canonical image URL for the given image source.
 * If the provided value is already a full URL, it is returned unchanged.
 * If it is a relative path or filename, it is prefixed with the CDN base
 * (if any) or the public folder path.
 * This centralizes image handling so that all components use the same source.
 */
export function getCanonicalImageUrl(image: string, updatedAt?: string | Date | null): string;
export function getCanonicalImageUrl(image: string | null | undefined, updatedAt?: string | Date | null): string | undefined;
export function getCanonicalImageUrl(image: string | null | undefined, updatedAt?: string | Date | null): string | undefined {
  if (!image) return undefined;
  // If the string already looks like an absolute URL (http(s)://), handle cache-busting
  let url = image;
  if (!/^https?:\/\//i.test(image)) {
    // Assume images stored in /public/images or via CDN base URL.
    const base = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || '';
    const normalized = image.startsWith('/') ? image.slice(1) : image;
    url = base ? `${base}/${normalized}` : `/${normalized}`;
  }
  
  if (updatedAt && !url.includes('?')) {
    const timestamp = new Date(updatedAt).getTime();
    if (!isNaN(timestamp)) {
      url += `?v=${timestamp}`;
    }
  }
  
  return url;
}

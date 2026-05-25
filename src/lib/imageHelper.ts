// src/lib/imageHelper.ts
/**
 * Returns a canonical image URL for the given image source.
 * If the provided value is already a full URL, it is returned unchanged.
 * If it is a relative path or filename, it is prefixed with the CDN base
 * (if any) or the public folder path.
 * This centralizes image handling so that all components use the same source.
 */
export function getCanonicalImageUrl(image: string | undefined): string | undefined {
  if (!image) return undefined;
  // If the string already looks like an absolute URL (http(s)://), return as is.
  if (/^https?:\/\//i.test(image)) return image;
  // Assume images stored in /public/images or via CDN base URL.
  // Adjust the base URL as needed for the project configuration.
  const base = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || '';
  // Ensure no leading slash duplication.
  const normalized = image.startsWith('/') ? image.slice(1) : image;
  return base ? `${base}/${normalized}` : `/${normalized}`;
}

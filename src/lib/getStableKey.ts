// src/lib/getStableKey.ts
/**
 * Returns a stable key for list rendering.
 * Falls back to the provided index when no stable identifier exists.
 */
export function getStableKey<T extends { id?: string | number; _id?: string | number }>(item: T, index: number): string {
  if (item.id !== undefined && item.id !== null) return String(item.id);
  if ((item as any)._id !== undefined && (item as any)._id !== null) return String((item as any)._id);
  return `index-${index}`;
}

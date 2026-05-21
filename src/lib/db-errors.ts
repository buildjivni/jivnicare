/** Detect transient Prisma/Mongo connectivity errors for safe 503 responses. */
export function isTransientDbError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const code = (error as { code?: string }).code;
  return code === "P1001" || code === "P1017" || code === "P2034";
}

export function dbUnavailableResponse() {
  return {
    error: "Service temporarily unavailable. Please try again.",
    status: 503 as const,
  };
}

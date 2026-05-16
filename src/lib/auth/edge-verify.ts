import { jwtVerify } from "jose";

/**
 * JivniCare — Edge Auth Verification
 * Purpose: Securely verify the custom JivniCare auth-token on the Edge Runtime.
 */

export async function verifyToken(token: string) {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!token || !JWT_SECRET) return null;

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    
    // Normalize payload (Jose returns claims directly)
    return {
      userId: payload.id as string,
      role: payload.role as string,
      doctorId: payload.doctorId as string | undefined,
      phone: payload.phone as string | undefined,
      ...payload
    };
  } catch (error) {
    console.error("Edge Auth Verification Error:", error instanceof Error ? error.message : error);
    return null;
  }
}

import { SignJWT, jwtVerify, type JWTPayload } from "jose";

export type Role = "PATIENT" | "DOCTOR" | "ADMIN";

export interface JivniPayload extends JWTPayload {
  sub: string;   // userId — kept for JWT spec compliance
  id: string;    // alias for sub — used throughout the codebase
  role: Role;
  phone: string;
  doctorId?: string; // present only when role === "DOCTOR"
}

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function signToken(
  payload: any,
  expiresIn = "7d"
): Promise<string> {
  const sub = payload.sub || payload.id;
  const id = payload.id || payload.sub;
  return new SignJWT({ ...payload, sub, id })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: ["HS256"],
    });
    
    if (!payload.sub && !payload.id && !payload.queueId) {
      return null;
    }
    
    if (payload.sub && !payload.id) payload.id = payload.sub as string;
    if (payload.id && !payload.sub) payload.sub = payload.id as string;
    
    return payload;
  } catch (error) {
    // Return null for expired or invalid tokens instead of throwing
    return null;
  }
}

export const AUTH_COOKIE = "jivnicare_token" as const;

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
} as const;

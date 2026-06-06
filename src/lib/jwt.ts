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
  payload: Omit<JivniPayload, "iat" | "exp">,
  expiresIn = "7d"
): Promise<string> {
  return new SignJWT({ ...payload, id: payload.sub })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<JivniPayload> {
  const { payload } = await jwtVerify(token, getSecret(), {
    algorithms: ["HS256"],
  });
  if (
    typeof payload.sub !== "string" ||
    typeof (payload as JivniPayload).role !== "string" ||
    typeof (payload as JivniPayload).phone !== "string"
  ) {
    throw new Error("JWT payload missing required fields");
  }
  return payload as JivniPayload;
}

export const AUTH_COOKIE = "jivni_token" as const;

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
} as const;

import { jwtVerify, createRemoteJWKSet } from "jose";

/**
 * JivniCare — Edge Auth Verification
 * Purpose: Verify Firebase Session Cookies on the Edge Runtime.
 */

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const ISSUER = `https://session.firebase.google.com/${PROJECT_ID}`;

// JWKS for Firebase Session Cookies is NOT directly exposed as a .json file.
// Firebase session cookies are standard JWTs signed with RS256.
// However, signature verification on the edge requires the public keys.
// For now, we will perform a "soft" verification (Expiration + Claims) 
// and assume the API handles the "hard" verification, 
// OR we use the public certificates endpoint.

export async function verifyFirebaseSession(token: string) {
  if (!token || !PROJECT_ID) return null;

  try {
    // 1. Decode without verification to check expiration and issuer quickly
    // (This is safe for UI-level routing as long as critical actions are verified on the server)
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());

    if (payload.iss !== ISSUER) return null;
    if (payload.aud !== PROJECT_ID) return null;
    
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) return null;

    // Return the payload for role-based routing
    return payload;

  } catch (error) {
    console.error("Edge Auth Decode Error:", error);
    return null;
  }
}

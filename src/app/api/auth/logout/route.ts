import { NextRequest, NextResponse } from "next/server";

/**
 * JivniCare Auth — Logout
 * POST /api/auth/logout
 */

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ status: "success" });
  
  // Clear the session cookie
  response.cookies.set("auth-token", "", {
    maxAge: 0,
    path: "/",
  });

  return response;
}

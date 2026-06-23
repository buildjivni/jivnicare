import { NextRequest, NextResponse } from "next/server";
import { verifyToken, AUTH_COOKIE } from "@/lib/jwt";

function addSecurityHeaders(response: NextResponse) {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "origin-when-cross-origin");
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE)?.value;

  // Skip static resources and direct authentication access
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname === "/admin/login" ||
    pathname === "/login"
  ) {
    return addSecurityHeaders(NextResponse.next());
  }

  const isDoctorRoute = pathname.startsWith("/doctor") || pathname.startsWith("/api/doctor");
  const isAdminRoute = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");

  const isTotpRoute = pathname === "/admin/totp-setup" || pathname === "/admin/totp-verify" || pathname.startsWith("/api/auth/totp");

  if (isTotpRoute) {
    const tempToken = request.cookies.get("admin_temp_token")?.value;
    if (!tempToken) {
      if (pathname.startsWith("/api/")) {
        return addSecurityHeaders(
          NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        );
      }
      return addSecurityHeaders(
        NextResponse.redirect(new URL("/admin/login", request.url))
      );
    }
    const payload = await verifyToken(tempToken);
    if (!payload || (payload.role !== "ADMIN_TEMP" && payload.role !== "ADMIN")) {
      if (pathname.startsWith("/api/")) {
        return addSecurityHeaders(
          NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        );
      }
      return addSecurityHeaders(
        NextResponse.redirect(new URL("/admin/login", request.url))
      );
    }
    return addSecurityHeaders(NextResponse.next());
  }

  if (isDoctorRoute || isAdminRoute) {
    if (!token) {
      if (pathname.startsWith("/api/")) {
        return addSecurityHeaders(
          NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        );
      }
      return addSecurityHeaders(
        NextResponse.redirect(new URL(isDoctorRoute ? "/login" : "/admin/login", request.url))
      );
    }

    const payload = await verifyToken(token);
    if (!payload) {
      if (pathname.startsWith("/api/")) {
        return addSecurityHeaders(
          NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        );
      }
      const response = NextResponse.redirect(
        new URL(isDoctorRoute ? "/login" : "/admin/login", request.url)
      );
      response.cookies.delete(AUTH_COOKIE);
      return addSecurityHeaders(response);
    }

    if (isDoctorRoute && payload.role !== "DOCTOR" && payload.role !== "ADMIN") {
      if (pathname.startsWith("/api/")) {
        return addSecurityHeaders(
          NextResponse.json({ error: "Forbidden" }, { status: 403 })
        );
      }
      return addSecurityHeaders(
        NextResponse.redirect(new URL("/login", request.url))
      );
    }

    if (isAdminRoute && payload.role !== "ADMIN") {
      if (pathname.startsWith("/api/")) {
        return addSecurityHeaders(
          NextResponse.json({ error: "Forbidden" }, { status: 403 })
        );
      }
      return addSecurityHeaders(
        NextResponse.redirect(new URL("/admin/login", request.url))
      );
    }

    // Inject session details in request headers for downstream API routes
    if (pathname.startsWith("/api/")) {
      const headers = new Headers(request.headers);
      headers.set("x-user-id", payload.id || (payload.sub as string));
      headers.set("x-user-role", payload.role);
      if (payload.doctorId) {
        headers.set("x-doctor-id", payload.doctorId);
      }
      return addSecurityHeaders(NextResponse.next({ request: { headers } }));
    }
  }

  return addSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    "/doctor/:path*",
    "/admin/:path*",
    "/api/doctor/:path*",
    "/api/admin/:path*",
  ],
};

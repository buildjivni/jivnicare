/**
 * Canonical edge request/auth layer (Next.js 16 proxy convention).
 * Do not add middleware.ts — Next.js allows only proxy.ts OR middleware, not both.
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { getJwtSecret } from '@/lib/infrastructure/env';
import { logger } from '@/lib/infrastructure/logger';

// Define the paths that require authentication and specific roles
const protectedPaths = [
  { prefix: '/doctor', roles: ['DOCTOR'] },
  { prefix: '/admin', roles: ['ADMIN'] },
  // For patient dashboard, assuming it's at /patient or /booking 
  // /booking has no page route; checkout/confirmation are protected separately 
  { prefix: '/my-bookings', roles: ['PATIENT', 'DOCTOR', 'ADMIN'] },
  { prefix: '/checkout', roles: ['PATIENT', 'DOCTOR', 'ADMIN'] },
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path is protected
  const isAuthPage = pathname.endsWith('/login') || pathname.endsWith('/register');
  const protectedRoute = !isAuthPage ? protectedPaths.find((route) => 
    pathname === route.prefix || pathname.startsWith(route.prefix + '/')
  ) : undefined;

  if (!protectedRoute) {
    return NextResponse.next();
  }

  // Get the auth-token cookie
  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    return redirectToLogin(request, pathname);
  }

  try {
    // Verify the JWT token using jose
    const secret = new TextEncoder().encode(getJwtSecret());
    const { payload } = await jwtVerify(token, secret);

    const userRole = payload.role as string;

    if (!userRole || !protectedRoute.roles.includes(userRole)) {
      if (userRole === 'DOCTOR') {
        return NextResponse.redirect(new URL('/doctor/dashboard', request.url));
      }
      if (userRole === 'PATIENT') {
        return NextResponse.redirect(new URL('/', request.url));
      }
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Role is allowed, proceed
    return NextResponse.next();
  } catch (error) {
    logger.warn({
      category: 'AUTH',
      message: 'Edge JWT verification failed',
      metadata: { path: pathname },
      error,
    });
    return redirectToLogin(request, pathname);
  }
}

function redirectToLogin(request: NextRequest, originalPath: string) {
  const url = new URL('/login', request.url);
  // Optional: preserve the intended destination
  if (originalPath !== '/login' && originalPath !== '/') {
    url.searchParams.set('redirect', originalPath);
  }
  
  // If it's an admin route, redirect to admin login
  if (originalPath.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, fonts, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

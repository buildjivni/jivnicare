import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth/edge-verify';

/**
 * JivniCare — Edge Middleware
 * Purpose: Centralized route protection and role-aware navigation guards.
 */

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Public routes that should NEVER be auth-guarded ─────────────
  const publicPaths = [
    '/admin/login',
    '/partners/login',
    '/partners/onboard',
    '/login',
    '/api/public',
    '/api/auth/session',
    '/_next',
    '/favicon.ico',
    '/logo.png',
  ];
  
  if (publicPaths.some(p => pathname === p || pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const isAdminApi = pathname.startsWith('/api/admin');
  const isDoctorApi = pathname.startsWith('/api/doctor');
  const isPatientApi = pathname.startsWith('/api/patient');
  
  const isAdminFrontend = pathname.startsWith('/admin');
  const isDoctorFrontend = pathname.startsWith('/doctor') && !pathname.startsWith('/doctors');
  const isPatientFrontend = pathname.startsWith('/patient');
  const isCheckout = pathname.startsWith('/checkout');

  const isProtectedApi = isAdminApi || isDoctorApi || isPatientApi;
  const isProtectedFrontend = isAdminFrontend || isDoctorFrontend || isPatientFrontend || isCheckout;
  
  if (isProtectedApi || isProtectedFrontend) {
    const token = request.cookies.get('auth-token')?.value;

    const unauthorizedResponse = () => {
      if (isProtectedApi) {
        return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
      }
      
      let loginPath = '/login';
      if (isAdminFrontend) loginPath = '/admin/login';
      else if (isDoctorFrontend) loginPath = '/partners/login';

      const url = new URL(loginPath, request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    };

    if (!token) {
      return unauthorizedResponse();
    }

    const payload = await verifyToken(token);
    
    if (!payload) {
      return unauthorizedResponse();
    }

    const role = payload.role as string;

    const forbiddenResponse = (redirectTo: string) => {
      if (isProtectedApi) {
        return NextResponse.json({ error: 'Forbidden: Insufficient role' }, { status: 403 });
      }
      return NextResponse.redirect(new URL(redirectTo, request.url));
    };

    // Role enforcement
    if ((isAdminApi || isAdminFrontend) && role !== 'ADMIN') {
      return forbiddenResponse('/admin/login');
    }

    if ((isDoctorApi || isDoctorFrontend) && role !== 'DOCTOR') {
      return forbiddenResponse('/partners/login');
    }

    // Patient/Checkout enforcement
    if ((isPatientApi || isPatientFrontend || isCheckout) && !role) {
      return forbiddenResponse('/login');
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.userId);
    requestHeaders.set('x-user-role', payload.role as string);
    if (payload.doctorId) {
      requestHeaders.set('x-doctor-id', payload.doctorId as string);
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/admin/:path*',
    '/api/doctor/:path*',
    '/api/patient/:path*',
    '/admin/:path*',
    '/doctor/:path*',
    '/patient/:path*',
    '/checkout/:path*'
  ],
};

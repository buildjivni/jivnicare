import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Public routes that should NEVER be auth-guarded ─────────────
  const publicPaths = [
    '/admin/login',
    '/partners/login',
    '/partners/onboard',
    '/login',
  ];
  if (publicPaths.some(p => pathname === p || pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const isAdminApi = pathname.startsWith('/api/admin');
  const isDoctorApi = pathname.startsWith('/api/doctor');
  const isPatientApi = pathname.startsWith('/api/patient');
  
  const isAdminFrontend = pathname.startsWith('/admin');
  const isDoctorFrontend = pathname.startsWith('/doctor');
  const isPatientFrontend = pathname.startsWith('/patient');

  const isProtectedApi = isAdminApi || isDoctorApi || isPatientApi;
  const isProtectedFrontend = isAdminFrontend || isDoctorFrontend || isPatientFrontend;
  
  if (isProtectedApi || isProtectedFrontend) {
    const token = request.cookies.get('auth-token')?.value;

    const unauthorizedResponse = () => {
      if (isProtectedApi) {
        return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
      }
      // Redirect to appropriate login page
      if (isAdminFrontend) return NextResponse.redirect(new URL('/admin/login', request.url));
      if (isDoctorFrontend) return NextResponse.redirect(new URL('/partners/login', request.url));
      return NextResponse.redirect(new URL('/login', request.url));
    };

    if (!token) {
      return unauthorizedResponse();
    }

    if (!JWT_SECRET) {
      console.error("JWT_SECRET is not set in environment variables");
      return isProtectedApi 
        ? NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
        : NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      
      const role = payload.role as string;

      const forbiddenResponse = (redirectTo: string) => {
        if (isProtectedApi) {
          return NextResponse.json({ error: 'Forbidden: Insufficient role' }, { status: 403 });
        }
        return NextResponse.redirect(new URL(redirectTo, request.url));
      };

      if ((isAdminApi || isAdminFrontend) && role !== 'ADMIN') {
        return forbiddenResponse('/admin/login');
      }

      if ((isDoctorApi || isDoctorFrontend) && role !== 'DOCTOR') {
        return forbiddenResponse('/partners/login');
      }

      if ((isPatientApi || isPatientFrontend) && role !== 'PATIENT') {
        return forbiddenResponse('/login');
      }

      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.id as string);
      requestHeaders.set('x-user-role', payload.role as string);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });

    } catch (error) {
      return unauthorizedResponse();
    }
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
    '/patient/:path*'
  ],
};

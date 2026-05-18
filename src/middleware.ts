import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Define the paths that require authentication and specific roles
const protectedPaths = [
  { prefix: '/doctor', roles: ['DOCTOR'] },
  { prefix: '/admin', roles: ['ADMIN'] },
  // For patient dashboard, assuming it's at /patient or /booking 
  { prefix: '/booking', roles: ['PATIENT', 'DOCTOR', 'ADMIN'] }, 
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path is protected
  const protectedRoute = protectedPaths.find((route) => pathname.startsWith(route.prefix));

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
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');
    const { payload } = await jwtVerify(token, secret);

    const userRole = payload.role as string;

    if (!userRole || !protectedRoute.roles.includes(userRole)) {
      // Role not allowed
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Role is allowed, proceed
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware JWT Verification Error:', error);
    // Invalid or expired token
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

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith('/api/admin');
  const isDoctorRoute = pathname.startsWith('/api/doctor');
  const isPatientRoute = pathname.startsWith('/api/patient');
  
  if (isAdminRoute || isDoctorRoute || isPatientRoute) {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
    }

    if (!JWT_SECRET) {
      console.error("JWT_SECRET is not set in environment variables");
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }

    try {
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      
      const role = payload.role as string;

      if (isAdminRoute && role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
      }

      if (isDoctorRoute && role !== 'DOCTOR') {
        return NextResponse.json({ error: 'Forbidden: Doctor access required' }, { status: 403 });
      }

      if (isPatientRoute && role !== 'PATIENT') {
        return NextResponse.json({ error: 'Forbidden: Patient access required' }, { status: 403 });
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
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/admin/:path*',
    '/api/doctor/:path*',
    '/api/patient/:path*'
  ],
};

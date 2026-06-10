import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('jivnicare_token')?.value

  // Routes that need protection
  const doctorRoutes = pathname.startsWith('/doctor')
  const adminRoutes = pathname.startsWith('/admin')
  const doctorApiRoutes = pathname.startsWith('/api/doctor')
  const adminApiRoutes = pathname.startsWith('/api/admin')

  if (doctorRoutes || adminRoutes || doctorApiRoutes || adminApiRoutes) {
    if (!token) {
      if (doctorRoutes) return NextResponse.redirect(new URL('/login', request.url))
      if (adminRoutes) return NextResponse.redirect(new URL('/admin/login', request.url))
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
      const { payload } = await jwtVerify(token, secret)

      // Role check
      if ((doctorRoutes || doctorApiRoutes) && payload.role !== 'DOCTOR') {
        // Allow fallback to login if role mismatch on frontend routes
        if (doctorRoutes) return NextResponse.redirect(new URL('/login', request.url))
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      if ((adminRoutes || adminApiRoutes) && payload.role !== 'ADMIN') {
        if (adminRoutes) return NextResponse.redirect(new URL('/admin/login', request.url))
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    } catch {
      if (doctorRoutes) return NextResponse.redirect(new URL('/login', request.url))
      if (adminRoutes) return NextResponse.redirect(new URL('/admin/login', request.url))
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/doctor/:path*',
    '/admin/:path*',
    '/api/doctor/:path*',
    '/api/admin/:path*',
  ],
}

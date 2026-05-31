import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import prisma from '@/lib/db/prisma';
import { logger } from '@/lib/infrastructure/logger';

/**
 * GET /api/auth/me
 * ─────────────────────────────────────────────────────────────────
 * Lightweight identity hydration endpoint.
 *
 * Returns the current authenticated user's full identity, resolved
 * from the HttpOnly auth-token cookie + a minimal DB lookup.
 *
 * Use cases:
 *   - Dashboard load: confirm session is still valid
 *   - Tab restore: re-hydrate Zustand store from server truth
 *   - Role validation: confirm the user still has the right role
 *   - Doctor dashboard: get doctorId without a separate API call
 *
 * Returns 401 if:
 *   - No auth-token cookie present
 *   - Token is expired or invalid
 *   - User no longer exists in DB
 *
 * Response shape (200):
 * {
 *   user: {
 *     id, phone, name, role, doctorId | null
 *   }
 * }
 */
export async function GET() {
  try {
    // 1. Read HttpOnly cookie
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }

    // 2. Verify JWT (returns null if expired/invalid — no throw)
    const decoded = await verifyToken(token) as { id: string; role: string } | null;
    if (!decoded?.id) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }

    // 3. Minimal DB lookup — just what the client needs for identity
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        phone: true,
        name: true,
        location: true,
        role: true,
        isVerified: true,
        // Linked doctor record (null for PATIENT/ADMIN)
        doctor: {
          select: { id: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        location: user.location,
        role: user.role,
        verified: user.isVerified,
        doctorId: user.doctor?.id ?? null,
      },
    });
  } catch (error) {
    logger.error({
      category: 'AUTH',
      message: 'GET /api/auth/me failed',
      error,
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

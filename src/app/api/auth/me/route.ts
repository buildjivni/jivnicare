import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import prisma from '@/lib/prisma';

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
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // 2. Verify JWT (returns null if expired/invalid — no throw)
    const decoded = verifyToken(token) as { id: string; role: string } | null;
    if (!decoded?.id) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    // 3. Minimal DB lookup — just what the client needs for identity
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        phone: true,
        name: true,
        role: true,
        isVerified: true,
        // Linked doctor record (null for PATIENT/ADMIN)
        doctor: {
          select: { id: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        verified: user.isVerified,
        doctorId: user.doctor?.id ?? null,
      },
    });
  } catch (error) {
    console.error('GET /api/auth/me error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

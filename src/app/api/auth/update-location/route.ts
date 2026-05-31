import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/db/prisma';
import { verifyToken } from '@/lib/jwt';

export async function POST(request: Request) {
  try {
    const { latitude, longitude } = await request.json();

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
    }

    const token = (await cookies()).get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const payload = await verifyToken(token) as { id: string } | null;
    if (!payload?.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await prisma.user.update({
      where: { id: payload.id },
      data: { latitude, longitude },
    });

    return NextResponse.json({ message: 'Location saved' }, { status: 200 });
  } catch (error) {
    console.error('Error updating location:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { apiResponse, apiError } from '@/lib/utils/api-response';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/db/prisma';
import { verifyToken } from '@/lib/jwt';

export async function POST(request: Request) {
  try {
    const { latitude, longitude } = await request.json();

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return apiError('Invalid coordinates', 400);
    }

    const token = (await cookies()).get('jivnicare_token')?.value;
    if (!token) {
      return apiError('Authentication required', 401);
    }

    const payload = await verifyToken(token) as { id: string } | null;
    if (!payload?.id) {
      return apiError('Invalid token', 401);
    }

    await prisma.user.update({
      where: { id: payload.id },
      data: { latitude, longitude },
    });

    return apiResponse({message: 'Location saved'}, 200);
  } catch (error) {
    console.error('Error updating location:', error);
    return apiError('Internal server error', 500);
  }
}

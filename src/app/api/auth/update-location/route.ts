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

    const payload = await verifyToken(token) as { id: string; role?: string } | null;
    if (!payload?.id) {
      return apiError('Invalid token', 401);
    }

    if (payload.role === 'DOCTOR') {
      const doctor = await prisma.doctor.findUnique({
        where: { userId: payload.id },
        select: { id: true }
      });
      if (doctor) {
        await prisma.doctor.update({
          where: { id: doctor.id },
          data: {
            clinicLatitude: latitude,
            clinicLongitude: longitude
          }
        });
      }
    }

    return apiResponse({message: 'Location saved'}, 200);
  } catch (error) {
    console.error('Error updating location:', error);
    return apiError('Internal server error', 500);
  }
}

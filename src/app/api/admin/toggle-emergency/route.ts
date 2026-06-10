import { apiResponse, apiError } from '@/lib/utils/api-response';
import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('jivnicare_token')?.value;

    if (!token) return apiError("Unauthorized", 401);
    
    const decoded = await verifyToken(token) as { role: string } | null;
    if (!decoded || decoded.role !== 'ADMIN') return apiError("Access denied", 403);

    const body = await request.json();
    const { doctorId, enableEmergency } = body;

    if (!doctorId || typeof enableEmergency !== 'boolean') {
      return apiError("Invalid payload", 400);
    }

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      include: { clinicOperations: true }
    });

    if (!doctor) return apiError("Doctor not found", 404);

    await prisma.$transaction([
      prisma.clinicOperations.upsert({
        where: { doctorId },
        create: { doctorId, status: 'AVAILABLE', emergencySlots: enableEmergency ? 2 : 0 },
        update: { emergencySlots: enableEmergency ? 2 : 0 }
      }),
      prisma.doctor.update({
        where: { id: doctorId },
        data: { emergencyAvailable: enableEmergency }
      })
    ]);

    return apiResponse({ success: true });
  } catch (error) {
    console.error('Toggle Emergency Error:', error);
    return apiError("Internal server error", 500);
  }
}

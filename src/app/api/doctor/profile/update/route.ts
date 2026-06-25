import { apiResponse, apiError } from '@/lib/utils/api-response';
import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('jivnicare_token')?.value;

    if (!token) {
      return apiError('Unauthorized', 401);
    }

    const decoded = await verifyToken(token) as { id: string; role?: string } | null;
    if (!decoded?.id) {
      return apiError('Invalid or expired session', 401);
    }

    if (decoded.role !== 'DOCTOR') {
      return apiError('Only doctors can update their profiles.', 403);
    }

    const userId = decoded.id;
    const doctor = await prisma.doctor.findUnique({ where: { userId } });

    if (!doctor) {
      return apiError('Doctor profile not found.', 404);
    }

    const body = await request.json();
    const { updates } = body;

    if (!updates || typeof updates !== 'object') {
      return apiError('Invalid update payload.', 400);
    }

    const safeUpdates: any = {};

    for (const [key, value] of Object.entries(updates)) {
      if (key === 'name') safeUpdates.name = value;
      else if (key === 'hospitalName') safeUpdates.clinicName = value;
      else if (key === 'district') safeUpdates.clinicDistrict = value;
      else if (key === 'medicalRegistrationNumber') safeUpdates.registrationNumber = value;
      else if (key === 'bio') safeUpdates.bio = value;
      else if (key === 'experience') safeUpdates.experienceYears = parseInt(String(value)) || 0;
      else if (key === 'fee') safeUpdates.consultationFee = parseInt(String(value)) || 0;
      else if (key === 'gender') safeUpdates.gender = value ? (String(value).toUpperCase() as any) : undefined;
      else if (key === 'profileImage') safeUpdates.profilePhoto = value;
      else if (key === 'clinicImage') safeUpdates.clinicPhotos = Array.isArray(value) ? value : [value];
      else if (key === 'clinicPhotos') safeUpdates.clinicPhotos = value;
      else if (key === 'qualifications') safeUpdates.qualifications = Array.isArray(value) ? value : [value];
    }

    if (Object.keys(safeUpdates).length > 0) {
      await prisma.doctor.update({
        where: { id: doctor.id },
        data: safeUpdates
      });
    }

    try {
      revalidatePath(`/doctors/${doctor.slug || doctor.id}`);
      revalidatePath("/");
      revalidatePath("/doctors");
    } catch (e) {
      console.error("Revalidation failed", e);
    }

    return apiResponse({
      success: true,
      message: 'Profile updated successfully.',
      updatesApplied: Object.keys(safeUpdates)
    });
  } catch (error: any) {
    console.error('Doctor Profile Update Error:', error);
    return apiError('Internal server error.', 500);
  }
}

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token) as { id: string; role?: string } | null;
    if (!decoded?.id) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    if (decoded.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Only doctors can update their profiles.' }, { status: 403 });
    }

    const userId = decoded.id;
    const doctor = await prisma.doctor.findUnique({ where: { userId } });

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor profile not found.' }, { status: 404 });
    }

    const body = await request.json();
    const { updates } = body;

    if (!updates || typeof updates !== 'object') {
      return NextResponse.json({ error: 'Invalid update payload.' }, { status: 400 });
    }

    // Define sensitive vs safe fields based on architecture plan
    const sensitiveFields = ['name', 'hospitalName', 'district', 'medicalRegistrationNumber'];
    const safeDoctorFields = ['bio', 'experience', 'fee', 'gender', 'profileImage', 'clinicImage', 'education', 'qualifications'];
    
    const safeUpdates: any = {};
    const sensitiveLogs: any[] = [];

    for (const [key, value] of Object.entries(updates)) {
      if (sensitiveFields.includes(key)) {
        // Log sensitive changes instead of updating immediately
        const oldValue = (doctor as any)[key]?.toString() || null;
        if (oldValue !== value) {
          sensitiveLogs.push({
            doctorId: doctor.id,
            field: key,
            oldValue,
            newValue: String(value),
            status: 'PENDING'
          });
        }
      } else if (safeDoctorFields.includes(key)) {
        // Parse numbers if needed
        if (key === 'experience' || key === 'fee') {
          safeUpdates[key] = parseInt(String(value)) || 0;
        } else {
          safeUpdates[key] = value;
        }
      }
    }

    await prisma.$transaction(async (tx) => {
      // 1. Apply Safe Updates directly to Doctor Profile
      if (Object.keys(safeUpdates).length > 0) {
        await tx.doctor.update({
          where: { id: doctor.id },
          data: safeUpdates
        });
      }

      // 2. Queue Sensitive Updates to ProfileUpdateLog
      if (sensitiveLogs.length > 0) {
        await tx.profileUpdateLog.createMany({
          data: sensitiveLogs
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: sensitiveLogs.length > 0 
        ? 'Profile updated. Sensitive changes require admin verification.' 
        : 'Profile updated successfully.',
      safeUpdatesApplied: Object.keys(safeUpdates),
      pendingReviewFields: sensitiveLogs.map(l => l.field)
    });

  } catch (error: any) {
    console.error('Doctor Profile Update Error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

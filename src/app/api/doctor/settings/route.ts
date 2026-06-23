import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { requireSession } from "@/lib/auth/session";

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireSession(["DOCTOR"]);
    if (auth.response) return auth.response;
    const payload = auth.session!;

    const body = await request.json();
    const { isOnline, status, statusReason, breakDuration } = body;

    const doctor = await prisma.doctor.findUnique({
      where: { userId: payload.id },
      select: { id: true }
    });

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 });
    }

    // 1. Update isOnline on Doctor record if provided
    if (typeof isOnline === 'boolean') {
      await prisma.doctor.update({
        where: { id: doctor.id },
        data: { isOnline },
      });
    }

    // 2. Update ClinicOperations if status is provided
    if (status) {
      let statusExpiresAt: Date | null = null;
      if (status === "SHORT_BREAK" && breakDuration) {
        statusExpiresAt = new Date(Date.now() + parseInt(String(breakDuration), 10) * 60 * 1000);
      }

      await prisma.clinicOperations.upsert({
        where: { doctorId: doctor.id },
        update: {
          status,
          statusReason: statusReason || null,
          statusExpiresAt,
          isClosedToday: status === "CLINIC_CLOSED",
          pauseOnlineBooking: status === "SHORT_BREAK" || status === "CLINIC_CLOSED",
        },
        create: {
          doctorId: doctor.id,
          status,
          statusReason: statusReason || null,
          statusExpiresAt,
          isClosedToday: status === "CLINIC_CLOSED",
          pauseOnlineBooking: status === "SHORT_BREAK" || status === "CLINIC_CLOSED",
        }
      });

      // Special handling: if CLOSED, ensure doctor isOffline as well
      if (status === "CLINIC_CLOSED") {
        await prisma.doctor.update({
          where: { id: doctor.id },
          data: { isOnline: false }
        });
      } else if (status === "AVAILABLE") {
        await prisma.doctor.update({
          where: { id: doctor.id },
          data: { isOnline: true }
        });
      }

      // 3. Trigger proactive notifications to active patients for breaks/closures
      if (status === "SHORT_BREAK" || status === "CLINIC_CLOSED") {
        try {
          const { triggerClinicStatusAlerts } = require("@/lib/notifications");
          triggerClinicStatusAlerts(doctor.id, status, statusReason || "").catch((err: any) =>
            console.error("Error triggering clinic status alerts:", err)
          );
        } catch (triggerErr) {
          console.error("Clinic status alerts trigger exception:", triggerErr);
        }
      }
    }

    return NextResponse.json({ success: true, isOnline, status }, { status: 200 });
  } catch (error) {
    console.error('[DOCTOR_SETTINGS_ERROR]', error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

import { apiResponse, apiError } from '@/lib/utils/api-response';
import { NextRequest } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const doctor = await db.doctor.findUnique({
      where: { slug },
      select: {
        id: true,
        availabilityStatus: true,
        isAcceptingBookings: true,
        isEmergencyEnabled: true,
        emergencyFee: true,
        consultationFee: true,
        weeklySchedule: true,
      },
    });

    if (!doctor) {
      return apiError("Doctor not found", 404);
    }

    const todayKey = new Date()
      .toLocaleDateString("en-US", { weekday: "long", timeZone: "Asia/Kolkata" })
      .toLowerCase();
    
    let isClosedToday = false;
    if (doctor.weeklySchedule && typeof doctor.weeklySchedule === "object") {
      const schedule = doctor.weeklySchedule as any;
      if (schedule[todayKey]?.isOpen === false) {
        isClosedToday = true;
      }
    }

    const isEmergencyOnly = !doctor.isAcceptingBookings && doctor.isEmergencyEnabled;

    return Response.json({
      status: isEmergencyOnly ? "EMERGENCY_ONLY" : (isClosedToday ? "CLINIC_CLOSED" : doctor.availabilityStatus),
      isClosedToday,
      pauseOnlineBooking: !doctor.isAcceptingBookings,
      emergencyFee: doctor.emergencyFee ?? doctor.consultationFee,
      isEmergencyEnabled: doctor.isEmergencyEnabled,
    });
  } catch (err) {
    console.error("[GET /api/public/clinic-status]", err);
    return apiError("Internal server error", 500);
  }
}

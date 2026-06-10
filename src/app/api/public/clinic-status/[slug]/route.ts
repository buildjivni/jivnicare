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
      select: { id: true },
    });

    if (!doctor) {
      return apiError("Doctor not found", 404);
    }

    const ops = await db.clinicOperations.findUnique({
      where: { doctorId: doctor.id },
      select: {
        status: true,
        isClosedToday: true,
        pauseOnlineBooking: true,
        walkInLimit: true,
        onlineLimit: true,
      },
    });

    if (!ops) {
      // No ClinicOperations record means clinic is available by default
      return apiResponse({status: "AVAILABLE",
        isClosedToday: false,
        pauseOnlineBooking: false,});
    }

    return Response.json(ops);
  } catch (err) {
    console.error("[GET /api/public/clinic-status]", err);
    return apiError("Internal server error", 500);
  }
}

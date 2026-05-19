import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload: any = await verifyToken(token);
    if (!payload || !payload.id || payload.role !== "DOCTOR") {
      return NextResponse.json({ error: "Invalid token or not a doctor" }, { status: 401 });
    }

    const doctor = await prisma.doctor.findUnique({
      where: { userId: payload.id },
      include: {
        specialties: true,
        clinicOperations: true,
        weeklySchedule: true,
        user: { select: { phone: true, name: true } }
      }
    });

    if (!doctor) {
      return NextResponse.json({ error: "Doctor profile not found" }, { status: 404 });
    }

    // Auto-Expiry Operational Status Engine
    if (
      doctor.clinicOperations &&
      doctor.clinicOperations.statusExpiresAt &&
      new Date(doctor.clinicOperations.statusExpiresAt) < new Date()
    ) {
      const updatedOps = await prisma.clinicOperations.update({
        where: { id: doctor.clinicOperations.id },
        data: {
          status: "AVAILABLE",
          statusExpiresAt: null,
          statusReason: null,
          pauseOnlineBooking: false,
          isClosedToday: false
        }
      });
      doctor.clinicOperations = updatedOps;
    }

    // Phase 6: Dynamic Profile Completeness Calculation
    const fields = [
      { key: 'name', value: doctor.name },
      { key: 'medicalRegistrationNumber', value: doctor.medicalRegistrationNumber },
      { key: 'specialtyIds', value: doctor.specialtyIds?.length > 0 },
      { key: 'hospitalName', value: doctor.hospitalName },
      { key: 'bio', value: doctor.bio },
      { key: 'consultationFee', value: doctor.consultationFee > 0 },
      { key: 'weeklySchedule', value: !!doctor.weeklySchedule },
      { key: 'profileImage', value: !!doctor.profileImage }
    ];

    const completedFields = fields.filter(f => !!f.value).length;
    const completenessPercentage = Math.round((completedFields / fields.length) * 100);

    return NextResponse.json({ 
      success: true, 
      doctor, 
      completeness: completenessPercentage 
    });
  } catch (error: any) {
    console.error("Fetch doctor profile error:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

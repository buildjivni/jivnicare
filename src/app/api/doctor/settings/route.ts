import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function PUT(request: Request) {
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

    const body = await request.json();
    const { 
      bio, fee, name, regNumber, isClosedToday, timings,
      weeklySchedule, averageConsultationTime, maxCapacity 
    } = body;

    const doctor = await prisma.doctor.findUnique({
      where: { userId: payload.id }
    });

    if (!doctor) {
      return NextResponse.json({ error: "Doctor profile not found" }, { status: 404 });
    }

    const updatedData: any = {};
    if (bio !== undefined) updatedData.bio = bio;
    if (fee !== undefined) updatedData.fee = parseInt(fee) || 0;
    if (name !== undefined) updatedData.name = name;
    if (regNumber !== undefined) updatedData.medicalRegistrationNumber = regNumber;
    if (averageConsultationTime !== undefined) updatedData.averageConsultationTime = parseInt(averageConsultationTime) || 15;

    // Run transaction to ensure atomicity across models
    const result = await prisma.$transaction(async (tx) => {
      let updatedDoctor = doctor;
      
      if (Object.keys(updatedData).length > 0) {
        updatedDoctor = await tx.doctor.update({
          where: { id: doctor.id },
          data: updatedData
        });
      }

      // 1. Update Clinic Operations
      let updatedClinicOps = null;
      if (isClosedToday !== undefined || maxCapacity !== undefined) {
        const opsUpdate: any = {};
        if (isClosedToday !== undefined) opsUpdate.isClosedToday = isClosedToday;
        if (maxCapacity !== undefined) {
          opsUpdate.walkInLimit = parseInt(maxCapacity) || 40;
          opsUpdate.onlineLimit = parseInt(maxCapacity) || 40; // Sync for safety
        }

        updatedClinicOps = await tx.clinicOperations.upsert({
          where: { doctorId: doctor.id },
          update: opsUpdate,
          create: { doctorId: doctor.id, ...opsUpdate }
        });
      }

      // 2. Update Weekly Schedule (JSON blobs for each day)
      let updatedSchedule = null;
      if (weeklySchedule) {
        updatedSchedule = await tx.weeklySchedule.upsert({
          where: { doctorId: doctor.id },
          update: {
            monday: weeklySchedule.monday,
            tuesday: weeklySchedule.tuesday,
            wednesday: weeklySchedule.wednesday,
            thursday: weeklySchedule.thursday,
            friday: weeklySchedule.friday,
            saturday: weeklySchedule.saturday,
            sunday: weeklySchedule.sunday,
          },
          create: {
            doctorId: doctor.id,
            monday: weeklySchedule.monday || { isOpen: true, start: "09:00", end: "17:00" },
            tuesday: weeklySchedule.tuesday || { isOpen: true, start: "09:00", end: "17:00" },
            wednesday: weeklySchedule.wednesday || { isOpen: true, start: "09:00", end: "17:00" },
            thursday: weeklySchedule.thursday || { isOpen: true, start: "09:00", end: "17:00" },
            friday: weeklySchedule.friday || { isOpen: true, start: "09:00", end: "17:00" },
            saturday: weeklySchedule.saturday || { isOpen: false, start: "09:00", end: "17:00" },
            sunday: weeklySchedule.sunday || { isOpen: false, start: "09:00", end: "17:00" },
          }
        });
      }
      return { doctor: updatedDoctor, clinicOps: updatedClinicOps, schedule: updatedSchedule };
    });

    return NextResponse.json({ success: true, message: "Settings updated successfully", data: result });
  } catch (error: any) {
    console.error("Update doctor settings error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}

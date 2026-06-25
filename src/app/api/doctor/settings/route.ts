import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { requireSession } from "@/lib/auth/session";
import { Role, AuditAction, AvailabilityStatus } from "@prisma/client";

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireSession(["DOCTOR"]);
    if (auth.response) return auth.response;
    const payload = auth.session!;

    const body = await request.json();
    const { 
      isOnline, status, statusReason, breakDuration,
      name, regNumber, bio, hospitalName, city, address, district,
      experience, fee, qualifications, lifetimePatientsDeclaration,
      maxCapacity, averageConsultationTime, emergencySlots
    } = body;

    const doctor = await prisma.doctor.findUnique({
      where: { userId: payload.id }
    });

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 });
    }

    const doctorUpdates: any = {};
    const sensitiveLogs: any[] = [];

    // name
    if (name !== undefined && name !== doctor.name) {
      sensitiveLogs.push({
        userId: payload.id,
        role: Role.DOCTOR,
        action: AuditAction.UPDATE,
        entityType: "Doctor",
        entityId: doctor.id,
        oldValue: { name: doctor.name || null },
        newValue: { name: String(name) },
      });
      doctorUpdates.name = name;
    }

    // regNumber (registrationNumber)
    if (regNumber !== undefined && regNumber !== doctor.registrationNumber) {
      sensitiveLogs.push({
        userId: payload.id,
        role: Role.DOCTOR,
        action: AuditAction.UPDATE,
        entityType: "Doctor",
        entityId: doctor.id,
        oldValue: { registrationNumber: doctor.registrationNumber || null },
        newValue: { registrationNumber: String(regNumber) },
      });
      doctorUpdates.registrationNumber = String(regNumber);
    }

    // hospitalName -> clinicName
    if (hospitalName !== undefined && hospitalName !== doctor.clinicName) {
      sensitiveLogs.push({
        userId: payload.id,
        role: Role.DOCTOR,
        action: AuditAction.UPDATE,
        entityType: "Doctor",
        entityId: doctor.id,
        oldValue: { clinicName: doctor.clinicName || null },
        newValue: { clinicName: String(hospitalName) },
      });
      doctorUpdates.clinicName = String(hospitalName);
    }

    // district -> clinicDistrict
    if (district !== undefined && district !== doctor.clinicDistrict) {
      sensitiveLogs.push({
        userId: payload.id,
        role: Role.DOCTOR,
        action: AuditAction.UPDATE,
        entityType: "Doctor",
        entityId: doctor.id,
        oldValue: { clinicDistrict: doctor.clinicDistrict || null },
        newValue: { clinicDistrict: String(district) },
      });
      doctorUpdates.clinicDistrict = String(district);
    }

    // bio
    if (bio !== undefined) {
      doctorUpdates.bio = bio;
    }

    // city -> clinicCity
    if (city !== undefined) {
      doctorUpdates.clinicCity = city;
    }

    // address -> clinicAddress
    if (address !== undefined) {
      doctorUpdates.clinicAddress = address;
    }

    // experience -> experienceYears
    if (experience !== undefined) {
      const exp = parseInt(String(experience), 10) || 0;
      doctorUpdates.experienceYears = exp;
    }

    // fee -> consultationFee
    if (fee !== undefined) {
      const parsedFee = parseInt(String(fee), 10) || 0;
      doctorUpdates.consultationFee = parsedFee;
    }

    // qualifications
    if (qualifications !== undefined) {
      doctorUpdates.qualifications = Array.isArray(qualifications) 
        ? qualifications 
        : typeof qualifications === "string" 
        ? [qualifications] 
        : [];
    }

    // lifetimePatientsDeclaration
    if (lifetimePatientsDeclaration !== undefined) {
      doctorUpdates.lifetimePatientsServed = parseInt(String(lifetimePatientsDeclaration), 10) || 0;
    }

    // maxCapacity -> dailyTokenLimit
    if (maxCapacity !== undefined) {
      doctorUpdates.dailyTokenLimit = parseInt(String(maxCapacity), 10) || 30;
    }

    // emergencySlots -> emergencyCapacity
    if (emergencySlots !== undefined) {
      const emgCap = parseInt(String(emergencySlots), 10) || 0;
      doctorUpdates.emergencyCapacity = emgCap;
      doctorUpdates.isEmergencyEnabled = emgCap > 0;
    }

    // status / availabilityStatus / isAcceptingBookings settings
    if (status) {
      if (status === "CLINIC_CLOSED") {
        doctorUpdates.availabilityStatus = AvailabilityStatus.OFFLINE;
        doctorUpdates.isAcceptingBookings = false;
      } else if (status === "SHORT_BREAK") {
        doctorUpdates.availabilityStatus = AvailabilityStatus.ON_BREAK;
        doctorUpdates.isAcceptingBookings = false;
      } else if (status === "EMERGENCY_ONLY") {
        doctorUpdates.isAcceptingBookings = false;
      } else if (status === "AVAILABLE") {
        doctorUpdates.availabilityStatus = AvailabilityStatus.AVAILABLE;
        doctorUpdates.isAcceptingBookings = true;
      }
    }

    // Perform transaction
    await prisma.$transaction(async (tx) => {
      // 1. Update Doctor
      if (Object.keys(doctorUpdates).length > 0) {
        await tx.doctor.update({
          where: { id: doctor.id },
          data: doctorUpdates
        });
      }

      // 2. Sensitive Logs -> AuditLog
      if (sensitiveLogs.length > 0) {
        await tx.auditLog.createMany({
          data: sensitiveLogs
        });
      }
    });

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

    return NextResponse.json({ 
      success: true, 
      isOnline: doctorUpdates.availabilityStatus === AvailabilityStatus.AVAILABLE, 
      status 
    }, { status: 200 });
  } catch (error) {
    console.error('[DOCTOR_SETTINGS_ERROR]', error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

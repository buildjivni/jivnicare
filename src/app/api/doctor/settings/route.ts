import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { requireSession } from "@/lib/auth/session";

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
      where: { userId: payload.id },
      include: { clinicOperations: true }
    });

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 });
    }

    const doctorUpdates: any = {};
    const opsUpdates: any = {};
    const sensitiveLogs: any[] = [];

    // isOnline
    if (typeof isOnline === 'boolean') {
      doctorUpdates.isOnline = isOnline;
    }

    // name
    if (name !== undefined && name !== doctor.name) {
      sensitiveLogs.push({
        doctorId: doctor.id,
        field: 'name',
        oldValue: doctor.name || null,
        newValue: String(name),
        status: 'PENDING'
      });
    }

    // regNumber (medicalRegistrationNumber)
    if (regNumber !== undefined && regNumber !== doctor.medicalRegistrationNumber) {
      sensitiveLogs.push({
        doctorId: doctor.id,
        field: 'medicalRegistrationNumber',
        oldValue: doctor.medicalRegistrationNumber || null,
        newValue: String(regNumber),
        status: 'PENDING'
      });
    }

    // hospitalName
    if (hospitalName !== undefined && hospitalName !== doctor.hospitalName) {
      sensitiveLogs.push({
        doctorId: doctor.id,
        field: 'hospitalName',
        oldValue: doctor.hospitalName || null,
        newValue: String(hospitalName),
        status: 'PENDING'
      });
    }

    // district
    if (district !== undefined && district !== doctor.district) {
      sensitiveLogs.push({
        doctorId: doctor.id,
        field: 'district',
        oldValue: doctor.district || null,
        newValue: String(district),
        status: 'PENDING'
      });
    }

    // bio
    if (bio !== undefined) {
      doctorUpdates.bio = bio;
    }

    // city
    if (city !== undefined) {
      doctorUpdates.city = city;
    }

    // address
    if (address !== undefined) {
      doctorUpdates.fullAddress = address;
    }

    // experience
    if (experience !== undefined) {
      const exp = parseInt(String(experience), 10) || 0;
      doctorUpdates.experience = exp;
      doctorUpdates.experienceYears = exp;
    }

    // fee
    if (fee !== undefined) {
      const parsedFee = parseInt(String(fee), 10) || 0;
      doctorUpdates.fee = parsedFee;
      doctorUpdates.consultationFee = parsedFee;
    }

    // qualifications
    if (qualifications !== undefined) {
      doctorUpdates.qualifications = qualifications;
      doctorUpdates.qualification = qualifications;
    }

    // lifetimePatientsDeclaration
    if (lifetimePatientsDeclaration !== undefined) {
      doctorUpdates.lifetimePatientsDeclaration = lifetimePatientsDeclaration !== null ? String(lifetimePatientsDeclaration) : null;
    }

    // averageConsultationTime
    if (averageConsultationTime !== undefined) {
      const avgTime = parseInt(String(averageConsultationTime), 10) || 15;
      doctorUpdates.averageConsultationTime = avgTime;
      doctorUpdates.averageConsultationMinutes = avgTime;
    }

    // maxCapacity
    if (maxCapacity !== undefined) {
      const cap = parseInt(String(maxCapacity), 10) || 40;
      doctorUpdates.dailyTokenLimit = cap;
      opsUpdates.walkInLimit = Math.floor(cap / 2);
      opsUpdates.onlineLimit = cap - opsUpdates.walkInLimit;
    }

    // emergencySlots
    if (emergencySlots !== undefined) {
      opsUpdates.emergencySlots = parseInt(String(emergencySlots), 10) || 0;
    }

    // status / ClinicOperations status settings
    if (status) {
      let statusExpiresAt: Date | null = null;
      if (status === "SHORT_BREAK" && breakDuration) {
        statusExpiresAt = new Date(Date.now() + parseInt(String(breakDuration), 10) * 60 * 1000);
      }
      opsUpdates.status = status;
      opsUpdates.statusReason = statusReason || null;
      opsUpdates.statusExpiresAt = statusExpiresAt;
      opsUpdates.isClosedToday = status === "CLINIC_CLOSED";
      opsUpdates.pauseOnlineBooking = status === "SHORT_BREAK" || status === "CLINIC_CLOSED" || status === "EMERGENCY_ONLY";

      if (status === "CLINIC_CLOSED") {
        doctorUpdates.isOnline = false;
      } else if (status === "AVAILABLE") {
        doctorUpdates.isOnline = true;
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

      // 2. Update ClinicOperations
      if (Object.keys(opsUpdates).length > 0 || status) {
        await tx.clinicOperations.upsert({
          where: { doctorId: doctor.id },
          update: opsUpdates,
          create: {
            doctorId: doctor.id,
            status: opsUpdates.status || "AVAILABLE",
            statusReason: opsUpdates.statusReason || null,
            statusExpiresAt: opsUpdates.statusExpiresAt || null,
            isClosedToday: opsUpdates.isClosedToday || false,
            pauseOnlineBooking: opsUpdates.pauseOnlineBooking || false,
            walkInLimit: opsUpdates.walkInLimit || 10,
            onlineLimit: opsUpdates.onlineLimit || 20,
            emergencySlots: opsUpdates.emergencySlots || 0,
          }
        });
      }

      // 3. Sensitive Logs
      if (sensitiveLogs.length > 0) {
        await tx.profileUpdateLog.createMany({
          data: sensitiveLogs
        });
      }
    });

    // 4. Trigger proactive notifications to active patients for breaks/closures
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

    return NextResponse.json({ success: true, isOnline, status }, { status: 200 });
  } catch (error) {
    console.error('[DOCTOR_SETTINGS_ERROR]', error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

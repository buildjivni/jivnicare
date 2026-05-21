import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { doctorSettingsSchema, formatZodError } from "@/lib/validations";
import { VerificationStatus } from "@prisma/client";
import { normalizeQualifications, normalizeLanguages } from "@/lib/normalizers";
import { getCurrentLogicalDay, getUnifiedQueueCapacity } from "@/lib/clinic-utils";

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

    // 1. Preprocess numeric fields safely to support form-data conversion
    if (body.fee !== undefined && body.fee !== null && body.fee !== "") {
      body.fee = parseInt(body.fee, 10);
    }
    if (body.averageConsultationTime !== undefined && body.averageConsultationTime !== null && body.averageConsultationTime !== "") {
      body.averageConsultationTime = parseInt(body.averageConsultationTime, 10);
    }
    if (body.maxCapacity !== undefined && body.maxCapacity !== null && body.maxCapacity !== "") {
      body.maxCapacity = parseInt(body.maxCapacity, 10);
    }
    if (body.emergencySlots !== undefined && body.emergencySlots !== null && body.emergencySlots !== "") {
      body.emergencySlots = parseInt(body.emergencySlots, 10);
    }
    if (body.experience !== undefined && body.experience !== null && body.experience !== "") {
      body.experience = parseInt(body.experience, 10);
    }

    // 2. Validate using strict Settings Schema
    const validation = doctorSettingsSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid settings data: " + formatZodError(validation.error) },
        { status: 400 }
      );
    }

    const validatedData = validation.data;

    const doctor = await prisma.doctor.findUnique({
      where: { userId: payload.id }
    });

    if (!doctor) {
      return NextResponse.json({ error: "Doctor profile not found" }, { status: 404 });
    }

    // ── Category A: Immutable / Protected Fields ────────────────
    if (body.doctorCode !== undefined && body.doctorCode !== doctor.doctorCode) {
      return NextResponse.json({ error: "Doctor identification code is immutable and cannot be changed." }, { status: 400 });
    }

    // ── Category D: Append-only Additions (Qualifications & Specialties) ──
    if (body.qualifications !== undefined) {
      const oldQuals = doctor.qualifications || "";
      const newQuals = body.qualifications || "";
      // Enforce that new qualifications list must contain the old qualifications to be additive
      if (oldQuals.trim() && !newQuals.toLowerCase().includes(oldQuals.toLowerCase().trim())) {
        return NextResponse.json({ 
          error: `Qualifications are append-only. You cannot remove previously verified credentials: "${oldQuals}".` 
        }, { status: 400 });
      }
    }

    if (body.specialtyIds !== undefined && Array.isArray(body.specialtyIds)) {
      const oldSpecialtyIds = doctor.specialtyIds || [];
      const newSpecialtyIds = body.specialtyIds;
      // Enforce that all previous specialties must remain present
      const specialtiesRemoved = oldSpecialtyIds.some(id => !newSpecialtyIds.includes(id));
      if (specialtiesRemoved) {
        return NextResponse.json({ 
          error: "Specializations are append-only. You cannot remove registered primary specializations." 
        }, { status: 400 });
      }
    }

    // ── Category B: Instantly Editable Fields ────────────────────
    const instantData: any = {};
    if (validatedData.bio !== undefined) instantData.bio = validatedData.bio;
    if (validatedData.fee !== undefined) {
      instantData.fee = validatedData.fee;
      instantData.consultationFee = validatedData.fee;
    }
    if (validatedData.averageConsultationTime !== undefined) instantData.averageConsultationTime = validatedData.averageConsultationTime;
    if (validatedData.emergencyAvailable !== undefined) instantData.emergencyAvailable = validatedData.emergencyAvailable;
    if (validatedData.onlineConsultationAvailable !== undefined) instantData.onlineConsultationAvailable = validatedData.onlineConsultationAvailable;
    if (validatedData.emergencyConsultationAvailable !== undefined) instantData.emergencyConsultationAvailable = validatedData.emergencyConsultationAvailable;
    if (validatedData.city !== undefined) instantData.city = validatedData.city;
    if (validatedData.address !== undefined) instantData.fullAddress = validatedData.address;
    if (validatedData.experience !== undefined) instantData.experience = validatedData.experience;

    // Apply qualifications & specialties instantly if they are verified to be purely additive
    if (body.qualifications !== undefined) {
      const normalizedQuals = normalizeQualifications(body.qualifications);
      instantData.qualifications = normalizedQuals;
      instantData.education = normalizedQuals; // sync fields
    }
    if (body.specialtyIds !== undefined) instantData.specialtyIds = body.specialtyIds;

    // ── Category C: Admin-Reviewed Fields ────────────────────────
    const sensitiveLogs: any[] = [];
    let hasSensitiveChanges = false;

    const checkSensitiveField = (fieldName: string, currentValue: any, newValue: any) => {
      if (newValue !== undefined && newValue !== currentValue) {
        sensitiveLogs.push({
          doctorId: doctor.id,
          field: fieldName,
          oldValue: currentValue ? String(currentValue) : null,
          newValue: String(newValue),
          status: 'PENDING'
        });
        hasSensitiveChanges = true;
      }
    };

    // Only queue updates if the doctor is currently VERIFIED or UPDATE_PENDING.
    // If they are DRAFT or PENDING_VERIFICATION, they can update directly.
    const requiresReview = doctor.verificationStatus === 'VERIFIED' || doctor.verificationStatus === 'UPDATE_PENDING';

    if (requiresReview) {
      checkSensitiveField('name', doctor.name, validatedData.name);
      checkSensitiveField('medicalRegistrationNumber', doctor.medicalRegistrationNumber, validatedData.regNumber);
      checkSensitiveField('hospitalName', doctor.hospitalName, body.hospitalName);
      checkSensitiveField('district', doctor.district, body.district);
    } else {
      // Not verified yet: update instantly
      if (validatedData.name !== undefined) instantData.name = validatedData.name;
      if (validatedData.regNumber !== undefined) instantData.medicalRegistrationNumber = validatedData.regNumber;
      if (body.hospitalName !== undefined) instantData.hospitalName = body.hospitalName;
      if (body.district !== undefined) instantData.district = body.district;
    }

    // 3. Atomically save changes
    const result = await prisma.$transaction(async (tx) => {
      let updatedDoctor = doctor;

      // Update instant/allowed changes directly
      if (Object.keys(instantData).length > 0 || (requiresReview && hasSensitiveChanges)) {
        updatedDoctor = await tx.doctor.update({
          where: { id: doctor.id },
          data: {
            ...instantData,
            // If there are sensitive updates and they are verified, transition status to UPDATE_PENDING
            ...(requiresReview && hasSensitiveChanges ? { verificationStatus: VerificationStatus.UPDATE_PENDING } : {})
          }
        });
      }

      // Record logs for admin review
      if (sensitiveLogs.length > 0) {
        await tx.profileUpdateLog.createMany({
          data: sensitiveLogs
        });
      }

      // Update Clinic Operations (Instantly Editable)
      let updatedClinicOps = null;
      if (
        body.isClosedToday !== undefined ||
        body.maxCapacity !== undefined ||
        body.pauseOnlineBooking !== undefined ||
        body.emergencySlots !== undefined ||
        body.status !== undefined ||
        body.statusReason !== undefined
      ) {
        const opsUpdate: any = {};
        if (body.isClosedToday !== undefined) opsUpdate.isClosedToday = body.isClosedToday;
        if (body.pauseOnlineBooking !== undefined) opsUpdate.pauseOnlineBooking = body.pauseOnlineBooking;
        if (body.emergencySlots !== undefined) opsUpdate.emergencySlots = body.emergencySlots;
        
        if (body.maxCapacity !== undefined) {
          opsUpdate.walkInLimit = body.maxCapacity;
          opsUpdate.onlineLimit = 0;
        }

        if (body.status !== undefined) {
          opsUpdate.status = body.status;
          
          // Map ClinicStatus updates to old legacy toggles for safety
          if (body.status === "CLINIC_CLOSED") {
            opsUpdate.isClosedToday = true;
          } else if (body.status === "AVAILABLE") {
            opsUpdate.isClosedToday = false;
            opsUpdate.pauseOnlineBooking = false;
          } else if (body.status === "SHORT_BREAK" || body.status === "EMERGENCY_ONLY") {
            opsUpdate.pauseOnlineBooking = true;
          }
          
          // Calculate auto-expiry
          if (body.status === "SHORT_BREAK") {
            const minutes = body.breakDuration || 30;
            opsUpdate.statusExpiresAt = new Date(Date.now() + minutes * 60 * 1000);
          } else if (body.status === "LIMITED_SLOTS") {
            opsUpdate.statusExpiresAt = new Date(Date.now() + 120 * 60 * 1000); // 2 hours
          } else {
            opsUpdate.statusExpiresAt = null;
          }
        }

        if (body.statusReason !== undefined) {
          opsUpdate.statusReason = body.statusReason;
        }

        updatedClinicOps = await tx.clinicOperations.upsert({
          where: { doctorId: doctor.id },
          update: opsUpdate,
          create: { doctorId: doctor.id, ...opsUpdate }
        });

        if (body.maxCapacity !== undefined) {
          const unifiedCapacity = getUnifiedQueueCapacity(updatedClinicOps);
          await tx.dailyQueue.updateMany({
            where: { doctorId: doctor.id, date: getCurrentLogicalDay() },
            data: { maxCapacity: unifiedCapacity },
          });
        }
      }

      // Update Weekly Schedule (Instantly Editable)
      let updatedSchedule = null;
      if (body.weeklySchedule) {
        updatedSchedule = await tx.weeklySchedule.upsert({
          where: { doctorId: doctor.id },
          update: {
            monday: body.weeklySchedule.monday,
            tuesday: body.weeklySchedule.tuesday,
            wednesday: body.weeklySchedule.wednesday,
            thursday: body.weeklySchedule.thursday,
            friday: body.weeklySchedule.friday,
            saturday: body.weeklySchedule.saturday,
            sunday: body.weeklySchedule.sunday,
          },
          create: {
            doctorId: doctor.id,
            monday: body.weeklySchedule.monday || { isOpen: true, start: "09:00", end: "17:00" },
            tuesday: body.weeklySchedule.tuesday || { isOpen: true, start: "09:00", end: "17:00" },
            wednesday: body.weeklySchedule.wednesday || { isOpen: true, start: "09:00", end: "17:00" },
            thursday: body.weeklySchedule.thursday || { isOpen: true, start: "09:00", end: "17:00" },
            friday: body.weeklySchedule.friday || { isOpen: true, start: "09:00", end: "17:00" },
            saturday: body.weeklySchedule.saturday || { isOpen: false, start: "09:00", end: "17:00" },
            sunday: body.weeklySchedule.sunday || { isOpen: false, start: "09:00", end: "17:00" },
          }
        });
      }

      return { doctor: updatedDoctor, clinicOps: updatedClinicOps, schedule: updatedSchedule };
    });

    const msg = requiresReview && hasSensitiveChanges
      ? "Settings saved. Sensitive changes (Name, Registration Number, Clinic Name, District) require admin approval before they appear publicly."
      : "Settings updated successfully.";

    return NextResponse.json({ success: true, message: msg, data: result });
  } catch (error: any) {
    console.error("Update doctor settings error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}

import prisma from "@/lib/db/prisma";
import { AuditAction } from "@prisma/client";

import { PartnerTier } from "@prisma/client";

export async function updateDoctorPricing(
  adminId: string,
  doctorId: string,
  pricing: {
    monthlyFee: number;
    perBookingFee: number;
    discountPercent: number;
    partnerTier: PartnerTier;
    freeUntil?: Date | null;
  }
) {
  // 1. Validate discountPercent is 0-100
  if (pricing.discountPercent < 0 || pricing.discountPercent > 100) {
    throw new Error("Discount percentage must be between 0 and 100");
  }

  // 2. Validate doctor exists
  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
  });
  if (!doctor) {
    throw new Error("Doctor not found");
  }

  // 3. Upsert PlatformPricing record
  const result = await prisma.platformPricing.upsert({
    where: { doctorId },
    update: {
      monthlyFee: pricing.monthlyFee,
      perBookingFee: pricing.perBookingFee,
      discountPercent: pricing.discountPercent,
      partnerTier: pricing.partnerTier,
      freeUntil: pricing.freeUntil || null,
    },
    create: {
      doctorId,
      monthlyFee: pricing.monthlyFee,
      perBookingFee: pricing.perBookingFee,
      discountPercent: pricing.discountPercent,
      partnerTier: pricing.partnerTier,
      freeUntil: pricing.freeUntil || null,
    },
  });

  // 4. Create AuditLog entry
  await prisma.auditLog.create({
    data: {
      userId: adminId,
      role: "ADMIN",
      action: AuditAction.UPDATE,
      entityType: "PlatformPricing",
      entityId: result.id,
      newValue: JSON.stringify(pricing),
    },
  });

  return result;
}

import prisma from '@/lib/db/prisma'
import { resolveClinicLogicalDay } from '@/lib/utils/clinic-utils'
import { QueueStatus } from '@prisma/client'

/**
 * Gets today's DailyQueue for a doctor.
 * Creates it if it does not exist yet.
 * Logical day = 4:00 AM IST
 */
export async function getOrCreateDailyQueue(doctorId: string, type: "REGULAR" | "EMERGENCY" = "REGULAR") {
  const today = resolveClinicLogicalDay()

  // Try to find existing
  let queue = await prisma.dailyQueue.findFirst({
    where: {
      doctorId,
      date: today,
      type,
    },
  })

  // Create if not exists
  if (!queue) {
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      select: { dailyTokenLimit: true, emergencyCapacity: true },
    })

    queue = await prisma.dailyQueue.create({
      data: {
        doctorId,
        date: today,
        type,
        totalTokens: 0,
        currentToken: 0,
        dailyLimit: doctor?.dailyTokenLimit ?? 30,
        emergencySlots: doctor?.emergencyCapacity ?? 0,
        status: QueueStatus.ACTIVE,
      },
    })
  }

  return queue
}

/**
 * Returns logical date string (YYYY-MM-DD)
 * Derived strictly from the India timezone-aligned resolveClinicLogicalDay()
 */
export function getLogicalDate(): string {
  const logicalDate = resolveClinicLogicalDay()
  return logicalDate.toISOString().split('T')[0] // YYYY-MM-DD
}



import prisma from '@/lib/db/prisma'
import { resolveClinicLogicalDay } from '@/lib/utils/clinic-utils'

/**
 * Gets today's DailyQueue for a doctor+clinic.
 * Creates it if it does not exist yet.
 * Logical day = 4:00 AM IST
 */
export async function getOrCreateDailyQueue(doctorId: string, clinicId?: string) {
  const logicalDate = getLogicalDate()

  // Try to find existing
  let queue = await prisma.dailyQueue.findFirst({
    where: {
      doctorId,
      logicalDate,
    },
  })

  // Create if not exists
  if (!queue) {
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      select: { dailyTokenLimit: true, clinicId: true },
    })

    queue = await prisma.dailyQueue.create({
      data: {
        doctorId,
        clinicId: clinicId || doctor?.clinicId || null,
        logicalDate,
        currentTokenNumber: 0,
        currentServingToken: 0,
        dailyLimit: doctor?.dailyTokenLimit ?? 50,
        status: 'OPEN',
        date: resolveClinicLogicalDay(), // Align with logical day
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


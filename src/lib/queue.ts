import prisma from '@/lib/db/prisma'

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
        date: new Date(), // legacy compat
      },
    })
  }

  return queue
}

/**
 * Returns logical date string (YYYY-MM-DD)
 * Logical day starts at 4:00 AM IST (UTC+5:30)
 * So before 4 AM IST = previous calendar date
 */
export function getLogicalDate(): string {
  const now = new Date()
  // IST = UTC + 5:30 = UTC + 330 minutes
  const istOffset = 330 * 60 * 1000
  const istTime = new Date(now.getTime() + istOffset)

  // If before 4 AM IST — use previous day
  if (istTime.getUTCHours() < 4) {
    istTime.setUTCDate(istTime.getUTCDate() - 1)
  }

  return istTime.toISOString().split('T')[0] // YYYY-MM-DD
}

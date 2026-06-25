import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'
// Using existing session helper for now as Task 2.1 (verifyAuth) is not yet done
import { requireSession } from "@/lib/auth/session"

export async function GET(request: NextRequest) {
  try {
    const auth = await requireSession(["DOCTOR"]);
    if (auth.response) return auth.response;
    const payload = auth.session!;

    const doctor = await prisma.doctor.findUnique({
      where: { userId: payload.id },
      include: { platformPricing: true }
    })

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 })
    }

    return NextResponse.json({ doctor }, { status: 200 })
  } catch (error) {
    console.error('[DOCTOR_PROFILE_ERROR]', error)
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 })
  }
}

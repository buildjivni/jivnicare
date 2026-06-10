import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'
import { requireSession } from "@/lib/auth/session"

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireSession(["DOCTOR"]);
    if (auth.response) return auth.response;
    const payload = auth.session!;

    const body = await request.json()
    const { isOnline } = body

    if (typeof isOnline !== 'boolean') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    await prisma.doctor.update({
      where: { userId: payload.id },
      data: { isOnline },
    })

    return NextResponse.json({ success: true, isOnline }, { status: 200 })
  } catch (error) {
    console.error('[DOCTOR_SETTINGS_ERROR]', error)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}

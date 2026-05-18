import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const leadSchema = z.object({
  phone: z.string().min(10).max(15),
  name: z.string().optional(),
  city: z.string().optional(),
  roleInterest: z.enum(['PATIENT', 'DOCTOR', 'ADMIN']).optional(),
  specialty: z.string().optional(),
  source: z.string().optional(),
  lastStepCompleted: z.string().optional()
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const validation = leadSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid lead payload" }, { status: 400 });
    }

    const { phone, ...data } = validation.data;

    // Use upsert so repeated abandoned attempts just update the last step/timestamp
    const lead = await prisma.leadCapture.upsert({
      where: { phone },
      update: {
        ...data,
        updatedAt: new Date()
      },
      create: {
        phone,
        ...data
      }
    });

    return NextResponse.json({ success: true, leadId: lead.id });
  } catch (error) {
    console.error("Lead capture error:", error);
    // Don't expose database errors to public endpoint
    return NextResponse.json({ error: "Failed to capture lead" }, { status: 500 });
  }
}

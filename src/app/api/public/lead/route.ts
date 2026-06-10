import { apiResponse, apiError } from '@/lib/utils/api-response';
import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
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
      return apiError("Invalid lead payload", 400);
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

    return apiResponse({success: true, leadId: lead.id});
  } catch (error) {
    console.error("Lead capture error:", error);
    // Don't expose database errors to public endpoint
    return apiError("Failed to capture lead", 500);
  }
}

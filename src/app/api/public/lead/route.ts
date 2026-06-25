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

    const { phone, name, city, roleInterest, specialty, source, lastStepCompleted } = validation.data;

    // Map LeadCapture to existing DoctorRequest table
    // Save metadata in notes JSON
    const notesObj = {
      city: city || "",
      roleInterest: roleInterest || "",
      source: source || "",
      lastStepCompleted: lastStepCompleted || ""
    };

    let requestRecord = await prisma.doctorRequest.findFirst({
      where: { phone }
    });

    if (requestRecord) {
      requestRecord = await prisma.doctorRequest.update({
        where: { id: requestRecord.id },
        data: {
          name: name || requestRecord.name,
          speciality: specialty || requestRecord.speciality,
          district: city || requestRecord.district,
          notes: JSON.stringify({
            ...JSON.parse(requestRecord.notes || "{}"),
            ...notesObj
          })
        }
      });
    } else {
      requestRecord = await prisma.doctorRequest.create({
        data: {
          phone,
          name: name || "Anonymous",
          speciality: specialty || "General",
          district: city || "Jamui",
          notes: JSON.stringify(notesObj)
        }
      });
    }

    return apiResponse({success: true, leadId: requestRecord.id});
  } catch (error) {
    console.error("Lead capture error:", error);
    return apiError("Failed to capture lead", 500);
  }
}

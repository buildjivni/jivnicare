import { apiResponse, apiError } from '@/lib/utils/api-response';
import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('jivnicare_token')?.value;

    if (!token) return apiError("Unauthorized", 401);
    
    const decoded = await verifyToken(token) as { id: string, role: string } | null;
    if (!decoded || decoded.role !== 'DOCTOR') return apiError("Access denied", 403);

    const doctor = await prisma.doctor.findUnique({ where: { userId: decoded.id } });
    if (!doctor) return apiError("Doctor profile not found", 404);

    const operators = await prisma.operator.findMany({
      where: { doctorId: doctor.id, isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    return apiResponse({ operators });
  } catch (error) {
    console.error('Fetch Operators Error:', error);
    return apiError("Internal server error", 500);
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('jivnicare_token')?.value;

    if (!token) return apiError("Unauthorized", 401);
    
    const decoded = await verifyToken(token) as { id: string, role: string } | null;
    if (!decoded || decoded.role !== 'DOCTOR') return apiError("Access denied", 403);

    const body = await request.json();
    const { name, phone, role } = body;

    if (!name || name.trim().length < 2) {
      return apiError("Valid name is required", 400);
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      return apiError("Valid 10-digit phone number required", 400);
    }

    const doctor = await prisma.doctor.findUnique({ where: { userId: decoded.id } });
    if (!doctor) return apiError("Doctor profile not found", 404);

    // Check for duplicate phone
    const existing = await prisma.operator.findFirst({
      where: { phone, isActive: true }
    });
    if (existing) {
      return apiError("Operator with this phone already exists", 409);
    }

    const operator = await prisma.operator.create({
      data: {
        doctorId: doctor.id,
        name: name.trim(),
        phone,
        role: role || 'Receptionist',
      }
    });

    return apiResponse({ success: true, operator }, 201);
  } catch (error) {
    console.error('Create Operator Error:', error);
    return apiError("Internal server error", 500);
  }
}

export async function DELETE(request: Request) {
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get('jivnicare_token')?.value;
  
      if (!token) return apiError("Unauthorized", 401);
      
      const decoded = await verifyToken(token) as { id: string, role: string } | null;
      if (!decoded || decoded.role !== 'DOCTOR') return apiError("Access denied", 403);
  
      const { searchParams } = new URL(request.url);
      const operatorId = searchParams.get("id");
  
      if (!operatorId) {
        return apiError("Operator ID is required", 400);
      }
  
      const doctor = await prisma.doctor.findUnique({ where: { userId: decoded.id } });
      if (!doctor) return apiError("Doctor profile not found", 404);
  
      // Soft delete by setting isActive = false
      await prisma.operator.updateMany({
        where: { id: operatorId, doctorId: doctor.id },
        data: { isActive: false }
      });
  
      return apiResponse({ success: true });
    } catch (error) {
      console.error('Delete Operator Error:', error);
      return apiError("Internal server error", 500);
    }
  }

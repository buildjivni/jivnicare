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

    const operators = [];
    if (doctor.operatorName) {
      operators.push({
        id: "operator",
        name: doctor.operatorName,
        phone: doctor.operatorMobile,
        role: "Operator"
      });
    }
    if (doctor.receptionist1Name) {
      operators.push({
        id: "receptionist1",
        name: doctor.receptionist1Name,
        phone: doctor.receptionist1Phone,
        role: "Receptionist"
      });
    }
    if (doctor.receptionist2Name) {
      operators.push({
        id: "receptionist2",
        name: doctor.receptionist2Name,
        phone: doctor.receptionist2Phone,
        role: "Receptionist"
      });
    }
    if (doctor.receptionist3Name) {
      operators.push({
        id: "receptionist3",
        name: doctor.receptionist3Name,
        phone: doctor.receptionist3Phone,
        role: "Receptionist"
      });
    }

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
    const { name, phone } = body;

    if (!name || name.trim().length < 2) {
      return apiError("Valid name is required", 400);
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      return apiError("Valid 10-digit phone number required", 400);
    }

    const doctor = await prisma.doctor.findUnique({ where: { userId: decoded.id } });
    if (!doctor) return apiError("Doctor profile not found", 404);

    // Check duplicate phone in existing slots
    if (doctor.operatorMobile === phone ||
        doctor.receptionist1Phone === phone ||
        doctor.receptionist2Phone === phone ||
        doctor.receptionist3Phone === phone) {
      return apiError("Operator with this phone already exists", 409);
    }

    let updatedField = {};
    let slotId = "";
    if (!doctor.receptionist1Name) {
      updatedField = { receptionist1Name: name.trim(), receptionist1Phone: phone };
      slotId = "receptionist1";
    } else if (!doctor.receptionist2Name) {
      updatedField = { receptionist2Name: name.trim(), receptionist2Phone: phone };
      slotId = "receptionist2";
    } else if (!doctor.receptionist3Name) {
      updatedField = { receptionist3Name: name.trim(), receptionist3Phone: phone };
      slotId = "receptionist3";
    } else {
      return apiError("Maximum of 3 receptionists reached", 400);
    }

    await prisma.doctor.update({
      where: { id: doctor.id },
      data: updatedField
    });

    const operator = {
      id: slotId,
      name: name.trim(),
      phone,
      role: 'Receptionist'
    };

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

    let updateData = {};
    if (operatorId === "receptionist1") {
      updateData = { receptionist1Name: null, receptionist1Phone: null };
    } else if (operatorId === "receptionist2") {
      updateData = { receptionist2Name: null, receptionist2Phone: null };
    } else if (operatorId === "receptionist3") {
      updateData = { receptionist3Name: null, receptionist3Phone: null };
    } else if (operatorId === "operator") {
      updateData = { operatorName: "", operatorMobile: "" };
    } else {
      return apiError("Invalid operator ID", 400);
    }

    await prisma.doctor.update({
      where: { id: doctor.id },
      data: updateData
    });

    return apiResponse({ success: true });
  } catch (error) {
    console.error('Delete Operator Error:', error);
    return apiError("Internal server error", 500);
  }
}

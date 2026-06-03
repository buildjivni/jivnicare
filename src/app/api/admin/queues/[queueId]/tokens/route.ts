import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ queueId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = await verifyToken(token);
    if (!decoded || decoded.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { queueId } = await params;

    const dailyQueue = await prisma.dailyQueue.findUnique({
      where: { id: queueId },
      include: {
        doctor: {
          select: { name: true, clinicName: true, hospitalName: true }
        }
      }
    });

    if (!dailyQueue) {
      return NextResponse.json({ error: "Queue not found" }, { status: 404 });
    }

    const tokens = await prisma.queueToken.findMany({
      where: { queueId },
      orderBy: { tokenNumber: 'asc' },
      include: {
        user: { select: { name: true, phone: true } },
        walkInEntry: { select: { patientName: true, phoneNumber: true } }
      }
    });

    const formattedTokens = tokens.map(t => ({
      id: t.id,
      tokenNumber: t.tokenNumber,
      patientName: t.user?.name || t.walkInEntry?.patientName || "Walk-in Patient",
      phone: t.user?.phone || t.walkInEntry?.phoneNumber || "N/A",
      status: t.status,
      type: t.source,
      issuedAt: t.tokenIssuedAt.toISOString(),
      isEmergency: t.isEmergency,
    }));

    // Identify the exact current active token record if it exists
    const currentActiveRecord = formattedTokens.find(
      t => t.tokenNumber === dailyQueue.currentActiveToken && 
           (t.status === "WAITING" || t.status === "IN_CONSULTATION")
    );

    return NextResponse.json({
      success: true,
      queue: {
        id: dailyQueue.id,
        doctorName: dailyQueue.doctor.name,
        clinicName: dailyQueue.doctor.clinicName || dailyQueue.doctor.hospitalName,
        currentActiveToken: dailyQueue.currentActiveToken,
        status: dailyQueue.status,
        date: dailyQueue.date.toISOString(),
      },
      currentActiveRecord: currentActiveRecord || null,
      tokens: formattedTokens
    });
  } catch (error) {
    console.error("Queue Inspector API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: doctorId } = await params;
    
    // Get today's start of day in UTC
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      select: {
        averageConsultationTime: true,
        clinicOperations: true,
      }
    });

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    const queue = await prisma.dailyQueue.findUnique({
      where: {
        doctorId_date: {
          doctorId,
          date: today,
        }
      },
      include: {
        _count: {
          select: {
            tokens: {
              where: { status: "WAITING" }
            }
          }
        }
      }
    });

    const currentActiveToken = queue?.currentActiveToken || 0;
    const totalInQueue = queue?._count.tokens || 0;
    const avgTime = doctor.averageConsultationTime || 15;
    const estimatedWait = totalInQueue * avgTime;

    const response = NextResponse.json({
      success: true,
      queue: {
        currentToken: currentActiveToken,
        totalInQueue,
        estimatedWait,
        avgTime,
        status: queue?.status || "NOT_STARTED",
        isClosedToday: doctor.clinicOperations?.isClosedToday || false,
      }
    });

    response.headers.set('Cache-Control', 's-maxage=10, stale-while-revalidate');
    return response;

  } catch (error: any) {
    console.error("Queue stats error:", error);
    return NextResponse.json({ error: "Failed to fetch queue stats" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { getCurrentLogicalDay } from "@/lib/clinic-utils";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = verifyToken(token);
    if (!decoded || decoded.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const today = getCurrentLogicalDay();

    const activeQueues = await prisma.dailyQueue.findMany({
      where: {
        date: today
      },
      include: {
        doctor: {
          select: {
            name: true,
            hospitalName: true,
            district: true,
            averageConsultationTime: true,
            user: {
               select: { name: true }
            }
          }
        },
        _count: {
          select: {
            tokens: {
              where: { status: "WAITING" }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    const formattedQueues = activeQueues.map(q => {
      const waiting = q._count.tokens;
      const avgTime = q.doctor.averageConsultationTime || 15;
      const estWait = waiting * avgTime;
      
      return {
        id: q.id,
        clinicName: q.doctor.hospitalName || "General Clinic",
        doctorName: q.doctor.name,
        servingToken: q.currentActiveToken,
        waitingCount: waiting,
        estimatedWait: estWait,
        status: q.status,
        district: q.doctor.district,
        isHighLoad: waiting > 15
      };
    });

    return NextResponse.json({ success: true, queues: formattedQueues });
  } catch (error) {
    console.error("Queue Health API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

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

    // Fetch latest bookings across all clinics
    const recentBookings = await prisma.queueToken.findMany({
      take: 20,
      orderBy: {
        tokenIssuedAt: 'desc'
      },
      include: {
        queue: {
          include: {
            doctor: {
              select: {
                name: true,
                hospitalName: true
              }
            }
          }
        },
        user: {
          select: {
            name: true,
            phone: true
          }
        },
        walkInEntry: {
          select: {
            patientName: true
          }
        }
      }
    });

    const formattedBookings = recentBookings.map(b => ({
      id: b.id.slice(-8).toUpperCase(),
      patient: b.user?.name || b.walkInEntry?.patientName || "Walk-in Patient",
      doctor: b.queue.doctor.name,
      clinic: b.queue.doctor.hospitalName,
      date: b.tokenIssuedAt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      time: b.tokenIssuedAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      status: b.status,
      amount: "₹" + (b.queue.doctor as any).consultationFee || "₹500" // Fallback if schema doesn't match perfectly
    }));

    return NextResponse.json({ success: true, bookings: formattedBookings });
  } catch (error) {
    console.error("Admin Bookings API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

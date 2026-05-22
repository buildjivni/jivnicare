import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { logger } from "@/lib/infrastructure/logger";

// No special runtime, runs as standard Node serverless function
export async function GET(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload: any = await verifyToken(token);
  if (!payload?.id) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  // Create a streaming response using a TransformStream
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  // Helper to fetch bookings for the user
  const fetchBookings = async () => {
    const tokens = await prisma.queueToken.findMany({
      where: { userId: payload.id },
      include: {
        queue: {
          include: {
            doctor: {
              select: {
                slug: true,
                clinicName: true,
                district: true,
                averageConsultationTime: true,
                user: { select: { name: true } },
              },
            },
            tokens: {
              where: { status: "WAITING" },
              select: { tokenNumber: true, status: true, isEmergency: true },
            },
          },
        },
      },
      orderBy: { tokenIssuedAt: "desc" },
    });
    return tokens;
  };

  // Send initial data immediately
  try {
    const data = await fetchBookings();
    await writer.write(encoder.encode(`data: ${JSON.stringify({ bookings: data })}\n\n`));
  } catch (e) {
    logger.error({ category: "SYSTEM", message: "Initial fetch failed", error: e });
    await writer.write(encoder.encode(`event: error\ndata: ${JSON.stringify({ error: "Failed to fetch bookings" })}\n\n`));
  }

  // Periodic push every 30 seconds
  const interval = setInterval(async () => {
    try {
      const data = await fetchBookings();
      await writer.write(encoder.encode(`data: ${JSON.stringify({ bookings: data })}\n\n`));
    } catch (e) {
      logger.error({ category: "SYSTEM", message: "Periodic fetch failed", error: e });
    }
  }, 30_000);

  // Close stream when client disconnects
  request.signal.addEventListener("abort", async () => {
    clearInterval(interval);
    await writer.close();
  });

  return new NextResponse(stream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
    status: 200,
  });
}

import { apiResponse, apiError } from '@/lib/utils/api-response';
import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { logger } from "@/lib/infrastructure/logger";

// No special runtime, runs as standard Node serverless function
export async function GET(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("jivnicare_token")?.value;
  if (!token) {
    return apiError("Unauthorized", 401);
  }

  const payload: any = await verifyToken(token);
  if (!payload?.id) {
    return apiError("Invalid token", 401);
  }

  // Create a streaming response using a TransformStream
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  // Helper to fetch bookings for the user
  const fetchBookings = async () => {
    const tokens = await prisma.queueToken.findMany({
      where: { patientId: payload.id },
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
      orderBy: { bookedAt: "desc" },
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

  // Use a heartbeat to keep connection alive and detect dropped connections early
  let tick = 0;
  const interval = setInterval(async () => {
    tick++;
    try {
      // Every 15 seconds, send a ping to keep connection alive (prevent 504 timeouts)
      if (tick % 2 !== 0) {
        await writer.write(encoder.encode(`event: ping\ndata: ${Date.now()}\n\n`));
      } else {
        // Every 30 seconds, push fresh data
        const data = await fetchBookings();
        await writer.write(encoder.encode(`data: ${JSON.stringify({ bookings: data })}\n\n`));
      }
    } catch (e) {
      // If write fails, the client disconnected ungracefully.
      logger.warn({ category: "SYSTEM", message: "SSE Write failed, closing stream", error: e });
      clearInterval(interval);
      try { await writer.close(); } catch (err) {}
    }
  }, 15_000);

  // Close stream when client disconnects gracefully via signal
  request.signal.addEventListener("abort", () => {
    clearInterval(interval);
    try { writer.close(); } catch (err) {}
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

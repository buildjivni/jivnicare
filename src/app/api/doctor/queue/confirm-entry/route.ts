import { apiResponse, apiError } from '@/lib/utils/api-response';
import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("jivnicare_token")?.value;

    if (!token) {
      return apiError("Unauthorized", 401);
    }

    const payload: any = await verifyToken(token);
    if (!payload || !payload.id || payload.role !== "DOCTOR") {
      return apiError("Access denied", 403);
    }

    const body = await request.json();
    const { tokenId } = body;

    if (!tokenId || typeof tokenId !== "string") {
      return apiError("Token ID missing hai", 400);
    }

    // Fetch doctor profile for ownership check
    const doctor = await prisma.doctor.findUnique({ where: { userId: payload.id } });
    if (!doctor) {
      return apiError("Doctor profile not found", 404);
    }

    // Atomic transaction: lock token, check state, mark IN_CONSULTATION
    const result = await prisma.$transaction(async (tx) => {
      const tokenInTx = await tx.queueToken.findUnique({
        where: { id: tokenId },
        include: { queue: true }
      });

      if (!tokenInTx || tokenInTx.queue.doctorId !== doctor.id) {
        throw new Error("NOT_FOUND_OR_DENIED");
      }

      if (tokenInTx.status !== "CALLED") {
        throw new Error("INVALID_STATE");
      }

      const updatedToken = await tx.queueToken.update({
        where: { id: tokenId },
        data: {
          status: "IN_CONSULTATION"
        },
      });

      return updatedToken;
    });

    return apiResponse({ success: true, token: result });
  } catch (error: any) {
    console.error("Confirm entry error:", error);
    if (error.message === "INVALID_STATE") {
      return apiError("Token CALLED state mein nahi hai", 409);
    }
    if (error.message === "NOT_FOUND_OR_DENIED") {
      return apiError("Token nahi mila ya access denied", 403);
    }
    return apiError("Internal server error", 500);
  }
}

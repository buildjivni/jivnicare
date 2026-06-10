import { apiResponse, apiError } from '@/lib/utils/api-response';
import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

/**
 * GET /api/warmup
 * 
 * Called by Vercel Cron (or an external uptime pinger like UptimeRobot)
 * every 5 minutes to keep the Serverless Function "warm" and the 
 * MongoDB Atlas connection alive on Free Tier.
 * 
 * This prevents Cold Start (22%) related 500 errors on /api/public/search.
 * 
 * Setup: In vercel.json, add:
 * "crons": [{ "path": "/api/warmup", "schedule": "0/5 * * * *" }]
 */
export async function GET() {
  try {
    // Lightweight ping query — just count verified doctors
    const count = await prisma.doctor.count({
      where: { verificationStatus: "VERIFIED" },
    });

    return apiResponse({status: "warm",
      verifiedDoctors: count,
      timestamp: new Date().toISOString(),});
  } catch (error: any) {
    // Warmup failure is non-critical — never crash
    console.warn("[Warmup] DB ping failed:", error?.message);
    return apiResponse({status: "cold",
      error: "DB connection warming up",
      timestamp: new Date().toISOString(),}, 200); // Always 200 so UptimeRobot doesn't false-alarm
  }
}

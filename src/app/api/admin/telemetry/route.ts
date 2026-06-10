import { apiResponse, apiError } from '@/lib/utils/api-response';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';
import { getOperationalMetrics } from '@/lib/telemetry/redis';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("jivnicare_token")?.value;

    if (!token) {
      return apiError("Unauthorized", 401);
    }

    const payload: any = await verifyToken(token);
    if (!payload || !payload.id || payload.role !== "ADMIN") {
      return apiError("Forbidden: Admin access only", 403);
    }

    const metrics = await getOperationalMetrics();

    return apiResponse({success: true, data: metrics});
  } catch (error) {
    console.error("Failed to fetch telemetry metrics:", error);
    return apiError("Internal Server Error", 500);
  }
}

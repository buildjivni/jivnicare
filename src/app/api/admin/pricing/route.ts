import { apiResponse, apiError } from "@/lib/utils/api-response";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { updateDoctorPricing } from "@/lib/services/admin.service";

export async function PUT(request: Request) {
  try {
    // 1. Authenticate Admin
    const cookieStore = await cookies();
    const token = cookieStore.get("jivnicare_token")?.value;

    if (!token) {
      return apiError("Unauthorized", 401);
    }

    const decoded = (await verifyToken(token)) as { id: string; role: string } | null;
    if (!decoded) {
      return apiError("Invalid or expired session", 401);
    }

    if (decoded.role !== "ADMIN") {
      return apiError("Access denied. Admins only.", 403);
    }

    // 2. Parse Payload
    const body = await request.json();
    const {
      doctorId,
      monthlyFee,
      perBookingFee,
      discountPercent,
      partnerTier,
      freeUntil,
    } = body;

    if (!doctorId) {
      return apiError("Doctor ID is required", 400);
    }

    // Convert types and apply defaults
    const pricingData = {
      monthlyFee: monthlyFee !== undefined ? parseFloat(String(monthlyFee)) : 2999,
      perBookingFee: perBookingFee !== undefined ? parseFloat(String(perBookingFee)) : 29,
      discountPercent: discountPercent !== undefined ? parseInt(String(discountPercent), 10) : 100,
      partnerTier: partnerTier || "EARLY_PARTNER",
      freeUntil: freeUntil ? new Date(freeUntil) : null,
    };

    // 3. Update pricing
    const result = await updateDoctorPricing(
      decoded.id,
      doctorId,
      pricingData
    );

    return NextResponse.json({
      success: true,
      message: "Doctor platform pricing updated successfully.",
      pricing: result,
      auditLogged: true,
    });
  } catch (error: any) {
    console.error("Admin Pricing Update Error:", error);
    return apiError(error.message || "Internal server error.", 500);
  }
}

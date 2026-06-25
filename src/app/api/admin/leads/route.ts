import { apiResponse, apiError } from '@/lib/utils/api-response';
import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("jivnicare_token")?.value;

    if (!token) {
      return apiError("Unauthorized", 401);
    }

    const decoded: any = await verifyToken(token);
    if (!decoded || decoded.role !== "ADMIN") {
      return apiError("Forbidden: Admin access only", 403);
    }

    // Fetch all doctor requests ordered by recency
    const requests = await prisma.doctorRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 100, // Pilot scale — top 100 most recent
    });

    const leads = requests.map((req) => {
      let city = req.district;
      let roleInterest = "DOCTOR"; // default
      let source = "";
      let lastStepCompleted = "";

      if (req.notes) {
        try {
          const parsed = JSON.parse(req.notes);
          if (parsed && typeof parsed === "object") {
            city = parsed.city || city;
            roleInterest = parsed.roleInterest || roleInterest;
            source = parsed.source || source;
            lastStepCompleted = parsed.lastStepCompleted || lastStepCompleted;
          }
        } catch (e) {
          // not json, leave as default
        }
      }

      return {
        id: req.id,
        phone: req.phone,
        name: req.name,
        city,
        roleInterest,
        specialty: req.speciality,
        clinicName: "",
        source,
        lastStepCompleted,
        status: req.contacted ? "CONTACTED" : "PENDING",
        createdAt: req.createdAt,
        updatedAt: req.createdAt,
      };
    });

    // Aggregate specialty demand
    const specialtyDemand: Record<string, number> = {};
    const cityDemand: Record<string, number> = {};
    const stepDropoff: Record<string, number> = {};

    for (const lead of leads) {
      if (lead.specialty) {
        specialtyDemand[lead.specialty] = (specialtyDemand[lead.specialty] || 0) + 1;
      }
      if (lead.city) {
        cityDemand[lead.city] = (cityDemand[lead.city] || 0) + 1;
      }
      if (lead.lastStepCompleted) {
        stepDropoff[lead.lastStepCompleted] = (stepDropoff[lead.lastStepCompleted] || 0) + 1;
      }
    }

    const topSpecialties = Object.entries(specialtyDemand)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));

    const topCities = Object.entries(cityDemand)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([city, count]) => ({ city, count }));

    const dropoffByStep = Object.entries(stepDropoff)
      .sort((a, b) => b[1] - a[1])
      .map(([step, count]) => ({ step, count }));

    return NextResponse.json({
      success: true,
      leads,
      analytics: {
        total: leads.length,
        doctorLeads: leads.filter((l) => l.roleInterest === "DOCTOR").length,
        patientLeads: leads.filter((l) => l.roleInterest === "PATIENT").length,
        topSpecialties,
        topCities,
        dropoffByStep,
      },
    });
  } catch (error) {
    console.error("Admin Leads API Error:", error);
    return apiError("Internal Server Error", 500);
  }
}

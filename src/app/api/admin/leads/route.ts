import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = verifyToken(token);
    if (!decoded || decoded.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access only" }, { status: 403 });
    }

    // Fetch all leads ordered by recency
    const leads = await prisma.leadCapture.findMany({
      orderBy: { createdAt: "desc" },
      take: 100, // Pilot scale — top 100 most recent
      select: {
        id: true,
        phone: true,
        name: true,
        city: true,
        roleInterest: true,
        specialty: true,
        clinicName: true,
        source: true,
        lastStepCompleted: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
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
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

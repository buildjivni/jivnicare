import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { searchDoctors } from "@/lib/search/search-engine";
import { mapPrismaDoctorToUI } from "@/lib/utils/data-utils";

function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || searchParams.get("name") || "";
    
    // Constraint check: min 2 characters
    if (q && q.trim().length === 1) {
      return NextResponse.json(
        {
          results: [],
          total: 0,
          isFuzzy: false,
          emptyMessage: "Type at least 2 characters",
          page: 1,
          limit: 15,
          hasMore: false,
        },
        { status: 200 }
      );
    }

    const input = {
      district: searchParams.get("district"),
      speciality: searchParams.get("speciality") || searchParams.get("specialty"),
      gender: searchParams.get("gender"),
      language: searchParams.get("language"),
      availableToday: searchParams.get("availableToday") === "true",
      emergencyOnly: searchParams.get("emergencyOnly") === "true",
      feeRange: searchParams.get("feeRange"),
      lat: searchParams.get("lat"),
      lng: searchParams.get("lng"),
      sort: searchParams.get("sort") || "recommended",
    };

    // Layer 2: PostgreSQL query
    const where: any = {
      isVerified: true,
      isActive: true,
    };

    const andConditions: any[] = [];

    // Enforce district hard filter (always enforced if provided)
    if (input.district) {
      andConditions.push({ district: { equals: input.district, mode: "insensitive" } });
    }

    // Enforce specialty filter on DB level
    if (input.speciality) {
      andConditions.push({ speciality: { equals: input.speciality, mode: "insensitive" } });
    }

    // Enforce gender filter on DB level
    if (input.gender && input.gender.toLowerCase() !== "any") {
      andConditions.push({ gender: { equals: input.gender, mode: "insensitive" } });
    }

    // Enforce language filter on DB level (capitalized match)
    if (input.language) {
      const capitalizedLang = input.language.charAt(0).toUpperCase() + input.language.slice(1).toLowerCase();
      andConditions.push({ languages: { has: capitalizedLang } });
    }

    // Enforce fee range filter on DB level (checking both consultationFee and fallback fee)
    if (input.feeRange) {
      const range = input.feeRange.toLowerCase();
      if (range === "under_200" || range === "under-200") {
        andConditions.push({
          OR: [
            { AND: [{ consultationFee: { gt: 0 } }, { consultationFee: { lte: 200 } }] },
            { AND: [{ consultationFee: 0 }, { fee: { lte: 200 } }] }
          ]
        });
      } else if (range === "200_500" || range === "200-500") {
        andConditions.push({
          OR: [
            { AND: [{ consultationFee: { gte: 200 } }, { consultationFee: { lte: 500 } }] },
            { AND: [{ consultationFee: 0 }, { fee: { gte: 200 } }, { fee: { lte: 500 } }] }
          ]
        });
      } else if (range === "500_plus" || range === "500-plus") {
        andConditions.push({
          OR: [
            { consultationFee: { gte: 500 } },
            { AND: [{ consultationFee: 0 }, { fee: { gte: 500 } }] }
          ]
        });
      }
    }

    // Query multiple fields simultaneously on database level for text queries
    if (q && q.trim().length >= 2) {
      const term = q.trim();
      andConditions.push({
        OR: [
          { name: { contains: term, mode: "insensitive" } },
          { speciality: { contains: term, mode: "insensitive" } },
          { clinicName: { contains: term, mode: "insensitive" } },
          { hospitalName: { contains: term, mode: "insensitive" } },
          { bio: { contains: term, mode: "insensitive" } },
          { qualifications: { contains: term, mode: "insensitive" } },
          { locality: { contains: term, mode: "insensitive" } },
          { diseases: { has: term } },
          { procedures: { has: term } }
        ]
      });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    // Fetch up to 500 records from DB (safety cap)
    const dbDoctors = await prisma.doctor.findMany({
      where,
      include: {
        clinic: true,
        weeklySchedule: true,
        clinicOperations: true,
        platformPricing: true,
        dailyQueues: {
          take: 1,
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      take: 500,
    });

    // Map database doctors to UI structure
    let uiDoctors = dbDoctors.map((doc) => {
      const mapped = mapPrismaDoctorToUI(doc);
      // Inject coordinates if present
      if (input.lat && input.lng && doc.latitude !== null && doc.longitude !== null) {
        const userLat = parseFloat(input.lat);
        const userLng = parseFloat(input.lng);
        const dist = calculateHaversineDistance(userLat, userLng, doc.latitude, doc.longitude);
        mapped.distanceKm = dist;
        mapped.distanceStr = `${dist.toFixed(1)} km`;
        mapped.distance = `${dist.toFixed(1)} km away`;
      }
      return mapped;
    });

    // Layer 3: In-memory Scoring & Ranking
    const searchResult = searchDoctors(q, uiDoctors, input.district || "");
    let scoredResults = searchResult.results;

    // Layer 4: Hard Filters (user-selected filters applied on scored/ranked results)
    let filteredResults = scoredResults;

    // A. Speciality Filter
    if (input.speciality) {
      const specLower = input.speciality.toLowerCase();
      filteredResults = filteredResults.filter((doc) =>
        doc.specialty.toLowerCase() === specLower
      );
    }

    // B. Gender Filter
    if (input.gender && input.gender.toLowerCase() !== "any") {
      const genLower = input.gender.toLowerCase();
      filteredResults = filteredResults.filter((doc) =>
        doc.gender?.toLowerCase() === genLower
      );
    }

    // C. Language Filter
    if (input.language) {
      const langLower = input.language.toLowerCase();
      filteredResults = filteredResults.filter((doc) =>
        doc.languages?.some((lang) => lang.toLowerCase() === langLower)
      );
    }

    // D. Available Today Filter
    if (input.availableToday) {
      filteredResults = filteredResults.filter((doc) =>
        doc.isAvailableToday || doc.isQueueActive
      );
    }

    // E. Emergency Only Filter
    if (input.emergencyOnly) {
      filteredResults = filteredResults.filter((doc) =>
        (doc as any).isEmergencySupported === true || (doc as any).emergencyAvailable === true
      );
    }

    // F. Fee Range Filter
    if (input.feeRange) {
      const range = input.feeRange.toLowerCase();
      filteredResults = filteredResults.filter((doc) => {
        const feeVal = parseInt(doc.fee.replace(/\D/g, "")) || 0;
        if (range === "under_200" || range === "under-200") {
          return feeVal <= 200;
        } else if (range === "200_500" || range === "200-500") {
          return feeVal >= 200 && feeVal <= 500;
        } else if (range === "500_plus" || range === "500-plus") {
          return feeVal >= 500;
        }
        return true;
      });
    }

    // Additional Sorts (if not using scoring default)
    if (input.sort === "distance" && input.lat && input.lng) {
      filteredResults.sort((a, b) => {
        const distA = a.distanceKm ?? Infinity;
        const distB = b.distanceKm ?? Infinity;
        return distA - distB;
      });
    } else if (input.sort === "fee_low") {
      filteredResults.sort((a, b) => {
        const feeA = parseInt(a.fee.replace(/\D/g, "")) || 0;
        const feeB = parseInt(b.fee.replace(/\D/g, "")) || 0;
        return feeA - feeB;
      });
    } else if (input.sort === "fee_high") {
      filteredResults.sort((a, b) => {
        const feeA = parseInt(a.fee.replace(/\D/g, "")) || 0;
        const feeB = parseInt(b.fee.replace(/\D/g, "")) || 0;
        return feeB - feeA;
      });
    } else if (input.sort === "experience") {
      filteredResults.sort((a, b) => {
        const expA = parseInt(a.experience) || 0;
        const expB = parseInt(b.experience) || 0;
        return expB - expA;
      });
    }

    // Layer 5: Result Display & Pagination
    const pageVal = parseInt(searchParams.get("page") || "1") || 1;
    const limitVal = parseInt(searchParams.get("limit") || "15") || 15;
    const offset = (pageVal - 1) * limitVal;

    const totalResults = filteredResults.length;
    const paginatedResults = filteredResults.slice(offset, offset + limitVal);
    const hasMore = offset + limitVal < totalResults;

    // Track search queries in the search log (fire-and-forget background operation)
    if (q && q.trim()) {
      prisma.searchLog
        .create({
          data: {
            query: q.trim().toLowerCase().slice(0, 100),
            district: input.district || null,
            resultCount: totalResults,
          },
        })
        .catch(() => {});
    }

    return NextResponse.json(
      {
        results: paginatedResults,
        total: totalResults,
        isFuzzy: searchResult.isFuzzy,
        didYouMean: searchResult.didYouMean,
        emptyMessage: searchResult.emptyMessage,
        page: pageVal,
        limit: limitVal,
        hasMore,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[SEARCH_API_ERROR]", error);
    return NextResponse.json(
      { error: "Search failed. Please try again." },
      { status: 500 }
    );
  }
}

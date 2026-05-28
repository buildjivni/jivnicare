import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { searchDoctors } from '@/lib/search/search-engine';
import { getInferredSpecialties } from '@/lib/search/search-dictionary';
import { mapPrismaDoctorToUI } from '@/lib/utils/data-utils';
import { normalizeDistrict } from '@/lib/constants/districts';
import type { Doctor } from '@/types';

export const dynamic = 'force-dynamic';

// Helper: Haversine Formula for air distance calculation
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c; // Distance in km
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    let specialties = searchParams.getAll('specialty');
    
    // If not array params, try comma-separated
    if (specialties.length === 0) {
      const specParam = searchParams.get('specialty');
      if (specParam) specialties = specParam.split(',').filter(Boolean);
    }

    // Phase 3: Search Intelligence Dictionary
    // Infer specialties from symptoms (e.g. "heart" -> "Cardiologist")
    if (query) {
      const inferred = getInferredSpecialties(query);
      if (inferred.length > 0) {
        specialties = [...specialties, ...inferred];
      }
    }

    // Build Prisma Where Clause
    const whereClause: any = {
      verificationStatus: 'VERIFIED'
    };
    
    const andClauses: any[] = [];

    if (specialties.length > 0) {
      andClauses.push({
        specialties: {
          some: {
            OR: specialties.map(s => ({
              name: { contains: s, mode: 'insensitive' }
            }))
          }
        }
      });
    }

    // Database-level text search for the query to ensure we fetch the right candidates
    if (query) {
      andClauses.push({
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { hospitalName: { contains: query, mode: 'insensitive' } },
          { district: { contains: query, mode: 'insensitive' } },
          { bio: { contains: query, mode: 'insensitive' } },
          { keywords: { some: { term: { contains: query, mode: 'insensitive' } } } },
          { specialties: { some: { name: { contains: query, mode: 'insensitive' } } } }
        ]
      });
    }

    if (andClauses.length > 0) {
      whereClause.AND = andClauses;
    }

    // Geo Patient Location Data & Filters
    const districtRaw = searchParams.get('district') || '';
    const district = normalizeDistrict(districtRaw);
    const minExperience = parseInt(searchParams.get('minExperience') || '0', 10);
    const maxFee = parseInt(searchParams.get('maxFee') || '10000', 10);
    const availability = searchParams.get('availability'); // 'any', 'today'
    const sort = searchParams.get('sort') || 'recommended';
    const isEmergency = searchParams.get('isEmergency') === 'true';

    // Filter by district only when explicitly provided by the UI
    if (district) {
      whereClause.district = { equals: district, mode: 'insensitive' };
    }

    // Phase 3: Lead/Search Tracking (Fire and forget)
    // We don't await this so it doesn't block the API response
    if (query) {
      prisma.searchAnalytics.create({
        data: {
          query,
          normalizedQuery: query.toLowerCase(),
          district,
          resultsCount: 0 // Will update later or just track the query for now
        }
      }).catch(e => console.warn("Search Analytics Tracking Failed:", e));
    }
    
    
    // Geo Patient Location Data
    const patientLatParam = searchParams.get('lat');
    const patientLngParam = searchParams.get('lng');
    const patientLat = patientLatParam ? parseFloat(patientLatParam) : null;
    const patientLng = patientLngParam ? parseFloat(patientLngParam) : null;

    if (minExperience > 0) {
      whereClause.experience = { gte: minExperience };
    }
    
    if (maxFee < 10000) {
      whereClause.fee = { lte: maxFee };
    }

    if (isEmergency) {
      whereClause.clinicOperations = {
        is: {
          emergencySlots: { gt: 0 }
        }
      };
    }

    // ── Fetch verified doctors from DB ───────────────────────────────────
    const dbDoctors = await prisma.doctor.findMany({
      where: whereClause,
      select: {
        id: true,
        slug: true,
        name: true,
        education: true,
        hospitalName: true,
        district: true,
        rating: true,
        verificationStatus: true,
        experience: true,
        fee: true,
        profileImage: true,
        clinicImage: true,
        updatedAt: true,
        averageConsultationTime: true,
        latitude: true,
        longitude: true,
        bio: true,
        specialties: { select: { name: true } },
        keywords: { select: { term: true } },
        weeklySchedule: true,
        clinicOperations: true,
        dailyQueues: {
          where: {
            date: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
              lt:  new Date(new Date().setHours(23, 59, 59, 999)),
            }
          },
          select: {
            status: true,
            issuedTokensCount: true,
            currentActiveToken: true,
            maxCapacity: true,
          },
          take: 1,
        }
      },
      take: 100 // Prevent crashing edge functions on massive datasets
    });

    // ── Pre-Filter for Emergency Discovery ──────────────────────────────
    let filteredDbDoctors = dbDoctors;
    // If we're strictly looking for nearby emergency, ensure they have coords
    if (isEmergency && patientLat && patientLng) {
      filteredDbDoctors = filteredDbDoctors.filter(d => d.latitude !== null && d.longitude !== null);
    }

    // Compute distance for geo-aware search and attach to doctor objects
    if (patientLat && patientLng) {
      filteredDbDoctors = filteredDbDoctors.map(d => {
        if (d.latitude != null && d.longitude != null) {
          const distanceKm = getDistanceKm(patientLat, patientLng, d.latitude, d.longitude);
          const distanceStr = distanceKm < 1 ? `${Math.round(distanceKm * 1000)} m away` : `${distanceKm.toFixed(1)} km away`;
          return { ...d, distanceKm, distance: distanceKm, distanceStr };
        }
        return d;
      });
    }

let mappedDoctors: Doctor[] = filteredDbDoctors.map(mapPrismaDoctorToUI);

    // ── Availability Filtering ──────────────────────────────────────────
    if (availability === 'today') {
      mappedDoctors = mappedDoctors.filter(d => d.isAvailableToday);
    }

    // ── Discovery Intelligence: Sorting ──────────────────────────────────
    mappedDoctors.sort((a, b) => {
      // 1. Distance Priority (If requested or if patient coordinates provided for generic search)
      if (sort === 'distance' || (patientLat && patientLng && sort === 'recommended')) {
        const distA = a.distanceKm ?? 99999;
        const distB = b.distanceKm ?? 99999;
        
        // If sorting strictly by distance or if emergency
        if (sort === 'distance' || isEmergency) {
          return distA - distB;
        }
        
        // Soft distance sort for recommended (bump very close clinics)
        if (distA < 5 && distB > 10) return -1;
        if (distB < 5 && distA > 10) return 1;
      }

      // 2. Prioritize active queues in 'recommended'
      if (sort === 'recommended') {
        if (a.isQueueActive && !b.isQueueActive) return -1;
        if (!a.isQueueActive && b.isQueueActive) return 1;
        return (b.rating || 0) - (a.rating || 0);
      }
      
      // 2. Experience
      if (sort === 'experience') {
        const expA = Number(a.experience) || 0;
        const expB = Number(b.experience) || 0;
        return expB - expA;
      }
      
      // 3. Fee (Low to High)
      if (sort === 'fee_low') {
        const feeA = Number(String(a.fee).replace(/\D/g, '')) || 0;
        const feeB = Number(String(b.fee).replace(/\D/g, '')) || 0;
        return feeA - feeB;
      }
      
      // 4. Wait Time (Only for active queues)
      if (sort === 'wait_time') {
        const waitA = a.isQueueActive ? (a.queueWaitMinutes || 0) : 9999;
        const waitB = b.isQueueActive ? (b.queueWaitMinutes || 0) : 9999;
        return waitA - waitB;
      }

      return 0;
    });

    // Run the fuzzy search algorithm for final scoring if query exists
    const searchResult = searchDoctors(query, mappedDoctors, district);

    return NextResponse.json(searchResult);

  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ error: "Failed to perform search" }, { status: 500 });
  }
}

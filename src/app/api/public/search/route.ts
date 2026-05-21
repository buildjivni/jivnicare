import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { searchDoctors } from '@/lib/search-engine';
import { getInferredSpecialties } from '@/lib/search-dictionary';
import type { Doctor } from '@/types';

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
      if (specParam) specialties = specParam.split(',');
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

    if (specialties.length > 0) {
      whereClause.specialties = {
        some: {
          OR: specialties.map(s => ({
            name: { contains: s, mode: 'insensitive' }
          }))
        }
      };
    }

    if (query) {
      whereClause.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { hospitalName: { contains: query, mode: 'insensitive' } },
        { clinicName: { contains: query, mode: 'insensitive' } },
        { district: { contains: query, mode: 'insensitive' } },
        { city: { contains: query, mode: 'insensitive' } },
        { locality: { contains: query, mode: 'insensitive' } },
        { fullAddress: { contains: query, mode: 'insensitive' } },
        { qualifications: { contains: query, mode: 'insensitive' } },
        { education: { contains: query, mode: 'insensitive' } },
        { bio: { contains: query, mode: 'insensitive' } },
        { keywords: { some: { term: { contains: query, mode: 'insensitive' } } } },
        { specialties: { some: { name: { contains: query, mode: 'insensitive' } } } },
      ];
      
      // Phase 3: Lead/Search Tracking (Fire and forget)
      // We don't await this so it doesn't block the API response
      const districtParam = searchParams.get('district') || 'Patna';
      prisma.searchAnalytics.create({
        data: {
          query,
          normalizedQuery: query.toLowerCase(),
          district: districtParam,
          resultsCount: 0 // Will update later or just track the query for now
        }
      }).catch(e => console.warn("Search Analytics Tracking Failed:", e));
    }
    
    // ── Additional Filters ──────────────────────────────────────────────
    const district = searchParams.get('district') || 'Patna';
    const minExperience = parseInt(searchParams.get('minExperience') || '0', 10);
    const maxFee = parseInt(searchParams.get('maxFee') || '10000', 10);
    const availability = searchParams.get('availability'); // 'any', 'today'
    const sort = searchParams.get('sort') || 'recommended';
    const isEmergency = searchParams.get('isEmergency') === 'true';
    
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
      }
    });

    // ── Pre-Filter for Emergency Discovery ──────────────────────────────
    let filteredDbDoctors = dbDoctors;
    // If we're strictly looking for nearby emergency, ensure they have coords
    if (isEmergency && patientLat && patientLng) {
      filteredDbDoctors = filteredDbDoctors.filter(d => d.latitude !== null && d.longitude !== null);
    }

    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayIndex = new Date().getDay();
    const todayString = daysOfWeek[todayIndex];

    // ── Map Prisma Doctor → Frontend Doctor type ─────────────────────────
    let mappedDoctors: Doctor[] = filteredDbDoctors.map(doc => {
      // ... same mapping logic as before ...
      let isAvailableToday = false;
      let nextTime = "N/A";
      
      if (doc.weeklySchedule) {
        const todaySchedule: any = doc.weeklySchedule[todayString as keyof typeof doc.weeklySchedule];
        if (todaySchedule && todaySchedule.isOpen) {
          isAvailableToday = true;
          nextTime = todaySchedule.start || "Available";
        }
      }

      const todayQueue = doc.dailyQueues?.[0];
      const isQueueActive = todayQueue
        ? (todayQueue.status === 'ACTIVE' || todayQueue.status === 'NOT_STARTED')
          && !(doc.clinicOperations?.isClosedToday ?? false)
          && !(doc.clinicOperations?.pauseOnlineBooking ?? false)
        : false;

      const avgConsultTime = doc.averageConsultationTime || 15;
      const waitingPatients = todayQueue
        ? Math.max(0, (todayQueue.issuedTokensCount || 0) - (todayQueue.currentActiveToken || 0))
        : 0;
      const queueWaitMinutes = isQueueActive ? waitingPatients * avgConsultTime : undefined;

      // Distance calculation
      let distanceKm = undefined;
      let distanceStr = undefined;
      if (patientLat && patientLng && doc.latitude && doc.longitude) {
        distanceKm = getDistanceKm(patientLat, patientLng, doc.latitude, doc.longitude);
        distanceStr = distanceKm < 1 ? `${Math.round(distanceKm * 1000)} m away` : `${distanceKm.toFixed(1)} km away`;
      }

      return {
        id: doc.id,
        slug: doc.slug || doc.id,
        name: doc.name,
        specialty: doc.specialties.length > 0 ? doc.specialties[0].name : "General Physician",
        qualifications: doc.education ? doc.education.split(',')[0] : 'MBBS',
        clinic: doc.hospitalName,
        location: doc.district,
        rating: doc.rating || (doc.verificationStatus === 'VERIFIED' ? 4.5 : 0),
        reviewCount: (doc as any).reviewCount || 0,
        totalConsultations: (doc as any).totalConsultations || 0,
        verifiedBadgeLabel: (doc as any).verifiedBadgeLabel || (doc.experience >= 15 ? 'Experienced' : 'Verified'),
        experience: doc.experience,
        experienceStr: `${doc.experience} Years`,
        fee: doc.fee,
        feeStr: `₹${doc.fee}`,
        image: doc.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name)}&background=5298D2&color=fff&size=128`,
        isAvailableToday,
        available: isAvailableToday ? "Today" : "Check Schedule",
        isQueueActive,
        queueWaitMinutes,
        patientsWaiting: waitingPatients,
        hasEmergencySupport: (doc.clinicOperations?.emergencySlots ?? 0) > 0,
        tags: [...doc.specialties.map(s => s.name), ...doc.keywords.map(k => k.term)],
        about: doc.bio || "",
        distanceKm,
        distanceStr,
        latitude: doc.latitude,
        longitude: doc.longitude
      } as any;
    });

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

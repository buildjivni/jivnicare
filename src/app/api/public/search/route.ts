import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { searchDoctors } from '@/lib/search-engine';
import type { Doctor } from '@/types';

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
        { district: { contains: query, mode: 'insensitive' } },
        { keywords: { some: { term: { contains: query, mode: 'insensitive' } } } }
      ];
    }
    
    // ── Additional Filters ──────────────────────────────────────────────
    const district = searchParams.get('district') || 'Patna';
    const minExperience = parseInt(searchParams.get('minExperience') || '0', 10);
    const maxFee = parseInt(searchParams.get('maxFee') || '10000', 10);
    const availability = searchParams.get('availability'); // 'any', 'today'
    const sort = searchParams.get('sort') || 'recommended';

    if (minExperience > 0) {
      whereClause.experience = { gte: minExperience };
    }
    
    if (maxFee < 10000) {
      whereClause.fee = { lte: maxFee };
    }

    // ── Fetch verified doctors from DB ───────────────────────────────────
    const dbDoctors = await prisma.doctor.findMany({
      where: whereClause,
      include: {
        specialties: true,
        keywords: true,
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

    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayIndex = new Date().getDay();
    const todayString = daysOfWeek[todayIndex];

    // ── Map Prisma Doctor → Frontend Doctor type ─────────────────────────
    let mappedDoctors: Doctor[] = dbDoctors.map(doc => {
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
        tags: [...doc.specialties.map(s => s.name), ...doc.keywords.map(k => k.term)],
        about: doc.bio || "",
      } as any;
    });

    // ── Availability Filtering ──────────────────────────────────────────
    if (availability === 'today') {
      mappedDoctors = mappedDoctors.filter(d => d.isAvailableToday);
    }

    // ── Discovery Intelligence: Sorting ──────────────────────────────────
    mappedDoctors.sort((a, b) => {
      // 1. Prioritize active queues in 'recommended'
      if (sort === 'recommended') {
        if (a.isQueueActive && !b.isQueueActive) return -1;
        if (!a.isQueueActive && b.isQueueActive) return 1;
        return (b.rating || 0) - (a.rating || 0);
      }
      
      // 2. Experience
      if (sort === 'experience') return b.experience - a.experience;
      
      // 3. Fee (Low to High)
      if (sort === 'fee_low') return a.fee - b.fee;
      
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

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

    // Fetch verified doctors from DB with pagination/limit
    const limit = parseInt(searchParams.get('limit') || '30', 10);
    
    const dbDoctors = await prisma.doctor.findMany({
      where: whereClause,
      take: limit,
      include: {
        specialties: true,
        keywords: true,
      }
    });

    // Map Prisma Doctor to Frontend UI Doctor Type
    const mappedDoctors: Doctor[] = dbDoctors.map(doc => ({
      id: doc.id,
      name: doc.name,
      specialty: doc.specialties.length > 0 ? doc.specialties[0].name : "General Physician",
      clinic: doc.hospitalName,
      location: doc.district,
      rating: doc.rating || 4.5,
      reviews: 120, // Mock reviews since we don't have review model yet
      experience: `${doc.experience} Years`,
      fee: `₹${doc.fee}`,
      videoFee: `₹${doc.consultationFee || 300}`,
      image: doc.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name)}&background=random`,
      bgImage: "https://images.unsplash.com/photo-1551076805-e18690c5e53b?q=80&w=1200",
      available: "Today",
      tags: [...doc.specialties.map(s => s.name), ...doc.keywords.map(k => k.term)],
      about: doc.bio || "Experienced and dedicated doctor.",
      education: doc.education || "MBBS, MD",
      nextAvailable: "10:00 AM"
    }));

    // Run the fuzzy search algorithm for final scoring (typo tolerance)
    const searchResult = searchDoctors(query, mappedDoctors);

    return NextResponse.json(searchResult);

  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ error: "Failed to perform search" }, { status: 500 });
  }
}

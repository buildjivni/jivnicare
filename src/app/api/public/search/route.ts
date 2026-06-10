import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'
import { getInferredSpecialties } from '@/lib/search/search-dictionary'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const input = {
      city: searchParams.get('city'),
      speciality: searchParams.get('speciality'),
      name: searchParams.get('name'),
      district: searchParams.get('district'),
      availableToday: searchParams.get('availableToday') === 'true'
    }

    // Infer specialties from user query if provided
    const inferredSpecs = input.speciality ? getInferredSpecialties(input.speciality) : []

    const where: any = {
      verificationStatus: 'VERIFIED',
      isActive: true,
    }

    if (input.district) {
      where.district = input.district
    }

    if (inferredSpecs.length > 0) {
      where.specializations = { hasSome: inferredSpecs }
    }

    if (input.city) {
      where.city = { contains: input.city, mode: 'insensitive' }
    }

    if (input.name) {
      where.name = { contains: input.name, mode: 'insensitive' }
    }

    if (input.availableToday) {
      where.isOnline = true
    }

    const doctors = await prisma.doctor.findMany({
      where,
      include: { clinic: true },
      orderBy: [
        { isOnline: 'desc' },
        { jivnicarePatientsServed: 'desc' },
      ],
      take: 500, // Safety cap for result set depth
    })

    // Remove all hardcoded/extra fields like rating, reviews, bgImage as per JivniCare V1 spec
    const mappedDoctors = doctors.map(doc => ({
      id: doc.id,
      name: doc.name,
      speciality: doc.speciality,
      city: doc.city || (doc.clinic as any)?.city,
      hospitalName: doc.hospitalName || (doc.clinic as any)?.name,
      isOnline: doc.isOnline,
      consultationFee: doc.consultationFee,
      experienceYears: doc.experienceYears,
      // No rating, reviews, or bgImage in V1
    }))

    return NextResponse.json({ doctors: mappedDoctors }, { status: 200 })
  } catch (error) {
    console.error('[SEARCH_API_ERROR]', error)
    return NextResponse.json(
      { error: 'Search failed. Please try again.' },
      { status: 500 }
    )
  }
}

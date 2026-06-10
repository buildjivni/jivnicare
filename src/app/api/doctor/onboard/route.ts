import { apiResponse, apiError } from '@/lib/utils/api-response';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      fullName, contactNumber, password, 
      specialization, medicalRegistrationNumber, medicalCouncil, registrationYear,
      qualifications, experience, 
      practiceName, city, district, locality, pincode, practiceAddress,
      fee, bio, languages, emergencyAvailable,
      latitude, longitude
    } = body;

    // 1. Validation
    if (!fullName || !contactNumber || !specialization || !practiceName || !city || !password) {
      return apiError('Zaroori jankari missing hai', 400);
    }

    const phone10 = contactNumber.replace(/\D/g, "").slice(-10);
    if (!/^[6-9]\d{9}$/.test(phone10)) {
      return apiError('Phone number sahi nahi hai', 400);
    }

    // 2. Check duplicate
    const existing = await prisma.user.findUnique({ where: { phone: phone10 } });
    if (existing) {
      return apiError('Is number se already account hai', 409);
    }

    // 3. Create records in transaction
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      // A. Create User
      const user = await tx.user.create({
        data: {
          name: fullName,
          phone: phone10,
          password: hashedPassword,
          role: 'DOCTOR',
        }
      });

      // B. Create Clinic first (V1 required)
      const clinic = await tx.clinic.create({
        data: {
          name: practiceName,
          city: city,
          address: practiceAddress || '',
          isActive: true,
        },
      });

      // C. Create Doctor record
      const doctor = await tx.doctor.create({
        data: {
          userId: user.id,
          name: fullName,
          phone: phone10,
          speciality: specialization,
          qualification: qualifications || "",
          experienceYears: parseInt(experience) || 0,
          consultationFee: parseInt(fee) || 0,
          clinicId: clinic.id,
          averageConsultationMinutes: 10,
          dailyTokenLimit: 50,
          verificationStatus: 'PENDING',
          isOnline: false,
          jivnicarePatientsServed: 0,
          slug: `${fullName.replace(/^(dr\.?\s*|prof\.?\s*|mr\.?\s*|ms\.?\s*|mrs\.?\s*)/i, '').toLowerCase().replace(/ /g, '-')}-${phone10.slice(-4)}`,
          hospitalName: practiceName,
          clinicName: practiceName,
          city: city,
          district: district || city,
          locality: locality || "",
          fullAddress: practiceAddress || "",
          pincode: pincode || "",
          experience: parseInt(experience) || 0,
          fee: parseInt(fee) || 0,
          bio: bio || "",
          latitude: latitude || null,
          longitude: longitude || null,
          medicalRegistrationNumber: medicalRegistrationNumber || "",
          medicalCouncil: medicalCouncil || "",
          registrationYear: parseInt(registrationYear) || null,
          qualifications: qualifications || "",
          languages: languages ? languages.split(',').map((l: string) => l.trim()) : [],
        }
      });

      return { user, clinic, doctor };
    });

    return apiResponse({ 
      success: true, 
      message: 'Registration jama ho gayi hai. Admin 24-48 ghanton mein verify karenge.',
      doctorId: result.doctor.id 
    }, 201);
  } catch (error) {
    console.error('[DOCTOR_ONBOARD_ERROR]', error);
    return apiError('Registration fail ho gayi. Dobara try karein.', 500);
  }
}

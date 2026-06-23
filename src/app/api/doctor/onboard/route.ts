import { apiResponse, apiError } from '@/lib/utils/api-response';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      fullName, contactNumber, 
      specialization, medicalRegistrationNumber, medicalCouncil, registrationYear,
      qualifications, experience, 
      practiceName, city, district, locality, pincode, practiceAddress,
      fee, bio, languages, emergencyAvailable,
      latitude, longitude, email,
      weeklySchedule, clinicOperations,
      operatorName, operatorMobile,
      receptionist1Name, receptionist1Phone,
      receptionist2Name, receptionist2Phone,
      receptionist3Name, receptionist3Phone,
      diseases, procedures, clinicPhotos, documents
    } = body;

    // 1. Validation
    if (!fullName || !contactNumber || !specialization || !practiceName || !city || !email) {
      return apiError('Zaroori jankari missing hai (Name, Phone, Specialty, Clinic Name, City, and Email are required)', 400);
    }
    if (!operatorName || !operatorMobile) {
      return apiError('Operator name and contact number are required', 400);
    }

    const phone10 = contactNumber.replace(/\D/g, "").slice(-10);
    if (!/^[6-9]\d{9}$/.test(phone10)) {
      return apiError('Phone number sahi nahi hai', 400);
    }

    // Check duplicate by email as well to protect Google OAuth mapping
    const existingByEmail = await prisma.user.findFirst({ where: { email } });
    if (existingByEmail) {
      return apiError('Is Google account/email se already account hai', 409);
    }

    // 2. Check duplicate
    const existing = await prisma.user.findUnique({ where: { phone: phone10 } });
    if (existing) {
      return apiError('Is number se already account hai', 409);
    }

    // 3. Create records in transaction
    const result = await prisma.$transaction(async (tx) => {
      // A. Create User
      const user = await tx.user.create({
        data: {
          name: fullName,
          phone: phone10,
          email: email,
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

      // Upsert specialty
      const normalizedSpec = specialization.trim();
      const specialtySlug = normalizedSpec.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const specialtyRecord = await tx.specialty.upsert({
        where: { name: normalizedSpec },
        update: {},
        create: { name: normalizedSpec, slug: specialtySlug }
      });

      // C. Create Doctor record
      const doctor = await tx.doctor.create({
        data: {
          userId: user.id,
          name: fullName,
          phone: phone10,
          speciality: normalizedSpec,
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
          diseases: diseases ? diseases.split(',').map((d: string) => d.trim()).filter(Boolean) : [],
          procedures: procedures ? procedures.split(',').map((p: string) => p.trim()).filter(Boolean) : [],
          clinicPhotos: clinicPhotos ? clinicPhotos.filter(Boolean) : [],
          clinicImage: clinicPhotos && clinicPhotos.filter(Boolean)[0] ? clinicPhotos.filter(Boolean)[0] : null,
          verificationDocuments: documents ? documents.filter(Boolean) : [],
          specialties: {
            connect: [{ id: specialtyRecord.id }],
          },
        }
      });

      // D. Create Operator records
      if (operatorName && operatorMobile) {
        await tx.operator.create({
          data: {
            doctorId: doctor.id,
            name: operatorName.trim(),
            phone: operatorMobile.replace(/\D/g, "").slice(-10),
            role: "Operator",
          }
        });
      }

      const recs = [
        { name: receptionist1Name, phone: receptionist1Phone },
        { name: receptionist2Name, phone: receptionist2Phone },
        { name: receptionist3Name, phone: receptionist3Phone },
      ];

      for (const rec of recs) {
        if (rec.name && rec.phone) {
          await tx.operator.create({
            data: {
              doctorId: doctor.id,
              name: rec.name.trim(),
              phone: rec.phone.replace(/\D/g, "").slice(-10),
              role: "Receptionist",
            }
          });
        }
      }

      // E. Create default PlatformPricing record
      await tx.platformPricing.create({
        data: {
          doctorId: doctor.id,
          monthlyFee: 2999,
          perBookingFee: 29,
          discountPercent: 100,
          partnerTier: "EARLY_PARTNER",
        }
      });

      // F. Create WeeklySchedule
      await tx.weeklySchedule.create({
        data: {
          doctorId: doctor.id,
          monday: weeklySchedule?.monday || { isOpen: true, start: "09:00", end: "17:00", maxPatients: 20 },
          tuesday: weeklySchedule?.tuesday || { isOpen: true, start: "09:00", end: "17:00", maxPatients: 20 },
          wednesday: weeklySchedule?.wednesday || { isOpen: true, start: "09:00", end: "17:00", maxPatients: 20 },
          thursday: weeklySchedule?.thursday || { isOpen: true, start: "09:00", end: "17:00", maxPatients: 20 },
          friday: weeklySchedule?.friday || { isOpen: true, start: "09:00", end: "17:00", maxPatients: 20 },
          saturday: weeklySchedule?.saturday || { isOpen: true, start: "09:00", end: "17:00", maxPatients: 20 },
          sunday: weeklySchedule?.sunday || { isOpen: false, start: "", end: "", maxPatients: 0 },
        }
      });

      // G. Create ClinicOperations
      await tx.clinicOperations.create({
        data: {
          doctorId: doctor.id,
          status: 'AVAILABLE',
          isClosedToday: false,
          pauseOnlineBooking: false,
          walkInLimit: clinicOperations?.walkInLimit || 10,
          onlineLimit: clinicOperations?.onlineLimit || 20,
          emergencySlots: clinicOperations?.emergencySlots || 2,
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

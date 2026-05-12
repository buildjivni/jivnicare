import React from 'react';

interface PhysicianSchemaProps {
  doctor: {
    id: string;
    name: string;
    specialties: { name: string }[];
    district: string;
    profileImage?: string | null;
    verificationStatus: string;
    experienceYears?: number | null;
    hospitals?: { hospital: { name: string; address?: string | null } }[];
  };
}

export function PhysicianSchema({ doctor }: PhysicianSchemaProps) {
  const primarySpecialty = doctor.specialties[0]?.name || 'Medical Practitioner';
  
  // Format the JSON-LD payload
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Physician',
    name: `Dr. ${doctor.name}`,
    medicalSpecialty: doctor.specialties.map((s) => s.name),
    address: {
      '@type': 'PostalAddress',
      addressLocality: doctor.district,
      addressRegion: 'Bihar',
      addressCountry: 'IN',
    },
    image: doctor.profileImage || undefined,
    url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://jivnicare.com'}/doctors/${doctor.id}`,
    knowsAbout: doctor.specialties.map((s) => s.name),
    isAcceptingNewPatients: true,
  };

  // If the doctor belongs to hospitals, map them
  if (doctor.hospitals && doctor.hospitals.length > 0) {
    (jsonLd as any).memberOf = doctor.hospitals.map((h) => ({
      '@type': 'MedicalOrganization',
      name: h.hospital.name,
      address: h.hospital.address,
    }));
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

import React from 'react';

interface HospitalSchemaProps {
  hospital: {
    id: string;
    name: string;
    district: string;
    address?: string | null;
    emergencyAvailable: boolean;
    image?: string | null;
  };
}

export function HospitalSchema({ hospital }: HospitalSchemaProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Hospital',
    name: hospital.name,
    address: {
      '@type': 'PostalAddress',
      streetAddress: hospital.address,
      addressLocality: hospital.district,
      addressRegion: 'Bihar',
      addressCountry: 'IN',
    },
    image: hospital.image || undefined,
    url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://jivnicare.com'}/hospitals/${hospital.id}`,
    hasMap: `https://maps.google.com/?q=${encodeURIComponent(`${hospital.name}, ${hospital.district}, Bihar`)}`,
    isAcceptingNewPatients: true,
  };

  if (hospital.emergencyAvailable) {
    (jsonLd as any).medicalSpecialty = ['Emergency Medicine'];
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// src/components/DoctorMeta.tsx
import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/utils';

interface DoctorMetaProps {
  doctor: any; // Using any to avoid extra type imports; assumes doctor shape
}

export default function DoctorMeta({ doctor }: DoctorMetaProps) {
  const location = doctor.locality || doctor.location;
  return (
    <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50/80 border border-slate-100/50 group-hover:bg-blue-50/30 group-hover:border-blue-100/50 transition-colors relative z-40">
      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-slate-100 shrink-0">
        <svg className="w-4 h-4 text-[#5696C7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
          <circle cx={12} cy={9} r={2.5} />
        </svg>
      </div>
      <div className="min-w-0">
        <p className="text-[13px] font-black text-slate-800 leading-tight line-clamp-1 mb-0.5">
          {doctor.clinic}
        </p>
        <div className="flex items-center flex-wrap gap-1.5 text-[11.5px] text-slate-500 font-medium">
          <span className="line-clamp-1">{location}</span>
        </div>
      </div>
      {(doctor as any).latitude && (doctor as any).longitude && (
        <Link
          href={`https://maps.google.com/?q=${(doctor as any).latitude},${(doctor as any).longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto mt-0.5 flex items-center justify-center p-2 rounded-xl bg-slate-200/50 hover:bg-[#5696C7] text-slate-600 hover:text-white transition-colors pointer-events-auto shrink-0 shadow-sm"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 2-1 3-3 3s-3-1-3-3 1-3 3-3 3 1 3 3z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2a10 10 0 00-10 10c0 6 10 10 10 10s10-4 10-10A10 10 0 0012 2z" />
          </svg>
        </Link>
      )}
    </div>
  );
}

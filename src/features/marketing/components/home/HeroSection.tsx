"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
  ShieldCheck, HeartPulse, Stethoscope, Baby, Activity, Siren, 
  Calendar, ArrowRight, Star, Clock, GraduationCap, MapPin, ChevronRight, Shield
} from "lucide-react";
import { SmartSearchBar } from "@/components/shared/SmartSearchBar";
import { LocationSelector } from "./LocationSelector";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useLocationStore } from "@/features/location/store/useLocationStore";
import { cn } from "@/lib/utils/utils";
import { getCanonicalImageUrl } from "@/lib/imageHelper";

const SPECIALTIES_CARDS = [
  {
    label: "General Physician",
    icon: <Stethoscope className="w-6 h-6" />,
    iconBg: "bg-blue-50 text-[#5298D2] border border-blue-100",
    actionText: "Book Now",
    href: "/doctors?q=General%20Physician"
  },
  {
    label: "Cardiologist",
    icon: <HeartPulse className="w-6 h-6" />,
    iconBg: "bg-emerald-50 text-[#489C66] border border-emerald-100",
    actionText: "Book Now",
    href: "/doctors?q=Cardiologist"
  },
  {
    label: "Dermatologist",
    icon: <Activity className="w-6 h-6" />,
    iconBg: "bg-purple-50 text-purple-600 border border-purple-100",
    actionText: "Book Now",
    href: "/doctors?q=Dermatologist"
  },
  {
    label: "Pediatrician",
    icon: <Baby className="w-6 h-6" />,
    iconBg: "bg-amber-50 text-amber-600 border border-amber-100",
    actionText: "Book Now",
    href: "/doctors?q=Pediatrician"
  },
  {
    label: "Dentist",
    icon: <Stethoscope className="w-6 h-6" />,
    iconBg: "bg-sky-50 text-sky-600 border border-sky-100",
    actionText: "Book Now",
    href: "/doctors?q=Dentist"
  },
  {
    label: "Emergency Support",
    icon: <Siren className="w-6 h-6 text-rose-500 animate-pulse" />,
    iconBg: "bg-rose-50 text-rose-600 border border-rose-100",
    actionText: "Get Care Now",
    href: "/doctors?emergency=true"
  }
];

function displayName(name: string): string {
  if (!name) return "";
  const trimmed = name.trim();
  return /^Dr\.?\s/i.test(trimmed) ? trimmed : `Dr. ${trimmed}`;
}

function getDoctorUrl(doctor: any): string {
  const slug = doctor.publicSlug || doctor.slug;
  if (slug && !/^[0-9a-f-]{36}$/i.test(slug)) return `/doctors/${slug}`;
  return `/doctors/${doctor.id}`;
}

export function HeroSection({ featuredDoctor }: { featuredDoctor?: any }) {
  const { isAuthenticated, user } = useAuthStore();
  const { district } = useLocationStore();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => setMounted(true), []);
  const isLoggedIn = mounted ? isAuthenticated : false;

  if (isLoggedIn && (user?.role === "DOCTOR" || user?.role === "ADMIN")) return null;

  // Render a clean featured doctor profile summary card on the right
  const doc = featuredDoctor || {
    id: "default-featured",
    name: "Alok Kumar Sharma",
    specialty: "General Physician",
    clinic: "Sharma Clinic & Diagnostic",
    location: "Jamui",
    experience: "15",
    image: "",
    availabilityStatus: "OPD Open",
    isQueueActive: true,
    fee: "₹200",
  };

  const docUrl = getDoctorUrl(doc);

  return (
    <section className="relative w-full max-w-full pt-8 md:pt-16 pb-12 overflow-hidden bg-white box-border" aria-label="Find Doctors">
      {/* Calm Medical Accents */}
      <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-primary/5 via-primary/2 to-transparent -z-10" />
      <div className="absolute top-[10%] right-[-5%] w-64 h-64 bg-secondary/5 rounded-full blur-3xl -z-10" />
      
      <div className="container mx-auto px-4 w-full max-w-6xl relative z-10 box-border">
        {/* Split grid for layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center text-left w-full max-w-full">
          
          {/* Left Column: Hero Content & Search Bar */}
          <div className="lg:col-span-7 space-y-6 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-secondary text-[11px] font-black uppercase tracking-widest shadow-sm w-fit"
            >
              <ShieldCheck className="w-4 h-4" />
              Bihar&apos;s Trusted Healthcare Network
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 break-words leading-[1.05]"
            >
              Book Doctor <br className="hidden sm:block" /> 
              <span className="text-primary">Appointments.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-base md:text-lg text-slate-500 font-medium max-w-xl leading-relaxed"
            >
              Book your appointment from your phone and skip the long hospital lines. Easy, safe, and 100% verified.
            </motion.p>

            {/* ── DISCOVERY SEARCH CONTAINER ───────────────────────── */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="w-full max-w-2xl bg-white p-2 rounded-[2rem] shadow-[0_15px_45px_-12px_rgba(0,0,0,0.08)] border border-slate-200 flex flex-col md:flex-row items-center gap-0 relative z-20"
            >
              <LocationSelector 
                className="w-full md:w-auto md:min-w-[180px] shrink-0" 
                buttonClassName="border-transparent shadow-none hover:shadow-none hover:border-transparent bg-transparent hover:bg-slate-50/50"
              />
              
              <div className="hidden md:block w-px h-10 bg-slate-200 mx-1 shrink-0" />
              <div className="md:hidden w-full h-px bg-slate-100 my-1" />

              <div className="flex-1 w-full min-w-0 relative">
                <SmartSearchBar
                  district={district || ""}
                  placeholder="Search doctors, symptoms..."
                  className="w-full"
                  innerClassName="border-transparent shadow-none hover:shadow-none hover:border-transparent bg-transparent md:h-[50px]"
                  disableFocusStyles={true}
                />
              </div>
            </motion.div>

            {/* CTAs Below Search Bar */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="flex flex-wrap gap-4 pt-2"
            >
              <Link href="/doctors">
                <button className="bg-primary hover:bg-primary/95 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all duration-200 active:scale-95 shadow-md shadow-primary/20 animate-none">
                  Book Appointment
                </button>
              </Link>
              <Link href="/doctors?emergency=true">
                <button className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold text-sm px-6 py-3 rounded-xl transition-all duration-200 active:scale-95 shadow-md flex items-center gap-1.5">
                  <Siren className="w-4 h-4 text-red-600 animate-pulse" />
                  SOS Emergency
                </button>
              </Link>
            </motion.div>
          </div>

          {/* Right Column: Floating Featured Doctor Card */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="w-full max-w-sm bg-white border border-slate-100 rounded-3xl shadow-xl p-5 relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-primary/10"
            >
              {/* Card Accent */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -z-10" />

              {/* Tag / Header */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black text-[#5298D2] uppercase tracking-wider bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">
                  Featured Partner
                </span>
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100 uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified
                </span>
              </div>

              {/* Doctor Details */}
              <div className="flex gap-4 items-start">
                <div className="relative shrink-0">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden shadow-sm">
                    {doc.image ? (
                      <Image
                        src={getCanonicalImageUrl(doc.image, doc.updatedAt) || ""}
                        alt={doc.name}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-50 text-primary font-bold text-xl">
                        {doc.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-4.5 h-4.5 bg-emerald-500 border-4 border-white rounded-full" />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-black text-[18px] text-slate-900 leading-tight truncate">
                    {displayName(doc.name)}
                  </h3>
                  <p className="text-[13px] font-bold text-primary mt-1">
                    {doc.specialty}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    {doc.experience ? `${doc.experience}+ Years Experience` : "Highly Experienced"}
                  </p>
                </div>
              </div>

              {/* Clinic Info */}
              <div className="mt-5 pt-4 border-t border-slate-100 space-y-2.5 text-[13px] text-slate-600 font-medium">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-1">{doc.clinic || "Clinic Location"} ({doc.location})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-slate-500">
                    <Clock className="w-4 h-4 text-slate-400" /> Availability
                  </span>
                  <span className="text-emerald-600 font-bold uppercase text-[11px] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    {doc.availabilityStatus || "OPD Open"}
                  </span>
                </div>
              </div>

              {/* Action */}
              <div className="mt-5">
                <Link href={docUrl}>
                  <button className="w-full h-11 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl text-sm transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-1.5 shadow-sm">
                    Book Instant Appointment
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>

        </div>

        {/* Specialties grid below */}
        <div className="w-full max-w-6xl mt-12 md:mt-16 mb-4 md:mb-12">
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 text-center"
          >
            Common Specialties
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex overflow-x-auto pb-3 gap-4 px-4 snap-x snap-mandatory md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {SPECIALTIES_CARDS.map((card) => (
              <Link
                key={card.label}
                href={card.href}
                className="w-[260px] sm:w-[280px] shrink-0 snap-start bg-white border border-slate-100 hover:border-slate-200/80 rounded-full p-3.5 md:p-4 flex items-center gap-4.5 shadow-soft hover:shadow-premium hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-300 group cursor-pointer md:w-auto md:shrink"
              >
                <div className={cn("w-14 h-14 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 shadow-sm", card.iconBg)}>
                  {card.icon}
                </div>
                <div className="flex flex-col text-left min-w-0">
                  <span className="text-base md:text-[17px] font-bold text-slate-800 tracking-tight leading-snug truncate">
                    {card.label}
                  </span>
                  <span className="text-[13px] font-bold text-[#5298D2] flex items-center gap-1 mt-0.5 group-hover:text-[#4383be] transition-colors">
                    {card.actionText} <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform duration-200" />
                  </span>
                </div>
              </Link>
            ))}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center mt-6 md:mt-8"
          >
            <Link href="/doctors">
              <button className="bg-[#5298D2]/10 hover:bg-[#5298D2]/15 text-[#5298D2] font-black text-sm md:text-base px-8 py-3.5 rounded-full flex items-center gap-2 transition-all duration-200 active:scale-[0.97] shadow-sm select-none shrink-0 outline-none">
                View All Departments <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </motion.div>
        </div>

        {/* ── TRUST SIGNALS ── */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-6 md:gap-10 pt-6 md:pt-10 border-t border-slate-100 w-full"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-primary">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-xs font-black text-slate-900 uppercase">100% Verified</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Medical Degrees Checked</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-secondary">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-xs font-black text-slate-900 uppercase">Easy Booking</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Confirm in 2 Minutes</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
              <Siren className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-xs font-black text-slate-900 uppercase">No Waiting</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Live Queue Tracking</p>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}

"use client";

import { useState, useEffect } from "react";
import { User, Mail, Phone, ShieldCheck, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useBookingStore } from "@/features/booking/store/useBookingStore";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

const FIELD_CLASS = "pl-12 h-14 rounded-2xl bg-slate-50 border-slate-200 focus-visible:ring-primary focus-visible:bg-white text-base shadow-sm";

export function PatientDetailsForm({ disabled }: { disabled?: boolean }) {
  const [focused, setFocused] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const patientDetails = useBookingStore(state => state.patientDetails);
  const setPatientDetails = useBookingStore(state => state.setPatientDetails);
  const authUser = useAuthStore(state => state.user);

  // Pre-fill from auth store on mount
  useEffect(() => {
    if (authUser) {
      const prefill: Partial<{ name: string; phone: string; email: string; location: string }> = {};
      if (!patientDetails.phone && authUser.phone) {
        prefill.phone = authUser.phone;
      }
      if (!patientDetails.name && authUser.name && authUser.name !== "Patient User") {
        prefill.name = authUser.name;
      }
      if (!patientDetails.location && (authUser as any).location) {
        prefill.location = (authUser as any).location;
      }
      if (Object.keys(prefill).length > 0) {
        setPatientDetails(prefill);
      }
    }
  }, [authUser]);  

  const focusProps = (name: string) => ({
    onFocus: () => setFocused(name),
    onBlur: () => {
      setFocused(null);
      validateField(name);
    },
  });

  const validateField = (field: string) => {
    const newErrors = { ...errors };
    switch (field) {
      case "name":
        if (!patientDetails.name.trim()) {
          newErrors.name = "Patient name is required";
        } else if (patientDetails.name.trim().length < 2) {
          newErrors.name = "Name must be at least 2 characters";
        } else {
          delete newErrors.name;
        }
        break;
      case "phone":
        const phone = patientDetails.phone.replace(/\D/g, "");
        if (!phone) {
          newErrors.phone = "Phone number is required";
        } else if (phone.length < 10) {
          newErrors.phone = "Enter a valid 10-digit phone number";
        } else {
          delete newErrors.phone;
        }
        break;
      case "email":
        // Email is optional
        if (patientDetails.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patientDetails.email)) {
          newErrors.email = "Enter a valid email address";
        } else {
          delete newErrors.email;
        }
        break;
      case "location":
        if (!patientDetails.location.trim()) {
          newErrors.location = "City/Village name is required";
        } else {
          delete newErrors.location;
        }
        break;
    }
    setErrors(newErrors);
  };

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Patient Details</h2>
      </div>

      {/* Pre-filled indicator */}
      {authUser?.phone && (
        <div className="mb-4 flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-xl">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="font-medium">Auto-filled from your verified account</span>
        </div>
      )}

      <Card className="border-slate-200/60 shadow-sm rounded-3xl overflow-hidden bg-white/60 backdrop-blur-xl">
        <CardContent className="p-6 md:p-8 space-y-5">
          <div className={`transition-all duration-300 ${focused === "name" ? "ring-2 ring-primary/10 rounded-2xl" : ""}`}>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">
              Full Name <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input 
                disabled={disabled}
                placeholder="Patient's full name" 
                className={`${FIELD_CLASS} ${errors.name ? "border-red-300 bg-red-50/30" : ""}`}
                value={patientDetails.name}
                onChange={(e) => setPatientDetails({ name: e.target.value })}
                onFocus={(e) => {
                  setFocused("name");
                  setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
                }}
                onBlur={() => {
                  setFocused(null);
                  validateField("name");
                }}
              />
            </div>
            {errors.name && <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className={`transition-all duration-300 ${focused === "phone" ? "ring-2 ring-primary/10 rounded-2xl" : ""}`}>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">
                Phone Number <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input 
                  disabled={disabled}
                  type="tel" 
                  placeholder="+91 98765 43210" 
                  className={`${FIELD_CLASS} ${errors.phone ? "border-red-300 bg-red-50/30" : ""}`}
                  value={patientDetails.phone}
                  onChange={(e) => setPatientDetails({ phone: e.target.value })}
                  onFocus={(e) => {
                  setFocused("phone");
                  setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
                }}
                onBlur={() => {
                  setFocused(null);
                  validateField("phone");
                }}
                />
              </div>
              {errors.phone && <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.phone}</p>}
            </div>
            <div className={`transition-all duration-300 ${focused === "email" ? "ring-2 ring-primary/10 rounded-2xl" : ""}`}>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">
                Email <span className="text-slate-400 text-xs font-normal">(optional)</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input 
                  disabled={disabled}
                  type="email" 
                  placeholder="for booking receipt" 
                  className={`${FIELD_CLASS} ${errors.email ? "border-red-300 bg-red-50/30" : ""}`}
                  value={patientDetails.email}
                  onChange={(e) => setPatientDetails({ email: e.target.value })}
                  onFocus={(e) => {
                    setFocused("email");
                    // Mobile keyboard adjustment
                    setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
                  }}
                  onBlur={() => {
                    setFocused(null);
                    validateField("email");
                  }}
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.email}</p>}
            </div>
          </div>

          <div className={`transition-all duration-300 ${focused === "location" ? "ring-2 ring-primary/10 rounded-2xl" : ""}`}>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">
              City / Village / Location <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input 
                disabled={disabled}
                placeholder="e.g. Patna, Kankarbagh, or your Village name" 
                className={`${FIELD_CLASS} ${errors.location ? "border-red-300 bg-red-50/30" : ""}`}
                value={patientDetails.location}
                onChange={(e) => setPatientDetails({ location: e.target.value })}
                onFocus={(e) => {
                  setFocused("location");
                  setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
                }}
                onBlur={() => {
                  setFocused(null);
                  validateField("location");
                }}
              />
            </div>
            {errors.location && <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.location}</p>}
            <p className="text-[10px] text-slate-400 mt-2 ml-1 italic font-medium">This helps the doctor identify your area.</p>
          </div>
        </CardContent>
      </Card>
      
      {/* Trust Guarantee */}
      <div className="mt-8 p-6 rounded-[2rem] bg-gradient-to-br from-[#205E98]/5 to-transparent border border-primary/10 flex items-start gap-4">
        <ShieldCheck className="w-6 h-6 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-slate-900">Verified Booking Guarantee</p>
          <p className="text-sm text-slate-600 mt-1 leading-relaxed">JivniCare connects directly with the clinic's live management system. Your place in the queue is instantly reserved upon confirmation.</p>
        </div>
      </div>
    </section>
  );
}

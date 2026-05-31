"use client";

import { useState, useEffect } from "react";
import { User, Mail, Phone, ShieldCheck, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useBookingStore } from "@/features/booking/store/useBookingStore";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

const FLOATING_INPUT_CLASS = "peer w-full h-16 pt-5 pb-1 pl-12 pr-4 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#205E98] focus:ring-1 focus:ring-[#205E98] outline-none transition-all text-slate-900 font-medium placeholder-transparent shadow-sm";
const FLOATING_LABEL_CLASS = "absolute left-12 top-5 text-slate-400 text-base transition-all pointer-events-none peer-focus:top-2 peer-focus:text-[11px] peer-focus:font-bold peer-focus:text-[#205E98] peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:font-bold peer-[:not(:placeholder-shown)]:text-slate-500";

export function PatientDetailsForm({ disabled }: { disabled?: boolean }) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const patientDetails = useBookingStore(state => state.patientDetails);
  const setPatientDetails = useBookingStore(state => state.setPatientDetails);
  const authUser = useAuthStore(state => state.user);

  useEffect(() => {
    if (authUser) {
      const prefill: Partial<{ name: string; phone: string; email: string; location: string }> = {};
      if (!patientDetails.phone && authUser.phone) prefill.phone = authUser.phone;
      if (!patientDetails.name && authUser.name && authUser.name !== "Patient User") prefill.name = authUser.name;
      if (!patientDetails.location && (authUser as any).location) prefill.location = (authUser as any).location;
      if (Object.keys(prefill).length > 0) setPatientDetails(prefill);
    }
  }, [authUser]);  

  const validateField = (field: string) => {
    const newErrors = { ...errors };
    switch (field) {
      case "name":
        if (!patientDetails.name.trim()) newErrors.name = "Patient name is required";
        else if (patientDetails.name.trim().length < 2) newErrors.name = "Name must be at least 2 characters";
        else delete newErrors.name;
        break;
      case "phone":
        const phone = patientDetails.phone.replace(/\\D/g, "");
        if (!phone) newErrors.phone = "Phone number is required";
        else if (phone.length < 10) newErrors.phone = "Enter a valid 10-digit phone number";
        else delete newErrors.phone;
        break;
      case "email":
        if (patientDetails.email && !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(patientDetails.email)) newErrors.email = "Enter a valid email address";
        else delete newErrors.email;
        break;
      case "location":
        if (!patientDetails.location.trim()) newErrors.location = "City/Village name is required";
        else delete newErrors.location;
        break;
    }
    setErrors(newErrors);
  };

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-black tracking-tight text-slate-900">Patient Details</h2>
      </div>

      {authUser?.phone && (
        <div className="mb-4 flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 px-4 py-2.5 rounded-xl shadow-sm">
          <ShieldCheck className="w-4 h-4" />
          <span className="font-bold">Auto-filled from your verified account</span>
        </div>
      )}

      <Card className="border-slate-100 shadow-premium rounded-3xl overflow-hidden bg-white">
        <CardContent className="p-5 md:p-8 space-y-5">
          
          <div>
            <div className="relative group">
              <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${errors.name ? 'text-red-400' : 'text-slate-400 group-focus-within:text-[#205E98]'}`} />
              <input 
                id="name"
                disabled={disabled}
                placeholder="Full Name" 
                className={`${FLOATING_INPUT_CLASS} ${errors.name ? "border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-red-500" : ""}`}
                value={patientDetails.name}
                onChange={(e) => setPatientDetails({ name: e.target.value })}
                onBlur={() => validateField("name")}
              />
              <label htmlFor="name" className={FLOATING_LABEL_CLASS}>Full Name <span className="text-red-400">*</span></label>
            </div>
            {errors.name && <p className="text-xs text-red-500 mt-1.5 font-bold pl-2">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <div className="relative group">
                <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${errors.phone ? 'text-red-400' : 'text-slate-400 group-focus-within:text-[#205E98]'}`} />
                <input 
                  id="phone"
                  disabled={disabled}
                  type="tel" 
                  placeholder="Phone Number" 
                  className={`${FLOATING_INPUT_CLASS} ${errors.phone ? "border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-red-500" : ""}`}
                  value={patientDetails.phone}
                  onChange={(e) => setPatientDetails({ phone: e.target.value })}
                  onBlur={() => validateField("phone")}
                />
                <label htmlFor="phone" className={FLOATING_LABEL_CLASS}>Phone Number <span className="text-red-400">*</span></label>
              </div>
              {errors.phone && <p className="text-xs text-red-500 mt-1.5 font-bold pl-2">{errors.phone}</p>}
            </div>

            <div>
              <div className="relative group">
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${errors.email ? 'text-red-400' : 'text-slate-400 group-focus-within:text-[#205E98]'}`} />
                <input 
                  id="email"
                  disabled={disabled}
                  type="email" 
                  placeholder="Email" 
                  className={`${FLOATING_INPUT_CLASS} ${errors.email ? "border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-red-500" : ""}`}
                  value={patientDetails.email}
                  onChange={(e) => setPatientDetails({ email: e.target.value })}
                  onBlur={() => validateField("email")}
                />
                <label htmlFor="email" className={FLOATING_LABEL_CLASS}>Email <span className="font-normal opacity-70">(optional)</span></label>
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1.5 font-bold pl-2">{errors.email}</p>}
            </div>
          </div>

          <div>
            <div className="relative group">
              <MapPin className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${errors.location ? 'text-red-400' : 'text-slate-400 group-focus-within:text-[#205E98]'}`} />
              <input 
                id="location"
                disabled={disabled}
                placeholder="City / Village / Location" 
                className={`${FLOATING_INPUT_CLASS} ${errors.location ? "border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-red-500" : ""}`}
                value={patientDetails.location}
                onChange={(e) => setPatientDetails({ location: e.target.value })}
                onBlur={() => validateField("location")}
              />
              <label htmlFor="location" className={FLOATING_LABEL_CLASS}>City / Village / Location <span className="text-red-400">*</span></label>
            </div>
            {errors.location && <p className="text-xs text-red-500 mt-1.5 font-bold pl-2">{errors.location}</p>}
            <p className="text-[11px] text-slate-400 mt-2 ml-2 font-medium">Helps the clinic prepare for your arrival.</p>
          </div>
        </CardContent>
      </Card>
      
      {/* Trust Guarantee */}
      <div className="mt-8 p-5 rounded-3xl bg-blue-50/50 border border-blue-100 flex items-start gap-4">
        <ShieldCheck className="w-6 h-6 text-[#205E98] shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-slate-900">Verified Booking Guarantee</p>
          <p className="text-sm text-slate-600 mt-1 leading-relaxed">JivniCare connects directly with the clinic's live management system. Your place in the queue is instantly reserved.</p>
        </div>
      </div>
    </section>
  );
}

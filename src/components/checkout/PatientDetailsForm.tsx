"use client";

import { useState } from "react";
import { User, Mail, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useBookingStore } from "@/store/useBookingStore";

const FIELD_CLASS = "pl-12 h-14 rounded-2xl bg-slate-50 border-slate-200 focus-visible:ring-[#205E98] focus-visible:bg-white text-base shadow-sm";

export function PatientDetailsForm() {
  const [focused, setFocused] = useState<string | null>(null);
  
  const patientDetails = useBookingStore(state => state.patientDetails);
  const setPatientDetails = useBookingStore(state => state.setPatientDetails);

  const focusProps = (name: string) => ({
    onFocus: () => setFocused(name),
    onBlur: () => setFocused(null),
  });

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Patient Details</h2>
        <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">Step 1 of 2</span>
      </div>

      <Card className="border-slate-200/60 shadow-sm rounded-3xl overflow-hidden bg-white/60 backdrop-blur-xl">
        <CardContent className="p-6 md:p-8 space-y-5">
          <div className={`transition-transform duration-300 ${focused === "name" ? "scale-[1.01]" : ""}`}>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input 
                placeholder="Rahul Sharma" 
                className={FIELD_CLASS} 
                value={patientDetails.name}
                onChange={(e) => setPatientDetails({ name: e.target.value })}
                {...focusProps("name")} 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className={`transition-transform duration-300 ${focused === "email" ? "scale-[1.01]" : ""}`}>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input 
                  type="email" 
                  placeholder="rahul@example.com" 
                  className={FIELD_CLASS} 
                  value={patientDetails.email}
                  onChange={(e) => setPatientDetails({ email: e.target.value })}
                  {...focusProps("email")} 
                />
              </div>
            </div>
            <div className={`transition-transform duration-300 ${focused === "phone" ? "scale-[1.01]" : ""}`}>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input 
                  type="tel" 
                  placeholder="+91 98765 43210" 
                  className={FIELD_CLASS} 
                  value={patientDetails.phone}
                  onChange={(e) => setPatientDetails({ phone: e.target.value })}
                  {...focusProps("phone")} 
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

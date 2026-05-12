"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import {
  User, ShieldCheck, Clock, CheckCircle,
  Loader2, Building2, Calendar, MapPin, Phone,
  Stethoscope, Info, Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ── Types ────────────────────────────────────────────────────────
interface DoctorProfile {
  // Identity Zone
  name: string;
  registrationNumber: string;
  education: string;
  hasPhoto: boolean;

  // Expertise Zone
  experience: string;
  certifications: string;
  specialties: string;
  treatmentFocus: string;

  // Logistics Zone
  fee: string;
  followUpFee: string;
  onlineConsultation: boolean;
  emergencyConsultation: boolean;
  bio: string;
}

interface ClinicOperations {
  // Location Zone
  hospitalName: string;
  address: string;
  city: string;
  mapsLink: string;
  receptionPhone: string;

  // Live Status
  isClosedToday: boolean;
  pauseOnlineBooking: boolean;

  // Queue Engine
  walkInLimit: string;
  onlineLimit: string;
  avgConsultationTime: string; // mins
}

const INIT_PROFILE: DoctorProfile = {
  name: "",
  registrationNumber: "",
  education: "",
  hasPhoto: false,
  experience: "",
  certifications: "",
  specialties: "",
  treatmentFocus: "",
  fee: "",
  followUpFee: "",
  onlineConsultation: false,
  emergencyConsultation: false,
  bio: "",
};

const INIT_CLINIC: ClinicOperations = {
  hospitalName: "",
  address: "",
  city: "",
  mapsLink: "",
  receptionPhone: "",
  isClosedToday: false,
  pauseOnlineBooking: false,
  walkInLimit: "10",
  onlineLimit: "20",
  avgConsultationTime: "15",
};

// ── Components ───────────────────────────────────────────────────

export default function DoctorDashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // State
  const [activeTab, setActiveTab] = useState<"profile" | "clinic">("profile");
  const [profile, setProfile] = useState<DoctorProfile>(INIT_PROFILE);
  const [clinic, setClinic] = useState<ClinicOperations>(INIT_CLINIC);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated) { router.replace("/login"); return; }
    if (user?.role !== "doctor") { router.replace("/"); }
  }, [isAuthenticated, user, router, mounted]);

  const updateProfile = (field: keyof DoctorProfile, value: string | boolean) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    setSavedSuccess(false);
  };

  const updateClinic = (field: keyof ClinicOperations, value: string | boolean) => {
    setClinic(prev => ({ ...prev, [field]: value }));
    setSavedSuccess(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulating API call
    await new Promise<void>(r => setTimeout(r, 800));
    setIsSaving(false);
    setSavedSuccess(true);
  };

  if (!mounted) return <div className="min-h-screen bg-[#f7f9fc]" />;

  return (
    <main className="min-h-screen bg-[#f7f9fc] pb-24 md:pb-12">
      {/* ── Header ── */}
      <div className="bg-white border-b border-slate-200 px-4 py-5 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#205E98]/10 flex items-center justify-center border border-[#205E98]/20">
              <User className="w-6 h-6 text-[#205E98]" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">PMS Dashboard</p>
              <h1 className="text-lg font-black text-slate-900 leading-tight">{user?.name || "Dr. Dashboard"}</h1>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full shadow-sm">
            <ShieldCheck className="w-4 h-4" /> Live & Verified
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        {/* ── 2-Tab Navigation ── */}
        <div className="flex bg-slate-200/50 p-1 rounded-2xl w-full">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === "profile"
                ? "bg-white text-[#205E98] shadow-sm ring-1 ring-slate-200/50"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <User className="w-4 h-4" /> Doctor Profile
          </button>
          <button
            onClick={() => setActiveTab("clinic")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === "clinic"
                ? "bg-white text-[#205E98] shadow-sm ring-1 ring-slate-200/50"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Building2 className="w-4 h-4" /> Clinic Operations
          </button>
        </div>

        {/* ── Content Area ── */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          
          {/* TAB 1: DOCTOR PROFILE */}
          {activeTab === "profile" && (
            <div className="divide-y divide-slate-100">
              
              {/* Identity Zone */}
              <div className="p-5 sm:p-6 space-y-4">
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" /> Identity & Verification
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Full Name</label>
                    <Input value={profile.name} onChange={e => updateProfile("name", e.target.value)} placeholder="Dr. Full Name" className="h-12 bg-slate-50 border-slate-200 rounded-xl" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Registration Number</label>
                    <Input value={profile.registrationNumber} onChange={e => updateProfile("registrationNumber", e.target.value)} placeholder="Medical Council Reg No." className="h-12 bg-slate-50 border-slate-200 rounded-xl" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Education</label>
                    <Input value={profile.education} onChange={e => updateProfile("education", e.target.value)} placeholder="MBBS, MD - Cardiology, etc." className="h-12 bg-slate-50 border-slate-200 rounded-xl" />
                  </div>
                </div>
              </div>

              {/* Expertise Zone */}
              <div className="p-5 sm:p-6 space-y-4">
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-[#205E98]" /> Expertise & Focus
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Specialties (Comma separated)</label>
                    <Input value={profile.specialties} onChange={e => updateProfile("specialties", e.target.value)} placeholder="Cardiology, General Physician" className="h-12 bg-slate-50 border-slate-200 rounded-xl" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Years of Experience</label>
                    <Input value={profile.experience} onChange={e => updateProfile("experience", e.target.value)} placeholder="e.g. 15" type="number" className="h-12 bg-slate-50 border-slate-200 rounded-xl" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Treatment Focus / Symptoms</label>
                    <Input value={profile.treatmentFocus} onChange={e => updateProfile("treatmentFocus", e.target.value)} placeholder="Chest pain, High BP, ECG, Angiography" className="h-12 bg-slate-50 border-slate-200 rounded-xl" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Doctor Bio / About</label>
                    <textarea value={profile.bio} onChange={e => updateProfile("bio", e.target.value)} rows={4} placeholder="Describe your approach to patient care..." className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#205E98]/20 focus:border-[#205E98] resize-none" />
                  </div>
                </div>
              </div>

              {/* Logistics Zone */}
              <div className="p-5 sm:p-6 bg-[#205E98]/5">
                <h2 className="text-base font-black text-[#205E98] mb-4">Pricing & Logistics</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Consultation Fee (₹)</label>
                    <Input value={profile.fee} onChange={e => updateProfile("fee", e.target.value)} placeholder="500" type="number" className="h-12 bg-white border-slate-200 rounded-xl" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Follow-up Fee (₹)</label>
                    <Input value={profile.followUpFee} onChange={e => updateProfile("followUpFee", e.target.value)} placeholder="300" type="number" className="h-12 bg-white border-slate-200 rounded-xl" />
                  </div>
                  
                  {/* Toggles */}
                  <div className="sm:col-span-2 flex flex-col sm:flex-row gap-4 mt-2">
                    <label className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 cursor-pointer flex-1">
                      <input type="checkbox" checked={profile.onlineConsultation} onChange={e => updateProfile("onlineConsultation", e.target.checked)} className="w-5 h-5 text-[#205E98] rounded focus:ring-[#205E98]" />
                      <span className="text-sm font-bold text-slate-700">Accept Online Consultations</span>
                    </label>
                    <label className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-100 cursor-pointer flex-1">
                      <input type="checkbox" checked={profile.emergencyConsultation} onChange={e => updateProfile("emergencyConsultation", e.target.checked)} className="w-5 h-5 text-red-600 rounded focus:ring-red-600" />
                      <span className="text-sm font-bold text-red-800">Available for Emergency</span>
                    </label>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: CLINIC OPERATIONS */}
          {activeTab === "clinic" && (
            <div className="divide-y divide-slate-100">

              {/* Live OPD Queue Monitor */}
              <div className="p-5 sm:p-6 bg-blue-50/50">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-black text-[#205E98] flex items-center gap-2">
                    <Activity className="w-5 h-5" /> Live OPD Queue
                  </h2>
                  <div className="px-3 py-1 bg-white rounded-full border border-blue-200 text-xs font-bold text-blue-800 shadow-sm">
                    Active: Token #12
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                  <div className="bg-white p-3 rounded-xl border border-blue-100 text-center shadow-sm">
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Total Tokens</p>
                    <p className="text-xl font-black text-slate-800">45</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-blue-100 text-center shadow-sm">
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Waiting</p>
                    <p className="text-xl font-black text-amber-500">12</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-blue-100 text-center shadow-sm">
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Completed</p>
                    <p className="text-xl font-black text-emerald-500">32</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-blue-100 text-center shadow-sm">
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Avg Time</p>
                    <p className="text-xl font-black text-slate-800">14m</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button className="flex-1 bg-[#205E98] hover:bg-[#184a7a] text-white shadow-md font-bold h-12 rounded-xl">Call Next Token</Button>
                  <Button variant="outline" className="flex-1 border-[#205E98] text-[#205E98] hover:bg-blue-50 font-bold h-12 rounded-xl bg-white">Add Walk-in Patient</Button>
                </div>
              </div>
              
              {/* Location Zone */}
              <div className="p-5 sm:p-6 space-y-4">
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-indigo-500" /> Clinic Location
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Hospital / Clinic Name</label>
                    <Input value={clinic.hospitalName} onChange={e => updateClinic("hospitalName", e.target.value)} placeholder="City Health Hospital" className="h-12 bg-slate-50 border-slate-200 rounded-xl" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">City / District</label>
                    <Input value={clinic.city} onChange={e => updateClinic("city", e.target.value)} placeholder="Patna" className="h-12 bg-slate-50 border-slate-200 rounded-xl" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Reception Phone</label>
                    <Input value={clinic.receptionPhone} onChange={e => updateClinic("receptionPhone", e.target.value)} placeholder="+91" className="h-12 bg-slate-50 border-slate-200 rounded-xl" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Full Address</label>
                    <textarea value={clinic.address} onChange={e => updateClinic("address", e.target.value)} rows={2} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#205E98]/20 focus:border-[#205E98] resize-none" />
                  </div>
                </div>
              </div>

              {/* Live Status Controls */}
              <div className="p-5 sm:p-6 bg-amber-50/50">
                <h2 className="text-base font-black text-amber-900 flex items-center gap-2 mb-4">
                  <Info className="w-5 h-5 text-amber-500" /> Live Status Overrides
                </h2>
                <div className="flex flex-col sm:flex-row gap-4">
                  <label className="flex items-center justify-between p-4 bg-white rounded-xl border border-red-200 shadow-sm cursor-pointer flex-1">
                    <div>
                      <p className="text-sm font-black text-red-700">Close Clinic Today</p>
                      <p className="text-xs text-red-500/80">Marks holiday instantly</p>
                    </div>
                    <input type="checkbox" checked={clinic.isClosedToday} onChange={e => updateClinic("isClosedToday", e.target.checked)} className="w-6 h-6 text-red-600 rounded-md focus:ring-red-600" />
                  </label>
                  <label className="flex items-center justify-between p-4 bg-white rounded-xl border border-amber-200 shadow-sm cursor-pointer flex-1">
                    <div>
                      <p className="text-sm font-black text-amber-700">Pause Online Booking</p>
                      <p className="text-xs text-amber-600/80">Stop new appointments</p>
                    </div>
                    <input type="checkbox" checked={clinic.pauseOnlineBooking} onChange={e => updateClinic("pauseOnlineBooking", e.target.checked)} className="w-6 h-6 text-amber-500 rounded-md focus:ring-amber-500" />
                  </label>
                </div>
              </div>

              {/* Weekly Schedule Engine */}
              <div className="p-5 sm:p-6 space-y-4">
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-500" /> Flexible Weekly Schedule
                </h2>
                <p className="text-xs text-slate-500 mb-4">Configure your operating hours for each day. Leave blank for closed days.</p>
                
                {/* Simplified Mock Schedule Builder for UI */}
                <div className="space-y-3">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                    <div key={day} className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="w-full sm:w-28 flex items-center gap-2">
                        <input type="checkbox" defaultChecked={day !== 'Sunday'} className="w-4 h-4 text-[#205E98] rounded focus:ring-[#205E98]" />
                        <span className="text-sm font-bold text-slate-700">{day}</span>
                      </div>
                      <div className="flex-1 flex w-full gap-2">
                        <Input type="time" defaultValue="09:00" className="h-10 bg-white" />
                        <span className="flex items-center text-slate-400">to</span>
                        <Input type="time" defaultValue="14:00" className="h-10 bg-white" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Queue Management System */}
              <div className="p-5 sm:p-6 bg-slate-50">
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-teal-500" /> Queue Management
                </h2>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Avg Time per Patient</label>
                    <div className="relative">
                      <Input value={clinic.avgConsultationTime} onChange={e => updateClinic("avgConsultationTime", e.target.value)} type="number" className="h-12 bg-white pr-12" />
                      <span className="absolute right-4 top-3.5 text-xs font-bold text-slate-400">mins</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Max Online Booking</label>
                    <Input value={clinic.onlineLimit} onChange={e => updateClinic("onlineLimit", e.target.value)} type="number" className="h-12 bg-white" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Max Walk-in Allowed</label>
                    <Input value={clinic.walkInLimit} onChange={e => updateClinic("walkInLimit", e.target.value)} type="number" className="h-12 bg-white" />
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* ── Global Save Button ── */}
        <div className="fixed bottom-0 left-0 w-full p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 sm:relative sm:bg-transparent sm:border-t-0 sm:p-0 z-20">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full h-14 rounded-2xl bg-[#205E98] hover:bg-[#184a7a] text-white font-black text-lg shadow-xl shadow-[#205E98]/20 flex items-center justify-center gap-2 transition-all"
          >
            {isSaving ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Updating System...</>
            ) : savedSuccess ? (
              <><CheckCircle className="w-5 h-5" /> All Operations Saved!</>
            ) : (
              "Save & Update Operations"
            )}
          </Button>
        </div>

      </div>
    </main>
  );
}

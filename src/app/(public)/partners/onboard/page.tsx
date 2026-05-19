"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, CheckCircle2, ShieldCheck, RefreshCw, AlertCircle, Sparkles, Lock, UserCircle, Briefcase, MapPin, Building, Star, Activity, ArrowLeft,
  Clock, ArrowUpRight, FileText, PhoneCall
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { PublicGuard } from "@/components/shared";

const STANDARD_SPECIALTIES = [
  "General Medicine", "Pediatrics", "Gynecology & Obstetrics", "Dermatology",
  "Cardiology", "Orthopedics", "Ophthalmology", "ENT (Otolaryngology)",
  "Dentistry", "Psychiatry", "Neurology", "Gastroenterology"
];

const MEDICAL_COUNCILS = [
  "Bihar Medical Council", "National Medical Commission (NMC)", "Medical Council of India (MCI)",
  "Delhi Medical Council", "Uttar Pradesh Medical Council", "West Bengal Medical Council", "Other State Medical Council"
];

export default function DoctorOnboardingFlow() {
  return (
    <PublicGuard>
      <OnboardingContent />
    </PublicGuard>
  );
}

function OnboardingContent() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const { login } = useAuthStore();
  
  const [formData, setFormData] = useState({
    fullName: "", gender: "", dateOfBirth: "", email: "", contactNumber: "", password: "",
    medicalRegistrationNumber: "", medicalCouncil: "Bihar Medical Council", registrationYear: "",
    specialization: "", experience: "", qualifications: "",
    practiceType: "clinic", practiceName: "", practiceAddress: "", city: "Patna", state: "Bihar", district: "Patna", pincode: "", locality: "",
    bio: "", languages: "Hindi, English", fee: "",
    profilePhotoUrl: "", clinicPhotoUrl: "", emergencyAvailable: false,
    latitude: null as number | null, longitude: null as number | null
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const fetchGPSLocation = () => {
    if (!navigator.geolocation) { setGpsStatus('error'); return; }
    setGpsLoading(true); setGpsStatus('idle');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const geo = await res.json();
          const addr = geo.address || {};
          setFormData(prev => ({
            ...prev, latitude, longitude,
            city: addr.city || addr.town || addr.village || addr.county || prev.city,
            state: addr.state || prev.state,
            district: addr.county || addr.state_district || addr.city || prev.district,
            locality: addr.suburb || addr.neighbourhood || addr.residential || addr.road || prev.locality,
            pincode: addr.postcode || prev.pincode,
          }));
        } catch {
          setFormData(prev => ({ ...prev, latitude, longitude }));
        }
        setGpsStatus('success'); setGpsLoading(false);
      },
      () => { setGpsStatus('error'); setGpsLoading(false); },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;
    
    // Auth & Identity
    if (!formData.fullName.trim() || formData.fullName.length < 3) { newErrors.fullName = "Name is required."; isValid = false; }
    if (!formData.gender) { newErrors.gender = "Gender is required."; isValid = false; }
    if (!formData.dateOfBirth) { newErrors.dateOfBirth = "DOB is required."; isValid = false; }
    if (!formData.contactNumber || formData.contactNumber.length < 10) { newErrors.contactNumber = "Valid mobile required."; isValid = false; }
    if (!formData.password || formData.password.length < 6) { newErrors.password = "Password must be at least 6 characters."; isValid = false; }
    
    // Medical
    if (!formData.medicalRegistrationNumber.trim() || formData.medicalRegistrationNumber.length < 5) { newErrors.medicalRegistrationNumber = "Valid Registration Number is required."; isValid = false; }
    if (!formData.registrationYear) { newErrors.registrationYear = "Year is required."; isValid = false; }
    if (!formData.specialization) { newErrors.specialization = "Specialty is required."; isValid = false; }
    if (!formData.experience) { newErrors.experience = "Experience is required."; isValid = false; }
    if (!formData.qualifications.trim()) { newErrors.qualifications = "Qualifications are required."; isValid = false; }
    
    // Clinic
    if (!formData.practiceName.trim()) { newErrors.practiceName = "Practice Name is required."; isValid = false; }
    if (!formData.practiceAddress.trim()) { newErrors.practiceAddress = "Address is required."; isValid = false; }
    if (!formData.locality.trim()) { newErrors.locality = "Locality is required."; isValid = false; }
    if (!formData.city.trim()) { newErrors.city = "City is required."; isValid = false; }
    if (!formData.pincode.trim() || !/^\d{6}$/.test(formData.pincode)) { newErrors.pincode = "Valid 6-digit Pincode is required."; isValid = false; }

    setErrors(newErrors);
    return isValid;
  };

  const submitStep1 = async () => {
    if (!validateStep1()) {
      // Scroll to top to see errors
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setIsSubmitting(true);
    setErrors({});
    try {
      const res = await fetch("/api/doctor/onboard/step1", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit.");
      login(data.user);
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setErrors({ submit: err.message || "Network error. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitStep2 = async () => {
    setIsSubmitting(true);
    setErrors({});
    try {
      const res = await fetch("/api/doctor/onboard/step2", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
          profilePhotoUrl: formData.profilePhotoUrl,
          clinicPhotoUrl: formData.clinicPhotoUrl,
          bio: formData.bio,
          languages: formData.languages,
          fee: parseInt(formData.fee || "0"),
          emergencyAvailable: formData.emergencyAvailable
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit.");
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setErrors({ submit: err.message || "Network error. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row font-sans overflow-x-hidden selection:bg-sky-500/20 selection:text-sky-900">
      
      {/* LEFT SIDEBAR - PREMIUM DARK CLINICAL BRAND */}
      <div className="md:w-[420px] lg:w-[460px] bg-[#0c111d] flex flex-col shrink-0 relative overflow-hidden md:sticky md:top-0 md:h-screen border-r border-white/5 z-20">
        
        {/* Subtle background glow mesh */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -left-[10%] w-[70%] h-[50%] rounded-full bg-sky-500/10 blur-[100px] animate-pulse duration-5000" />
          <div className="absolute bottom-[5%] -right-[10%] w-[60%] h-[40%] rounded-full bg-emerald-500/10 blur-[100px] animate-pulse duration-7000" />
        </div>

        {/* Technical architecture grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

        <div className="p-8 md:p-10 flex-1 flex flex-col relative z-10">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-3 mb-12 group">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg group-hover:scale-105 transition-all duration-300 bg-white/10 backdrop-blur-md border border-white/20 p-1 flex items-center justify-center">
              <img src="/logo.png" alt="JivniCare" className="w-7 h-7 object-contain brightness-0 invert" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white leading-none">
              <span className="text-[#5298D2]">Jivni</span><span className="text-[#489C66]">Care</span>
            </span>
          </Link>

          {/* Value Prop */}
          <div className="mb-12">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 text-sky-400 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
              <Sparkles className="w-3.5 h-3.5" /> B2B Partner Portal
            </span>
            <h1 className="text-3xl md:text-[34px] font-black text-white tracking-tight leading-[1.25] mb-4">
              Modernize your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400 font-extrabold">clinical practice.</span>
            </h1>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              Bihar's fastest-growing digital clinic network. Verify your identity, manage patients seamlessly, and maximize clinic revenue.
            </p>
          </div>

          {/* Vertical Stepper */}
          <div className="mt-auto hidden md:block">
            <div className="space-y-1">
              {[
                { num: 1, label: 'Identity & Clinic', desc: 'Basic details & medical registry', icon: UserCircle },
                { num: 2, label: 'Profile Polish', desc: 'Timing slots, consultation fees & bio', icon: Sparkles },
                { num: 3, label: 'Verification', desc: 'Registry audit & workspace live', icon: ShieldCheck }
              ].map((s) => {
                const Icon = s.icon;
                const isActive = step === s.num;
                const isCompleted = step > s.num;
                return (
                  <div key={s.num} className="relative flex gap-4 group">
                    {/* Connector Line between steps */}
                    {s.num < 3 && (
                      <div className={`absolute left-[18px] top-9 w-[2px] h-[calc(100%-8px)] transition-all duration-500 ${
                        isCompleted ? 'bg-gradient-to-b from-sky-500 to-emerald-500' : 'bg-white/15'
                      }`} />
                    )}
                    
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-300 shrink-0 relative z-10 ${
                      isCompleted ? 'bg-gradient-to-br from-sky-500 to-emerald-500 text-white shadow-lg shadow-sky-500/20' :
                      isActive ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/40 ring-4 ring-sky-500/10 scale-105' :
                      'bg-white/5 border border-white/10 text-slate-500'
                    }`}>
                      {isCompleted ? <CheckCircle2 className="w-5 h-5 text-white" /> : <Icon className="w-4 h-4" />}
                    </div>
                    
                    <div className="flex-1 pb-6">
                      <h5 className={`font-bold text-sm transition-all ${
                        isActive ? 'text-white text-[15px]' :
                        isCompleted ? 'text-slate-200' :
                        'text-slate-500'
                      }`}>{s.label}</h5>
                      <p className={`text-[11px] mt-1 transition-all leading-normal ${
                        isActive ? 'text-slate-350 font-medium' :
                        isCompleted ? 'text-slate-400' :
                        'text-slate-600'
                      }`}>{s.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Security Trust Shield Footer */}
          <div className="mt-auto pt-6 border-t border-white/5 flex items-center gap-3 bg-white/[0.01] -mx-8 -mb-8 p-6 md:-mx-10 md:-mb-10 md:p-6 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="space-y-0.5">
              <p className="text-[9px] font-black text-white uppercase tracking-widest leading-none">Registry Compliant</p>
              <p className="text-[8px] text-slate-500 font-semibold leading-normal">Verified by NMC & Bihar Medical Council. 256-bit SSL secured.</p>
            </div>
          </div>

        </div>
      </div>

      {/* RIGHT CONTENT AREA */}
      <div className="flex-1 relative flex flex-col bg-slate-50/40 min-h-screen overflow-y-auto overflow-x-hidden">
        
        {/* Soft background light blooms */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-[10%] right-[10%] w-[450px] h-[450px] rounded-full bg-sky-400/5 blur-[120px]" />
          <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full bg-emerald-400/5 blur-[120px]" />
        </div>

        {/* Top bar for Login */}
        <div className="w-full p-6 flex justify-end absolute top-0 right-0 z-20">
          <Link href="/partners/login" className="px-5 py-2.5 bg-white/80 backdrop-blur border border-slate-200 rounded-full text-xs font-bold text-slate-600 hover:text-slate-900 hover:border-slate-300 shadow-sm transition-all flex items-center gap-2">
            Already a partner? <span className="text-sky-600">Sign In</span>
          </Link>
        </div>

        {/* Scrollable Form Container */}
        <div className={`flex-1 w-full max-w-3xl mx-auto px-6 pt-24 ${step < 3 ? 'pb-40' : 'pb-24'} relative z-10`}>
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3, ease: "easeOut" }}>
              
              {/* === STEP 1: IDENTITY & CLINIC === */}
              {step === 1 && (
                <div className="space-y-8">
                  <div className="mb-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-100 text-sky-800 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                      <ShieldCheck className="w-3.5 h-3.5" /> Identity & Security
                    </span>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Create your account</h2>
                    <p className="text-slate-500 font-medium mt-2 text-lg">We need some basic details to verify your medical identity.</p>
                  </div>

                  {errors.submit && (
                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      <p className="text-sm font-bold text-rose-800">{errors.submit}</p>
                    </div>
                  )}

                  {/* Section: Personal Info */}
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                        <UserCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">Personal Information</h3>
                        <p className="text-xs text-slate-500 font-medium">As per your medical registration.</p>
                      </div>
                    </div>
                    <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-bold text-slate-700">Full Legal Name</label>
                        <Input placeholder="Dr. Rajesh Kumar" value={formData.fullName} onChange={(e) => { const v = e.target.value; if (/^[a-zA-Z. ]*$/.test(v)) setFormData({...formData, fullName: v}); }} className={`h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all ${errors.fullName ? 'border-rose-500 focus:ring-rose-500/20' : ''}`} />
                        {errors.fullName && <p className="text-[10px] font-bold text-rose-500">{errors.fullName}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">Gender</label>
                        <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} className={`h-12 w-full rounded-xl bg-slate-50 border border-slate-200 px-4 text-sm focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all ${errors.gender ? 'border-rose-500' : ''}`}>
                          <option value="">Select Gender</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                        </select>
                        {errors.gender && <p className="text-[10px] font-bold text-rose-500">{errors.gender}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">Date of Birth</label>
                        <Input type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})} className={`h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all ${errors.dateOfBirth ? 'border-rose-500' : ''}`} />
                        {errors.dateOfBirth && <p className="text-[10px] font-bold text-rose-500">{errors.dateOfBirth}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Section: Account Security */}
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                        <Lock className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">Account Credentials</h3>
                        <p className="text-xs text-slate-500 font-medium">Your login details for the JivniCare platform.</p>
                      </div>
                    </div>
                    <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">Mobile Number (Primary)</label>
                        <Input placeholder="9876543210" value={formData.contactNumber} maxLength={10} onChange={(e) => setFormData({...formData, contactNumber: e.target.value.replace(/[^0-9]/g, '')})} className={`h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all ${errors.contactNumber ? 'border-rose-500' : ''}`} />
                        {errors.contactNumber && <p className="text-[10px] font-bold text-rose-500">{errors.contactNumber}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">Email Address</label>
                        <Input type="email" placeholder="doctor@example.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all" />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-bold text-slate-700">Create Secure Password</label>
                        <Input type="password" placeholder="Min 6 characters" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className={`h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all ${errors.password ? 'border-rose-500' : ''}`} />
                        {errors.password && <p className="text-[10px] font-bold text-rose-500">{errors.password}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Section: Medical Credentials */}
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">Medical Credentials</h3>
                        <p className="text-xs text-slate-500 font-medium">To maintain high clinical standards.</p>
                      </div>
                    </div>
                    <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">Medical Registration No.</label>
                        <Input placeholder="BMC-12345" value={formData.medicalRegistrationNumber} onChange={(e) => setFormData({...formData, medicalRegistrationNumber: e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '')})} className={`h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all ${errors.medicalRegistrationNumber ? 'border-rose-500' : ''}`} />
                        {errors.medicalRegistrationNumber && <p className="text-[10px] font-bold text-rose-500">{errors.medicalRegistrationNumber}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">Medical Council</label>
                        <select value={formData.medicalCouncil} onChange={(e) => setFormData({...formData, medicalCouncil: e.target.value})} className="h-12 w-full rounded-xl bg-slate-50 border border-slate-200 px-4 text-sm focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all">
                          {MEDICAL_COUNCILS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">Registration Year</label>
                        <Input type="number" placeholder="e.g. 2012" value={formData.registrationYear} onChange={(e) => setFormData({...formData, registrationYear: e.target.value})} className={`h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all ${errors.registrationYear ? 'border-rose-500' : ''}`} />
                        {errors.registrationYear && <p className="text-[10px] font-bold text-rose-500">{errors.registrationYear}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">Primary Specialty</label>
                        <select value={formData.specialization} onChange={(e) => setFormData({...formData, specialization: e.target.value})} className={`h-12 w-full rounded-xl bg-slate-50 border border-slate-200 px-4 text-sm focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all ${errors.specialization ? 'border-rose-500' : ''}`}>
                          <option value="">Select Specialty</option>
                          {STANDARD_SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        {errors.specialization && <p className="text-[10px] font-bold text-rose-500">{errors.specialization}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">Years of Experience</label>
                        <Input type="number" placeholder="e.g. 5" value={formData.experience} onChange={(e) => setFormData({...formData, experience: e.target.value})} className={`h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all ${errors.experience ? 'border-rose-500' : ''}`} />
                        {errors.experience && <p className="text-[10px] font-bold text-rose-500">{errors.experience}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">Qualifications</label>
                        <Input placeholder="MBBS, MD" value={formData.qualifications} onChange={(e) => setFormData({...formData, qualifications: e.target.value})} className={`h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all ${errors.qualifications ? 'border-rose-500' : ''}`} />
                        {errors.qualifications && <p className="text-[10px] font-bold text-rose-500">{errors.qualifications}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Section: Clinic Location */}
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                          <Building className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900">Clinic Location</h3>
                          <p className="text-xs text-slate-500 font-medium">Where patients will visit you.</p>
                        </div>
                      </div>
                      {/* GPS Button */}
                      <button
                        type="button"
                        onClick={fetchGPSLocation}
                        disabled={gpsLoading}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                          gpsStatus === 'success' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                          gpsStatus === 'error' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                          'bg-sky-100 text-sky-700 border border-sky-200 hover:bg-sky-200'
                        }`}
                      >
                        {gpsLoading ? (
                          <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Locating...</>
                        ) : gpsStatus === 'success' ? (
                          <><CheckCircle2 className="w-3.5 h-3.5" /> Located!</>
                        ) : gpsStatus === 'error' ? (
                          <><AlertCircle className="w-3.5 h-3.5" /> Try Again</>
                        ) : (
                          <><MapPin className="w-3.5 h-3.5" /> Use GPS</>
                        )}
                      </button>
                    </div>
                    <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-bold text-slate-700">Clinic Name</label>
                        <Input placeholder="JivniCare Clinic" value={formData.practiceName} onChange={(e) => setFormData({...formData, practiceName: e.target.value.replace(/[0-9]/g, '')})} className={`h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all ${errors.practiceName ? 'border-rose-500' : ''}`} />
                        {errors.practiceName && <p className="text-[10px] font-bold text-rose-500">{errors.practiceName}</p>}
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-bold text-slate-700">Full Address</label>
                        <Input placeholder="Flat 301, Pushpanjali Complex" value={formData.practiceAddress} onChange={(e) => setFormData({...formData, practiceAddress: e.target.value})} className={`h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all ${errors.practiceAddress ? 'border-rose-500' : ''}`} />
                        {errors.practiceAddress && <p className="text-[10px] font-bold text-rose-500">{errors.practiceAddress}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">Locality</label>
                        <Input placeholder="Boring Road" value={formData.locality} onChange={(e) => setFormData({...formData, locality: e.target.value.replace(/[0-9]/g, '')})} className={`h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all ${errors.locality ? 'border-rose-500' : ''}`} />
                        {errors.locality && <p className="text-[10px] font-bold text-rose-500">{errors.locality}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">City</label>
                        <Input placeholder="Patna" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className={`h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all ${errors.city ? 'border-rose-500' : ''}`} />
                        {errors.city && <p className="text-[10px] font-bold text-rose-500">{errors.city}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">Pincode</label>
                        <Input placeholder="800001" value={formData.pincode} maxLength={6} onChange={(e) => setFormData({...formData, pincode: e.target.value.replace(/[^0-9]/g, '')})} className={`h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all ${errors.pincode ? 'border-rose-500' : ''}`} />
                        {errors.pincode && <p className="text-[10px] font-bold text-rose-500">{errors.pincode}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* === STEP 2: PROFILE ENHANCEMENT === */}
              {step === 2 && (
                <div className="space-y-8">
                  <div className="mb-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                      <Sparkles className="w-3.5 h-3.5" /> Profile Polish
                    </span>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Make your profile shine</h2>
                    <p className="text-slate-500 font-medium mt-2 text-lg">Add details that help patients choose you. (Optional but highly recommended)</p>
                  </div>

                  {errors.submit && (
                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      <p className="text-sm font-bold text-rose-800">{errors.submit}</p>
                    </div>
                  )}

                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                     <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">OPD Consultation Fee (₹)</label>
                        <Input type="number" placeholder="500" value={formData.fee} onChange={(e) => setFormData({...formData, fee: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all" />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">Languages Spoken</label>
                        <Input placeholder="Hindi, English" value={formData.languages} onChange={(e) => setFormData({...formData, languages: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all" />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-bold text-slate-700">Professional Bio</label>
                        <textarea rows={5} placeholder="I am a dedicated physician with over..." value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} className="w-full rounded-xl bg-slate-50 border border-slate-200 p-4 text-sm focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all resize-none" />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">Profile Photo URL</label>
                        <Input placeholder="https://image-url..." value={formData.profilePhotoUrl} onChange={(e) => setFormData({...formData, profilePhotoUrl: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all" />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">Clinic Photo URL</label>
                        <Input placeholder="https://image-url..." value={formData.clinicPhotoUrl} onChange={(e) => setFormData({...formData, clinicPhotoUrl: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all" />
                      </div>

                      <div className="space-y-3 md:col-span-2 pt-4 border-t border-slate-100">
                        <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                          <span>Emergency Services</span>
                          <div 
                            onClick={() => setFormData({...formData, emergencyAvailable: !formData.emergencyAvailable})}
                            className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${formData.emergencyAvailable ? 'bg-rose-500' : 'bg-slate-200'}`}
                          >
                            <motion.div 
                              layout 
                              className="w-4 h-4 bg-white rounded-full shadow-sm" 
                              animate={{ x: formData.emergencyAvailable ? 24 : 0 }} 
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                          </div>
                        </label>
                        <p className="text-xs text-slate-500">I am available for emergency consultations or walk-in trauma cases.</p>
                      </div>
                     </div>
                  </div>
                </div>
              )}

              {/* === STEP 3: SUCCESS === */}
              {step === 3 && (
                <div className="max-w-2xl mx-auto space-y-8 animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
                  
                  {/* Premium Success Check with Glow */}
                  <div className="flex flex-col items-center justify-center text-center pt-8 pb-4">
                    <div className="relative mb-6">
                      <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center shadow-md relative z-10 border border-emerald-200">
                        <ShieldCheck className="w-10 h-10 text-emerald-600 animate-pulse" />
                      </div>
                      <div className="absolute inset-0 bg-emerald-200/50 rounded-3xl blur-xl scale-125 -z-10 animate-ping duration-1000" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">
                      Digital Clinic Registered!
                    </h2>
                    <p className="text-slate-500 font-semibold text-base max-w-md">
                      Your partner application was received successfully. We have initiated the medical credentials verification.
                    </p>
                  </div>

                  {/* Glassmorphic Clinical Welcome Card (Receipt Style) */}
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-100/50 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-sky-500/10 to-transparent rounded-bl-full pointer-events-none" />
                    
                    {/* Header */}
                    <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-955">Application Summary</h3>
                        <p className="text-xs text-slate-500 font-medium">B2B Partner Verification Receipt</p>
                      </div>
                      <span className="ml-auto px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[10px] font-bold tracking-wider uppercase animate-pulse">
                        ⏳ Verifying
                      </span>
                    </div>

                    {/* Details grid */}
                    <div className="p-6 md:p-8 space-y-4 text-sm font-medium text-slate-600">
                      <div className="grid grid-cols-3 py-1.5 border-b border-slate-100/70">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Doctor Partner</span>
                        <span className="col-span-2 text-slate-900 font-bold">{formData.fullName || "Dr. Partner"}</span>
                      </div>
                      <div className="grid grid-cols-3 py-1.5 border-b border-slate-100/70">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Registration</span>
                        <span className="col-span-2 text-slate-800 font-semibold">{formData.medicalRegistrationNumber || "N/A"} ({formData.medicalCouncil})</span>
                      </div>
                      <div className="grid grid-cols-3 py-1.5 border-b border-slate-100/70">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Specialty</span>
                        <span className="col-span-2 text-slate-800 font-semibold">{formData.specialization || "General Physician"}</span>
                      </div>
                      <div className="grid grid-cols-3 py-1.5 border-b border-slate-100/70">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Practice Name</span>
                        <span className="col-span-2 text-slate-800 font-semibold">{formData.practiceName || "JivniCare Clinic"}</span>
                      </div>
                      <div className="grid grid-cols-3 py-1.5">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Location</span>
                        <span className="col-span-2 text-slate-800 font-semibold">{formData.locality}, {formData.city} (PIN {formData.pincode})</span>
                      </div>
                    </div>
                  </div>

                  {/* Verification Workflow Timeline */}
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
                    <h4 className="font-extrabold text-slate-955 text-base tracking-tight flex items-center gap-2">
                      <Activity className="w-4 h-4 text-sky-500" />
                      Verification & Activation Steps
                    </h4>

                    <div className="relative border-l-2 border-slate-100 pl-6 ml-3 space-y-6">
                      
                      {/* Step 1 */}
                      <div className="relative">
                        <div className="absolute -left-[35px] top-0 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="font-bold text-slate-900 text-sm">Application Received</h5>
                          <p className="text-xs text-slate-500 mt-1 font-medium">Digital clinic details submitted cleanly to JivniCare registry.</p>
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div className="relative">
                        <div className="absolute -left-[35px] top-0 w-6 h-6 rounded-full bg-sky-100 border-2 border-sky-500 flex items-center justify-center shadow-md animate-pulse">
                          <Clock className="w-3.5 h-3.5 text-sky-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-bold text-slate-900 text-sm">Council Registry Verification</h5>
                            <span className="text-[10px] font-black text-sky-600 uppercase bg-sky-50 px-2 py-0.5 rounded border border-sky-200 animate-pulse">Usually &lt; 24 Hours</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 font-medium">Verification team is validating registration credentials against Bihar Medical Council & NMC registers.</p>
                        </div>
                      </div>

                      {/* Step 3 */}
                      <div className="relative">
                        <div className="absolute -left-[35px] top-0 w-6 h-6 rounded-full bg-slate-50 border-2 border-slate-200 flex items-center justify-center text-slate-400">
                          <Lock className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <h5 className="font-bold text-slate-400 text-sm">Clinic Activation Kit</h5>
                          <p className="text-xs text-slate-400 mt-1 font-medium">Onboarding confirmation SMS, unique doctor shortcode, and live queue scheduler activation.</p>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Sandbox Notice Banner */}
                  <div className="bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-100 rounded-3xl p-6 flex gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-white text-sky-600 flex items-center justify-center shrink-0 shadow-sm border border-sky-50">
                      <Sparkles className="w-5 h-5 text-sky-500 animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <h5 className="font-bold text-slate-900 text-sm">Explore Sandbox & Pre-configure slots</h5>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        While our moderation team audits your credentials, you can enter the dashboard in **Sandbox Mode**. Set up consultation fees, emergency settings, and schedule slots so you are ready to receive live bookings the moment activation completes!
                      </p>
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-2">
                    <Button 
                      onClick={() => router.push("/doctor/dashboard")} 
                      className="h-14 px-8 flex-1 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-base shadow-lg shadow-sky-600/20 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    >
                      Enter Dashboard (Sandbox)
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                    <a 
                      href="https://wa.me/919999999999?text=JivniCare%20Doctor%20Support%20Request" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="h-14 px-8 rounded-2xl border border-slate-200 hover:border-slate-350 bg-white hover:bg-slate-50 text-slate-700 font-bold text-base transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    >
                      <PhoneCall className="w-5 h-5 text-slate-400" />
                      Contact Support Desk
                    </a>
                  </div>

                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

        {/* STICKY BOTTOM ACTION BAR */}
        {step < 3 && (
          <div className="fixed bottom-0 right-0 left-0 md:left-[420px] lg:left-[480px] bg-white/80 backdrop-blur-2xl border-t border-slate-200/50 p-4 md:p-6 z-50 animate-in slide-in-from-bottom-full">
            <div className="max-w-3xl mx-auto w-full flex items-center justify-between">
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Step {step} of 2
                </p>
                <p className="font-bold text-slate-900">
                  {step === 1 ? "Identity & Clinic" : "Profile Polish"}
                </p>
              </div>
              <Button 
                type="button" 
                onClick={step === 1 ? submitStep1 : submitStep2} 
                disabled={isSubmitting} 
                className="h-14 px-8 w-full sm:w-auto rounded-xl font-bold bg-sky-600 hover:bg-sky-700 text-white flex items-center gap-2 shadow-lg shadow-sky-600/20 transition-all hover:-translate-y-0.5"
              >
                {isSubmitting ? (
                  <><RefreshCw className="w-5 h-5 animate-spin" /> {step === 1 ? 'Saving...' : 'Submitting...'}</>
                ) : (
                  <>{step === 1 ? 'Save & Continue' : 'Submit For Verification'} {step === 1 ? <ArrowRight className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}</>
                )}
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

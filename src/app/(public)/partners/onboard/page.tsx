"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, CheckCircle2, ShieldCheck, RefreshCw, AlertCircle, Sparkles, Lock, UserCircle, Briefcase, MapPin, Building, Star, Activity, ArrowLeft
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
    profilePhotoUrl: "", clinicPhotoUrl: "", emergencyAvailable: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (!formData.pincode.trim() || !/^\\d{6}$/.test(formData.pincode)) { newErrors.pincode = "Valid 6-digit Pincode is required."; isValid = false; }

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
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans overflow-x-hidden selection:bg-emerald-500/30 selection:text-emerald-900">
      
      {/* LEFT SIDEBAR - STICKY */}
      <div className="md:w-[420px] lg:w-[480px] bg-slate-900 flex flex-col shrink-0 relative overflow-hidden md:sticky md:top-0 md:h-screen shadow-2xl z-20">
        
        {/* Dynamic Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-40">
          <div className="absolute -top-[10%] -right-[20%] w-[60%] h-[50%] rounded-full bg-emerald-500/20 blur-[100px]" />
          <div className="absolute bottom-[10%] -left-[20%] w-[50%] h-[50%] rounded-full bg-blue-500/20 blur-[100px]" />
        </div>

        <div className="p-8 md:p-12 flex-1 flex flex-col relative z-10">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-2 mb-16 group">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">Jivni<span className="text-emerald-400">Care</span></span>
          </Link>

          {/* Value Prop */}
          <div className="mb-16">
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-[1.1] mb-6">
              Modernize your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">clinical practice.</span>
            </h1>
            <p className="text-slate-400 text-lg font-medium leading-relaxed">
              Join Bihar's fastest-growing digital healthcare network. Reduce no-shows, manage queues, and boost revenue.
            </p>
          </div>

          {/* Vertical Stepper */}
          <div className="mt-auto hidden md:block">
            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-[15px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-800 before:to-transparent">
              
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-4 border-slate-900 bg-emerald-500 text-slate-900 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 transition-colors duration-500`}>
                  {step > 1 ? <CheckCircle2 className="w-4 h-4 text-white" /> : <span className="font-bold text-xs">1</span>}
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] text-left md:text-right md:group-odd:text-left">
                  <p className={`font-bold text-sm transition-colors ${step >= 1 ? 'text-white' : 'text-slate-500'}`}>Identity & Clinic</p>
                </div>
              </div>

              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-4 border-slate-900 ${step >= 2 ? 'bg-emerald-500 text-slate-900' : 'bg-slate-800 text-slate-400'} shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 transition-colors duration-500`}>
                  {step > 2 ? <CheckCircle2 className="w-4 h-4 text-white" /> : <span className="font-bold text-xs">2</span>}
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] text-left md:text-right md:group-odd:text-left">
                  <p className={`font-bold text-sm transition-colors ${step >= 2 ? 'text-white' : 'text-slate-500'}`}>Profile Polish</p>
                </div>
              </div>

              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-4 border-slate-900 ${step === 3 ? 'bg-emerald-500 text-slate-900' : 'bg-slate-800 text-slate-400'} shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 transition-colors duration-500`}>
                  <ShieldCheck className={`w-4 h-4 ${step === 3 ? 'text-slate-900' : 'text-slate-500'}`} />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] text-left md:text-right md:group-odd:text-left">
                  <p className={`font-bold text-sm transition-colors ${step === 3 ? 'text-white' : 'text-slate-500'}`}>Verification</p>
                </div>
              </div>

            </div>
          </div>
          
          {/* Trust Badge Mobile */}
          <div className="mt-12 pt-8 border-t border-slate-800 flex items-center gap-4">
             <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800" />
                <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-700" />
                <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-600 flex items-center justify-center">
                  <span className="text-[10px] font-black text-white">+5k</span>
                </div>
             </div>
             <p className="text-xs font-medium text-slate-400 leading-tight">Join thousands of verified<br/>healthcare professionals.</p>
          </div>
        </div>
      </div>

      {/* RIGHT CONTENT AREA */}
      <div className="flex-1 relative flex flex-col bg-slate-50 min-h-screen">
        
        {/* Top bar for Login */}
        <div className="w-full p-6 flex justify-end absolute top-0 right-0 z-20">
          <Link href="/partners/login" className="px-5 py-2.5 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-600 hover:text-slate-900 hover:border-slate-300 shadow-sm transition-all flex items-center gap-2">
            Already a partner? <span className="text-emerald-600">Sign In</span>
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
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
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
                        <Input placeholder="Dr. Rajesh Kumar" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value.replace(/[^a-zA-Z\\s\\.]/g, '')})} className={`h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${errors.fullName ? 'border-rose-500 focus:ring-rose-500/20' : ''}`} />
                        {errors.fullName && <p className="text-[10px] font-bold text-rose-500">{errors.fullName}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">Gender</label>
                        <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} className={`h-12 w-full rounded-xl bg-slate-50 border border-slate-200 px-4 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all ${errors.gender ? 'border-rose-500' : ''}`}>
                          <option value="">Select Gender</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                        </select>
                        {errors.gender && <p className="text-[10px] font-bold text-rose-500">{errors.gender}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">Date of Birth</label>
                        <Input type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})} className={`h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${errors.dateOfBirth ? 'border-rose-500' : ''}`} />
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
                        <Input placeholder="9876543210" value={formData.contactNumber} maxLength={10} onChange={(e) => setFormData({...formData, contactNumber: e.target.value.replace(/\\D/g, '')})} className={`h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${errors.contactNumber ? 'border-rose-500' : ''}`} />
                        {errors.contactNumber && <p className="text-[10px] font-bold text-rose-500">{errors.contactNumber}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">Email Address</label>
                        <Input type="email" placeholder="doctor@example.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-bold text-slate-700">Create Secure Password</label>
                        <Input type="password" placeholder="Min 6 characters" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className={`h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${errors.password ? 'border-rose-500' : ''}`} />
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
                        <Input placeholder="BMC-12345" value={formData.medicalRegistrationNumber} onChange={(e) => setFormData({...formData, medicalRegistrationNumber: e.target.value.toUpperCase().replace(/[^A-Z0-9\\-]/g, '')})} className={`h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${errors.medicalRegistrationNumber ? 'border-rose-500' : ''}`} />
                        {errors.medicalRegistrationNumber && <p className="text-[10px] font-bold text-rose-500">{errors.medicalRegistrationNumber}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">Medical Council</label>
                        <select value={formData.medicalCouncil} onChange={(e) => setFormData({...formData, medicalCouncil: e.target.value})} className="h-12 w-full rounded-xl bg-slate-50 border border-slate-200 px-4 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all">
                          {MEDICAL_COUNCILS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">Registration Year</label>
                        <Input type="number" placeholder="e.g. 2012" value={formData.registrationYear} onChange={(e) => setFormData({...formData, registrationYear: e.target.value})} className={`h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${errors.registrationYear ? 'border-rose-500' : ''}`} />
                        {errors.registrationYear && <p className="text-[10px] font-bold text-rose-500">{errors.registrationYear}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">Primary Specialty</label>
                        <select value={formData.specialization} onChange={(e) => setFormData({...formData, specialization: e.target.value})} className={`h-12 w-full rounded-xl bg-slate-50 border border-slate-200 px-4 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all ${errors.specialization ? 'border-rose-500' : ''}`}>
                          <option value="">Select Specialty</option>
                          {STANDARD_SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        {errors.specialization && <p className="text-[10px] font-bold text-rose-500">{errors.specialization}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">Years of Experience</label>
                        <Input type="number" placeholder="e.g. 5" value={formData.experience} onChange={(e) => setFormData({...formData, experience: e.target.value})} className={`h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${errors.experience ? 'border-rose-500' : ''}`} />
                        {errors.experience && <p className="text-[10px] font-bold text-rose-500">{errors.experience}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">Qualifications</label>
                        <Input placeholder="MBBS, MD" value={formData.qualifications} onChange={(e) => setFormData({...formData, qualifications: e.target.value})} className={`h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${errors.qualifications ? 'border-rose-500' : ''}`} />
                        {errors.qualifications && <p className="text-[10px] font-bold text-rose-500">{errors.qualifications}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Section: Clinic Location */}
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                        <Building className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">Clinic Location</h3>
                        <p className="text-xs text-slate-500 font-medium">Where patients will visit you.</p>
                      </div>
                    </div>
                    <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-bold text-slate-700">Clinic Name</label>
                        <Input placeholder="JivniCare Clinic" value={formData.practiceName} onChange={(e) => setFormData({...formData, practiceName: e.target.value})} className={`h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${errors.practiceName ? 'border-rose-500' : ''}`} />
                        {errors.practiceName && <p className="text-[10px] font-bold text-rose-500">{errors.practiceName}</p>}
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-bold text-slate-700">Full Address</label>
                        <Input placeholder="Flat 301, Pushpanjali Complex" value={formData.practiceAddress} onChange={(e) => setFormData({...formData, practiceAddress: e.target.value})} className={`h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${errors.practiceAddress ? 'border-rose-500' : ''}`} />
                        {errors.practiceAddress && <p className="text-[10px] font-bold text-rose-500">{errors.practiceAddress}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">Locality</label>
                        <Input placeholder="Boring Road" value={formData.locality} onChange={(e) => setFormData({...formData, locality: e.target.value})} className={`h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${errors.locality ? 'border-rose-500' : ''}`} />
                        {errors.locality && <p className="text-[10px] font-bold text-rose-500">{errors.locality}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">City</label>
                        <Input placeholder="Patna" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className={`h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${errors.city ? 'border-rose-500' : ''}`} />
                        {errors.city && <p className="text-[10px] font-bold text-rose-500">{errors.city}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">Pincode</label>
                        <Input placeholder="800001" value={formData.pincode} onChange={(e) => setFormData({...formData, pincode: e.target.value.replace(/\\D/g, '')})} className={`h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${errors.pincode ? 'border-rose-500' : ''}`} />
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
                        <Input type="number" placeholder="500" value={formData.fee} onChange={(e) => setFormData({...formData, fee: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">Languages Spoken</label>
                        <Input placeholder="Hindi, English" value={formData.languages} onChange={(e) => setFormData({...formData, languages: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-bold text-slate-700">Professional Bio</label>
                        <textarea rows={5} placeholder="I am a dedicated physician with over..." value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} className="w-full rounded-xl bg-slate-50 border border-slate-200 p-4 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none" />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">Profile Photo URL</label>
                        <Input placeholder="https://image-url..." value={formData.profilePhotoUrl} onChange={(e) => setFormData({...formData, profilePhotoUrl: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">Clinic Photo URL</label>
                        <Input placeholder="https://image-url..." value={formData.clinicPhotoUrl} onChange={(e) => setFormData({...formData, clinicPhotoUrl: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
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
                <div className="flex flex-col items-center justify-center text-center py-20 animate-in zoom-in-95 duration-500">
                  <div className="relative mb-8">
                    <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center shadow-inner relative z-10">
                      <ShieldCheck className="w-12 h-12 text-emerald-600" />
                    </div>
                    <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-50" />
                  </div>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-4">Application Submitted</h2>
                  <p className="text-lg text-slate-500 font-medium max-w-md mx-auto mb-10 leading-relaxed">
                    Our clinical moderation team is reviewing your profile. You will be notified once verification is complete.
                  </p>
                  <Button onClick={() => router.push("/doctor/dashboard")} className="h-14 px-10 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg shadow-xl shadow-slate-900/20 transition-all hover:-translate-y-1">
                    Enter Dashboard
                  </Button>
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
                className="h-14 px-8 w-full sm:w-auto rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all hover:-translate-y-0.5"
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

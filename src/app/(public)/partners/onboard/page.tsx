"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, Building2, Hospital, ShieldCheck, Camera, Upload, RefreshCw, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Logo } from "@/components/brand/Logo";

const TOTAL_STEPS = 5; // Step 5 is Success

export default function DoctorOnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const user = useAuthStore(state => state.user);
  const login = useAuthStore(state => state.login);

  // Auto-redirect if already a DOCTOR
  useEffect(() => {
    if (isAuthenticated && user?.role === "DOCTOR") {
      router.replace("/doctor/dashboard");
    }
  }, [isAuthenticated, user, router]);

  // Auth State for Step 1
  const [authPhone, setAuthPhone] = useState("");
  const [authOtp, setAuthOtp] = useState("");
  const [authStep, setAuthStep] = useState<"phone" | "otp">("phone");
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(30);

  useEffect(() => {
    if (authStep === "otp" && resendTimer > 0) {
      const timerId = setTimeout(() => setResendTimer((prev) => prev - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [authStep, resendTimer]);

  const [formData, setFormData] = useState({
    // Step 1: Basic (Name is required, Phone is handled via Auth)
    fullName: user?.name || "",
    // Step 2: Professional
    gender: "", specialization: "", qualifications: "", experience: "", languages: "", fee: "", bio: "",
    // Step 3: Practice Type
    practiceType: "", // "clinic" or "hospital"
    // Step 4: Practice Details
    practiceName: "", practiceAddress: "", city: "", locality: "", landmark: "", contactNumber: "", workingDays: "", timings: "", department: "",
    // Uploads
    profilePhotoUrl: "", medicalRegistrationUrl: "", clinicPhotoUrl: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── AUTH LOGIC (STEP 1) ──────────────────────────────────────────────
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authPhone.length < 10) return;
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: authPhone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");
      setAuthStep("otp");
      setResendTimer(30);
    } catch (error: any) {
      setAuthError(error.message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authOtp.length < 4) return;
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: authPhone, otp: authOtp, name: formData.fullName || "Doctor" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");
      
      login({ id: data.user.id, name: data.user.name || "Doctor", role: data.user.role });
      
      if (data.user.role === 'DOCTOR') {
        router.push("/doctor/dashboard");
      } else {
        setStep(2); // Proceed to next onboarding step
      }
    } catch (error: any) {
      setAuthError(error.message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  // ── VALIDATION LOGIC ──────────────────────────────────────────────────
  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (currentStep === 1) {
      if (!isAuthenticated) {
        setAuthError("Please verify your phone number to continue.");
        return false;
      }
      if (!formData.fullName.trim() || /[^a-zA-Z\s]/.test(formData.fullName)) {
        newErrors.fullName = "Valid name required (letters only)";
        isValid = false;
      }
    }
    
    if (currentStep === 2) {
      if (!formData.specialization) { newErrors.specialization = "Specialization required"; isValid = false; }
      if (!formData.qualifications) { newErrors.qualifications = "Qualifications required"; isValid = false; }
      if (!formData.fee) { newErrors.fee = "Consultation fee required"; isValid = false; }
    }

    if (currentStep === 3) {
      if (!formData.practiceType) { newErrors.practiceType = "Please select a practice type"; isValid = false; }
    }

    if (currentStep === 4) {
      if (!formData.practiceName) { newErrors.practiceName = formData.practiceType === "clinic" ? "Clinic name required" : "Hospital name required"; isValid = false; }
      if (!formData.city) { newErrors.city = "City required"; isValid = false; }
      if (!formData.locality) { newErrors.locality = "Locality required"; isValid = false; }
      if (formData.practiceType === "clinic" && !formData.contactNumber) { newErrors.contactNumber = "Clinic contact required"; isValid = false; }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = async () => {
    if (!validateStep(step)) return;
    
    if (step === 4) {
      setIsSubmitting(true);
      try {
        const res = await fetch("/api/doctor/onboard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });
        const data = await res.json();
        
        if (res.ok && data.success) {
          login({ id: data.user.id, name: data.user.name, role: data.user.role });
          setStep(5);
        } else {
          setErrors({ submit: data.error || "Failed to create profile. Please try again." });
        }
      } catch (err) {
        setErrors({ submit: "Network error occurred." });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setStep(prev => prev + 1);
    }
  };
  
  const handleBack = () => setStep(prev => prev - 1);

  const handleInputChange = (field: string, value: string) => {
    if (field === 'contactNumber') {
      value = value.replace(/\D/g, '').slice(0, 10);
    }
    if (field === 'fullName') {
      value = value.replace(/[^a-zA-Z\s]/g, '');
    }
    if (field === 'experience' || field === 'fee') {
      value = value.replace(/\D/g, '');
    }
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" })); 
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    setIsUploading(prev => ({ ...prev, [field]: true }));
    try {
      const response = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        body: file,
      });
      const newBlob = await response.json();
      if (newBlob.url) {
        setFormData(prev => ({ ...prev, [field]: newBlob.url }));
        setErrors(prev => ({ ...prev, [field]: "" }));
      } else {
        throw new Error("No URL returned");
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, [field]: "Upload failed. Try again." }));
    } finally {
      setIsUploading(prev => ({ ...prev, [field]: false }));
    }
  };

  // ── RENDERERS ────────────────────────────────────────────────────────
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Claim Your Practice</h2>
        <p className="text-slate-500 font-medium mt-2">Join Bihar's fastest-growing digital healthcare network.</p>
      </div>

      <div>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Doctor's Full Name</label>
        <Input 
          placeholder="e.g. Dr. Ramesh Kumar" 
          value={formData.fullName} 
          onChange={e => handleInputChange('fullName', e.target.value)} 
          className="h-14 rounded-xl bg-white border-slate-200 text-lg font-bold focus-visible:ring-4 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 shadow-sm" 
        />
        {errors.fullName && <p className="text-xs font-bold text-red-500 mt-1">{errors.fullName}</p>}
      </div>

      {!isAuthenticated ? (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mt-6">
          <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Authentication Required</h3>
          
          {authError && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
              <p className="text-sm font-semibold text-red-800">{authError}</p>
            </div>
          )}

          {authStep === "phone" ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Mobile Number</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-500 border-r border-slate-300 pr-2">+91</span>
                  <Input 
                    type="tel" 
                    maxLength={10}
                    value={authPhone} 
                    onChange={e => setAuthPhone(e.target.value.replace(/\D/g, ''))} 
                    className="h-12 pl-16 rounded-xl border-slate-300 font-bold tracking-wide" 
                    placeholder="98765 43210"
                  />
                </div>
              </div>
              <Button type="submit" disabled={isAuthLoading || authPhone.length < 10} className="w-full h-12 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold rounded-xl shadow-[0_8px_20px_rgba(5,150,105,0.2)] active:scale-[0.98]">
                {isAuthLoading ? "Sending..." : "Verify Mobile Number"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Enter 4-Digit OTP</label>
                <Input 
                  type="text" 
                  maxLength={4}
                  value={authOtp} 
                  onChange={e => setAuthOtp(e.target.value.replace(/\D/g, ''))} 
                  className="h-12 text-center text-xl tracking-[1em] font-black rounded-xl border-slate-300" 
                  placeholder="••••"
                />
              </div>
              <Button type="submit" disabled={isAuthLoading || authOtp.length < 4} className="w-full h-12 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold rounded-xl shadow-[0_8px_20px_rgba(5,150,105,0.2)] active:scale-[0.98]">
                {isAuthLoading ? "Verifying..." : "Confirm Secure Login"}
              </Button>
              <div className="text-center mt-2">
                <button type="button" onClick={handleSendOtp} disabled={resendTimer > 0} className="text-xs font-bold text-slate-500 hover:text-[#10b981] disabled:opacity-50">
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mt-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            <div>
              <p className="text-sm font-bold text-emerald-900">Verified Mobile</p>
              <p className="text-xs text-emerald-700">{user?.phone || "Securely Authenticated"}</p>
            </div>
          </div>
          <Button onClick={handleNext} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-md h-10 px-6">
            Continue <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Professional Details</h2>
        <p className="text-slate-500 font-medium mt-2">Build patient trust with your verified credentials.</p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 bg-amber-50 border border-amber-100 p-5 rounded-2xl relative shadow-sm">
          <label className="text-xs font-bold text-amber-900 uppercase mb-3 block tracking-widest">Profile Photo</label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white border-2 border-amber-200 overflow-hidden shrink-0 flex items-center justify-center relative shadow-sm">
              {formData.profilePhotoUrl ? (
                <img src={formData.profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <Camera className="w-6 h-6 text-amber-400" />
              )}
            </div>
            <div className="flex-1 relative">
              <Input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'profilePhotoUrl')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              <Button type="button" variant="outline" className="w-full border-amber-200 text-amber-700 bg-white hover:bg-amber-100 font-bold h-10 pointer-events-none">
                {isUploading['profilePhotoUrl'] ? "Uploading..." : formData.profilePhotoUrl ? "Change Photo" : "Upload Photo"}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-emerald-50 border border-emerald-100 p-5 rounded-2xl relative shadow-sm">
          <label className="text-xs font-bold text-emerald-900 uppercase mb-3 block tracking-widest">Medical Registration</label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-white border-2 border-emerald-200 overflow-hidden shrink-0 flex items-center justify-center relative shadow-sm">
              {formData.medicalRegistrationUrl ? (
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              ) : (
                <Upload className="w-6 h-6 text-emerald-400" />
              )}
            </div>
            <div className="flex-1 relative">
              <Input type="file" accept="image/*,.pdf" onChange={(e) => handleFileUpload(e, 'medicalRegistrationUrl')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              <Button type="button" variant="outline" className="w-full border-emerald-200 text-emerald-700 bg-white hover:bg-emerald-100 font-bold h-10 pointer-events-none">
                {isUploading['medicalRegistrationUrl'] ? "Uploading..." : formData.medicalRegistrationUrl ? "Change Doc" : "Upload Reg."}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Specialization *</label>
          <Input placeholder="e.g. Cardiologist" value={formData.specialization} onChange={e => handleInputChange('specialization', e.target.value)} className="h-14 rounded-xl bg-white border-slate-200 font-bold focus-visible:ring-4 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 shadow-sm" />
          {errors.specialization && <p className="text-xs text-red-500 mt-1 font-bold">{errors.specialization}</p>}
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Degrees / Qualifications *</label>
          <Input placeholder="e.g. MBBS, MD" value={formData.qualifications} onChange={e => handleInputChange('qualifications', e.target.value)} className="h-14 rounded-xl bg-white border-slate-200 font-bold focus-visible:ring-4 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 shadow-sm" />
          {errors.qualifications && <p className="text-xs text-red-500 mt-1 font-bold">{errors.qualifications}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Gender</label>
          <select value={formData.gender} onChange={e => handleInputChange('gender', e.target.value)} className="w-full h-14 px-4 rounded-xl border border-slate-200 bg-slate-50 font-bold focus:ring-[#10b981]">
            <option value="">Select</option><option value="male">Male</option><option value="female">Female</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Years Exp.</label>
          <Input type="text" placeholder="e.g. 5" value={formData.experience} onChange={e => handleInputChange('experience', e.target.value)} className="h-14 rounded-xl bg-white border-slate-200 font-bold text-center focus-visible:ring-4 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 shadow-sm" />
        </div>
        <div className="col-span-2 md:col-span-1">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Base Fee (₹) *</label>
          <Input type="text" placeholder="500" value={formData.fee} onChange={e => handleInputChange('fee', e.target.value)} className="h-14 rounded-xl bg-white border-slate-200 font-black text-emerald-600 focus-visible:ring-4 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 shadow-sm" />
          {errors.fee && <p className="text-xs text-red-500 mt-1 font-bold">{errors.fee}</p>}
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">About / Biography</label>
        <textarea placeholder="Briefly describe your experience and approach to patient care..." value={formData.bio} onChange={e => handleInputChange('bio', e.target.value)} className="w-full h-28 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-medium focus:outline-none focus:ring-2 focus:ring-[#10b981]/50 focus:border-[#10b981] transition-all resize-none" />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Select Practice Type</h2>
        <p className="text-slate-500 font-medium mt-2">Where do you primarily consult patients? This determines how your profile appears to users.</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div 
          onClick={() => handleInputChange('practiceType', 'clinic')}
          className={`cursor-pointer rounded-[2rem] p-8 border-2 transition-all duration-300 ${formData.practiceType === 'clinic' ? 'border-[#10b981] bg-[#10b981]/5 shadow-xl shadow-[#10b981]/10 -translate-y-1' : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'}`}
        >
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-colors ${formData.practiceType === 'clinic' ? 'bg-[#10b981] text-white shadow-lg shadow-[#10b981]/40' : 'bg-slate-100 text-slate-400'}`}>
            <Building2 className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">Own Clinic</h3>
          <p className="text-slate-500 font-medium leading-relaxed">You run your own private clinic. Full control over queue and location.</p>
        </div>

        <div 
          onClick={() => handleInputChange('practiceType', 'hospital')}
          className={`cursor-pointer rounded-[2rem] p-8 border-2 transition-all duration-300 ${formData.practiceType === 'hospital' ? 'border-[#0ea5e9] bg-[#0ea5e9]/5 shadow-xl shadow-[#0ea5e9]/10 -translate-y-1' : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'}`}
        >
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-colors ${formData.practiceType === 'hospital' ? 'bg-[#0ea5e9] text-white shadow-lg shadow-[#0ea5e9]/40' : 'bg-slate-100 text-slate-400'}`}>
            <Hospital className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">Hospital Attach.</h3>
          <p className="text-slate-500 font-medium leading-relaxed">You consult within a larger hospital or multi-specialty center.</p>
        </div>
      </div>
      {errors.practiceType && <p className="text-sm font-bold text-red-500 text-center mt-4 bg-red-50 p-2 rounded-lg">{errors.practiceType}</p>}
    </div>
  );

  const renderStep4 = () => {
    const isClinic = formData.practiceType === "clinic";
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">{isClinic ? "Clinic Details" : "Hospital Attachment"}</h2>
          <p className="text-slate-500 font-medium mt-2">Help patients easily find and reach your practice.</p>
        </div>
        
        <div className="flex items-center gap-5 mb-6 p-5 rounded-[1.5rem] border border-slate-200 bg-white shadow-sm relative">
          <div className="w-20 h-20 rounded-2xl bg-slate-50 border-2 border-slate-100 flex items-center justify-center text-slate-400 shrink-0 overflow-hidden">
            {formData.clinicPhotoUrl ? (
              <img src={formData.clinicPhotoUrl} alt="Practice" className="w-full h-full object-cover" />
            ) : isClinic ? <Building2 className="w-8 h-8" /> : <Hospital className="w-8 h-8" />}
          </div>
          <div className="flex-1">
            <p className="font-bold text-slate-900 mb-2">{isClinic ? "Clinic Photo" : "Hospital Photo"} <span className="text-slate-400 font-normal text-sm">(Optional)</span></p>
            <div className="relative">
              <Input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'clinicPhotoUrl')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              <Button type="button" variant="outline" className="w-full sm:w-auto border-slate-200 text-slate-700 bg-white hover:bg-slate-50 font-bold h-11 pointer-events-none">
                {isUploading['clinicPhotoUrl'] ? "Uploading..." : formData.clinicPhotoUrl ? "Change Photo" : "Upload Exterior Photo"}
              </Button>
            </div>
            {errors.clinicPhotoUrl && <p className="text-xs text-red-500 mt-2 font-bold">{errors.clinicPhotoUrl}</p>}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">{isClinic ? "Clinic Name *" : "Hospital Name *"}</label>
          <Input placeholder={isClinic ? "e.g. Sanjeevani Clinic" : "e.g. Apollo Hospital"} value={formData.practiceName} onChange={e => handleInputChange('practiceName', e.target.value)} className="h-14 rounded-xl bg-white border-slate-200 font-bold focus-visible:ring-4 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 shadow-sm" />
          {errors.practiceName && <p className="text-xs text-red-500 mt-1 font-bold">{errors.practiceName}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">City *</label>
            <Input placeholder="e.g. Patna" value={formData.city} onChange={e => handleInputChange('city', e.target.value)} className="h-14 rounded-xl bg-white border-slate-200 font-bold focus-visible:ring-4 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 shadow-sm" />
            {errors.city && <p className="text-xs text-red-500 mt-1 font-bold">{errors.city}</p>}
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Area / Locality *</label>
            <Input placeholder="e.g. Kankarbagh" value={formData.locality} onChange={e => handleInputChange('locality', e.target.value)} className="h-14 rounded-xl bg-white border-slate-200 font-bold focus-visible:ring-4 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 shadow-sm" />
            {errors.locality && <p className="text-xs text-red-500 mt-1 font-bold">{errors.locality}</p>}
          </div>
        </div>

        {isClinic && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Full Address</label>
              <Input placeholder="Street, building..." value={formData.practiceAddress} onChange={e => handleInputChange('practiceAddress', e.target.value)} className="h-14 rounded-xl bg-white border-slate-200 font-bold focus-visible:ring-4 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 shadow-sm" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Clinic Contact Number *</label>
              <Input type="tel" placeholder="Phone for reception" value={formData.contactNumber} onChange={e => handleInputChange('contactNumber', e.target.value)} className="h-14 rounded-xl bg-white border-slate-200 font-bold focus-visible:ring-4 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 shadow-sm" />
              {errors.contactNumber && <p className="text-xs text-red-500 mt-1 font-bold">{errors.contactNumber}</p>}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderStep5 = () => (
    <div className="flex flex-col items-center justify-center text-center py-12 fade-in">
      <div className="w-28 h-28 bg-[#10b981]/10 rounded-full flex items-center justify-center mb-8 text-[#10b981] ring-8 ring-[#10b981]/5">
        <ShieldCheck className="w-14 h-14" />
      </div>
      <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Application Submitted</h2>
      <p className="text-lg text-slate-500 max-w-md mx-auto mb-10 font-medium">
        Thank you, {formData.fullName || "Doctor"}. Your profile has been sent for priority verification.
      </p>
      
      <Button onClick={() => router.push('/doctor/dashboard')} className="h-14 px-10 rounded-2xl font-black text-lg shadow-xl shadow-[#10b981]/20 bg-[#10b981] hover:bg-[#059669] hover:scale-105 transition-all text-white">
        Go to Partner Dashboard <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 flex items-center justify-center p-4 font-sans py-12">
      
      <div className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
        {/* Top Header & Brand */}
        <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-20">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg">
               <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain" />
            </div>
            <span className="font-black text-xl tracking-tight text-slate-900">Partner Setup</span>
          </Link>
          {step < 5 && <span className="text-sm font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">Step {step} of 4</span>}
        </div>

        {/* Progress Bar */}
        {step < 5 && (
          <div className="w-full bg-slate-50 h-2">
            <div 
              className="h-2 transition-all duration-700 ease-out bg-gradient-to-r from-[#34d399] to-[#059669]" 
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        )}

        {/* Form Container */}
        <div className="p-8 md:p-12 min-h-[450px]">
          {/* Submit error banner */}
          {errors.submit && (
            <div className="mb-8 p-5 rounded-2xl bg-red-50 border border-red-100 flex items-start gap-4 animate-in fade-in slide-in-from-top-2">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-base font-black text-red-900">Submission Failed</p>
                <p className="text-sm font-medium text-red-700 mt-1">{errors.submit}</p>
              </div>
            </div>
          )}
          
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
              {step === 4 && renderStep4()}
              {step === 5 && renderStep5()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Navigation */}
        {step < 5 && (
          <div className="p-6 md:p-8 border-t border-slate-100 bg-slate-50 flex items-center justify-between sticky bottom-0 z-10">
            <Button 
              variant="ghost" 
              onClick={handleBack} 
              disabled={step === 1}
              className={`h-12 px-6 rounded-xl font-bold text-base transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-600 hover:bg-white hover:shadow-sm'}`}
            >
              <ArrowLeft className="w-5 h-5 mr-2" /> Back
            </Button>
            
            <Button 
              onClick={step === 1 && !isAuthenticated ? () => validateStep(1) : handleNext} 
              disabled={isSubmitting || (step === 1 && !isAuthenticated)}
              className="h-14 px-8 rounded-xl text-white font-black text-lg shadow-xl shadow-slate-900/20 bg-slate-900 hover:bg-slate-800 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {step === 4 ? "Submit Profile" : "Continue"} <ArrowRight className="w-5 h-5 ml-2" />
                </span>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

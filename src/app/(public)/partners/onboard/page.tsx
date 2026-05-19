"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  Building2, 
  Hospital, 
  ShieldCheck, 
  Camera, 
  Upload, 
  RefreshCw, 
  AlertCircle,
  FileText,
  Clock,
  User,
  Stethoscope,
  MapPin,
  Sparkles,
  PhoneCall
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Logo } from "@/components/brand/Logo";
import { PublicGuard } from "@/components/shared";
import { GlobalBrandHeader } from "@/components/shared/GlobalBrandHeader";

const TOTAL_STEPS = 5; // Step 5 is Success Screen
const STORAGE_KEY_FORM = "jc_onboard_data_v2";
const STORAGE_KEY_STEP = "jc_onboard_step_v2";

const STANDARD_SPECIALTIES = [
  "General Medicine",
  "Pediatrics",
  "Gynecology & Obstetrics",
  "Dermatology",
  "Cardiology",
  "Orthopedics",
  "Ophthalmology",
  "ENT (Otolaryngology)",
  "Dentistry",
  "Psychiatry",
  "Neurology",
  "Gastroenterology"
];

const MEDICAL_COUNCILS = [
  "Bihar Medical Council",
  "National Medical Commission (NMC)",
  "Medical Council of India (MCI)",
  "Delhi Medical Council",
  "Uttar Pradesh Medical Council",
  "West Bengal Medical Council",
  "Other State Medical Council"
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
  const { isAuthenticated, user, login, updateUser } = useAuthStore();
  const [isDraftSaved, setIsDraftSaved] = useState(false);

  // ── AUTH STATE (STEP 1 Sub-flow) ──────────────────────────────────────
  const [authPhone, setAuthPhone] = useState("");
  const [authOtp, setAuthOtp] = useState("");
  const [authStep, setAuthStep] = useState<"phone" | "otp">("phone");
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // ── HARDENED FORM STATE ────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    fullName: "",
    gender: "",
    dateOfBirth: "",
    specialization: "",
    qualifications: "",
    medicalRegistrationNumber: "",
    medicalCouncil: "Bihar Medical Council",
    registrationYear: "",
    experience: "",
    languages: "Hindi, English",
    fee: "",
    bio: "",
    practiceType: "clinic",
    practiceName: "",
    practiceAddress: "",
    landmark: "",
    city: "Patna", // default regional hub
    district: "Patna",
    state: "Bihar",
    pincode: "",
    locality: "",
    contactNumber: "",
    profilePhotoUrl: "",
    clinicPhotoUrl: "",
    medicalRegistrationUrl: "https://jivnicare.com/verified-registration.pdf" // standard verification docs placeholder
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Session Storage Draft Recovery
  useEffect(() => {
    const savedForm = sessionStorage.getItem(STORAGE_KEY_FORM);
    const savedStep = sessionStorage.getItem(STORAGE_KEY_STEP);
    
    if (savedForm) {
      try {
        const parsed = JSON.parse(savedForm);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (e) { 
        console.error("Failed to parse saved onboarding draft", e); 
      }
    } else if (user?.name) {
      // Pre-fill name from auth if available and clean
      const cleanedName = user.name.replace(/[^a-zA-Z\s\.]/g, '');
      setFormData(prev => ({ ...prev, fullName: cleanedName }));
    }

    if (savedStep) {
      const s = parseInt(savedStep, 10);
      if (s > 1 && s <= TOTAL_STEPS) setStep(s);
    }
  }, [user]);

  // 2. Auto-save Draft to Session Storage with user indication
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY_FORM, JSON.stringify(formData));
    sessionStorage.setItem(STORAGE_KEY_STEP, step.toString());
    setIsDraftSaved(true);
    const t = setTimeout(() => setIsDraftSaved(false), 1500);
    return () => clearTimeout(t);
  }, [formData, step]);

  // 2.1. Warn before closing if onboarding is in progress
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (step > 1 && step < 5) {
        e.preventDefault();
        e.returnValue = "Are you sure you want to exit? Your onboarding draft is saved, but incomplete.";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [step]);

  // 3. Prevent duplicate wizard entry if already full verified DOCTOR
  useEffect(() => {
    if (isAuthenticated && user?.role === "DOCTOR" && user?.doctorId) {
      router.replace("/doctor/dashboard");
    }
  }, [isAuthenticated, user, router]);

  // ── STEP 1 MOBILE AUTH HANDLERS ──────────────────────────────────────
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
      if (!res.ok) throw new Error(data.error || "Failed to send verification code.");

      setAuthStep("otp");
    } catch (error: any) {
      console.error("Send OTP Error:", error);
      setAuthError(error.message || "Failed to send verification code.");
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authOtp.length < 6) return;
    setIsAuthLoading(true);
    setAuthError(null);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          phone: authPhone, 
          otp: authOtp, 
          name: formData.fullName || "Doctor Partner" 
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "OTP verification failed");
      
      login(data.user);
      
      if (data.user.role === 'DOCTOR' && data.user.doctorId) {
        sessionStorage.removeItem(STORAGE_KEY_FORM);
        sessionStorage.removeItem(STORAGE_KEY_STEP);
        router.push("/doctor/dashboard");
      } else {
        setStep(2); // advance to Step 2: Credentials
      }
    } catch (error: any) {
      console.error("Verify OTP Error:", error);
      setAuthError(error.message || "OTP verification failed. Please try again.");
    } finally {
      setIsAuthLoading(false);
    }
  };

  // ── STEP VALIDATION MATRIX ───────────────────────────────────────────
  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (currentStep === 1) {
      if (!isAuthenticated) {
        setAuthError("Please verify your phone number first to proceed.");
        return false;
      }
      if (!formData.fullName.trim() || formData.fullName.trim().length < 3) {
        newErrors.fullName = "Legal Name must be at least 3 characters.";
        isValid = false;
      }
      if (/[^a-zA-Z\s\.]/.test(formData.fullName)) {
        newErrors.fullName = "Name must contain only letters, spaces, and periods.";
        isValid = false;
      }
      if (!formData.gender) {
        newErrors.gender = "Gender selection is required.";
        isValid = false;
      }
      if (!formData.dateOfBirth) {
        newErrors.dateOfBirth = "Date of birth is required.";
        isValid = false;
      } else {
        const dob = new Date(formData.dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
          age--;
        }
        if (age < 22) {
          newErrors.dateOfBirth = "Must be at least 22 years of age to onboard.";
          isValid = false;
        }
      }
    }
    
    if (currentStep === 2) {
      const regPattern = /^[A-Z0-9\-]+$/;
      if (!formData.medicalRegistrationNumber.trim() || formData.medicalRegistrationNumber.trim().length < 5) {
        newErrors.medicalRegistrationNumber = "Valid Medical Registration Number is required (min 5 chars).";
        isValid = false;
      } else if (!regPattern.test(formData.medicalRegistrationNumber)) {
        newErrors.medicalRegistrationNumber = "Registration number must contain only uppercase letters, numbers, and hyphens.";
        isValid = false;
      }
      if (!formData.medicalCouncil) {
        newErrors.medicalCouncil = "Medical Council is required.";
        isValid = false;
      }
      if (!formData.registrationYear) {
        newErrors.registrationYear = "Registration year is required.";
        isValid = false;
      } else {
        const yr = parseInt(formData.registrationYear, 10);
        const currentYear = new Date().getFullYear();
        if (isNaN(yr) || yr < 1960 || yr > currentYear) {
          newErrors.registrationYear = `Year must be between 1960 and ${currentYear}.`;
          isValid = false;
        }
      }
      if (!formData.qualifications.trim()) {
        newErrors.qualifications = "Qualifications (e.g., MBBS, MD) are required.";
        isValid = false;
      }
    }

    if (currentStep === 3) {
      if (!formData.specialization) {
        newErrors.specialization = "Please select your primary specialty.";
        isValid = false;
      }
      if (!formData.experience) {
        newErrors.experience = "Years of experience are required.";
        isValid = false;
      } else {
        const exp = parseInt(formData.experience, 10);
        if (isNaN(exp) || exp < 0 || exp > 65) {
          newErrors.experience = "Experience must be between 0 and 65 years.";
          isValid = false;
        }
      }
      if (!formData.fee) {
        newErrors.fee = "Consultation fee is required.";
        isValid = false;
      } else {
        const feeAmount = parseInt(formData.fee, 10);
        if (isNaN(feeAmount) || feeAmount < 0 || feeAmount > 5000) {
          newErrors.fee = "Consultation fee must be between ₹0 and ₹5,000.";
          isValid = false;
        }
      }
    }

    if (currentStep === 4) {
      if (!formData.practiceName.trim()) {
        newErrors.practiceName = formData.practiceType === "clinic" ? "Clinic name is required." : "Hospital name is required.";
        isValid = false;
      }
      if (!formData.city.trim()) {
        newErrors.city = "City is required.";
        isValid = false;
      }
      if (!formData.locality.trim()) {
        newErrors.locality = "Locality is required.";
        isValid = false;
      }
      if (!formData.pincode.trim() || !/^\d{6}$/.test(formData.pincode)) {
        newErrors.pincode = "Valid 6-digit Pincode is required.";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = async () => {
    if (!validateStep(step)) return;
    
    if (step === 4) {
      setIsSubmitting(true);
      setErrors({});
      try {
        const res = await fetch("/api/doctor/onboard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });
        const data = await res.json();
        
        if (res.ok && data.success) {
          updateUser({ 
            role: "DOCTOR", 
            doctorId: data.doctor.id,
            name: data.user.name || formData.fullName
          });
          sessionStorage.removeItem(STORAGE_KEY_FORM);
          sessionStorage.removeItem(STORAGE_KEY_STEP);
          setStep(5); // Success step
        } else {
          setErrors({ submit: data.error || "Failed to submit onboarding credentials." });
        }
      } catch (err) {
        setErrors({ submit: "A network error occurred. Please verify your connection." });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setStep(step + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col relative overflow-hidden font-sans">
      {/* ── Background Aesthetics ── */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-emerald-50/40 blur-[120px]" />
        <div className="absolute top-[20%] -left-[10%] w-[30%] h-[30%] rounded-full bg-blue-50/40 blur-[120px]" />
      </div>
      
      {/* Header */}
      <GlobalBrandHeader 
        subtitle="Bihar"
        tagline="Partner Onboarding"
        rightElement={
          <Link href="/" className="text-[11px] font-black text-slate-400 hover:text-rose-500 transition-all uppercase tracking-widest flex items-center gap-2 group">
            Exit <span className="hidden sm:inline">Application</span> <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        }
      />

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12 md:py-16 relative z-10">
        
        {/* Progress System */}
        {step < 5 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  Stage {step} of 4 • {step === 1 ? "Core Identity" : step === 2 ? "Medical Credentials" : step === 3 ? "Professional Info" : "OPD Operations"}
                </span>
                <AnimatePresence>
                  {isDraftSaved && (
                    <motion.span 
                      initial={{ opacity: 0, scale: 0.8 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      exit={{ opacity: 0 }}
                      className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 uppercase tracking-wider"
                    >
                      ✓ Saved
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <span className="text-[11px] font-black text-[#489C66] uppercase tracking-widest">
                {Math.round((step / 4) * 100)}% Completed
              </span>
            </div>
            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner p-[1px]">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(step / 4) * 100}%` }}
                className="h-full bg-gradient-to-r from-[#5298D2] to-[#489C66] rounded-full"
              />
            </div>
          </div>
        )}

        {/* Form Container */}
        <div className="bg-white rounded-[2rem] p-8 md:p-14 shadow-premium border border-slate-100 relative overflow-hidden">
          {/* Decorative Accent */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#489C66]/5 rounded-bl-[5rem] -mr-16 -mt-16 pointer-events-none" />

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="relative z-10"
            >
              {/* ────────────────────────────────────────────────────────
                  STEP 1: Core Identity
              ──────────────────────────────────────────────────────── */}
              {step === 1 && (
                <div className="space-y-10">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-blue-100">
                      <Sparkles className="w-3 h-3" /> Professional Registration
                    </span>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                      Begin Your Medical <br />Partnership
                    </h1>
                    <p className="text-slate-500 font-bold mt-2 text-base md:text-lg">
                      Enter your core details. Numeric spam or numbers inside Name are strictly filtered.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Full Name Input (Strict Real-Time Typing Sanitization) */}
                    <div className="group">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2.5 block ml-1">
                        Full Name (As per Medical Council)
                      </label>
                      <div className="relative">
                        <Input 
                          placeholder="Dr. Rajesh Kumar" 
                          value={formData.fullName}
                          onChange={(e) => {
                            // Strip any character that is not a letter, space, or period immediately
                            const cleaned = e.target.value.replace(/[^a-zA-Z\s\.]/g, '');
                            setFormData({...formData, fullName: cleaned});
                          }}
                          className={`h-12 rounded-xl bg-card border-slate-200 focus:ring-4 focus:ring-primary/10 focus:border-primary font-bold text-base transition-all ${errors.fullName ? 'border-destructive focus:ring-destructive/10' : ''}`}
                        />
                      </div>
                      {errors.fullName ? (
                        <p className="text-xs font-bold text-rose-500 mt-2 ml-1">{errors.fullName}</p>
                      ) : (
                        <p className="text-[10px] font-bold text-slate-400 mt-1.5 ml-1">Only letters, spaces, and periods are accepted.</p>
                      )}
                    </div>

                    {/* Gender Dropdown */}
                    <div className="group">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2.5 block ml-1">
                        Gender
                      </label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({...formData, gender: e.target.value})}
                        className={`h-12 w-full rounded-xl bg-card border border-slate-200 px-3 font-bold text-base text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all ${errors.gender ? 'border-destructive' : ''}`}
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                      {errors.gender && <p className="text-xs font-bold text-rose-500 mt-2 ml-1">{errors.gender}</p>}
                    </div>

                    {/* DOB Input */}
                    <div className="group">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2.5 block ml-1">
                        Date of Birth (DOB)
                      </label>
                      <Input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                        className={`h-12 rounded-xl bg-card border-slate-200 focus:ring-4 focus:ring-primary/10 focus:border-primary font-bold text-base transition-all ${errors.dateOfBirth ? 'border-destructive' : ''}`}
                      />
                      {errors.dateOfBirth ? (
                        <p className="text-xs font-bold text-rose-500 mt-2 ml-1">{errors.dateOfBirth}</p>
                      ) : (
                        <p className="text-[10px] font-bold text-slate-400 mt-1.5 ml-1">Must be at least 22 years of age to practice.</p>
                      )}
                    </div>

                    {/* Mobile Phone Verification Step */}
                    <div className="group">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2.5 block ml-1">
                        Mobile Verification (OTP Secure)
                      </label>
                      {!isAuthenticated ? (
                        <div className="space-y-3">
                          <div className="relative flex gap-2">
                            <Input 
                              placeholder="9876543210" 
                              value={authPhone}
                              disabled={authStep === "otp"}
                              onChange={(e) => setAuthPhone(e.target.value.replace(/\D/g, '').substring(0, 10))}
                              className="h-12 rounded-xl bg-card border-slate-200 focus:ring-4 focus:ring-primary/10 focus:border-primary font-bold text-base transition-all"
                            />
                            {authStep === "phone" && (
                              <Button 
                                type="button"
                                onClick={handleSendOtp} 
                                disabled={isAuthLoading || authPhone.length < 10} 
                                className="h-12 rounded-xl px-6 bg-[#5298D2] hover:bg-[#4383be] text-white font-bold shadow-sm shrink-0 active:scale-95"
                              >
                                {isAuthLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : "Send OTP"}
                              </Button>
                            )}
                          </div>
                          <AnimatePresence>
                            {authStep === "otp" && (
                              <motion.div 
                                initial={{ opacity: 0, y: 5 }} 
                                animate={{ opacity: 1, y: 0 }}
                                className="flex gap-2"
                              >
                                <Input 
                                  placeholder="Enter 6-Digit OTP" 
                                  value={authOtp}
                                  onChange={(e) => setAuthOtp(e.target.value.replace(/\D/g, '').substring(0, 6))}
                                  className="h-12 rounded-xl bg-card border-[#5298D2]/40 focus:ring-4 focus:ring-primary/10 font-bold text-center tracking-widest text-lg"
                                  maxLength={6}
                                />
                                <Button 
                                  type="button"
                                  onClick={handleVerifyOtp} 
                                  disabled={isAuthLoading || authOtp.length < 6} 
                                  className="h-12 rounded-xl px-6 bg-[#489C66] hover:bg-[#3c8255] text-white font-bold shadow-sm shrink-0 active:scale-95"
                                >
                                  {isAuthLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : "Confirm OTP"}
                                </Button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                          {authError && (
                            <p className="text-xs font-bold text-rose-500 flex items-center gap-1.5 ml-1">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {authError}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="h-14 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between px-4 shadow-sm">
                          <div className="flex flex-col">
                            <span className="text-[9px] font-black text-emerald-600/70 uppercase tracking-widest">VERIFIED IDENTITY</span>
                            <span className="text-emerald-800 font-extrabold text-sm">+91 {user?.phone}</span>
                          </div>
                          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow">
                            <CheckCircle2 className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ────────────────────────────────────────────────────────
                  STEP 2: Medical Credentials
              ──────────────────────────────────────────────────────── */}
              {step === 2 && (
                <div className="space-y-10">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-emerald-100">
                      <ShieldCheck className="w-3 h-3" /> Identity Verification
                    </span>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                      Medical Registry & <br />Verification Details
                    </h1>
                    <p className="text-slate-500 font-bold mt-2 text-base md:text-lg">
                      We strictly cross-verify these credentials against state/national medical registries.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Medical Registration Number (Strict Uppercase + Alphanumeric block) */}
                    <div className="group">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2.5 block ml-1">
                        Medical Registration Number
                      </label>
                      <Input 
                        placeholder="e.g. BMC-49281" 
                        value={formData.medicalRegistrationNumber}
                        onChange={(e) => {
                          const val = e.target.value.toUpperCase().replace(/[^A-Z0-9\-]/g, '');
                          setFormData({...formData, medicalRegistrationNumber: val});
                        }}
                        className={`h-12 rounded-xl bg-card border-slate-200 focus:ring-4 focus:ring-primary/10 focus:border-primary font-bold text-base transition-all ${errors.medicalRegistrationNumber ? 'border-destructive' : ''}`}
                      />
                      {errors.medicalRegistrationNumber ? (
                        <p className="text-xs font-bold text-rose-500 mt-2 ml-1">{errors.medicalRegistrationNumber}</p>
                      ) : (
                        <p className="text-[10px] font-bold text-slate-400 mt-1.5 ml-1">Uppercase letters, numbers, and hyphens only.</p>
                      )}
                    </div>

                    {/* Medical Council Selector */}
                    <div className="group">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2.5 block ml-1">
                        Medical Council Board
                      </label>
                      <select
                        value={formData.medicalCouncil}
                        onChange={(e) => setFormData({...formData, medicalCouncil: e.target.value})}
                        className={`h-12 w-full rounded-xl bg-card border border-slate-200 px-3 font-bold text-base text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all ${errors.medicalCouncil ? 'border-destructive' : ''}`}
                      >
                        {MEDICAL_COUNCILS.map((council) => (
                          <option key={council} value={council}>{council}</option>
                        ))}
                      </select>
                      {errors.medicalCouncil && <p className="text-xs font-bold text-rose-500 mt-2 ml-1">{errors.medicalCouncil}</p>}
                    </div>

                    {/* Registration Year */}
                    <div className="group">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2.5 block ml-1">
                        Registration Year
                      </label>
                      <Input 
                        type="number" 
                        placeholder="2012" 
                        value={formData.registrationYear}
                        onChange={(e) => setFormData({...formData, registrationYear: e.target.value})}
                        className={`h-12 rounded-xl bg-card border-slate-200 focus:ring-4 focus:ring-primary/10 focus:border-primary font-bold text-base transition-all ${errors.registrationYear ? 'border-destructive' : ''}`}
                      />
                      {errors.registrationYear && <p className="text-xs font-bold text-rose-500 mt-2 ml-1">{errors.registrationYear}</p>}
                    </div>

                    {/* Qualifications */}
                    <div className="group">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2.5 block ml-1">
                        Qualifications & Degrees
                      </label>
                      <Input 
                        placeholder="e.g. MBBS, MD (AIIMS)" 
                        value={formData.qualifications}
                        onChange={(e) => setFormData({...formData, qualifications: e.target.value})}
                        className={`h-12 rounded-xl bg-card border-slate-200 focus:ring-4 focus:ring-primary/10 focus:border-primary font-bold text-base transition-all ${errors.qualifications ? 'border-destructive' : ''}`}
                      />
                      {errors.qualifications && <p className="text-xs font-bold text-rose-500 mt-2 ml-1">{errors.qualifications}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* ────────────────────────────────────────────────────────
                  STEP 3: Professional Clinical Info
              ──────────────────────────────────────────────────────── */}
              {step === 3 && (
                <div className="space-y-10">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-amber-100">
                      <Stethoscope className="w-3 h-3" /> Clinical Specialization
                    </span>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                      Specialization & <br />Consultation Settings
                    </h1>
                    <p className="text-slate-500 font-bold mt-2 text-base md:text-lg">
                      Configure your specialty, practice experience, and OPD consultation charges.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Primary Specialty dropdown list */}
                    <div className="group">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2.5 block ml-1">
                        Primary Medical Specialty
                      </label>
                      <select
                        value={formData.specialization}
                        onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                        className={`h-12 w-full rounded-xl bg-card border border-slate-200 px-3 font-bold text-base text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all ${errors.specialization ? 'border-destructive' : ''}`}
                      >
                        <option value="">Select Specialty</option>
                        {STANDARD_SPECIALTIES.map((spec) => (
                          <option key={spec} value={spec}>{spec}</option>
                        ))}
                      </select>
                      {errors.specialization && <p className="text-xs font-bold text-rose-500 mt-2 ml-1">{errors.specialization}</p>}
                    </div>

                    {/* Years of Experience */}
                    <div className="group">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2.5 block ml-1">
                        Years of Experience
                      </label>
                      <Input 
                        type="number" 
                        placeholder="e.g. 10" 
                        value={formData.experience}
                        onChange={(e) => setFormData({...formData, experience: e.target.value})}
                        className={`h-12 rounded-xl bg-card border-slate-200 focus:ring-4 focus:ring-primary/10 focus:border-primary font-bold text-base transition-all ${errors.experience ? 'border-destructive' : ''}`}
                      />
                      {errors.experience && <p className="text-xs font-bold text-rose-500 mt-2 ml-1">{errors.experience}</p>}
                    </div>

                    {/* Consultation Fee */}
                    <div className="group">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2.5 block ml-1">
                        OPD Consultation Fee (₹)
                      </label>
                      <Input 
                        type="number" 
                        placeholder="e.g. 500" 
                        value={formData.fee}
                        onChange={(e) => setFormData({...formData, fee: e.target.value})}
                        className={`h-12 rounded-xl bg-card border-slate-200 focus:ring-4 focus:ring-primary/10 focus:border-primary font-bold text-base transition-all ${errors.fee ? 'border-destructive' : ''}`}
                      />
                      {errors.fee ? (
                        <p className="text-xs font-bold text-rose-500 mt-2 ml-1">{errors.fee}</p>
                      ) : (
                        <p className="text-[10px] font-bold text-slate-400 mt-1.5 ml-1">Enter fee between ₹0 and ₹5,000.</p>
                      )}
                    </div>

                    {/* Languages Spoken */}
                    <div className="group">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2.5 block ml-1">
                        Languages Spoken
                      </label>
                      <Input 
                        placeholder="e.g. Hindi, English, Maithili" 
                        value={formData.languages}
                        onChange={(e) => setFormData({...formData, languages: e.target.value})}
                        className="h-12 rounded-xl bg-card border-slate-200 focus:ring-4 focus:ring-primary/10 focus:border-primary font-bold text-base transition-all"
                      />
                    </div>

                    {/* Short Professional Bio */}
                    <div className="group md:col-span-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2.5 block ml-1">
                        Brief Bio & Clinical Interests (Optional)
                      </label>
                      <textarea
                        placeholder="Tell patients about your clinical focus, treatments, and approach to care..."
                        value={formData.bio}
                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                        rows={4}
                        maxLength={1000}
                        className="w-full rounded-xl bg-card border border-slate-200 p-3 font-bold text-base text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all resize-none"
                      />
                      <p className="text-[10px] font-bold text-slate-400 text-right mt-1">Max 1000 characters.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ────────────────────────────────────────────────────────
                  STEP 4: Clinic Details & Timings
              ──────────────────────────────────────────────────────── */}
              {step === 4 && (
                <div className="space-y-10">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-purple-100">
                      <Building2 className="w-3 h-3" /> Practice Location
                    </span>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                      Infrastructure & <br />Clinic Address
                    </h1>
                    <p className="text-slate-500 font-bold mt-2 text-base md:text-lg">
                      Enter the location where patients will visit for offline physical consultations.
                    </p>
                  </div>

                  {/* Toggle Practice Type */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, practiceType: "clinic"})}
                      className={`h-14 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all active:scale-95 ${formData.practiceType === "clinic" ? "bg-primary text-white border-primary shadow-sm" : "bg-card border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                    >
                      <Building2 className="w-4 h-4" /> Private Clinic
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, practiceType: "hospital"})}
                      className={`h-14 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all active:scale-95 ${formData.practiceType === "hospital" ? "bg-primary text-white border-primary shadow-sm" : "bg-card border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                    >
                      <Hospital className="w-4 h-4" /> Hospital OPD
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Practice Name */}
                    <div className="group md:col-span-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2.5 block ml-1">
                        {formData.practiceType === "clinic" ? "Clinic Name" : "Hospital / Facility Name"}
                      </label>
                      <Input 
                        placeholder={formData.practiceType === "clinic" ? "e.g. Jivni Heart Care Clinic" : "e.g. Mediversal Hospital"} 
                        value={formData.practiceName}
                        onChange={(e) => setFormData({...formData, practiceName: e.target.value})}
                        className={`h-12 rounded-xl bg-card border-slate-200 focus:ring-4 focus:ring-primary/10 focus:border-primary font-bold text-base transition-all ${errors.practiceName ? 'border-destructive' : ''}`}
                      />
                      {errors.practiceName && <p className="text-xs font-bold text-rose-500 mt-2 ml-1">{errors.practiceName}</p>}
                    </div>

                    {/* City */}
                    <div className="group">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2.5 block ml-1">
                        District / City
                      </label>
                      <Input 
                        placeholder="Patna" 
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                        className={`h-12 rounded-xl bg-card border-slate-200 focus:ring-4 focus:ring-primary/10 focus:border-primary font-bold text-base transition-all ${errors.city ? 'border-destructive' : ''}`}
                      />
                      {errors.city && <p className="text-xs font-bold text-rose-500 mt-2 ml-1">{errors.city}</p>}
                    </div>

                    {/* Locality */}
                    <div className="group">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2.5 block ml-1">
                        Locality / Area
                      </label>
                      <Input 
                        placeholder="e.g. Boring Road" 
                        value={formData.locality}
                        onChange={(e) => setFormData({...formData, locality: e.target.value})}
                        className={`h-12 rounded-xl bg-card border-slate-200 focus:ring-4 focus:ring-primary/10 focus:border-primary font-bold text-base transition-all ${errors.locality ? 'border-destructive' : ''}`}
                      />
                      {errors.locality && <p className="text-xs font-bold text-rose-500 mt-2 ml-1">{errors.locality}</p>}
                    </div>

                    {/* Pincode */}
                    <div className="group">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2.5 block ml-1">
                        Pincode
                      </label>
                      <Input 
                        placeholder="e.g. 800001" 
                        value={formData.pincode}
                        onChange={(e) => setFormData({...formData, pincode: e.target.value.replace(/\D/g, '').substring(0, 6)})}
                        className={`h-12 rounded-xl bg-card border-slate-200 focus:ring-4 focus:ring-primary/10 focus:border-primary font-bold text-base transition-all ${errors.pincode ? 'border-destructive' : ''}`}
                      />
                      {errors.pincode && <p className="text-xs font-bold text-rose-500 mt-2 ml-1">{errors.pincode}</p>}
                    </div>

                    {/* Landmark */}
                    <div className="group">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2.5 block ml-1">
                        Landmark (Optional)
                      </label>
                      <Input 
                        placeholder="e.g. Opposite Shiv Mandir" 
                        value={formData.landmark}
                        onChange={(e) => setFormData({...formData, landmark: e.target.value})}
                        className="h-12 rounded-xl bg-card border-slate-200 focus:ring-4 focus:ring-primary/10 focus:border-primary font-bold text-base transition-all"
                      />
                    </div>

                    {/* Practice Address */}
                    <div className="group md:col-span-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2.5 block ml-1">
                        Full Practice Address Details (Optional)
                      </label>
                      <Input 
                        placeholder="e.g. Flat 301, Pushpanjali Complex, Next to HDFC Bank" 
                        value={formData.practiceAddress || ""}
                        onChange={(e) => setFormData({...formData, practiceAddress: e.target.value})}
                        className="h-12 rounded-xl bg-card border-slate-200 focus:ring-4 focus:ring-primary/10 focus:border-primary font-bold text-base transition-all"
                      />
                    </div>
                  </div>

                  {errors.submit && (
                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 animate-bounce" />
                      <p className="text-sm font-bold text-rose-800 leading-relaxed">{errors.submit}</p>
                    </div>
                  )}
                </div>
              )}

              {/* ────────────────────────────────────────────────────────
                  STEP 5: Success & Redirection
              ──────────────────────────────────────────────────────── */}
              {step === 5 && (
                <div className="text-center py-12 md:py-16 space-y-8">
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-pulse">
                    <ShieldCheck className="w-12 h-12" />
                  </div>

                  <div className="space-y-3">
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                      Onboarding Submitted!
                    </h1>
                    <p className="text-slate-500 font-bold text-base max-w-md mx-auto">
                      Your identity verification is in progress. The medical registration number is successfully locked and secure.
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 max-w-md mx-auto text-left space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                        1
                      </div>
                      <span className="text-sm font-bold text-slate-700">Digital Clinic QR Code Generated</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#489C66]/10 text-[#489C66] flex items-center justify-center font-bold">
                        2
                      </div>
                      <span className="text-sm font-bold text-slate-700">Live OPD Queue Dashboard Active</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                        3
                      </div>
                      <span className="text-sm font-bold text-slate-700">SEO Profile deep-link configured</span>
                    </div>
                  </div>

                  <div>
                    <Button 
                      onClick={() => router.push("/doctor/dashboard")}
                      className="bg-gradient-to-r from-[#5298D2] to-[#489C66] hover:from-[#4383be] hover:to-[#3c8255] text-white font-bold h-14 px-10 rounded-full shadow-lg transition-all active:scale-95 text-base"
                    >
                      Enter Doctor Console
                    </Button>
                  </div>
                </div>
              )}

              {/* Navigation Action Buttons */}
              {step < 5 && (
                <div className="flex items-center justify-between border-t border-slate-100 mt-12 pt-8">
                  {step > 1 ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      disabled={isSubmitting}
                      className="h-12 px-6 rounded-xl font-bold border-slate-200 text-slate-600 flex items-center gap-2 hover:bg-slate-50 shrink-0"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back
                    </Button>
                  ) : (
                    <div /> // Spacer
                  )}

                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={isSubmitting || (step === 1 && !isAuthenticated)}
                    className="h-12 px-8 rounded-xl font-bold bg-[#489C66] hover:bg-[#3c8255] text-white flex items-center gap-2 shrink-0 active:scale-95 shadow-md"
                  >
                    {isSubmitting ? (
                      <>
                        Submitting... <RefreshCw className="w-4 h-4 animate-spin" />
                      </>
                    ) : step === 4 ? (
                      <>
                        Complete Setup <CheckCircle2 className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Continue Journey <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

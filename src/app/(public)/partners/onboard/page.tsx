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
import { PublicGuard } from "@/components/shared";

const TOTAL_STEPS = 5; // Step 5 is Success
const STORAGE_KEY_FORM = "jc_onboard_data_v1";
const STORAGE_KEY_STEP = "jc_onboard_step_v1";

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

  // ── AUTH STATE (STEP 1) ──────────────────────────────────────────────
  const [authPhone, setAuthPhone] = useState("");
  const [authOtp, setAuthOtp] = useState("");
  const [authStep, setAuthStep] = useState<"phone" | "otp">("phone");
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // ── FORM DATA ────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    fullName: "",
    gender: "", specialization: "", qualifications: "", experience: "", languages: "", fee: "", bio: "",
    practiceType: "", 
    practiceName: "", practiceAddress: "", city: "", locality: "", landmark: "", contactNumber: "", workingDays: "", timings: "", department: "",
    profilePhotoUrl: "", medicalRegistrationUrl: "", clinicPhotoUrl: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Initialize from storage or user state
  useEffect(() => {
    const savedForm = sessionStorage.getItem(STORAGE_KEY_FORM);
    const savedStep = sessionStorage.getItem(STORAGE_KEY_STEP);
    
    if (savedForm) {
      try {
        const parsed = JSON.parse(savedForm);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (e) { console.error("Failed to parse saved onboarding data", e); }
    } else if (user?.name) {
      setFormData(prev => ({ ...prev, fullName: user.name }));
    }

    if (savedStep) {
      const s = parseInt(savedStep);
      if (s > 1 && s <= TOTAL_STEPS) setStep(s);
    }
  }, [user]);

  // 2. Save to storage on change
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY_FORM, JSON.stringify(formData));
    sessionStorage.setItem(STORAGE_KEY_STEP, step.toString());
  }, [formData, step]);

  // 3. Auto-redirect if already a DOCTOR with a complete profile
  useEffect(() => {
    if (isAuthenticated && user?.role === "DOCTOR" && user?.doctorId) {
      router.replace("/doctor/dashboard");
    }
  }, [isAuthenticated, user, router]);

  // ── STEP 1 AUTH LOGIC ────────────────────────────────────────────────
  
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
      if (!res.ok) throw new Error(data.error || "Failed to send OTP.");

      setAuthStep("otp");
    } catch (error: any) {
      console.error("Send OTP Error:", error);
      setAuthError(error.message || "Failed to send OTP.");
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
        body: JSON.stringify({ phone: authPhone, otp: authOtp, name: formData.fullName || "Doctor" }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");
      
      login(data.user);
      
      if (data.user.role === 'DOCTOR' && data.user.doctorId) {
        sessionStorage.removeItem(STORAGE_KEY_FORM);
        sessionStorage.removeItem(STORAGE_KEY_STEP);
        router.push("/doctor/dashboard");
      } else {
        setStep(2); 
      }
    } catch (error: any) {
      console.error("Verify OTP Error:", error);
      setAuthError(error.message || "Verification failed.");
    } finally {
      setIsAuthLoading(false);
    }
  };


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
          updateUser({ 
            role: "DOCTOR", 
            doctorId: data.doctor.id,
            name: data.user.name || formData.fullName
          });
          sessionStorage.removeItem(STORAGE_KEY_FORM);
          sessionStorage.removeItem(STORAGE_KEY_STEP);
          setStep(5);
        } else {
          setErrors({ submit: data.error || "Failed to submit onboarding." });
        }
      } catch (err) {
        setErrors({ submit: "A network error occurred." });
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
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col relative overflow-hidden">
      {/* ── Background Aesthetics ── */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-emerald-50/50 blur-[120px]" />
        <div className="absolute top-[20%] -left-[10%] w-[30%] h-[30%] rounded-full bg-blue-50/40 blur-[120px]" />
      </div>
      
      {/* Header */}
      <nav className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 sm:px-12 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
            <Logo />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black text-slate-900 leading-none">Partner Onboarding</span>
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-0.5">Professional Network</span>
          </div>
        </div>
        <Link href="/" className="text-[11px] font-black text-slate-400 hover:text-rose-500 transition-all uppercase tracking-widest flex items-center gap-2 group">
          Exit <span className="hidden sm:inline">Application</span> <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </nav>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12 md:py-16 relative z-10">
        
        {/* Progress System */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4 px-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Step {step} of 4</span>
            <span className="text-[11px] font-bold text-primary uppercase tracking-widest">{Math.round((step/4)*100)}% Complete</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(step/4)*100}%` }}
              className="h-full bg-primary"
            />
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-card rounded-[2rem] p-8 md:p-14 shadow-premium border border-border relative overflow-hidden">
          {/* Decorative Accent */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/50 rounded-bl-[5rem] -mr-16 -mt-16 pointer-events-none" />

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "circOut" }}
              className="relative z-10"
            >
              {/* Step 1: Personal & Verification */}
              {step === 1 && (
                <div className="space-y-10">
                  <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">Begin Your <br />Partnership</h1>
                    <p className="text-slate-500 font-bold mt-3 text-lg">Let&apos;s start with your professional identity.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="group">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3 block ml-1">Full Name (As per Council)</label>
                      <div className="relative">
                        <Input 
                          placeholder="Dr. Rajesh Kumar" 
                          value={formData.fullName}
                          onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                          className={`h-12 rounded-xl bg-card border-border focus:bg-card focus:ring-4 focus:ring-primary/10 focus:border-primary font-bold text-base transition-all ${errors.fullName ? 'border-destructive' : ''}`}
                        />
                      </div>
                      {errors.fullName && <p className="text-xs font-bold text-rose-500 mt-2 ml-1">{errors.fullName}</p>}
                    </div>

                    <div className="group">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3 block ml-1">Mobile Verification</label>
                      {!isAuthenticated ? (
                        <div className="space-y-4">
                          <div className="relative flex gap-2">
                            <Input 
                              placeholder="98765 43210" 
                              value={authPhone}
                              disabled={authStep === "otp"}
                              onChange={(e) => setAuthPhone(e.target.value.replace(/\D/g, ''))}
                              className="h-12 rounded-xl bg-card border-border focus:bg-card focus:ring-4 focus:ring-primary/10 focus:border-primary font-bold text-base transition-all"
                            />
                            {authStep === "phone" && (
                              <Button onClick={handleSendOtp} disabled={isAuthLoading || authPhone.length < 10} className="h-12 rounded-xl px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-sm">
                                {isAuthLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : "Verify"}
                              </Button>
                            )}
                          </div>
                          <AnimatePresence>
                            {authStep === "otp" && (
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }} 
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex gap-2"
                              >
                                <Input 
                                  placeholder="OTP Code" 
                                  value={authOtp}
                                  onChange={(e) => setAuthOtp(e.target.value.replace(/\D/g, ''))}
                                  className="h-12 rounded-xl bg-card border-primary/30 focus:bg-card focus:ring-4 focus:ring-primary/10 font-bold text-center tracking-widest text-lg"
                                  maxLength={6}
                                />
                                <Button onClick={handleVerifyOtp} disabled={isAuthLoading || authOtp.length < 6} className="h-12 rounded-xl px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-sm">
                                  {isAuthLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : "Confirm"}
                                </Button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                          {authError && <p className="text-xs font-bold text-rose-500 flex items-center gap-1.5 ml-1"><AlertCircle className="w-3.5 h-3.5" /> {authError}</p>}
                        </div>
                      ) : (
                        <div className="h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-between px-6 shadow-inner">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-emerald-600/60 uppercase tracking-widest">VERIFIED IDENTITY</span>
                            <span className="text-emerald-800 font-black">+91 {user?.phone}</span>
                          </div>
                          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                            <CheckCircle2 className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Professional Details */}
              {step === 2 && (
                <div className="space-y-10">
                  <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">Expertise & <br />Experience</h1>
                    <p className="text-slate-500 font-bold mt-3 text-lg">Define your professional clinical profile.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="group">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3 block ml-1">Primary Specialization</label>
                      <Input placeholder="e.g. Senior Cardiologist" value={formData.specialization} onChange={(e) => setFormData({...formData, specialization: e.target.value})} className="h-12 rounded-xl bg-card border-border focus:bg-card focus:ring-4 focus:ring-primary/10 focus:border-primary font-bold text-base transition-all" />
                      {errors.specialization && <p className="text-xs font-bold text-rose-500 mt-2 ml-1">{errors.specialization}</p>}
                    </div>
                    <div className="group">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3 block ml-1">Qualifications</label>
                      <Input placeholder="e.g. MBBS, MD (AIIMS)" value={formData.qualifications} onChange={(e) => setFormData({...formData, qualifications: e.target.value})} className="h-12 rounded-xl bg-card border-border focus:bg-card focus:ring-4 focus:ring-primary/10 focus:border-primary font-bold text-base transition-all" />
                      {errors.qualifications && <p className="text-xs font-bold text-rose-500 mt-2 ml-1">{errors.qualifications}</p>}
                    </div>
                    <div className="group">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3 block ml-1">Consultation Fee (₹)</label>
                      <Input type="number" placeholder="500" value={formData.fee} onChange={(e) => setFormData({...formData, fee: e.target.value})} className="h-12 rounded-xl bg-card border-border focus:bg-card focus:ring-4 focus:ring-primary/10 focus:border-primary font-bold text-base transition-all" />
                      {errors.fee && <p className="text-xs font-bold text-rose-500 mt-2 ml-1">{errors.fee}</p>}
                    </div>
                    <div className="group">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3 block ml-1">Years of Experience</label>
                      <Input type="number" placeholder="12" value={formData.experience} onChange={(e) => setFormData({...formData, experience: e.target.value})} className="h-12 rounded-xl bg-card border-border focus:bg-card focus:ring-4 focus:ring-primary/10 focus:border-primary font-bold text-base transition-all" />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Practice Type Selection */}
              {step === 3 && (
                <div className="space-y-12">
                   <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">Clinical <br />Environment</h1>
                    <p className="text-slate-500 font-bold mt-3 text-lg">Where will you be providing your services?</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <button 
                      onClick={() => setFormData({...formData, practiceType: "clinic"})} 
                      className={`group p-8 rounded-2xl border-2 transition-all text-left relative overflow-hidden ${formData.practiceType === "clinic" ? "bg-primary/5 border-primary shadow-md" : "bg-card border-border hover:border-primary/30 shadow-sm"}`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-colors ${formData.practiceType === "clinic" ? "bg-primary text-white" : "bg-slate-50 text-slate-400 group-hover:bg-slate-100"}`}>
                        <Building2 className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">Private Clinic</h3>
                      <p className="text-sm text-slate-500 font-medium mt-2 leading-relaxed">Direct practice management and dedicated scheduling.</p>
                      {formData.practiceType === "clinic" && <div className="absolute top-6 right-6 w-6 h-6 bg-primary rounded-full flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-white" /></div>}
                    </button>

                    <button 
                      onClick={() => setFormData({...formData, practiceType: "hospital"})} 
                      className={`group p-8 rounded-2xl border-2 transition-all text-left relative overflow-hidden ${formData.practiceType === "hospital" ? "bg-blue-50/50 border-blue-600 shadow-md" : "bg-card border-border hover:border-blue-600/30 shadow-sm"}`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-colors ${formData.practiceType === "hospital" ? "bg-blue-600 text-white" : "bg-slate-50 text-slate-400 group-hover:bg-slate-100"}`}>
                        <Hospital className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">Hospital Facility</h3>
                      <p className="text-sm text-slate-500 font-medium mt-2 leading-relaxed">Multi-specialty center consultation and ward management.</p>
                      {formData.practiceType === "hospital" && <div className="absolute top-6 right-6 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-white" /></div>}
                    </button>
                  </div>
                  {errors.practiceType && <p className="text-center text-sm font-black text-rose-500">{errors.practiceType}</p>}
                </div>
              )}

              {/* Step 4: Infrastructure & Location */}
              {step === 4 && (
                <div className="space-y-10">
                  <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">Infrastructure <br />Details</h1>
                    <p className="text-slate-500 font-bold mt-3 text-lg">Finalize your facility information for patient discovery.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="group md:col-span-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3 block ml-1">{formData.practiceType === 'clinic' ? 'CLINIC NAME' : 'HOSPITAL NAME'}</label>
                      <Input placeholder="The Heart Center" value={formData.practiceName} onChange={(e) => setFormData({...formData, practiceName: e.target.value})} className="h-12 rounded-xl bg-card border-border focus:bg-card focus:ring-4 focus:ring-primary/10 focus:border-primary font-bold text-base transition-all" />
                      {errors.practiceName && <p className="text-xs font-bold text-rose-500 mt-2 ml-1">{errors.practiceName}</p>}
                    </div>
                    <div className="group">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3 block ml-1">City</label>
                      <Input placeholder="Patna" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="h-12 rounded-xl bg-card border-border focus:bg-card focus:ring-4 focus:ring-primary/10 focus:border-primary font-bold text-base transition-all" />
                      {errors.city && <p className="text-xs font-bold text-rose-500 mt-2 ml-1">{errors.city}</p>}
                    </div>
                    <div className="group">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3 block ml-1">Locality</label>
                      <Input placeholder="Boring Road" value={formData.locality} onChange={(e) => setFormData({...formData, locality: e.target.value})} className="h-12 rounded-xl bg-card border-border focus:bg-card focus:ring-4 focus:ring-primary/10 focus:border-primary font-bold text-base transition-all" />
                      {errors.locality && <p className="text-xs font-bold text-rose-500 mt-2 ml-1">{errors.locality}</p>}
                    </div>
                  </div>

                  {errors.submit && (
                    <div className="p-5 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      <p className="text-sm font-black text-rose-900 leading-relaxed">{errors.submit}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Action Bar */}
              <div className="mt-16 flex items-center justify-between pt-12 border-t border-slate-100">
                {step > 1 ? (
                  <button 
                    onClick={handleBack} 
                    className="flex items-center gap-3 text-[11px] font-black text-slate-400 hover:text-slate-900 transition-all uppercase tracking-[0.2em] group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-slate-100 transition-colors">
                      <ArrowLeft className="w-5 h-5" />
                    </div>
                    PREVIOUS STEP
                  </button>
                ) : <div />}

                <Button 
                  onClick={handleNext} 
                  disabled={isSubmitting || (step === 1 && !isAuthenticated)} 
                  className="h-12 min-w-[220px] rounded-xl px-10 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-md active:scale-95 transition-all group relative overflow-hidden"
                >
                  <div className="relative z-10 flex items-center gap-3">
                    {isSubmitting ? (
                      <>Processing Submission <RefreshCw className="w-4 h-4 animate-spin" /></>
                    ) : (
                      <>
                        {step === 4 ? "Submit Application" : "Continue Journey"} 
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </div>
                  {/* Subtle inner glow */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Support Signal */}
        <div className="mt-12 text-center">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center justify-center gap-4">
            <span className="w-10 h-px bg-slate-200" />
            SECURED BY <ShieldCheck className="w-4 h-4 text-emerald-600" /> AES-256 ENCRYPTION
            <span className="w-10 h-px bg-slate-200" />
          </p>
        </div>
      </main>

      {/* ── SUCCESS STEP (MODAL) ── */}
      <AnimatePresence>
        {step === 5 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-emerald-900/40 backdrop-blur-xl flex items-center justify-center p-6 z-[100]"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              className="max-w-md w-full bg-white rounded-[3.5rem] p-12 md:p-16 shadow-[0_64px_128px_-32px_rgba(0,0,0,0.3)] text-center relative overflow-hidden"
            >
              {/* Success Burst Effect */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-32 bg-gradient-to-b from-emerald-50 to-transparent pointer-events-none" />
              
              <div className="w-24 h-24 bg-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-emerald-500/40 relative z-10 rotate-3">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
              
              <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight leading-tight relative z-10">Verification <br />Successful</h2>
              <p className="text-slate-500 font-bold mb-12 text-lg leading-relaxed relative z-10">Welcome to the future of healthcare. Your professional profile is now being processed.</p>
              
              <Button 
                onClick={() => router.push("/doctor/dashboard")} 
                className="w-full h-18 rounded-[1.5rem] bg-[#065F46] hover:bg-[#047857] text-white font-black text-xl shadow-2xl relative z-10 active:scale-95 transition-all"
              >
                Enter Dashboard
              </Button>

              <div className="mt-8 text-[11px] font-black text-slate-300 uppercase tracking-widest relative z-10">
                APPLICATION ID: JC-{Math.random().toString(36).substr(2, 9).toUpperCase()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


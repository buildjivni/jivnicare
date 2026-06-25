"use client";
import { Logo } from "@/features/marketing/components/brand/Logo";
import { useState, Suspense, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, CheckCircle2, ShieldCheck, RefreshCw, AlertCircle, Sparkles, Lock, UserCircle, Users, Briefcase, MapPin, Building, Activity, ArrowLeft,
  Clock, FileText, PhoneCall, Calendar, Check, HelpCircle, Upload, CheckSquare
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { PublicGuard } from "@/components/shared";
import { ImageUploadField } from "@/components/shared/ImageUploadField";
import { SessionProvider, useSession, signIn } from "next-auth/react";

const STANDARD_SPECIALTIES = [
  "General Physician",
  "Dentist",
  "Dermatologist & Cosmetologist",
  "Gynecologist & Obstetrician",
  "Pediatrician",
  "Orthopedic Surgeon",
  "ENT Specialist",
  "Ophthalmologist",
  "Cardiologist",
  "Diabetologist",
  "Psychiatrist & Psychologist",
  "Physiotherapist",
  "Neurologist",
  "Gastroenterologist",
  "Urologist",
  "Pulmonologist",
  "Endocrinologist",
  "Nephrologist",
  "Oncologist",
  "Rheumatologist",
  "Dietitian & Nutritionist",
  "Sexologist",
  "Hair & Skin Specialist",
  "Ayurvedic Doctor",
  "Homeopathic Doctor",
  "Unani Specialist",
  "Siddha Specialist",
  "Naturopath",
  "Geriatrician",
  "Emergency Medicine Specialist"
];

const MEDICAL_COUNCILS = [
  "Bihar Medical Council", "National Medical Commission (NMC)", "Medical Council of India (MCI)",
  "Delhi Medical Council", "Uttar Pradesh Medical Council", "West Bengal Medical Council", "Other State Medical Council"
];

const DAYS_OF_WEEK = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" }
];

function DoctorOnboardingFlowContent() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    fullName: "", gender: "", dateOfBirth: "", email: "", contactNumber: "",
    medicalRegistrationNumber: "", medicalCouncil: "Bihar Medical Council", registrationYear: "",
    speciality: "", experience: "", qualifications: "", lifetimePatientsDeclaration: "",
    practiceType: "clinic", practiceName: "", practiceAddress: "", city: "", state: "Bihar", district: "", pincode: "", locality: "",
    bio: "", languages: "Hindi, English", fee: "400",
    profilePhotoUrl: "", clinicPhotoUrl: "", emergencyAvailable: false,
    degreeCertificate: "", nmcCertificate: "",
    clinicPhotos: [] as string[],
    otherCertificates: [] as string[],
    operatorName: "", operatorMobile: "",
    receptionist1Name: "", receptionist1Phone: "",
    receptionist2Name: "", receptionist2Phone: "",
    receptionist3Name: "", receptionist3Phone: "",
    latitude: null as number | null, longitude: null as number | null,
    weeklySchedule: {
      monday: { isOpen: true, start: "09:00", end: "17:00", maxPatients: 20 },
      tuesday: { isOpen: true, start: "09:00", end: "17:00", maxPatients: 20 },
      wednesday: { isOpen: true, start: "09:00", end: "17:00", maxPatients: 20 },
      thursday: { isOpen: true, start: "09:00", end: "17:00", maxPatients: 20 },
      friday: { isOpen: true, start: "09:00", end: "17:00", maxPatients: 20 },
      saturday: { isOpen: true, start: "09:00", end: "17:00", maxPatients: 20 },
      sunday: { isOpen: false, start: "", end: "", maxPatients: 0 }
    },
    dailyPatientLimit: "30",
    emergencyFee: "500",
    bookingStartTime: "08:00",
    diseases: "",
    procedures: ""
  });

  // Prefill Google details if session is active
  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        email: session.user?.email || prev.email,
        fullName: prev.fullName || session.user?.name || ""
      }));
    }
  }, [session]);

  const [successMessage, setSuccessMessage] = useState("");
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
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
          );
          if (!res.ok) throw new Error("Failed to fetch address");
          const geo = await res.json();
          if (geo.error) throw new Error("Geocoding error");
          
          const addr = geo.address || {};
          setFormData(prev => ({
            ...prev, latitude, longitude,
            practiceAddress: geo.display_name || prev.practiceAddress,
            city: addr.city || addr.town || addr.village || addr.county || prev.city,
            state: addr.state || prev.state,
            district: addr.county || addr.state_district || addr.city || prev.district,
            locality: addr.suburb || addr.neighbourhood || addr.residential || addr.road || prev.locality,
            pincode: addr.postcode || prev.pincode,
          }));
          setGpsStatus('success');
        } catch {
          setFormData(prev => ({ ...prev, latitude, longitude }));
          setGpsStatus('error');
        } finally {
          setGpsLoading(false);
        }
      },
      () => { setGpsStatus('error'); setGpsLoading(false); },
      { timeout: 20000, enableHighAccuracy: false, maximumAge: 60000 }
    );
  };

  const handleDayToggle = (day: string) => {
    setFormData(prev => {
      const schedule = { ...prev.weeklySchedule } as any;
      const current = schedule[day];
      schedule[day] = {
        ...current,
        isOpen: !current.isOpen,
        start: !current.isOpen ? "09:00" : "",
        end: !current.isOpen ? "17:00" : "",
        maxPatients: !current.isOpen ? 20 : 0
      };
      return { ...prev, weeklySchedule: schedule };
    });
  };

  const handleTimeChange = (day: string, field: "start" | "end" | "maxPatients", value: any) => {
    setFormData(prev => {
      const schedule = { ...prev.weeklySchedule } as any;
      schedule[day] = {
        ...schedule[day],
        [field]: field === "maxPatients" ? parseInt(value) || 0 : value
      };
      return { ...prev, weeklySchedule: schedule };
    });
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;
    
    if (!session?.user) {
      newErrors.google = "You must link your Google Account first.";
      isValid = false;
    }
    if (!formData.fullName.trim() || formData.fullName.length < 3) {
      newErrors.fullName = "Legal Name is required.";
      isValid = false;
    }
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.contactNumber)) {
      newErrors.contactNumber = "Valid 10-digit Indian mobile number required.";
      isValid = false;
    }
    if (!formData.speciality) {
      newErrors.speciality = "Specialty selection is required.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;
    
    if (!formData.practiceName.trim()) { newErrors.practiceName = "Practice Name is required."; isValid = false; }
    if (!formData.practiceAddress.trim()) { newErrors.practiceAddress = "Clinic Address is required."; isValid = false; }
    if (!formData.locality.trim()) { newErrors.locality = "Locality is required."; isValid = false; }
    if (!formData.city.trim()) { newErrors.city = "City is required."; isValid = false; }
    if (!formData.pincode.trim() || !/^\d{6}$/.test(formData.pincode)) { newErrors.pincode = "Valid 6-digit Pincode is required."; isValid = false; }

    // Operator Details Validation
    if (!formData.operatorName.trim()) { newErrors.operatorName = "Operator / Owner Name is required."; isValid = false; }
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!formData.operatorMobile.trim() || !phoneRegex.test(formData.operatorMobile)) { 
      newErrors.operatorMobile = "Valid 10-digit Indian mobile number is required."; 
      isValid = false; 
    }

    // Optional Receptionists Validation
    if (formData.receptionist1Name.trim() || formData.receptionist1Phone.trim()) {
      if (!formData.receptionist1Name.trim()) { newErrors.receptionist1Name = "Name is required."; isValid = false; }
      if (!phoneRegex.test(formData.receptionist1Phone)) { newErrors.receptionist1Phone = "Valid 10-digit phone required."; isValid = false; }
    }
    if (formData.receptionist2Name.trim() || formData.receptionist2Phone.trim()) {
      if (!formData.receptionist2Name.trim()) { newErrors.receptionist2Name = "Name is required."; isValid = false; }
      if (!phoneRegex.test(formData.receptionist2Phone)) { newErrors.receptionist2Phone = "Valid 10-digit phone required."; isValid = false; }
    }
    if (formData.receptionist3Name.trim() || formData.receptionist3Phone.trim()) {
      if (!formData.receptionist3Name.trim()) { newErrors.receptionist3Name = "Name is required."; isValid = false; }
      if (!phoneRegex.test(formData.receptionist3Phone)) { newErrors.receptionist3Phone = "Valid 10-digit phone required."; isValid = false; }
    }

    setErrors(newErrors);
    return isValid;
  };

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;
    
    if (!formData.medicalRegistrationNumber.trim() || formData.medicalRegistrationNumber.length < 5) {
      newErrors.medicalRegistrationNumber = "Valid Registration Number is required.";
      isValid = false;
    }
    if (!formData.registrationYear) {
      newErrors.registrationYear = "Registration Year is required.";
      isValid = false;
    }
    if (!formData.gender) {
      newErrors.gender = "Gender is required.";
      isValid = false;
    }
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Date of Birth is required.";
      isValid = false;
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Valid email is required.";
      isValid = false;
    }
    if (!formData.experience) {
      newErrors.experience = "Years of experience is required.";
      isValid = false;
    }
    if (!formData.qualifications.trim()) {
      newErrors.qualifications = "Qualifications are required.";
      isValid = false;
    }
    if (!formData.degreeCertificate) {
      newErrors.degreeCertificate = "Degree Certificate upload is required.";
      isValid = false;
    }
    if (!formData.nmcCertificate) {
      newErrors.nmcCertificate = "NMC Certificate upload is required.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const validateStep4 = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (!formData.dailyPatientLimit || parseInt(formData.dailyPatientLimit) < 1 || parseInt(formData.dailyPatientLimit) > 100) {
      newErrors.dailyPatientLimit = "Daily patient limit must be between 1 and 100.";
      isValid = false;
    }

    if (!formData.fee || parseInt(formData.fee) < 0 || parseInt(formData.fee) > 2000) {
      newErrors.fee = "Consultation fee must be between ₹0 and ₹2000.";
      isValid = false;
    }

    if (formData.emergencyAvailable) {
      if (!formData.emergencyFee || parseInt(formData.emergencyFee) < 0 || parseInt(formData.emergencyFee) > 2000) {
        newErrors.emergencyFee = "Emergency fee must be between ₹0 and ₹2000.";
        isValid = false;
      }
    }

    if (!formData.bookingStartTime) {
      newErrors.bookingStartTime = "Booking start time is required.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const nextStep = async (currentStep: number) => {
    setErrors({});
    let isValid = false;
    if (currentStep === 1) {
      isValid = validateStep1();
      if (isValid) {
        setIsSubmitting(true);
        try {
          const res = await fetch("/api/doctor/onboard/step1", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fullName: formData.fullName,
              contactNumber: formData.contactNumber,
              speciality: formData.speciality,
            })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Failed to save step 1.");
          setStep(2);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err: any) {
          setErrors({ submit: err.message || "Failed to proceed." });
        } finally {
          setIsSubmitting(false);
        }
      }
    } else if (currentStep === 2) {
      isValid = validateStep2();
      if (isValid) {
        setIsSubmitting(true);
        try {
          const res = await fetch("/api/doctor/onboard/step2", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              practiceName: formData.practiceName,
              practiceAddress: formData.practiceAddress,
              locality: formData.locality,
              district: formData.district,
              city: formData.city,
              state: formData.state,
              pincode: formData.pincode,
              latitude: formData.latitude,
              longitude: formData.longitude,
            })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Failed to save step 2.");
          setStep(3);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err: any) {
          setErrors({ submit: err.message || "Failed to proceed." });
        } finally {
          setIsSubmitting(false);
        }
      }
    } else if (currentStep === 3) {
      isValid = validateStep3();
      if (isValid) {
        setIsSubmitting(true);
        try {
          const res = await fetch("/api/doctor/onboard/step3", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              qualifications: formData.qualifications,
              experience: parseInt(String(formData.experience), 10),
              medicalRegistrationNumber: formData.medicalRegistrationNumber,
              medicalCouncil: formData.medicalCouncil,
              registrationYear: parseInt(String(formData.registrationYear), 10),
              specialization: formData.speciality,
              degreeCertificate: formData.degreeCertificate,
              nmcCertificate: formData.nmcCertificate,
              clinicPhotos: formData.clinicPhotos,
              otherCertificates: formData.otherCertificates,
              languages: formData.languages,
              bio: formData.bio,
              gender: formData.gender || null,
              dateOfBirth: formData.dateOfBirth || null,
              email: session?.user?.email || formData.email || null,
              lifetimePatientsDeclaration: formData.lifetimePatientsDeclaration ? parseInt(String(formData.lifetimePatientsDeclaration), 10) : null,
            })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Failed to save step 3.");
          setStep(4);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err: any) {
          setErrors({ submit: err.message || "Failed to proceed." });
        } finally {
          setIsSubmitting(false);
        }
      }
    }
  };

  const prevStep = () => {
    setStep(prev => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const finalSubmit = async () => {
    if (!validateStep4()) return;
    setIsSubmitting(true);
    setErrors({});
    try {
      const res = await fetch("/api/doctor/onboard/step4", {
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({
          weeklySchedule: formData.weeklySchedule,
          dailyPatientLimit: parseInt(formData.dailyPatientLimit),
          consultationFee: parseInt(formData.fee),
          emergencyAvailable: formData.emergencyAvailable,
          emergencyFee: formData.emergencyAvailable ? parseInt(formData.emergencyFee) : null,
          bookingStartTime: formData.bookingStartTime,
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit.");
      
      setSuccessMessage(data.message || "Registration submitted. Our team will verify your profile within 24-48 hours.");
      setStep(5);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setErrors({ submit: err.message || "Network error. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EEF7FC] via-white to-[#F2FAF6] font-sans selection:bg-sky-500/20 selection:text-sky-900 relative pb-24 flex flex-col">
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[10%] left-[10%] w-[550px] h-[550px] rounded-full bg-[#5298D2]/5 blur-[130px] opacity-70" />
        <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] rounded-full bg-[#489C66]/5 blur-[130px] opacity-70" />
      </div>

      <header className="w-full bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 px-6 py-4 shadow-sm shadow-slate-100/30">
        <div className="max-w-5xl mx-auto flex items-center justify-between w-full">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md group-hover:scale-105 transition-transform bg-white border border-sky-100 p-1.5 flex items-center justify-center">
              <Logo className="w-8 h-8" />
            </div>
            <span className="text-xl font-black tracking-tight leading-none">
              <span style={{ color: '#4A90D9' }}>Jivni</span><span style={{ color: '#4A8C4A' }}>Care</span>
            </span>
          </Link>
          <Link href="/partners/login" className="px-5 py-2.5 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-600 hover:text-[#5298D2] hover:border-sky-200 shadow-sm transition-all flex items-center gap-2">
            Already a partner? <span className="text-[#5298D2] font-black">Sign In</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 mt-12 relative z-10">
        <div className="bg-white/95 rounded-[32px] border border-slate-200/80 shadow-2xl shadow-sky-100/30 backdrop-blur-md overflow-hidden relative">
          <div className="flex flex-col items-center pt-10 pb-8 px-6 border-b border-slate-100 bg-slate-50/30">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight text-center">
              Doctor Registration Portal
            </h1>
            <p className="text-slate-500 text-sm font-medium mt-1.5 text-center max-w-lg leading-relaxed">
              Verify your medical credentials to activate your dynamic clinical queue system. NMC & State Council Compliant.
            </p>
          </div>

          {/* Stepper Progress */}
          {step <= 4 && (
            <div className="bg-slate-50/50 border-b border-slate-100 py-6 px-6 md:px-8 flex justify-start md:justify-center overflow-x-auto">
              <div className="flex items-center gap-2 md:gap-4 w-full max-w-3xl justify-between min-w-[500px]">
                {[
                  { num: 1, label: 'Google & Basic', icon: UserCircle },
                  { num: 2, label: 'Clinic Info', icon: Building },
                  { num: 3, label: 'Credentials', icon: Briefcase },
                  { num: 4, label: 'Op Hours', icon: Calendar }
                ].map((s, idx) => {
                  const Icon = s.icon;
                  const isActive = step === s.num;
                  const isCompleted = step > s.num;
                  return (
                    <div key={s.num} className="flex items-center gap-2">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                        isCompleted ? 'bg-[#489C66] text-white shadow-md shadow-emerald-600/10' :
                        isActive ? 'bg-[#5298D2] text-white shadow-md shadow-sky-600/20 ring-4 ring-sky-100 scale-105' :
                        'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}>
                        {isCompleted ? <Check className="w-5 h-5 text-white" /> : <Icon className="w-4.5 h-4.5" />}
                      </div>
                      <div>
                        <p className={`text-xs font-black leading-none ${
                          isActive ? 'text-slate-800' : isCompleted ? 'text-slate-500' : 'text-slate-400'
                        }`}>Step {s.num}</p>
                        <p className={`text-[10px] font-semibold mt-0.5 whitespace-nowrap ${
                          isActive ? 'text-slate-500' : isCompleted ? 'text-slate-400' : 'text-slate-350'
                        }`}>{s.label}</p>
                      </div>
                      {idx < 3 && (
                        <div className={`w-6 h-[2px] rounded ${
                          step > s.num ? 'bg-[#489C66]' : 'bg-slate-200'
                        } ml-2`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="p-6 md:p-10">
            <AnimatePresence mode="wait">
              {/* STEP 1: Basic Info & Google OAuth linking */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                  <div className="mb-8">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-100 text-sky-800 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                      <Lock className="w-3.5 h-3.5" /> Authentication Setup
                    </span>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Step 1: Account Authentication</h2>
                    <p className="text-slate-500 font-medium mt-2">Link your Google Account for secure sign-in.</p>
                  </div>

                  {errors.submit && (
                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      <p className="text-sm font-bold text-rose-800">{errors.submit}</p>
                    </div>
                  )}

                  {/* Google OAuth Link Card */}
                  <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                        {session?.user ? (
                          <Check className="w-6 h-6 text-emerald-500" />
                        ) : (
                          <svg className="w-6 h-6 fill-current text-slate-500" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">Google OAuth Verification</h3>
                        <p className="text-xs text-slate-500 font-medium">
                          {session?.user 
                            ? `Linked as ${session.user.email}` 
                            : "Secure your clinical dashboard login"}
                        </p>
                      </div>
                    </div>
                    
                    {!session?.user ? (
                      <Button
                        type="button"
                        onClick={() => signIn("google")}
                        className="bg-[#205E98] hover:bg-[#1a4d7d] text-white font-bold rounded-xl h-11 px-5 flex items-center gap-2 shadow-md shadow-[#205E98]/10 transition-all"
                      >
                        Link Google Account
                      </Button>
                    ) : (
                      <span className="px-4 py-1.5 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" /> Google Linked
                      </span>
                    )}
                  </div>
                  {errors.google && <p className="text-xs font-bold text-rose-500 text-center">{errors.google}</p>}

                  {/* Basic User Details Form */}
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                        <UserCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">Personal Information</h3>
                        <p className="text-xs text-slate-500 font-medium">As shown in your medical council certificate.</p>
                      </div>
                    </div>
                    <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-bold text-slate-700">Full Legal Name</label>
                        <Input 
                          placeholder="Dr. Rajesh Kumar" 
                          value={formData.fullName} 
                          onChange={(e) => setFormData({...formData, fullName: e.target.value.replace(/[^a-zA-Z. ]*/g, '')})} 
                          className={`h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all ${errors.fullName ? 'border-rose-500' : ''}`} 
                        />
                        {errors.fullName && <p className="text-[10px] font-bold text-rose-500">{errors.fullName}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">Registered Indian Mobile Number</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-800 text-sm">+91</span>
                          <Input 
                            placeholder="9876543210" 
                            value={formData.contactNumber} 
                            maxLength={10} 
                            onChange={(e) => setFormData({...formData, contactNumber: e.target.value.replace(/[^0-9]/g, '')})} 
                            className={`h-12 pl-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all ${errors.contactNumber ? 'border-rose-500' : ''}`} 
                          />
                        </div>
                        {errors.contactNumber && <p className="text-[10px] font-bold text-rose-500">{errors.contactNumber}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">Primary Specialty</label>
                        <select 
                          value={formData.speciality} 
                          onChange={(e) => setFormData({...formData, speciality: e.target.value})} 
                          className={`h-12 w-full rounded-xl bg-slate-50 border border-slate-200 px-4 text-sm focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all ${errors.speciality ? 'border-rose-500' : ''}`}
                        >
                          <option value="">Select Specialty</option>
                          {STANDARD_SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        {errors.speciality && <p className="text-[10px] font-bold text-rose-500">{errors.speciality}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end pt-6">
                    <Button 
                      type="button" 
                      onClick={() => nextStep(1)} 
                      className="h-14 px-8 w-full sm:w-auto rounded-2xl font-bold bg-[#5298D2] hover:bg-[#3d83bd] text-white flex items-center justify-center gap-2 shadow-lg shadow-sky-600/10 transition-all"
                    >
                      Save &amp; Continue <ArrowRight className="w-5 h-5" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Clinic & Owner Information */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                  <div className="mb-8">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                      <Building className="w-3.5 h-3.5" /> Practice Location
                    </span>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Step 2: Clinic Information</h2>
                    <p className="text-slate-500 font-medium mt-2">Enter your practice location details to enable patient search.</p>
                  </div>

                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                          <Building className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900">Clinic Location Details</h3>
                          <p className="text-xs text-slate-500 font-medium">Enable GPS to automatically fill location coordinates.</p>
                        </div>
                      </div>
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
                        ) : (
                          <><MapPin className="w-3.5 h-3.5" /> Use GPS</>
                        )}
                      </button>
                    </div>

                    <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-bold text-slate-700">Clinic / Practice Name</label>
                        <Input 
                          placeholder="e.g. City Care Clinic" 
                          value={formData.practiceName} 
                          onChange={(e) => setFormData({...formData, practiceName: e.target.value})} 
                          className={`h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all ${errors.practiceName ? 'border-rose-500' : ''}`} 
                        />
                        {errors.practiceName && <p className="text-[10px] font-bold text-rose-500">{errors.practiceName}</p>}
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-bold text-slate-700">Full Address</label>
                        <Input 
                          placeholder="e.g. Shop No. 5, Ground Floor, Boring Road" 
                          value={formData.practiceAddress} 
                          onChange={(e) => setFormData({...formData, practiceAddress: e.target.value})} 
                          className={`h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all ${errors.practiceAddress ? 'border-rose-500' : ''}`} 
                        />
                        {errors.practiceAddress && <p className="text-[10px] font-bold text-rose-500">{errors.practiceAddress}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">Locality</label>
                        <Input 
                          placeholder="e.g. Kidwaipuri" 
                          value={formData.locality} 
                          onChange={(e) => setFormData({...formData, locality: e.target.value})} 
                          className={`h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all ${errors.locality ? 'border-rose-500' : ''}`} 
                        />
                        {errors.locality && <p className="text-[10px] font-bold text-rose-500">{errors.locality}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">City</label>
                        <Input 
                          placeholder="Enter city" 
                          value={formData.city} 
                          onChange={(e) => setFormData({...formData, city: e.target.value})} 
                          className={`h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all ${errors.city ? 'border-rose-500' : ''}`} 
                        />
                        {errors.city && <p className="text-[10px] font-bold text-rose-500">{errors.city}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">District (Bihar)</label>
                        <Input 
                          placeholder="e.g. Patna" 
                          value={formData.district} 
                          onChange={(e) => setFormData({...formData, district: e.target.value})} 
                          className="h-12 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all" 
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">Pincode</label>
                        <Input 
                          placeholder="e.g. 800001" 
                          value={formData.pincode} 
                          maxLength={6} 
                          onChange={(e) => setFormData({...formData, pincode: e.target.value.replace(/[^0-9]/g, '')})} 
                          className={`h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all ${errors.pincode ? 'border-rose-500' : ''}`} 
                        />
                        {errors.pincode && <p className="text-[10px] font-bold text-rose-500">{errors.pincode}</p>}
                      </div>

                      {/* Owner / Operator Details */}
                      <div className="col-span-1 md:col-span-2 border-t border-slate-100 pt-6 mt-4">
                        <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
                          <UserCircle className="w-5 h-5 text-[#5298D2]" /> Clinic Owner / Operator Details
                        </h4>
                        <p className="text-xs text-slate-400 font-medium mt-1">Provide the name and contact details of the primary operator responsible for this account.</p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">Operator / Owner Full Name</label>
                        <Input 
                          placeholder="e.g. Rajesh Kumar" 
                          value={formData.operatorName} 
                          onChange={(e) => setFormData({...formData, operatorName: e.target.value})} 
                          className={`h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all ${errors.operatorName ? 'border-rose-500' : ''}`} 
                        />
                        {errors.operatorName && <p className="text-[10px] font-bold text-rose-500">{errors.operatorName}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">Operator / Owner Mobile No.</label>
                        <Input 
                          placeholder="e.g. 9876543210" 
                          value={formData.operatorMobile} 
                          maxLength={10}
                          onChange={(e) => setFormData({...formData, operatorMobile: e.target.value.replace(/[^0-9]/g, '')})} 
                          className={`h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all ${errors.operatorMobile ? 'border-rose-500' : ''}`} 
                        />
                        {errors.operatorMobile && <p className="text-[10px] font-bold text-rose-500">{errors.operatorMobile}</p>}
                      </div>

                      {/* Receptionists Details */}
                      <div className="col-span-1 md:col-span-2 border-t border-slate-100 pt-6 mt-4">
                        <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
                          <Users className="w-5 h-5 text-[#489C66]" /> Receptionists & Staff (Optional, max 3)
                        </h4>
                        <p className="text-xs text-slate-400 font-medium mt-1">Add details of staff members who will operate the queue manager and patient list.</p>
                      </div>

                      {/* Receptionist 1 */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">Receptionist 1 Name</label>
                        <Input 
                          placeholder="Name of staff 1" 
                          value={formData.receptionist1Name} 
                          onChange={(e) => setFormData({...formData, receptionist1Name: e.target.value})} 
                          className={`h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all ${errors.receptionist1Name ? 'border-rose-500' : ''}`} 
                        />
                        {errors.receptionist1Name && <p className="text-[10px] font-bold text-rose-500">{errors.receptionist1Name}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">Receptionist 1 Phone</label>
                        <Input 
                          placeholder="Phone of staff 1" 
                          value={formData.receptionist1Phone} 
                          maxLength={10}
                          onChange={(e) => setFormData({...formData, receptionist1Phone: e.target.value.replace(/[^0-9]/g, '')})} 
                          className={`h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all ${errors.receptionist1Phone ? 'border-rose-500' : ''}`} 
                        />
                        {errors.receptionist1Phone && <p className="text-[10px] font-bold text-rose-500">{errors.receptionist1Phone}</p>}
                      </div>

                      {/* Receptionist 2 */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">Receptionist 2 Name</label>
                        <Input 
                          placeholder="Name of staff 2" 
                          value={formData.receptionist2Name} 
                          onChange={(e) => setFormData({...formData, receptionist2Name: e.target.value})} 
                          className={`h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all ${errors.receptionist2Name ? 'border-rose-500' : ''}`} 
                        />
                        {errors.receptionist2Name && <p className="text-[10px] font-bold text-rose-500">{errors.receptionist2Name}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">Receptionist 2 Phone</label>
                        <Input 
                          placeholder="Phone of staff 2" 
                          value={formData.receptionist2Phone} 
                          maxLength={10}
                          onChange={(e) => setFormData({...formData, receptionist2Phone: e.target.value.replace(/[^0-9]/g, '')})} 
                          className={`h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all ${errors.receptionist2Phone ? 'border-rose-500' : ''}`} 
                        />
                        {errors.receptionist2Phone && <p className="text-[10px] font-bold text-rose-500">{errors.receptionist2Phone}</p>}
                      </div>

                      {/* Receptionist 3 */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">Receptionist 3 Name</label>
                        <Input 
                          placeholder="Name of staff 3" 
                          value={formData.receptionist3Name} 
                          onChange={(e) => setFormData({...formData, receptionist3Name: e.target.value})} 
                          className={`h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all ${errors.receptionist3Name ? 'border-rose-500' : ''}`} 
                        />
                        {errors.receptionist3Name && <p className="text-[10px] font-bold text-rose-500">{errors.receptionist3Name}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">Receptionist 3 Phone</label>
                        <Input 
                          placeholder="Phone of staff 3" 
                          value={formData.receptionist3Phone} 
                          maxLength={10}
                          onChange={(e) => setFormData({...formData, receptionist3Phone: e.target.value.replace(/[^0-9]/g, '')})} 
                          className={`h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all ${errors.receptionist3Phone ? 'border-rose-500' : ''}`} 
                        />
                        {errors.receptionist3Phone && <p className="text-[10px] font-bold text-rose-500">{errors.receptionist3Phone}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6">
                    <Button 
                      type="button" 
                      onClick={prevStep} 
                      className="h-14 px-6 rounded-xl font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 flex items-center gap-2 transition-all"
                    >
                      <ArrowLeft className="w-5 h-5" /> Back
                    </Button>
                    <Button 
                      type="button" 
                      onClick={() => nextStep(2)} 
                      className="h-14 px-8 w-full sm:w-auto rounded-2xl font-bold bg-[#5298D2] hover:bg-[#3d83bd] text-white flex items-center justify-center gap-2 shadow-lg shadow-sky-600/10 transition-all"
                    >
                      Save &amp; Continue <ArrowRight className="w-5 h-5" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Professional Credentials & Verification Documents */}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                  <div className="mb-8">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                      <Briefcase className="w-3.5 h-3.5" /> Professional Credentials
                    </span>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Step 3: Medical Credentials &amp; Documents</h2>
                    <p className="text-slate-500 font-medium mt-2">Provide your license registration details for council verification.</p>
                  </div>

                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">Medical Registration Info</h3>
                        <p className="text-xs text-slate-500 font-medium">Required for partner verification.</p>
                      </div>
                    </div>
                    <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">Medical Registration No.</label>
                        <Input 
                          placeholder="e.g. BMC-12345" 
                          value={formData.medicalRegistrationNumber} 
                          onChange={(e) => setFormData({...formData, medicalRegistrationNumber: e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '')})} 
                          className={`h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all ${errors.medicalRegistrationNumber ? 'border-rose-500' : ''}`} 
                        />
                        {errors.medicalRegistrationNumber && <p className="text-[10px] font-bold text-rose-500">{errors.medicalRegistrationNumber}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">Medical Council</label>
                        <select 
                          value={formData.medicalCouncil} 
                          onChange={(e) => setFormData({...formData, medicalCouncil: e.target.value})} 
                          className="h-12 w-full rounded-xl bg-slate-50 border border-slate-200 px-4 text-sm focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all"
                        >
                          {MEDICAL_COUNCILS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">Registration Year</label>
                        <Input 
                          type="number" 
                          placeholder="e.g. 2015" 
                          value={formData.registrationYear} 
                          onChange={(e) => setFormData({...formData, registrationYear: e.target.value})} 
                          className={`h-12 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all ${errors.registrationYear ? 'border-rose-500' : ''}`} 
                        />
                        {errors.registrationYear && <p className="text-[10px] font-bold text-rose-500">{errors.registrationYear}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">Gender</label>
                        <select 
                          value={formData.gender} 
                          onChange={(e) => setFormData({...formData, gender: e.target.value})} 
                          className={`h-12 w-full rounded-xl bg-slate-50 border border-slate-200 px-4 text-sm focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all ${errors.gender ? 'border-rose-500' : ''}`}
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                        {errors.gender && <p className="text-[10px] font-bold text-rose-500">{errors.gender}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">Date of Birth</label>
                        <Input 
                          type="date" 
                          value={formData.dateOfBirth} 
                          onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})} 
                          className={`h-12 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all ${errors.dateOfBirth ? 'border-rose-500' : ''}`} 
                        />
                        {errors.dateOfBirth && <p className="text-[10px] font-bold text-rose-500">{errors.dateOfBirth}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">Contact Email</label>
                        <Input 
                          type="email" 
                          placeholder="doctor@gmail.com" 
                          value={formData.email} 
                          onChange={(e) => setFormData({...formData, email: e.target.value})} 
                          className={`h-12 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all ${errors.email ? 'border-rose-500' : ''}`} 
                        />
                        {errors.email && <p className="text-[10px] font-bold text-rose-500">{errors.email}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">Years of Experience</label>
                        <Input 
                          type="number" 
                          placeholder="e.g. 8" 
                          value={formData.experience} 
                          onChange={(e) => setFormData({...formData, experience: e.target.value})} 
                          className={`h-12 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all ${errors.experience ? 'border-rose-500' : ''}`} 
                        />
                        {errors.experience && <p className="text-[10px] font-bold text-rose-500">{errors.experience}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">Qualifications</label>
                        <Input 
                          placeholder="e.g. MBBS, MD" 
                          value={formData.qualifications} 
                          onChange={(e) => setFormData({...formData, qualifications: e.target.value})} 
                          className={`h-12 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all ${errors.qualifications ? 'border-rose-500' : ''}`} 
                        />
                        {errors.qualifications && <p className="text-[10px] font-bold text-rose-500">{errors.qualifications}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">Historical Career Patients Count (Declared)</label>
                        <Input 
                          type="number"
                          placeholder="e.g. 5000" 
                          value={formData.lifetimePatientsDeclaration} 
                          onChange={(e) => setFormData({...formData, lifetimePatientsDeclaration: e.target.value})} 
                          className="h-12 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all" 
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">Languages Spoken</label>
                        <Input 
                          placeholder="e.g. Hindi, English" 
                          value={formData.languages} 
                          onChange={(e) => setFormData({...formData, languages: e.target.value})} 
                          className="h-12 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all" 
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-bold text-slate-700">Brief Bio</label>
                        <textarea 
                          rows={4} 
                          placeholder="Describe your practice, expertise, and treatments..." 
                          value={formData.bio} 
                          onChange={(e) => setFormData({...formData, bio: e.target.value})} 
                          className="w-full rounded-xl bg-slate-50 border border-slate-200 p-4 text-sm focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all resize-none" 
                        />
                      </div>

                      {/* Diseases and Procedures */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">Treatments & Diseases Focus (Comma-separated)</label>
                        <Input 
                          placeholder="e.g. Diabetes, Hypertension, Typhoid, Fever" 
                          value={formData.diseases} 
                          onChange={(e) => setFormData({...formData, diseases: e.target.value})} 
                          className="h-12 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all" 
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">Procedures Performed (Comma-separated)</label>
                        <Input 
                          placeholder="e.g. ECG, Dressing, Nebulization, Vaccination" 
                          value={formData.procedures} 
                          onChange={(e) => setFormData({...formData, procedures: e.target.value})} 
                          className="h-12 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all" 
                        />
                      </div>

                      {/* Photo Upload Fields */}
                      <div className="col-span-1 md:col-span-2 border-t border-slate-100 pt-6 mt-4">
                        <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
                          Profile & Verification Documents
                        </h4>
                      </div>

                      <ImageUploadField
                        label="Profile Photo (Formal)"
                        value={formData.profilePhotoUrl}
                        onChange={(url) => setFormData({ ...formData, profilePhotoUrl: url })}
                        filenamePrefix="doctor-profile"
                        aspectRatio={1}
                      />

                      <ImageUploadField
                        label="Degree Certificate (Required)"
                        value={formData.degreeCertificate}
                        onChange={(url) => setFormData({ ...formData, degreeCertificate: url })}
                        filenamePrefix="degree-certificate"
                        aspectRatio={4/3}
                      />
                      {errors.degreeCertificate && <p className="text-[10px] font-bold text-rose-500 col-span-1 md:col-span-2">{errors.degreeCertificate}</p>}

                      <ImageUploadField
                        label="NMC Certificate (Required)"
                        value={formData.nmcCertificate}
                        onChange={(url) => setFormData({ ...formData, nmcCertificate: url })}
                        filenamePrefix="nmc-certificate"
                        aspectRatio={4/3}
                      />
                      {errors.nmcCertificate && <p className="text-[10px] font-bold text-rose-500 col-span-1 md:col-span-2">{errors.nmcCertificate}</p>}

                      {/* Multi Clinic Gallery Photos */}
                      <div className="col-span-1 md:col-span-2 space-y-2 border-t border-slate-100 pt-6 mt-4">
                        <label className="text-xs font-black text-slate-800">Clinic Board / Gallery Photos (Max 3)</label>
                        <p className="text-xs text-slate-400 font-medium">Upload up to 3 photos of your clinic interior, exterior or board.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                          {[0, 1, 2].map((idx) => (
                            <ImageUploadField
                              key={idx}
                              label={`Clinic Photo ${idx + 1}`}
                              value={formData.clinicPhotos[idx] || ""}
                              onChange={(url) => {
                                const updated = [...formData.clinicPhotos];
                                updated[idx] = url;
                                setFormData({ ...formData, clinicPhotos: updated });
                              }}
                              filenamePrefix={`clinic-photo-${idx}`}
                              aspectRatio={16/9}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Multi Other Certificates */}
                      <div className="col-span-1 md:col-span-2 space-y-2 border-t border-slate-100 pt-6 mt-4">
                        <label className="text-xs font-black text-slate-800">Other Certificates & Degrees (Optional, Max 10)</label>
                        <p className="text-xs text-slate-400 font-medium">Upload copies of any other fellowships, training certificates, or awards.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mt-2">
                          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((idx) => (
                            <ImageUploadField
                              key={idx}
                              label={`Cert ${idx + 1}`}
                              value={formData.otherCertificates[idx] || ""}
                              onChange={(url) => {
                                const updated = [...formData.otherCertificates];
                                updated[idx] = url;
                                setFormData({ ...formData, otherCertificates: updated });
                              }}
                              filenamePrefix={`other-certificate-${idx}`}
                              aspectRatio={4/3}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6">
                    <Button 
                      type="button" 
                      onClick={prevStep} 
                      className="h-14 px-6 rounded-xl font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 flex items-center gap-2 transition-all"
                    >
                      <ArrowLeft className="w-5 h-5" /> Back
                    </Button>
                    <Button 
                      type="button" 
                      onClick={() => nextStep(3)} 
                      className="h-14 px-8 w-full sm:w-auto rounded-2xl font-bold bg-[#5298D2] hover:bg-[#3d83bd] text-white flex items-center justify-center gap-2 shadow-lg shadow-sky-600/10 transition-all"
                    >
                      Save &amp; Continue <ArrowRight className="w-5 h-5" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: Availability Schedule */}
              {step === 4 && (
                <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                  <div className="mb-8">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                      <Calendar className="w-3.5 h-3.5" /> Working Schedule
                    </span>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Step 4: Availability &amp; OPD Timings</h2>
                    <p className="text-slate-500 font-medium mt-2">Set your clinical opening hours and daily patient limits.</p>
                  </div>

                  {errors.submit && (
                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      <p className="text-sm font-bold text-rose-800">{errors.submit}</p>
                    </div>
                  )}

                  {/* Weekly Hours Grid */}
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50">
                      <h3 className="font-bold text-slate-900">OPD Weekly Timings</h3>
                      <p className="text-xs text-slate-500 font-medium">Configure days and capacity limits.</p>
                    </div>

                    <div className="divide-y divide-slate-100 p-6 md:p-8 space-y-4">
                      {DAYS_OF_WEEK.map((day) => {
                        const daySched = (formData.weeklySchedule as any)[day.key];
                        return (
                          <div key={day.key} className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                            <div className="flex items-center gap-3 min-w-[120px]">
                              <input 
                                type="checkbox"
                                checked={daySched.isOpen}
                                onChange={() => handleDayToggle(day.key)}
                                className="w-5 h-5 rounded text-[#5298D2] border-slate-350 focus:ring-[#5298D2] cursor-pointer"
                              />
                              <span className="font-bold text-sm text-slate-800">{day.label}</span>
                            </div>

                            {daySched.isOpen ? (
                              <div className="flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Start</span>
                                  <Input 
                                    type="time" 
                                    value={daySched.start} 
                                    onChange={(e) => handleTimeChange(day.key, "start", e.target.value)} 
                                    className="h-10 w-28 text-sm rounded-xl border-slate-200"
                                  />
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">End</span>
                                  <Input 
                                    type="time" 
                                    value={daySched.end} 
                                    onChange={(e) => handleTimeChange(day.key, "end", e.target.value)} 
                                    className="h-10 w-28 text-sm rounded-xl border-slate-200"
                                  />
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Max Patients</span>
                                  <Input 
                                    type="number" 
                                    value={daySched.maxPatients} 
                                    onChange={(e) => handleTimeChange(day.key, "maxPatients", e.target.value)} 
                                    className="h-10 w-20 text-sm rounded-xl border-slate-200 text-center"
                                  />
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-lg">Closed</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Additional Operations & Fees */}
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 space-y-6">
                    <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-3">Pricing &amp; Operational Rules</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">Consultation Fee (₹0 - ₹2000)</label>
                        <Input 
                          type="number" 
                          placeholder="e.g. 400" 
                          value={formData.fee} 
                          onChange={(e) => setFormData({...formData, fee: e.target.value})} 
                          className={`h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all ${errors.fee ? 'border-rose-500' : ''}`} 
                        />
                        {errors.fee && <p className="text-[10px] font-bold text-rose-500">{errors.fee}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">Daily Patient Limit (1 - 100)</label>
                        <Input 
                          type="number" 
                          placeholder="e.g. 30" 
                          value={formData.dailyPatientLimit} 
                          onChange={(e) => setFormData({...formData, dailyPatientLimit: e.target.value})} 
                          className={`h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all ${errors.dailyPatientLimit ? 'border-rose-500' : ''}`} 
                        />
                        {errors.dailyPatientLimit && <p className="text-[10px] font-bold text-rose-500">{errors.dailyPatientLimit}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">Online Booking Start Time</label>
                        <Input 
                          type="time" 
                          value={formData.bookingStartTime} 
                          onChange={(e) => setFormData({...formData, bookingStartTime: e.target.value})} 
                          className={`h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all ${errors.bookingStartTime ? 'border-rose-500' : ''}`} 
                        />
                        {errors.bookingStartTime && <p className="text-[10px] font-bold text-rose-500">{errors.bookingStartTime}</p>}
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-6 space-y-4">
                      <label className="flex items-center justify-between cursor-pointer">
                        <div>
                          <span className="font-bold text-slate-800">Support Emergency / Trauma Consultations?</span>
                          <p className="text-xs text-slate-500 mt-1">If enabled, emergency tokens will bypass standard queue waitlists.</p>
                        </div>
                        <div 
                          onClick={() => setFormData({...formData, emergencyAvailable: !formData.emergencyAvailable})}
                          className={`w-12 h-6 rounded-full p-1 transition-colors shrink-0 ${formData.emergencyAvailable ? 'bg-rose-500' : 'bg-slate-200'}`}
                        >
                          <motion.div 
                            layout 
                            className="w-4 h-4 bg-white rounded-full shadow-sm" 
                            animate={{ x: formData.emergencyAvailable ? 24 : 0 }} 
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        </div>
                      </label>

                      {formData.emergencyAvailable && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="pt-4 max-w-xs space-y-2"
                        >
                          <label className="text-xs font-bold text-slate-700">Emergency Consultation Fee (₹0 - ₹2000)</label>
                          <Input 
                            type="number" 
                            placeholder="e.g. 500" 
                            value={formData.emergencyFee} 
                            onChange={(e) => setFormData({...formData, emergencyFee: e.target.value})} 
                            className={`h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all ${errors.emergencyFee ? 'border-rose-500' : ''}`} 
                          />
                          {errors.emergencyFee && <p className="text-[10px] font-bold text-rose-500">{errors.emergencyFee}</p>}
                        </motion.div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6">
                    <Button 
                      type="button" 
                      onClick={prevStep} 
                      className="h-14 px-6 rounded-xl font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 flex items-center gap-2 transition-all"
                    >
                      <ArrowLeft className="w-5 h-5" /> Back
                    </Button>
                    <Button 
                      type="button" 
                      onClick={finalSubmit} 
                      disabled={isSubmitting} 
                      className="h-14 px-8 w-full sm:w-auto rounded-2xl font-bold bg-[#489C66] hover:bg-[#378151] text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/10 transition-all"
                    >
                      {isSubmitting ? (
                        <><RefreshCw className="w-5 h-5 animate-spin" /> Registering...</>
                      ) : (
                        <>Register Digital Clinic <CheckCircle2 className="w-5 h-5" /></>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 5: Verification Receipt */}
              {step === 5 && (
                <motion.div key="step5" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto space-y-8">
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
                    <p className="text-emerald-600 font-bold text-lg max-w-md bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100 text-center mx-auto">
                      {successMessage || "Registration submitted. Admin will verify within 24-48 hours."}
                    </p>
                  </div>

                  <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-100/50 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-sky-500/10 to-transparent rounded-bl-full pointer-events-none" />
                    <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-955">Application Summary</h3>
                        <p className="text-xs text-slate-500 font-medium">B2B Partner Verification Receipt</p>
                      </div>
                      <span className="ml-auto px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[10px] font-bold tracking-wider uppercase">
                        ⏳ Verifying
                      </span>
                    </div>

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
                        <span className="col-span-2 text-slate-800 font-semibold">{formData.speciality || "General Physician"}</span>
                      </div>
                      <div className="grid grid-cols-3 py-1.5 border-b border-slate-100/70">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Practice Name</span>
                        <span className="col-span-2 text-slate-800 font-semibold">{formData.practiceName || "JivniCare Clinic"}</span>
                      </div>
                      <div className="grid grid-cols-3 py-1.5">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Location</span>
                        <span className="col-span-2 text-slate-800 font-semibold">{formData.locality}, {formData.city}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
                    <h4 className="font-extrabold text-slate-955 text-base tracking-tight flex items-center gap-2">
                      <Activity className="w-4 h-4 text-sky-500" />
                      Verification Steps
                    </h4>
                    <div className="relative border-l-2 border-slate-100 pl-6 ml-3 space-y-6">
                      <div className="relative">
                        <div className="absolute -left-[35px] top-0 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="font-bold text-slate-900 text-sm">Application Received</h5>
                          <p className="text-xs text-slate-500 mt-1 font-medium">Details submitted to JivniCare registry.</p>
                        </div>
                      </div>
                      <div className="relative">
                        <div className="absolute -left-[35px] top-0 w-6 h-6 rounded-full bg-sky-100 border-2 border-[#5298D2] flex items-center justify-center shadow-md animate-pulse">
                          <Clock className="w-3.5 h-3.5 text-sky-600" />
                        </div>
                        <div>
                          <h5 className="font-bold text-slate-900 text-sm">JivniCare Audit</h5>
                          <p className="text-xs text-slate-500 mt-1 font-medium">Team reviews registration for platform setup.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-2 justify-center">
                    <Link href="/" className="flex-1">
                      <Button className="h-14 px-8 w-full rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2">
                        Return to Homepage
                        <ArrowRight className="w-5 h-5" />
                      </Button>
                    </Link>
                    <a href="https://wa.me/918235351897?text=JivniCare%20Doctor%20Support" target="_blank" rel="noopener noreferrer" className="h-14 px-8 rounded-2xl border border-slate-200 hover:border-slate-350 bg-white hover:bg-slate-50 text-slate-700 font-bold text-base transition-all flex items-center justify-center gap-2">
                      <PhoneCall className="w-5 h-5 text-slate-400" />
                      Contact Support
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DoctorOnboardingFlow() {
  return (
    <PublicGuard>
      <SessionProvider>
        <Suspense fallback={<div className="min-h-screen bg-[#F8FAFC]" />}>
          <DoctorOnboardingFlowContent />
        </Suspense>
      </SessionProvider>
    </PublicGuard>
  );
}

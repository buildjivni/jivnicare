"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, Building2, Hospital, ShieldCheck, Camera, Upload } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Logo } from "@/components/brand/Logo";

// Brand Colors aligned with SaaS theme
const BrandColors = { primary: "#10b981", dark: "#0f172a" };

const TOTAL_STEPS = 5; // Step 5 is Success

export default function DoctorOnboardingFlow() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Basic
    fullName: "", mobile: "", email: "", password: "", confirmPassword: "",
    // Step 2: Professional
    gender: "", specialization: "", qualifications: "", experience: "", languages: "", fee: "", bio: "", expertise: "",
    // Step 3: Practice Type
    practiceType: "", // "clinic" or "hospital"
    // Step 4: Practice Details
    practiceName: "", practiceAddress: "", city: "", locality: "", landmark: "", contactNumber: "", workingDays: "", timings: "", department: "",
    // Uploads
    profilePhotoUrl: "", medicalRegistrationUrl: "", clinicPhotoUrl: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState<Record<string, boolean>>({});

  // ── VALIDATION LOGIC ──────────────────────────────────────────────────
  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (currentStep === 1) {
      if (!formData.fullName.trim() || /[^a-zA-Z\s]/.test(formData.fullName)) { newErrors.fullName = "Valid name required (letters only)"; isValid = false; }
      if (!/^\d{10}$/.test(formData.mobile)) { newErrors.mobile = "10-digit mobile number required"; isValid = false; }
      if (!/^\S+@\S+\.\S+$/.test(formData.email)) { newErrors.email = "Valid email required"; isValid = false; }
      if (formData.password.length < 8) { newErrors.password = "Password must be at least 8 characters"; isValid = false; }
      if (formData.password !== formData.confirmPassword) { newErrors.confirmPassword = "Passwords do not match"; isValid = false; }
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore(state => state.login);

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
          // Set user in AuthStore (token is handled via httpOnly cookie now)
          setAuth(data.user);
          // Go to success step briefly, or directly push
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
    if (field === 'mobile' || field === 'contactNumber') {
      value = value.replace(/\D/g, '').slice(0, 10); // Block non-digits immediately
    }
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" })); // Clear error
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
    <div className="space-y-4">
      <h2 className="text-2xl font-black text-slate-900 mb-6">Create Partner Account</h2>
      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Full Name</label>
          <Input placeholder="Dr. John Doe" value={formData.fullName} onChange={e => handleInputChange('fullName', e.target.value)} className="h-12 rounded-xl bg-slate-50" />
          {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Mobile Number</label>
            <Input type="tel" placeholder="9876543210" value={formData.mobile} onChange={e => handleInputChange('mobile', e.target.value)} className="h-12 rounded-xl bg-slate-50" />
            {errors.mobile && <p className="text-xs text-red-500 mt-1">{errors.mobile}</p>}
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Email Address</label>
            <Input type="email" placeholder="doctor@example.com" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} className="h-12 rounded-xl bg-slate-50" />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Password</label>
            <Input type="password" value={formData.password} onChange={e => handleInputChange('password', e.target.value)} className="h-12 rounded-xl bg-slate-50" />
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Confirm Password</label>
            <Input type="password" value={formData.confirmPassword} onChange={e => handleInputChange('confirmPassword', e.target.value)} className="h-12 rounded-xl bg-slate-50" />
            {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-black text-slate-900 mb-6">Professional Details</h2>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 bg-amber-50 border border-amber-100 p-4 rounded-2xl relative">
          <label className="text-xs font-bold text-amber-900 uppercase mb-2 block">Profile Photo</label>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white border-2 border-amber-200 overflow-hidden shrink-0 flex items-center justify-center relative">
              {formData.profilePhotoUrl ? (
                <img src={formData.profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <Camera className="w-5 h-5 text-amber-400" />
              )}
            </div>
            <div className="flex-1 relative">
              <Input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'profilePhotoUrl')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              <Button type="button" variant="outline" className="w-full border-amber-200 text-amber-700 bg-white hover:bg-amber-100 h-10 pointer-events-none">
                {isUploading['profilePhotoUrl'] ? "Uploading..." : formData.profilePhotoUrl ? "Change Photo" : "Upload Photo"}
              </Button>
            </div>
          </div>
          {errors.profilePhotoUrl && <p className="text-xs text-red-500 mt-2">{errors.profilePhotoUrl}</p>}
        </div>

        <div className="flex-1 bg-emerald-50 border border-emerald-100 p-4 rounded-2xl relative">
          <label className="text-xs font-bold text-emerald-900 uppercase mb-2 block">Medical Registration</label>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white border-2 border-emerald-200 overflow-hidden shrink-0 flex items-center justify-center relative">
              {formData.medicalRegistrationUrl ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              ) : (
                <Upload className="w-5 h-5 text-emerald-400" />
              )}
            </div>
            <div className="flex-1 relative">
              <Input type="file" accept="image/*,.pdf" onChange={(e) => handleFileUpload(e, 'medicalRegistrationUrl')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              <Button type="button" variant="outline" className="w-full border-emerald-200 text-emerald-700 bg-white hover:bg-emerald-100 h-10 pointer-events-none">
                {isUploading['medicalRegistrationUrl'] ? "Uploading..." : formData.medicalRegistrationUrl ? "Change Document" : "Upload Registration"}
              </Button>
            </div>
          </div>
          {errors.medicalRegistrationUrl && <p className="text-xs text-red-500 mt-2">{errors.medicalRegistrationUrl}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Specialization *</label>
          <Input placeholder="e.g. Cardiologist" value={formData.specialization} onChange={e => handleInputChange('specialization', e.target.value)} className="h-12 rounded-xl bg-slate-50" />
          {errors.specialization && <p className="text-xs text-red-500 mt-1">{errors.specialization}</p>}
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Degrees / Qualifications *</label>
          <Input placeholder="e.g. MBBS, MD" value={formData.qualifications} onChange={e => handleInputChange('qualifications', e.target.value)} className="h-12 rounded-xl bg-slate-50" />
          {errors.qualifications && <p className="text-xs text-red-500 mt-1">{errors.qualifications}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Gender</label>
          <select value={formData.gender} onChange={e => handleInputChange('gender', e.target.value)} className="w-full h-12 px-3 rounded-xl border border-slate-200 bg-slate-50">
            <option value="">Select</option><option value="male">Male</option><option value="female">Female</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Years Exp.</label>
          <Input type="number" placeholder="e.g. 5" value={formData.experience} onChange={e => handleInputChange('experience', e.target.value)} className="h-12 rounded-xl bg-slate-50" />
        </div>
        <div className="col-span-2 md:col-span-1">
          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Base Fee (₹) *</label>
          <Input type="number" placeholder="500" value={formData.fee} onChange={e => handleInputChange('fee', e.target.value)} className="h-12 rounded-xl bg-slate-50 font-bold" />
          {errors.fee && <p className="text-xs text-red-500 mt-1">{errors.fee}</p>}
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Languages Spoken</label>
        <Input placeholder="e.g. Hindi, English, Maithili" value={formData.languages} onChange={e => handleInputChange('languages', e.target.value)} className="h-12 rounded-xl bg-slate-50" />
      </div>

      <div>
        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">About / Biography</label>
        <textarea placeholder="Briefly describe your experience and approach to patient care..." value={formData.bio} onChange={e => handleInputChange('bio', e.target.value)} className="w-full h-24 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-black text-slate-900 mb-2">Select Practice Type</h2>
      <p className="text-sm text-slate-500 mb-8">Where do you primarily consult patients? This determines how your profile appears to users.</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div 
          onClick={() => handleInputChange('practiceType', 'clinic')}
          className={`cursor-pointer rounded-3xl p-6 border-2 transition-all ${formData.practiceType === 'clinic' ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200 hover:border-slate-300'}`}
        >
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${formData.practiceType === 'clinic' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-slate-100 text-slate-500'}`}>
            <Building2 className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Own Clinic</h3>
          <p className="text-sm text-slate-500 mt-2">You run your own private clinic. Full control over queue and location.</p>
        </div>

        <div 
          onClick={() => handleInputChange('practiceType', 'hospital')}
          className={`cursor-pointer rounded-3xl p-6 border-2 transition-all ${formData.practiceType === 'hospital' ? 'border-cyan-500 bg-cyan-50/50' : 'border-slate-200 hover:border-slate-300'}`}
        >
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${formData.practiceType === 'hospital' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30' : 'bg-slate-100 text-slate-500'}`}>
            <Hospital className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Hospital Attachment</h3>
          <p className="text-sm text-slate-500 mt-2">You consult within a larger hospital or multi-specialty center.</p>
        </div>
      </div>
      {errors.practiceType && <p className="text-sm font-bold text-red-500 text-center mt-4">{errors.practiceType}</p>}
    </div>
  );

  const renderStep4 = () => {
    const isClinic = formData.practiceType === "clinic";
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-black text-slate-900 mb-6">{isClinic ? "Clinic Details" : "Hospital Attachment Details"}</h2>
        
        {/* Practice Photo Upload */}
        <div className="flex items-center gap-4 mb-6 p-4 rounded-2xl border border-sky-100 bg-sky-50 relative">
          <div className="w-16 h-16 rounded-xl bg-white border-2 border-sky-200 flex items-center justify-center text-sky-600 shrink-0 overflow-hidden">
            {formData.clinicPhotoUrl ? (
              <img src={formData.clinicPhotoUrl} alt="Practice" className="w-full h-full object-cover" />
            ) : isClinic ? <Building2 className="w-6 h-6 text-sky-400" /> : <Hospital className="w-6 h-6 text-sky-400" />}
          </div>
          <div className="flex-1">
            <p className="font-bold text-sky-900">{isClinic ? "Clinic Photo" : "Hospital Photo"} (Optional)</p>
            <div className="relative mt-2">
              <Input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'clinicPhotoUrl')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              <Button type="button" variant="outline" className="w-full border-sky-200 text-sky-700 bg-white hover:bg-sky-100 h-10 pointer-events-none">
                {isUploading['clinicPhotoUrl'] ? "Uploading..." : formData.clinicPhotoUrl ? "Change Photo" : "Upload Exterior Photo"}
              </Button>
            </div>
            {errors.clinicPhotoUrl && <p className="text-xs text-red-500 mt-2">{errors.clinicPhotoUrl}</p>}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">{isClinic ? "Clinic Name *" : "Hospital Name *"}</label>
          <Input placeholder={isClinic ? "e.g. Sanjeevani Clinic" : "e.g. Apollo Hospital"} value={formData.practiceName} onChange={e => handleInputChange('practiceName', e.target.value)} className="h-12 rounded-xl bg-slate-50" />
          {errors.practiceName && <p className="text-xs text-red-500 mt-1">{errors.practiceName}</p>}
        </div>

        {!isClinic && (
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Department</label>
            <Input placeholder="e.g. Cardiology Dept." value={formData.department} onChange={e => handleInputChange('department', e.target.value)} className="h-12 rounded-xl bg-slate-50" />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">City *</label>
            <Input placeholder="e.g. Patna" value={formData.city} onChange={e => handleInputChange('city', e.target.value)} className="h-12 rounded-xl bg-slate-50" />
            {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Area / Locality *</label>
            <Input placeholder="e.g. Kankarbagh" value={formData.locality} onChange={e => handleInputChange('locality', e.target.value)} className="h-12 rounded-xl bg-slate-50" />
            {errors.locality && <p className="text-xs text-red-500 mt-1">{errors.locality}</p>}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Full Address</label>
          <Input placeholder="Street, building..." value={formData.practiceAddress} onChange={e => handleInputChange('practiceAddress', e.target.value)} className="h-12 rounded-xl bg-slate-50" />
        </div>

        {isClinic && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Landmark</label>
              <Input placeholder="Near..." value={formData.landmark} onChange={e => handleInputChange('landmark', e.target.value)} className="h-12 rounded-xl bg-slate-50" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Clinic Contact Number *</label>
              <Input type="tel" placeholder="Phone for reception" value={formData.contactNumber} onChange={e => handleInputChange('contactNumber', e.target.value)} className="h-12 rounded-xl bg-slate-50" />
              {errors.contactNumber && <p className="text-xs text-red-500 mt-1">{errors.contactNumber}</p>}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Working Days</label>
            <Input placeholder="e.g. Mon-Sat" value={formData.workingDays} onChange={e => handleInputChange('workingDays', e.target.value)} className="h-12 rounded-xl bg-slate-50" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">OPD Timings</label>
            <Input placeholder="e.g. 10AM - 5PM" value={formData.timings} onChange={e => handleInputChange('timings', e.target.value)} className="h-12 rounded-xl bg-slate-50" />
          </div>
        </div>
      </div>
    );
  };

  const renderStep5 = () => (
    <div className="flex flex-col items-center justify-center text-center py-10 fade-in">
      <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-6 text-emerald-500">
        <ShieldCheck className="w-12 h-12" />
      </div>
      <h2 className="text-3xl font-black text-slate-900 mb-2">Application Submitted</h2>
      <p className="text-slate-500 max-w-md mx-auto mb-8">
        Thank you, Dr. {formData.fullName.split(' ')[0] || "Doctor"}. Your profile has been sent for admin verification. You will be able to access the dashboard once approved.
      </p>
      <div className="bg-slate-50 rounded-2xl p-6 w-full max-w-sm border border-slate-100 mb-8">
        <p className="text-sm font-bold text-slate-700 mb-1">Status: <span className="text-amber-600">Pending Verification</span></p>
        <p className="text-xs text-slate-500">Usually takes 24-48 hours.</p>
      </div>
      <Button onClick={() => router.push('/doctor/dashboard')} className="h-12 px-8 rounded-xl font-bold shadow-xl bg-emerald-500 hover:bg-emerald-600 hover:brightness-105 hover:shadow-xl text-white transition-all">
        Go to Doctor Dashboard
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      
      <div className="bg-white w-full max-w-2xl rounded-3xl md:rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden relative">
        {/* Top Header & Brand */}
        <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-20 rounded-t-3xl md:rounded-t-[2rem]">
          <div className="flex items-center gap-2 md:gap-3">
            <Logo className="w-6 h-6 md:w-8 md:h-8" />
            <span className="font-black text-lg md:text-xl tracking-tight text-slate-900">Partner Setup</span>
          </div>
          {step < 5 && <span className="text-xs md:text-sm font-bold text-slate-400">Step {step} of 4</span>}
        </div>

        {/* Progress Bar */}
        {step < 5 && (
          <div className="w-full bg-slate-100 h-1.5">
            <div 
              className="h-1.5 transition-all duration-500 ease-out bg-emerald-500" 
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        )}

        {/* Form Container */}
        <div className="p-6 md:p-10 min-h-[400px]">
          {/* Submit error banner */}
          {errors.submit && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 flex items-start gap-3">
              <span className="text-red-500 shrink-0 text-lg">⚠</span>
              <div>
                <p className="text-sm font-bold text-red-800">Submission Failed</p>
                <p className="text-xs text-red-600 mt-0.5">{errors.submit}</p>
              </div>
            </div>
          )}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
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
          <div className="p-4 md:p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between sticky bottom-0 z-10">
            <Button 
              variant="ghost" 
              onClick={handleBack} 
              disabled={step === 1}
              className={`h-10 md:h-12 px-3 md:px-6 rounded-xl font-bold ${step === 1 ? 'opacity-0' : 'text-slate-600 hover:bg-slate-200'}`}
            >
              <ArrowLeft className="w-4 h-4 md:mr-2" /> <span className="hidden md:inline">Back</span>
            </Button>
            
            <Button 
              onClick={handleNext} 
              disabled={isSubmitting}
              className="h-10 md:h-12 px-6 md:px-8 rounded-xl text-white font-bold shadow-xl bg-slate-900 hover:bg-slate-800 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {step === 4 ? "Submit Profile" : "Continue"} <ArrowRight className="w-4 h-4 ml-2" />
                </span>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, Building2, Hospital, ShieldCheck, Camera, Upload } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

// Brand Colors
const BrandColors = { blue: "#5298D2", green: "#489C66" };

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
    practiceName: "", practiceAddress: "", city: "", locality: "", landmark: "", contactNumber: "", workingDays: "", timings: "", department: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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
  const setAuth = useAuthStore(state => state.setUser);

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
      
      {/* Photo Upload Simulation */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400">
          <Camera className="w-8 h-8" />
        </div>
        <div>
          <p className="font-bold text-slate-900">Profile Photo</p>
          <p className="text-xs text-slate-500 mb-2">Patients trust profiles with real photos.</p>
          <Button variant="outline" className="h-8 text-xs rounded-full"><Upload className="w-3 h-3 mr-2"/> Upload Image</Button>
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
        <textarea placeholder="Briefly describe your experience and approach to patient care..." value={formData.bio} onChange={e => handleInputChange('bio', e.target.value)} className="w-full h-24 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none" style={{ outlineColor: BrandColors.blue }} />
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
          className={`cursor-pointer rounded-3xl p-6 border-2 transition-all ${formData.practiceType === 'clinic' ? 'border-[#5298D2] bg-blue-50/50' : 'border-slate-200 hover:border-slate-300'}`}
        >
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${formData.practiceType === 'clinic' ? 'bg-[#5298D2] text-white' : 'bg-slate-100 text-slate-500'}`}>
            <Building2 className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Own Clinic</h3>
          <p className="text-sm text-slate-500 mt-2">You run your own private clinic. Full control over queue and location.</p>
        </div>

        <div 
          onClick={() => handleInputChange('practiceType', 'hospital')}
          className={`cursor-pointer rounded-3xl p-6 border-2 transition-all ${formData.practiceType === 'hospital' ? 'border-[#489C66] bg-green-50/50' : 'border-slate-200 hover:border-slate-300'}`}
        >
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${formData.practiceType === 'hospital' ? 'bg-[#489C66] text-white' : 'bg-slate-100 text-slate-500'}`}>
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
        
        {/* Practice Photo Upload Simulation */}
        <div className="flex items-center gap-4 mb-6 p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
          <div className="w-16 h-16 rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 shrink-0">
            {isClinic ? <Building2 className="w-6 h-6" /> : <Hospital className="w-6 h-6" />}
          </div>
          <div>
            <p className="font-bold text-slate-900">{isClinic ? "Clinic Photo" : "Hospital Exterior Photo"}</p>
            <p className="text-xs text-slate-500 mb-2">Helps patients identify the location easily.</p>
            <Button variant="outline" className="h-8 text-xs rounded-full bg-white"><Upload className="w-3 h-3 mr-2"/> Upload Photo</Button>
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
      <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6" style={{ color: BrandColors.green }}>
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
      <Button onClick={() => router.push('/doctor/dashboard')} className="h-12 px-8 rounded-xl font-bold shadow-md" style={{ backgroundColor: BrandColors.blue }}>
        Go to Doctor Dashboard
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <style dangerouslySetInnerHTML={{__html: `
        .fade-in { animation: fadeIn 0.3s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
      
      <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden relative">
        {/* Top Header & Brand */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 100 100" className="w-8 h-8">
              <circle cx="50" cy="25" r="12" fill={BrandColors.blue} />
              <path d="M 45 40 Q 20 50 25 80 Q 40 85 48 75 Q 45 60 45 40 Z" fill={BrandColors.blue} />
              <path d="M 55 40 Q 80 50 75 80 Q 60 85 52 75 Q 55 60 55 40 Z" fill={BrandColors.green} />
            </svg>
            <span className="font-black text-xl tracking-tight"><span style={{ color: BrandColors.blue }}>Jivni</span><span style={{ color: BrandColors.green }}>Care</span> Partner</span>
          </div>
          {step < 5 && <span className="text-sm font-bold text-slate-400">Step {step} of 4</span>}
        </div>

        {/* Progress Bar */}
        {step < 5 && (
          <div className="w-full bg-slate-100 h-1">
            <div 
              className="h-1 transition-all duration-500 ease-out" 
              style={{ width: `${(step / 4) * 100}%`, backgroundColor: BrandColors.green }}
            />
          </div>
        )}

        {/* Form Container */}
        <div className="p-6 md:p-10 min-h-[400px]">
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
          <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between sticky bottom-0 z-10">
            <Button 
              variant="ghost" 
              onClick={handleBack} 
              disabled={step === 1}
              className={`h-12 px-6 rounded-xl font-bold ${step === 1 ? 'opacity-0' : 'text-slate-600 hover:bg-slate-200'}`}
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            
            <Button 
              onClick={handleNext} 
              className="h-12 px-8 rounded-xl text-white font-bold shadow-md hover:brightness-110 transition-all"
              style={{ backgroundColor: BrandColors.blue }}
            >
              {step === 4 ? "Submit Profile" : "Continue"} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

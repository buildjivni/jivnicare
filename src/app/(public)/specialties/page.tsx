"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Search, Stethoscope, ArrowRight, Info, ShieldCheck
} from "lucide-react";
import { motion } from "framer-motion";

interface Specialty {
  name: string;
  icon: string;
  id: string;
  description: string;
  symptoms: string[];
  color: string;
}

const MASTER_SPECIALTIES: Specialty[] = [
  {
    name: "General Physician",
    icon: "🩺",
    id: "general-physician",
    description: "Your first point of contact for general health concerns, viral fevers, seasonal infections, and overall wellness monitoring.",
    symptoms: ["Fever", "Cold", "Cough", "Headache", "Body Pain", "Fatigue", "Viral Infections"],
    color: "bg-blue-50 text-blue-600 border-blue-100"
  },
  {
    name: "Dentist",
    icon: "🦷",
    id: "dentist",
    description: "Specialist in oral hygiene, tooth decay, dental surgeries, root canals, alignment, and gum disease treatments.",
    symptoms: ["Toothache", "Cavity", "Bleeding Gums", "Bad Breath", "Sensitivity", "Broken Tooth"],
    color: "bg-sky-50 text-sky-600 border-sky-100"
  },
  {
    name: "Dermatologist & Cosmetologist",
    icon: "🔬",
    id: "dermatologist-cosmetologist",
    description: "Expert in skin, hair, and nail health, including clinical treatments for chronic conditions and aesthetic enhancements.",
    symptoms: ["Acne", "Skin Rash", "Itching", "Eczema", "Psoriasis", "Warts", "Skin Pigmentation"],
    color: "bg-purple-50 text-purple-600 border-purple-100"
  },
  {
    name: "Gynecologist & Obstetrician",
    icon: "🤱",
    id: "gynecologist-obstetrician",
    description: "Comprehensive care for women's reproductive health, pregnancy management, childbirth, and hormonal issues like PCOS.",
    symptoms: ["Pregnancy Care", "Irregular Periods", "PCOS/PCOD", "Menstrual Pain", "Vaginal Discharge", "Hormonal Imbalance"],
    color: "bg-rose-50 text-rose-600 border-rose-100"
  },
  {
    name: "Pediatrician",
    icon: "👶",
    id: "pediatrician",
    description: "Dedicated medical care for infants, children, and adolescents, including developmental milestones and vaccinations.",
    symptoms: ["Child Fever", "Bedwetting", "Child Nutrition", "Development Delay", "Infant Colic", "Childhood Infections"],
    color: "bg-amber-50 text-amber-600 border-amber-100"
  },
  {
    name: "Orthopedic Surgeon",
    icon: "🦴",
    id: "orthopedic-surgeon",
    description: "Treatment for bones, joints, ligaments, tendons, and muscles. Focuses on fractures, arthritis, and spine disorders.",
    symptoms: ["Joint Pain", "Fracture", "Back Pain", "Knee Stiffness", "Ligament Tear", "Muscle Sprain"],
    color: "bg-orange-50 text-orange-600 border-orange-100"
  },
  {
    name: "ENT Specialist",
    icon: "👂",
    id: "ent-specialist",
    description: "Diagnosis and surgical treatment of diseases affecting the ears, nose, throat, sinuses, and larynx.",
    symptoms: ["Ear Pain", "Hearing Loss", "Sinusitis", "Sore Throat", "Tonsillitis", "Nose Bleeding", "Voice Change"],
    color: "bg-indigo-50 text-indigo-600 border-indigo-100"
  },
  {
    name: "Ophthalmologist",
    icon: "👁️",
    id: "ophthalmologist",
    description: "Complete eye and vision care, offering spectacles prescriptions, treatment for infections, glaucoma, and cataract surgeries.",
    symptoms: ["Blurry Vision", "Red Eyes", "Eye Itching", "Cataract", "Dry Eyes", "Spectacle Power Check"],
    color: "bg-teal-50 text-teal-600 border-teal-100"
  },
  {
    name: "Cardiologist",
    icon: "❤️",
    id: "cardiologist",
    description: "Specialist in heart health, managing coronary artery diseases, heart failures, hypertension, and heart rhythm disorders.",
    symptoms: ["Chest Pain", "High BP", "Palpitations", "Shortness of Breath", "Dizziness", "Cardiac Risk Screening"],
    color: "bg-red-50 text-red-600 border-red-100"
  },
  {
    name: "Diabetologist",
    icon: "💉",
    id: "diabetologist",
    description: "Specialist in managing type 1, type 2, and gestational diabetes, with focus on preventing long-term diabetic complications.",
    symptoms: ["High Blood Sugar", "Excessive Thirst", "Frequent Urination", "Sudden Weight Loss", "Slow Wound Healing"],
    color: "bg-emerald-50 text-emerald-600 border-emerald-100"
  },
  {
    name: "Psychiatrist & Psychologist",
    icon: "💭",
    id: "psychiatrist-psychologist",
    description: "Compassionate mental health services covering diagnosis, psychiatric medication, counseling, and psychotherapy.",
    symptoms: ["Anxiety", "Depression", "Panic Attack", "Chronic Stress", "Insomnia / Sleep Issues", "Mood Swings"],
    color: "bg-pink-50 text-pink-600 border-pink-100"
  },
  {
    name: "Physiotherapist",
    icon: "🏃",
    id: "physiotherapist",
    description: "Rehabilitation and physical therapy to restore movement, relieve muscle/joint stiffness, and support post-injury recovery.",
    symptoms: ["Sports Injury", "Neck Pain", "Sciatica", "Frozen Shoulder", "Paralysis Rehab", "Post-Surgery Recovery"],
    color: "bg-lime-50 text-lime-600 border-lime-100"
  },
  {
    name: "Neurologist",
    icon: "🧠",
    id: "neurologist",
    description: "Medical expert for brain, spinal cord, nerves, and muscular disorders, dealing with migraines, stroke, and nerve pains.",
    symptoms: ["Migraine", "Numbness", "Tremors", "Seizures / Fits", "Memory Loss", "Dizziness & Balance Issues"],
    color: "bg-violet-50 text-violet-600 border-violet-100"
  },
  {
    name: "Gastroenterologist",
    icon: "🫁",
    id: "gastroenterologist",
    description: "Treatment for digestive system disorders, including stomach, intestines, liver, gallbladder, and pancreatic issues.",
    symptoms: ["Severe Acidity", "Bloating & Gas", "Stomach Pain", "Constipation", "Chronic Diarrhea", "Jaundice"],
    color: "bg-yellow-50 text-yellow-700 border-yellow-100"
  },
  {
    name: "Urologist",
    icon: "🧬",
    id: "urologist",
    description: "Specialized care for urinary tract system in men and women, and male reproductive system conditions.",
    symptoms: ["UTI (Urinary Infection)", "Kidney Stones", "Painful Urination", "Prostate Issues", "Incontinence"],
    color: "bg-cyan-50 text-cyan-600 border-cyan-100"
  },
  {
    name: "Pulmonologist",
    icon: "🫀",
    id: "pulmonologist",
    description: "Diagnosis and therapy for respiratory system illnesses, including asthma, COPD, chronic coughs, and sleep apnea.",
    symptoms: ["Asthma", "Wheezing", "Chronic Cough", "Breathing Difficulty", "Chest Congestion", "Sleep Apnea"],
    color: "bg-rose-50 text-rose-600 border-rose-100"
  },
  {
    name: "Endocrinologist",
    icon: "⚗️",
    id: "endocrinologist",
    description: "Specialist in hormone-producing glands. Manages thyroid diseases, growth issues, and metabolism disorders.",
    symptoms: ["Thyroid Disorder", "Sudden Weight Gain", "Excessive Hair Growth", "Fatigue", "Hormonal Disruption"],
    color: "bg-purple-50 text-purple-600 border-purple-100"
  },
  {
    name: "Nephrologist",
    icon: "💊",
    id: "nephrologist",
    description: "Expert care for kidney health, managing chronic kidney disease, hypertension-induced kidney damage, and dialysis guidance.",
    symptoms: ["High Creatinine", "Kidney Dysfunction", "Swelling in Feet", "Foamy Urine", "Chronic Kidney Disease"],
    color: "bg-emerald-50 text-emerald-600 border-emerald-100"
  },
  {
    name: "Oncologist",
    icon: "🎗️",
    id: "oncologist",
    description: "Specialist in cancer treatment, delivering chemotherapy, immunotherapy, targeted therapy, and overall cancer care plans.",
    symptoms: ["Unexplained Lumps", "Abnormal Bleeding", "Rapid Weight Loss", "Chronic Fatigue", "Cancer Screening"],
    color: "bg-red-50 text-red-600 border-red-100"
  },
  {
    name: "Rheumatologist",
    icon: "🦵",
    id: "rheumatologist",
    description: "Specialist in autoimmune diseases and joint/muscle conditions that cause chronic pain and inflammation.",
    symptoms: ["Rheumatoid Arthritis", "Gout", "Morning Joint Stiffness", "Chronic Muscle Pain", "Lupus"],
    color: "bg-orange-50 text-orange-600 border-orange-100"
  },
  {
    name: "Dietitian & Nutritionist",
    icon: "🥗",
    id: "dietitian-nutritionist",
    description: "Personalized dietary planning, clinical nutrition therapies, lifestyle management, weight control, and wellness coaching.",
    symptoms: ["Weight Management", "Custom Diet Plans", "Nutritional Deficiency", "Cholesterol Control", "Dietary Advice"],
    color: "bg-green-50 text-green-600 border-green-100"
  },
  {
    name: "Sexologist",
    icon: "🔥",
    id: "sexologist",
    description: "Medical advice and therapy for sexual health, intimacy concerns, reproductive function, and marital counseling.",
    symptoms: ["Erectile Dysfunction", "Premature Ejaculation", "Loss of Libido", "Intimacy Issues", "Sexual Health Check"],
    color: "bg-pink-50 text-pink-600 border-pink-100"
  },
  {
    name: "Hair & Skin Specialist",
    icon: "💇",
    id: "hair-skin-specialist",
    description: "Focused expert on hair restoration, clinical trichology, scalp disorders, and non-surgical cosmetic skin procedures.",
    symptoms: ["Hair Loss", "Baldness / Alopecia", "Dandruff", "Thinning Hair", "Scalp Itching", "Acne Scars"],
    color: "bg-purple-50 text-purple-600 border-purple-100"
  },
  {
    name: "Ayurvedic Doctor",
    icon: "🌿",
    id: "ayurvedic-doctor",
    description: "Holistic healing through traditional Ayurvedic systems, herbal formulations, dietary changes, and detox therapies.",
    symptoms: ["Chronic Pain", "Digestive Issues", "Stress Relief", "Joint Pain", "Herbal Wellness Care"],
    color: "bg-emerald-50 text-emerald-700 border-emerald-100"
  },
  {
    name: "Homeopathic Doctor",
    icon: "💧",
    id: "homeopathic-doctor",
    description: "Alternative medicine system using highly diluted natural substances to trigger the body's self-healing mechanisms.",
    symptoms: ["Chronic Allergies", "Skin Allergies", "Asthma", "Recurrent Cold", "Long-term Conditions"],
    color: "bg-sky-50 text-sky-600 border-sky-100"
  },
  {
    name: "Unani Specialist",
    icon: "🏺",
    id: "unani-specialist",
    description: "Traditional healing focusing on the balance of the four bodily humors (phlegm, blood, yellow bile, and black bile).",
    symptoms: ["Digestive Weakness", "Joint Pain", "Respiratory Issues", "Skin Disorders", "General Vitality"],
    color: "bg-amber-50 text-amber-700 border-amber-100"
  },
  {
    name: "Siddha Specialist",
    icon: "🍂",
    id: "siddha-specialist",
    description: "Traditional system of medicine originating in South India, using minerals, metals, and herbal formulations.",
    symptoms: ["Rheumatism", "Chronic Skin Diseases", "Sinusitis", "General Rejuvenation"],
    color: "bg-orange-50 text-orange-700 border-orange-100"
  },
  {
    name: "Naturopath",
    icon: "🧘",
    id: "naturopath",
    description: "Drugless, non-invasive system using dietetics, yoga, hydrotherapy, mud therapy, and lifestyle modification.",
    symptoms: ["Detoxification", "Stress & Fatigue", "Lifestyle Disorders", "Weight Loss", "Natural Healing"],
    color: "bg-green-50 text-green-700 border-green-100"
  },
  {
    name: "Geriatrician",
    icon: "🧓",
    id: "geriatrician",
    description: "Specialized primary care focusing on elderly patients, managing multiple chronic diseases, mobility, and age-related decline.",
    symptoms: ["Age-related Weakness", "Memory Issues", "Dementia Care", "Falls / Unsteady Walk", "Polypharmacy Review"],
    color: "bg-indigo-50 text-indigo-600 border-indigo-100"
  },
  {
    name: "Emergency Medicine Specialist",
    icon: "🚨",
    id: "emergency-medicine-specialist",
    description: "Acute trauma care, immediate stabilizing treatments for accidents, severe acute chest pains, and life-threatening emergencies.",
    symptoms: ["Accident / Trauma", "Sudden Chest Pain", "Severe Breathlessness", "Poisoning", "Unconsciousness"],
    color: "bg-red-50 text-red-600 border-red-100"
  }
];

export default function SpecialtyGuidePage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSpecialties = MASTER_SPECIALTIES.filter((spec) => {
    const term = searchQuery.toLowerCase();
    const matchesName = spec.name.toLowerCase().includes(term);
    const matchesDescription = spec.description.toLowerCase().includes(term);
    const matchesSymptoms = spec.symptoms.some((sym) =>
      sym.toLowerCase().includes(term)
    );
    return matchesName || matchesDescription || matchesSymptoms;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 md:py-20 px-4 sm:px-6">
      <div className="container mx-auto max-w-6xl">
        
        {/* Header Block */}
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-primary text-xs font-bold uppercase tracking-wider mb-4 border border-blue-100">
            <Stethoscope className="w-4 h-4" /> Specialty Guide
          </div>
          <h1 className="text-3xl md:text-5xl font-heading font-black text-slate-900 leading-tight mb-4">
            Medical Specialties & Symptoms
          </h1>
          <p className="text-slate-600 text-base md:text-lg font-medium leading-relaxed">
            Not sure who to visit? Search by your symptoms or department name to find the right verified medical specialist near you.
          </p>
        </div>

        {/* Search Bar Block */}
        <div className="max-w-xl mx-auto mb-16 relative">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Search e.g. Fever, Toothache, Cardiologist, Skin..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 pl-12 pr-4 bg-white rounded-2xl border border-slate-200/80 shadow-soft focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary text-slate-800 placeholder-slate-400 font-bold transition-all text-sm"
            />
          </div>
          
          {searchQuery && (
            <div className="text-xs text-slate-500 font-bold mt-2 text-right">
              Showing {filteredSpecialties.length} of {MASTER_SPECIALTIES.length} departments
            </div>
          )}
        </div>

        {/* Grid Block */}
        {filteredSpecialties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSpecialties.map((spec) => (
              <motion.div
                key={spec.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col justify-between hover:shadow-premium hover:-translate-y-1 transition-all duration-300 group"
              >
                <div>
                  <div className="flex items-center gap-3.5 mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold shadow-sm border ${spec.color}`}>
                      {spec.icon}
                    </div>
                    <h3 className="font-heading font-black text-lg text-slate-800 group-hover:text-primary transition-colors leading-tight">
                      {spec.name}
                    </h3>
                  </div>

                  <p className="text-slate-500 text-xs font-semibold leading-relaxed mb-6">
                    {spec.description}
                  </p>

                  <div className="mb-6">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Common Symptoms Treated:</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {spec.symptoms.map((symptom, idx) => (
                        <span 
                          key={idx}
                          className="px-2.5 py-1 text-[10px] font-bold text-slate-600 bg-slate-50 rounded-lg border border-slate-100 hover:bg-primary/5 hover:text-primary transition-colors cursor-pointer"
                          onClick={() => setSearchQuery(symptom)}
                        >
                          {symptom}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <Link href={`/doctors?speciality=${encodeURIComponent(spec.name)}`} className="block">
                  <div className="w-full h-11 bg-slate-50 hover:bg-primary hover:text-white text-primary rounded-xl text-xs font-black flex items-center justify-center gap-2 group-hover:bg-primary/5 group-hover:text-primary group-hover:hover:bg-primary group-hover:hover:text-white transition-all duration-200">
                    Find Doctors <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center max-w-md mx-auto shadow-soft">
            <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Info className="w-8 h-8" />
            </div>
            <h3 className="font-heading font-black text-slate-800 text-xl mb-2">No specialties found</h3>
            <p className="text-slate-500 font-bold text-xs leading-relaxed mb-6">
              No matching departments or symptoms found for &ldquo;{searchQuery}&rdquo;. Try using terms like cold, heart, skin, or pediatrician.
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="px-5 py-2.5 bg-primary hover:bg-[#184a7a] text-white rounded-xl text-xs font-black shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all"
            >
              Reset Search Filter
            </button>
          </div>
        )}

        {/* Disclaimer / Guidance Card */}
        <div className="mt-16 bg-blue-50/50 border border-blue-100/50 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row gap-5 items-start">
          <div className="w-12 h-12 rounded-2xl bg-white border border-blue-100 flex items-center justify-center text-primary shrink-0 shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-heading font-black text-slate-900 text-base mb-1.5">Note on Emergency Situations</h4>
            <p className="text-slate-600 text-xs font-semibold leading-relaxed">
              If you or someone around you is experiencing life-threatening conditions (such as severe breathing difficulties, sudden unconsciousness, suspected stroke, poisonings, or heavy bleeding), please search for <strong className="text-rose-600">Emergency Medicine Specialist</strong> or toggle <strong className="text-primary">Emergency Mode</strong> on search to locate hospitals offering active emergency availability blocks.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

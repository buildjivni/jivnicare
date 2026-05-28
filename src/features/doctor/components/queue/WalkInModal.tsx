import React, { useState } from "react";
import { UserPlus, AlertCircle, X, Loader2 } from "lucide-react";

interface WalkInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
}

export function WalkInModal({ isOpen, onClose, onSuccess }: WalkInModalProps) {
  const [formData, setFormData] = useState({
    patientName: "",
    phoneNumber: "",
    age: "",
    gender: "",
    location: "",
    isEmergency: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientName.trim()) {
      setErrorMsg("Patient Name is required.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const payload = {
        patientName: formData.patientName.trim(),
        phoneNumber: formData.phoneNumber.trim() || undefined,
        age: formData.age ? parseInt(formData.age, 10) : undefined,
        gender: formData.gender || undefined,
        location: formData.location.trim() || undefined,
        isEmergency: formData.isEmergency,
      };

      const res = await fetch("/api/doctor/queue/walk-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to add walk-in patient");
      }

      setSuccessMsg(`Token #${data.token.tokenNumber} Generated Successfully!`);
      
      // Wait for 1.5s to show the success message before closing and refreshing queue
      setTimeout(async () => {
        await onSuccess();
        onClose();
        setFormData({ patientName: "", phoneNumber: "", age: "", gender: "", location: "", isEmergency: false });
        setSuccessMsg("");
      }, 1500);

    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#005da7] flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Add Offline Patient</h2>
              <p className="text-xs text-slate-500 font-medium">Generate a token for a walk-in patient</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            disabled={isSubmitting}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm font-medium rounded-2xl flex items-start gap-2 border border-red-100">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>{errorMsg}</p>
            </div>
          )}

          {successMsg ? (
            <div className="py-8 text-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Success!</h3>
              <p className="text-emerald-700 font-medium">{successMsg}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Patient Name *</label>
                <input 
                  type="text" 
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#005da7] focus:ring-4 focus:ring-blue-50 transition-all font-medium text-slate-900 disabled:opacity-50"
                  placeholder="E.g. Rahul Kumar"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Phone Number (Optional)</label>
                <input 
                  type="tel" 
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#005da7] focus:ring-4 focus:ring-blue-50 transition-all font-medium text-slate-900 disabled:opacity-50"
                  placeholder="10-digit mobile number"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Age (Optional)</label>
                  <input 
                    type="number" 
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#005da7] focus:ring-4 focus:ring-blue-50 transition-all font-medium text-slate-900 disabled:opacity-50"
                    placeholder="E.g. 35"
                    min="0"
                    max="150"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Gender (Optional)</label>
                  <select 
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#005da7] focus:ring-4 focus:ring-blue-50 transition-all font-medium text-slate-900 bg-white disabled:opacity-50"
                  >
                    <option value="">Select</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">City / Village (Optional)</label>
                <input 
                  type="text" 
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#005da7] focus:ring-4 focus:ring-blue-50 transition-all font-medium text-slate-900 disabled:opacity-50"
                  placeholder="E.g. Patna"
                />
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl hover:bg-red-50 border border-transparent hover:border-red-100 transition-colors">
                  <div className="relative flex items-center mt-0.5">
                    <input 
                      type="checkbox" 
                      name="isEmergency"
                      checked={formData.isEmergency}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Mark as Emergency</p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Prioritizes token in the queue sequence.</p>
                  </div>
                </label>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full mt-6 bg-[#005da7] hover:bg-[#004b87] text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-blue-500/20 transition-all disabled:opacity-70 flex justify-center items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Token...
                  </>
                ) : (
                  "Generate Walk-in Token"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

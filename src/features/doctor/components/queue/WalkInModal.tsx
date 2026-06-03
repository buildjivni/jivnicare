import React, { useState, useEffect } from "react";
import { UserPlus, AlertCircle, X, Loader2, History } from "lucide-react";

interface WalkInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
  initialIsEmergency?: boolean;
}

export function WalkInModal({ isOpen, onClose, onSuccess, initialIsEmergency = false }: WalkInModalProps) {
  const [formData, setFormData] = useState({
    patientName: "",
    phoneNumber: "",
    isEmergency: initialIsEmergency,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({ ...prev, isEmergency: initialIsEmergency }));
    }
  }, [isOpen, initialIsEmergency]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let { name, value, type } = e.target;
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;
    
    if (name === "phoneNumber") {
      value = value.replace(/\D/g, "").slice(0, 10);
    } else if (name === "patientName") {
      value = value.replace(/[^a-zA-Z\s.']/g, "");
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Removed mandatory patient name check to allow anonymous walk-ins

    if (formData.phoneNumber && formData.phoneNumber.trim().length !== 10) {
      setErrorMsg("Phone Number must be exactly 10 digits.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const payload = {
        patientName: formData.patientName.trim(),
        phoneNumber: formData.phoneNumber.trim() || undefined,
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
      
      // Instantly refresh queue and close
      await onSuccess();
      setTimeout(() => {
        onClose();
        setFormData({ patientName: "", phoneNumber: "", isEmergency: false });
        setSuccessMsg("");
      }, 1500);

    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
        {/* Mobile Pull Indicator */}
        <div className="w-full flex justify-center py-3 sm:hidden">
          <div className="w-12 h-1.5 bg-slate-200 rounded-full"></div>
        </div>

        <div className="flex items-center justify-between px-6 pb-4 sm:pt-6 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.isEmergency ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-[#005da7]'}`}>
              {formData.isEmergency ? <AlertCircle className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{formData.isEmergency ? 'Add Emergency Patient' : 'Add Walk-in Patient'}</h2>
              <p className="text-xs text-slate-500 font-medium">{formData.isEmergency ? 'Jump the queue immediately' : 'Generate a token for a walk-in'}</p>
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

        <div className="p-6 overflow-y-auto">
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm font-medium rounded-2xl flex items-start gap-2 border border-red-100">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>{errorMsg}</p>
            </div>
          )}

          {successMsg ? (
            <div className="py-8 text-center animate-in fade-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-soft">
                <UserPlus className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Success!</h3>
              <p className="text-emerald-700 font-bold text-lg">{successMsg}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Patient Name *</label>
                <div className="relative">
                  <input 
                    type="text" 
                    name="patientName"
                    value={formData.patientName}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    autoComplete="off"
                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#005da7] focus:ring-4 focus:ring-blue-50 transition-all font-bold text-slate-900 disabled:opacity-50"
                    placeholder="E.g. Rahul Kumar"
                    required
                  />
                  {formData.patientName.length > 0 && formData.patientName.length < 3 && (
                     <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 shadow-xl rounded-xl p-2 z-10 flex items-center gap-2 text-slate-500 text-sm">
                       <Loader2 className="w-4 h-4 animate-spin text-blue-500" /> Searching recent patients...
                     </div>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 font-medium mt-1.5 flex items-center gap-1">
                  <History className="w-3 h-3" /> Type to search past patients
                </p>
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

              <div className={`p-4 rounded-xl border transition-colors ${formData.isEmergency ? 'border-red-200 bg-red-50/50' : 'border-slate-200 bg-slate-50'}`}>
                <label className="flex items-start gap-3 cursor-pointer">
                  <div className="relative flex items-center mt-0.5 shrink-0">
                    <input 
                      type="checkbox" 
                      name="isEmergency"
                      checked={formData.isEmergency}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-7 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-600 shadow-inner"></div>
                  </div>
                  <div>
                    <p className={`text-base font-black uppercase tracking-wide ${formData.isEmergency ? 'text-red-700' : 'text-slate-700'}`}>Emergency (Jump Queue)</p>
                    <p className={`text-xs font-medium mt-0.5 ${formData.isEmergency ? 'text-red-600' : 'text-slate-500'}`}>Place patient immediately at the front.</p>
                  </div>
                </label>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className={`w-full mt-2 text-white font-black text-lg py-4 px-6 rounded-2xl shadow-lg transition-all disabled:opacity-70 flex justify-center items-center gap-2 ${formData.isEmergency ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20' : 'bg-[#005da7] hover:bg-[#004b87] shadow-blue-500/20'}`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Token...
                  </>
                ) : (
                  formData.isEmergency ? "Generate Emergency Token" : "Generate Walk-in Token"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

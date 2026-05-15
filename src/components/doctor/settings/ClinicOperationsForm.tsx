"use client";

import { useState } from "react";
import { Wallet, Users, Timer, Info, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ClinicOperationsData {
  fee: string;
  maxCapacity: string;
  averageConsultationTime: string;
}

interface ClinicOperationsFormProps {
  initialData?: ClinicOperationsData;
  onSave: (data: ClinicOperationsData) => Promise<void>;
  isSaving?: boolean;
}

export function ClinicOperationsForm({ initialData, onSave, isSaving }: ClinicOperationsFormProps) {
  const [data, setData] = useState<ClinicOperationsData>(initialData || {
    fee: "0",
    maxCapacity: "40",
    averageConsultationTime: "15"
  });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async () => {
    await onSave(data);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Operational Controls</h3>
          <p className="text-sm text-slate-500">Manage your fees and patient flow limits.</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isSaving || savedSuccess}
          className={`font-bold rounded-xl px-6 shadow-lg shadow-slate-900/20 w-full sm:w-auto transition-all ${savedSuccess ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'}`}
        >
          {isSaving ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </div>
          ) : savedSuccess ? (
            <div className="flex items-center gap-2">
              <span className="text-xl leading-none">✓</span> Saved
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Save className="w-4 h-4" /> Save Controls
            </div>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Fee Setting */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-emerald-600">
              <Wallet className="w-5 h-5" />
            </div>
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Consultation Fee</label>
          </div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400 text-lg">₹</span>
            <Input 
              type="number"
              value={data.fee}
              onChange={(e) => setData({ ...data, fee: e.target.value })}
              className="h-14 pl-10 rounded-xl bg-slate-50 border-none font-black text-2xl text-slate-900 focus-visible:ring-emerald-500/20"
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-3 font-medium">Standard fee per consultation</p>
        </div>

        {/* Capacity Setting */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-primary">
              <Users className="w-5 h-5" />
            </div>
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Daily Capacity</label>
          </div>
          <Input 
            type="number"
            value={data.maxCapacity}
            onChange={(e) => setData({ ...data, maxCapacity: e.target.value })}
            className="h-14 rounded-xl bg-slate-50 border-none font-black text-2xl text-slate-900 focus-visible:ring-primary/20"
          />
          <p className="text-[10px] text-slate-400 mt-3 font-medium">Total Online + Walk-in limit</p>
        </div>

        {/* Avg Time Setting */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Timer className="w-5 h-5" />
            </div>
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Avg Consultation</label>
          </div>
          <div className="relative">
            <Input 
              type="number"
              value={data.averageConsultationTime}
              onChange={(e) => setData({ ...data, averageConsultationTime: e.target.value })}
              className="h-14 pr-16 rounded-xl bg-slate-50 border-none font-black text-2xl text-slate-900 focus-visible:ring-amber-500/20"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">min</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-3 font-medium">Used for wait time estimates</p>
        </div>
      </div>

      <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex gap-3">
        <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-slate-600 leading-relaxed">
          <strong>Note:</strong> Changes to daily capacity will apply to new clinic days. Ongoing queues for today will maintain their current limits unless manually adjusted.
        </p>
      </div>
    </div>
  );
}

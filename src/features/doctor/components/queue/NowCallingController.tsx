import React, { useState, useRef, useEffect } from "react";
import { ArrowRight, PauseCircle, CheckCircle2, User, Loader2, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PatientQueueItem {
  id: string;
  name: string;
  token: number;
  condition: string;
  visitType: string;
  waitTime: number;
  priority: "Standard" | "Emergency";
}

export function HoldToConfirmButton({ onConfirm, children, className, disabled, isLoading, variant = "default" }: any) {
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startHold = () => {
    if (disabled || isLoading) return;
    let p = 0;
    timerRef.current = setInterval(() => {
      p += 5;
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + 5;
      });
      if (p >= 100) {
        if (timerRef.current) clearInterval(timerRef.current);
        onConfirm();
        setTimeout(() => setProgress(0), 200);
      }
    }, 25);
  };

  const endHold = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setProgress(0);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <Button 
      variant={variant}
      onPointerDown={startHold}
      onPointerUp={endHold}
      onPointerLeave={endHold}
      disabled={disabled || isLoading}
      className={`relative overflow-hidden ${className} select-none touch-none`}
    >
      <div 
        className="absolute left-0 top-0 bottom-0 bg-black/10 dark:bg-white/20 transition-all duration-75 ease-linear pointer-events-none" 
        style={{ width: `${progress}%` }} 
      />
      <span className="relative z-10 flex items-center justify-center w-full">
        {progress > 0 && progress < 100 ? "Keep Holding..." : children}
      </span>
    </Button>
  );
}

// SECTION 1: Current Queue Status
export function QueueStatusDisplay({ currentPatient, nextPatient, waitingCount, emergencyCount }: any) {
  if (!currentPatient) {
    return (
      <div className="bg-card rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-4 shadow-sm border border-border">
          <User className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-700">Queue Empty</h3>
        <p className="text-sm text-slate-500 mt-2 font-medium">No patients currently waiting.</p>
      </div>
    );
  }

  const isOverride = currentPatient.condition?.includes("[SYSTEM_AUDIT: CLINIC_CLOSED_OVERRIDE]");
  const cleanCondition = currentPatient.condition?.replace("[SYSTEM_AUDIT: CLINIC_CLOSED_OVERRIDE]", "").trim() || "General";

  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm relative flex flex-col">
      <div className={`absolute left-0 top-0 bottom-0 w-2 ${currentPatient.priority === 'Emergency' ? 'bg-red-600' : 'bg-[#005da7]'}`} />
      
      <div className="p-6 md:p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-md ${currentPatient.priority === 'Emergency' ? 'bg-red-100 text-red-700' : 'bg-blue-50 text-[#005da7]'}`}>
              {currentPatient.priority === 'Emergency' ? 'EMERGENCY - NOW SERVING' : 'NOW SERVING'}
            </span>
            <h2 className="text-4xl font-black text-slate-900 mt-3">Token #{currentPatient.token}</h2>
          </div>
          <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100">
            <User className="w-6 h-6" />
          </div>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-slate-100 text-slate-700 rounded-full flex items-center justify-center font-bold text-xl">
            {currentPatient.name.charAt(0) || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-slate-900">{currentPatient.name}</h3>
              {isOverride && (
                <span className="bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded">
                  OVERRIDE
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 font-medium">{currentPatient.visitType} • {cleanCondition}</p>
          </div>
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Next Up</p>
            {nextPatient ? (
              <p className="font-bold text-slate-900 truncate flex items-center gap-2">
                <span>{nextPatient.name}</span>
                <span className="text-primary text-xs bg-primary/10 px-1.5 py-0.5 rounded">#{nextPatient.token}</span>
              </p>
            ) : (
              <p className="text-sm font-medium text-slate-400 italic">No one waiting</p>
            )}
          </div>
          <div className="flex gap-3">
            <div className="text-center px-3 border-r border-slate-200">
              <p className="text-lg font-black text-slate-900 leading-none">{waitingCount}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Waiting</p>
            </div>
            <div className="text-center px-3">
              <p className={`text-lg font-black leading-none ${emergencyCount > 0 ? 'text-red-600 animate-pulse' : 'text-slate-400'}`}>{emergencyCount}</p>
              <p className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${emergencyCount > 0 ? 'text-red-500' : 'text-slate-400'}`}>Emergency</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// SECTION 3: Clinic Status Controller
export function ClinicStatusToggle({ status, onStatusChange, isLoading }: any) {
  const statuses = [
    { id: "AVAILABLE", label: "Available", color: "emerald" },
    { id: "LIMITED_SLOTS", label: "Busy", color: "orange" },
    { id: "SHORT_BREAK", label: "On Break", color: "amber" },
    { id: "CLINIC_CLOSED", label: "Closed", color: "slate" },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 flex flex-wrap gap-2">
      {statuses.map(s => {
        const isActive = status === s.id;
        const colorClasses = {
          emerald: isActive ? "bg-emerald-600 text-white shadow-md border-emerald-600" : "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100",
          orange: isActive ? "bg-orange-600 text-white shadow-md border-orange-600" : "bg-orange-50 text-orange-700 border-orange-100 hover:bg-orange-100",
          amber: isActive ? "bg-amber-600 text-white shadow-md border-amber-600" : "bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100",
          slate: isActive ? "bg-slate-700 text-white shadow-md border-slate-700" : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100",
        }[s.color];

        return (
          <button
            key={s.id}
            onClick={() => onStatusChange(s.id)}
            disabled={isLoading || isActive}
            className={`flex-1 min-w-[120px] h-14 rounded-2xl font-black text-sm border transition-all active:scale-95 disabled:opacity-80 disabled:scale-100 ${colorClasses}`}
          >
            {s.label}
          </button>
        );
      })}
    </div>
  );
}

// SECTION 4: Quick Actions
export function QuickActionPanel({ onNext, onHold, onNoShow, onResume, isLoading }: any) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <HoldToConfirmButton 
          onConfirm={onNext} 
          isLoading={isLoading} 
          className="w-full h-16 rounded-2xl bg-[#005da7] hover:bg-[#004b87] text-white font-black text-lg shadow-md transition-all active:scale-95"
        >
          {isLoading ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : <ArrowRight className="w-6 h-6 mr-2" />} 
          Call Next Patient
        </HoldToConfirmButton>

        <Button 
          onClick={onHold} 
          disabled={isLoading} 
          variant="outline" 
          className="w-full h-16 rounded-2xl border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-lg transition-all"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <PauseCircle className="w-5 h-5 mr-2" />} 
          Hold Patient
        </Button>

        <Button 
          onClick={() => {
            if (confirm("Mark patient as No-Show?")) {
              onNoShow();
            }
          }} 
          disabled={isLoading} 
          variant="outline" 
          className="w-full h-16 rounded-2xl border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-lg transition-all"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <span className="text-xl mr-2">✕</span>} 
          Mark No-show
        </Button>

        <Button 
          onClick={onResume} 
          disabled={isLoading} 
          variant="outline" 
          className="w-full h-16 rounded-2xl border-emerald-200 text-emerald-600 hover:bg-emerald-50 font-bold text-lg transition-all"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <PlayCircle className="w-5 h-5 mr-2" />} 
          Resume Queue
        </Button>

      </div>
    </div>
  );
}

// Ensure backward compatibility since page.tsx might still import NowCallingController
export function NowCallingController(props: any) {
  return null; // Stubs out the old component
}

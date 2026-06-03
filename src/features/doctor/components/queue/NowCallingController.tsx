import React, { useState, useRef, useEffect } from "react";
import { ArrowRight, PauseCircle, CheckCircle2, User, Loader2 } from "lucide-react";
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

interface NowCallingControllerProps {
  currentPatient: PatientQueueItem | null;
  nextPatient: PatientQueueItem | null;
  waitingCount: number;
  emergencyCount: number;
  onNext: () => void;
  onSkip: () => void; // Used for "Hold"
  onNoShow?: () => void; // Used for "No-Show"
  isLoading?: boolean;
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
        setTimeout(() => setProgress(0), 200); // reset after short delay
      }
    }, 25); // 500ms to confirm
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

export function NowCallingController({ currentPatient, nextPatient, waitingCount, emergencyCount, onNext, onSkip, onNoShow, isLoading = false }: NowCallingControllerProps) {
  if (!currentPatient) {
    return (
      <div className="bg-card rounded-3xl p-8 border-2 border-dashed border-border flex flex-col items-center justify-center text-center h-full min-h-[320px]">
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
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm relative h-full flex flex-col">
      {/* Blue Left Border Accent */}
      <div className={`absolute left-0 top-0 bottom-0 w-2 ${currentPatient.priority === 'Emergency' ? 'bg-red-600' : 'bg-[#005da7]'}`} />
      
      <div className="p-6 md:p-8 flex-1">
        <div className="flex justify-between items-start mb-6">
          <div>
            <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-md ${currentPatient.priority === 'Emergency' ? 'bg-red-100 text-red-700' : 'bg-blue-50 text-[#005da7]'}`}>
              {currentPatient.priority === 'Emergency' ? 'EMERGENCY - NOW CALLING' : 'NOW CALLING'}
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

        {/* Peripheral Next-Up Panel (Desktop only - stacked on mobile) */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
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

      <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex flex-col gap-3">
        <p className="hidden sm:block text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mb-1">Hold to Confirm</p>
        <HoldToConfirmButton 
          onConfirm={onNext} 
          isLoading={isLoading} 
          className="hidden sm:flex w-full h-14 rounded-2xl bg-[#005da7] hover:bg-[#004b87] text-white font-bold text-lg shadow-md transition-all active:scale-95"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <CheckCircle2 className="w-5 h-5 mr-2" />} 
          Mark Served & Call Next
        </HoldToConfirmButton>
        <div className="flex gap-3 w-full">
          <Button 
            onClick={onSkip} 
            disabled={isLoading} 
            variant="outline" 
            className="flex-1 h-12 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-bold transition-all disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <PauseCircle className="w-4 h-4 mr-2" />} 
            Hold (Skip)
          </Button>
          <Button 
            onClick={() => {
              if (confirm("Mark patient as No-Show? They will lose their queue position.")) {
                if (onNoShow) onNoShow();
              }
            }} 
            disabled={isLoading} 
            variant="outline" 
            className="flex-1 h-12 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-bold transition-all disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <span className="font-bold mr-1">✕</span>} 
            No-Show
          </Button>
        </div>
      </div>
    </div>
  );
}

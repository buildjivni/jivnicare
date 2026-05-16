import { ArrowRight, SkipForward, User } from "lucide-react";
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
  onNext: () => void;
  onSkip: () => void;
  isLoading?: boolean;
}

export function NowCallingController({ currentPatient, onNext, onSkip, isLoading = false }: NowCallingControllerProps) {
  if (!currentPatient) {
    return (
      <div className="bg-card rounded-2xl p-8 border-2 border-dashed border-border flex flex-col items-center justify-center text-center h-full min-h-[320px]">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-4 shadow-sm border border-border">
          <User className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-700">Queue Empty</h3>
        <p className="text-sm text-slate-500 mt-2 font-medium">No patients currently waiting.</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-premium relative h-full flex flex-col">
      {/* Blue Left Border Accent */}
      <div className="absolute left-0 top-0 bottom-0 w-2 bg-primary" />
      
      <div className="p-6 md:p-8 flex-1">
        <div className="flex justify-between items-start mb-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1.5 rounded-md">Now Calling</span>
            <h2 className="text-4xl font-black text-slate-900 mt-3">Token #{currentPatient.token}</h2>
          </div>
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
            <User className="w-6 h-6" />
          </div>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-xl border-2 border-white shadow-sm ring-2 ring-emerald-50">
            {currentPatient.name.charAt(0) || 'U'}
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">{currentPatient.name}</h3>
            <p className="text-sm text-slate-500 font-medium">{currentPatient.visitType} • {currentPatient.condition}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Wait Time</p>
            <p className="text-lg font-black text-slate-900">{currentPatient.waitTime} Mins</p>
          </div>
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Priority</p>
            <p className={`text-lg font-black ${currentPatient.priority === 'Emergency' ? 'text-red-600' : 'text-amber-600'}`}>
              {currentPatient.priority}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 bg-slate-50 border-t border-border flex flex-col sm:flex-row items-center gap-3">
        <div className="flex w-full gap-3">
          <Button onClick={onNext} disabled={isLoading} className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed">
            {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> : <ArrowRight className="w-4 h-4 mr-2" />} 
            Call Next Patient
          </Button>
          <Button onClick={onSkip} disabled={isLoading} variant="outline" className="flex-1 h-12 rounded-xl border-border text-slate-700 hover:bg-slate-100 font-bold active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-sm">
            {isLoading ? <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin mr-2" /> : <SkipForward className="w-4 h-4 mr-2 text-slate-400" />} 
            Skip Token
          </Button>
        </div>
      </div>
    </div>
  );
}

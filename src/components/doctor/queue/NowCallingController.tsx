import { ArrowRight, PauseCircle, SkipForward, User } from "lucide-react";
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
  onPause: () => void;
}

export function NowCallingController({ currentPatient, onNext, onSkip, onPause }: NowCallingControllerProps) {
  if (!currentPatient) {
    return (
      <div className="bg-white rounded-3xl p-8 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center h-full min-h-[320px]">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-4">
          <User className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-700">Queue Empty</h3>
        <p className="text-sm text-slate-500 mt-2">No patients currently waiting.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm relative h-full flex flex-col">
      {/* Blue Left Border Accent */}
      <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#005da7]" />
      
      <div className="p-6 md:p-8 flex-1">
        <div className="flex justify-between items-start mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#005da7] bg-blue-50 px-2 py-1 rounded-md">Now Calling</span>
            <h2 className="text-4xl font-black text-slate-900 mt-2">Token #{currentPatient.token}</h2>
          </div>
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
            <User className="w-6 h-6" />
          </div>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-xl border-2 border-white shadow-sm ring-2 ring-emerald-50">
            {currentPatient.name.charAt(0)}
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

      <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
        <Button onClick={onNext} className="flex-1 h-12 rounded-xl bg-[#005da7] hover:bg-[#004883] text-white font-bold text-base shadow-lg shadow-blue-500/20">
          <ArrowRight className="w-4 h-4 mr-2" /> Next
        </Button>
        <Button onClick={onSkip} variant="outline" className="flex-1 h-12 rounded-xl border-slate-200 text-slate-700 hover:bg-white font-bold">
          <SkipForward className="w-4 h-4 mr-2 text-slate-400" /> Skip
        </Button>
        <Button onClick={onPause} variant="outline" className="flex-1 h-12 rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-bold">
          <PauseCircle className="w-4 h-4 mr-2" /> Pause
        </Button>
      </div>
    </div>
  );
}

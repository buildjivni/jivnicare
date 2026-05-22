import { Bell, Settings, UserPlus } from "lucide-react";

interface QueueOperationsMenuProps {
  onAddOffline: () => void;
  onPauseToggle: () => void;
  onEmergencyHalt: () => void;
  isPaused?: boolean;
  compounderNote?: string;
}

export function QueueOperationsMenu({ onAddOffline, onPauseToggle, onEmergencyHalt, isPaused, compounderNote }: QueueOperationsMenuProps) {
  return (
    <div className="flex flex-col h-full gap-4">
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm flex-1">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-900">Queue Operations</h2>
          <button title="Coming Soon" className="flex items-center gap-1 text-sm font-bold text-[#005da7] bg-blue-50 px-3 py-1.5 rounded-full opacity-60 cursor-not-allowed">
            <Settings className="w-4 h-4" /> Config
          </button>
        </div>
        
        <p className="text-sm text-slate-500 mb-6 leading-relaxed max-w-sm">
          Add patients arriving directly at the clinic to the live digital queue. All patients follow a sequential order.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={onAddOffline}
            className="col-span-1 md:col-span-2 flex flex-col items-start p-5 rounded-2xl border-2 border-slate-100 hover:border-[#005da7] hover:bg-blue-50/50 transition-all text-left group w-full"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#005da7] flex items-center justify-center mb-4 group-hover:bg-[#005da7] group-hover:text-white transition-colors">
              <UserPlus className="w-5 h-5" />
            </div>
            <div className="w-full">
              <span className="font-bold text-slate-900 text-base mb-1 block">Add Offline Patient (Walk-in)</span>
              <span className="text-xs text-slate-500 font-medium">Issue a physical token number that integrates with the online queue.</span>
            </div>
          </button>

          <button 
            onClick={() => {
              if(window.confirm(isPaused ? "Resume digital queue?" : "Pause digital queue for 15 minutes? Patients will be notified of the delay.")) {
                onPauseToggle();
              }
            }}
            className={`flex flex-col items-start p-4 rounded-2xl border transition-all text-left group w-full ${isPaused ? 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100' : 'border-amber-200 bg-amber-50 hover:bg-amber-100'}`}
          >
            <span className={`font-bold text-sm mb-1 block ${isPaused ? 'text-emerald-900' : 'text-amber-900'}`}>{isPaused ? 'Resume Queue' : 'Take a Break (15m)'}</span>
            <span className={`text-[10px] font-medium leading-tight ${isPaused ? 'text-emerald-700' : 'text-amber-700'}`}>{isPaused ? 'Start accepting tokens again.' : 'Temporarily pause queue advancement.'}</span>
          </button>

          <button 
            onClick={() => {
              if(window.confirm("EMERGENCY: Are you sure you want to halt all OPD operations today? All waiting patients will be notified.")) {
                onEmergencyHalt();
              }
            }}
            className="flex flex-col items-start p-4 rounded-2xl border border-red-200 bg-red-50 hover:bg-red-100 transition-all text-left group w-full"
          >
            <span className="font-bold text-red-900 text-sm mb-1 block">Emergency Halt OPD</span>
            <span className="text-[10px] text-red-700 font-medium leading-tight">Cancel all remaining tokens today.</span>
          </button>
        </div>
      </div>

      {compounderNote && (
        <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100 flex items-start gap-3">
          <Bell className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-orange-700 uppercase tracking-wider mb-1">Compounder Note:</p>
            <p className="text-sm text-orange-800 font-medium leading-relaxed italic">
              "{compounderNote}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

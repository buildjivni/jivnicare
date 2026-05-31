import { useState } from "react";
import { Bell, Settings, UserPlus, AlertTriangle, X } from "lucide-react";

interface QueueOperationsMenuProps {
  onAddOffline: (isEmergency?: boolean) => void;
  onPauseToggle: () => void;
  onEmergencyHalt: () => void;
  isPaused?: boolean;
  compounderNote?: string;
}

export function QueueOperationsMenu({ onAddOffline, onPauseToggle, onEmergencyHalt, isPaused, compounderNote }: QueueOperationsMenuProps) {
  const [modalState, setModalState] = useState<"NONE" | "PAUSE" | "HALT">("NONE");
  const [haltConfirmText, setHaltConfirmText] = useState("");

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Custom Modals */}
      {modalState !== "NONE" && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            {modalState === "PAUSE" && (
              <>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{isPaused ? "Resume Queue?" : "Take a Break (15m)?"}</h3>
                <p className="text-slate-500 text-sm mb-6">
                  {isPaused ? "Start accepting and calling tokens again." : "Temporarily pause queue advancement. Patients will be notified of the delay."}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setModalState("NONE")} className="h-12 rounded-xl font-bold border border-slate-200 text-slate-600 hover:bg-slate-50">Cancel</button>
                  <button onClick={() => { onPauseToggle(); setModalState("NONE"); }} className="h-12 rounded-xl font-bold bg-[#005da7] text-white hover:bg-[#004b87]">Confirm</button>
                </div>
              </>
            )}
            
            {modalState === "HALT" && (
              <>
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4 text-red-600">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Emergency Halt OPD?</h3>
                <p className="text-slate-500 text-sm mb-4">
                  Are you sure you want to halt all OPD operations today? All remaining tokens will be canceled and patients will be notified. <strong className="text-red-600">This action cannot be undone.</strong>
                </p>
                <div className="mb-6">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2 block">Type "HALT" to confirm</label>
                  <input 
                    type="text" 
                    value={haltConfirmText}
                    onChange={(e) => setHaltConfirmText(e.target.value)}
                    placeholder="HALT"
                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-red-500 focus:ring-4 focus:ring-red-50 text-center font-black uppercase tracking-widest text-slate-900"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => { setModalState("NONE"); setHaltConfirmText(""); }} className="h-12 rounded-xl font-bold border border-slate-200 text-slate-600 hover:bg-slate-50">Cancel</button>
                  <button 
                    disabled={haltConfirmText.toUpperCase() !== "HALT"}
                    onClick={() => { onEmergencyHalt(); setModalState("NONE"); setHaltConfirmText(""); }} 
                    className="h-12 rounded-xl font-black bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Confirm Halt
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm flex-1">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-900">Queue Operations</h2>
          <button title="Coming Soon" className="flex items-center gap-1 text-sm font-bold text-[#005da7] bg-blue-50 px-3 py-1.5 rounded-full opacity-60 cursor-not-allowed">
            <Settings className="w-4 h-4" /> Config
          </button>
        </div>
        
        <p className="text-sm text-slate-500 mb-6 leading-relaxed max-w-sm">
          Manage digital queue operations. Add walk-ins or trigger emergency priority.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={() => onAddOffline(false)}
            className="col-span-1 flex flex-col items-start p-5 rounded-2xl border-2 border-slate-100 hover:border-[#005da7] hover:bg-blue-50/50 transition-all text-left group w-full"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#005da7] flex items-center justify-center mb-4 group-hover:bg-[#005da7] group-hover:text-white transition-colors">
              <UserPlus className="w-5 h-5" />
            </div>
            <div className="w-full">
              <span className="font-bold text-slate-900 text-base mb-1 block">Add Walk-in</span>
              <span className="text-xs text-slate-500 font-medium">Standard digital token.</span>
            </div>
          </button>

          <button 
            onClick={() => onAddOffline(true)}
            className="col-span-1 flex flex-col items-start p-5 rounded-2xl border-2 border-slate-100 hover:border-red-500 hover:bg-red-50/50 transition-all text-left group w-full"
          >
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-4 group-hover:bg-red-600 group-hover:text-white transition-colors">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="w-full">
              <span className="font-bold text-slate-900 text-base mb-1 block">Add Emergency</span>
              <span className="text-xs text-slate-500 font-medium">Jump to front of queue.</span>
            </div>
          </button>

          <button 
            onClick={() => setModalState("PAUSE")}
            className={`flex flex-col items-start p-4 rounded-2xl border transition-all text-left group w-full ${isPaused ? 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100' : 'border-amber-200 bg-amber-50 hover:bg-amber-100'}`}
          >
            <span className={`font-bold text-sm mb-1 block ${isPaused ? 'text-emerald-900' : 'text-amber-900'}`}>{isPaused ? 'Resume Queue' : 'Take a Break (15m)'}</span>
            <span className={`text-[10px] font-medium leading-tight ${isPaused ? 'text-emerald-700' : 'text-amber-700'}`}>{isPaused ? 'Start accepting tokens again.' : 'Temporarily pause queue advancement.'}</span>
          </button>

          <button 
            onClick={() => setModalState("HALT")}
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

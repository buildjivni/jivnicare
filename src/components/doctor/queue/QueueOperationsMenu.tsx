import { Bell, Settings, UserPlus } from "lucide-react";

interface QueueOperationsMenuProps {
  onAddOffline: () => void;
  compounderNote?: string;
}

export function QueueOperationsMenu({ onAddOffline, compounderNote }: QueueOperationsMenuProps) {
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

        <div className="grid grid-cols-1 gap-4">
          <button 
            onClick={onAddOffline}
            className="flex flex-col items-start p-5 rounded-2xl border-2 border-slate-100 hover:border-[#005da7] hover:bg-blue-50/50 transition-all text-left group w-full"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#005da7] flex items-center justify-center mb-4 group-hover:bg-[#005da7] group-hover:text-white transition-colors">
              <UserPlus className="w-5 h-5" />
            </div>
            <div className="w-full">
              <span className="font-bold text-slate-900 text-base mb-1 block">Add Offline Patient (Walk-in)</span>
              <span className="text-xs text-slate-500 font-medium">Issue a physical token number that integrates with the online queue.</span>
            </div>
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

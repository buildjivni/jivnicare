import React, { useState, useMemo } from "react";
import { Filter, History, MoreHorizontal, Search, PauseCircle, PlayCircle, CheckCircle2, UserX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion, useMotionValue, useTransform } from "framer-motion";

export interface PatientListItem {
  id: string;
  name: string;
  token: number;
  condition: string;
  visitType: string;
  waitTime: number;
  priority: "Standard" | "Emergency";
  status: "Waiting" | "Served" | "Held" | "In-Person";
  appointmentTime: string;
  initials: string;
  location?: string;
}

interface PatientListTableProps {
  patients: PatientListItem[];
  onHold?: (id: string) => void;
  onRecall?: (id: string) => void;
  onServe?: (id: string) => void;
  onNoShow?: (id: string) => void; // PR-1: Doctor-side no-show action
}

const getStatusBadge = (status: PatientListItem["status"]) => {
  switch (status) {
    case "Waiting":
      return <span className="bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold">Waiting</span>;
    case "Served":
      return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold">Served</span>;
    case "Held":
      return <span className="bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold">Held</span>;
    case "In-Person":
      return <span className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" /> In-Person</span>;
    default:
      return null;
  }
};

function SwipeablePatientCard({ patient, onHold, onRecall, onServe }: { patient: PatientListItem, onHold?: (id: string) => void, onRecall?: (id: string) => void, onServe?: (id: string) => void }) {
  const x = useMotionValue(0);
  const [revealed, setRevealed] = useState(false);

  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.x < -60) {
      setRevealed(true);
    } else if (info.offset.x > 0) {
      setRevealed(false);
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden mb-4 bg-slate-100">
      {/* Background Actions */}
      <div className="absolute inset-0 flex items-center justify-end px-4 gap-2 bg-slate-800">
        {patient.status === "Held" ? (
          <button onClick={() => onRecall?.(patient.id)} className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-sm">
            <PlayCircle className="w-5 h-5" />
          </button>
        ) : patient.status === "Waiting" ? (
          <button onClick={() => onHold?.(patient.id)} className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-sm">
            <PauseCircle className="w-5 h-5" />
          </button>
        ) : null}
        
        {patient.status !== "Served" && (
          <button onClick={() => onServe?.(patient.id)} className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-sm">
            <CheckCircle2 className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Foreground Card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -140, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        animate={{ x: revealed ? -140 : 0 }}
        style={{ x }}
        className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col gap-3 relative z-10"
      >
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
             <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${patient.priority === "Emergency" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-700"}`}>
               {patient.initials}
             </div>
             <div>
               <p className="font-bold text-slate-900 flex items-center gap-2">
                 {patient.name}
                 {patient.priority === "Emergency" && (
                   <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-md border border-red-200 uppercase tracking-wider">Emergency</span>
                 )}
               </p>
               <p className="text-xs text-slate-500 font-medium mt-1">
                 {patient.visitType === "Walk-in" ? (
                   <span className="bg-blue-100 text-[#005da7] font-bold px-2 py-0.5 rounded-md border border-blue-200">Walk-in</span>
                 ) : (
                   <span className="bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-md border border-slate-200">Online</span>
                 )}
                 {" "}• {patient.appointmentTime}
               </p>
               {patient.location && (
                 <p className="text-[10px] font-bold text-primary flex items-center gap-1 mt-1">
                   <Filter className="w-2.5 h-2.5 rotate-90" /> {patient.location}
                 </p>
               )}
             </div>
           </div>
           <div className="text-right">
             <span className="font-black text-xl text-primary">#{patient.token}</span>
           </div>
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-slate-100">
          <div>{getStatusBadge(patient.status)}</div>
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
             Swipe left for actions <ArrowLeftIcon />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ArrowLeftIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
  );
}

export function PatientListTable({ patients, onHold, onRecall, onServe, onNoShow }: PatientListTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"All" | "Waiting" | "Held" | "Emergency">("All");
  // PR-1: No-Show confirmation state — tracks which patient is pending confirmation
  const [noShowConfirmId, setNoShowConfirmId] = useState<string | null>(null);

  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      // Status/Priority Filter
      if (filter === "Waiting" && p.status !== "Waiting") return false;
      if (filter === "Held" && p.status !== "Held") return false;
      if (filter === "Emergency" && p.priority !== "Emergency") return false;

      // Search Query Filter
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesToken = p.token.toString().includes(query);
        if (!matchesName && !matchesToken) return false;
      }
      return true;
    });
  }, [patients, filter, searchTerm]);

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm mt-6 mb-24 md:mb-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-slate-900">Queue List</h2>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input 
              placeholder="Search by name or token..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-11 w-full bg-slate-50 border-slate-200 rounded-xl text-sm font-medium focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex overflow-x-auto gap-2 mb-6 pb-2 scrollbar-hide">
        {["All", "Waiting", "Held", "Emergency"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${filter === f ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Patient Name</th>
              <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Token</th>
              <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Location</th>
              <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
              <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Type</th>
              <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((patient) => (
              <tr key={patient.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors group">
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex-shrink-0 flex items-center justify-center text-slate-600 font-bold text-sm">
                      {patient.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate max-w-[120px] sm:max-w-none flex items-center flex-wrap gap-2">
                        <span>{patient.condition?.includes("[SYSTEM_AUDIT: CLINIC_CLOSED_OVERRIDE]") ? patient.name.replace(" (Emergency Override)", "") : patient.name}</span>
                        {patient.priority === "Emergency" && (
                           <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-md border border-red-200 uppercase tracking-wider">Emergency</span>
                        )}
                        {patient.condition?.includes("[SYSTEM_AUDIT: CLINIC_CLOSED_OVERRIDE]") && (
                           <span className="text-[10px] bg-red-600 text-white font-bold px-2 py-0.5 rounded-md border border-red-700 uppercase tracking-wider">OVERRIDE</span>
                        )}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-4 text-center">
                  <span className="font-black text-primary text-lg">#{patient.token}</span>
                </td>
                <td className="py-4 hidden lg:table-cell">
                  <span className="text-sm font-bold text-slate-600 truncate max-w-[100px] block" title={patient.location || "N/A"}>
                    {patient.location || "N/A"}
                  </span>
                </td>
                <td className="py-4">
                  {getStatusBadge(patient.status)}
                </td>
                <td className="py-4 hidden sm:table-cell">
                  {patient.visitType === "Walk-in" ? (
                    <span className="bg-blue-100 text-[#005da7] font-bold px-2 py-1 rounded-lg border border-blue-200 text-[10px] uppercase tracking-widest">Walk-in</span>
                  ) : (
                    <span className="bg-slate-100 text-slate-600 font-bold px-2 py-1 rounded-lg border border-slate-200 text-[10px] uppercase tracking-widest">Online</span>
                  )}
                </td>
                <td className="py-4 text-right">
                  <div className="flex justify-end gap-2 flex-wrap">
                    {patient.status === "Held" && (
                      <button onClick={() => onRecall?.(patient.id)} className="px-3 py-1.5 bg-blue-50 text-[#005da7] hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors">
                        Recall
                      </button>
                    )}
                    {patient.status === "Waiting" && (
                      <button onClick={() => onHold?.(patient.id)} className="px-3 py-1.5 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-lg text-xs font-bold transition-colors">
                        Hold
                      </button>
                    )}
                    {patient.status !== "Served" && (
                      <button onClick={() => onServe?.(patient.id)} className="px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors">
                        Serve
                      </button>
                    )}
                    {/* PR-1: No-Show action — only for WAITING or Held patients */}
                    {(patient.status === "Waiting" || patient.status === "Held") && onNoShow && (
                      noShowConfirmId === patient.id ? (
                        <div className="flex gap-1.5 items-center">
                          <button
                            onClick={() => { onNoShow(patient.id); setNoShowConfirmId(null); }}
                            className="px-3 py-1.5 bg-red-600 text-white hover:bg-red-700 rounded-lg text-xs font-bold transition-colors"
                          >
                            Confirm No-Show
                          </button>
                          <button
                            onClick={() => setNoShowConfirmId(null)}
                            className="px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg text-xs font-bold transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setNoShowConfirmId(patient.id)}
                          className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                        >
                          <UserX className="w-3 h-3" /> No-Show
                        </button>
                      )
                    )}
                    {patient.status === "Served" && (
                      <button aria-label="View history" className="p-2 text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center">
                        <History className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View with Swipe to Reveal */}
      <div className="md:hidden overflow-hidden -mx-2 px-2">
        {filteredPatients.map((patient) => (
           <SwipeablePatientCard key={patient.id} patient={patient} onHold={onHold} onRecall={onRecall} onServe={onServe} />
        ))}
      </div>

      {filteredPatients.length === 0 && (
        <div className="text-center py-16 px-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 mt-4 flex flex-col items-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100">
            <Search className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Patients Found</h3>
          <p className="text-slate-500 font-medium mt-1 max-w-sm text-sm">
            {searchTerm ? "No results match your search." : "Your queue list is currently empty."}
          </p>
        </div>
      )}
    </div>
  );
}

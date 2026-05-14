import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#f7f9fc] flex flex-col items-center justify-center p-4">
      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-slate-100">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
      <p className="text-sm font-bold text-slate-500 animate-pulse">Loading JivniCare...</p>
    </div>
  );
}

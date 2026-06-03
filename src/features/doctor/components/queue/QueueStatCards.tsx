import { CheckCircle2, Timer, Users, UserX, Activity } from "lucide-react";

interface QueueStatCardsProps {
  patientsServed: number;
  currentQueue: number;
  noShowCount: number;
  avgWaitTime: number; // in mins
}

export function QueueStatCards({ patientsServed, currentQueue, noShowCount, avgWaitTime }: QueueStatCardsProps) {
  // Calculate Queue Health Status
  const isHealthy = avgWaitTime < 30;
  
  return (
    <div className="mb-6">
      {/* Queue Health Banner */}
      <div className={`mb-4 p-4 rounded-2xl border flex items-center justify-between shadow-sm transition-colors ${isHealthy ? 'bg-emerald-50 border-emerald-100' : 'bg-orange-50 border-orange-100'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${isHealthy ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h4 className={`text-sm font-bold ${isHealthy ? 'text-emerald-900' : 'text-orange-900'}`}>
              {isHealthy ? "Queue Operating Smoothly" : "Queue Experiencing Delays"}
            </h4>
            <p className={`text-xs font-medium mt-0.5 ${isHealthy ? 'text-emerald-700' : 'text-orange-700'}`}>
              {isHealthy ? "Wait times and volumes are within normal limits." : "High patient volume is impacting wait times."}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap lg:flex-nowrap gap-4">
        
        {/* Waiting (Primary Focus) */}
        <div className="flex-1 min-w-[150px] bg-[#005da7] rounded-2xl p-5 shadow-md flex flex-col justify-between hover:-translate-y-1 transition-transform border border-[#004b87]">
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-bold text-blue-100 uppercase tracking-widest">Waiting</p>
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white backdrop-blur-sm border border-white/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-white mt-3">{currentQueue}</h3>
            <p className="text-[10px] font-bold text-blue-100 mt-1">In Queue</p>
          </div>
        </div>

        {/* Patients Served */}
        <div className="flex-1 min-w-[150px] bg-white rounded-2xl p-5 border border-slate-200 shadow-soft flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Served</p>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-900 mt-3">{patientsServed}</h3>
            <p className="text-[10px] font-bold text-emerald-600 mt-1">Completed today</p>
          </div>
        </div>

        {/* No-show Count */}
        <div className="flex-1 min-w-[150px] bg-white rounded-2xl p-5 border border-slate-200 shadow-soft flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">No-Show</p>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-900 mt-3">{noShowCount}</h3>
            <p className="text-[10px] font-bold text-slate-500 mt-1">Missed turns</p>
          </div>
        </div>

        {/* Avg Wait Time */}
        <div className="flex-1 min-w-[150px] bg-white rounded-2xl p-5 border border-slate-200 shadow-soft flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Avg Wait</p>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Timer className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-900 mt-3">{avgWaitTime} <span className="text-sm text-slate-500 font-bold">min</span></h3>
            <p className="text-[10px] font-bold text-amber-600 mt-1">Estimated Wait</p>
          </div>
        </div>

      </div>
    </div>
  );
}

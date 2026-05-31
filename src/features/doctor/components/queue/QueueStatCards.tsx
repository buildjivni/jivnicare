import { CalendarCheck, CheckCircle2, Timer, Users, AlertCircle, PauseCircle, Activity } from "lucide-react";

interface QueueStatCardsProps {
  totalAppointments: number;
  patientsServed: number;
  avgWaitTime: number; // in mins
  currentQueue: number;
  emergencyCount: number;
  heldCount: number;
}

export function QueueStatCards({ totalAppointments, patientsServed, avgWaitTime, currentQueue, emergencyCount, heldCount }: QueueStatCardsProps) {
  // Calculate Queue Health Status
  const isHealthy = avgWaitTime < 30 && emergencyCount < 3;
  
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
              {isHealthy ? "Wait times and volumes are within normal limits." : "High patient volume or emergency cases are impacting wait times."}
            </p>
          </div>
        </div>
      </div>

      <div className="flex overflow-x-auto gap-4 pb-2 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 lg:grid-cols-6 sm:gap-4 sm:pb-0">
        
        {/* Waiting (Primary Focus) */}
        <div className="shrink-0 snap-start w-[180px] sm:w-auto bg-[#005da7] rounded-2xl p-5 shadow-md flex flex-col justify-between hover:-translate-y-1 transition-transform border border-[#004b87]">
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-bold text-blue-100 uppercase tracking-widest">Waiting</p>
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white backdrop-blur-sm border border-white/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-white mt-3">{currentQueue}</h3>
            <p className="text-[10px] font-bold text-blue-100 mt-1">In Waiting Room</p>
          </div>
        </div>

        {/* Avg Wait Time */}
        <div className="shrink-0 snap-start w-[180px] sm:w-auto bg-card rounded-2xl p-5 border border-border shadow-soft flex flex-col justify-between hover:shadow-premium transition-shadow">
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Avg Wait</p>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Timer className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-900 mt-3">{avgWaitTime} <span className="text-sm text-slate-500 font-bold">min</span></h3>
            <p className="text-[10px] font-bold text-amber-600 mt-1">Current average</p>
          </div>
        </div>

        {/* Emergency Count */}
        <div className="shrink-0 snap-start w-[180px] sm:w-auto bg-card rounded-2xl p-5 border border-border shadow-soft flex flex-col justify-between hover:shadow-premium transition-shadow">
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Emergency</p>
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-900 mt-3">{emergencyCount}</h3>
            <p className="text-[10px] font-bold text-red-600 mt-1">Active priority</p>
          </div>
        </div>

        {/* Held Count */}
        <div className="shrink-0 snap-start w-[180px] sm:w-auto bg-card rounded-2xl p-5 border border-border shadow-soft flex flex-col justify-between hover:shadow-premium transition-shadow">
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Held</p>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <PauseCircle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-900 mt-3">{heldCount}</h3>
            <p className="text-[10px] font-bold text-slate-500 mt-1">Delayed/Skipped</p>
          </div>
        </div>

        {/* Patients Served */}
        <div className="shrink-0 snap-start w-[180px] sm:w-auto bg-card rounded-2xl p-5 border border-border shadow-soft flex flex-col justify-between hover:shadow-premium transition-shadow hidden sm:flex">
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

        {/* Total Appointments */}
        <div className="shrink-0 snap-start w-[180px] sm:w-auto bg-card rounded-2xl p-5 border border-border shadow-soft flex flex-col justify-between hover:shadow-premium transition-shadow hidden lg:flex">
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total</p>
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-600">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-900 mt-3">{totalAppointments}</h3>
            <p className="text-[10px] font-bold text-slate-500 mt-1">Daily Capacity</p>
          </div>
        </div>

      </div>
    </div>
  );
}

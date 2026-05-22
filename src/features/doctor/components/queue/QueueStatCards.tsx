import { CalendarCheck, CheckCircle2, Timer, Users } from "lucide-react";

interface QueueStatCardsProps {
  totalAppointments: number;
  patientsServed: number;
  avgWaitTime: number; // in mins
  currentQueue: number;
}

export function QueueStatCards({ totalAppointments, patientsServed, avgWaitTime, currentQueue }: QueueStatCardsProps) {
  return (
    <div className="flex overflow-x-auto gap-4 mb-6 pb-2 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-4 sm:pb-0">
      {/* Total Appointments */}
      <div className="shrink-0 snap-start w-[240px] sm:w-auto bg-card rounded-2xl p-6 border border-border shadow-soft flex flex-col justify-between hover:shadow-premium transition-shadow">
        <div className="flex justify-between items-start">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Appts</p>
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <CalendarCheck className="w-5 h-5" />
          </div>
        </div>
        <div>
          <h3 className="text-3xl font-black text-slate-900 mt-4">{totalAppointments}</h3>
          <p className="text-xs font-bold text-emerald-600 mt-1">Daily Capacity</p>
        </div>
      </div>

      {/* Patients Served */}
      <div className="shrink-0 snap-start w-[240px] sm:w-auto bg-card rounded-2xl p-6 border border-border shadow-soft flex flex-col justify-between hover:shadow-premium transition-shadow">
        <div className="flex justify-between items-start">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Served</p>
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <div>
          <h3 className="text-3xl font-black text-slate-900 mt-4">{patientsServed}</h3>
          <p className="text-xs font-bold text-slate-500 mt-1">Completed today</p>
        </div>
      </div>

      {/* Avg Wait Time */}
      <div className="shrink-0 snap-start w-[240px] sm:w-auto bg-card rounded-2xl p-6 border border-border shadow-soft flex flex-col justify-between hover:shadow-premium transition-shadow">
        <div className="flex justify-between items-start">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Avg Wait</p>
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Timer className="w-5 h-5" />
          </div>
        </div>
        <div>
          <h3 className="text-3xl font-black text-slate-900 mt-4">{avgWaitTime} <span className="text-lg text-slate-500 font-bold">min</span></h3>
          <p className="text-xs font-bold text-amber-600 mt-1">Current average</p>
        </div>
      </div>

      {/* Current Queue */}
      <div className="shrink-0 snap-start w-[240px] sm:w-auto bg-emerald-600 rounded-2xl p-6 shadow-premium shadow-emerald-600/20 flex flex-col justify-between hover:-translate-y-1 transition-transform border border-emerald-500">
        <div className="flex justify-between items-start">
          <p className="text-xs font-bold text-emerald-100 uppercase tracking-widest">Waiting</p>
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white backdrop-blur-sm border border-white/20">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div>
          <h3 className="text-4xl font-black text-white mt-4">{currentQueue}</h3>
          <p className="text-xs font-bold text-emerald-100 mt-1">In Waiting Room</p>
        </div>
      </div>
    </div>
  );
}

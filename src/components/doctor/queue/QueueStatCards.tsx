import { CalendarCheck, CheckCircle2, Timer, Users } from "lucide-react";

interface QueueStatCardsProps {
  totalAppointments: number;
  patientsServed: number;
  avgWaitTime: number; // in mins
  currentQueue: number;
}

export function QueueStatCards({ totalAppointments, patientsServed, avgWaitTime, currentQueue }: QueueStatCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Appointments */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
          <p className="text-sm font-bold text-slate-500">Total<br/>Appointments</p>
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#005da7]">
            <CalendarCheck className="w-5 h-5" />
          </div>
        </div>
        <div>
          <h3 className="text-3xl font-black text-slate-900 mt-4">{totalAppointments}</h3>
          <p className="text-xs font-bold text-[#005da7] mt-1">+12% from yesterday</p>
        </div>
      </div>

      {/* Patients Served */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
          <p className="text-sm font-bold text-slate-500">Patients<br/>Served</p>
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <div>
          <h3 className="text-3xl font-black text-slate-900 mt-4">{patientsServed}</h3>
          <p className="text-xs font-bold text-slate-500 mt-1">Next: Token #{patientsServed + 1}</p>
        </div>
      </div>

      {/* Avg Wait Time */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
          <p className="text-sm font-bold text-slate-500">Avg. Wait<br/>Time</p>
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
            <Timer className="w-5 h-5" />
          </div>
        </div>
        <div>
          <h3 className="text-3xl font-black text-slate-900 mt-4">{avgWaitTime} <span className="text-lg text-slate-500 font-bold">min</span></h3>
          <p className="text-xs font-bold text-emerald-500 mt-1">Optimized flow</p>
        </div>
      </div>

      {/* Current Queue */}
      <div className="bg-[#005da7] rounded-3xl p-6 shadow-lg shadow-[#005da7]/20 flex flex-col justify-between hover:-translate-y-1 transition-transform">
        <div className="flex justify-between items-start">
          <p className="text-sm font-bold text-blue-100">Current<br/>Queue</p>
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div>
          <h3 className="text-4xl font-black text-white mt-4">{currentQueue}</h3>
          <p className="text-xs font-medium text-blue-100 mt-1">Patients in Waiting Room</p>
        </div>
      </div>
    </div>
  );
}

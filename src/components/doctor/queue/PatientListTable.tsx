import { Filter, History, MoreHorizontal, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export interface PatientListItem {
  id: string;
  name: string;
  token: number;
  condition: string;
  visitType: string;
  waitTime: number;
  priority: "Standard" | "Emergency";
  status: "Waiting" | "Served" | "Delayed" | "In-Person";
  appointmentTime: string;
  initials: string;
}

interface PatientListTableProps {
  patients: PatientListItem[];
}

export function PatientListTable({ patients }: PatientListTableProps) {
  const getStatusBadge = (status: PatientListItem["status"]) => {
    switch (status) {
      case "Waiting":
        return <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">● Waiting</span>;
      case "Served":
        return <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">✔ Served</span>;
      case "Delayed":
        return <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold">● Delayed</span>;
      case "In-Person":
        return <span className="bg-purple-50 text-purple-600 px-3 py-1 rounded-full text-xs font-bold">● In-Person</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h2 className="text-xl font-bold text-slate-900">Today's Appointment List</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input 
              placeholder="Search patients..." 
              className="pl-9 h-10 w-full sm:w-64 bg-slate-50 border-slate-200 rounded-xl text-sm"
            />
          </div>
          <button className="h-10 w-10 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Patient Name</th>
              <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Token</th>
              <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Appt. Time</th>
              <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
              <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Type</th>
              <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr key={patient.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors group">
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm">
                      {patient.initials}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{patient.name}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 text-center">
                  <span className="font-black text-[#005da7]">#{patient.token}</span>
                </td>
                <td className="py-4">
                  <span className="text-sm font-bold text-slate-600">{patient.appointmentTime}</span>
                </td>
                <td className="py-4">
                  {getStatusBadge(patient.status)}
                </td>
                <td className="py-4">
                  <span className="text-sm text-slate-500 font-medium">{patient.visitType}</span>
                </td>
                <td className="py-4 text-right">
                  {patient.status === "Served" ? (
                    <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                      <History className="w-5 h-5 inline" />
                    </button>
                  ) : (
                    <button className="p-2 text-slate-400 hover:text-[#005da7] transition-colors">
                      <MoreHorizontal className="w-5 h-5 inline" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {patients.length === 0 && (
          <div className="text-center py-10 text-slate-500 font-medium">
            No patients found.
          </div>
        )}
      </div>
    </div>
  );
}

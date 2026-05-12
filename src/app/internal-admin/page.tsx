"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import {
  ShieldCheck, Search, CheckCircle, XCircle, Clock,
  Users, Building2, AlertTriangle, Eye, BarChart3,
  FileText, Zap, RefreshCw, LogOut
} from "lucide-react";
import { Input } from "@/components/ui/input";

type StatusKey = "all" | "pending" | "verified" | "rejected";
type TabKey = "doctors" | "hospitals" | "queue" | "reports";

interface ModerationItem {
  id: string;
  name: string;
  specialty?: string;
  type?: string;
  district: string;
  institution: string;
  status: "verified" | "pending" | "rejected";
  submittedAt: string;
  phone: string;
}

const MOCK_DOCTORS: ModerationItem[] = [
  { id: "d1", name: "Dr. Rakesh Kumar", specialty: "Cardiologist", district: "Patna", institution: "Paras HMRI", status: "verified", submittedAt: "2 days ago", phone: "+91-98XXXXXX01" },
  { id: "d2", name: "Dr. Anuj Prasad", specialty: "General Physician", district: "Gaya", institution: "City Clinic", status: "pending", submittedAt: "5 hours ago", phone: "+91-98XXXXXX02" },
  { id: "d3", name: "Dr. Meena Srivastava", specialty: "Gynecologist", district: "Bhagalpur", institution: "Life Care Hospital", status: "pending", submittedAt: "1 hour ago", phone: "+91-98XXXXXX03" },
  { id: "d4", name: "Dr. Sunil Jha", specialty: "Dentist", district: "Muzaffarpur", institution: "Smile Clinic", status: "rejected", submittedAt: "3 days ago", phone: "+91-98XXXXXX04" },
  { id: "d5", name: "Dr. Kavita Singh", specialty: "Dermatologist", district: "Darbhanga", institution: "Skin Care Center", status: "pending", submittedAt: "30 min ago", phone: "+91-98XXXXXX05" },
];

const MOCK_HOSPITALS: ModerationItem[] = [
  { id: "h1", name: "City Hospital", type: "Multi-specialty", district: "Patna", institution: "Private", status: "pending", submittedAt: "6 hours ago", phone: "+91-612-XXXXXX" },
  { id: "h2", name: "Gaya Medical Center", type: "General", district: "Gaya", institution: "Private", status: "verified", submittedAt: "1 week ago", phone: "+91-631-XXXXXX" },
];

const STATUS_STYLE: Record<string, string> = {
  verified: "text-emerald-700 bg-emerald-50 border-emerald-200",
  pending: "text-amber-700 bg-amber-50 border-amber-200",
  rejected: "text-red-700 bg-red-50 border-red-200",
};

export default function AdminPanel() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("queue");
  const [statusFilter, setStatusFilter] = useState<StatusKey>("all");
  const [search, setSearch] = useState("");
  const [doctors, setDoctors] = useState(MOCK_DOCTORS);
  const [hospitals, setHospitals] = useState(MOCK_HOSPITALS);

  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated) { router.replace("/login"); return; }
    if (user?.role !== "admin") { router.replace("/"); }
  }, [isAuthenticated, user, router, mounted]);

  const dataSource = tab === "hospitals" ? hospitals : doctors;
  const setData = tab === "hospitals"
    ? (fn: (prev: ModerationItem[]) => ModerationItem[]) => setHospitals(fn)
    : (fn: (prev: ModerationItem[]) => ModerationItem[]) => setDoctors(fn);

  const filtered = dataSource.filter(item => {
    const matchSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.specialty ?? item.type ?? "").toLowerCase().includes(search.toLowerCase()) ||
      item.district.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const pendingDoctors = doctors.filter(d => d.status === "pending").length;
  const pendingHospitals = hospitals.filter(h => h.status === "pending").length;
  const totalPending = pendingDoctors + pendingHospitals;

  const updateStatus = (id: string, newStatus: "verified" | "rejected" | "pending") => {
    setData(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Admin Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#205E98] flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium leading-none mb-0.5">Operations Console</p>
              <h1 className="text-sm font-black text-slate-900">JivniCare Admin</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {totalPending > 0 && (
              <div className="hidden sm:flex items-center gap-2 bg-amber-50 border border-amber-100 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full">
                <AlertTriangle className="w-3.5 h-3.5" />
                {totalPending} Pending
              </div>
            )}
            <button
              onClick={() => { logout(); router.replace("/"); }}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
              aria-label="Log out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:block">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-5">

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Doctors", value: doctors.length, icon: <Users className="w-4 h-4 text-[#205E98]" />, bg: "bg-blue-50" },
            { label: "Pending Review", value: totalPending, icon: <Clock className="w-4 h-4 text-amber-500" />, bg: "bg-amber-50", highlight: totalPending > 0 },
            { label: "Verified Doctors", value: doctors.filter(d => d.status === "verified").length, icon: <CheckCircle className="w-4 h-4 text-emerald-500" />, bg: "bg-emerald-50" },
            { label: "Hospitals", value: hospitals.length, icon: <Building2 className="w-4 h-4 text-indigo-500" />, bg: "bg-indigo-50" },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-2xl p-4 ${s.highlight ? "ring-2 ring-amber-200" : ""}`}>
              <div className="flex items-center gap-2 mb-2">{s.icon}<span className="text-xs text-slate-500 font-medium">{s.label}</span></div>
              <p className="font-black text-slate-900 text-2xl">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-white rounded-2xl border border-slate-100 shadow-sm p-1 overflow-x-auto" role="tablist">
          {([
            { key: "queue", label: "Verification Queue", icon: <Clock className="w-3.5 h-3.5" />, badge: totalPending },
            { key: "doctors", label: "Doctors", icon: <Users className="w-3.5 h-3.5" /> },
            { key: "hospitals", label: "Hospitals", icon: <Building2 className="w-3.5 h-3.5" /> },
            { key: "reports", label: "Reports", icon: <BarChart3 className="w-3.5 h-3.5" /> },
          ] as { key: TabKey; label: string; icon: React.ReactNode; badge?: number }[]).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                tab === t.key ? "bg-[#205E98] text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"
              }`}
              role="tab"
            >
              {t.icon}
              {t.label}
              {t.badge ? (
                <span className="bg-amber-400 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {t.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {/* Reports Tab */}
        {tab === "reports" && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 text-center py-12">
            <FileText className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">Reports & analytics coming soon.</p>
            <p className="text-xs text-slate-300 mt-1">Doctor verification trends, booking stats, and platform health.</p>
          </div>
        )}

        {/* Moderation Table */}
        {tab !== "reports" && (
          <div className="space-y-3">
            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
                <Input
                  placeholder={`Search ${tab}...`}
                  className="pl-10 h-11 rounded-2xl border-slate-200 bg-white focus-visible:ring-[#205E98]/20 focus-visible:border-[#205E98] text-sm"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  aria-label={`Search ${tab}`}
                />
              </div>
              <div className="flex gap-2">
                {(["all", "pending", "verified", "rejected"] as StatusKey[]).map(s => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold capitalize transition-all border whitespace-nowrap ${
                      statusFilter === s ? "bg-[#205E98] text-white border-[#205E98]" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {s === "all" ? "All" : s}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm" aria-label={`${tab} moderation table`}>
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/60">
                      <th className="text-left px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {tab === "hospitals" ? "Hospital" : "Doctor"}
                      </th>
                      <th className="text-left px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden md:table-cell">District</th>
                      <th className="text-left px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="text-left px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Submitted</th>
                      <th className="text-right px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(item => (
                      <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{item.name}</p>
                            <p className="text-xs text-slate-400">{item.specialty ?? item.type} · {item.institution}</p>
                          </div>
                        </td>
                        <td className="px-5 py-4 hidden md:table-cell">
                          <span className="text-xs text-slate-500 font-medium">{item.district}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border capitalize ${STATUS_STYLE[item.status]}`}>
                            {item.status === "pending" && <Clock className="w-2.5 h-2.5" />}
                            {item.status === "verified" && <CheckCircle className="w-2.5 h-2.5" />}
                            {item.status === "rejected" && <XCircle className="w-2.5 h-2.5" />}
                            {item.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 hidden sm:table-cell">
                          <span className="text-xs text-slate-400">{item.submittedAt}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-[#205E98] transition-colors"
                              aria-label={`View ${item.name}`}
                              title="View details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {item.status === "pending" && (
                              <>
                                <button
                                  onClick={() => updateStatus(item.id, "verified")}
                                  className="p-2 rounded-xl hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors"
                                  aria-label={`Approve ${item.name}`}
                                  title="Approve"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => updateStatus(item.id, "rejected")}
                                  className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                                  aria-label={`Reject ${item.name}`}
                                  title="Reject"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            {item.status !== "pending" && (
                              <button
                                onClick={() => updateStatus(item.id, "pending")}
                                className="p-2 rounded-xl hover:bg-slate-100 text-slate-300 hover:text-slate-500 transition-colors"
                                aria-label={`Reset ${item.name} to pending`}
                                title="Reset to pending"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-12">
                          <Search className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                          <p className="text-sm text-slate-400 font-medium">No records found.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bulk Action Hint */}
            {filtered.filter(d => d.status === "pending").length > 1 && (
              <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3">
                <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                <p className="text-xs text-amber-700 font-medium">
                  {filtered.filter(d => d.status === "pending").length} records pending review. Approve or reject each individually.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

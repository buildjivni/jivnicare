"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  LayoutDashboard, UserCog, Users, Activity, Settings, 
  Search, Bell, CheckCircle2, XCircle, AlertTriangle, 
  FileText, Mail, Phone, MapPin, Eye, LogOut, TrendingUp,
  ActivitySquare, Star, Clock, Calendar, Ban, RefreshCcw, Menu, X
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";

type DoctorStatus = "PENDING" | "VERIFIED" | "REJECTED" | "SUSPENDED";

interface DoctorEntry {
  id: string;
  name: string;
  specialization: string;
  experience: string;
  status: DoctorStatus;
  email: string;
  phone: string;
  address: string;
  patients: string;
  clinicName: string;
  timings: string;
}

const MOCK_CLINICS_QUEUE: any[] = [];

function AdminDashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get("tab") || "dashboard";
  const user = useAuthStore(state => state.user);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  const [doctors, setDoctors] = useState<DoctorEntry[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<{type: 'error'|'success', text: string} | null>(null);

  // Auth Guard
  useEffect(() => {
    if (!isAuthenticated || user?.role !== "ADMIN") {
      router.replace("/login");
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await fetch("/api/admin/doctors?status=ALL");
        const data = await res.json();
        if (data.doctors) {
          interface ApiDoctor {
            id: string;
            user?: { name?: string; email?: string; phone?: string };
            specialtyIds?: string[];
            experience?: number;
            verificationStatus: DoctorStatus;
            clinicOperations?: { address?: string; clinicName?: string };
          }
          const formatted: DoctorEntry[] = data.doctors.map((d: any) => {
            let timings = "Not Set";
            if (d.weeklySchedule) {
              const currentDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
              const todaySchedule = d.weeklySchedule[currentDayName];
              if (todaySchedule && todaySchedule.isOpen) {
                timings = `${todaySchedule.start} - ${todaySchedule.end}`;
              } else {
                timings = "Closed Today";
              }
            }

            return {
              id: d.id,
              name: d.user?.name || "Dr. Unnamed",
              specialization: d.specialtyIds?.length ? d.specialtyIds[0] : "General",
              experience: d.experience ? `${d.experience} Years` : "N/A",
              status: d.verificationStatus,
              email: d.user?.email || "N/A",
              phone: d.user?.phone || "N/A",
              address: d.clinicOperations?.address || "N/A",
              patients: "0", // Could be mapped from dailyQueue total tokens in future
              clinicName: d.clinicOperations?.clinicName || "N/A",
              timings
            };
          });
          setDoctors(formatted);
        }
      } catch (err) { console.error("Failed to fetch doctors", err); }
    };

    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/stats");
        const data = await res.json();
        if (data.success) {
          setPlatformStats(data.stats);
        }
      } catch (e) { console.error("Stats fetch failed", e); }
    };

    const fetchHealth = async () => {
      try {
        const res = await fetch("/api/admin/queue-health");
        const data = await res.json();
        if (data.success) {
          setQueueHealth(data.queues);
        }
      } catch (e) { console.error("Health fetch failed", e); }
    };

    const fetchPatients = async () => {
      try {
        const res = await fetch("/api/admin/patients");
        const data = await res.json();
        if (data.success) {
          setPatients(data.patients);
        }
      } catch (e) { console.error("Patients fetch failed", e); }
    };

    const fetchBookings = async () => {
      try {
        const res = await fetch("/api/admin/bookings");
        const data = await res.json();
        if (data.success) {
          setBookings(data.bookings);
        }
      } catch (e) { console.error("Bookings fetch failed", e); }
    };

    const init = async () => {
      setIsLoading(true);
      await Promise.all([fetchDoctors(), fetchStats(), fetchHealth(), fetchPatients(), fetchBookings()]);
      setIsLoading(false);
    };

    init();
    let timeoutId: NodeJS.Timeout;
    const poll = async () => {
      if (document.visibilityState === 'visible') {
        await Promise.all([fetchStats(), fetchHealth()]);
      }
      timeoutId = setTimeout(poll, 30000);
    };
    poll();
    return () => clearTimeout(timeoutId);
  }, []);

  const [platformStats, setPlatformStats] = useState<any>(null);
  const [queueHealth, setQueueHealth] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [patientSearch, setPatientSearch] = useState("");
  const [modReason, setModReason] = useState("");
  const [isModModalOpen, setIsModModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ id: string, status: DoctorStatus } | null>(null);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "VERIFIED" | "REJECTED" | "SUSPENDED">("ALL");
  const [bookingFilter, setBookingFilter] = useState<"ALL" | "COMPLETED" | "PENDING" | "CANCELLED">("ALL");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const selectedDoctor = doctors.find(d => d.id === selectedDoctorId);

  const handleStatusUpdate = async (id: string, newStatus: DoctorStatus, reason?: string) => {
    try {
      // Logic for mandatory reason on negative actions
      if ((newStatus === 'REJECTED' || newStatus === 'SUSPENDED') && !reason) {
        setPendingAction({ id, status: newStatus });
        setIsModModalOpen(true);
        return;
      }

      const res = await fetch("/api/admin/verify-doctor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorId: id, status: newStatus, adminNotes: reason })
      });
      
      const data = await res.json();
      if (data.success) {
        setDoctors(prev => prev.map(doc => doc.id === id ? { ...doc, status: newStatus } : doc));
        setIsModModalOpen(false);
        setModReason("");
        setPendingAction(null);
        setToastMessage({ type: 'success', text: `Doctor status updated to ${newStatus}` });
      } else {
        setToastMessage({ type: 'error', text: data.error || "Failed to update status" });
      }
    } catch (err) {
      console.error(err);
      setToastMessage({ type: 'error', text: "Network error" });
    }
  };

  const getStatusBadge = (status: DoctorStatus) => {
    switch(status) {
      case "PENDING": return <span className="bg-amber-100/80 border border-amber-200 text-amber-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm">Pending</span>;
      case "VERIFIED": return <span className="bg-emerald-100/80 border border-emerald-200 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm">Verified</span>;
      case "REJECTED": return <span className="bg-red-100/80 border border-red-200 text-red-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm">Rejected</span>;
      case "SUSPENDED": return <span className="bg-slate-200/80 border border-slate-300 text-slate-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm">Suspended</span>;
    }
  };

  // ── RENDERERS ────────────────────────────────────────────────────────

  const renderSidebar = () => {
    const tabs = [
      { id: "dashboard", label: "Dashboard Overview", icon: LayoutDashboard },
      { id: "doctor-management", label: "Doctor Management", icon: UserCog },
      { id: "patient-management", label: "Patient Records", icon: Users },
      { id: "booking-monitoring", label: "Booking Monitoring", icon: Calendar },
      { id: "queue-monitor", label: "Live Queue Monitor", icon: Activity },
    ];

    return (
      <>
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-slate-900/50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />
        )}
        <div className={`w-72 bg-white border-r border-slate-200 flex flex-col h-screen shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-50 fixed md:relative transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <div className="p-6 pb-6 border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white flex items-center justify-between">
            <div className="flex items-center gap-3">
               <img src="/logo.png" alt="JivniCare Logo" className="w-10 h-10 drop-shadow-md object-contain" />
              <div>
                <h2 className="text-2xl font-black tracking-tight text-slate-900">
                  <span className="text-primary">Jivni</span>
                  <span className="text-emerald-600">Care</span>
                </h2>
                <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Admin Command</p>
              </div>
            </div>
            <button className="md:hidden text-slate-500 hover:bg-slate-100 p-2 rounded-full" onClick={() => setMobileMenuOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 flex flex-col gap-2 flex-1 overflow-y-auto">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    router.push(`?tab=${tab.id}`);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold transition-all duration-300 ${
                    isActive 
                    ? 'bg-primary/10 text-primary shadow-sm border-l-4 border-l-primary' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border-l-4 border-l-transparent'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} /> {tab.label}
                </button>
              );
            })}
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50">
            <button 
              onClick={() => {
                useAuthStore.getState().logout();
                router.push("/");
              }}
              className="flex items-center justify-center gap-3 px-4 py-3 w-full rounded-xl font-bold text-red-600 hover:bg-red-100 transition-all border border-red-200 shadow-sm bg-white"
            >
              <LogOut className="w-5 h-5" /> Secure Logout
            </button>
          </div>
        </div>
      </>
    );
  };

  const renderHeader = () => (
    <div className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 flex items-center justify-between shrink-0 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-4">
        <button className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100" onClick={() => setMobileMenuOpen(true)}>
          <Menu className="w-6 h-6" />
        </button>
        <div className="relative w-full max-w-[200px] md:w-96 group hidden sm:block">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors" />
          <Input placeholder="Search..." className="pl-12 h-12 rounded-full bg-slate-50 border-slate-200 focus-visible:ring-primary" />
        </div>
      </div>
      
      {toastMessage && (
        <div className={`hidden md:flex absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 items-center gap-2 px-4 py-2 rounded-full shadow-sm border text-sm font-bold ${toastMessage.type === 'error' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'} animate-in fade-in slide-in-from-top-4`}>
          {toastMessage.type === 'error' ? <AlertTriangle className="w-4 h-4"/> : <CheckCircle2 className="w-4 h-4"/>}
          {toastMessage.text}
          <button onClick={() => setToastMessage(null)} className="ml-2 hover:opacity-70"><X className="w-4 h-4"/></button>
        </div>
      )}

      <div className="flex items-center gap-4 md:gap-6">
        <button className="relative p-2 rounded-full hover:bg-slate-100 transition-colors">
          <Bell className="w-6 h-6 text-slate-600" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="flex items-center gap-3 border-l border-slate-200 pl-4 md:pl-6">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-slate-900">Super Admin</p>
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide flex items-center justify-end gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online</p>
          </div>
          <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-white font-black shadow-lg border-2 border-white">
            SA
          </div>
        </div>
      </div>
    </div>
  );

  const renderDashboardOverview = () => (
    <div className="p-8 max-w-7xl mx-auto fade-in pb-20">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Platform Command Center</h1>
        <p className="text-slate-500 mt-2 text-lg">Real-time overview of the JivniCare ecosystem.</p>
      </div>

      {/* Row 1: Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-[#5298D2] to-[#1E3A8A] rounded-3xl p-6 shadow-xl text-white relative overflow-hidden">
          <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
            <Users className="w-40 h-40" />
          </div>
          <p className="text-sm font-bold text-blue-100 relative z-10">Total Verified Doctors</p>
          <div className="mt-4 relative z-10">
            <h3 className="text-5xl font-black">{platformStats?.doctors.verified || 0}</h3>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-[#489C66] transition-colors">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4 text-[#489C66] group-hover:scale-110 transition-transform">
            <ActivitySquare className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-500">Today&apos;s Bookings</p>
          <h3 className="text-3xl font-black text-slate-900 mt-2">{platformStats?.bookings.today || 0}</h3>
          <p className="text-xs font-bold text-emerald-600 mt-2 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> Real-time traffic</p>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-amber-400 transition-colors">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mb-4 text-amber-500 group-hover:scale-110 transition-transform">
            <FileText className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-500">Pending Approvals</p>
          <h3 className="text-3xl font-black text-slate-900 mt-2">{platformStats?.doctors.pending || 0}</h3>
          <p className="text-xs font-bold text-amber-600 mt-2 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Action Required</p>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-purple-400 transition-colors">
          <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center mb-4 text-purple-500 group-hover:scale-110 transition-transform">
            <Star className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-500">Total Patients</p>
          <h3 className="text-3xl font-black text-slate-900 mt-2">{platformStats?.patients.total.toLocaleString() || "0"}</h3>
          <p className="text-xs font-bold text-purple-600 mt-2">Platform Users</p>
        </div>
      </div>

      {/* Row 2: Secondary Metrics */}
      <h3 className="text-xl font-bold text-slate-900 mb-4 mt-10">Operational Status</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-[#5298D2]">
            <img src="/logo.png" alt="JivniCare Logo" className="w-8 h-8 object-contain" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500">Active Queues Today</p>
            <h4 className="text-2xl font-black text-slate-900">{platformStats?.queues.active || 0}</h4>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Activity className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500">Verified Doctors</p>
            <h4 className="text-2xl font-black text-slate-900">{platformStats?.doctors.verified || 0}</h4>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
            <Ban className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500">Suspended Accounts</p>
            <h4 className="text-2xl font-black text-slate-900">{platformStats?.doctors.suspended || 0}</h4>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDoctorManagement = () => {
    const filteredDoctors = filter === "ALL" ? doctors : doctors.filter(d => d.status === filter);

    return (
      <div className="h-[calc(100vh-80px)] flex fade-in">
        {/* LEFT PANEL: LIST */}
        <div className="flex-1 p-8 flex flex-col h-full bg-[#f8f9fa] overflow-hidden">
          <div className="flex justify-between items-start mb-8 shrink-0">
            <div>
              <h1 className="text-3xl font-black text-slate-900">Doctor Management</h1>
              <p className="text-slate-500 mt-1">Review credentials, approve onboarding, and manage platform access.</p>
            </div>
            <div className="flex bg-white rounded-xl border border-slate-200 p-1 shadow-sm">
              {(["ALL", "PENDING", "VERIFIED", "REJECTED", "SUSPENDED"] as const).map(f => (
                <button 
                  key={f} 
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filter === f ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
                >
                  {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex-1 overflow-hidden flex flex-col">
            <div className="overflow-x-auto flex-1">
              <div className="min-w-[900px]">
                <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 bg-slate-50 text-xs font-black text-slate-500 uppercase tracking-wider">
                  <div className="col-span-4 pl-4">Doctor Details</div>
                  <div className="col-span-3">Specialization</div>
                  <div className="col-span-2">Experience</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-1 text-right pr-4">Actions</div>
                </div>
                
                <div className="overflow-y-auto p-2">
                  {filteredDoctors.map(doctor => (
                    <div 
                      key={doctor.id}
                      onClick={() => setSelectedDoctorId(doctor.id)}
                      className={`grid grid-cols-12 gap-4 p-3 rounded-xl items-center cursor-pointer transition-all mb-1 ${selectedDoctorId === doctor.id ? 'bg-primary/10 border border-primary/20 shadow-sm ring-1 ring-primary/20' : 'hover:bg-slate-50 border border-transparent'}`}
                    >
                      <div className="col-span-4 pl-2 flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0 shadow-sm ${doctor.status === 'SUSPENDED' ? 'bg-slate-400' : 'bg-gradient-to-br from-primary/80 to-primary'}`}>
                          {doctor.name.split(' ')[1]?.charAt(0) || 'D'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{doctor.name}</p>
                          <p className="text-xs text-slate-500">{doctor.clinicName}</p>
                        </div>
                      </div>
                      <div className="col-span-3 text-sm font-bold text-slate-700">{doctor.specialization}</div>
                      <div className="col-span-2 text-sm font-medium text-slate-500">{doctor.experience}</div>
                      <div className="col-span-2">{getStatusBadge(doctor.status)}</div>
                      <div className="col-span-1 flex items-center justify-end pr-2 gap-2">
                        <Button variant="ghost" size="sm" className="text-[#5298D2] hover:text-[#1E3A8A] hover:bg-blue-50 font-bold">Review</Button>
                      </div>
                    </div>
                  ))}
                  {filteredDoctors.length === 0 && (
                     <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                       <AlertTriangle className="w-8 h-8 mb-2 opacity-50" />
                       <p className="font-bold">No doctors found in this category.</p>
                     </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: DETAILS */}
        {selectedDoctor && (
          <div className="w-full md:w-[450px] bg-white md:border-l border-slate-200 shrink-0 flex flex-col h-full shadow-[-20px_0_40px_rgba(0,0,0,0.04)] z-10 fade-in">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-20">
              <h2 className="font-black text-slate-900 flex items-center gap-2"><UserCog className="w-5 h-5 text-[#5298D2]"/> Profile Review</h2>
              <button onClick={() => setSelectedDoctorId(null)} className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"><XCircle className="w-5 h-5"/></button>
            </div>
            
            <div className="p-8 flex-1 overflow-y-auto">
              <div className="flex flex-col items-center text-center mb-8 bg-slate-50 p-6 rounded-3xl border border-slate-100 relative">
                {selectedDoctor.status === "SUSPENDED" && (
                  <div className="absolute top-4 left-4 bg-red-100 text-red-700 text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
                    <Ban className="w-3 h-3"/> Suspended
                  </div>
                )}
                <div className={`w-28 h-28 rounded-full border-4 shadow-xl mb-4 relative flex items-center justify-center text-4xl font-black text-white ${selectedDoctor.status === 'SUSPENDED' ? 'bg-slate-400 border-slate-200' : 'bg-gradient-to-br from-[#5298D2] to-[#1E3A8A] border-white'}`}>
                  {selectedDoctor.name.split(' ')[1]?.charAt(0) || 'D'}
                  {selectedDoctor.status === "PENDING" && <div className="absolute -bottom-2 -right-2 bg-amber-500 border-4 border-white text-white w-8 h-8 rounded-full flex items-center justify-center font-black shadow-sm">!</div>}
                </div>
                <h2 className="text-3xl font-black text-slate-900">{selectedDoctor.name}</h2>
                <p className="text-sm font-black text-[#489C66] uppercase tracking-widest mt-1 bg-green-50 px-3 py-1 rounded-full inline-block">{selectedDoctor.specialization}</p>
              </div>

              <div className="space-y-8">
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2 flex items-center gap-2"><Clock className="w-4 h-4"/> Professional Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Experience</p>
                      <p className="font-black text-slate-900">{selectedDoctor.experience}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Patients</p>
                      <p className="font-black text-slate-900">{selectedDoctor.patients}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 col-span-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">OPD Timings</p>
                      <p className="font-black text-slate-900 text-lg">{selectedDoctor.timings}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2 flex items-center gap-2"><Phone className="w-4 h-4"/> Contact Information</h4>
                  <div className="space-y-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <p className="flex items-center gap-3 text-sm font-bold text-slate-700"><Mail className="w-4 h-4 text-slate-400"/> {selectedDoctor.email}</p>
                    <p className="flex items-center gap-3 text-sm font-bold text-slate-700"><Phone className="w-4 h-4 text-slate-400"/> {selectedDoctor.phone}</p>
                    <div className="flex items-start gap-3 text-sm font-bold text-slate-700 pt-3 border-t border-slate-100 mt-3">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5"/> 
                      <div>
                        <p className="text-slate-900">{selectedDoctor.clinicName}</p>
                        <p className="text-slate-500 font-medium">{selectedDoctor.address}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 bg-slate-50 sticky bottom-0 z-20">
              {selectedDoctor.status === "PENDING" ? (
                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={() => handleStatusUpdate(selectedDoctor.id, "VERIFIED")} className="h-14 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-lg shadow-emerald-600/20 text-lg"><CheckCircle2 className="w-5 h-5 mr-2"/> Approve</Button>
                  <Button onClick={() => handleStatusUpdate(selectedDoctor.id, "REJECTED")} variant="outline" className="h-14 rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-bold bg-white"><XCircle className="w-5 h-5 mr-2"/> Reject</Button>
                </div>
              ) : selectedDoctor.status === "VERIFIED" ? (
                <Button onClick={() => handleStatusUpdate(selectedDoctor.id, "SUSPENDED")} variant="outline" className="w-full h-14 rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-black bg-white group">
                  <Ban className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform"/> Suspend Doctor Account
                </Button>
              ) : selectedDoctor.status === "SUSPENDED" ? (
                <Button onClick={() => handleStatusUpdate(selectedDoctor.id, "VERIFIED")} className="w-full h-14 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black shadow-lg">
                  <RefreshCcw className="w-5 h-5 mr-2"/> Reactivate Account
                </Button>
              ) : (
                <div className="text-center p-4 bg-white border border-slate-200 rounded-xl font-bold text-slate-500">
                  Profile is currently {selectedDoctor.status.toLowerCase()}.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderPatientManagement = () => (
    <div className="p-8 max-w-7xl mx-auto fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900">Patient Records</h1>
        <p className="text-slate-500 mt-1">Read-only overview of registered platform users.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
          <h2 className="font-bold text-slate-900 text-lg">Registered Users</h2>
          <Input 
            placeholder="Search patients by name or phone..." 
            className="w-full md:w-80 bg-white" 
            value={patientSearch}
            onChange={(e) => setPatientSearch(e.target.value)}
          />
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-4 gap-4 p-4 border-b border-slate-100 bg-slate-50 text-xs font-black text-slate-500 uppercase tracking-wider">
              <div className="pl-4">Patient Name</div>
              <div>Contact Info</div>
              <div>Joined Date</div>
              <div>Status</div>
            </div>
            <div className="divide-y divide-slate-100">
              {patients
                .filter(p => 
                  p.name?.toLowerCase().includes(patientSearch.toLowerCase()) || 
                  p.phone.includes(patientSearch)
                )
                .map(patient => (
                <div key={patient.id} className="grid grid-cols-4 gap-4 p-5 items-center hover:bg-slate-50 transition-colors">
                  <div className="pl-4 font-bold text-slate-900 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black">{patient.name?.charAt(0) || 'P'}</div>
                    {patient.name || 'Anonymous Patient'}
                  </div>
                  <div className="text-sm font-medium text-slate-600">
                    <p>{patient.phone}</p>
                    <p className="text-xs text-slate-400">ID: {patient.id.slice(-8).toUpperCase()}</p>
                  </div>
                  <div className="text-sm font-bold text-slate-700">
                    {new Date(patient.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                  <div><span className={`px-3 py-1 rounded-full text-xs font-bold ${patient.isVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{patient.isVerified ? 'Verified' : 'Active'}</span></div>
                </div>
              ))}
              {patients.length === 0 && (
                 <div className="p-20 text-center text-slate-400">
                   <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
                   <p className="font-bold">No patient records found.</p>
                 </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBookingMonitoring = () => (
    <div className="p-8 max-w-7xl mx-auto fade-in">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Booking Monitoring</h1>
          <p className="text-slate-500 mt-1">Track appointments and platform revenue flow.</p>
        </div>
        <div className="flex bg-white rounded-xl border border-slate-200 p-1 shadow-sm">
          {(["ALL", "TODAY", "COMPLETED", "CANCELLED"] as const).map(f => (
            <button 
              key={f} 
              onClick={() => setBookingFilter(f === "TODAY" ? "PENDING" : (f as "ALL" | "COMPLETED" | "CANCELLED"))}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${bookingFilter === f || (f === 'TODAY' && bookingFilter === 'PENDING') ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
            >
              {f === "ALL" ? "All Bookings" : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mt-4">
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            <div className="grid grid-cols-5 gap-4 p-4 border-b border-slate-100 bg-slate-50 text-xs font-black text-slate-500 uppercase tracking-wider">
              <div className="col-span-1 pl-4">Booking ID</div>
              <div className="col-span-1">Patient</div>
              <div className="col-span-1">Doctor & Clinic</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1 text-right pr-6">Amount</div>
            </div>
            <div className="divide-y divide-slate-100">
              {bookings.map(booking => (
                <div key={booking.id} className="grid grid-cols-5 gap-4 p-5 items-center hover:bg-slate-50 transition-colors">
                  <div className="col-span-1 pl-4 font-black text-slate-400">{booking.id}</div>
                  <div className="col-span-1 font-bold text-slate-900">{booking.patient}</div>
                  <div className="col-span-1 text-sm font-medium text-slate-700">
                    <p className="font-bold text-primary">{booking.doctor}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3"/> {booking.date}, {booking.time}</p>
                    <p className="text-[10px] text-slate-400 truncate">{booking.clinic}</p>
                  </div>
                  <div className="col-span-1">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      booking.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 
                      booking.status === 'WAITING' ? 'bg-amber-100 text-amber-700' : 
                      booking.status === 'IN_CONSULTATION' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="col-span-1 text-right pr-6 font-black text-slate-900">{booking.amount}</div>
                </div>
              ))}
              {bookings.length === 0 && (
                 <div className="p-20 text-center text-slate-400">
                   <Calendar className="w-12 h-12 mx-auto mb-4 opacity-20" />
                   <p className="font-bold">No recent bookings found.</p>
                 </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderQueueMonitor = () => (
    <div className="p-8 max-w-7xl mx-auto fade-in">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Live Queue Deep Dive</h1>
          <p className="text-slate-500 mt-1">Monitor active token movements across all clinics.</p>
        </div>
        <span className="bg-emerald-50 text-emerald-600 px-5 py-2 rounded-full text-sm font-black flex items-center gap-2 border border-emerald-200 shadow-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span> Live Sync Active
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h3 className="text-lg font-black text-slate-900 mb-4">Active Clinics Queue Status</h3>
          <div className="space-y-4">
            {queueHealth.length > 0 ? queueHealth.map((clinic) => (
              <div key={clinic.id} className={`bg-white p-6 rounded-3xl border shadow-sm flex items-center justify-between hover:border-primary/50 transition-colors ${clinic.isHighLoad ? 'border-amber-200 bg-amber-50/10' : 'border-slate-200'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${clinic.isHighLoad ? 'bg-amber-100 text-amber-600' : 'bg-blue-50 text-primary'}`}>
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-lg">{clinic.clinicName}</h4>
                    <p className="text-sm font-bold text-slate-500">{clinic.doctorName}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{clinic.district}, Bihar</p>
                  </div>
                </div>
                <div className="flex gap-8">
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Now Serving</p>
                    <p className="text-3xl font-black text-primary">#{clinic.servingToken}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Waiting</p>
                    <p className={`text-3xl font-black ${clinic.isHighLoad ? 'text-amber-600' : 'text-slate-900'}`}>{clinic.waitingCount}</p>
                  </div>
                </div>
              </div>
            )) : (
              <div className="p-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                <Activity className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-bold">No active queues found today.</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-black text-slate-900 mb-4">Queue Analytics</h3>
          <div className="bg-gradient-to-b from-[#1E3A8A] to-[#0F172A] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <Activity className="w-32 h-32" />
             </div>
             <p className="text-sm font-bold text-blue-200 relative z-10 uppercase tracking-widest">Active Clinics</p>
             <h3 className="text-6xl font-black mt-2 relative z-10">{queueHealth.length}</h3>
             <p className="text-sm font-medium text-blue-200 mt-4 relative z-10 border-t border-blue-800/50 pt-4">
               {queueHealth.some(q => q.isHighLoad) 
                 ? "Warning: Some clinics are experiencing high patient volume."
                 : "Global platform health is stable. No bottlenecks detected."}
             </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex font-sans overflow-hidden">
      {/* Mobile toast banner */}
      {toastMessage && (
        <div className={`md:hidden fixed top-4 left-4 right-4 z-[100] flex items-center justify-between gap-2 px-4 py-3 rounded-2xl shadow-lg border text-sm font-bold ${toastMessage.type === 'error' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'} animate-in fade-in slide-in-from-top-4`}>
          <div className="flex items-center gap-2">
            {toastMessage.type === 'error' ? <AlertTriangle className="w-4 h-4"/> : <CheckCircle2 className="w-4 h-4"/>}
            {toastMessage.text}
          </div>
          <button onClick={() => setToastMessage(null)} className="hover:opacity-70"><X className="w-4 h-4"/></button>
        </div>
      )}
      
      {renderSidebar()}
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {renderHeader()}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "dashboard" && renderDashboardOverview()}
          {activeTab === "doctor-management" && renderDoctorManagement()}
          {activeTab === "patient-management" && renderPatientManagement()}
          {activeTab === "booking-monitoring" && renderBookingMonitoring()}
          {activeTab === "queue-monitor" && renderQueueMonitor()}
        </div>

        {/* ── Moderation Modal ────────────────────────────────────── */}
        {isModModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6 text-red-600 mx-auto">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 text-center mb-2">Moderation Action</h3>
              <p className="text-slate-500 text-center mb-6">Please provide a clear reason for this {pendingAction?.status.toLowerCase()} action. This will be logged for audit.</p>
              
              <textarea 
                value={modReason}
                onChange={(e) => setModReason(e.target.value)}
                placeholder="Reason for rejection/suspension..."
                className="w-full h-32 p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium text-sm mb-6"
              />
              
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="h-14 rounded-2xl font-bold" 
                  onClick={() => { setIsModModalOpen(false); setModReason(""); setPendingAction(null); }}
                >
                  Cancel
                </Button>
                <Button 
                  className="h-14 rounded-2xl font-black bg-red-600 hover:bg-red-700 text-white"
                  disabled={!modReason.trim()}
                  onClick={() => pendingAction && handleStatusUpdate(pendingAction.id, pendingAction.status, modReason)}
                >
                  Confirm
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { RoleGuard } from "@/components/shared";

export default function AdminDashboard() {
  return (
    <RoleGuard allowedRoles={["ADMIN"]}>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin w-8 h-8 border-4 border-[#5298D2] border-t-transparent rounded-full"></div></div>}>
        <AdminDashboardContent />
      </Suspense>
    </RoleGuard>
  );
}

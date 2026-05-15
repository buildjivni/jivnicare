"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  LayoutDashboard, Users, UserCircle, Settings, Star, 
  LogOut, Wallet, CalendarX, Link as LinkIcon, AlertCircle, ShieldCheck,
  X, Menu
} from "lucide-react";
import { QueueStatCards } from "@/components/doctor/queue/QueueStatCards";
import { NowCallingController } from "@/components/doctor/queue/NowCallingController";
import { QueueOperationsMenu } from "@/components/doctor/queue/QueueOperationsMenu";
import { PatientListTable, PatientListItem } from "@/components/doctor/queue/PatientListTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { WeeklyScheduleEditor } from "@/components/doctor/settings/WeeklyScheduleEditor";
import { ClinicOperationsForm } from "@/components/doctor/settings/ClinicOperationsForm";

// ── BRAND COLORS (From Logo) ──────────────────────────────────────
const BrandColors = {
  blue: "#5298D2", // Jivni Blue
  green: "#489C66" // Care Green
};

function DoctorDashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get("tab") || "overview";

  // Queue State
  const [patients, setPatients] = useState<any[]>([]);
  const [queueStats, setQueueStats] = useState<any>({
    total: 0, waiting: 0, completed: 0, currentActive: 0, avgWaitTime: 0
  });
  const [profileCompleteness, setProfileCompleteness] = useState(0);
  const [isLoadingQueue, setIsLoadingQueue] = useState(true);
  const [isProcessingMutation, setIsProcessingMutation] = useState(false);

  const fetchQueue = async () => {
    try {
      const res = await fetch("/api/doctor/queue");
      if (res.status === 401) {
        useAuthStore.getState().logout();
        router.push("/login?expired=true");
        return;
      }
      const data = await res.json();
      if (data.success && data.tokens) {
        const avgTime = data.doctor?.averageConsultationTime || 15;
        const currentActive = data.stats?.currentActive || 0;
        const formatted = data.tokens.map((t: any) => {
          const waitTokens = Math.max(0, t.tokenNumber - currentActive - 1);
          const waitTime = t.status === "WAITING" ? (waitTokens * avgTime) : 0;
          return {
            id: t.id,
            name: t.user?.name || t.walkInEntry?.patientName || "Unknown",
            initials: (t.user?.name || t.walkInEntry?.patientName || "U").substring(0,2).toUpperCase(),
            token: t.tokenNumber,
            condition: t.walkInEntry?.symptoms || "General",
            visitType: t.source === "ONLINE" ? "Online" : "Walk-in",
            waitTime: waitTime,
            priority: t.isEmergency ? "Emergency" : "Standard",
            status: t.status === "WAITING" ? "Waiting" : t.status === "COMPLETED" ? "Served" : t.status === "IN_CONSULTATION" ? "In-Person" : t.status,
            appointmentTime: new Date(t.tokenIssuedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
          };
        });
        setPatients(formatted);
        if (data.stats) setQueueStats(data.stats);
      }
    } catch (err) {
      console.error("Fetch queue failed", err);
    } finally {
      setIsLoadingQueue(false);
    }
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const poll = async () => {
      if (document.visibilityState === "visible") {
        await fetchQueue();
      }
      timeoutId = setTimeout(poll, 30000);
    };
    poll();
    return () => clearTimeout(timeoutId);
  }, []);

  const handleNextPatient = async (skipCurrent: boolean = false) => {
    if (isProcessingMutation) return;
    setIsProcessingMutation(true);
    const currentPatient = patients.find(p => p.status === "In-Person");
    try {
      const res = await fetch("/api/doctor/queue/next-patient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentTokenId: currentPatient?.id, skipCurrent })
      });
      if (res.status === 401) {
        useAuthStore.getState().logout();
        router.push("/login?expired=true");
        return;
      }
      const data = await res.json();
      if (data.success) await fetchQueue(); 
    } catch (error) {
      console.error("Queue progression failed:", error);
    } finally {
      setIsProcessingMutation(false);
    }
  };
  
  const [leaveMode, setLeaveMode] = useState(false);
  const [profileData, setProfileData] = useState({ name: "", bio: "", regNumber: "", specialty: "" });
  const [settingsData, setSettingsData] = useState({ fee: "0", maxCapacity: "40", averageConsultationTime: "15" });
  const [weeklySchedule, setWeeklySchedule] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTogglingLeave, setIsTogglingLeave] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/doctor/profile");
      const data = await res.json();
      if (data.success && data.doctor) {
        setProfileData({
          name: data.doctor.name || "Dr. Sanctuary",
          bio: data.doctor.bio || "",
          regNumber: data.doctor.medicalRegistrationNumber || "",
          specialty: data.doctor.specialties?.[0]?.name || "General Medicine"
        });
        setSettingsData({
          fee: data.doctor.fee?.toString() || "0",
          maxCapacity: data.doctor.clinicOperations?.walkInLimit?.toString() || "40",
          averageConsultationTime: data.doctor.averageConsultationTime?.toString() || "15"
        });
        if (data.doctor.weeklySchedule) setWeeklySchedule(data.doctor.weeklySchedule);
        if (data.doctor.clinicOperations) setLeaveMode(data.doctor.clinicOperations.isClosedToday);
        if (data.completeness) setProfileCompleteness(data.completeness);
      }
    } catch (err) {
      console.error("Hydration failed", err);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleUpdateSettings = async (updates: any) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/doctor/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        // Success feedback
      }
    } catch (err) {
      console.error("Update failed", err);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleLeaveMode = async () => {
    if (isTogglingLeave) return;
    const newMode = !leaveMode;
    setLeaveMode(newMode);
    setIsTogglingLeave(true);
    await handleUpdateSettings({ isClosedToday: newMode });
    setIsTogglingLeave(false);
  };

  const renderSidebar = () => {
    const tabs = [
      { id: "overview", label: "Dashboard", icon: LayoutDashboard },
      { id: "queue", label: "Live Queue", icon: Users },
      { id: "profile", label: "My Profile", icon: UserCircle },
      { id: "settings", label: "Clinic Settings", icon: Settings },
      { id: "reviews", label: "Reviews", icon: Star },
    ];
    return (
      <>
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-slate-900/50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />
        )}
        <div className={`w-72 bg-white border-r border-slate-200 flex flex-col h-screen shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-50 fixed md:relative transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <div className="p-6 pb-2 border-b border-slate-100 flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="JivniCare Logo" className="w-8 h-8 object-contain" />
              <div>
                <h2 className="text-xl font-black tracking-tight">
                  <span className="text-primary">Jivni</span><span className="text-emerald-600">Care</span>
                </h2>
                <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Doctor Portal</p>
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
                <button key={tab.id} onClick={() => { router.push(`?tab=${tab.id}`); setMobileMenuOpen(false); }} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all min-h-[44px] ${isActive ? 'bg-primary/10 text-primary shadow-sm border-l-4 border-l-primary' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border-l-4 border-l-transparent'}`}>
                  <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} /> {tab.label}
                </button>
              );
            })}
          </div>
          <div className="p-4 border-t border-slate-100 bg-slate-50">
            <button onClick={() => { useAuthStore.getState().logout(); window.location.href = "/"; }} className="flex items-center justify-center gap-3 px-4 py-3 w-full rounded-xl font-bold text-red-600 hover:bg-red-100 transition-all border border-red-200 shadow-sm bg-white">
              <LogOut className="w-5 h-5" /> Sign Out
            </button>
          </div>
        </div>
      </>
    );
  };

  const renderOverview = () => (
    <div className="max-w-5xl fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900">Welcome back, {profileData.name}</h1>
        <p className="text-slate-500 mt-1">Here is what's happening at your clinic today.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mb-4 text-emerald-600">
            <Wallet className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-500">Estimated Earnings</p>
          <h3 className="text-3xl font-black text-slate-900 mt-1">₹{(queueStats.completed * parseInt(settingsData.fee || "0")).toLocaleString()}</h3>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 text-primary">
            <Users className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-500">Patients Seen</p>
          <h3 className="text-3xl font-black text-slate-900 mt-1">{queueStats.completed}</h3>
        </div>
        <div className="rounded-3xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${BrandColors.blue}, ${BrandColors.green})` }}>
          <p className="text-sm font-bold text-white relative z-10">Profile Completeness</p>
          <div className="relative z-10">
            <h3 className="text-3xl font-black text-white mt-1">{profileCompleteness}%</h3>
            <div className="w-full bg-white/30 h-2 rounded-full mt-4 mb-2">
              <div className="bg-white h-2 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" style={{ width: `${profileCompleteness}%` }} />
            </div>
          </div>
        </div>
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <button onClick={() => router.push('?tab=queue')} className="bg-white border border-slate-200 p-4 rounded-2xl text-left hover:shadow-md transition-all group">
          <Users className="w-6 h-6 mb-3 group-hover:scale-110 transition-transform text-primary" />
          <p className="font-bold text-slate-900">Manage Queue</p>
        </button>
        <button onClick={toggleLeaveMode} className={`p-4 rounded-2xl text-left border transition-all ${leaveMode ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200 hover:border-red-500 hover:shadow-md'}`}>
          <CalendarX className={`w-6 h-6 mb-3 ${leaveMode ? 'text-red-600' : 'text-slate-600'}`} />
          <p className={`font-bold ${leaveMode ? 'text-red-700' : 'text-slate-900'}`}>{leaveMode ? 'Resume Bookings' : 'Mark Holiday Today'}</p>
        </button>
      </div>
    </div>
  );

  const renderQueue = () => {
    const currentPatient = patients.find(p => p.status === "In-Person") || null;
    return (
      <div className="max-w-7xl fade-in">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
              <span className="text-primary">Queue</span> Manager
            </h1>
            <p className="text-sm text-slate-500 mt-1">Sequential flow: Online & Walk-in integrated.</p>
          </div>
          <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2 rounded-full shadow-sm">
            <span className="text-sm font-bold text-slate-700">Clinic Status: <span className={!leaveMode ? 'text-emerald-600' : 'text-red-500'}>{!leaveMode ? "Open" : "Closed"}</span></span>
            <div onClick={toggleLeaveMode} className={`w-10 h-6 rounded-full relative cursor-pointer transition-colors ${!leaveMode ? 'bg-emerald-500' : 'bg-slate-300'}`}>
              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-transform ${!leaveMode ? 'right-1' : 'left-1'}`} />
            </div>
          </div>
        </div>
        <QueueStatCards totalAppointments={queueStats.total} patientsServed={queueStats.completed} avgWaitTime={queueStats.avgWaitTime} currentQueue={queueStats.waiting} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <NowCallingController currentPatient={currentPatient} onNext={() => handleNextPatient(false)} onSkip={() => handleNextPatient(true)} />
          <QueueOperationsMenu onAddOffline={async () => {
            const res = await fetch("/api/doctor/queue/walk-in", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ patientName: "Walk-in Patient", phoneNumber: "", symptoms: "" })
            });
            if (res.ok) await fetchQueue();
          }} />
        </div>
        <PatientListTable patients={patients} />
      </div>
    );
  };

  const renderProfile = () => (
    <div className="max-w-3xl fade-in">
      <h1 className="text-3xl font-black text-slate-900 mb-8">My Profile</h1>
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-100">
          <div className="w-24 h-24 rounded-full flex items-center justify-center border-4 border-white shadow-lg text-2xl font-black text-white bg-primary">
            {profileData.name.substring(3, 5).toUpperCase() || "DR"}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{profileData.name}</h2>
            <p className="text-slate-500">{profileData.specialty}</p>
            <Button variant="outline" className="mt-3 h-9 rounded-full font-bold border-slate-200 text-slate-700">Upload New Photo</Button>
          </div>
        </div>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Full Name</label>
              <Input value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} className="h-12 rounded-xl bg-slate-50" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Specialty</label>
              <Input value={profileData.specialty} onChange={e => setProfileData({...profileData, specialty: e.target.value})} className="h-12 rounded-xl bg-slate-50" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Medical Registration Number</label>
            <Input placeholder="e.g. MCI-12345" value={profileData.regNumber} onChange={e => setProfileData({...profileData, regNumber: e.target.value})} className="h-12 rounded-xl bg-slate-50" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Short Biography</label>
            <textarea value={profileData.bio} onChange={e => setProfileData({...profileData, bio: e.target.value})} className="w-full h-24 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <Button onClick={() => handleUpdateSettings(profileData)} disabled={isSaving} className="h-14 px-8 rounded-xl bg-primary text-white font-bold w-full md:w-auto mt-4 shadow-lg hover:brightness-110">
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="max-w-5xl fade-in pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900">Clinic Settings</h1>
        <p className="text-slate-500 mt-1">Configure your clinical operations and availability.</p>
      </div>
      <div className="space-y-10">
        <section className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
          <ClinicOperationsForm 
            initialData={settingsData} 
            isSaving={isSaving} 
            onSave={async (newData) => { await handleUpdateSettings(newData); setSettingsData(newData); }} 
          />
        </section>
        <section className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
          <WeeklyScheduleEditor 
            initialSchedule={weeklySchedule} 
            isSaving={isSaving} 
            onSave={async (newSchedule) => { await handleUpdateSettings({ weeklySchedule: newSchedule }); setWeeklySchedule(newSchedule); }} 
          />
        </section>
        <section className="bg-red-50/50 rounded-[2rem] border border-red-100 p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-xl font-bold text-red-700 mb-2 flex items-center gap-2">
                <CalendarX className="w-5 h-5" /> Leave & Holiday Manager
              </h2>
              <p className="text-red-600/80 text-sm max-w-lg">Mark your clinic as closed for the day to prevent new online bookings. Existing patients will be notified.</p>
            </div>
            <button onClick={toggleLeaveMode} className={`h-14 px-8 rounded-2xl font-black transition-all shrink-0 w-full md:w-auto ${leaveMode ? 'bg-red-600 text-white shadow-lg' : 'bg-white border-2 border-red-200 text-red-600 hover:bg-red-100'}`}>
              {leaveMode ? 'CLINIC IS CLOSED TODAY' : 'MARK CLINIC CLOSED'}
            </button>
          </div>
        </section>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex font-sans overflow-hidden">
      {renderSidebar()}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-10">
          <button className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 active:scale-95 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center" onClick={() => setMobileMenuOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
          <h2 className="font-black text-slate-900 text-lg">
            <span className="text-primary">Jivni</span><span className="text-emerald-600">Care</span>
          </h2>
          <div className="w-10"></div>
        </div>
        <div className="flex-1 p-4 md:p-10 overflow-y-auto">
          {activeTab === "overview" && renderOverview()}
          {activeTab === "queue" && renderQueue()}
          {activeTab === "profile" && renderProfile()}
          {activeTab === "settings" && renderSettings()}
          {activeTab === "reviews" && (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center fade-in">
              <Star className="w-16 h-16 text-slate-300 mb-4" />
              <h2 className="text-2xl font-bold text-slate-900">No Reviews Yet</h2>
              <p className="text-slate-500 mt-2">Patients will be able to rate you after their appointments.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DoctorDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f8f9fa] flex">
        {/* Sidebar skeleton */}
        <div className="w-72 bg-white border-r border-slate-200 shrink-0 hidden md:flex flex-col animate-pulse">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-200" />
            <div className="space-y-1.5">
              <div className="h-4 w-24 bg-slate-200 rounded-full" />
              <div className="h-2.5 w-16 bg-slate-100 rounded-full" />
            </div>
          </div>
          <div className="p-4 space-y-2">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-11 rounded-xl bg-slate-100" />
            ))}
          </div>
        </div>
        {/* Content skeleton */}
        <div className="flex-1 p-6 md:p-10 space-y-6 animate-pulse">
          <div className="h-8 w-64 bg-slate-200 rounded-full" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1,2,3].map(i => <div key={i} className="h-36 bg-white rounded-3xl border border-slate-100" />)}
          </div>
          <div className="h-5 w-32 bg-slate-200 rounded-full" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-24 bg-white rounded-2xl border border-slate-100" />)}
          </div>
        </div>
      </div>
    }>
      <DoctorDashboardContent />
    </Suspense>
  );
}

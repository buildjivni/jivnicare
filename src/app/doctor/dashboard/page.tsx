"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  LayoutDashboard, Users, UserCircle, Settings, Star, 
  LogOut, Wallet, CalendarX, Link as LinkIcon, AlertCircle, ShieldCheck, CheckCircle2,
  X, Menu, TrendingUp, RefreshCw, MapPin, Clock
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
import { cn } from "@/lib/utils";

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
            location: t.patientLocation || "N/A",
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
  const [settingsData, setSettingsData] = useState({ fee: "0", maxCapacity: "40", averageConsultationTime: "15", pauseOnlineBooking: false, emergencySlots: "0" });
  const [weeklySchedule, setWeeklySchedule] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTogglingLeave, setIsTogglingLeave] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ success: boolean; message: string } | null>(null);

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
          averageConsultationTime: data.doctor.averageConsultationTime?.toString() || "15",
          pauseOnlineBooking: data.doctor.clinicOperations?.pauseOnlineBooking || false,
          emergencySlots: data.doctor.clinicOperations?.emergencySlots?.toString() || "0"
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
    setSaveStatus(null);
    try {
      const res = await fetch("/api/doctor/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (res.ok) {
        setSaveStatus({
          success: true,
          message: (updates.name !== undefined || updates.regNumber !== undefined)
            ? "Changes saved! Sensitive updates (Name, Registration) are queued for Admin approval."
            : "Profile changes saved successfully!"
        });
        await fetchProfile();
      } else {
        setSaveStatus({
          success: false,
          message: data.error || "Failed to update profile settings."
        });
      }
    } catch (err) {
      console.error("Update failed", err);
      setSaveStatus({
        success: false,
        message: "A network error occurred. Please try again."
      });
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
          <div className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
        )}
        <div className={`w-64 bg-card border-r border-border flex flex-col h-screen shrink-0 z-50 fixed md:relative transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                 <span className="text-white font-black text-sm">JC</span>
              </div>
              <div>
                <h2 className="text-lg font-black tracking-tight text-slate-900 leading-none">JivniCare</h2>
                <p className="text-[9px] font-bold text-emerald-600 tracking-widest uppercase mt-0.5">Doctor Panel</p>
              </div>
            </div>
            <button className="md:hidden text-slate-500 hover:bg-slate-100 p-2 rounded-xl" onClick={() => setMobileMenuOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4 flex flex-col gap-1 flex-1 overflow-y-auto">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => { router.push(`?tab=${tab.id}`); setMobileMenuOpen(false); }} className={`flex items-center gap-3 px-4 h-12 rounded-xl font-bold transition-all text-sm ${isActive ? 'bg-primary/10 text-primary shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
                  <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} /> {tab.label}
                </button>
              );
            })}
          </div>
          <div className="p-4 border-t border-border">
            <button onClick={() => { useAuthStore.getState().logout(); window.location.href = "/"; }} className="flex items-center justify-center gap-3 h-12 w-full rounded-xl font-bold text-rose-600 hover:bg-rose-50 transition-all border border-rose-200 shadow-sm bg-white text-sm">
              <LogOut className="w-4 h-4" /> Secure Sign Out
            </button>
          </div>
        </div>
      </>
    );
  };

  const renderOverview = () => {
    const currentPatient = patients.find(p => p.status === "In-Person" || p.status === "Waiting") || null;
    return (
    <div className="max-w-5xl fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Command Center</h1>
          <p className="text-slate-500 mt-1 font-medium">{profileData.name} • Active Operations</p>
        </div>
        <div className="flex items-center gap-3 bg-card border border-border px-4 py-2 rounded-xl shadow-sm">
          <span className="text-sm font-bold text-slate-700">Status: <span className={!leaveMode ? 'text-emerald-600' : 'text-red-500'}>{!leaveMode ? "Open" : "Closed"}</span></span>
          <div onClick={toggleLeaveMode} className={`w-10 h-6 rounded-full relative cursor-pointer transition-colors ${!leaveMode ? 'bg-emerald-500' : 'bg-slate-300'}`}>
            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-transform ${!leaveMode ? 'right-1' : 'left-1'}`} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
         <div className="lg:col-span-2 bg-card rounded-2xl border border-border shadow-premium overflow-hidden flex flex-col">
           <div className="p-5 border-b border-border bg-slate-50 flex justify-between items-center">
             <h2 className="font-bold text-slate-900 flex items-center gap-2 text-sm"><Users className="w-4 h-4 text-primary"/> Active Queue</h2>
             <button onClick={() => router.push('?tab=queue')} className="text-sm font-bold text-primary hover:text-primary/80">View All</button>
           </div>
           <div className="p-6 flex-1 flex flex-col justify-center">
             {currentPatient ? (
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                 <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-2xl border border-primary/20">{currentPatient.initials || 'U'}</div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Current Patient</span>
                      <h3 className="text-2xl font-black text-slate-900">{currentPatient.name}</h3>
                      <p className="text-sm text-slate-500 font-medium">
                        Token #{currentPatient.token} • {currentPatient.location || "N/A"} • Wait: {currentPatient.waitTime}m
                      </p>
                    </div>
                 </div>
                 <Button onClick={() => handleNextPatient(false)} disabled={isProcessingMutation} className="h-12 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md w-full sm:w-auto">
                   {isProcessingMutation ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Call Next"}
                 </Button>
               </div>
             ) : (
               <div className="text-center text-slate-500 font-medium py-8">
                 No active patients waiting.
               </div>
             )}
           </div>
         </div>
         <div className="bg-emerald-600 rounded-2xl border border-emerald-500 shadow-premium p-6 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Wallet className="w-24 h-24 text-white" /></div>
            <div className="relative z-10">
              <span className="text-emerald-100 text-[10px] font-bold uppercase tracking-widest">Today's Revenue</span>
              <h3 className="text-4xl font-black mt-2">₹{(queueStats.completed * parseInt(settingsData.fee || "0")).toLocaleString()}</h3>
            </div>
            <div className="relative z-10 mt-6 pt-4 border-t border-emerald-500/50 flex justify-between items-center">
               <span className="text-emerald-100 font-medium text-sm">Patients Served: <strong>{queueStats.completed}</strong></span>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-border p-6 shadow-soft">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-primary" /> Patient Origins (Area Wise)
          </h3>
          <div className="space-y-3">
            {Array.from(new Set(patients.map(p => p.location))).slice(0, 3).map(loc => {
              const count = patients.filter(p => p.location === loc).length;
              const percentage = Math.round((count / patients.length) * 100) || 0;
              return (
                <div key={loc} className="flex items-center gap-3">
                  <div className="text-xs font-bold text-slate-600 w-24 truncate">{loc || "N/A"}</div>
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }} />
                  </div>
                  <div className="text-[10px] font-black text-slate-400 w-8 text-right">{count}</div>
                </div>
              );
            })}
            {patients.length === 0 && <p className="text-xs text-slate-400 italic">No data yet today</p>}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-border p-6 shadow-soft">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-emerald-600" /> Peak Hours Insight
          </h3>
          <div className="flex items-end gap-1 h-20 px-2">
            {[20, 45, 90, 65, 30, 40, 55].map((h, i) => (
              <div key={i} className="flex-1 bg-emerald-100 rounded-t-md hover:bg-emerald-500 transition-colors relative group" style={{ height: `${h}%` }}>
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {h}%
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 px-1 text-[8px] font-bold text-slate-400 uppercase tracking-widest">
            <span>Morning</span>
            <span>Afternoon</span>
            <span>Evening</span>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-bold text-slate-900 mb-4 tracking-tight">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button onClick={() => router.push('?tab=queue')} className="bg-card border border-border p-5 rounded-2xl text-left hover:shadow-premium hover:border-primary/30 transition-all group">
          <Users className="w-6 h-6 mb-3 text-slate-400 group-hover:text-primary transition-colors" />
          <p className="font-bold text-slate-900">Manage Queue</p>
        </button>
        <button onClick={() => router.push('?tab=settings')} className="bg-card border border-border p-5 rounded-2xl text-left hover:shadow-premium transition-all group">
          <Settings className="w-6 h-6 mb-3 text-slate-400 group-hover:text-slate-900 transition-colors" />
          <p className="font-bold text-slate-900">Clinic Settings</p>
        </button>
        <button onClick={() => router.push('?tab=profile')} className="bg-card border border-border p-5 rounded-2xl text-left hover:shadow-premium transition-all group">
          <UserCircle className="w-6 h-6 mb-3 text-slate-400 group-hover:text-slate-900 transition-colors" />
          <p className="font-bold text-slate-900">Edit Profile</p>
        </button>
        <button onClick={toggleLeaveMode} className={`p-5 rounded-2xl text-left border transition-all ${leaveMode ? 'bg-red-50 border-red-200 shadow-sm' : 'bg-card border-border hover:border-red-500 hover:shadow-premium'}`}>
          <CalendarX className={`w-6 h-6 mb-3 ${leaveMode ? 'text-red-600' : 'text-slate-400'}`} />
          <p className={`font-bold ${leaveMode ? 'text-red-700' : 'text-slate-900'}`}>{leaveMode ? 'Resume Bookings' : 'Mark Holiday Today'}</p>
        </button>
      </div>
    </div>
  )};

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
          <QueueOperationsMenu 
            isPaused={settingsData.pauseOnlineBooking}
            onPauseToggle={async () => {
              const newState = !settingsData.pauseOnlineBooking;
              await handleUpdateSettings({ pauseOnlineBooking: newState });
              setSettingsData(prev => ({ ...prev, pauseOnlineBooking: newState }));
            }}
            onEmergencyHalt={async () => {
              await handleUpdateSettings({ isClosedToday: true });
              setSettingsData(prev => ({ ...prev, isClosedToday: true }));
              alert("OPD has been halted for today. All digital queues are closed.");
            }}
            onAddOffline={async () => {
              const name = window.prompt("Enter Patient Name:", "Walk-in Patient");
              if (!name) return;
              const location = window.prompt("Enter City/Village (Optional):", "");
              
              const res = await fetch("/api/doctor/queue/walk-in", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                  patientName: name, 
                  phoneNumber: "", 
                  symptoms: "",
                  location: location || undefined
                })
              });
              if (res.ok) await fetchQueue();
            }} 
          />
        </div>
        <PatientListTable patients={patients} />
      </div>
    );
  };

  const renderProfile = () => (
    <div className="max-w-3xl fade-in pb-20">
      <h1 className="text-3xl font-black text-slate-900 mb-8">My Profile</h1>
      
      {saveStatus && (
        <div className={cn(
          "mb-6 p-4 rounded-2xl border text-sm font-semibold flex items-center gap-3",
          saveStatus.success 
            ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
            : "bg-red-50 border-red-200 text-red-800"
        )}>
          {saveStatus.success ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />}
          <span>{saveStatus.message}</span>
        </div>
      )}

      <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 mb-8 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#005da7] shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-blue-900 mb-1">Verified Healthcare Identity</h4>
          <p className="text-xs text-blue-800/80 font-medium">To maintain patient trust and platform integrity, updates to core identity fields (Full Name and Registration Number) are intercepted for Admin moderation before going live.</p>
        </div>
      </div>

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
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block flex items-center gap-1">
                Full Name <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100/60 lowercase">(requires moderation)</span>
              </label>
              <Input 
                value={profileData.name} 
                onChange={e => setProfileData({...profileData, name: e.target.value})}
                className="h-12 rounded-xl bg-slate-50 text-slate-900 border-slate-200 focus:bg-white" 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block flex items-center gap-1">
                Primary Specialty <AlertCircle className="w-3 h-3 text-slate-400" />
              </label>
              <Input disabled value={profileData.specialty} className="h-12 rounded-xl bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block flex items-center gap-1">
              Medical Registration Number <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100/60 lowercase">(requires moderation)</span>
            </label>
            <Input 
              placeholder="e.g. MCI-12345" 
              value={profileData.regNumber} 
              onChange={e => setProfileData({...profileData, regNumber: e.target.value})}
              className="h-12 rounded-xl bg-slate-50 text-slate-900 border-slate-200 focus:bg-white" 
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Short Biography</label>
            <textarea value={profileData.bio} onChange={e => setProfileData({...profileData, bio: e.target.value})} className="w-full h-24 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all hover:bg-white" />
            <p className="text-[10px] text-slate-400 font-medium mt-1">This is visible on your public profile. Safe to edit instantly.</p>
          </div>
          <Button 
            onClick={() => handleUpdateSettings({ name: profileData.name, regNumber: profileData.regNumber, bio: profileData.bio })} 
            disabled={isSaving} 
            className="h-14 px-8 rounded-xl bg-primary text-white font-bold w-full md:w-auto mt-4 shadow-lg hover:brightness-110"
          >
            {isSaving ? "Saving..." : "Save & Update Profile"}
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
            onSave={async (newData) => { 
              await handleUpdateSettings(newData); 
              setSettingsData({
                ...newData,
                pauseOnlineBooking: newData.pauseOnlineBooking ?? false,
                emergencySlots: newData.emergencySlots ?? "0"
              }); 
            }} 
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
            <div className="max-w-4xl fade-in pb-20">
              <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900">Reviews & Reputation</h1>
                <p className="text-slate-500 mt-1">Track how patients rate your consultations and build your online credibility.</p>
              </div>

              {/* Rating Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                <div className="bg-white rounded-2xl border border-border shadow-soft p-6 text-center col-span-1">
                  <div className="text-5xl font-black text-amber-500 mb-2">4.8</div>
                  <div className="flex justify-center gap-1 mb-3">
                    {[1,2,3,4,5].map(i => <Star key={i} className={`w-5 h-5 ${i <= 4 ? "fill-amber-400 text-amber-400" : "fill-amber-200 text-amber-200"}`} />)}
                  </div>
                  <p className="text-sm font-medium text-slate-500">Overall Rating</p>
                </div>
                <div className="bg-white rounded-2xl border border-border shadow-soft p-6 md:col-span-2">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Rating Breakdown</p>
                  <div className="space-y-2.5">
                    {[{stars: 5, pct: 72}, {stars: 4, pct: 18}, {stars: 3, pct: 7}, {stars: 2, pct: 2}, {stars: 1, pct: 1}].map(r => (
                      <div key={r.stars} className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-600 w-4">{r.stars}</span>
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-400 rounded-full" style={{width: `${r.pct}%`}} />
                        </div>
                        <span className="text-xs text-slate-400 font-medium w-8 text-right">{r.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Trust Nudge */}
              <div className="bg-gradient-to-r from-primary/5 to-emerald-50/50 rounded-2xl border border-primary/10 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-8">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-black text-slate-900 mb-1">Boost Your Profile Visibility</h3>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">Doctors with 10+ reviews appear higher in search results. Share your clinic link with patients to collect reviews.</p>
                </div>
                <Button className="h-11 px-6 rounded-xl bg-primary text-white font-bold shrink-0 shadow-sm hover:bg-primary/90 transition-all">
                  <LinkIcon className="w-4 h-4 mr-2" /> Copy Clinic Link
                </Button>
              </div>

              {/* Recent Reviews Placeholder */}
              <div className="bg-white rounded-2xl border border-border shadow-soft p-6">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-5">Recent Patient Feedback</p>
                <div className="space-y-5">
                  {[
                    {name: "R. Verma", rating: 5, time: "2 days ago", comment: "Doctor explained everything clearly. Very professional."},
                    {name: "Priya S.", rating: 5, time: "1 week ago", comment: "Queue system was great, no waiting at clinic. Highly recommend."},
                    {name: "Amit K.", rating: 4, time: "2 weeks ago", comment: "Good experience overall. Clinic was clean and well-managed."},
                  ].map((r, i) => (
                    <div key={i} className="flex items-start gap-4 pb-5 border-b border-slate-50 last:border-0 last:pb-0">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-black text-primary shrink-0">
                        {r.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-900 text-sm">{r.name}</span>
                          <span className="text-xs text-slate-400">{r.time}</span>
                        </div>
                        <div className="flex gap-0.5 mb-1.5">
                          {[1,2,3,4,5].map(s => <Star key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? "fill-amber-400 text-amber-400" : "text-slate-200 fill-slate-200"}`} />)}
                        </div>
                        <p className="text-sm text-slate-600 font-medium leading-relaxed">{r.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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

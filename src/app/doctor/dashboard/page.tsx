"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  LayoutDashboard, Users, UserCircle, Settings,
  LogOut, Wallet, CalendarX, AlertCircle, ShieldCheck, CheckCircle2,
  X, Menu, TrendingUp, RefreshCw, MapPin, Clock
} from "lucide-react";
import { Logo } from "@/features/marketing/components/brand/Logo";
import { QueueStatCards } from "@/features/doctor/components/queue/QueueStatCards";
import { NowCallingController } from "@/features/doctor/components/queue/NowCallingController";
import { QueueOperationsMenu } from "@/features/doctor/components/queue/QueueOperationsMenu";
import { PatientListTable, PatientListItem } from "@/features/doctor/components/queue/PatientListTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useDoctorWorkspace } from "@/features/doctor/hooks/useDoctorWorkspace";
import { WeeklyScheduleEditor } from "@/features/doctor/components/settings/WeeklyScheduleEditor";
import { ClinicOperationsForm } from "@/features/doctor/components/settings/ClinicOperationsForm";
import { ImageUploadField } from "@/components/shared/ImageUploadField";
import { cn } from "@/lib/utils/utils";

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
  const {
    profile: profileData,
    settings: settingsData,
    weeklySchedule,
    verificationStatus,
    profileCompleteness,
    isReady: profileReady,
    refresh: refreshProfile,
    setProfileField,
    setSettingsField,
  } = useDoctorWorkspace();
  const [isLoadingQueue, setIsLoadingQueue] = useState(true);
  const [isProcessingMutation, setIsProcessingMutation] = useState(false);

  const fetchQueue = async () => {
    try {
      const res = await fetch("/api/doctor/queue");
      if (res.status === 401) {
        useAuthStore.getState().logout();
        return;
      }
      let data: {
        success?: boolean;
        tokens?: unknown[];
        stats?: { currentActive?: number };
        doctor?: { averageConsultationTime?: number };
      } | null = null;
      try {
        data = await res.json();
      } catch {
        return;
      }
      if (data?.success && data.tokens) {
        const avgTime = data.doctor?.averageConsultationTime || 15;
        const currentActive = data.stats?.currentActive || 0;
        const formatted = data.tokens.map((t: any) => {
          const isEmergency =
            t.isEmergency || t.tokenNumber >= 9000;
          const waitTokens = isEmergency
            ? 0
            : Math.max(0, t.tokenNumber - currentActive - 1);
          const waitTime =
            t.status === "WAITING" && !isEmergency
              ? waitTokens * avgTime
              : 0;
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
    } catch {
      // Queue poll failure is non-fatal; next interval retries
    } finally {
      setIsLoadingQueue(false);
    }
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isFetching = false;
    
    const poll = async () => {
      if (document.visibilityState === "visible" && !isFetching) {
        isFetching = true;
        await fetchQueue();
        isFetching = false;
      }
      timeoutId = setTimeout(poll, 30000);
    };
    
    poll();

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        clearTimeout(timeoutId);
        poll();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
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
      // Handle race condition silently
      if (res.status === 409) {
        console.warn("Queue progressed concurrently by another device.");
        await fetchQueue();
        return;
      }
      const data = await res.json();
      if (data.success || data.error) {
         await fetchQueue(); 
      }
    } catch (error) {
      console.error("Queue progression failed:", error);
    } finally {
      setIsProcessingMutation(false);
    }
  };
  
  const [leaveMode, setLeaveMode] = useState(false);
  const [clinicStatus, setClinicStatus] = useState<string>("AVAILABLE");
  const [statusReason, setStatusReason] = useState<string>("");
  const [statusExpiresAt, setStatusExpiresAt] = useState<string | null>(null);
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTogglingLeave, setIsTogglingLeave] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ success: boolean; message: string } | null>(null);

  const handleUpdateStatus = async (status: string, reason?: string, breakDuration?: number) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/doctor/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          statusReason: reason || "",
          breakDuration: breakDuration || undefined
        })
      });
      const data = await res.json();
      if (res.ok) {
        setClinicStatus(status);
        if (reason !== undefined) setStatusReason(reason);
        await refreshProfile();
      } else {
        alert(data.error || "Failed to update clinic status.");
      }
    } catch (err) {
      console.error("Failed to update status", err);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (profileReady) {
      setLeaveMode(settingsData.leaveMode);
      setClinicStatus(settingsData.clinicStatus);
      setStatusReason(settingsData.statusReason);
      setStatusExpiresAt(settingsData.statusExpiresAt);
    }
  }, [profileReady, settingsData]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    try {
      const imgRes = await fetch("/api/doctor/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          updates: {
            profileImage: profileData.profileImage || null,
            clinicImage: profileData.clinicImage || null,
          },
        }),
      });
      if (!imgRes.ok) {
        const err = await imgRes.json();
        setSaveStatus({
          success: false,
          message: err.error || "Failed to save profile images.",
        });
        return;
      }

      const res = await fetch("/api/doctor/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileData.name,
          regNumber: profileData.regNumber,
          bio: profileData.bio,
          hospitalName: profileData.hospitalName,
          city: profileData.city,
          address: profileData.address,
          experience: parseInt(profileData.experience) || 0,
          fee: parseInt(profileData.consultationFee) || 0,
          qualifications: profileData.qualifications,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSaveStatus({
          success: true,
          message:
            "Profile and images saved successfully. Name or registration changes may require admin approval.",
        });
        await refreshProfile();
      } else {
        setSaveStatus({
          success: false,
          message: data.error || "Failed to update profile settings.",
        });
      }
    } catch (err) {
      console.error("Profile save failed", err);
      setSaveStatus({
        success: false,
        message: "A network error occurred. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

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
        await refreshProfile();
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

  const profileInitials =
    profileData.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase() || "DR";

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
    ];
    return (
      <>
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
        )}
        <div className={`w-64 bg-card border-r border-border flex flex-col h-screen shrink-0 z-50 fixed md:relative transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <div className="p-6 border-b border-border flex items-center justify-between">
            <Logo className="h-8 w-auto" />
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Live Sync Badge */}
          <div className="flex items-center gap-2 bg-emerald-50/60 border border-emerald-100/80 px-3.5 h-11 rounded-xl shrink-0 shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Live Sync</span>
          </div>

          {/* Operational Status Dropdown Select */}
          <div className="relative shrink-0">
            <select
              value={clinicStatus}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "SHORT_BREAK") {
                  const minsStr = window.prompt("Enter break duration in minutes (e.g. 15, 30, 45, 60):", "30");
                  const mins = parseInt(minsStr || "30") || 30;
                  const reason = window.prompt("Enter status description / reason (optional):", "Doctor on short break");
                  handleUpdateStatus(val, reason || "Short Break", mins);
                } else if (val === "CLINIC_CLOSED") {
                  const reason = window.prompt("Enter status description / reason (optional):", "Clinic Closed");
                  handleUpdateStatus(val, reason || "Clinic Closed Today");
                } else {
                  handleUpdateStatus(val);
                }
              }}
              className={cn(
                "h-11 px-4 pr-10 rounded-xl font-bold text-xs uppercase tracking-wider border cursor-pointer appearance-none transition-all outline-none focus:ring-4 focus:ring-opacity-20 shadow-sm min-w-[170px]",
                clinicStatus === "AVAILABLE" && "bg-emerald-50 border-emerald-200 text-emerald-700 focus:ring-emerald-500/20 focus:border-emerald-500",
                clinicStatus === "SHORT_BREAK" && "bg-amber-50 border-amber-200 text-amber-700 focus:ring-amber-500/20 focus:border-amber-500",
                clinicStatus === "LIMITED_SLOTS" && "bg-orange-50 border-orange-200 text-orange-700 focus:ring-orange-500/20 focus:border-orange-500",
                clinicStatus === "EMERGENCY_ONLY" && "bg-rose-50 border-rose-200 text-rose-700 focus:ring-rose-500/20 focus:border-rose-500",
                clinicStatus === "CLINIC_CLOSED" && "bg-slate-100 border-slate-300 text-slate-700 focus:ring-slate-500/20 focus:border-slate-500"
              )}
              style={{
                backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                backgroundPosition: "right 0.75rem center",
                backgroundSize: "1.25rem",
                backgroundRepeat: "no-repeat"
              }}
            >
              <option value="AVAILABLE" className="font-bold text-slate-800 bg-white">🟢 AVAILABLE (LIVE)</option>
              <option value="SHORT_BREAK" className="font-bold text-slate-800 bg-white">🟡 SHORT BREAK</option>
              <option value="LIMITED_SLOTS" className="font-bold text-slate-800 bg-white">🟠 LIMITED SLOTS</option>
              <option value="EMERGENCY_ONLY" className="font-bold text-slate-800 bg-white">🔴 EMERGENCY ONLY</option>
              <option value="CLINIC_CLOSED" className="font-bold text-slate-800 bg-white">⚫ CLOSED TODAY</option>
            </select>
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
        <div className="bg-white rounded-2xl border border-border p-6 shadow-soft flex flex-col justify-center">
          <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-emerald-600" /> Clinic Hours
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Peak-hour analytics will appear here once enough patient visit data is collected.
          </p>
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Live Sync Badge */}
            <div className="flex items-center gap-2 bg-emerald-50/60 border border-emerald-100/80 px-3.5 h-11 rounded-xl shrink-0 shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Live Sync</span>
            </div>

            {/* Operational Status Dropdown Select */}
            <div className="relative shrink-0">
              <select
                value={clinicStatus}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "SHORT_BREAK") {
                    const minsStr = window.prompt("Enter break duration in minutes (e.g. 15, 30, 45, 60):", "30");
                    const mins = parseInt(minsStr || "30") || 30;
                    const reason = window.prompt("Enter status description / reason (optional):", "Doctor on short break");
                    handleUpdateStatus(val, reason || "Short Break", mins);
                  } else if (val === "CLINIC_CLOSED") {
                    const reason = window.prompt("Enter status description / reason (optional):", "Clinic Closed");
                    handleUpdateStatus(val, reason || "Clinic Closed Today");
                  } else {
                    handleUpdateStatus(val);
                  }
                }}
                className={cn(
                  "h-11 px-4 pr-10 rounded-xl font-bold text-xs uppercase tracking-wider border cursor-pointer appearance-none transition-all outline-none focus:ring-4 focus:ring-opacity-20 shadow-sm min-w-[170px]",
                  clinicStatus === "AVAILABLE" && "bg-emerald-50 border-emerald-200 text-emerald-700 focus:ring-emerald-500/20 focus:border-emerald-500",
                  clinicStatus === "SHORT_BREAK" && "bg-amber-50 border-amber-200 text-amber-700 focus:ring-amber-500/20 focus:border-amber-500",
                  clinicStatus === "LIMITED_SLOTS" && "bg-orange-50 border-orange-200 text-orange-700 focus:ring-orange-500/20 focus:border-orange-500",
                  clinicStatus === "EMERGENCY_ONLY" && "bg-rose-50 border-rose-200 text-rose-700 focus:ring-rose-500/20 focus:border-rose-500",
                  clinicStatus === "CLINIC_CLOSED" && "bg-slate-100 border-slate-300 text-slate-700 focus:ring-slate-500/20 focus:border-slate-500"
                )}
                style={{
                  backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                  backgroundPosition: "right 0.75rem center",
                  backgroundSize: "1.25rem",
                  backgroundRepeat: "no-repeat"
                }}
              >
                <option value="AVAILABLE" className="font-bold text-slate-800 bg-white">🟢 AVAILABLE (LIVE)</option>
                <option value="SHORT_BREAK" className="font-bold text-slate-800 bg-white">🟡 SHORT BREAK</option>
                <option value="LIMITED_SLOTS" className="font-bold text-slate-800 bg-white">🟠 LIMITED SLOTS</option>
                <option value="EMERGENCY_ONLY" className="font-bold text-slate-800 bg-white">🔴 EMERGENCY ONLY</option>
                <option value="CLINIC_CLOSED" className="font-bold text-slate-800 bg-white">⚫ CLOSED TODAY</option>
              </select>
            </div>
          </div>
        </div>
        <QueueStatCards totalAppointments={queueStats.total} patientsServed={queueStats.completed} avgWaitTime={queueStats.avgWaitTime} currentQueue={queueStats.waiting} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <NowCallingController currentPatient={currentPatient} onNext={() => handleNextPatient(false)} onSkip={() => handleNextPatient(true)} />
          <QueueOperationsMenu 
            isPaused={clinicStatus === "SHORT_BREAK" || clinicStatus === "EMERGENCY_ONLY" || clinicStatus === "CLINIC_CLOSED"}
            onPauseToggle={async () => {
              const newStatus = (clinicStatus === "SHORT_BREAK" || clinicStatus === "EMERGENCY_ONLY") ? "AVAILABLE" : "SHORT_BREAK";
              await handleUpdateStatus(newStatus);
            }}
            onEmergencyHalt={async () => {
              await handleUpdateSettings({ isClosedToday: true });
              setSettingsField("leaveMode", true);
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
          {profileData.profileImage ? (
            <img
              src={profileData.profileImage}
              alt={profileData.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
            />
          ) : (
            <div className="w-24 h-24 rounded-full flex items-center justify-center border-4 border-white shadow-lg text-2xl font-black text-white bg-primary">
              {profileInitials}
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{profileData.name || "Doctor Profile"}</h2>
            <p className="text-slate-500">{profileData.specialty}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <ImageUploadField
            label="Profile photo"
            value={profileData.profileImage}
            onChange={(url) => setProfileField("profileImage", url)}
            filenamePrefix="doctor-profile"
          />
          <ImageUploadField
            label="Clinic photo"
            value={profileData.clinicImage}
            onChange={(url) => setProfileField("clinicImage", url)}
            filenamePrefix="doctor-clinic"
          />
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block flex items-center gap-1">
                Full Name <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100/60 lowercase">(requires moderation)</span>
              </label>
              <Input 
                value={profileData.name} 
                onChange={e => setProfileField("name", e.target.value)}
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
              onChange={e => setProfileField("regNumber", e.target.value)}
              className="h-12 rounded-xl bg-slate-50 text-slate-900 border-slate-200 focus:bg-white" 
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Short Biography</label>
            <textarea value={profileData.bio} onChange={e => setProfileField("bio", e.target.value)} className="w-full h-24 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all hover:bg-white" />
            <p className="text-[10px] text-slate-400 font-medium mt-1">This is visible on your public profile. Safe to edit instantly.</p>
          </div>
        </div>
        
        <div className="space-y-6 mt-8 pt-8 border-t border-slate-100">
          <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2"><MapPin className="w-5 h-5 text-emerald-600"/> Clinic Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Clinic / Hospital Name</label>
              <Input 
                value={profileData.hospitalName} 
                onChange={e => setProfileField("hospitalName", e.target.value)}
                className="h-12 rounded-xl bg-slate-50 text-slate-900 border-slate-200" 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">City</label>
              <Input 
                value={profileData.city} 
                onChange={e => setProfileField("city", e.target.value)}
                className="h-12 rounded-xl bg-slate-50 text-slate-900 border-slate-200" 
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Full Address</label>
            <Input 
              value={profileData.address} 
              onChange={e => setProfileField("address", e.target.value)}
              className="h-12 rounded-xl bg-slate-50 text-slate-900 border-slate-200" 
            />
          </div>
        </div>

        <div className="space-y-6 mt-8 pt-8 border-t border-slate-100">
          <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2"><Wallet className="w-5 h-5 text-emerald-600"/> Professional Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Experience (Years)</label>
              <Input 
                type="number"
                value={profileData.experience} 
                onChange={e => setProfileField("experience", e.target.value)}
                className="h-12 rounded-xl bg-slate-50 text-slate-900 border-slate-200" 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Consultation Fee (₹)</label>
              <Input 
                type="number"
                value={profileData.consultationFee} 
                onChange={e => setProfileField("consultationFee", e.target.value)}
                className="h-12 rounded-xl bg-slate-50 text-slate-900 border-slate-200" 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Qualifications</label>
              <Input 
                value={profileData.qualifications} 
                onChange={e => setProfileField("qualifications", e.target.value)}
                className="h-12 rounded-xl bg-slate-50 text-slate-900 border-slate-200" 
              />
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6">
          <Button 
            onClick={handleSaveProfile}
            disabled={isSaving} 
            className="h-14 px-8 rounded-xl bg-primary text-white font-bold w-full md:w-auto shadow-lg hover:brightness-110"
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
              await refreshProfile();
            }}
          />
        </section>
        <section className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
          <WeeklyScheduleEditor 
            initialSchedule={(weeklySchedule ?? undefined) as Parameters<typeof WeeklyScheduleEditor>[0]["initialSchedule"]} 
            isSaving={isSaving} 
            onSave={async (newSchedule) => {
              await handleUpdateSettings({ weeklySchedule: newSchedule });
              await refreshProfile();
            }}
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



  if (!profileReady) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading clinic workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex font-sans overflow-hidden">
      {renderSidebar()}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-10">
          <button className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 active:scale-95 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center" onClick={() => setMobileMenuOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
          <Logo className="h-8 w-auto" />
          <div className="w-10"></div>
        </div>
        <div className="flex-1 p-4 md:p-10 overflow-y-auto">
          <VerificationGuard 
            verificationStatus={verificationStatus} 
            activeTab={activeTab} 
            allowedTabs={["profile"]}
            onReturn={() => router.push('?tab=overview')}
          >
            {activeTab === "overview" && renderOverview()}
            {activeTab === "queue" && renderQueue()}
            {activeTab === "profile" && renderProfile()}
            {activeTab === "settings" && renderSettings()}
          </VerificationGuard>
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

const VerificationGuard = ({ children, allowedTabs, verificationStatus, activeTab, onReturn }: any) => {
  const fullAccess =
    verificationStatus === "VERIFIED" || verificationStatus === "UPDATE_PENDING";
  const sandboxStatuses = ["DRAFT", "PENDING_VERIFICATION"];
  const sandboxTabs = ["overview", "profile", "settings"];

  if (fullAccess) return <>{children}</>;
  if (sandboxStatuses.includes(verificationStatus) && sandboxTabs.includes(activeTab)) {
    return <>{children}</>;
  }
  if (allowedTabs.includes(activeTab)) return <>{children}</>;

  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center max-w-md mx-auto fade-in">
      <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-inner ${verificationStatus === "REJECTED" ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-600"}`}>
        <ShieldCheck className="w-10 h-10" />
      </div>
      <h2 className="text-2xl font-black text-slate-900 mb-3">
        {verificationStatus === "REJECTED" ? "Verification Rejected" : "Verification Required"}
      </h2>
      <p className="text-slate-500 font-medium mb-6 leading-relaxed">
        {verificationStatus === "REJECTED" 
          ? "Your application was rejected. Please review your profile and update any incorrect information to re-apply."
          : "Your account is currently under review by our clinical team. Operational features like live queue and bookings are locked until verification is complete."}
      </p>
      <Button onClick={onReturn} className="h-12 px-8 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors">
        Return to Overview
      </Button>
    </div>
  );
};

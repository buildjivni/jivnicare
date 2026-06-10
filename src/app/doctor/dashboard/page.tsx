"use client";

import { Suspense, useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { 
  LayoutDashboard, Users, UserCircle, Settings,
  LogOut, Wallet, CalendarX, AlertCircle, ShieldCheck, CheckCircle2,
  X, Menu, TrendingUp, RefreshCw, MapPin, Clock, EyeOff, Eye, Loader2, ArrowRight, AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/features/marketing/components/brand/Logo";
import { QueueStatCards } from "@/features/doctor/components/queue/QueueStatCards";
import { QueueStatusDisplay, ClinicStatusToggle, QuickActionPanel, HoldToConfirmButton } from "@/features/doctor/components/queue/NowCallingController";
import { QueueOperationsMenu } from "@/features/doctor/components/queue/QueueOperationsMenu";
import { PatientListTable, PatientListItem } from "@/features/doctor/components/queue/PatientListTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useDoctorWorkspace } from "@/features/doctor/hooks/useDoctorWorkspace";
import { WeeklyScheduleEditor } from "@/features/doctor/components/settings/WeeklyScheduleEditor";
import { ClinicOperationsForm } from "@/features/doctor/components/settings/ClinicOperationsForm";
import { OperatorManagement } from "@/features/doctor/components/settings/OperatorManagement";
import { ImageUploadField } from "@/components/shared/ImageUploadField";
import { WalkInModal } from "@/features/doctor/components/queue/WalkInModal";
import { cn } from "@/lib/utils/utils";
import { formatDoctorName } from "@/lib/utils/name-utils";

// ── BRAND COLORS (From Logo) ──────────────────────────────────────
const BrandColors = {
  blue: "#5298D2", // Jivni Blue
  green: "#489C66" // Care Green
};

function DoctorDashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get("tab") || "queue";

  const {
    profile: profileData,
    settings: settingsData,
    weeklySchedule,
    verificationStatus,
    profileCompleteness,
    isReady: profileReady,
    error: profileError,
    refresh: refreshProfile,
    setProfileField,
    setSettingsField,
  } = useDoctorWorkspace();

  // Queue State
  const [isProcessingMutation, setIsProcessingMutation] = useState(false);
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);
  const [walkInEmergency, setWalkInEmergency] = useState(false);
  const [showRevenue, setShowRevenue] = useState(false);
  const [statusPromptMode, setStatusPromptMode] = useState<"NONE" | "SHORT_BREAK" | "CLINIC_CLOSED">("NONE");
  const [promptData, setPromptData] = useState({ duration: "30", reason: "" });
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetcher = async (url: string) => {
    try {
      const res = await fetch(url);
      if (res.status === 401) {
        useAuthStore.getState().logout();
        window.location.href = "/login?reason=session_expired";
        throw new Error("Unauthorized");
      }
      if (res.status === 403) {
        throw new Error("AccessDeniedError");
      }
      if (!res.ok && res.status >= 500) {
        throw new Error("ServerError");
      }
      const data = await res.json();
      return data;
    } catch (error: any) {
      if (error.name === "TypeError" || error.message === "Failed to fetch") {
        throw new Error("OfflineError");
      }
      throw error;
    }
  };

  const { data: queueData, isLoading: isLoadingQueue, mutate: mutateQueue, isValidating } = useSWR("/api/doctor/queue", fetcher, {
    refreshInterval: 15000,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    onSuccess: () => setFetchError(null),
    onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
      if (error.message === "Unauthorized") return;
      if (error.message === "AccessDeniedError") {
        setFetchError("AccessDeniedError");
        return;
      }
      if (error.message === "OfflineError") {
        setFetchError("OfflineError");
      }
      
      // Stop retrying after 3 attempts
      if (retryCount >= 3) {
        setFetchError(error.message);
        return;
      }
      
      // Retry at 2s, 5s, 10s
      const retryIntervals = [2000, 5000, 10000];
      setTimeout(() => revalidate({ retryCount }), retryIntervals[retryCount] || 10000);
    },
  });

  const { patients, queueStats } = useMemo(() => {
    let formattedPatients: any[] = [];
    let stats = { total: 0, waiting: 0, completed: 0, currentActive: 0, avgWaitTime: 0, emergencyCount: 0, heldCount: 0, noShowCount: 0 };
    
    if (queueData?.success && queueData.tokens) {
      const avgTime = queueData.doctor?.averageConsultationTime || 15;
      const currentActive = queueData.stats?.currentActive || 0;
      
      let emergencyCount = 0;
      let heldCount = 0;
      let noShowCount = 0;

      const activeTokens = queueData.tokens.filter((t: any) => 
        ["WAITING", "READY", "CALLED", "IN_CONSULTATION", "SKIPPED"].includes(t.status)
      );

      formattedPatients = activeTokens.map((t: any) => {
        const isEmergency = t.isEmergency || t.tokenNumber >= 9000;
        const waitTokens = isEmergency ? 0 : Math.max(0, t.tokenNumber - currentActive - 1);
        const waitTime = t.status === "WAITING" && !isEmergency ? waitTokens * avgTime : 0;

        if (isEmergency && t.status !== "COMPLETED" && t.status !== "CANCELLED") emergencyCount++;
        if (t.status === "SKIPPED") heldCount++;
        if (t.status === "NO_SHOW") noShowCount++;

        return {
          id: t.id,
          name: t.user?.name || t.walkInEntry?.patientName || "Unknown",
          initials: (t.user?.name || t.walkInEntry?.patientName || "U").substring(0,2).toUpperCase(),
          token: t.tokenNumber,
          condition: t.walkInEntry?.symptoms || "General",
          visitType: t.source === "ONLINE" ? "Online" : "Walk-in",
          waitTime: waitTime,
          priority: isEmergency ? "Emergency" : "Standard",
          location: t.patientLocation || "N/A",
          status: t.status === "WAITING" ? "Waiting" : t.status === "COMPLETED" ? "Served" : t.status === "IN_CONSULTATION" ? "In-Person" : t.status === "SKIPPED" ? "Held" : t.status,
          appointmentTime: new Date(t.tokenIssuedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        };
      });
      if (queueData.stats) {
        stats = { ...queueData.stats, emergencyCount, heldCount, noShowCount };
      } else {
        stats = { total: 0, waiting: 0, completed: 0, currentActive: 0, avgWaitTime: 0, emergencyCount, heldCount, noShowCount };
      }
    }
    return { patients: formattedPatients, queueStats: stats };
  }, [queueData]);

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
        window.location.href = "/login?reason=session_expired";
        return;
      }
      if (res.status === 403) {
        toast.error("Access Denied.");
        return;
      }
      if (!res.ok && res.status >= 500) {
        toast.error("Server Error. Please try again.");
        return;
      }
      // Handle race condition silently
      if (res.status === 409) {
        console.warn("Queue progressed concurrently by another device.");
        await mutateQueue();
        return;
      }
      const data = await res.json();
      if (data.success || data.error) {
         await mutateQueue(); 
         if (data.data?.undoToken && currentPatient) {
           toast(`Called Next Patient`, {
             description: `Previous: ${currentPatient.name}`,
             action: {
               label: 'UNDO',
               onClick: () => handleUndoNext(data.data.undoToken)
             },
             duration: 25000,
           });
         }
      }
    } catch (error: any) {
      if (error.name === "TypeError" || error.message === "Failed to fetch") {
        toast.error("Connection lost. Please check your internet.");
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setIsProcessingMutation(false);
    }
  };

  const handleUndoNext = async (undoToken: string) => {
    setIsProcessingMutation(true);
    try {
      const res = await fetch("/api/doctor/queue/undo-next", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ undoToken })
      });
      if (!res.ok) {
        if (res.status === 409) {
          toast.error("Undo failed: Queue has already progressed further.");
        } else {
          toast.error("Undo expired or invalid.");
        }
        await mutateQueue();
        return;
      }
      toast.success("Successfully undone previous action.");
      await mutateQueue();
    } catch (err) {
      toast.error("Error connecting to server.");
    } finally {
      setIsProcessingMutation(false);
    }
  };

  const updatePatientStatus = async (tokenId: string, status: string) => {
    if (isProcessingMutation) return;
    setIsProcessingMutation(true);
    try {
      const res = await fetch("/api/doctor/queue/update-status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenId, status })
      });
      if (res.status === 401) {
        useAuthStore.getState().logout();
        window.location.href = "/login?reason=session_expired";
        return;
      }
      if (res.status === 403) {
        toast.error("Access Denied.");
        return;
      }
      if (!res.ok && res.status >= 500) {
        toast.error("Server Error. Please try again.");
        return;
      }
      await mutateQueue();
    } catch (error: any) {
      if (error.name === "TypeError" || error.message === "Failed to fetch") {
        toast.error("Connection lost. Please check your internet.");
      } else {
        toast.error(`Failed to update status to ${status}.`);
      }
    } finally {
      setIsProcessingMutation(false);
    }
  };

  const handleHoldPatient = (id: string) => updatePatientStatus(id, "SKIPPED");
  const handleRecallPatient = (id: string) => updatePatientStatus(id, "WAITING");
  const handleServePatient = (id: string) => updatePatientStatus(id, "COMPLETED");
  
  const handleQuickToken = async (isEmergency: boolean = false) => {
    if (isProcessingMutation) return;
    setIsProcessingMutation(true);
    try {
      const res = await fetch("/api/doctor/queue/walk-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientName: "", isEmergency }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        toast.error(errorData.error || "Failed to generate token");
        return;
      }
      toast.success(isEmergency ? "Emergency token issued" : "Quick token issued");
      await mutateQueue();
    } catch (err) {
      console.error(err);
      toast.error("Error generating token");
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
    const newState = !newMode; // isOnline is the inverse of leaveMode

    if (newMode) {
      const confirmed = confirm(
        "Offline karne par nayi bookings band ho jaayengi. Pehle se booked patients queue mein rahenge. Continue?"
      );
      if (!confirmed) return;
    }

    setIsTogglingLeave(true);
    
    try {
      const res = await fetch('/api/doctor/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOnline: newState }),
      })

      if (res.ok) {
        setLeaveMode(newMode);
        await refreshProfile();
      } else {
        alert('Update failed. Please try again.');
      }
    } catch (err) {
      console.error("Toggle failed", err);
    } finally {
      setIsTogglingLeave(false);
    }
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
        <div className={`w-64 bg-card border-r border-border flex flex-col h-screen shrink-0 z-50 fixed md:sticky md:top-0 transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
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

  // ── renderOverview removed as part of Task 6 ──

  const renderQueue = () => {
    const currentPatient = patients.find(p => p.status === "In-Person") || null;
    const nextPatient = patients.find(p => p.status === "Waiting") || null;
    return (
      <div className="max-w-7xl fade-in flex flex-col gap-10">
        
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
            <span className="text-primary">Queue</span> Manager
          </h1>
          <div className="flex gap-3">
             <button onClick={() => handleQuickToken(false)} disabled={isProcessingMutation} className="h-11 px-4 bg-primary text-white text-sm font-bold rounded-xl shadow-sm hover:bg-primary/90 active:scale-95 disabled:opacity-50">Quick Token</button>
             <button onClick={() => handleQuickToken(true)} disabled={isProcessingMutation} className="h-11 px-4 bg-rose-600 text-white text-sm font-bold rounded-xl shadow-sm hover:bg-rose-700 active:scale-95 disabled:opacity-50 flex items-center gap-2"><AlertTriangle className="w-4 h-4" />Emergency</button>
          </div>
        </div>

        {/* SECTION 1: Current Queue Status */}
        <section>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Section 1: Current Queue Status</h2>
          <QueueStatusDisplay 
            currentPatient={currentPatient} 
            nextPatient={nextPatient} 
            waitingCount={queueStats.waiting || 0} 
            emergencyCount={queueStats.emergencyCount || 0} 
          />
        </section>

        {/* SECTION 2: Today's Activity */}
        <section>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Section 2: Today's Activity</h2>
          <QueueStatCards 
            patientsServed={queueStats.completed} 
            currentQueue={queueStats.waiting} 
            noShowCount={queueStats.noShowCount} 
            avgWaitTime={queueStats.avgWaitTime} 
          />
        </section>

        {/* SECTION 3: Clinic Status Controller */}
        <section>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Section 3: Clinic Status Controller</h2>
          <ClinicStatusToggle 
            status={clinicStatus} 
            onStatusChange={(val: string) => {
              if (val === "SHORT_BREAK") {
                setPromptData({ duration: "30", reason: "Doctor on short break" });
                setStatusPromptMode("SHORT_BREAK");
              } else if (val === "CLINIC_CLOSED") {
                setPromptData({ duration: "", reason: "Clinic Closed Today" });
                setStatusPromptMode("CLINIC_CLOSED");
              } else {
                handleUpdateStatus(val);
              }
            }} 
            isLoading={isProcessingMutation} 
          />
        </section>

        {/* SECTION 4: Quick Actions */}
        <section>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Section 4: Quick Actions</h2>
          <QuickActionPanel 
            onNext={() => handleNextPatient(false)}
            onHold={() => handleNextPatient(true)}
            onNoShow={() => { if(currentPatient) updatePatientStatus(currentPatient.id, "NO_SHOW") }}
            onResume={() => { 
                const held = patients.find(p => p.status === "Held");
                if (held) updatePatientStatus(held.id, "WAITING");
            }}
            isLoading={isProcessingMutation}
          />
        </section>
        
        <WalkInModal 
          isOpen={isWalkInModalOpen}
          onClose={() => setIsWalkInModalOpen(false)}
          onSuccess={mutateQueue}
        />
        
        <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden mb-10 pb-4">
          <div className="p-6 border-b border-border flex justify-between items-center bg-slate-50">
            <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" /> Patient Queue
            </h3>
            <button onClick={() => mutateQueue()} className="text-slate-400 hover:text-primary transition-colors bg-white p-2 border border-slate-200 rounded-lg shadow-sm active:scale-95">
              <RefreshCw className={`w-4 h-4 ${isValidating ? "animate-spin text-primary" : ""}`} />
            </button>
          </div>
          <div className="p-2 sm:p-6 pb-4 sm:pb-8">
          <PatientListTable 
            patients={patients} 
            onHold={(id) => updatePatientStatus(id, "SKIPPED")}
            onRecall={(id) => updatePatientStatus(id, "WAITING")}
            onServe={(id) => updatePatientStatus(id, "COMPLETED")}
            onNoShow={(id) => updatePatientStatus(id, "NO_SHOW")}
          />
          </div>
        </div>
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
            <h2 className="text-2xl font-bold text-slate-900">{formatDoctorName(profileData.name)}</h2>
            <p className="text-slate-500">{profileData.specialty || "Specialty not set"}</p>
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
            aspectRatio={16/9}
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
              <Input disabled value={profileData.specialty || "Not set"} className="h-12 rounded-xl bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200" />
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
        <OperatorManagement />
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



  if (profileError) {
    const isAuthError = profileError.includes("401") || profileError.toLowerCase().includes("unauthorized");
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
        <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100 max-w-md w-full text-center fade-in">
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 ${isAuthError ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"}`}>
            {isAuthError ? <ShieldCheck className="w-10 h-10" /> : <AlertCircle className="w-10 h-10" />}
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">
            {isAuthError ? "Session Expired" : "System Error"}
          </h2>
          <p className="text-slate-500 font-medium mb-8 leading-relaxed">
            {isAuthError 
              ? "Aapki session expire ho chuki hai. Kripya dobara login karein." 
              : "Profile load karne mein dikkat ho rahi hai. Kripya apna internet check karein."}
          </p>
          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => isAuthError ? window.location.href = "/login" : refreshProfile()} 
              className="h-14 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-primary/20"
            >
              {isAuthError ? "Go to Login" : "Try Again"}
            </Button>
            {!isAuthError && (
              <Button 
                variant="ghost" 
                onClick={() => window.location.reload()} 
                className="h-12 rounded-2xl text-slate-500 font-bold"
              >
                Refresh Page
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

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
    <div className="min-h-screen bg-[#f8f9fa] flex font-sans overflow-x-hidden">
      
      {/* ── Custom Status Prompt Modal ───────────────────────── */}
      {statusPromptMode !== "NONE" && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black text-slate-900 mb-2">
              {statusPromptMode === "SHORT_BREAK" ? "Set Short Break" : "Close Clinic"}
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              {statusPromptMode === "SHORT_BREAK" 
                ? "Enter the break duration. Patients will be notified of the delay." 
                : "Enter a reason for closing. This will be shown to patients."}
            </p>
            
            <div className="space-y-4 mb-6">
              {statusPromptMode === "SHORT_BREAK" && (
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1">Duration (minutes)</label>
                  <select 
                    value={promptData.duration}
                    onChange={(e) => setPromptData(prev => ({...prev, duration: e.target.value}))}
                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-[#005da7] font-bold outline-none"
                  >
                    <option value="15">15 Minutes</option>
                    <option value="30">30 Minutes</option>
                    <option value="45">45 Minutes</option>
                    <option value="60">1 Hour</option>
                    <option value="120">2 Hours</option>
                  </select>
                </div>
              )}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1">Reason (Optional)</label>
                <Input 
                  value={promptData.reason}
                  onChange={(e) => setPromptData(prev => ({...prev, reason: e.target.value}))}
                  placeholder="E.g. Doctor on rounds"
                  className="w-full border-2 border-slate-200 rounded-xl px-4 h-12 focus:border-[#005da7] font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => { setStatusPromptMode("NONE"); setClinicStatus("AVAILABLE"); }} 
                className="h-12 rounded-xl font-bold border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  const val = statusPromptMode;
                  const mins = parseInt(promptData.duration) || 30;
                  const reason = promptData.reason || (val === "SHORT_BREAK" ? "Short Break" : "Clinic Closed");
                  setStatusPromptMode("NONE");
                  await handleUpdateStatus(val, reason, val === "SHORT_BREAK" ? mins : undefined);
                }} 
                className="h-12 rounded-xl font-bold bg-[#005da7] text-white hover:bg-[#004b87]"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {renderSidebar()}
      <div className="flex-1 flex flex-col min-h-screen md:h-screen overflow-x-hidden md:overflow-hidden relative w-full">
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-10">
          <button className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 active:scale-95 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center" onClick={() => setMobileMenuOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
          <Logo className="h-8 w-auto" />
          <div className="w-10"></div>
        </div>
        <div className="flex-1 p-4 md:p-10 overflow-y-auto">
          {fetchError === "OfflineError" && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-amber-600 animate-spin" />
              <p className="text-sm font-bold text-amber-900">Connection lost. Trying to reconnect...</p>
            </div>
          )}
          {fetchError === "ServerError" && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3">
              <p className="text-sm font-bold text-rose-900">System Error. Please refresh the page.</p>
            </div>
          )}
          {fetchError === "AccessDeniedError" && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3">
              <p className="text-sm font-bold text-rose-900">Access Denied. You do not have permission to view this data.</p>
            </div>
          )}
          <VerificationGuard 
            verificationStatus={verificationStatus} 
            activeTab={activeTab} 
            allowedTabs={["profile"]}
            onReturn={() => router.push('?tab=queue')}
          >
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
  const sandboxTabs = ["queue", "profile", "settings"];

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

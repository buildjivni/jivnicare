"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  LayoutDashboard, Users, UserCircle, Settings, Star, 
  LogOut, Wallet, TrendingUp, CalendarX, Link as LinkIcon, AlertCircle, ShieldCheck,
  X, Menu
} from "lucide-react";
import { QueueStatCards } from "@/components/doctor/queue/QueueStatCards";
import { NowCallingController } from "@/components/doctor/queue/NowCallingController";
import { QueueOperationsMenu } from "@/components/doctor/queue/QueueOperationsMenu";
import { PatientListTable, PatientListItem } from "@/components/doctor/queue/PatientListTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";

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
  const [queueInfo, setQueueInfo] = useState<any>(null);

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const res = await fetch("/api/doctor/queue");
        const data = await res.json();
        if (data.success && data.tokens) {
          const formatted = data.tokens.map((t: any) => ({
            id: t.id,
            name: t.user?.name || t.walkInEntry?.patientName || "Unknown",
            initials: (t.user?.name || t.walkInEntry?.patientName || "U").substring(0,2).toUpperCase(),
            token: t.tokenNumber,
            condition: t.walkInEntry?.symptoms || "General",
            visitType: t.source === "ONLINE" ? "Online" : "Walk-in",
            waitTime: 0,
            priority: t.isEmergency ? "Emergency" : "Standard",
            status: t.status,
            appointmentTime: new Date(t.tokenIssuedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
          }));
          setPatients(formatted);
          setQueueInfo(data.queue);
        }
      } catch (err) {}
    };
    fetchQueue();
    const int = setInterval(fetchQueue, 30000);
    return () => clearInterval(int);
  }, []);

  const updateStatus = async (tokenId: string, status: string) => {
    await fetch("/api/doctor/queue/update-status", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tokenId, status })
    });
    setPatients(prev => prev.map(p => p.id === tokenId ? { ...p, status } : p));
  };
  
  // Doctor Status State
  const [isOnline, setIsOnline] = useState(true);
  const [leaveMode, setLeaveMode] = useState(false);

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: "Dr. Doctor", bio: "", regNumber: "", specialty: "General"
  });

  // Settings State
  const [settingsData, setSettingsData] = useState({ fee: "0", timings: "09:00 - 17:00" });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Hydrate Profile Data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/doctor/profile");
        const data = await res.json();
        if (data.success && data.doctor) {
          setProfileData({
            name: data.doctor.name || "Dr. Doctor",
            bio: data.doctor.bio || "",
            regNumber: data.doctor.medicalRegistrationNumber || "",
            specialty: data.doctor.specialties?.[0]?.name || "General"
          });
          setSettingsData({
            fee: data.doctor.fee?.toString() || "0",
            timings: "09:00 - 17:00" // Simplify for now
          });
          if (data.doctor.clinicOperations) {
            setLeaveMode(data.doctor.clinicOperations.isClosedToday);
            setIsOnline(!data.doctor.clinicOperations.pauseOnlineBooking);
          }
        }
      } catch (err) {}
    };
    fetchProfile();
  }, []);

  const handleUpdateSettings = async (updates: any) => {
    setIsSaving(true);
    try {
      await fetch("/api/doctor/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleLeaveMode = async () => {
    const newMode = !leaveMode;
    setLeaveMode(newMode);
    await handleUpdateSettings({ isClosedToday: newMode });
  };

  // ── RENDER TABS ──────────────────────────────────────────────────

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
          {/* Brand Logo Header */}
          <div className="p-6 pb-2 border-b border-slate-100 flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {/* SVG Logo Mark */}
              <svg viewBox="0 0 100 100" className="w-8 h-8 text-primary">
                <circle cx="50" cy="25" r="12" fill="currentColor" />
                <path d="M 45 40 Q 20 50 25 80 Q 40 85 48 75 Q 45 60 45 40 Z" fill="currentColor" />
                <path d="M 55 40 Q 80 50 75 80 Q 60 85 52 75 Q 55 60 55 40 Z" fill="#489C66" />
              </svg>
              <div>
                <h2 className="text-xl font-black tracking-tight">
                  <span className="text-primary">Jivni</span>
                  <span className="text-emerald-600">Care</span>
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
                <button
                  key={tab.id}
                  onClick={() => {
                    router.push(`?tab=${tab.id}`);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
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
                window.location.href = "/";
              }}
              className="flex items-center justify-center gap-3 px-4 py-3 w-full rounded-xl font-bold text-red-600 hover:bg-red-100 transition-all border border-red-200 shadow-sm bg-white"
            >
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

      {/* Analytics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mb-4 text-emerald-600">
            <Wallet className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-500">Estimated Earnings</p>
          <h3 className="text-3xl font-black text-slate-900 mt-1">₹12,500</h3>
          <p className="text-xs font-bold mt-2 flex items-center gap-1 text-emerald-600"><TrendingUp className="w-3 h-3"/> +15% this week</p>
        </div>
        
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4" style={{ color: BrandColors.blue }}>
            <Users className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-500">Patients Seen</p>
          <h3 className="text-3xl font-black text-slate-900 mt-1">42</h3>
          <p className="text-xs font-bold text-slate-400 mt-2">This week</p>
        </div>

        {/* Profile Strength */}
        <div className="rounded-3xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${BrandColors.blue}, ${BrandColors.green})` }}>
          <div className="absolute right-[-20px] bottom-[-20px] opacity-20">
            <ShieldCheck className="w-40 h-40 text-white" />
          </div>
          <p className="text-sm font-bold text-white/90 relative z-10">Profile Strength</p>
          <div className="relative z-10">
            <h3 className="text-3xl font-black text-white mt-1">80%</h3>
            <div className="w-full bg-white/30 h-2 rounded-full mt-4 mb-2">
              <div className="bg-white h-2 rounded-full w-4/5 shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
            </div>
            {!profileData.regNumber && (
              <p className="text-xs font-medium text-white/90 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Add Med. Reg. No. to reach 100%
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <h2 className="text-xl font-bold text-slate-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <button onClick={() => router.push('?tab=queue')} className="bg-white border border-slate-200 p-4 rounded-2xl text-left hover:shadow-md transition-all group">
          <Users className="w-6 h-6 mb-3 group-hover:scale-110 transition-transform" style={{ color: BrandColors.blue }} />
          <p className="font-bold text-slate-900">Manage Queue</p>
        </button>
        <button onClick={toggleLeaveMode} className={`p-4 rounded-2xl text-left border transition-all ${leaveMode ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200 hover:border-red-500 hover:shadow-md'}`}>
          <CalendarX className={`w-6 h-6 mb-3 ${leaveMode ? 'text-red-600' : 'text-slate-600'}`} />
          <p className={`font-bold ${leaveMode ? 'text-red-700' : 'text-slate-900'}`}>{leaveMode ? 'Resume Bookings' : 'Mark Holiday Today'}</p>
        </button>
        <button className="bg-white border border-slate-200 p-4 rounded-2xl text-left hover:shadow-md transition-all group">
          <LinkIcon className="w-6 h-6 mb-3 group-hover:scale-110 transition-transform" style={{ color: BrandColors.blue }} />
          <p className="font-bold text-slate-900">Share Clinic Link</p>
        </button>
      </div>
    </div>
  );

  const renderQueue = () => {
    const currentPatient = patients.find(p => p.status === "IN_CONSULTATION") || patients.find(p => p.status === "WAITING") || null;
    return (
      <div className="max-w-7xl fade-in">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
              <span style={{ color: BrandColors.blue }}>Queue</span> Manager
            </h1>
            <p className="text-sm text-slate-500 mt-1">Manage today's hybrid schedule.</p>
          </div>
          <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2 rounded-full shadow-sm">
            <span className="text-sm font-bold text-slate-700">Status: <span style={{ color: isOnline ? BrandColors.green : '#94a3b8' }}>{isOnline ? "Online" : "Offline"}</span></span>
            <div onClick={() => setIsOnline(!isOnline)} className={`w-10 h-6 rounded-full relative cursor-pointer transition-colors`} style={{ backgroundColor: isOnline ? BrandColors.green : '#cbd5e1' }}>
              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-transform ${isOnline ? 'right-1' : 'left-1'}`} />
            </div>
          </div>
        </div>

        <QueueStatCards 
          totalAppointments={patients.length} patientsServed={patients.filter(p => p.status === "COMPLETED").length} avgWaitTime={queueInfo?.avgTime || 15} 
          currentQueue={patients.filter(p => p.status === "WAITING").length}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <NowCallingController 
            currentPatient={currentPatient}
            onNext={() => {
              if (currentPatient) {
                updateStatus(currentPatient.id, "COMPLETED");
                const nextWaiting = patients.find(p => p.status === "WAITING" && p.id !== currentPatient.id);
                if (nextWaiting) {
                  updateStatus(nextWaiting.id, "IN_CONSULTATION");
                }
              }
            }}
            onSkip={() => {
              if (currentPatient) {
                updateStatus(currentPatient.id, "SKIPPED");
                const nextWaiting = patients.find(p => p.status === "WAITING" && p.id !== currentPatient.id);
                if (nextWaiting) {
                  updateStatus(nextWaiting.id, "IN_CONSULTATION");
                }
              }
            }}
            onPause={() => setIsOnline(false)}
          />
          <QueueOperationsMenu 
            onAddOffline={async () => {
              await fetch("/api/doctor/queue/walk-in", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ patientName: "Walk-in Patient", phoneNumber: "", symptoms: "" })
              });
            }}
            onEmergencyInsert={async () => {
              await fetch("/api/doctor/queue/emergency", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ patientName: "Emergency Case", phoneNumber: "", symptoms: "Critical" })
              });
            }}
          />
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
          <div className="w-24 h-24 rounded-full flex items-center justify-center border-4 border-white shadow-lg text-2xl font-black text-white" style={{ backgroundColor: BrandColors.blue }}>
            DS
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Dr. Sanctuary</h2>
            <p className="text-slate-500">General Medicine</p>
            <Button variant="outline" className="mt-3 h-9 rounded-full font-bold border-slate-200 text-slate-700">Upload New Photo</Button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
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
            <Input placeholder="e.g. MCI-12345" value={profileData.regNumber} onChange={e => setProfileData({...profileData, regNumber: e.target.value})} className={`h-12 rounded-xl ${!profileData.regNumber ? 'border-amber-300 bg-amber-50' : 'bg-slate-50'}`} />
            {!profileData.regNumber && <p className="text-xs text-amber-600 mt-2 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Adding this increases patient trust and completes your profile.</p>}
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Short Biography</label>
            <textarea value={profileData.bio} onChange={e => setProfileData({...profileData, bio: e.target.value})} className="w-full h-24 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none transition-colors" style={{ outlineColor: BrandColors.blue }} />
          </div>
          <Button onClick={() => handleUpdateSettings({ name: profileData.name, bio: profileData.bio, regNumber: profileData.regNumber })} disabled={isSaving} className="h-14 px-8 rounded-xl text-white font-bold w-full md:w-auto mt-4 shadow-lg hover:brightness-110 transition-all" style={{ backgroundColor: BrandColors.blue }}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="max-w-3xl fade-in">
      <h1 className="text-3xl font-black text-slate-900 mb-8">Clinic Settings</h1>
      
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm mb-6">
        <h2 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-slate-400" /> Operational Settings
        </h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Consultation Fee (₹)</label>
            <Input value={settingsData.fee} onChange={e => setSettingsData({...settingsData, fee: e.target.value})} className="h-12 rounded-xl bg-slate-50 font-black text-lg text-slate-900" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">OPD Timings</label>
            <Input value={settingsData.timings} onChange={e => setSettingsData({...settingsData, timings: e.target.value})} className="h-12 rounded-xl bg-slate-50 font-bold text-slate-700" />
          </div>
        </div>
        <Button onClick={() => handleUpdateSettings({ fee: settingsData.fee })} disabled={isSaving} className="h-12 px-8 rounded-xl bg-slate-900 text-white font-bold mt-6 shadow-md hover:bg-slate-800">
          {isSaving ? "Updating..." : "Update Settings"}
        </Button>
      </div>

      <div className="bg-red-50 rounded-3xl border border-red-100 p-8 shadow-sm">
        <h2 className="text-xl font-bold text-red-700 mb-2 flex items-center gap-2">
          <CalendarX className="w-5 h-5" /> Leave & Holiday Manager
        </h2>
        <p className="text-red-600/80 text-sm mb-6 max-w-lg">Mark your clinic as closed for the day to prevent new online bookings. Existing patients will be notified.</p>
        <button onClick={toggleLeaveMode} className={`h-14 px-8 rounded-xl font-black transition-all ${leaveMode ? 'bg-red-600 text-white shadow-lg shadow-red-500/30' : 'bg-white border-2 border-red-200 text-red-600 hover:bg-red-100'}`}>
          {leaveMode ? 'CLINIC IS CLOSED TODAY' : 'MARK CLINIC CLOSED'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex font-sans overflow-hidden">
      <style dangerouslySetInnerHTML={{__html: `
        .fade-in { animation: fadeIn 0.3s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
      {renderSidebar()}
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
          <button className="p-2 rounded-xl text-slate-600 hover:bg-slate-100" onClick={() => setMobileMenuOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
          <h2 className="font-black text-slate-900 text-lg">
            <span className="text-primary">Jivni</span><span className="text-emerald-600">Care</span>
          </h2>
          <div className="w-10"></div> {/* Spacer for centering */}
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin w-8 h-8 border-4 border-[#5298D2] border-t-transparent rounded-full"></div></div>}>
      <DoctorDashboardContent />
    </Suspense>
  );
}

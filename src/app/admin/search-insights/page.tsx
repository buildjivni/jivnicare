"use client";

import { Logo } from "@/features/marketing/components/brand/Logo";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, UserCog, Users, Calendar, Activity,
  Clipboard, ShieldAlert, Zap, Search, Bell, Menu, X,
  AlertTriangle, CheckCircle2, TrendingUp, HelpCircle
} from "lucide-react";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { Button } from "@/components/ui/button";

interface QueryLog {
  query: string;
  searchCount: number;
  resultCount: number;
  lastSearched: string;
}

export default function AdminSearchInsights() {
  const router = useRouter();
  const user = useAuthStore(state => state.user);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const _hasHydrated = useAuthStore(state => state._hasHydrated);

  const [topQueries, setTopQueries] = useState<QueryLog[]>([]);
  const [zeroResultQueries, setZeroResultQueries] = useState<QueryLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<"top" | "zero">("top");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auth Guard
  useEffect(() => {
    if (_hasHydrated) {
      if (!isAuthenticated || user?.role !== "ADMIN") {
        router.replace("/admin/login");
      }
    }
  }, [_hasHydrated, isAuthenticated, user, router]);

  useEffect(() => {
    const fetchSearchInsights = async () => {
      try {
        const res = await fetch("/api/admin/search-insights");
        const data = await res.json();
        if (data.success) {
          setTopQueries(data.topQueries || []);
          setZeroResultQueries(data.zeroResultQueries || []);
        }
      } catch (err) {
        console.error("Failed to fetch search insights:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchInsights();
  }, []);

  const totalSearches = topQueries.reduce((acc, q) => acc + q.searchCount, 0);
  const totalZeroResult = zeroResultQueries.reduce((acc, q) => acc + q.searchCount, 0);
  const successRate = totalSearches > 0 ? Math.round(((totalSearches - totalZeroResult) / totalSearches) * 100) : 100;

  const renderSidebar = () => {
    const tabs = [
      { id: "dashboard", label: "Dashboard Overview", icon: LayoutDashboard },
      { id: "doctor-management", label: "Doctor Management", icon: UserCog },
      { id: "patient-management", label: "Patient Records", icon: Users },
      { id: "booking-monitoring", label: "Booking Monitoring", icon: Calendar },
      { id: "queue-monitor", label: "Live Queue Monitor", icon: Activity },
      { id: "lead-management", label: "Lead Management", icon: Clipboard },
      { id: "search-insights", label: "Search Insights", icon: Search },
      { id: "trust-safety", label: "Trust & Safety", icon: ShieldAlert },
      { id: "observability", label: "System Observability", icon: Zap },
    ];

    return (
      <>
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-slate-900/50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />
        )}
        <div className={`w-72 bg-white border-r border-slate-200 flex flex-col h-screen shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-50 fixed md:relative transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <div className="p-6 pb-6 border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Logo className="w-10 h-10 drop-shadow-md object-contain" />
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
              const isActive = tab.id === "search-insights";
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === "search-insights") {
                      setMobileMenuOpen(false);
                    } else {
                      router.push(`/admin/dashboard?tab=${tab.id}`);
                    }
                  }}
                  className={`flex items-center gap-3.5 px-4 h-12 rounded-xl font-bold text-sm transition-all ${
                    isActive
                      ? "bg-primary text-white shadow-lg shadow-blue-500/10"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
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
        <h1 className="text-xl font-black text-slate-900 hidden sm:block">Search Query Analysis</h1>
      </div>
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

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex font-sans overflow-hidden">
      {renderSidebar()}
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {renderHeader()}
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          {/* Top Title Section */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Search Intent &amp; Trends</h2>
              <p className="text-slate-500 text-sm font-medium mt-1">Monitor what patients are searching for in Bihar to optimize doctor recruitment.</p>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center shrink-0">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Searches (7d)</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{isLoading ? "..." : totalSearches}</h3>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Zero-Result Queries</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{isLoading ? "..." : totalZeroResult}</h3>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Search Success Rate</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{isLoading ? "..." : `${successRate}%`}</h3>
              </div>
            </div>
          </div>

          {/* Tables and Controls */}
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 flex-wrap gap-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveSubTab("top")}
                  className={`px-4 py-2 rounded-xl text-sm font-black transition-all ${
                    activeSubTab === "top"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Top 20 Queries
                </button>
                <button
                  onClick={() => setActiveSubTab("zero")}
                  className={`px-4 py-2 rounded-xl text-sm font-black transition-all ${
                    activeSubTab === "zero"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Top 10 Zero-Result Queries
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="text-center py-20">
                  <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-slate-400 font-bold text-sm">Loading insights...</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 text-xs font-black uppercase tracking-wider bg-slate-50/20">
                      <th className="py-4 px-6">Query Text</th>
                      <th className="py-4 px-6 text-center">Search Count</th>
                      <th className="py-4 px-6 text-center">Avg Result Count</th>
                      <th className="py-4 px-6 text-right">Last Searched</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(activeSubTab === "top" ? topQueries : zeroResultQueries).length > 0 ? (
                      (activeSubTab === "top" ? topQueries : zeroResultQueries).map((log, index) => {
                        const isZeroResult = log.resultCount === 0;
                        return (
                          <tr
                            key={index}
                            className={`group transition-colors ${
                              isZeroResult
                                ? "bg-amber-50/40 hover:bg-amber-50/70"
                                : "hover:bg-slate-50/50"
                            }`}
                          >
                            <td className="py-4 px-6 font-bold text-slate-800">
                              <span className="flex items-center gap-2">
                                {isZeroResult && <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />}
                                {log.query}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-center text-slate-600 font-black">
                              {log.searchCount}
                            </td>
                            <td className="py-4 px-6 text-center">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-black ${
                                isZeroResult ? "bg-amber-100 text-amber-800 border border-amber-250" : "bg-sky-50 text-sky-800"
                              }`}>
                                {log.resultCount}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right text-slate-400 font-semibold text-xs">
                              {new Date(log.lastSearched).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-center py-16 text-slate-400 font-bold">
                          No query logs available for this period.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

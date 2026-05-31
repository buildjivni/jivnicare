"use client";

import { useState, useEffect } from "react";
import { Activity, AlertTriangle, CheckCircle2, Zap, AlertOctagon, Info, TrendingUp, RefreshCcw, ShieldAlert, ServerCrash, XCircle } from "lucide-react";

export function OperationalDashboard() {
  const [metrics, setMetrics] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      const res = await fetch("/api/admin/telemetry");
      const data = await res.json();
      if (data.success) {
        setMetrics(data.data || {});
      }
    } catch (e) {
      console.error("Failed to fetch telemetry metrics", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000); // 10s auto refresh
    return () => clearInterval(interval);
  }, []);

  const getMetric = (key: string) => Number(metrics[key] || 0);

  // Derived metrics
  const totalBookings = getMetric("bookingSuccess") + getMetric("bookingFailures");
  const bookingSuccessRate = totalBookings > 0 ? ((getMetric("bookingSuccess") / totalBookings) * 100).toFixed(1) : "0.0";
  
  const totalOtp = getMetric("otpFailures") + getMetric("bookingSuccess"); // roughly
  
  const queueConflicts = getMetric("queueConflicts");
  const duplicateTokens = getMetric("duplicateTokenAttempts");
  const api500s = getMetric("api500Errors");
  const walkInFailures = getMetric("walkInFailures");
  const queueRecovery = getMetric("queueRecoveryEvents");
  const emergencyConflicts = getMetric("emergencyQueueConflicts");

  return (
    <div className="p-8 max-w-7xl mx-auto fade-in pb-20">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Activity className="w-10 h-10 text-primary" />
            Operational Telemetry
          </h1>
          <p className="text-slate-500 mt-2 text-lg font-medium">Real-time distributed systems health and concurrency monitoring.</p>
        </div>
        <button 
          onClick={() => { setLoading(true); fetchMetrics(); }}
          className="flex items-center gap-2 bg-white border border-slate-200 shadow-sm text-slate-600 px-4 py-2 rounded-xl hover:bg-slate-50 font-bold"
        >
          <RefreshCcw className={`w-4 h-4 ${loading ? "animate-spin text-primary" : ""}`} /> Refresh
        </button>
      </div>

      {/* Row 1: High Level Health */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-200 shadow-sm relative overflow-hidden group">
          <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4 text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-emerald-700">Booking Success Rate</p>
          <h3 className="text-4xl font-black text-emerald-900 mt-2">{bookingSuccessRate}%</h3>
          <p className="text-xs font-bold text-emerald-600 mt-2">from {totalBookings} total attempts</p>
        </div>

        <div className="bg-red-50 rounded-3xl p-6 border border-red-200 shadow-sm relative overflow-hidden group">
          <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mb-4 text-red-600">
            <ServerCrash className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-red-700">API 500 Errors</p>
          <h3 className="text-4xl font-black text-red-900 mt-2">{api500s}</h3>
          <p className="text-xs font-bold text-red-600 mt-2">Critical backend crashes</p>
        </div>

        <div className="bg-amber-50 rounded-3xl p-6 border border-amber-200 shadow-sm relative overflow-hidden group">
          <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mb-4 text-amber-600">
            <XCircle className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-amber-700">Walk-In Failures</p>
          <h3 className="text-4xl font-black text-amber-900 mt-2">{walkInFailures}</h3>
          <p className="text-xs font-bold text-amber-600 mt-2">Capacity or system rejections</p>
        </div>
        
        <div className="bg-blue-50 rounded-3xl p-6 border border-blue-200 shadow-sm relative overflow-hidden group">
          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 text-blue-600">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-blue-700">Idempotency Saves</p>
          <h3 className="text-4xl font-black text-blue-900 mt-2">{queueRecovery}</h3>
          <p className="text-xs font-bold text-blue-600 mt-2">Duplicate requests blocked</p>
        </div>
      </div>

      {/* Row 2: Concurrency & Queue Health */}
      <h3 className="text-xl font-bold text-slate-900 mb-4 mt-10 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-slate-400" /> Queue Integrity & Concurrency
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center"><AlertTriangle className="w-6 h-6"/></div>
            <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded">Next-Patient Route</span>
          </div>
          <p className="text-sm font-bold text-slate-500">Doctor Dashboard Race Conditions</p>
          <div className="flex items-end gap-3 mt-1">
            <h4 className="text-3xl font-black text-slate-900">{queueConflicts}</h4>
            <p className="text-xs font-bold text-slate-400 mb-1">Conflicts caught (409s)</p>
          </div>
          <div className="mt-4 bg-orange-50 border border-orange-100 rounded-xl p-3 text-[11px] text-orange-800 font-medium">
            <Info className="w-3 h-3 inline mr-1 -mt-0.5" /> Indicates doctors clicking "Call Next" simultaneously or poor network retries. System safely aborted {queueConflicts} duplicate progressions.
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center"><AlertOctagon className="w-6 h-6"/></div>
            <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded">Walk-In / Online Route</span>
          </div>
          <p className="text-sm font-bold text-slate-500">Duplicate Token Attempts</p>
          <div className="flex items-end gap-3 mt-1">
            <h4 className="text-3xl font-black text-slate-900">{duplicateTokens}</h4>
            <p className="text-xs font-bold text-slate-400 mb-1">Prevented double-bookings</p>
          </div>
          <div className="mt-4 bg-purple-50 border border-purple-100 rounded-xl p-3 text-[11px] text-purple-800 font-medium">
            <Info className="w-3 h-3 inline mr-1 -mt-0.5" /> Indicates receptionists double-clicking "Add Patient" or patients double-clicking "Book". Zero duplicates generated.
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center"><Zap className="w-6 h-6"/></div>
            <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded">QueueService</span>
          </div>
          <p className="text-sm font-bold text-slate-500">Emergency Queue Fallbacks</p>
          <div className="flex items-end gap-3 mt-1">
            <h4 className="text-3xl font-black text-slate-900">{emergencyConflicts}</h4>
            <p className="text-xs font-bold text-slate-400 mb-1">Atomic Redis failures</p>
          </div>
          <div className="mt-4 bg-red-50 border border-red-100 rounded-xl p-3 text-[11px] text-red-800 font-medium">
            <Info className="w-3 h-3 inline mr-1 -mt-0.5" /> Indicates Redis was unreachable during an emergency token generation, falling back to Prisma count.
          </div>
        </div>
      </div>
    </div>
  );
}

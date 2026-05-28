import { getOperationalMetrics } from "@/lib/telemetry/redis";
import { Activity, ShieldAlert, Zap, TrendingDown, Network, Unplug, AlertTriangle } from "lucide-react";
import { redis } from "@/lib/db/redis";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TelemetryDashboardPage() {
  const metrics = await getOperationalMetrics();
  
  let errors: any[] = [];
  if (redis) {
    const rawErrors = await redis.lrange('jivnicare:operational_errors', 0, 19);
    errors = rawErrors.map((e) => typeof e === 'string' ? JSON.parse(e) : e);
  }

  const statCards = [
    {
      title: "Booking Success",
      value: metrics.bookingSuccess || 0,
      icon: <Activity className="w-5 h-5 text-emerald-500" />,
      bg: "bg-emerald-50 text-emerald-900 border-emerald-100"
    },
    {
      title: "Booking Failures",
      value: metrics.bookingFailures || 0,
      icon: <TrendingDown className="w-5 h-5 text-red-500" />,
      bg: "bg-red-50 text-red-900 border-red-100"
    },
    {
      title: "Booking Abandons",
      value: metrics.bookingAbandons || 0,
      icon: <Unplug className="w-5 h-5 text-orange-500" />,
      bg: "bg-orange-50 text-orange-900 border-orange-100"
    },
    {
      title: "OTP Failures",
      value: metrics.otpFailures || 0,
      icon: <ShieldAlert className="w-5 h-5 text-rose-500" />,
      bg: "bg-rose-50 text-rose-900 border-rose-100"
    },
    {
      title: "Queue Reconnects",
      value: metrics.queueReconnects || 0,
      icon: <Zap className="w-5 h-5 text-blue-500" />,
      bg: "bg-blue-50 text-blue-900 border-blue-100"
    },
    {
      title: "SSE Disconnects",
      value: metrics.sseDisconnects || 0,
      icon: <Network className="w-5 h-5 text-indigo-500" />,
      bg: "bg-indigo-50 text-indigo-900 border-indigo-100"
    },
    {
      title: "API 500s",
      value: metrics.api500Errors || 0,
      icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
      bg: "bg-red-100 text-red-900 border-red-200"
    },
    {
      title: "React Crashes",
      value: metrics.frontendCrashes || 0,
      icon: <AlertTriangle className="w-5 h-5 text-purple-600" />,
      bg: "bg-purple-50 text-purple-900 border-purple-200"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Operational Telemetry</h1>
        <p className="text-slate-500 mt-2 font-medium">Lightweight visibility into workflow and system stability.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className={`p-6 rounded-2xl border ${stat.bg} shadow-sm`}>
            <div className="flex items-center gap-3 mb-4 opacity-80">
              {stat.icon}
              <h3 className="font-semibold text-sm">{stat.title}</h3>
            </div>
            <p className="text-4xl font-black">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-8">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Recent Operational Events (Top 20)</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {errors.length === 0 ? (
            <div className="p-8 text-center text-slate-500 font-medium">No recent errors recorded.</div>
          ) : (
            errors.map((err, i) => (
              <div key={i} className="p-4 hover:bg-slate-50 flex items-start gap-4 transition-colors">
                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0 mt-1">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-bold text-slate-900">{err.type}</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-slate-100 font-semibold text-slate-600">
                      {err.category}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 font-medium mb-1">Route: {err.route}</p>
                  <p className="text-xs text-slate-400">{new Date(err.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

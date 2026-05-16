"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, BellDot, BadgeCheck, ShieldAlert, AlertTriangle, Info, X, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  VERIFICATION_APPROVED: <BadgeCheck className="w-4 h-4 text-emerald-500" />,
  VERIFICATION_REJECTED: <ShieldAlert className="w-4 h-4 text-red-500" />,
  VERIFICATION_SUSPENDED: <AlertTriangle className="w-4 h-4 text-amber-500" />,
  MODERATION_PENDING: <AlertTriangle className="w-4 h-4 text-amber-500" />,
  PROFILE_UPDATED: <BadgeCheck className="w-4 h-4 text-primary" />,
  PLATFORM_ALERT: <Info className="w-4 h-4 text-slate-500" />,
  ADMIN_ALERT: <AlertTriangle className="w-4 h-4 text-red-500" />,
  ENGAGEMENT_ALERT: <Info className="w-4 h-4 text-primary" />,
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const API = process.env.NEXT_PUBLIC_API_URL || "/api";

async function apiFetch(path: string, token: string, opts?: RequestInit) {
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...opts?.headers },
  });
  if (!res.ok) throw new Error("API error");
  return res.json();
}

export function NotificationBell({ token }: { token?: string | null }) {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Poll unread count every 30 seconds if logged in
  useEffect(() => {
    if (!token) return;

    let timeoutId: NodeJS.Timeout;

    const fetchCount = async () => {
      try {
        if (document.visibilityState === "visible") {
          const data = await apiFetch("/notifications/unread-count", token);
          setUnread(data.unreadCount ?? 0);
        }
      } catch {
        // silent
      } finally {
        timeoutId = setTimeout(fetchCount, 30000);
      }
    };

    fetchCount();
    return () => clearTimeout(timeoutId);
  }, [token]);

  // Load notifications when panel opens
  useEffect(() => {
    if (!open || !token) return;
     
    setLoading(true);
    apiFetch("/notifications?limit=15", token)
      .then((data) => setNotifications(data.notifications ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, token]);

  async function markAllRead() {
    if (!token) return;
    try {
      await apiFetch("/notifications/mark-read", token, { method: "PATCH", body: JSON.stringify({}) });
      setUnread(0);
      setNotifications((n) => n.map((x) => ({ ...x, isRead: true })));
    } catch {
      // silent
    }
  }

  async function markOne(id: string) {
    if (!token) return;
    try {
      await apiFetch("/notifications/mark-read", token, {
        method: "PATCH",
        body: JSON.stringify({ ids: [id] }),
      });
      setNotifications((n) => n.map((x) => (x.id === id ? { ...x, isRead: true } : x)));
      setUnread((c) => Math.max(0, c - 1));
    } catch {
      // silent
    }
  }

  if (!token) return null;

  return (
    <div ref={ref} className="relative">
      <button
        id="notification-bell-btn"
        aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ""}`}
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-2xl hover:bg-slate-100 transition-colors"
      >
        {unread > 0 ? (
          <BellDot className="w-5 h-5 text-primary" />
        ) : (
          <Bell className="w-5 h-5 text-slate-500" />
        )}
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4.5 h-4.5 min-w-[18px] min-h-[18px] flex items-center justify-center rounded-full leading-none px-1">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-12 w-80 md:w-96 max-w-[calc(100%-32px)] sm:max-w-none bg-white rounded-3xl shadow-2xl border border-slate-100 z-[120] overflow-hidden animate-in fade-in slide-in-from-top-4 duration-150 origin-top-right"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <p className="font-bold text-slate-900 text-sm">
              Notifications
              {unread > 0 && (
                <span className="ml-2 bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {unread} new
                </span>
              )}
            </p>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
              <button aria-label="Close notifications" onClick={() => setOpen(false)} className="p-1 hover:bg-slate-100 rounded-xl">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="py-10 text-center">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-400 mt-2">Loading…</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center">
                <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400 font-medium">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => !n.isRead && markOne(n.id)}
                  className={cn(
                    "w-full text-left flex gap-3 px-4 py-3 border-b border-slate-50 hover:bg-slate-50/80 transition-colors",
                    !n.isRead && "bg-blue-50/50"
                  )}
                >
                  <div className="mt-0.5 shrink-0 w-7 h-7 bg-white border border-slate-100 rounded-xl flex items-center justify-center shadow-sm">
                    {TYPE_ICONS[n.type] ?? <Info className="w-4 h-4 text-slate-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-xs font-bold text-slate-900 leading-tight", !n.isRead && "text-primary")}>
                      {n.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-2">
                      {n.message}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.isRead && (
                    <div className="w-2 h-2 bg-primary rounded-full mt-1.5 shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-slate-100 text-center">
              <button className="text-xs text-primary font-semibold hover:underline">
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

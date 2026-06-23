"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  ChevronRight,
  Search,
  ShieldCheck,
  MessageSquare,
  ExternalLink,
  Activity,
  Users,
  RefreshCw,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  isEmergencyToken,
  getRegularQueuePosition,
  getApproximateWaitTime,
} from "@/lib/utils/clinic-utils";
import { trackOperationalEvent } from "@/lib/telemetry/client";

const TOKEN_STATUS_LABELS: Record<string, string> = {
  WAITING: "Intezaar mein",
  IN_CONSULTATION: "Consultation jaari hai",
  COMPLETED: "Poora ho gaya",
  SKIPPED: "Skip kiya gaya",
  CANCELLED: "Cancel kiya gaya",
};

function statusLabel(status: string): string {
  return TOKEN_STATUS_LABELS[status] ?? status;
}

export default function MyBookingsPage() {
  const router = useRouter();
  interface Booking {
    id: string;
    tokenNumber: number;
    status: string;
    doctorId: string;
    doctorSlug: string;
    doctorName: string;
    clinic: string;
    location: string;
    estimatedWaitTime: string;
    createdAt: string;
    isEmergency: boolean;
    currentServing: number;
    queuePosition: number;
    positionLabel: string;
  }
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);
  // PR-1: Cancellation state — tracks which tokenId is awaiting confirmation
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setFetchError(null);
    try {
      const res = await fetch("/api/patient/my-bookings");
      const data = await res.json();

      if (!res.ok) {
        setFetchError(data.error || "Bookings load nahi ho paayi");
        setBookings([]);
        return;
      }

      if (data.bookings) {
        interface ApiToken {
          id: string;
          tokenNumber: number;
          status: string;
          isEmergency?: boolean;
          tokenIssuedAt: string;
          queue: {
            doctorId: string;
            currentActiveToken: number;
            tokens?: { tokenNumber: number; status: string; isEmergency?: boolean }[];
            doctor: {
              user: { name: string };
              slug?: string | null;
              clinicName?: string | null;
              district?: string | null;
              averageConsultationTime?: number | null;
            };
          };
        }
        const formattedBookings = data.bookings.map((t: ApiToken) => {
          const currentServing = t.queue.currentActiveToken || 0;
          const emergency = isEmergencyToken({
            tokenNumber: t.tokenNumber,
            isEmergency: t.isEmergency,
          });
          const avgTime = t.queue.doctor?.averageConsultationTime || 15;
          const regularWaiting = (t.queue.tokens ?? []).filter(
            (qt) => !isEmergencyToken(qt)
          );

          let queuePosition = 0;
          let positionLabel = "—";
          let estimatedWaitTime = "Baari aane wali hai";

          if (emergency) {
            positionLabel = "Emergency priority";
          } else {
            queuePosition = getRegularQueuePosition(
              regularWaiting,
              currentServing,
              t.tokenNumber
            );
            positionLabel = String(queuePosition);
            // Count how many emergency tokens are currently waiting ahead in the queue
            const emergencyTokensWaiting = (t.queue.tokens ?? []).filter(qt => isEmergencyToken(qt)).length;
            estimatedWaitTime = getApproximateWaitTime(queuePosition, avgTime, emergencyTokensWaiting);
          }

          return {
            id: t.id,
            tokenNumber: t.tokenNumber,
            status: t.status,
            doctorId: t.queue.doctorId,
            doctorSlug: t.queue.doctor.slug || t.queue.doctorId,
            doctorName: t.queue.doctor.user.name,
            clinic: t.queue.doctor.clinicName || "JivniCare Clinic",
            location: t.queue.doctor.district || "Local",
            estimatedWaitTime,
            createdAt: t.tokenIssuedAt,
            isEmergency: emergency,
            currentServing,
            queuePosition,
            positionLabel,
          };
        });
        setBookings(formattedBookings);
      }
    } catch (e) {
      console.error("Failed to load bookings", e);
      setFetchError("Server se connection nahi ho paa raha hai.");
      setBookings([]);
    } finally {
      setIsLoading(false);
      setCountdown(60);
    }
  }, []);

  // PR-1: Patient self-cancellation handler
  const handleCancelBooking = async (tokenId: string) => {
    setIsCancelling(true);
    setCancelError(null);
    try {
      const res = await fetch("/api/patient/queue/cancel-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCancelError(data.error || "Booking cancel nahi ho paayi.");
        return;
      }
      // Optimistic: remove from active list immediately, then refetch
      setBookings((prev) =>
        prev.map((b) => (b.id === tokenId ? { ...b, status: "CANCELLED" } : b))
      );
      setCancellingId(null);
      fetchBookings();
    } catch {
      setCancelError("Connection fail ho gaya. Dobara try karein.");
    } finally {
      setIsCancelling(false);
    }
  };

  useEffect(() => {
    let source: EventSource | null = null;
    let fallbackInterval: NodeJS.Timeout | null = null;
    let heartbeatTimeout: NodeJS.Timeout | null = null;
    
    const resetHeartbeat = () => {
      if (heartbeatTimeout) clearTimeout(heartbeatTimeout);
      heartbeatTimeout = setTimeout(() => {
        console.warn('SSE heartbeat missed, reconnecting...');
        connectSSE();
      }, 45000); // 45s timeout (expecting ping or data every 15s)
    };

    const connectSSE = () => {
      if (source) source.close();
      if (fallbackInterval) { clearInterval(fallbackInterval); fallbackInterval = null; }
      
      source = new EventSource('/api/patient/bookings/stream');

      source.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.bookings) {
            setBookings(data.bookings);
            setIsLoading(false);
            setFetchError(null);
            setCountdown(60);
            resetHeartbeat();
          }
        } catch (e) {
          console.error('SSE parse error', e);
        }
      };

      source.addEventListener('ping', () => {
        resetHeartbeat();
      });

      source.onerror = () => {
        console.warn('SSE connection error, falling back to polling');
        trackOperationalEvent({ metric: 'sseDisconnects' });
        
        if (source) source.close();
        if (heartbeatTimeout) clearTimeout(heartbeatTimeout);
        
        // Lightweight polling fallback (every 30s)
        fallbackInterval = setInterval(() => {
          if (document.visibilityState === 'visible') fetchBookings();
        }, 30000);
      };
      
      resetHeartbeat();
    };

    connectSSE();

    // Mobile Recovery: instant sync when resuming app
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchBookings();
        if (!source || source.readyState === EventSource.CLOSED) {
          trackOperationalEvent({ metric: 'queueReconnects' });
          connectSSE(); 
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      if (source) source.close();
      if (fallbackInterval) clearInterval(fallbackInterval);
      if (heartbeatTimeout) clearTimeout(heartbeatTimeout);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [fetchBookings]);

// Simple countdown timer for UI display (still updates every second)
useEffect(() => {
  const interval = setInterval(() => {
    setCountdown((c) => (c <= 1 ? 60 : c - 1));
  }, 1000);
  return () => clearInterval(interval);
}, []);

  const handleShareWhatsApp = (booking: Booking) => {
    const waitLine = booking.isEmergency
      ? "Emergency priority"
      : `Wait: ${booking.estimatedWaitTime}`;
    const text =
      `*JivniCare Token Detail*\n\n` +
      `🩺 *Doctor:* ${booking.doctorName}\n` +
      `🎫 *Token:* #${booking.tokenNumber}\n` +
      `🕒 *Wait:* ${waitLine}\n` +
      `📍 *Location:* ${booking.clinic}, ${booking.location}\n\n` +
      `📲 *Live status track karein:* ${window.location.origin}/doctors/${booking.doctorSlug}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const activeBookings = bookings.filter(
    (b) => b.status === "WAITING" || b.status === "IN_CONSULTATION"
  );
  const pastBookings = bookings.filter(
    (b) =>
      b.status === "COMPLETED" ||
      b.status === "SKIPPED" ||
      b.status === "CANCELLED"
  );

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-white border-b border-slate-100 px-4 py-8">
        <div className="max-w-4xl mx-auto flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Aapki Bookings
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              Apne active tokens aur history yahan dekhein.
            </p>
          </div>
          <button
            onClick={fetchBookings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all shrink-0 mt-1"
          >
            <RefreshCw className="w-3 h-3" />
            {countdown}s
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-3xl border border-slate-100 overflow-hidden animate-pulse h-40"
              />
            ))}
          </div>
        ) : fetchError ? (
          <div className="bg-white rounded-[40px] p-10 text-center border border-red-100 max-w-2xl mx-auto">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-black text-slate-900 mb-2">
              Bookings load nahi ho paayi
            </h2>
            <p className="text-slate-500 font-medium mb-6">{fetchError}</p>
            <Button onClick={fetchBookings} className="rounded-xl">
              Dobara koshish karein
            </Button>
          </div>
        ) : (
          <div className="space-y-12">
            {activeBookings.length > 0 ? (
              <div className="space-y-4">
                {activeBookings.map((booking, idx) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={booking.id}
                  >
                    <Card className="border-slate-100 shadow-sm hover:shadow-md transition-shadow rounded-3xl overflow-hidden group">
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                          <div className="bg-primary md:w-40 p-4 md:p-6 flex flex-col items-center justify-center text-white text-center">
                            <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest opacity-70 mb-1">
                              {booking.isEmergency ? "Emergency" : "Token Number"}
                            </p>
                            <p className="text-4xl md:text-5xl font-black">
                              #{booking.tokenNumber}
                            </p>
                            <div className="mt-2 md:mt-3 flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-white/10">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              {statusLabel(booking.status)}
                            </div>
                          </div>
                          <div className="flex-1 p-6 flex flex-col justify-between bg-white">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="text-lg font-black text-slate-900">
                                  {booking.doctorName}
                                </h3>
                                <p className="text-sm text-primary font-bold">
                                  {booking.clinic}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                                  {new Date(booking.createdAt).toLocaleDateString()}
                                </p>
                                <p className="text-xs text-slate-400 mt-0.5">
                                  {new Date(booking.createdAt).toLocaleTimeString(
                                    [],
                                    { hour: "2-digit", minute: "2-digit" }
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
                              {!booking.isEmergency && (
                                <div className="flex items-center gap-2">
                                  <Activity className="w-4 h-4 text-primary" />
                                  <span>
                                    Abhi Number Hai: <b>#{booking.currentServing}</b>
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-emerald-500" />
                                <span>
                                  Wait:{" "}
                                  <b>
                                    {booking.isEmergency
                                      ? "Priority"
                                      : booking.estimatedWaitTime}
                                  </b>
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-amber-500" />
                                <span>
                                  Pos: <b>{booking.positionLabel}</b>
                                </span>
                              </div>
                            </div>
                            <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                              <Button
                                onClick={() => router.push(`/confirmation`)}
                                className="rounded-xl bg-[#205E98] text-white hover:bg-[#205E98]/90 font-bold gap-1.5 h-12 md:h-10 w-full sm:w-auto shadow-md shadow-blue-900/20"
                              >
                                Live Queue Track Karo <ChevronRight className="w-4 h-4 md:w-3.5 md:h-3.5" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleShareWhatsApp(booking)}
                                className="rounded-xl border-emerald-100 text-emerald-700 hover:bg-emerald-50 font-bold gap-1.5 h-12 md:h-10 w-full sm:w-auto"
                              >
                                <MessageSquare className="w-4 h-4 md:w-3.5 md:h-3.5" />{" "}
                                Share
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  router.push(`/doctors/${booking.doctorSlug}`)
                                }
                                className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 font-bold gap-1.5 h-12 md:h-10 sm:ml-auto w-full sm:w-auto"
                              >
                                View Clinic{" "}
                                <ExternalLink className="w-4 h-4 md:w-3.5 md:h-3.5" />
                              </Button>
                              {/* PR-1: Cancel button — only for WAITING tokens */}
                              {booking.status === "WAITING" && (
                                <>
                                  {cancellingId === booking.id ? (
                                    <div className="flex flex-col gap-2 w-full sm:w-auto">
                                      {cancelError && (
                                        <p className="text-xs text-red-600 font-bold">{cancelError}</p>
                                      )}
                                      <div className="flex gap-2">
                                        <Button
                                          size="sm"
                                          disabled={isCancelling}
                                          onClick={() => handleCancelBooking(booking.id)}
                                          className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold h-10 flex-1"
                                        >
                                          {isCancelling ? "Cancelling..." : "Haan, Cancel Karein"}
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          disabled={isCancelling}
                                          onClick={() => { setCancellingId(null); setCancelError(null); }}
                                          className="rounded-xl border-slate-200 text-slate-600 font-bold h-10 flex-1"
                                        >
                                          Keep
                                        </Button>
                                      </div>
                                      <p className="text-[10px] text-slate-400 font-medium text-center">Isse aapka slot hat jayega.</p>
                                    </div>
                                  ) : (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => { setCancellingId(booking.id); setCancelError(null); }}
                                      className="rounded-xl border-red-100 text-red-600 hover:bg-red-50 font-bold gap-1.5 h-12 md:h-10 w-full sm:w-auto"
                                    >
                                      <XCircle className="w-4 h-4 md:w-3.5 md:h-3.5" /> Cancel
                                    </Button>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-[40px] p-10 text-center border border-slate-100 shadow-soft max-w-2xl mx-auto relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                <div className="w-20 h-20 bg-primary/8 rounded-3xl flex items-center justify-center mx-auto mb-5 border border-primary/10">
                  <Search className="w-9 h-9 text-primary" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                  Koi Active Token Nahi Hai
                </h2>
                <p className="text-slate-500 font-medium max-w-md mx-auto leading-relaxed mb-8">
                  Aapka abhi koi active queue token nahi hai. Kya aapko aaj doctor ko dikhana hai?
                </p>
                <Button
                  onClick={() => router.push("/doctors")}
                  className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 font-bold shadow-lg shadow-primary/20 transition-all text-white"
                >
                  Verified Doctors Dhundhein{" "}
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </div>
            )}

            {pastBookings.length > 0 && (
              <div className="pt-8">
                <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" /> Purani Consultations
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pastBookings.slice(0, 6).map((booking) => (
                    <div
                      key={booking.id}
                      className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                              booking.status === "COMPLETED"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {statusLabel(booking.status)}
                          </span>
                          <span className="text-xs text-slate-400 font-bold">
                            {new Date(booking.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="text-base font-black text-slate-900 leading-tight">
                          {booking.doctorName}
                        </h4>
                        <p className="text-sm text-slate-500 font-medium mt-1 truncate">
                          {booking.clinic}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() =>
                          router.push(
                            `/doctors/${booking.doctorSlug}?autoBook=true`
                          )
                        }
                        className="mt-5 w-full h-10 rounded-xl border-primary/20 text-primary font-bold hover:bg-primary/5 hover:border-primary/40"
                      >
                        Dobara Book Karein
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-12 p-6 rounded-3xl bg-emerald-50 border border-emerald-100 flex items-start gap-4">
          <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-emerald-900">Privacy & Suraksha</p>
            <p className="text-sm text-emerald-700 mt-1">
              Aapka booking data bilkul safe hai. JivniCare verified clinics aapka details tabhi dekh payenge jab aap pahuch kar apna token dikhayenge.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

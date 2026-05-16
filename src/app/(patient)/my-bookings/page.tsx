"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  Calendar, Clock, MapPin, ChevronRight, 
  Search, ShieldCheck, MessageSquare, ExternalLink,
  Activity, Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { motion } from "framer-motion";

export default function MyBookingsPage() {
  const router = useRouter();
  interface Booking {
    id: string;
    tokenNumber: number;
    status: string;
    doctorId: string;
    doctorName: string;
    clinic: string;
    location: string;
    estimatedWaitMinutes: number;
    createdAt: string;
  }
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBookings = useCallback(async () => {
    try {
      const res = await fetch("/api/patient/my-bookings");
      const data = await res.json();
      
      if (res.ok && data.bookings) {
        // Map backend tokens to UI format
        interface ApiToken {
          id: string;
          tokenNumber: number;
          status: string;
          tokenIssuedAt: string;
          queue: {
            doctorId: string;
            currentActiveToken: number;
            doctor: {
              user: { name: string };
              clinic?: string;
              district?: string;
            };
          };
        }
        const formattedBookings = data.bookings.map((t: ApiToken) => {
          const currentServing = t.queue.currentActiveToken || 0;
          const pos = t.tokenNumber - currentServing;
          const queuePosition = pos > 0 ? pos : 0;
          const avgTime = (t.queue as any).doctor?.averageConsultationTime || 15;
          
          return {
            id: t.id,
            tokenNumber: t.tokenNumber,
            status: t.status,
            doctorId: t.queue.doctorId,
            doctorName: t.queue.doctor.user.name,
            clinic: t.queue.doctor.clinic || "JivniCare Clinic",
            location: t.queue.doctor.district || "Local",
            estimatedWaitMinutes: queuePosition * avgTime, 
            createdAt: t.tokenIssuedAt,
            currentServing,
            queuePosition
          };
        });
        setBookings(formattedBookings);
      }
    } catch (e) {
      console.error("Failed to load bookings", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const poll = async () => {
      if (document.visibilityState === 'visible') {
        await fetchBookings();
      }
      timeoutId = setTimeout(poll, 60000); // 60s
    };
    poll();
    return () => clearTimeout(timeoutId);
  }, [fetchBookings]);

  const handleShareWhatsApp = (booking: Booking) => {
    const text = `*JivniCare Token Detail*\n\n` +
      `🩺 *Doctor:* ${booking.doctorName}\n` +
      `🎫 *Token:* #${booking.tokenNumber}\n` +
      `🕒 *Wait:* ~${booking.estimatedWaitMinutes}m\n` +
      `📍 *Location:* ${booking.clinic}, ${booking.location}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Bookings</h1>
          <p className="text-slate-500 font-medium mt-1">Manage your active tokens and history.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-3xl border border-slate-100 overflow-hidden animate-pulse">
                <div className="flex flex-col md:flex-row">
                  {/* Token column skeleton */}
                  <div className="bg-primary/20 md:w-40 p-6 flex flex-col items-center justify-center gap-3">
                    <div className="h-3 w-10 bg-white/30 rounded-full" />
                    <div className="h-12 w-16 bg-white/40 rounded-xl" />
                    <div className="h-5 w-20 bg-white/20 rounded-full" />
                  </div>
                  {/* Info section skeleton */}
                  <div className="flex-1 p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="h-5 w-36 bg-slate-200 rounded-full" />
                        <div className="h-4 w-28 bg-slate-100 rounded-full" />
                      </div>
                      <div className="h-4 w-20 bg-slate-100 rounded-full" />
                    </div>
                    <div className="flex gap-4">
                      <div className="h-4 w-20 bg-slate-100 rounded-full" />
                      <div className="h-4 w-20 bg-slate-100 rounded-full" />
                      <div className="h-4 w-20 bg-slate-100 rounded-full" />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <div className="h-12 w-24 bg-slate-100 rounded-xl" />
                      <div className="h-12 w-28 bg-slate-100 rounded-xl" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-12">
            {bookings.filter(b => b.status === "WAITING" || b.status === "IN_CONSULTATION").length > 0 ? (
              <div className="space-y-4">
                {bookings.filter(b => b.status === "WAITING" || b.status === "IN_CONSULTATION").map((booking, idx) => (
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
                            <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest opacity-70 mb-1">Token</p>
                            <p className="text-4xl md:text-5xl font-black">#{booking.tokenNumber}</p>
                            <div className="mt-2 md:mt-3 flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-white/10">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              {booking.status}
                            </div>
                          </div>
                          <div className="flex-1 p-6 flex flex-col justify-between bg-white">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="text-lg font-black text-slate-900">{booking.doctorName}</h3>
                                <p className="text-sm text-primary font-bold">{booking.clinic}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{new Date(booking.createdAt).toLocaleDateString()}</p>
                                <p className="text-xs text-slate-400 mt-0.5">{new Date(booking.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                              </div>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
                              <div className="flex items-center gap-2">
                                <Activity className="w-4 h-4 text-primary" />
                                <span>Serving: <b>#{ (booking as any).currentServing }</b></span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-emerald-500" />
                                <span>Wait: <b>~{booking.estimatedWaitMinutes}m</b></span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-amber-500" />
                                <span>Pos: <b>{ (booking as any).queuePosition }</b></span>
                              </div>
                            </div>
                            <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleShareWhatsApp(booking)}
                                className="rounded-xl border-emerald-100 text-emerald-700 hover:bg-emerald-50 font-bold gap-1.5 h-12 md:h-10 w-full sm:w-auto"
                              >
                                <MessageSquare className="w-4 h-4 md:w-3.5 md:h-3.5" /> Share
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => router.push(`/doctors/${booking.doctorId}`)}
                                className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 font-bold gap-1.5 h-12 md:h-10 sm:ml-auto w-full sm:w-auto"
                              >
                                  View Clinic <ExternalLink className="w-4 h-4 md:w-3.5 md:h-3.5" />
                              </Button>
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
                <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">No Active Tokens</h2>
                <p className="text-slate-500 font-medium max-w-md mx-auto leading-relaxed mb-8">
                  You don't have any active queue tokens. Need to see a doctor today?
                </p>
                <Button onClick={() => window.location.href = "/doctors"} className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 font-bold shadow-lg shadow-primary/20 transition-all text-white">
                  Find Verified Doctors <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </div>
            )}

            {/* Past Consultations / Retention UI */}
            {bookings.filter(b => b.status === "COMPLETED" || b.status === "SKIPPED" || b.status === "CANCELLED").length > 0 && (
              <div className="pt-8">
                <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" /> Previously Consulted
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bookings.filter(b => b.status === "COMPLETED" || b.status === "SKIPPED" || b.status === "CANCELLED").slice(0, 6).map((booking, idx) => (
                    <div key={booking.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${booking.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                            {booking.status}
                          </span>
                          <span className="text-xs text-slate-400 font-bold">{new Date(booking.createdAt).toLocaleDateString()}</span>
                        </div>
                        <h4 className="text-base font-black text-slate-900 leading-tight">{booking.doctorName}</h4>
                        <p className="text-sm text-slate-500 font-medium mt-1 truncate">{booking.clinic}</p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => router.push(`/doctors/${booking.doctorId}`)}
                        className="mt-5 w-full h-10 rounded-xl border-primary/20 text-primary font-bold hover:bg-primary/5 hover:border-primary/40"
                      >
                        Book Again
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Security Notice */}
        <div className="mt-12 p-6 rounded-3xl bg-emerald-50 border border-emerald-100 flex items-start gap-4">
          <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-emerald-900">Privacy & Security</p>
            <p className="text-sm text-emerald-700 mt-1">Your booking data is stored securely. JivniCare verified clinics will only access your details when you arrive and present your token.</p>
          </div>
        </div>
      </div>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import { 
  Calendar, Clock, MapPin, ChevronRight, 
  Search, ShieldCheck, MessageSquare, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch("/api/patient/my-bookings");
        const data = await res.json();
        
        if (res.ok && data.bookings) {
          // Map backend tokens to UI format
          const formattedBookings = data.bookings.map((t: any) => ({
            id: t.id,
            tokenNumber: t.tokenNumber,
            status: t.status,
            doctorId: t.queue.doctorId,
            doctorName: t.queue.doctor.user.name,
            clinic: t.queue.doctor.clinic || "JivniCare Clinic",
            location: t.queue.doctor.district || "Local",
            estimatedWaitMinutes: 15, // dynamic estimate logic can go here
            createdAt: t.tokenIssuedAt,
          }));
          setBookings(formattedBookings);
        } else {
          console.error("Error fetching bookings:", data.error);
        }
      } catch (e) {
        console.error("Failed to load bookings", e);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBookings();
  }, []);

  const handleShareWhatsApp = (booking: any) => {
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
              <div key={i} className="h-32 bg-white rounded-3xl animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((booking, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={booking.id}
              >
                <Card className="border-slate-100 shadow-sm hover:shadow-md transition-shadow rounded-3xl overflow-hidden group">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      {/* Token Section */}
                      <div className="bg-primary md:w-40 p-6 flex flex-col items-center justify-center text-white text-center">
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">Token</p>
                        <p className="text-4xl font-black">#{booking.tokenNumber}</p>
                        <div className="mt-3 flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-white/10">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          {booking.status}
                        </div>
                      </div>

                      {/* Info Section */}
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
                            <Clock className="w-4 h-4 text-emerald-500" />
                            <span>Wait: <b>~{booking.estimatedWaitMinutes}m</b></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <span>{booking.location}</span>
                          </div>
                        </div>

                        <div className="mt-6 flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleShareWhatsApp(booking)}
                            className="rounded-xl border-emerald-100 text-emerald-700 hover:bg-emerald-50 font-bold gap-1.5 h-10"
                          >
                            <MessageSquare className="w-3.5 h-3.5" /> Share
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.location.href = `/doctors/${booking.doctorId}`}
                            className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 font-bold gap-1.5 h-10 ml-auto"
                          >
                              View Clinic <ExternalLink className="w-3.5 h-3.5" />
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
          <div className="bg-white rounded-[40px] p-12 text-center border border-slate-100 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-slate-200" />
            </div>
            <h2 className="text-xl font-black text-slate-900">No bookings yet</h2>
            <p className="text-slate-500 mt-2 max-w-xs mx-auto">Your medical consultation history and active tokens will appear here.</p>
            <Button onClick={() => window.location.href = "/doctors"} className="mt-8 h-14 px-8 rounded-2xl bg-primary hover:bg-[#1a4b7a] font-bold">
              Find a Doctor
            </Button>
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

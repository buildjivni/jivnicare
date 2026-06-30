"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBookingStore } from "@/features/booking/store/useBookingStore";
import { CheckCircle2, MapPin, ChevronRight, Activity, ShieldCheck, PhoneCall, Info, Navigation, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ConfirmationPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [eta, setEta] = useState("");
  const [queueStats, setQueueStats] = useState<{ currentToken: number; totalInQueue: number; estimatedWait: number } | null>(null);
  
  const token = useBookingStore(state => state.generatedToken);
  const setGeneratedToken = useBookingStore(state => state.setGeneratedToken);
  const doctor = useBookingStore(state => state.selectedDoctor);
  const resetBooking = useBookingStore(state => state.resetBooking);

  useEffect(() => {
    setMounted(true);
    
    // Set a 3-second timeout to show error if data is missing
    const timer = setTimeout(() => {
      if (!token && !localStorage.getItem("jc_active_token")) {
        setTimedOut(true);
      }
    }, 3000);

    if (!token) {
      try {
        const savedToken = localStorage.getItem("jc_active_token");
        if (savedToken) {
          const parsed = JSON.parse(savedToken);
          setGeneratedToken(parsed);
        }
      } catch (e) { console.error("Hydration failed", e); }
    }

    return () => clearTimeout(timer);
  }, [setGeneratedToken, token]);

  useEffect(() => {
    if (!mounted) return;
    // Immediate redirect only if we are absolutely sure no data exists
    // Otherwise wait for the 3s timeout or hydration
    if (!token && !localStorage.getItem("jc_active_token") && timedOut) {
      // router.replace("/"); // Let the UI show the error first
    }
  }, [mounted, router, token, timedOut]);

  // Poll real queue stats every 15 seconds
  useEffect(() => {
    if (!mounted || !token?.doctorId) return;
    let timeoutId: NodeJS.Timeout;
    const fetchStats = async () => {
      try {
        if (document.visibilityState === "visible") {
          const res = await fetch(`/api/public/doctor/${token.doctorId}/queue-stats`);
          const data = await res.json();
          if (data.success) setQueueStats(data.queue);
        }
      } catch {} finally {
        timeoutId = setTimeout(fetchStats, 15000);
      }
    };
    fetchStats();
    return () => clearTimeout(timeoutId);
  }, [mounted, token]);

  const currentServing = queueStats?.currentToken ?? Math.max(1, (token?.tokenNumber || 1) - 1);
  const currentWait = queueStats?.estimatedWait ?? token?.estimatedWaitMinutes ?? 45;
  const myToken = token?.tokenNumber || 1;
  
  // Calculate progress for the visual timeline
  const tokensAhead = Math.max(0, myToken - currentServing);
  const progressPercent = myToken === 1 ? 100 : Math.min(100, Math.max(5, (currentServing / myToken) * 100));
  const isMyTurn = tokensAhead === 0 || currentServing >= myToken;

  useEffect(() => {
    if (mounted) {
      setEta(new Date(Date.now() + currentWait * 60000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}));
    }
  }, [mounted, currentWait]);

  const handleShareWhatsApp = () => {
    if (!token || !doctor) return;
    const isEmergency = (token as any).tokenType === "EMERGENCY";
    const waitLine = isEmergency
      ? "Emergency priority"
      : `Wait: ${currentWait} mins`;
    const text =
      `*JivniCare Token Detail*\n\n` +
      `🩺 *Doctor:* ${doctor.name}\n` +
      `🎫 *Token:* #${myToken}\n` +
      `🕒 *Wait:* ${waitLine}\n` +
      `📍 *Location:* ${doctor.clinic || "Clinic"}, ${doctor.location}\n\n` +
      `📲 *Live status track karein:* ${window.location.origin}/doctors/${doctor.slug}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  if (timedOut && (!token || !doctor)) {
    return (
      <div className="bg-slate-50 min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100 max-w-md w-full text-center fade-in">
          <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Activity className="w-10 h-10 text-amber-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Booking nahi mila</h2>
          <p className="text-slate-500 font-medium mb-8 leading-relaxed">
            Hamein aapka active booking data nahi mila. Agar aapne abhi book kiya hai, toh kripya "My Bookings" check karein.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/my-bookings" className="w-full">
              <Button className="h-14 w-full rounded-2xl bg-primary text-white font-bold shadow-lg shadow-primary/20">
                Check My Bookings
              </Button>
            </Link>
            <Link href="/" onClick={resetBooking} className="w-full">
              <Button variant="ghost" className="h-12 w-full rounded-2xl text-slate-500 font-bold">
                Return to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!mounted || !token || !doctor) return (
    <div className="bg-slate-50 min-h-screen pt-12">
      <div className="container mx-auto px-4 max-w-lg relative z-10 animate-pulse">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="h-64 bg-slate-100" />
          <div className="p-8 space-y-4">
            <div className="h-6 w-48 bg-slate-200 rounded-full" />
            <div className="h-4 w-full bg-slate-100 rounded-full" />
            <div className="h-4 w-3/4 bg-slate-100 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-screen pt-6 md:pt-12 pb-24 relative">
      
      {/* Calm Header */}
      <div className="container mx-auto px-4 max-w-lg relative z-10 fade-in-up">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Booking Confirm ho gayi!</h1>
          <p className="text-slate-500 font-medium mt-1.5">Queue mein aapki jagah safe hai.</p>
        </div>

        {/* Live Tracking Card */}
        <div className={`bg-white rounded-[32px] shadow-premium border ${isMyTurn ? 'border-emerald-200 shadow-emerald-900/10' : 'border-slate-100'} relative overflow-hidden mb-6 transition-all duration-500`}>
          
          <div className={`absolute top-5 right-5 flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${isMyTurn ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isMyTurn ? 'bg-white' : 'bg-emerald-500'} animate-pulse`} />
            <span className="text-[10px] font-bold uppercase tracking-wide">Live</span>
          </div>

          <div className="p-6 md:p-8 text-center border-b border-slate-50">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Aapka Token</p>
            <h2 className={`text-7xl font-black ${isMyTurn ? 'text-emerald-600' : 'text-slate-900'} tracking-tighter leading-none mb-4`}>#{myToken}</h2>
            
            {isMyTurn ? (
              <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl animate-pulse">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <p className="text-sm font-bold text-emerald-800">Doctor abhi aapko dekh rahe hain</p>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 bg-[#5696C7]/5 border border-[#5696C7]/10 px-4 py-2 rounded-xl">
                <Activity className="w-4 h-4 text-[#5696C7]" />
                <p className="text-sm font-bold text-slate-700">Abhi Number Hai: <span className="text-[#5696C7] text-base">#{currentServing}</span></p>
              </div>
            )}
          </div>

          {/* Visual Timeline Bar */}
          {isMyTurn ? (
            <div className="px-6 md:px-8 py-8 bg-emerald-500 text-center animate-in fade-in duration-500">
              <h3 className="text-2xl md:text-3xl font-black text-white mb-2 tracking-tight">Aapki baari aa gayi!</h3>
              <p className="text-emerald-50 font-medium text-lg">Doctor ke paas jaiye abhi.</p>
            </div>
          ) : (
            <div className="px-6 md:px-8 py-6 bg-slate-50/50">
              <div className="flex justify-between text-xs font-bold text-slate-500 mb-3">
                <span>Token #1</span>
                <span>Aapka Number</span>
              </div>
              
              <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden relative">
                <div 
                  className="absolute top-0 left-0 h-full bg-[#5696C7] rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
                <div 
                  className="absolute top-0 h-full w-4 bg-white/40 blur-[2px] animate-pulse transition-all duration-1000 ease-out"
                  style={{ left: `calc(${progressPercent}% - 8px)` }}
                />
              </div>
              
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-600 font-medium">
                Aapse pehle <span className="font-bold text-slate-900">{tokensAhead}</span> {tokensAhead === 1 ? 'patient' : 'patients'} hain
              </div>
            </div>
          )}

          {/* Arrival Window (Only show if not my turn) */}
          {!isMyTurn && (
            <div className="p-6 md:p-8 border-t border-slate-50">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100">
                  <Clock className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Kab Tak Pahuchna Hai</p>
                  <p className="font-black text-xl text-slate-900">Lagbhag {currentWait} mins mein</p>
                  <p className="text-[11px] font-bold text-slate-400 mb-1">(Actual time vary kar sakta hai)</p>
                  <p className="text-sm text-slate-500 font-medium leading-snug mt-1">
                    Koshish karein ki clinic <strong className="text-slate-700">{eta}</strong> tak pahuch jayein
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* WhatsApp Share Button */}
        <div className="mb-6 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-150">
          <Button
            onClick={handleShareWhatsApp}
            className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-600/10 flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-[1.01]"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.45 5.5.003 9.961-4.463 9.964-9.97.002-2.67-1.03-5.18-2.906-7.06C16.452 1.7 13.943.666 11.278.666c-5.502 0-9.972 4.47-9.975 9.979-.001 1.704.444 3.37 1.287 4.853l-1.013 3.7.3.093 3.98-1.043.201.121zM18.062 14c-.31-.156-1.838-.907-2.122-1.01-.285-.104-.492-.156-.7.156-.207.31-.8.1-.98.78-.18.207-.36.233-.67.078-.31-.156-1.309-.48-2.493-1.537-.919-.818-1.54-1.83-1.72-2.139-.18-.31-.02-.477.136-.633.14-.139.31-.36.46-.54.16-.18.21-.31.31-.52.1-.208.05-.389-.02-.54-.08-.156-.7-1.688-.96-2.307-.25-.612-.51-.53-.7-.54-.18-.011-.39-.011-.6-.011-.21 0-.55.078-.84.39-.29.311-1.11 1.09-1.11 2.66 0 1.571 1.14 3.09 1.3 3.3.16.208 2.24 3.42 5.43 4.8 1.19.52 1.94.75 2.58.91.73.18 1.4.15 1.92.07.58-.09 1.84-.75 2.1-1.48.26-.73.26-1.35.18-1.48-.08-.13-.3-.21-.61-.36z" />
            </svg>
            Family Ke Saath WhatsApp Share Karein
          </Button>
        </div>

        {/* Clinic Info & Directions */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900">{doctor.clinic || "Clinic"}</p>
              <p className="text-sm text-slate-500 line-clamp-2">{doctor.location}</p>
            </div>
          </div>
          <a 
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${doctor.clinic} ${doctor.location}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto shrink-0"
          >
            <Button variant="outline" className="w-full rounded-xl font-bold border-slate-200 text-[#5696C7] hover:bg-[#5696C7]/5">
              <Navigation className="w-4 h-4 mr-2" /> Raasta Dekhein
            </Button>
          </a>
        </div>

        {/* Guidance Blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-start gap-3">
            <Info className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-[13px] font-bold text-slate-900 mb-1">Der ho gayi toh?</h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Agar aap late hote hain, toh aapka token thoda neeche kar diya jayega taaki booking cancel na ho.
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-start gap-3">
            <PhoneCall className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-[13px] font-bold text-slate-900 mb-1">Cancel karna hai?</h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed mb-2">
                Token release kar dein taaki kisi aur patient ko jagah mil sake.
              </p>
              <Link href="/my-bookings" className="text-[11px] font-bold text-red-600 hover:underline">
                Booking Cancel Karein
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" onClick={resetBooking}>
            <Button variant="ghost" className="h-14 px-8 rounded-xl font-bold text-slate-500 hover:text-slate-900">
              Home Par Jaiye
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}

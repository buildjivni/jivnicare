"use client";
import { useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { User, Settings, HeartPulse } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore, getRoleRedirect } from "@/features/auth/store/useAuthStore";

interface MobileNavProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isLoggedIn: boolean;
  pathname: string;
  navLinks: Array<{ label: string; href: string; icon: React.ReactNode }>;
  onLogout: () => void;
}

export function MobileNav({ isOpen, setIsOpen, isLoggedIn, pathname, navLinks, onLogout }: MobileNavProps) {
  const { user } = useAuthStore();

  // Lock scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[105] bg-slate-900/25 backdrop-blur-sm md:hidden"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Slide-from-right Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38, mass: 1 }}
            className="fixed top-0 right-0 bottom-0 z-[110] w-[85vw] max-w-sm bg-white shadow-2xl md:hidden flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Menu</span>
              <button
                onClick={() => setIsOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors active:scale-95"
                aria-label="Close menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable Nav Body */}
            <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-1">

              {/* Logged-in User Profile Card */}
              {isLoggedIn && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04, duration: 0.22 }}
                >
                  <Link
                    href={getRoleRedirect(user?.role ?? null)}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-4 p-4 mb-4 bg-gradient-to-br from-primary/5 via-transparent to-emerald-50/40 rounded-2xl border border-primary/10 hover:border-primary/20 hover:shadow-sm transition-all"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 ring-2 ring-primary/15 ring-offset-1 flex items-center justify-center text-primary shrink-0">
                      <User className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">{user?.name ?? "Patient"}</p>
                      <p className="text-xs text-primary font-medium mt-0.5">View Dashboard →</p>
                    </div>
                  </Link>
                </motion.div>
              )}

              {/* Primary Nav Links */}
              {navLinks
                .filter(link => link.label === "My Bookings" ? isLoggedIn : true)
                .map((link, i) => {
                  const isActive = pathname === link.href || (pathname.startsWith("/doctors") && link.href === "/doctors");
                  const isHighlighted = (link as any).highlight;
                  return (
                    <motion.div
                      key={link.label}
                      initial={{ opacity: 0, x: 18 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.06 + i * 0.045, type: "spring", stiffness: 400, damping: 34 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3.5 px-4 py-3.5 text-[15px] font-semibold rounded-2xl transition-all duration-200 active:scale-[0.97] ${
                          isActive
                            ? "text-primary bg-primary/8 ring-1 ring-primary/12"
                            : isHighlighted
                            ? "text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-105 hover:text-rose-700 animate-pulse"
                            : "text-slate-600 hover:text-primary hover:bg-slate-50"
                        }`}
                      >
                        <span className={`shrink-0 ${isActive ? "text-primary" : isHighlighted ? "text-rose-500 animate-pulse" : "text-slate-400"}`}>{link.icon}</span>
                        <span className="flex-1">{link.label}</span>
                        {isActive && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                        {!isActive && isHighlighted && (
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}


            </nav>

            {/* Sticky Bottom CTA */}
            <div
              className="p-4 border-t border-slate-100 bg-white/95 backdrop-blur-sm"
              style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom))" }}
            >
              {!isLoggedIn ? (
                <div className="flex flex-col gap-2.5">
                  <Link href={pathname === "/partners" ? "/partners/login" : "/login"} onClick={() => setIsOpen(false)} className="block w-full">
                    <Button variant="outline" className="w-full h-12 font-semibold border-slate-200 text-slate-700 rounded-2xl">
                      {pathname === "/partners" ? "Doctor Sign In" : "Log In"}
                    </Button>
                  </Link>
                  <Link href={pathname === "/partners" ? "/partners/onboard" : "/doctors"} onClick={() => setIsOpen(false)} className="block w-full">
                    <Button className={`w-full h-12 font-bold rounded-2xl shadow-lg ${pathname === "/partners" ? "bg-gradient-to-r from-[#205E98] to-[#4A8C4A] border-none text-white hover:opacity-90 shadow-emerald-500/10" : "shadow-primary/25"}`}>
                      {pathname === "/partners" ? "Join Partner Network" : "Book Appointment"}
                    </Button>
                  </Link>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => { onLogout(); setIsOpen(false); }}
                  className="w-full h-12 font-semibold rounded-2xl text-rose-600 border-rose-200 bg-rose-50 hover:bg-rose-100 hover:border-rose-300 active:scale-[0.98]"
                >
                  Log Out
                </Button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

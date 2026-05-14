"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { User, Settings, HeartPulse } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore, getRoleRedirect } from "@/store/useAuthStore";

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
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="fixed top-16 inset-x-0 bottom-0 z-40 bg-white/95 backdrop-blur-xl md:hidden overflow-y-auto"
        >
          <div className="flex flex-col min-h-full">
            <nav className="container mx-auto px-4 py-6 flex flex-col gap-2 flex-1">
              {isLoggedIn && (
              <Link
                href={getRoleRedirect(user?.role ?? null)}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-4 p-4 mb-4 bg-slate-50 rounded-2xl border border-slate-100"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">{user?.name ?? "Patient"}</p>
                  <p className="text-xs text-slate-500">{user?.phone ?? ""}</p>
                </div>
              </Link>
              )}

              {navLinks.filter(link => link.label !== "My Bookings" || isLoggedIn).map((link) => {
                const isActive = pathname === link.href || (pathname.startsWith('/doctors') && link.href === '/doctors');
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3.5 text-base font-medium rounded-2xl transition-all ${
                      isActive ? "text-primary bg-primary/10" : "text-slate-700 hover:text-primary hover:bg-slate-50"
                    }`}
                  >
                    <span className={isActive ? "text-primary" : "text-slate-400"}>{link.icon}</span>
                    {link.label}
                  </Link>
                );
              })}

              {isLoggedIn && (
                <>
                  <div className="h-px bg-slate-100 my-2" />
                  <Link
                    href="/records"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3.5 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-2xl"
                  >
                    <span className="text-slate-400"><HeartPulse className="w-4 h-4" /></span>
                    Medical Records
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3.5 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-2xl"
                  >
                    <span className="text-slate-400"><Settings className="w-4 h-4" /></span>
                    Settings
                  </Link>
                </>
              )}
            </nav>

            <div className="p-4 border-t border-slate-100 bg-white sticky bottom-0">
              {!isLoggedIn ? (
                <div className="flex flex-col gap-3">
                <Link href="/login" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full rounded-xl h-12 font-semibold border-slate-200">
                    Log In
                  </Button>
                </Link>
                <Link href="/doctors" onClick={() => setIsOpen(false)}>
                  <Button className="w-full rounded-xl h-12 font-bold bg-primary hover:bg-primary/90 shadow-md shadow-primary/20">
                    Book Appointment
                  </Button>
                </Link>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={() => { onLogout(); setIsOpen(false); }} 
                  className="w-full rounded-xl h-12 font-semibold text-rose-600 border-rose-200 bg-rose-50 hover:bg-rose-100"
                >
                  Log Out
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

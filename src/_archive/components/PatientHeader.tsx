"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Menu, X, CalendarDays, Stethoscope, User, Bell, 
  Search, ClipboardList, Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/Logo";
import { BrandName } from "@/components/brand/BrandName";
import { useAuthStore } from "@/store/useAuthStore";
import { UserProfileDropdown } from "./UserProfileDropdown";
import { NotificationBell } from "./NotificationBell";
import { MobileNav } from "./MobileNav";

const PATIENT_NAV = [
  { label: "Find Doctors", href: "/doctors", icon: <Stethoscope className="w-4 h-4" /> },
  { label: "My Bookings", href: "/my-bookings", icon: <CalendarDays className="w-4 h-4" /> },
  { label: "Live Queue", href: "/my-bookings", icon: <Activity className="w-4 h-4" /> }, // Future: /queue
];

export function PatientHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const profileRef = useRef<HTMLDivElement>(null);
  const { user, logout, token } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (!mounted) return null;

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm"
          : "bg-white border-b border-slate-100"
      }`}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-7xl">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <Logo className="w-9 h-9 transition-transform group-hover:scale-105" />
          <BrandName className="text-xl" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {PATIENT_NAV.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`px-4 py-2 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${
                  isActive 
                    ? "text-primary bg-primary/10" 
                    : "text-slate-600 hover:text-primary hover:bg-slate-50"
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="flex items-center gap-3">
          <NotificationBell token={token} />
          
          <div className="h-8 w-[1px] bg-slate-100 mx-1 hidden md:block" />

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button 
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-1.5 pr-3 rounded-full border border-slate-200 hover:border-primary/30 hover:bg-slate-50 transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <User className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-700 hidden sm:block">
                {user?.name?.split(' ')[0] || "Patient"}
              </span>
            </button>
            <UserProfileDropdown isOpen={profileOpen} onLogout={handleLogout} />
          </div>

          <Link href="/doctors" className="hidden lg:block">
            <Button size="sm" className="rounded-xl bg-primary hover:bg-primary/90 font-bold gap-2">
              <Search className="w-4 h-4" /> New Booking
            </Button>
          </Link>
        </div>
      </div>

      <MobileNav 
        isOpen={mobileMenuOpen} 
        setIsOpen={setMobileMenuOpen}
        isLoggedIn={!!user}
        pathname={pathname}
        navLinks={PATIENT_NAV}
        onLogout={handleLogout}
      />
    </header>
  );
}

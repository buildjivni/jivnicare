"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, CalendarDays, Stethoscope, BookOpen, Phone, User, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import { Logo } from "@/components/brand/Logo";
import { BrandName } from "@/components/brand/BrandName";
import { MobileNav } from "./MobileNav";
import { UserProfileDropdown } from "./UserProfileDropdown";
import { useAuthStore } from "@/store/useAuthStore";
import { NotificationBell } from "./NotificationBell";

const NAV_LINKS = [
  { label: "Find Doctors", href: "/doctors", icon: <Stethoscope className="w-4 h-4" /> },
  { label: "Specialties", href: "/#specialties", icon: <BookOpen className="w-4 h-4" /> },
  { label: "My Bookings", href: "/bookings", icon: <CalendarDays className="w-4 h-4" /> },
  { label: "For Partners", href: "/partners", icon: <Building2 className="w-4 h-4" /> },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const profileRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, logout, token } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => setMounted(true), []);
  
  const isLoggedIn = mounted ? isAuthenticated : false;

  const mobileProfileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const isOutsideDesktop = profileRef.current && !profileRef.current.contains(event.target as Node);
      const isOutsideMobile = mobileProfileRef.current && !mobileProfileRef.current.contains(event.target as Node);
      
      if (isOutsideDesktop && isOutsideMobile) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    router.push("/");
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? "bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-[0_4px_20px_rgb(0,0,0,0.03)]"
            : "bg-white/40 backdrop-blur-md border-b border-slate-100/30"
        }`}
      >
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between max-w-7xl">

          <Link href="/" className="flex items-center gap-1 group shrink-0">
            <div className="relative flex items-center justify-center w-12 h-12">
              <Logo className="w-12 h-12 transition-transform duration-300 group-hover:scale-105" />
            </div>
            <BrandName className="text-[1.75rem] ml-1" withTagline />
          </Link>

          {/* ── DESKTOP NAV ───────────────────── */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href || (pathname.startsWith('/doctors') && link.href === '/doctors');
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive 
                      ? "text-[#205E98] bg-[#205E98]/10 shadow-sm" 
                      : "text-slate-600 hover:text-[#205E98] hover:bg-slate-50 hover:shadow-sm"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* ── DESKTOP CTA ───────────────────── */}
          <div className="hidden md:flex items-center gap-2.5">
            {isLoggedIn ? (
              <>
                <NotificationBell token={token} />
                <div className="relative" ref={profileRef}>
                  <button 
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-[#205E98]/10 border border-[#205E98]/20 text-[#205E98] hover:bg-[#205E98]/20 transition-colors"
                    aria-label="Profile Menu"
                  >
                    <User className="w-5 h-5" />
                  </button>
                  
                  {/* Profile Dropdown */}
                  <UserProfileDropdown isOpen={profileOpen} onLogout={handleLogout} />
                </div>
              </>
            ) : (
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="h-9 px-5 rounded-xl text-sm font-semibold text-slate-600 hover:text-[#205E98] hover:bg-[#205E98]/8"
                >
                  Log In
                </Button>
              </Link>
            )}

            <Link href="/doctors">
              <Button
                className="h-9 px-5 rounded-xl text-sm font-semibold bg-[#205E98] hover:bg-[#184a7a] shadow-md shadow-[#205E98]/25 transition-all hover:shadow-lg hover:shadow-[#205E98]/30 hover:-translate-y-px"
              >
                Book Appointment
              </Button>
            </Link>
          </div>

          {/* ── MOBILE MENU TOGGLE ────────────── */}
          <div className="flex md:hidden items-center gap-2">
            {isLoggedIn && (
              <div className="relative" ref={mobileProfileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center justify-center w-11 h-11 rounded-full bg-[#205E98]/10 text-[#205E98] border border-[#205E98]/15"
                  aria-label="Toggle profile menu"
                >
                  <User className="w-5 h-5" />
                </button>
                <UserProfileDropdown isOpen={profileOpen} onLogout={handleLogout} />
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl w-11 h-11 text-slate-600 hover:bg-slate-100"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </header>

      {/* ── MOBILE DRAWER ─────────────────────── */}
      <MobileNav
        isOpen={mobileOpen}
        setIsOpen={setMobileOpen}
        isLoggedIn={isLoggedIn}
        pathname={pathname}
        navLinks={NAV_LINKS}
        onLogout={handleLogout}
      />
    </>
  );
}

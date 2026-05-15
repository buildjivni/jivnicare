"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, CalendarDays, Stethoscope, BookOpen, User } from "lucide-react";
import { Button } from "@/components/ui/button";

import { Logo } from "@/components/brand/Logo";
import { BrandName } from "@/components/brand/BrandName";
import { MobileNav } from "./MobileNav";
import { UserProfileDropdown } from "./UserProfileDropdown";
import { useAuthStore } from "@/store/useAuthStore";
import { NotificationBell } from "./NotificationBell";
import { SmartSearchBar } from "./SmartSearchBar";
import { cn } from "@/lib/utils";

// Removed "For Partners" as it belongs in the footer/dedicated portal to keep patient UX clean
const NAV_LINKS = [
  { label: "Find Doctors", href: "/doctors", icon: <Stethoscope className="w-4 h-4" /> },
  { label: "Specialties", href: "/#specialties", icon: <BookOpen className="w-4 h-4" /> },
  { label: "My Bookings", href: "/my-bookings", icon: <CalendarDays className="w-4 h-4" /> },
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
  
  // Hardened auth check for hydration safety
  const isLoggedIn = mounted ? isAuthenticated : false;
  const isDoctorsPage = pathname.startsWith("/doctors");

  const mobileProfileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const isOutsideDesktop = profileRef.current && !profileRef.current.contains(event.target as Node);
      const isOutsideMobile = mobileProfileRef.current && !mobileProfileRef.current.contains(event.target as Node);
      if (isOutsideDesktop && isOutsideMobile) setProfileOpen(false);
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
        className={cn(
          "sticky top-0 z-[100] w-full transition-all duration-500",
          scrolled
            ? "bg-white/80 backdrop-blur-xl border-b border-slate-200/40 shadow-[0_4px_30px_rgba(0,0,0,0.02)] h-16 md:h-16"
            : "bg-white/0 backdrop-blur-none border-b border-transparent h-16 md:h-20"
        )}
      >
        <div className="container mx-auto px-4 md:px-6 h-full flex items-center justify-between max-w-7xl w-full box-border">

          <Link href="/" className="flex items-center gap-2 group shrink min-w-0">
            <Logo className="w-12 h-12 md:w-16 md:h-16 shrink-0 transition-transform duration-300 hover:scale-105" />
            <BrandName className={cn("text-lg md:text-2xl font-black tracking-tight truncate", isDoctorsPage && pathname !== "/" ? "hidden lg:block" : "block")} />
          </Link>

          {/* ── DESKTOP NAV ───────────────────── */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-50/50 p-1 rounded-2xl border border-slate-100">
            {NAV_LINKS.filter(link => {
               // Strict filter: Only show "My Bookings" if logged in
               if (link.label === "My Bookings") return isLoggedIn;
               return true;
            }).map((link) => {
              const isActive = pathname === link.href || (pathname.startsWith('/doctors') && link.href === '/doctors');
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={cn(
                    "px-4 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ease-out active:scale-95",
                    isActive 
                      ? "text-primary bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] ring-1 ring-slate-100" 
                      : "text-slate-500 hover:text-primary hover:bg-white/60"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* ── SEARCH (Contextual) ── */}
          {isDoctorsPage && pathname !== "/" && (
            <div className="hidden md:flex flex-1 max-w-md mx-4 lg:mx-8">
              <SmartSearchBar compact district="Patna" className="w-full shadow-sm" />
            </div>
          )}

          {/* ── DESKTOP ACTIONS ───────────────── */}
          <div className="hidden lg:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <NotificationBell token={token} />
                <div className="relative" ref={profileRef}>
                  <button 
                    aria-label="User profile options"
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center justify-center w-11 h-11 rounded-full bg-primary/5 border border-primary/10 text-primary hover:bg-primary/10 hover:shadow-sm transition-all duration-300 active:scale-95"
                  >
                    <User className="w-5 h-5" />
                  </button>
                  <UserProfileDropdown isOpen={profileOpen} onLogout={handleLogout} />
                </div>
              </>
            ) : (
              <Link href="/login">
                <Button variant="ghost" className="rounded-xl font-bold text-slate-600 hover:text-primary">
                  Log In
                </Button>
              </Link>
            )}

            <Link href="/doctors">
              <Button aria-label="Book appointment" className="rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30">
                Book Appointment
              </Button>
            </Link>
          </div>

          {/* ── MOBILE ACTIONS ────────────────── */}
          <div className="flex lg:hidden items-center gap-2">
            {isLoggedIn && (
              <div className="relative" ref={mobileProfileRef}>
                <button
                  aria-label="User profile options"
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center justify-center w-11 h-11 rounded-full bg-primary/5 text-primary border border-primary/10 hover:bg-primary/10 transition-all duration-300 active:scale-95"
                >
                  <User className="w-5 h-5" />
                </button>
                <UserProfileDropdown isOpen={profileOpen} onLogout={handleLogout} />
              </div>
            )}
            <Button
              aria-label="Toggle navigation menu"
              variant="ghost"
              size="icon"
              className="rounded-xl w-11 h-11 text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-100 transition-all duration-300 active:scale-95"
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </header>

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

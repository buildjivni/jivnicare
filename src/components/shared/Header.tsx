"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Menu, 
  X, 
  CalendarDays, 
  Stethoscope, 
  User, 
  Newspaper, 
  Activity, 
  ShieldCheck, 
  ShieldAlert, 
  LayoutDashboard, 
  Clipboard,
  AlertTriangle,
  Settings,
  Clock,
  ArrowLeft,
  Search as SearchIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { Logo } from "@/features/marketing/components/brand/Logo";
import { MobileNav } from "./MobileNav";
import { UserProfileDropdown } from "./UserProfileDropdown";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { NotificationPanel } from "./NotificationPanel";
import { SmartSearchBar } from "./SmartSearchBar";
import { cn } from "@/lib/utils/utils";
import { useLocationStore } from "@/features/location/store/useLocationStore";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isMobileSearchExpanded, setIsMobileSearchExpanded] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const profileRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, logout, user } = useAuthStore();
  const { district } = useLocationStore();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => setMounted(true), []);
  
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

  // Dynamic navigation links based on user role and auth state
  const getNavLinks = () => {
    if (!isLoggedIn || !user) {
      return [
        { label: "Find Doctors", href: "/doctors", icon: <Stethoscope className="w-4.5 h-4.5" /> },
        { label: "Emergency Care", href: "/doctors?emergency=true", icon: <AlertTriangle className="w-4.5 h-4.5" />, highlight: true },
      ];
    }

    switch (user.role) {
      case "DOCTOR":
        return [
          { label: "Dashboard", href: "/doctor/dashboard?tab=overview", icon: <LayoutDashboard className="w-4 h-4" /> },
          { label: "Live Queue", href: "/doctor/dashboard?tab=queue", icon: <Activity className="w-4 h-4" /> },
          { label: "OPD Profile", href: "/doctor/dashboard?tab=profile", icon: <Clock className="w-4 h-4" /> },
          { label: "Settings", href: "/doctor/dashboard?tab=settings", icon: <Settings className="w-4 h-4" /> },
        ];
      case "ADMIN":
        return [
          { label: "Dashboard", href: "/admin/dashboard?tab=dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
          { label: "Verification Queue", href: "/admin/dashboard?tab=doctor-management", icon: <ShieldCheck className="w-4 h-4" /> },
          { label: "Moderation", href: "/admin/dashboard?tab=trust-safety", icon: <ShieldAlert className="w-4 h-4" /> },
          { label: "Leads", href: "/admin/dashboard?tab=lead-management", icon: <Clipboard className="w-4 h-4" /> },
        ];
      case "PATIENT":
      default:
        return [
          { label: "Find Doctors", href: "/doctors", icon: <Stethoscope className="w-4.5 h-4.5" /> },
          { label: "Emergency Care", href: "/doctors?emergency=true", icon: <AlertTriangle className="w-4.5 h-4.5" />, highlight: true },
        ];
    }
  };

  const navLinks = getNavLinks();

  // Mobile menu links mapping (always contains Find Doctors and Articles when logged out)
  const getMobileNavLinks = () => {
    if (!isLoggedIn) {
      return [
        { label: "Find Doctors", href: "/doctors", icon: <Stethoscope className="w-4.5 h-4.5" /> },
        { label: "Articles", href: "/blog", icon: <Newspaper className="w-4.5 h-4.5" /> },
      ];
    }
    return navLinks;
  };

  const mobileNavLinks = getMobileNavLinks();

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-[100] w-full transition-all duration-300 bg-white/95 backdrop-blur-md border-b",
          "h-16 md:h-20",
          scrolled ? "shadow-sm border-slate-200" : "border-slate-100"
        )}
      >
        <div className="container mx-auto px-4 md:px-6 h-full flex items-center justify-between gap-3 max-w-7xl w-full box-border">

          {/* ── MOBILE EXPANDED SEARCH VIEW ── */}
          {isMobileSearchExpanded && isDoctorsPage ? (
            <div className="flex lg:hidden items-center w-full gap-2 animate-in fade-in slide-in-from-right-4 duration-200">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileSearchExpanded(false)}
                className="w-10 h-10 shrink-0 text-slate-500 rounded-full hover:bg-slate-100"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex-1 min-w-0">
                <SmartSearchBar compact district={district || ""} autoFocus className="w-full" />
              </div>
            </div>
          ) : (
            <>
              {/* ── LEFT SIDE: Hamburger & Logo (Normal View) ── */}
              <div className="flex items-center gap-2 md:gap-4 shrink-0">
                {/* Mobile Hamburger */}
                <div className="flex lg:hidden items-center shrink-0">
                  <Button
                    aria-label="Toggle navigation menu"
                    variant="ghost"
                    size="icon"
                    className="rounded-xl w-11 h-11 text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-100 transition-all duration-300 active:scale-95 animate-fade-in"
                    onClick={() => setMobileOpen((v) => !v)}
                  >
                    {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </Button>
                </div>

                {/* Logo and Brand Title (Always visible unless search is expanded on mobile) */}
                <div className="flex items-center shrink-0 transition-all">
                  <Link href="/" className="flex items-center gap-2.5 md:gap-3.5 group shrink min-w-0">
                    <Logo className="h-11 w-11 md:h-14 md:w-14 shrink-0 transition-transform duration-300 group-hover:scale-[1.02]" />
                    <div className="flex flex-col -space-y-0.5 md:-space-y-1 pt-0.5">
                       <span className="text-[20px] md:text-2xl font-bold tracking-tight leading-none">
                          <span style={{ color: '#4A90D9' }}>Jivni</span><span style={{ color: '#4A8C4A' }}>Care</span>
                       </span>
                       <span className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-[0.25em] pl-0.5 mt-0.5">Bihar</span>
                    </div>
                  </Link>
                </div>
              </div>

              {/* ── DESKTOP NAV ───────────────────── */}
              {navLinks.length > 0 && (
                <div className="hidden lg:flex flex-1 min-w-0 justify-center">
                  <nav className="flex items-center gap-1 xl:gap-2 bg-slate-50/60 p-1 rounded-full border border-slate-100/80 overflow-x-auto scrollbar-hide max-w-full">
                    {navLinks.map((link) => {
                      const isActive = pathname === link.href || (pathname.startsWith('/doctors') && link.href === '/doctors');
                      return (
                        <Link
                          key={link.label}
                          href={link.href}
                          className={cn(
                            "px-4 xl:px-5 py-2 xl:py-2.5 text-[12px] xl:text-[13px] font-bold rounded-full transition-all duration-200 active:scale-[0.98] flex items-center gap-1.5 whitespace-nowrap shrink-0",
                            link.highlight
                              ? "text-rose-600 bg-rose-50 hover:bg-rose-100/80 border border-rose-100 animate-pulse shadow-sm"
                              : isActive 
                              ? "text-[#205E98] bg-white shadow-sm ring-1 ring-slate-100" 
                              : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/50"
                          )}
                        >
                          <span className={cn("shrink-0", link.highlight ? "text-rose-500 animate-pulse" : isActive ? "text-[#205E98]" : "text-slate-500")}>
                            {link.icon}
                          </span>
                          {link.label}
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              )}

              {/* ── SEARCH (Contextual - Desktop Only) ── */}
              {isDoctorsPage && pathname !== "/" && (
                <div className="hidden lg:flex flex-1 max-w-md mx-2 md:mx-4 lg:mx-8 min-w-0">
                  <SmartSearchBar compact district={district || ""} className="w-full shadow-sm animate-fade-in" />
                </div>
              )}

              {/* ── ACTIONS (Desktop & Mobile Right) ───────────────── */}
              <div className="flex items-center justify-end gap-2 lg:gap-3 xl:gap-4 shrink-0">
                
                {/* Mobile Search Icon Trigger */}
                {isDoctorsPage && pathname !== "/" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden w-11 h-11 rounded-full bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100 active:scale-95 transition-all"
                    onClick={() => setIsMobileSearchExpanded(true)}
                    aria-label="Expand search"
                  >
                    <SearchIcon className="w-5 h-5" />
                  </Button>
                )}
            {isLoggedIn && user?.role === "DOCTOR" && (
              <div className="hidden sm:flex items-center gap-2 shrink-0">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-9 xl:h-10 text-[11px] xl:text-xs px-3 xl:px-4 bg-red-50 hover:bg-red-100 border-red-200 text-red-700 font-bold rounded-xl flex items-center gap-1.5 active:scale-95 shadow-sm whitespace-nowrap shrink-0"
                  onClick={() => alert("OPD emergency state locked. Displaying alert banner to waiting patients.")}
                >
                  <AlertTriangle className="w-3.5 h-3.5 animate-pulse text-red-600 shrink-0" />
                  <span className="hidden md:inline">OPD Emergency Mode</span>
                  <span className="md:hidden">Emergency Mode</span>
                </Button>
              </div>
            )}

            {isLoggedIn ? (
              <>
                {user?.role === "PATIENT" && (
                  <div className="hidden lg:block"><NotificationPanel isLoggedIn={isLoggedIn} /></div>
                )}
                <div className="relative" ref={profileRef}>
                  <button 
                    aria-label="User profile options"
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all active:scale-[0.97] outline-none select-none bg-white shadow-sm shrink-0 min-h-[44px]"
                  >
                    <div className="w-7.5 h-7.5 rounded-full bg-[#205E98]/10 text-[#205E98] font-black text-sm flex items-center justify-center border border-[#205E98]/20">
                      {user?.name ? user.name[0].toUpperCase() : "U"}
                    </div>
                    <span className="text-sm font-bold text-slate-700 hidden sm:block truncate max-w-[90px] xl:max-w-[120px]">
                      {user?.name || "Patient"}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <UserProfileDropdown isOpen={profileOpen} onLogout={handleLogout} />
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <button className="bg-[#205E98] hover:bg-[#1a4c7a] text-white font-bold text-sm md:text-base px-6 py-2.5 md:px-8 md:py-3.5 rounded-full transition-all duration-200 active:scale-[0.97] shadow-sm select-none shrink-0 outline-none">
                    Sign In
                  </button>
                </Link>
              </div>
            )}

            {isLoggedIn && user?.role === "DOCTOR" && (
              <Link href="/doctor/dashboard?tab=queue" className="hidden xl:block shrink-0">
                <Button className="bg-primary hover:bg-primary/90 text-white font-bold rounded-full shadow-md h-9 xl:h-11 px-4 xl:px-5 active:scale-95 flex items-center gap-1.5 whitespace-nowrap">
                  <Activity className="w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0" /> OPD Queue
                </Button>
              </Link>
            )}
            
            {isLoggedIn && user?.role === "ADMIN" && (
              <Link href="/admin/dashboard?tab=trust-safety" className="hidden xl:block shrink-0">
                <Button className="bg-slate-700 hover:bg-slate-800 text-white font-bold rounded-full shadow-md h-9 xl:h-11 px-4 xl:px-5 active:scale-95 flex items-center gap-1.5 whitespace-nowrap">
                  <ShieldAlert className="w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0" /> Moderation Log
                </Button>
              </Link>
            )}
          </div>
          </>
          )}
        </div>
      </header>

      <MobileNav
        isOpen={mobileOpen}
        setIsOpen={setMobileOpen}
        isLoggedIn={isLoggedIn}
        pathname={pathname}
        navLinks={mobileNavLinks}
        onLogout={handleLogout}
      />
    </>
  );
}



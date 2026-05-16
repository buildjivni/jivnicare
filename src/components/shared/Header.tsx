"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, CalendarDays, Stethoscope, BookOpen, User, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";

import { Logo } from "@/components/brand/Logo";
import { MobileNav } from "./MobileNav";
import { UserProfileDropdown } from "./UserProfileDropdown";
import { useAuthStore } from "@/store/useAuthStore";
import { NotificationBell } from "./NotificationBell";
import { SmartSearchBar } from "./SmartSearchBar";
import { cn } from "@/lib/utils";
import { ShieldCheck } from "lucide-react";

const NAV_LINKS = [
  { label: "Find Doctors", href: "/doctors", icon: <Stethoscope className="w-4 h-4" /> },
  { label: "Articles", href: "/blog", icon: <Newspaper className="w-4 h-4" /> },
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
          "sticky top-0 z-[100] w-full transition-all duration-300",
          scrolled
            ? "bg-white/90 backdrop-blur-xl border-b border-border shadow-soft h-16 md:h-16"
            : "bg-white/0 backdrop-blur-none border-b border-transparent h-16 md:h-20"
        )}
      >
        <div className="container mx-auto px-4 md:px-6 h-full flex items-center justify-between gap-3 max-w-7xl w-full box-border">

          {/* ── MOBILE LEFT: Hamburger ── */}
          <div className="flex lg:hidden items-center shrink-0">
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

          {/* ── LOGO (Center on Mobile, Left on Desktop) ── */}
          <div className={cn(
            "flex items-center justify-center lg:justify-start shrink-0 transition-all",
            isDoctorsPage && pathname !== "/" ? "hidden lg:flex" : "flex-1 lg:flex-none"
          )}>
            <Link href="/" className="flex items-center gap-2 group shrink min-w-0">
              <Logo className="h-9 md:h-11 w-auto shrink-0 transition-transform duration-300 group-hover:scale-[1.02]" />
            </Link>
          </div>

          {/* ── DESKTOP NAV ───────────────────── */}
          <nav className="hidden lg:flex items-center gap-1 bg-muted/30 p-1 rounded-2xl border border-border/50">
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
                    "px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 active:scale-[0.98]",
                    isActive 
                      ? "text-primary bg-card shadow-sm ring-1 ring-border" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* ── SEARCH (Contextual) ── */}
          {isDoctorsPage && pathname !== "/" && (
            <div className="flex flex-1 max-w-md mx-2 md:mx-4 lg:mx-8 min-w-0">
              <SmartSearchBar compact district="Patna" className="w-full shadow-sm" />
            </div>
          )}

          {/* ── ACTIONS (Desktop & Mobile Right) ───────────────── */}
          <div className="flex items-center justify-end gap-2 lg:gap-4 shrink-0">
            {isLoggedIn ? (
              <>
                <div className="hidden lg:block"><NotificationBell token={token} /></div>
                <div className="relative" ref={profileRef}>
                  <button 
                    aria-label="User profile options"
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/5 border border-primary/10 text-primary hover:bg-primary/10 transition-all active:scale-[0.98]"
                  >
                    <User className="w-5 h-5" />
                  </button>
                  <UserProfileDropdown isOpen={profileOpen} onLogout={handleLogout} />
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" className="hidden lg:flex font-bold text-slate-600 hover:text-primary transition-colors">
                    Sign In
                  </Button>
                  <Button size="sm" className="flex lg:hidden bg-primary text-white font-bold rounded-xl shadow-md">
                    Sign In
                  </Button>
                </Link>
              </div>
            )}

            <Link href="/doctors" className="hidden lg:block">
              <Button className="bg-secondary hover:bg-secondary/90 text-white font-bold rounded-xl shadow-md">
                Book Appointment
              </Button>
            </Link>
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

import Link from "next/link";
import { MapPin, Phone, Mail, ShieldCheck, Clock, Heart, Lock, Activity } from "lucide-react";
import { HEALTHCARE_SPECIALTIES } from "@/lib/seo/metadata";
import { Logo } from "@/features/marketing/components/brand/Logo";

const FOOTER_SECTIONS = [
  {
    title: "For Patients",
    links: [
      { label: "Find a Doctor", href: "/doctors" },
      { label: "Partner Clinics", href: "/doctors" },
      { label: "Browse Locations", href: "/districts" },
      { label: "Health Articles", href: "/blog" },
      { label: "How It Works", href: "/#how-it-works" },
    ],
  },
  {
    title: "Doctors & Clinics",
    links: [
      { label: "Join JivniCare Network", href: "/partners", accent: true },
      { label: "Clinic Partnership", href: "/partners" },
      { label: "Provider Dashboard", href: "/partners/login" },
      { label: "Partner Support", href: "mailto:partners@jivnicare.com" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About JivniCare", href: "/about" },
      { label: "Our Mission", href: "/about#mission" },
      { label: "Digital OPD Vision", href: "/about#vision" },
      { label: "Careers", href: "/about#careers" },
      { label: "Contact Us", href: "#contact" },
    ],
  },
  {
    title: "Legal & Support",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Data Protection", href: "/privacy" },
      { label: "Security", href: "/security" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-white text-slate-600 border-t border-slate-100 relative overflow-hidden">
      
      {/* ── TRUST & CONVERSION STRIP ── */}
      <div className="bg-slate-50 border-b border-slate-100 py-10 md:py-14">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex flex-col items-center lg:items-start gap-4 text-center lg:text-left">
              <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
                Are you a clinic? Digitize your OPD today.
              </h2>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 md:gap-6 text-sm font-semibold text-slate-600">
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-600" /> Verified Doctors</span>
                <span className="flex items-center gap-1.5"><Lock className="w-4 h-4 text-emerald-600" /> Secure Booking</span>
                <span className="flex items-center gap-1.5"><Activity className="w-4 h-4 text-emerald-600" /> Real-Time Queue Tracking</span>
                <span className="flex items-center gap-1.5"><Heart className="w-4 h-4 text-emerald-600" /> Privacy First</span>
              </div>
            </div>
            <Link href="/partners/onboard">
              <button className="bg-[#205E98] hover:bg-[#1a4c7a] text-white font-bold text-sm md:text-base px-8 py-3.5 md:py-4 rounded-xl transition-all duration-200 active:scale-95 shadow-md shrink-0">
                Partner With Us
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 max-w-7xl pt-16 md:pt-20 pb-12 relative z-10">

        {/* Top: Brand + Navigation Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-8 mb-14 md:mb-20">

          {/* Brand & Mission */}
          <div className="lg:col-span-4 space-y-6 pr-0 lg:pr-10">
            <Link href="/" className="flex items-center gap-3 group w-fit">
              <div className="bg-white p-2 rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 group-hover:scale-105 transition-transform">
                <Logo className="h-10 w-10 md:h-12 md:w-12" />
              </div>
              <div className="flex flex-col -space-y-1">
                 <Logo variant="wordmark" className="text-xl md:text-2xl font-black tracking-tight leading-none" />
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pl-0.5">OPD Network</span>
              </div>
            </Link>

            <p className="text-slate-500 text-[14px] font-medium leading-relaxed max-w-xs">
              Making quality healthcare simple, safe, and accessible for everyone. Book verified doctors instantly.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="JivniCare on Facebook" className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="JivniCare on X/Twitter" className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-black hover:text-white hover:border-slate-800 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="JivniCare on LinkedIn" className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2] transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>

          {/* Navigation Columns */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            {FOOTER_SECTIONS.map((section) => (
              <div key={section.title} className="col-span-1">
                <h3 className="text-slate-900 font-bold mb-6 text-[13px] uppercase tracking-wider">{section.title}</h3>
                <ul className="space-y-3">
                  {section.links.map((link) => {
                    const isExternal = link.href.startsWith("mailto:") || link.href.startsWith("http");
                    const Tag = isExternal ? "a" : Link;
                    const extraProps = isExternal ? { href: link.href } : { href: link.href };
                    return (
                      <li key={link.label}>
                        <Tag
                          {...extraProps}
                          className={`text-sm hover:translate-x-1 inline-block transition-transform duration-200 ${
                            "accent" in link && link.accent
                              ? "text-emerald-700 font-bold hover:text-emerald-800"
                              : "text-slate-500 hover:text-primary"
                          }`}
                        >
                          {link.label}
                        </Tag>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Mid: Contact */}
        <div className="border-t border-slate-100 pt-10 mb-10">
          <div id="contact" className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm mb-1">Headquarters</h4>
                  <p className="text-sm text-slate-500">Tech Hub, India</p>
                </div>
             </div>
             <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm mb-1">Helpline</h4>
                  <a href="tel:+919876543210" className="text-sm text-slate-500 hover:text-emerald-700 block mb-0.5">+91 98765 43210</a>
                  <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1"><Clock className="w-3 h-3" /> 24/7 Support</p>
                </div>
             </div>
             <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm mb-1">Email Support</h4>
                  <a href="mailto:support@jivnicare.com" className="text-sm text-slate-500 hover:text-rose-600 block">support@jivnicare.com</a>
                </div>
             </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 text-[13px] text-slate-500 text-center md:text-left font-medium">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <p>© {new Date().getFullYear()} JivniCare. All rights reserved.</p>
            <p className="hidden md:block text-slate-300">|</p>
            <p>Made with <Heart className="w-3 h-3 inline text-rose-500 mx-0.5" /> in India.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="/security" className="hover:text-primary transition-colors">Security</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

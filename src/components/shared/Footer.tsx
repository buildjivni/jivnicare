import Link from "next/link";
import { MapPin, Phone, Mail, Clock, Heart } from "lucide-react";
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
      { label: "Refund Policy", href: "/refund-and-cancellation" },
      { label: "Medical Disclaimer", href: "/medical-disclaimer" },
      { label: "Security", href: "/security" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-[#5696C7] text-white/80 border-t border-white/10 relative overflow-hidden">
      
      <div className="container mx-auto px-4 md:px-6 max-w-7xl pt-16 md:pt-20 pb-12 relative z-10">

        {/* Top: Brand + Navigation Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-8 mb-14 md:mb-20">

          {/* Brand & Mission */}
          <div className="lg:col-span-4 space-y-6 pr-0 lg:pr-10">
            <Link href="/" className="flex items-center group w-fit">
              <Logo variant="primary-white" className="h-10 md:h-14 w-auto shrink-0 transition-transform duration-300 group-hover:scale-[1.02]" />
            </Link>

            <p className="text-white/90 text-[14px] font-medium leading-relaxed max-w-xs">
              Making quality healthcare simple, safe, and accessible for everyone. Book verified doctors instantly.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="JivniCare on Facebook" className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-[#1877F2] hover:border-transparent transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="JivniCare on X/Twitter" className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-black hover:border-transparent transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="JivniCare on LinkedIn" className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-[#0A66C2] hover:border-transparent transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" aria-label="JivniCare on Instagram" className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-gradient-to-tr hover:from-[#F58529] hover:via-[#DD2A7B] hover:to-[#8134AF] hover:border-transparent transition-all">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>

          {/* Navigation Columns */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            {FOOTER_SECTIONS.map((section) => (
              <div key={section.title} className="col-span-1">
                <h3 className="text-white font-extrabold mb-6 text-[13px] uppercase tracking-wider">{section.title}</h3>
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
                              ? "text-emerald-300 font-bold hover:text-emerald-200"
                              : "text-white/70 hover:text-white hover:underline"
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
        <div className="border-t border-white/10 pt-10 mb-10">
          <div id="contact" className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm mb-1">Headquarters</h4>
                  <p className="text-sm text-white/80">Tech Hub, India</p>
                </div>
             </div>
             <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm mb-1">Helpline</h4>
                  <a href="tel:8235351897" className="text-sm text-white/80 hover:text-white hover:underline block mb-0.5">+91 82353 51897</a>
                  <p className="text-xs text-white/60 font-semibold flex items-center gap-1"><Clock className="w-3 h-3" /> 24/7 Support</p>
                </div>
             </div>
             <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm mb-1">Email Support</h4>
                  <a href="mailto:support@jivnicare.com" className="text-sm text-white/80 hover:text-white hover:underline block">support@jivnicare.com</a>
                </div>
             </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 text-[13px] text-white/60 text-center md:text-left font-medium">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <p>© {new Date().getFullYear()} JivniCare. All rights reserved.</p>
            <p className="hidden md:block text-white/20">|</p>
            <p>Made with <Heart className="w-3 h-3 inline text-rose-500 mx-0.5 fill-rose-500 animate-pulse" /> in India.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors hover:underline">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors hover:underline">Terms</Link>
            <Link href="/refund-and-cancellation" className="hover:text-white transition-colors hover:underline">Refund Policy</Link>
            <Link href="/medical-disclaimer" className="hover:text-white transition-colors hover:underline">Disclaimer</Link>
            <Link href="/security" className="hover:text-white transition-colors hover:underline">Security</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

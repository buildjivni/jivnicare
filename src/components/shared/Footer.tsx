import Link from "next/link";
import { MapPin, Phone, Mail, ShieldCheck, Clock, Heart, Newspaper, Users, Briefcase } from "lucide-react";
import { HEALTHCARE_SPECIALTIES } from "@/lib/seo/metadata";
import { Logo } from "@/features/marketing/components/brand/Logo";

const FOOTER_SECTIONS = [
  {
    title: "For Patients",
    links: [
      { label: "Find a Doctor", href: "/doctors" },
      { label: "Top Clinics in Patna", href: "/doctors" },
      { label: "Browse by District", href: "/districts" },
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
    title: "Legal & Trust",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Security Overview", href: "/security" },
      { label: "Data Protection", href: "/privacy" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-white text-slate-600 pt-16 md:pt-24 pb-12 border-t border-slate-100 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-primary/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10">

        {/* Top: Brand + Navigation Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-8 mb-14 md:mb-20">

          {/* Brand & Mission */}
          <div className="lg:col-span-4 space-y-6 pr-0 lg:pr-10">
            <Link href="/" className="flex items-center gap-3 group w-fit">
              <div className="bg-white px-4 py-2.5 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <Logo className="h-8 w-auto" />
              </div>
              <div className="flex flex-col -space-y-1">
                 <span className="text-xl font-black tracking-tight leading-none text-slate-800">
                    <span className="text-[#205E98]">Jivni</span><span className="text-[#166534]">Care</span>
                 </span>
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] pl-0.5">Bihar</span>
              </div>
            </Link>

            <p className="text-slate-500 text-[13px] font-bold leading-relaxed max-w-xs">
              Making quality healthcare simple, safe, and accessible for everyone in Bihar. Book verified doctors instantly.
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Doctors Only
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
                <Heart className="w-3.5 h-3.5" /> Patient-First
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="JivniCare on Facebook" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] transition-all duration-300">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="JivniCare on X/Twitter" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:bg-black hover:text-white hover:border-slate-700 transition-all duration-300">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="JivniCare on Instagram" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-pink-500 hover:bg-gradient-to-tr hover:from-yellow-500 hover:via-pink-500 hover:to-purple-600 transition-all duration-300">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="JivniCare on LinkedIn" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2] transition-all duration-300">
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
                <h3 className="text-slate-900 font-bold mb-6 text-sm uppercase tracking-wider">{section.title}</h3>
                <ul className="space-y-3">
                  {section.links.map((link) => {
                    const isExternal = link.href.startsWith("mailto:") || link.href.startsWith("http");
                    const Tag = isExternal ? "a" : Link;
                    const extraProps = isExternal ? { href: link.href } : { href: link.href };
                    return (
                      <li key={link.label}>
                        <Tag
                          {...extraProps}
                          className={`text-sm hover:translate-x-1 inline-block transition-all duration-300 ${
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

        {/* Mid: Top Specialties + Contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-14 pt-10 border-t border-slate-100">
          {/* Top Specialties */}
          <div>
            <h3 className="text-slate-900 font-bold mb-6 text-sm uppercase tracking-wider flex items-center gap-2">
              Top Specialties
            </h3>
            <ul className="grid grid-cols-2 gap-y-3 gap-x-4">
              {HEALTHCARE_SPECIALTIES.slice(0, 8).map((spec) => (
                <li key={spec}>
                  <Link
                    href={`/doctors?specialty=${encodeURIComponent(spec)}`}
                    className="text-sm text-slate-500 hover:text-primary hover:translate-x-1 inline-block transition-all duration-300"
                  >
                    {spec}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Card */}
          <div id="contact" className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4 scroll-mt-24">
            <h3 className="text-slate-900 font-bold text-sm uppercase tracking-wider">Get in Touch</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span className="text-sm text-slate-500 leading-relaxed">4th Floor, JivniCare Tech Hub<br />Boring Road, Patna, Bihar 800001</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <a href="tel:+919876543210" className="text-sm text-slate-500 hover:text-primary transition-colors font-medium">+91 98765 43210</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <a href="mailto:support@jivnicare.com" className="text-sm text-slate-500 hover:text-primary transition-colors font-medium">support@jivnicare.com</a>
              </li>
              <li className="flex items-center gap-3 pt-1">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-sm text-emerald-700 font-semibold">24/7 Support Available</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <p>© {new Date().getFullYear()} JivniCare Technologies Pvt. Ltd. All rights reserved.</p>
            <p className="hidden md:block text-slate-700">•</p>
            <p>Made with <Heart className="w-3 h-3 inline text-rose-500 mx-0.5" /> in Bihar, India.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/privacy" className="text-slate-500 hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-slate-500 hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="/about" className="text-slate-500 hover:text-primary transition-colors">About</Link>
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" /> Secure & Verified
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

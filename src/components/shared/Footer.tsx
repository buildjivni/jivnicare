import Link from "next/link";
import { MapPin, Phone, Mail, ShieldCheck, Clock } from "lucide-react";
import { SPECIALTIES } from "@/data/mock-data";
import { Logo } from "@/components/brand/Logo";
import { BrandName } from "@/components/brand/BrandName";

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 md:pt-24 pb-12 border-t border-slate-900 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-[#205E98]/10 blur-[120px] pointer-events-none rounded-full" />
      
      <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 md:gap-12 lg:gap-8 mb-12 md:mb-16">
          
          {/* Brand & Mission */}
          <div className="lg:col-span-4 space-y-6 pr-0 lg:pr-8">
            <Link href="/" className="flex items-center gap-2 group w-fit">
              <Logo className="w-10 h-10 group-hover:scale-105 transition-transform duration-300" />
              <div>
                <BrandName className="text-2xl" />
                <span className="block text-[10px] font-bold tracking-[0.2em] text-[#258C54] uppercase leading-none mt-1">Healthcare • Patna</span>
              </div>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">Connecting you with top-rated doctors for instant, hassle-free healthcare. Because your health shouldn&apos;t wait.</p>
            <div className="flex items-center gap-3 pt-2">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] transition-all duration-300">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:bg-black hover:text-white hover:border-slate-700 transition-all duration-300">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:bg-gradient-to-tr hover:from-yellow-400 hover:via-pink-500 hover:to-purple-500 hover:text-white hover:border-transparent transition-all duration-300">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2] transition-all duration-300">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Patients</h4>
            <ul className="space-y-3">
              <li><Link href="/doctors" className="text-sm hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Find a Doctor</Link></li>
              <li><Link href="#" className="text-sm hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Video Consultation</Link></li>
              <li><Link href="#" className="text-sm hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Top Clinics in Patna</Link></li>
              <li><Link href="#" className="text-sm hover:text-white hover:translate-x-1 inline-block transition-all duration-300">How It Works</Link></li>
              <li><Link href="#" className="text-sm hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Patient Stories</Link></li>
            </ul>
          </div>

          {/* Top Specialties */}
          <div className="lg:col-span-3">
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Top Specialties</h4>
            <ul className="grid grid-cols-2 gap-y-3 gap-x-2">
              {SPECIALTIES.slice(0, 6).map(spec => (
                <li key={spec.id}>
                  <Link href={`/doctors?specialty=${spec.id}`} className="text-sm hover:text-white hover:translate-x-1 inline-block transition-all duration-300">
                    {spec.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="lg:col-span-3 bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#205E98] shrink-0 mt-0.5" />
                <span className="text-sm leading-relaxed">4th Floor, <BrandName /> Tech Hub<br/>Boring Road, Patna, Bihar 800001</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#205E98] shrink-0" />
                <span className="text-sm font-medium">+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#205E98] shrink-0" />
                <span className="text-sm font-medium">support@jivnicare.com</span>
              </li>
              <li className="flex items-center gap-3 pt-2">
                <Clock className="w-5 h-5 text-[#258C54] shrink-0" />
                <span className="text-sm text-[#258C54] font-medium tracking-wide">24/7 Support Available</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-slate-500">
          <p>© {new Date().getFullYear()} <BrandName /> Technologies. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-white transition-colors">Security</Link>
            <div className="flex items-center gap-1.5 text-[#258C54] font-bold bg-[#258C54]/10 px-3 py-1 rounded-full border border-[#258C54]/20">
              <ShieldCheck className="w-4 h-4" /> Secure Platform
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CalendarDays, 
  Settings, 
  LogOut, 
  User, 
  Activity, 
  Clock, 
  ShieldCheck, 
  ShieldAlert, 
  LayoutDashboard, 
  HelpCircle,
  Bell,
  Heart
} from "lucide-react";

import { useAuthStore } from "@/features/auth/store/useAuthStore";

interface UserProfileDropdownProps {
  isOpen: boolean;
  onLogout: () => void;
}

export function UserProfileDropdown({ isOpen, onLogout }: UserProfileDropdownProps) {
  const { user } = useAuthStore();
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="absolute right-0 mt-2 w-[280px] sm:w-64 max-w-[calc(100vw-32px)] bg-white rounded-2xl shadow-[0_12px_40px_rgb(0,0,0,0.12)] border border-slate-100 flex flex-col z-[120] origin-top-right max-h-[calc(100vh-90px)]"
          style={{ marginRight: 'max(0px, env(safe-area-inset-right))' }}
        >
          <div className="p-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
            <p className="text-sm font-bold text-slate-900 truncate">{user?.name ?? "User"}</p>
            <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{user?.role ?? "PATIENT"}</p>
            <p className="text-[12px] text-slate-500 font-medium truncate mt-0.5">{user?.phone || user?.email || "No contact info"}</p>
          </div>
          
          <div className="p-2 space-y-0.5 overflow-y-auto overscroll-contain pb-safe">
            {user?.role === "DOCTOR" ? (
              <>
                <Link href="/doctor/dashboard?tab=queue" className="flex items-center gap-3 px-3 py-2.5 text-[14px] font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#5298D2] rounded-xl transition-all active:scale-[0.97] outline-none min-h-[44px]">
                  <Activity className="w-4.5 h-4.5 text-[#5298D2]" /> Live Queue Controls
                </Link>
                <Link href="/doctor/dashboard?tab=profile" className="flex items-center gap-3 px-3 py-2.5 text-[14px] font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#5298D2] rounded-xl transition-all active:scale-[0.97] outline-none min-h-[44px]">
                  <Clock className="w-4.5 h-4.5 text-emerald-600" /> Availability & Timings
                </Link>
                <Link href="/doctor/dashboard?tab=settings" className="flex items-center gap-3 px-3 py-2.5 text-[14px] font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#5298D2] rounded-xl transition-all active:scale-[0.97] outline-none min-h-[44px]">
                  <Settings className="w-4.5 h-4.5 text-slate-400" /> Profile Settings
                </Link>
              </>
            ) : user?.role === "ADMIN" ? (
              <>
                <Link href="/admin/dashboard?tab=doctor-management" className="flex items-center gap-3 px-3 py-2.5 text-[14px] font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all active:scale-[0.97] outline-none min-h-[44px]">
                  <ShieldCheck className="w-4.5 h-4.5 text-[#5298D2]" /> Verification Queue
                </Link>
                <Link href="/admin/dashboard?tab=trust-safety" className="flex items-center gap-3 px-3 py-2.5 text-[14px] font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all active:scale-[0.97] outline-none min-h-[44px]">
                  <ShieldAlert className="w-4.5 h-4.5 text-amber-500" /> Moderation & Logs
                </Link>
                <Link href="/admin/dashboard?tab=dashboard" className="flex items-center gap-3 px-3 py-2.5 text-[14px] font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all active:scale-[0.97] outline-none min-h-[44px]">
                  <LayoutDashboard className="w-4.5 h-4.5 text-slate-400" /> Operational Overview
                </Link>
              </>
            ) : (
              <>
                <Link href="/my-bookings" className="flex items-center gap-3 px-3 py-2.5 text-[14px] font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#5298D2] rounded-xl transition-all active:scale-[0.97] outline-none min-h-[44px]">
                  <CalendarDays className="w-4.5 h-4.5 text-[#5298D2]" /> My Appointments
                </Link>
                <Link href="/my-bookings" className="flex items-center gap-3 px-3 py-2.5 text-[14px] font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#5298D2] rounded-xl transition-all active:scale-[0.97] outline-none min-h-[44px]">
                  <Activity className="w-4.5 h-4.5 text-emerald-600" /> Queue Tracking
                </Link>

                <Link href="/about" className="flex items-center gap-3 px-3 py-2.5 text-[14px] font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#5298D2] rounded-xl transition-all active:scale-[0.97] outline-none min-h-[44px]">
                  <HelpCircle className="w-4.5 h-4.5 text-slate-400" /> Help & Support
                </Link>
              </>
            )}
          </div>
          
          <div className="p-2 border-t border-slate-100 bg-slate-50/50 shrink-0 mb-safe">
            <button 
              onClick={onLogout}
              className="flex w-full items-center gap-3 px-3 py-2.5 text-[14px] font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-xl transition-all active:scale-[0.97] outline-none min-h-[44px]"
            >
              <LogOut className="w-4.5 h-4.5" /> Log Out
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}



"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, HeartPulse, Settings, LogOut } from "lucide-react";

import { useAuthStore } from "@/store/useAuthStore";

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
          className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 overflow-hidden"
        >
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <p className="text-sm font-bold text-slate-900">{user?.name ?? "Patient"}</p>
            <p className="text-xs text-slate-500">{user?.phone ?? "No phone"}</p>
          </div>
          <div className="p-2 space-y-1">
            {user?.role === "DOCTOR" ? (
              <Link href="/doctor/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm font-black text-primary hover:bg-slate-100 rounded-lg transition-colors">
                <CalendarDays className="w-4 h-4" /> Doctor Dashboard
              </Link>
            ) : user?.role === "ADMIN" ? (
              <Link href="/admin/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm font-black text-primary hover:bg-slate-100 rounded-lg transition-colors">
                <Settings className="w-4 h-4" /> Admin Panel
              </Link>
            ) : (
              <>
                <Link href="/my-bookings" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                  <CalendarDays className="w-4 h-4 text-slate-400" /> My Bookings
                </Link>
                <Link href="/my-bookings" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                  <HeartPulse className="w-4 h-4 text-slate-400" /> Live Queue
                </Link>
              </>
            )}
            <Link href="/settings" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
              <Settings className="w-4 h-4 text-slate-400" /> Settings
            </Link>
          </div>
          <div className="p-2 border-t border-slate-100">
            <button 
              onClick={onLogout}
              className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" /> Log Out
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

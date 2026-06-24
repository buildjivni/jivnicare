"use client";

import { useState, useEffect } from "react";
import { DoctorCard } from "@/components/shared/DoctorCard";
import { Button } from "@/components/ui/button";
import type { Doctor } from "@/types";
import { Stethoscope, SearchX, MapPin, RefreshCcw } from "lucide-react";
import { motion } from "framer-motion";
import { getStableKey } from "@/lib/getStableKey";
import { useSearchParams } from "next/navigation";
import { ComingSoonLeadForm } from "@/components/shared/ComingSoonLeadForm";

interface DoctorListProps {
  doctors: Doctor[];
  onClearFilters: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
}

export function DoctorList({ doctors, onClearFilters, hasMore, isLoadingMore, onLoadMore }: DoctorListProps) {
  const searchParams = useSearchParams();

  return (
    <div className="flex-1 w-full min-w-0">
      {/* ── Empty State ────────────────────────────────────────────────────────── */}
      {doctors.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-blue-900/5 px-6">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 relative">
            <SearchX className="w-10 h-10 text-slate-400" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center border-4 border-white">
              <span className="text-[10px] text-white font-black">!</span>
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">No matching doctors found</h3>
          <p className="text-sm text-slate-500 font-bold max-w-sm mx-auto mb-8 leading-relaxed">
            Aapke current filters ya search query ke anusar koi doctor nahi mila. Kripya naye location ya filters search karein.
          </p>
          <Button
            onClick={onClearFilters}
            className="h-14 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-lg shadow-xl shadow-blue-900/20 flex items-center gap-2 mx-auto"
          >
            <RefreshCcw className="w-5 h-5" />
            Reset All Filters
          </Button>

          <div className="mt-8">
            <ComingSoonLeadForm defaultCity={searchParams.get("district") || ""} source="search-zero-results" />
          </div>
        </div>
      ) : (
        /* ── Results Grid ────────────────────────────────────────────────────── */
        <div className="flex flex-col">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pb-8">
              {doctors.map((doctor, idx) => (
                <motion.div 
                  key={getStableKey(doctor, idx)}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18, delay: Math.min(idx * 0.04, 0.25) }}
                >
                  <DoctorCard doctor={doctor} priority={idx < 4} />
                </motion.div>
              ))}
          </div>
          
          {/* Load More Pagination */}
          {hasMore && (
            <div className="flex justify-center pb-24 md:pb-12">
              <Button
                onClick={onLoadMore}
                disabled={isLoadingMore}
                variant="outline"
                className="h-12 px-8 rounded-full border-2 border-primary/20 text-primary font-bold hover:bg-primary/5 transition-all shadow-sm"
              >
                {isLoadingMore ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
                    Loading...
                  </div>
                ) : (
                  "Load More Doctors"
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

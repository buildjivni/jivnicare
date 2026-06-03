"use client";

import { motion } from "framer-motion";
import { Clock, Users, ArrowRight, Activity, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function ProductDemosSection() {
  return (
    <section className="py-20 bg-slate-50 relative overflow-hidden" aria-label="Product Demos">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-50/50 rounded-l-[100px] -z-10" />
      
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
            See JivniCare in Action
          </h2>
          <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">
            Experience the actual product interfaces used by thousands of patients and clinics every day.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Live Queue Demo */}
          <div className="order-2 md:order-1">
            <h3 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-2">
              <Activity className="w-6 h-6 text-primary" />
              Live Queue Tracking
            </h3>
            <p className="text-slate-600 font-medium mb-8">
              No more waiting in crowded clinic rooms. Track your exact token status in real-time from your phone.
            </p>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3 text-slate-700 font-medium">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Real-time token updates
              </li>
              <li className="flex items-center gap-3 text-slate-700 font-medium">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Estimated wait time calculation
              </li>
              <li className="flex items-center gap-3 text-slate-700 font-medium">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Arrival notifications
              </li>
            </ul>
          </div>

          <div className="order-1 md:order-2">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-[2rem] shadow-2xl shadow-blue-900/10 border border-slate-100 max-w-sm mx-auto transform rotate-2 hover:rotate-0 transition-transform duration-500"
            >
              {/* Fake iPhone notch */}
              <div className="w-32 h-6 bg-slate-100 rounded-b-xl mx-auto mb-6 absolute top-0 left-1/2 -translate-x-1/2" />
              
              <div className="pt-8 text-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Live Queue</p>
                <h4 className="text-xl font-black text-slate-900 mb-6">Dr. Sharma Clinic</h4>
                
                <div className="w-32 h-32 rounded-full border-8 border-primary flex items-center justify-center mx-auto mb-6 bg-blue-50 relative">
                  <div className="absolute inset-0 rounded-full border-[10px] border-primary/20 animate-pulse" />
                  <div className="text-center">
                    <span className="block text-4xl font-black text-primary">14</span>
                    <span className="text-xs font-bold text-slate-500 uppercase">Your Token</span>
                  </div>
                </div>

                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl mb-6">
                  <div className="text-center">
                    <p className="text-xs font-bold text-slate-400 uppercase">Current</p>
                    <p className="text-lg font-black text-slate-900">11</p>
                  </div>
                  <div className="w-px h-8 bg-slate-200" />
                  <div className="text-center">
                    <p className="text-xs font-bold text-slate-400 uppercase">Est. Wait</p>
                    <p className="text-lg font-black text-slate-900">45m</p>
                  </div>
                </div>

                <button className="w-full py-4 rounded-xl bg-slate-100 text-slate-400 font-bold cursor-not-allowed">
                  Cancel Booking
                </button>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}

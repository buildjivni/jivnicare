"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { User, Calendar, Clock, Heart, ChevronRight, Activity, CalendarCheck, HelpCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCanonicalImageUrl } from "@/lib/utils/image-utils";
import { displayName } from "@/lib/utils/data-utils";
import Image from "next/image";

interface PatientDashboardProps {
  user: any;
  upcomingTokens: any[];
  pastTokens: any[];
  savedDoctors: any[];
}

export function PatientDashboard({ user, upcomingTokens, pastTokens, savedDoctors }: PatientDashboardProps) {
  const [activeTab, setActiveTab] = useState<"appointments" | "saved">("appointments");

  const getStatusColor = (status: string) => {
    switch(status) {
      case "WAITING": return "bg-amber-100 text-amber-800 border-amber-200";
      case "IN_CONSULTATION": return "bg-blue-100 text-blue-800 border-blue-200";
      case "COMPLETED": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "CANCELLED": return "bg-red-100 text-red-800 border-red-200";
      case "NO_SHOW": return "bg-slate-100 text-slate-800 border-slate-200";
      default: return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case "WAITING": return "Waiting";
      case "IN_CONSULTATION": return "In Consultation";
      case "COMPLETED": return "Completed";
      case "CANCELLED": return "Cancelled";
      case "NO_SHOW": return "No Show";
      default: return status;
    }
  };

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8 md:py-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Welcome, {user.name || "Patient"}</h1>
          <p className="text-slate-500 font-medium mt-1">Manage your appointments and saved doctors.</p>
        </div>
        <Link href="/doctors">
          <Button className="rounded-xl font-bold px-6 shadow-sm shadow-primary/20 bg-primary hover:bg-primary/90 text-white flex items-center gap-2">
            <CalendarCheck className="w-4 h-4" />
            Book New Appointment
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setActiveTab("appointments")}
          className={`px-4 py-2 text-sm font-bold rounded-t-xl transition-all border-b-2 ${
            activeTab === "appointments" ? "text-primary border-primary bg-primary/5" : "text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50"
          }`}
        >
          My Appointments
        </button>
        <button
          onClick={() => setActiveTab("saved")}
          className={`px-4 py-2 text-sm font-bold rounded-t-xl transition-all border-b-2 ${
            activeTab === "saved" ? "text-primary border-primary bg-primary/5" : "text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50"
          }`}
        >
          Saved Doctors
        </button>
      </div>

      {activeTab === "appointments" && (
        <div className="grid md:grid-cols-[1fr_300px] gap-8">
          <div className="space-y-8">
            {/* Upcoming Appointments */}
            <div>
              <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Active Queue & Upcoming
              </h2>
              {upcomingTokens.length > 0 ? (
                <div className="space-y-4">
                  {upcomingTokens.map(token => (
                    <Card key={token.id} className="rounded-2xl border-primary/20 shadow-premium overflow-hidden bg-gradient-to-r from-blue-50/50 to-white">
                      <CardContent className="p-0">
                        <div className="p-5 flex flex-col md:flex-row gap-5 items-start md:items-center">
                          <div className="w-16 h-16 rounded-xl bg-slate-100 shrink-0 border border-slate-200 overflow-hidden relative">
                            {token.queue.doctor.image ? (
                              <Image src={getCanonicalImageUrl(token.queue.doctor.image, token.queue.doctor.updatedAt) || ""} alt="Doctor" fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-primary font-bold text-xl">{token.queue.doctor.name.charAt(0)}</div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <Badge variant="outline" className={`mb-2 font-bold ${getStatusColor(token.status)}`}>
                              {getStatusLabel(token.status)}
                            </Badge>
                            <h3 className="font-bold text-lg text-slate-900">{displayName(token.queue.doctor.name)}</h3>
                            <p className="text-sm font-medium text-slate-600 truncate">{token.queue.doctor.specialty} • {token.queue.doctor.clinicName}</p>
                            <div className="mt-2 flex items-center gap-4 text-xs font-bold text-slate-500">
                              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {format(new Date(token.queue.date), 'MMM d, yyyy')}</span>
                              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Token: {token.tokenNumber}</span>
                            </div>
                          </div>
                          <div className="w-full md:w-auto">
                            <Link href={`/patient/queue/${token.id}`}>
                              <Button variant="outline" className="w-full rounded-xl font-bold border-primary text-primary hover:bg-primary/5">
                                Live Tracking
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="rounded-2xl border-dashed border-slate-200 bg-slate-50/50 shadow-none">
                  <CardContent className="p-8 text-center flex flex-col items-center justify-center">
                    <Calendar className="w-10 h-10 text-slate-300 mb-3" />
                    <h3 className="text-base font-bold text-slate-700">No active appointments</h3>
                    <p className="text-sm text-slate-500 mt-1">You don't have any upcoming clinic visits.</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Past Appointments */}
            <div>
              <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-400" />
                History
              </h2>
              {pastTokens.length > 0 ? (
                <div className="space-y-3">
                  {pastTokens.map(token => (
                    <div key={token.id} className="bg-white rounded-xl border border-slate-100 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-soft transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                          <User className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">{displayName(token.queue.doctor.name)}</h4>
                          <p className="text-xs text-slate-500 font-medium">{format(new Date(token.queue.date), 'MMM d, yyyy')}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={`font-bold self-start sm:self-auto ${getStatusColor(token.status)}`}>
                        {getStatusLabel(token.status)}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm font-medium text-slate-500 bg-white p-4 rounded-xl border border-slate-100">No past appointments found.</p>
              )}
            </div>
          </div>

          {/* Quick Actions Sidebar */}
          <div className="space-y-6">
            <Card className="rounded-2xl border-slate-100 shadow-sm overflow-hidden">
              <div className="bg-slate-900 p-4 text-white">
                <h3 className="font-bold flex items-center gap-2"><HelpCircle className="w-4 h-4" /> Need Help?</h3>
              </div>
              <CardContent className="p-4 space-y-4">
                <p className="text-sm text-slate-600 font-medium">Having trouble with your appointment? Contact our support team.</p>
                <Button variant="outline" className="w-full rounded-xl font-bold">Contact Support</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "saved" && (
        <div>
          <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            Saved Doctors
          </h2>
          {savedDoctors.length > 0 ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {savedDoctors.map(sd => (
                <Card key={sd.id} className="rounded-2xl border-slate-100 shadow-sm hover:shadow-md transition-all group">
                  <CardContent className="p-5 flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 shrink-0 overflow-hidden relative">
                      {sd.doctor.image ? (
                        <Image src={getCanonicalImageUrl(sd.doctor.image, sd.doctor.updatedAt) || ""} alt={sd.doctor.name} fill className="object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-primary font-bold text-xl">{sd.doctor.name.charAt(0)}</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm text-slate-900 truncate group-hover:text-primary transition-colors">{displayName(sd.doctor.name)}</h3>
                      <p className="text-xs text-slate-500 font-medium truncate">{sd.doctor.specialty}</p>
                      <Link href={`/doctors/${sd.doctor.slug || sd.doctor.id}`} className="inline-block mt-2">
                        <span className="text-xs font-bold text-primary flex items-center hover:underline">View Profile <ChevronRight className="w-3 h-3" /></span>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="rounded-2xl border-dashed border-slate-200 bg-slate-50/50 shadow-none">
              <CardContent className="p-8 text-center flex flex-col items-center justify-center">
                <Heart className="w-10 h-10 text-slate-300 mb-3" />
                <h3 className="text-base font-bold text-slate-700">No saved doctors</h3>
                <p className="text-sm text-slate-500 mt-1">You haven't saved any doctors to your favorites yet.</p>
                <Link href="/doctors">
                  <Button variant="outline" className="mt-4 rounded-xl font-bold">Browse Doctors</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

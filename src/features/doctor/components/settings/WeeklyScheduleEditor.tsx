"use client";

import { useState } from "react";
import { Clock, Calendar, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/utils";

const DAYS = [
  { id: "monday", label: "Monday" },
  { id: "tuesday", label: "Tuesday" },
  { id: "wednesday", label: "Wednesday" },
  { id: "thursday", label: "Thursday" },
  { id: "friday", label: "Friday" },
  { id: "saturday", label: "Saturday" },
  { id: "sunday", label: "Sunday" },
];

interface DaySchedule {
  isOpen: boolean;
  start: string;
  end: string;
}

interface WeeklySchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

interface WeeklyScheduleEditorProps {
  initialSchedule?: WeeklySchedule;
  onSave: (schedule: WeeklySchedule) => Promise<void>;
  isSaving?: boolean;
}

const DEFAULT_SCHEDULE: WeeklySchedule = {
  monday: { isOpen: true, start: "09:00", end: "17:00" },
  tuesday: { isOpen: true, start: "09:00", end: "17:00" },
  wednesday: { isOpen: true, start: "09:00", end: "17:00" },
  thursday: { isOpen: true, start: "09:00", end: "17:00" },
  friday: { isOpen: true, start: "09:00", end: "17:00" },
  saturday: { isOpen: false, start: "09:00", end: "17:00" },
  sunday: { isOpen: false, start: "09:00", end: "17:00" },
};

export function WeeklyScheduleEditor({ initialSchedule, onSave, isSaving }: WeeklyScheduleEditorProps) {
  const [schedule, setSchedule] = useState<WeeklySchedule>(initialSchedule || DEFAULT_SCHEDULE);

  const toggleDay = (dayId: string) => {
    setSchedule(prev => ({
      ...prev,
      [dayId]: { ...prev[dayId as keyof WeeklySchedule], isOpen: !prev[dayId as keyof WeeklySchedule].isOpen }
    }));
  };

  const updateTime = (dayId: string, type: 'start' | 'end', value: string) => {
    setSchedule(prev => ({
      ...prev,
      [dayId]: { ...prev[dayId as keyof WeeklySchedule], [type]: value }
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Weekly Operating Hours</h3>
          <p className="text-sm text-slate-500">Set your clinic's regular opening and closing times.</p>
        </div>
        <Button 
          onClick={() => onSave(schedule)} 
          disabled={isSaving}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl px-6 h-12 shadow-sm transition-all"
        >
          {isSaving ? "Saving..." : "Save Schedule"}
        </Button>
      </div>

      <div className="grid gap-3">
        {DAYS.map((day) => {
          const daySched = schedule[day.id as keyof WeeklySchedule];
          return (
            <div 
              key={day.id}
              className={cn(
                "group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border-2 transition-all",
                daySched.isOpen 
                  ? "bg-card border-border shadow-soft" 
                  : "bg-slate-50/50 border-dashed border-border opacity-70"
              )}
            >
              <div className="flex items-center gap-4 mb-3 sm:mb-0">
                <button
                  onClick={() => toggleDay(day.id)}
                  aria-label={`Toggle ${day.label}`}
                  className={cn(
                    "w-12 h-6 rounded-full relative transition-colors duration-200 focus:outline-none",
                    daySched.isOpen ? "bg-emerald-500" : "bg-slate-300"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 shadow-sm",
                    daySched.isOpen ? "translate-x-7" : "translate-x-1"
                  )} />
                </button>
                <div>
                  <p className="font-bold text-slate-900">{day.label}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {daySched.isOpen ? "Accepting Patients" : "Clinic Closed"}
                  </p>
                </div>
              </div>

              {daySched.isOpen ? (
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input 
                      type="time" 
                      aria-label={`${day.label} opening time`}
                      value={daySched.start}
                      onChange={(e) => updateTime(day.id, 'start', e.target.value)}
                      className="pl-9 pr-3 py-2 h-10 rounded-xl border border-input bg-background shadow-sm font-bold text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  <span className="text-slate-400 font-bold">to</span>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input 
                      type="time" 
                      aria-label={`${day.label} closing time`}
                      value={daySched.end}
                      onChange={(e) => updateTime(day.id, 'end', e.target.value)}
                      className="pl-9 pr-3 py-2 h-10 rounded-xl border border-input bg-background shadow-sm font-bold text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>
              ) : (
                <div className="h-10 flex items-center">
                  <p className="text-sm font-bold text-slate-400 italic">No slots available</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

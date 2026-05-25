"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  mapDoctorWorkspace,
  type DoctorProfileView,
  type DoctorSettingsView,
  type DoctorWorkspaceView,
} from "@/lib/doctor-view";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { parseResponseJson } from "@/lib/utils/safe-json";

const EMPTY_PROFILE: DoctorProfileView = {
  id: "",
  name: "",
  bio: "",
  regNumber: "",
  specialty: "",
  experience: "0",
  qualifications: "",
  hospitalName: "",
  address: "",
  city: "",
  district: "",
  locality: "",
  pincode: "",
  phone: "",
  consultationFee: "0",
  profileImage: "",
  clinicImage: "",
  verificationStatus: "DRAFT",
  profileCompleteness: 0,
};

const EMPTY_SETTINGS: DoctorSettingsView = {
  fee: "0",
  maxCapacity: "40",
  averageConsultationTime: "15",
  emergencySlots: "0",
  leaveMode: false,
  clinicStatus: "AVAILABLE",
  statusReason: "",
  statusExpiresAt: null,
};

/**
 * Single source of truth for doctor dashboard state — always hydrated from GET /api/doctor/profile.
 */
export function useDoctorWorkspace() {
  const [workspace, setWorkspace] = useState<DoctorWorkspaceView | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  const applyWorkspace = useCallback((next: DoctorWorkspaceView) => {
    setWorkspace(next);
    const { updateUser } = useAuthStore.getState();
    updateUser({
      name: next.profile.name,
      doctorId: next.profile.id,
    });
  }, []);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/doctor/profile?t=" + Date.now(), {
        credentials: "include",
      });

      if (res.status === 401) {
        useAuthStore.getState().logout();
        return null;
      }

      const data = await parseResponseJson<{
        success?: boolean;
        doctor?: Record<string, unknown>;
        completeness?: number;
        error?: string;
      }>(res);
      if (!data) {
        throw new Error("Invalid server response");
      }
      if (!res.ok || !data.success || !data.doctor) {
        throw new Error(data.error || "Failed to load doctor profile");
      }

      const mapped = mapDoctorWorkspace(data.doctor, data.completeness ?? 0);
      applyWorkspace(mapped);
      return mapped;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Profile load failed";
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [applyWorkspace]);

  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      refresh();
    }
  }, [refresh]);

  const profile = workspace?.profile ?? EMPTY_PROFILE;
  const settings = workspace?.settings ?? EMPTY_SETTINGS;
  const weeklySchedule = workspace?.weeklySchedule ?? null;

  return {
    profile,
    settings,
    weeklySchedule,
    verificationStatus: profile.verificationStatus,
    profileCompleteness: profile.profileCompleteness,
    isLoading,
    isReady: !isLoading && !!workspace,
    error,
    refresh,
    setProfileField: <K extends keyof DoctorProfileView>(
      key: K,
      value: DoctorProfileView[K]
    ) => {
      setWorkspace((prev) =>
        prev
          ? { ...prev, profile: { ...prev.profile, [key]: value } }
          : prev
      );
    },
    setSettingsField: <K extends keyof DoctorSettingsView>(
      key: K,
      value: DoctorSettingsView[K]
    ) => {
      setWorkspace((prev) =>
        prev
          ? { ...prev, settings: { ...prev.settings, [key]: value } }
          : prev
      );
    },
  };
}

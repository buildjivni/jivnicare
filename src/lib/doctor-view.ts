/**
 * Single canonical view-model for doctor profile data across dashboard, APIs, and admin.
 */

import { getUnifiedQueueCapacity } from "@/lib/utils/clinic-utils";

export interface DoctorProfileView {
  id: string;
  name: string;
  bio: string;
  regNumber: string;
  specialty: string;
  experience: string;
  qualifications: string;
  hospitalName: string;
  address: string;
  city: string;
  district: string;
  locality: string;
  pincode: string;
  phone: string;
  consultationFee: string;
  profileImage: string;
  clinicImage: string;
  verificationStatus: string;
  profileCompleteness: number;
}

export interface DoctorSettingsView {
  fee: string;
  maxCapacity: string;
  averageConsultationTime: string;
  emergencySlots: string;
  leaveMode: boolean;
  clinicStatus: string;
  statusReason: string;
  statusExpiresAt: string | null;
}

export interface DoctorWorkspaceView {
  profile: DoctorProfileView;
  settings: DoctorSettingsView;
  weeklySchedule: Record<string, unknown> | null;
}

/** Map raw /api/doctor/profile response into one stable workspace shape. */
export function mapDoctorWorkspace(
  doctor: Record<string, any>,
  completeness: number
): DoctorWorkspaceView {
  const ops = doctor.clinicOperations ?? {};
  const specialty =
    doctor.specialties?.[0]?.name ??
    (Array.isArray(doctor.specialtyIds) && doctor.specialtyIds[0]
      ? String(doctor.specialtyIds[0])
      : "General Medicine");

  const fee = doctor.fee ?? doctor.consultationFee ?? 0;

  return {
    profile: {
      id: doctor.id,
      name: doctor.name || doctor.user?.name || "",
      bio: doctor.bio || "",
      regNumber: doctor.medicalRegistrationNumber || "",
      specialty,
      experience: doctor.experience != null ? String(doctor.experience) : "0",
      qualifications: doctor.qualifications || doctor.education || "",
      hospitalName: doctor.clinicName || doctor.hospitalName || "",
      address:
        doctor.fullAddress ||
        ops.address ||
        [doctor.locality, doctor.city].filter(Boolean).join(", ") ||
        "",
      city: doctor.city || "",
      district: doctor.district || "",
      locality: doctor.locality || "",
      pincode: doctor.pincode || "",
      phone: doctor.user?.phone || "",
      consultationFee: String(fee),
      profileImage: doctor.profileImage || "",
      clinicImage: doctor.clinicImage || "",
      verificationStatus: doctor.verificationStatus || "DRAFT",
      profileCompleteness: completeness,
    },
    settings: {
      fee: String(fee),
      maxCapacity: String(getUnifiedQueueCapacity(ops)),
      averageConsultationTime: String(doctor.averageConsultationTime ?? 15),
      emergencySlots: String(ops.emergencySlots ?? 0),
      leaveMode: Boolean(ops.isClosedToday),
      clinicStatus: ops.status || "AVAILABLE",
      statusReason: ops.statusReason || "",
      statusExpiresAt: ops.statusExpiresAt || null,
    },
    weeklySchedule: doctor.weeklySchedule ?? null,
  };
}

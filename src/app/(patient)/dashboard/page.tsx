import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import prisma from "@/lib/db/prisma";
import { PatientDashboard } from "@/features/patient/components/dashboard/PatientDashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Dashboard | JivniCare",
};

export default async function PatientDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("jivnicare_token")?.value;

  if (!token) {
    redirect("/login");
  }

  const payload: any = await verifyToken(token);
  if (!payload || !payload.id || payload.role !== "PATIENT") {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: { name: true, phone: true }
  });

  if (!user) {
    redirect("/login");
  }

  // Fetch all tokens for this user
  const rawQueueTokens = await prisma.queueToken.findMany({
    where: { patientId: payload.id },
    include: {
      queue: {
        include: {
          doctor: {
            select: { name: true, specialties: { select: { name: true } }, clinicName: true, profileImage: true, updatedAt: true }
          }
        }
      }
    },
    orderBy: { bookedAt: 'desc' }
  });

  const queueTokens = rawQueueTokens.map(token => ({
    ...token,
    queue: {
      ...token.queue,
      doctor: {
        ...token.queue.doctor,
        image: token.queue.doctor.profileImage,
        specialty: token.queue.doctor.specialties?.[0]?.name || "Doctor"
      }
    }
  }));

  const upcomingTokens = queueTokens.filter(t => t.status === "WAITING" || t.status === "IN_CONSULTATION");
  const pastTokens = queueTokens.filter(t => t.status === "COMPLETED" || t.status === "CANCELLED" || t.status === "NO_SHOW");

  // Fetch saved doctors
  const rawSavedDocs = await prisma.savedDoctor.findMany({
    where: { userId: payload.id },
    include: {
      doctor: {
        select: { id: true, name: true, specialties: { select: { name: true } }, clinicName: true, profileImage: true, updatedAt: true, slug: true }
      }
    }
  });

  const savedDocs = rawSavedDocs.map(sd => ({
    ...sd,
    doctor: {
      ...sd.doctor,
      image: sd.doctor.profileImage,
      specialty: sd.doctor.specialties?.[0]?.name || "Doctor"
    }
  }));

  return (
    <PatientDashboard
      user={user}
      upcomingTokens={upcomingTokens}
      pastTokens={pastTokens}
      savedDoctors={savedDocs}
    />
  );
}

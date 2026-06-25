import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import prisma from "@/lib/db/prisma";
import { PatientDashboard } from "@/features/patient/components/dashboard/PatientDashboard";
import type { Metadata } from "next";
import { decrypt } from "@/lib/crypto";

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

  const decryptedUser = {
    ...user,
    phone: decrypt(user.phone)
  };

  // Fetch all tokens for this user
  const rawQueueTokens = await prisma.queueToken.findMany({
    where: { patientId: payload.id },
    include: {
      queue: {
        include: {
          doctor: {
            select: { name: true, speciality: true, clinicName: true, profilePhoto: true, updatedAt: true }
          }
        }
      }
    },
    orderBy: { bookedAt: 'desc' }
  });

  const queueTokens = rawQueueTokens.map(token => {
    let displayStatus = token.status as string;
    if (token.status === "BOOKED" || token.status === "AWAITING_ARRIVAL" || token.status === "READY") {
      displayStatus = "WAITING";
    } else if (token.status === "CALLED" || token.status === "IN_CONSULTATION") {
      displayStatus = "IN_CONSULTATION";
    }

    return {
      ...token,
      status: displayStatus,
      queue: {
        ...token.queue,
        doctor: {
          ...token.queue.doctor,
          image: token.queue.doctor.profilePhoto,
          specialty: token.queue.doctor.speciality || "Doctor"
        }
      }
    };
  });

  const upcomingTokens = queueTokens.filter(t => t.status === "WAITING" || t.status === "IN_CONSULTATION");
  const pastTokens = queueTokens.filter(t => t.status === "COMPLETED" || t.status === "CANCELLED" || t.status === "NO_SHOW");

  const savedDocs: any[] = [];

  return (
    <PatientDashboard
      user={decryptedUser}
      upcomingTokens={upcomingTokens}
      pastTokens={pastTokens}
      savedDoctors={savedDocs}
    />
  );
}

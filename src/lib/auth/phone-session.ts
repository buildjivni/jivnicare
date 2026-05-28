import prisma from "@/lib/db/prisma";
import { signToken } from "@/lib/jwt";
import { NextResponse } from "next/server";
import { isTestOtpModeEnabled } from "@/lib/config/test-mode";

interface CreatePhoneSessionInput {
  phone10: string;
  firebaseUid: string;
  name?: string;
  location?: string;
}

export async function createPhoneSessionResponse(input: CreatePhoneSessionInput) {
  const { phone10, firebaseUid, name, location } = input;

  const isNewUser = !(await prisma.user.findUnique({ where: { phone: phone10 } }));

  let user = await prisma.user.findUnique({
    where: { phone: phone10 },
    include: { doctor: true },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        phone: phone10,
        firebaseUid,
        name: name?.trim() || "Patient",
        location: location?.trim() || null,
        isVerified: true,
        role: "PATIENT",
      },
      include: { doctor: true },
    });
  } else {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        firebaseUid: user.firebaseUid || firebaseUid,
        isVerified: true,
        ...(name?.trim() && !user.name ? { name: name.trim() } : {}),
        ...(location?.trim() && !user.location ? { location: location.trim() } : {}),
      },
      include: { doctor: true },
    });
  }

  const token = signToken({
    id: user.id,
    role: user.role,
    ...(user.doctor?.id ? { doctorId: user.doctor.id } : {}),
  });

  const needsProfile =
    isNewUser ||
    !user.name?.trim() ||
    user.name.trim().toLowerCase() === "patient" ||
    !user.location?.trim();

  const response = NextResponse.json({
    message: "Phone verified successfully",
    userExists: !isNewUser,
    needsProfile,
    user: {
      id: user.id,
      phone: user.phone,
      name: user.name,
      role: user.role,
      doctorId: user.doctor?.id || null,
      latitude: user.latitude ?? null,
      longitude: user.longitude ?? null,
    },
  });

  const maxAge = 7 * 24 * 60 * 60;

  response.cookies.set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" && !isTestOtpModeEnabled(),
    sameSite: "lax",
    maxAge,
    path: "/",
  });

  return response;
}

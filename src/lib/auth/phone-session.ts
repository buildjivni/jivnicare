import prisma from "@/lib/db/prisma";
import { signToken } from "@/lib/jwt";
import { NextResponse } from "next/server";
import { isTestOtpModeEnabled } from "@/lib/config/test-mode";
import { encrypt, decrypt, hashPhone } from "@/lib/crypto";

interface CreatePhoneSessionInput {
  phone10: string;
  firebaseUid: string;
  name?: string;
  location?: string;
}

export async function createPhoneSessionResponse(input: CreatePhoneSessionInput) {
  const { phone10, firebaseUid, name, location } = input;
  const hashedPhone = hashPhone(phone10);

  const isNewUser = !(await prisma.user.findUnique({ where: { phoneHash: hashedPhone } }));

  let user = await prisma.user.findUnique({
    where: { phoneHash: hashedPhone },
    include: { doctor: true },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        phone: encrypt(phone10),
        phoneHash: hashedPhone,
        firebaseUid,
        name: name?.trim() || "Patient",
        location: location?.trim() || null,
        verificationStatus: 'VERIFIED',
        role: "PATIENT",
      },
      include: { doctor: true },
    });
  } else {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        firebaseUid: user.firebaseUid || firebaseUid,
        verificationStatus: 'VERIFIED',
        ...(name?.trim() && !user.name ? { name: name.trim() } : {}),
        ...(location?.trim() && !user.location ? { location: location.trim() } : {}),
      },
      include: { doctor: true },
    });
  }

  const token = await signToken({
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
      phone: decrypt(user.phone),
      name: user.name,
      role: user.role,
      doctorId: user.doctor?.id || null,
      latitude: user.latitude ?? null,
      longitude: user.longitude ?? null,
    },
  });

  const maxAge = 7 * 24 * 60 * 60;

  response.cookies.set("jivnicare_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" && !isTestOtpModeEnabled(),
    sameSite: "strict",
    maxAge,
    path: "/",
  });

  return response;
}


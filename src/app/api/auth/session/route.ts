import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";

export const dynamic = "force-dynamic";

/**
 * JivniCare Auth Bridge
 * POST /api/auth/session
 * Exchanges a Firebase ID Token for a secure Session Cookie.
 * Body: { idToken: string, name?: string }
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idToken, name: bodyName } = body;

    if (!idToken) {
      return NextResponse.json({ error: "Missing ID Token" }, { status: 400 });
    }

    // 1. Verify the ID Token with Firebase Admin
    const decodedToken = await getAdminAuth().verifyIdToken(idToken);
    const { uid, phone_number, email } = decodedToken;

    // Normalize the phone number — Firebase sends "+919430067927", DB stores "9430067927"
    const normalizedPhone = phone_number
      ? phone_number.replace(/^\+91/, "")
      : null;

    // 2. Sync with Prisma Database — find by firebaseUid first, then fallbacks
    const orConditions: any[] = [{ firebaseUid: uid }];
    if (normalizedPhone) orConditions.push({ phone: normalizedPhone });
    if (phone_number) orConditions.push({ phone: phone_number }); // also try with +91 prefix
    if (email) orConditions.push({ email });

    let user = await prisma.user.findFirst({
      where: { OR: orConditions },
      include: { doctor: true },
    });

    if (!user) {
      // New user — create with name from the login form (bodyName) or Firebase profile
      const resolvedName = bodyName?.trim() || decodedToken.name || null;
      user = await prisma.user.create({
        data: {
          firebaseUid: uid,
          phone: normalizedPhone || phone_number || "",
          email: email || null,
          name: resolvedName,
          role: Role.PATIENT,
        },
        include: { doctor: true },
      });
    } else {
      // Existing user — link Firebase UID if not set yet, and update name if empty
      const updateData: any = {};
      if (!user.firebaseUid) updateData.firebaseUid = uid;
      if (!user.name && bodyName?.trim()) updateData.name = bodyName.trim();

      if (Object.keys(updateData).length > 0) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: updateData,
          include: { doctor: true },
        });
      }
    }

    // 3. Set Custom Claims for role-based access
    const customClaims = {
      role: user.role,
      userId: user.id,
      doctorId: user.doctor?.id || null,
    };
    await getAdminAuth().setCustomUserClaims(uid, customClaims);

    // 4. Create Session Cookie (14 days)
    const expiresIn = 60 * 60 * 24 * 14 * 1000;
    const sessionCookie = await getAdminAuth().createSessionCookie(idToken, {
      expiresIn,
    });

    // 5. Return user data + set secure cookie
    const response = NextResponse.json({
      status: "success",
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        phone: user.phone,
        doctorId: user.doctor?.id,
      },
    });

    response.cookies.set("auth-token", sessionCookie, {
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });

    return response;
  } catch (error: any) {
    console.error("Session Creation Error:", error.code, error.message);
    return NextResponse.json(
      { error: error.message || "Failed to create session" },
      { status: 500 }
    );
  }
}

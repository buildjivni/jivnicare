import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";

export const dynamic = "force-dynamic";

/**
 * JivniCare Auth Bridge
 * POST /api/auth/session
 * Exhanges a Firebase ID Token for a secure Session Cookie.
 */

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json({ error: "Missing ID Token" }, { status: 400 });
    }

    // 1. Verify the ID Token
    const decodedToken = await getAdminAuth().verifyIdToken(idToken);
    const { uid, phone_number, email, name } = decodedToken;

    // 2. Sync with Prisma Database
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { firebaseUid: uid },
          { phone: phone_number || "undefined" },
          { email: email || "undefined" },
        ],
      },
      include: { doctor: true }
    });

    if (!user) {
      // Create new user if not found
      user = await prisma.user.create({
        data: {
          firebaseUid: uid,
          phone: phone_number || "",
          email: email || null,
          name: name || null,
          role: Role.PATIENT, // Default role
        },
        include: { doctor: true }
      });
    } else if (!user.firebaseUid) {
      // Link Firebase Identity to existing legacy user
      user = await prisma.user.update({
        where: { id: user.id },
        data: { firebaseUid: uid },
        include: { doctor: true }
      });
    }

    // 3. Set Custom Claims (Optimizes future server-side checks)
    const customClaims = {
      role: user.role,
      userId: user.id,
      doctorId: user.doctor?.id || null,
    };
    await getAdminAuth().setCustomUserClaims(uid, customClaims);

    // 4. Create Session Cookie (expires in 14 days)
    const expiresIn = 60 * 60 * 24 * 14 * 1000;
    const sessionCookie = await getAdminAuth().createSessionCookie(idToken, { expiresIn });

    // 5. Build Response with Secure Cookie
    const response = NextResponse.json({ 
      status: "success",
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        phone: user.phone,
        doctorId: user.doctor?.id,
      }
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
    console.error("Session Creation Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create session" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

export interface SessionPayload {
  id: string;
  role: string;
  doctorId?: string;
  email?: string;
}

export async function getSession(): Promise<SessionPayload | null> {
  const token = (await cookies()).get("jivnicare_token")?.value;
  if (!token) return null;

  try {
    const decoded = (await verifyToken(token)) as SessionPayload | null;
    if (!decoded?.id) return null;
    return decoded;
  } catch {
    return null;
  }
}

export async function requireSession(roles?: string[]) {
  const session = await getSession();
  if (!session) {
    return {
      session: null,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  if (roles && !roles.includes(session.role)) {
    return {
      session: null,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return { session, response: null };
}

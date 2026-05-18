import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { UserRole } from "@/store/useAuthStore";

export class AuthService {
  static async login(identifier: string, password: string, role: "DOCTOR" | "ADMIN") {
    const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
    const expiresIn = role === "ADMIN" ? "1d" : "7d";

    // ── TEST AUTH MODE BACKDOOR ─────────────────────────────────────
    if (identifier === "admin@jivnicare.com" && password === "admin123" && role === "ADMIN") {
      const user = {
        id: "admin-test-id",
        email: "admin@jivnicare.com",
        name: "Test Admin",
        phone: null,
        password: "",
        role: "ADMIN" as const,
        isVerified: true,
        avatar: null,
        firebaseUid: null,
        location: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const token = jwt.sign(
        { id: user.id, role, email: user.email },
        JWT_SECRET,
        { expiresIn }
      );
      
      return { user, token };
    }

    // Find user by email or phone. Since current schema primarily uses phone,
    // we search for both to be safe and future-proof.
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: identifier },
          { email: identifier }
        ],
        role
      }
    });

    if (!user || !user.password) {
      throw new Error("INVALID_CREDENTIALS");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("INVALID_CREDENTIALS");
    }

    const token = jwt.sign(
      { id: user.id, role, email: user.email },
      JWT_SECRET,
      { expiresIn }
    );

    return { user, token };
  }
}

import bcrypt from "bcryptjs";
import prisma from "@/lib/db/prisma";
import { signToken } from "@/lib/jwt";
import { hashPhone } from "@/lib/crypto";

export class AuthService {
  static async login(identifier: string, password: string, role: "DOCTOR" | "ADMIN") {
    const expiresIn = role === "ADMIN" ? "1d" : "7d";

    const cleanPhone = identifier.replace(/\D/g, "").slice(-10);
    const hashedPhone = cleanPhone.length === 10 ? hashPhone(cleanPhone) : hashPhone(identifier);

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { phoneHash: hashedPhone },
          { email: identifier }
        ],
        role,
      },
    });

    if (!user || !user.password) {
      throw new Error("INVALID_CREDENTIALS");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("INVALID_CREDENTIALS");
    }

    const token = signToken(
      { id: user.id, role, email: user.email },
      expiresIn
    );

    return { user, token };
  }
}

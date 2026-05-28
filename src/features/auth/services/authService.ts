import bcrypt from "bcryptjs";
import prisma from "@/lib/db/prisma";
import { signToken } from "@/lib/jwt";
export class AuthService {
  static async login(identifier: string, password: string, role: "DOCTOR" | "ADMIN") {
    const expiresIn = role === "ADMIN" ? "1d" : "7d";

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ phone: identifier }, { email: identifier }],
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

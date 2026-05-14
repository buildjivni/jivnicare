import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { UserRole } from "@/store/useAuthStore";

export class AuthService {
  static async login(email: string, password: string, role: "DOCTOR" | "ADMIN") {
    const user = await prisma.user.findFirst({
      where: { role }
    });

    if (!user || !user.password) {
      throw new Error("INVALID_CREDENTIALS");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("INVALID_CREDENTIALS");
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      throw new Error("FATAL: JWT_SECRET environment variable is not defined");
    }

    const expiresIn = role === "ADMIN" ? "1d" : "7d";

    const token = jwt.sign(
      { id: user.id, role, email },
      JWT_SECRET,
      { expiresIn }
    );

    return { user, token };
  }
}

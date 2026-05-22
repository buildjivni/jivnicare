import jwt from "jsonwebtoken";
import { getJwtSecret } from "@/lib/infrastructure/env";

export const signToken = (payload: object, expiresIn = "7d") => {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: expiresIn as jwt.SignOptions["expiresIn"] });
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, getJwtSecret());
  } catch {
    return null;
  }
};

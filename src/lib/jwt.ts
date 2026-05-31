import jwt from "jsonwebtoken";
import { getJwtSecret } from "@/lib/infrastructure/env";
import { redis } from "@/lib/db/redis";

export const signToken = (payload: object, expiresIn = "7d") => {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: expiresIn as jwt.SignOptions["expiresIn"] });
};

export const verifyToken = async (token: string) => {
  try {
    const isRevoked = await redis.get(`revoked:${token}`);
    if (isRevoked) {
      return null;
    }
    return jwt.verify(token, getJwtSecret());
  } catch {
    return null;
  }
};

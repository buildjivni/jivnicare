import jwt from "jsonwebtoken";

export const signToken = (payload: object, expiresIn = "7d") => {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) throw new Error("FATAL: JWT_SECRET environment variable is not defined");
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresIn as any });
};

export const verifyToken = (token: string) => {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) throw new Error("FATAL: JWT_SECRET environment variable is not defined");
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

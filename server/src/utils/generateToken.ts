import jwt from "jsonwebtoken";
export const generateToken = (userId: string, role: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_SECRET ortam değişkeni tanımlı değil/ JWT_SECRET is not defined in the environment variables",
    );
  }
  return jwt.sign({ userId, role }, secret, { expiresIn: "1d" });
};

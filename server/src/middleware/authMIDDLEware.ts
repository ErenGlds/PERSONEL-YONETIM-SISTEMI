import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export const protect = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res
        .status(401)
        .json({
          message:
            "Yetkilendirme tokeni bulunamadı/Authorization token not found",
        });
      return;
    }
    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error(
        "JWT_SECRET ortam değişkenlerinde tanımlanmamış./JWT_SECRET is not defined in environment variables",
      );
    }
    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res
      .status(401)
      .json({
        message:
          "Geçersiz token ya da token süresi dolmuş/Invalid token or token has expired",
        error,
      });
  }
};

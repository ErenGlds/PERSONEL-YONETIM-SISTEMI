import e, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors).map((e) => e.message);
    res.status(400).json({ message: messages.join(", ") });
    return;
  }
  if (err instanceof mongoose.Error.CastError) {
    res
      .status(400)
      .json({ message: "Geçersiz ID formatı / Invalid ID format" });
    return;
  }

  if (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: number }).code === 11000
  ) {
    res
      .status(400)
      .json({ message: "Bu kayıt zaten mevcut / Record already exists" });
    return;
  }
  console.error(err);
  const message =
    err instanceof Error ? err.message : "Sunucu hatası / Server error";
  res.status(500).json({ message });
};

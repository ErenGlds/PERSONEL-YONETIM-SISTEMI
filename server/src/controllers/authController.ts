import { Request, Response } from "express";
import { User } from "../models/User";
import { generateToken } from "../utils/generateToken";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res
        .status(400)
        .json({
          message: "Bu e-posta zaten kayıtlı/Email is already registered",
        });
      return;
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user.id, user.role);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası/Server Error", error });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res
        .status(400)
        .json({
          message:
            "E-posta ve şifre zorunludur/Email and password are required",
        });
      return;
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      res
        .status(401)
        .json({
          message: "Geçersiz e-posta veya şifre/Invalid email or password",
        });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res
        .status(401)
        .json({
          message: "Geçersiz e-posta veya şifre/Invalid email or password",
        });
      return;
    }

    const token = generateToken(user.id, user.role);

    res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası", error });
  }
};

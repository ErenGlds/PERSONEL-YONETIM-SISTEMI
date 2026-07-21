import { Router } from "express";
import { register, login } from "../controllers/authController";
import { protect, adminOnly, AuthRequest } from "../middleware/authMIDDLEware";
import { Response } from "express";
import { User } from "../models/User";

const router = Router();

router.post("/register", register);
router.post("/login", login);

router.get(
  "/users",
  protect,
  adminOnly,
  async (req: AuthRequest, res: Response) => {
    try {
      const users = await User.find().select("name email role");
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: "Sunucu hatası / Server error", error });
    }
  },
);

export default router;

import { Router } from "express";
import {
  getMyNotifications,
  markAsRead,
} from "../controllers/notificationController";
import { protect } from "../middleware/authMIDDLEware";

const router = Router();

router.use(protect);

router.get("/", getMyNotifications);
router.put("/read", markAsRead);

export default router;

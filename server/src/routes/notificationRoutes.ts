import { Router } from "express";
import {
  getMyNotifications,
  markAsRead,
  deleteNotification,
  clearAllNotifications,
} from "../controllers/notificationController";
import { protect } from "../middleware/authMIDDLEware";

const router = Router();

router.use(protect);

router.get("/", getMyNotifications);
router.put("/read", markAsRead);
router.delete("/clear", clearAllNotifications);
router.delete("/:id", deleteNotification);

export default router;

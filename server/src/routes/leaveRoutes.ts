import { Router } from "express";
import {
  getLeaves,
  createLeave,
  updateLeave,
  deleteLeave,
} from "../controllers/leaveController";
import { protect, adminOnly } from "../middleware/authMIDDLEware";

const router = Router();

router.use(protect);

router.get("/", getLeaves);
router.post("/", createLeave);
router.put("/:id", adminOnly, updateLeave);
router.delete("/:id", adminOnly, deleteLeave);

export default router;

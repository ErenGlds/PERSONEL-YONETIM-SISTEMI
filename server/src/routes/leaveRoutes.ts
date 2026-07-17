import { Router } from "express";
import {
  getLeaves,
  createLeave,
  updateLeave,
  deleteLeave,
} from "../controllers/leaveController";
import { protect } from "../middleware/authMIDDLEware";

const router = Router();

router.use(protect);

router.get("/", getLeaves);
router.delete("/:id", deleteLeave);
router.put("/:id", updateLeave);
router.post("/:id", createLeave);

export default router;

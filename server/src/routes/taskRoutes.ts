import { Router } from "express";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../controllers/TaskController";
import { protect, adminOnly } from "../middleware/authMIDDLEware";

const router = Router();

router.use(protect);

router.get("/", getTasks);
router.post("/", adminOnly, createTask);
router.put("/:id", updateTask);
router.delete("/:id", adminOnly, deleteTask);

export default router;

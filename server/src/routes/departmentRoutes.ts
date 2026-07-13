import { Router } from "express";
import {
  createDepartment,
  getDepartment,
  updateDepartment,
  deleteDepartment,
} from "../controllers/departmentController";
import { protect } from "../middleware/authMIDDLEware";

const router = Router();

router.use(protect);

router.get("/", getDepartment);
router.post("/", createDepartment);
router.put("/:id", updateDepartment);
router.delete("/:id", deleteDepartment);

export default router;

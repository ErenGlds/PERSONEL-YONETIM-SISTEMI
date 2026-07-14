import { Router } from "express";
import {
  getHolidays,
  updateHoliday,
  deleteHoliday,
  createHoliday,
} from "../controllers/holidayController";
import { protect } from "../middleware/authMIDDLEware";

const router = Router();

router.use(protect);

router.get("/", getHolidays);
router.post("/", createHoliday);
router.put("/:id", updateHoliday);
router.delete("/:id", deleteHoliday);

export default router;

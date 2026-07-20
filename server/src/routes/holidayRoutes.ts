import { Router } from "express";
import {
  getHolidays,
  updateHoliday,
  deleteHoliday,
  createHoliday,
  importPublicHolidays,
} from "../controllers/holidayController";
import { adminOnly, protect } from "../middleware/authMIDDLEware";

const router = Router();

router.use(protect);

router.get("/", getHolidays);
router.post("/", createHoliday);
router.put("/:id", updateHoliday);
router.delete("/:id", deleteHoliday);
router.post("/import", adminOnly, importPublicHolidays);

export default router;

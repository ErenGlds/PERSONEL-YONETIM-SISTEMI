import { Router } from "express";
import { getDashboardStats } from "../controllers/dashboardController";
import { protect } from "../middleware/authMIDDLEware";

const router = Router();

router.use(protect);

router.get("/", getDashboardStats);

export default router;

import { Router } from "express";
import { chat } from "../controllers/chatController";
import { protect } from "../middleware/authMIDDLEware";

const router = Router();

router.use(protect);
router.post("/", chat);

export default router;

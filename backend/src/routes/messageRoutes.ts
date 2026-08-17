import { Router } from "express";
import { sendMessage, getMessages } from "../controller/messageController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.post("/", protect, sendMessage);
router.get("/:chatId", protect, getMessages);

export default router;

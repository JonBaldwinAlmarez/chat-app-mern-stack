import { Router } from "express";
import { accessChat, getMyChats } from "../controller/chatController";
import { protect } from "../middleware/authMiddleware";

// Initialize the Express router for chat-related endpoints.
const router = Router();

// Access or create a chat between users.
// The protect middleware ensures that only authenticated users
// can access this endpoint.
router.post("/", protect, accessChat);

// Retrieve the authenticated user's chat conversations.
// The protect middleware ensures that only authenticated users
// can access their chat list.
router.get("/", protect, getMyChats);

// Export the router to be registered in the main Express application.
export default router;

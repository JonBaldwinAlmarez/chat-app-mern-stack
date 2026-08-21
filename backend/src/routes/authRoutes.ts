import { Router } from "express";
import { signup, login, findUserByEmail } from "../controller/authController";
import { protect } from "../middleware/authMiddleware";

// Initialize the Express router for authentication-related endpoints.
const router = Router();

// Register a new user account.
router.post("/signup", signup);

// Authenticate an existing user and issue a JWT.
router.post("/login", login);

// Finds a user by email while restricting access to authenticated users through the "protect" middleware.
router.get("/find", protect, findUserByEmail);

// Export the authentication router for registration in the main Express application.
export default router;

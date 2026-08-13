import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Extends Express's Request interface to include the authenticated user's ID.
export interface AuthRequest extends Request {
  userId?: string;
}

// Defines the expected structure of the decoded JWT payload.
interface DecodedToken {
  id: string;
}

// Authentication middleware that protects routes requiring a valid JWT.
export const protect = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  // Retrieve the Authorization header from the incoming request.
  const authHeader = req.headers.authorization;

  // Ensure the request contains a Bearer token.
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Not authorized, no token" });
    return;
  }

  // Extract the JWT from the Authorization header.
  const token = authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Not authorized, malformed token" });
    return;
  }

  try {
    // Retrieve the secret used to verify the JWT.
    const secret = process.env.JWT_SECRET;

    // Prevent token verification if the JWT secret is not configured.
    if (!secret) {
      throw new Error("JWT_SECRET is not defined");
    }

    // Verify the token and extract the authenticated user's ID.
    const decoded = jwt.verify(token, secret) as unknown as DecodedToken;

    // Attach the user's ID to the request for use by subsequent handlers.
    req.userId = decoded.id;

    // Continue to the next middleware or protected route handler.
    next();
  } catch (error) {
    // Log authentication errors for server-side debugging.
    console.log("Authentication error:", error);

    // Reject the request when the token is invalid, expired, or cannot be verified.
    res.status(401).json({
      message: "Not authorized, invalid token",
    });
  }
};

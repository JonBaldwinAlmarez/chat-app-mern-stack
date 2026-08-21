import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import User from "../models/User";
import { AuthRequest } from "../middleware/authMiddleware";

interface SignUpBody {
  username: string;
  password: string;
  email: string;
}

interface LoginBody {
  email: string;
  password: string;
}

// Generates a JSON Web Token (JWT) for an authenticated user.
// The token is used to securely identify the user in subsequent requests.
const generateToken = (userId: string): string => {
  // Retrieve the JWT signing secret from the environment variables.
  const secret = process.env.JWT_SECRET;

  // Prevent token generation if the required signing secret is not configured.
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in the .env");
  }

  // Sign the token with the user's ID and configure it to expire after one day.
  return jwt.sign({ id: userId }, secret, { expiresIn: "1d" });
};

export const signup = async (
  req: Request<{}, {}, SignUpBody>,
  res: Response,
): Promise<void> => {
  try {
    // Extract the required registration fields from the request body.
    const { username, email, password } = req.body;

    // Validate that all required fields are provided.
    if (!username || !email || !password) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    // Check whether an account already exists with the provided email.
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res.status(409).json({ message: "Email already exists" });
      return;
    }

    // Create the new user.
    // The User schema middleware handles password hashing before saving.
    const user = await User.create({
      username,
      email,
      password,
    });

    // Generate an authentication token using the newly created user's ID.
    const token = generateToken(user._id.toString());

    // Return the authentication token and non-sensitive user information.
    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    // Log unexpected errors for server-side debugging.
    console.log("Sign up error:", error);

    // Return a generic error message without exposing internal details.
    res.status(500).json({
      message: "Server error during signup",
    });
  }
};

export const login = async (
  req: Request<{}, {}, LoginBody>,
  res: Response,
): Promise<void> => {
  try {
    // Extract the user's login credentials from the request body.
    const { email, password } = req.body;

    // Validate that all required login fields are provided.
    if (!email || !password) {
      res.status(400).json({
        message: "Email and password are required",
      });
      return;
    }

    // Find the user associated with the provided email address.
    const user = await User.findOne({ email });

    // Return a generic authentication error if the account does not exist.
    // Using the same message for authentication failures helps avoid revealing
    // whether a specific email address is registered.
    if (!user) {
      res.status(401).json({
        message: "Invalid credentials",
      });
      return;
    }

    // Compare the provided password with the hashed password stored in the database.
    const isMatch = await user.comparePassword(password);

    // Reject the request when the provided password does not match.
    if (!isMatch) {
      res.status(401).json({
        message: "Invalid credentials",
      });
      return;
    }

    // Generate an authentication token using the authenticated user's ID.
    const token = generateToken(user._id.toString());

    // Return the token along with non-sensitive user information.
    res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    // Log unexpected errors for server-side debugging.
    console.log("Login error:", error);

    // Return a generic server error without exposing internal details.
    res.status(500).json({
      message: "Server error during login",
    });
  }
};

// Finds a user by their email address and returns their public account information.
export const findUserByEmail = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    // Retrieve the email address from the query parameters.
    const { email } = req.query;

    // Validate that an email was provided and that it is a string.
    if (!email || typeof email !== "string") {
      res.status(400).json({
        message: "Email is required",
      });
      return;
    }

    // Search for the user by email and return only non-sensitive account information.
    // The password and other private fields are intentionally excluded.
    const foundUser = await User.findOne({ email }).select(
      "username email _id",
    );

    // Return a 404 response when no matching user is found.
    if (!foundUser) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }

    // Return the user's public information to the client.
    res.status(200).json(foundUser);
  } catch (error) {
    // Log unexpected errors for server-side debugging.
    console.error("Find user error:", error);

    // Return a generic server error without exposing internal details.
    res.status(500).json({
      message: "Server error finding user",
    });
  }
};

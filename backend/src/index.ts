import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";
import authRoutes from "./routes/authRoutes";
import chatRoutes from "./routes/chatRoutes";
import messageRoutes from "./routes/messageRoutes";

// Load environment variables from the .env file.
dotenv.config();

// Establish a connection to the MongoDB database.
connectDB();

const app = express(); // Initialize the Express application.

/* Define the server port using the environment variable,  with port 5000 as the fallback value. */
const PORT: number = Number(process.env.PORT) || 5001;

app.use(cors()); // Prevent CORs error policy
app.use(express.json()); // Parse incoming JSON request bodies.

app.use("/api/auth", authRoutes); // Register authentication-related API routes.
app.use("/api/chats", chatRoutes); // Register chat-related API routes, protected by JWT authentication middleware.
app.use("/api/messages", messageRoutes);

// Basic health-check endpoint to verify that the server is running.
app.get("/", (req, res) => {
  res.send("Hello World! From TypeScript with Express");
});

// Start the Express server and listen for incoming requests.
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

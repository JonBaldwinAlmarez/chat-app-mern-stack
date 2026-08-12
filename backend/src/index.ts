import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db";
import authRoutes from "./routes/authRoutes";

// Load environment variables from the .env file.
dotenv.config();

// Establish a connection to the MongoDB database.
connectDB();

// Initialize the Express application.
const app = express();

// Define the server port using the environment variable,
// with port 5000 as the fallback value.
const PORT: number = Number(process.env.PORT) || 5001;

// Parse incoming JSON request bodies.
app.use(express.json());

// Register authentication-related API routes.
app.use("/api/auth", authRoutes);

// Basic health-check endpoint to verify that the server is running.
app.get("/", (req, res) => {
  res.send("Hello World! From TypeScript with Express");
});

// Start the Express server and listen for incoming requests.
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
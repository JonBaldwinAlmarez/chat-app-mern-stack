import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db";

dotenv.config();
connectDB();

const app = express();
const PORT: number = Number(process.env.PORT) || 5000;

app.get("/", (req, res) => {
  res.send("Hello World! From TypeScript with Express");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
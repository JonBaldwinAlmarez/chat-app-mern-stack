import express from "express";
import type { Request, Response } from "express";

const app = express();
const PORT: number = 5000;

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World! From TypeScript with Express");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
import "reflect-metadata";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import initialize from "./data-source";
import userRoutes from "./routes/public.routes";    // for register, login
import accountRoutes from "./routes/account.routes"; // for protected stuff

dotenv.config();

const app = express();
const PORT = parseInt(process.env.APP_PORT);

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/", userRoutes);
app.use("/", accountRoutes);

// Initialize DB and Start Server
async function start() {
  await initialize();
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
  console.log("Database initialized successfully.");
}

start();

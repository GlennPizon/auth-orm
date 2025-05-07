import "reflect-metadata";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import initialize from "./data-source";
import router from "./routes/accounts.routes";
import swaggerRouter from "./utils/swagger";
import { errorHandler } from "./middleware/error-handler";
import { Response, Request, NextFunction } from "express";
import cookieParser from "cookie-parser";

dotenv.config();


const app = express();
const PORT = parseInt(process.env.APP_PORT);

// 🔹 Middleware (Put this BEFORE routes)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin(requestOrigin, callback) {
      callback(null, requestOrigin || process.env.APP_ORIGIN);
    },
    credentials: true,
  })
);

// 🔹 Routes (AFTER middleware)
app.use("/", router);
app.use(swaggerRouter);

// 🔹 Initialize DB and Start Server
async function start() {
  await initialize();

  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    errorHandler(err, req, res, next);
  });

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });

  console.log("✅ Database initialized successfully.");
}

start();

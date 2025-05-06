import "reflect-metadata";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import initialize from "./data-source";
import router from "./routes/accounts.routes";
import swaggerRouter from "./utils/swagger";
import { errorHandler } from "./middleware/error-handler";
import { Response, Request, NextFunction } from "express";

dotenv.config();

const app = express();
const PORT = parseInt(process.env.APP_PORT);

// 🔹 Middlewares
app.use(cors());


// 🔹 Routes
app.use("/", router); // Use the imported router for all user-related routes

//swagger 
app.use(swaggerRouter);

// 🔹 Initialize DB and Start Server

async function start() {
    await initialize();
    app.use( (err: any,req: Request, res: Response, next: NextFunction) => {
        errorHandler(err, req, res, next);
    });
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
    console.log("Database initialized successfully.");
    
}

start();

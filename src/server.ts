import express from "express";
import cors from "cors";
import helmet from "helmet";
import * as dotenv from "dotenv";
import initialize, {AppDataSource} from "./helpers/db"; // Import database connection and initialization


dotenv.config();
const app = express();
const port = Number(process.env.APP_PORT);



start();

async function start(){
    try{
         // Middleware
        app.use(express.json());
        app.use(cors());
        app.use(helmet());

        app.use(express.urlencoded({ extended: true }));
        await initialize();
        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    }catch(error){
        console.error("Database connection error:", error);
        console.log(`PLEASE PROVIDE DETAILS OF THE MYSQL in as a .env file inside the group-G folder`); 
    }

}

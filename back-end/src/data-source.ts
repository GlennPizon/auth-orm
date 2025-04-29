import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entity/User";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// ✅ Load environment variables safely
const dbhost: string = process.env.DB_HOST;
const dbport: number = parseInt(process.env.DB_PORT); // 🔹 Ensure port is a number
const dbuser: string = process.env.DB_USER ;
const dbpassword: string = process.env.DB_PASS;
const dbname: string = process.env.DB_NAME;

// ✅ Define TypeORM DataSource
export const AppDataSource = new DataSource({
    type: "mysql",
    host: dbhost,
    port: dbport,
    username: dbuser,
    password: dbpassword,
    database: dbname,
    synchronize: true, // 🔹 Auto-create tables
    logging: false,
    entities: [User],
    migrations: [],
    subscribers: [],
});

// ✅ MySQL Connection Options for Database Creation
const connectionOptions = {
    host: dbhost,
    port: dbport,
    user: dbuser,
    password: dbpassword,
};

// ✅ Function to Check If Database Exists
async function checkDatabaseExists(): Promise<boolean> {
    try {
        const connection = await mysql.createConnection(connectionOptions);
        const [rows]: any = await connection.query(
            `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?`,
            [dbname]
        );
        return rows.length > 0;
    } catch (error) {
        console.error("Error checking database existence:", error);
        return false;
    }
}

// ✅ Function to Create Database if It Doesn't Exist
async function createDatabase() {
    try {
        const connection = await mysql.createConnection(connectionOptions);
        if (await checkDatabaseExists()) {
            console.log(`Database "${dbname}" already exists.`);
            return
        } 
        
            await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbname}\`;`);
            console.log(`Database "${dbname}" created successfully.`);
        
    } catch (error) {
        console.error("Error creating database:", error);
    }
}

// ✅ Initialize Database & TypeORM
export const initialize = async () => {
    try {
        await createDatabase(); // 🔹 Ensure DB is created before TypeORM starts
        await AppDataSource.initialize();
        console.log("Data Source has been initialized successfully!");
    } catch (error) {
        console.error("Error initializing database:", error);
    }
};

export default initialize;
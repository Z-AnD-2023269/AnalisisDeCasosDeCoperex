import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const dbConnection = async () => {
    try {
        mongoose.connection.on("error", (err) => {
            console.error("MongoDB | Error in connection:", err);
        });

        mongoose.connection.on("connecting", () => {
            console.log("MongoDB | connecting to MongoDB Service");
        });

        mongoose.connection.on("connected", () => {
            console.log("MongoDB | connected to MongoDB Service");
        });

        mongoose.connection.on("open", () => {
            console.log("MongoDB | connection is open and ready to use");
        });

        mongoose.connection.on("reconnected", () => {
            console.log("MongoDB | reconnected to MongoDB Service");
        });

        mongoose.connection.on("disconnected", () => {
            console.log("MongoDB | disconnected from MongoDB Service");
        });

        await mongoose.connect(process.env.URI_MONGO, {
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 50,
        });

        console.log("✅ Connected to MongoDB successfully");

    } catch (err) {
        console.error("❌ Error during MongoDB connection:", err.message);
        console.error("Full error details:", err);
    }
};
import { connectDB } from "../server/src/config/db";
import mongoose from "mongoose";

async function benchmark() {
    console.log("Starting MongoDB connection benchmark...");
    const start = Date.now();
    try {
        await connectDB();
        const end = Date.now();
        console.log(`✅ MongoDB connected successfully in ${end - start}ms`);
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB.");
    } catch (error) {
        console.error("❌ Benchmark failed:", error);
    }
}

benchmark();

import mongoose from "mongoose";
import { env } from "./env";

let isConnected = false;

export const connectDB = async (): Promise<void> => {
  if (isConnected) return;

  try {
    mongoose.set("strictQuery", false);

    await mongoose.connect(env.MONGO_URI, {
      maxPoolSize: 20,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 60000,
    });

    isConnected = true;
    console.log(`✅  MongoDB connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error("❌  MongoDB connection failed:", error instanceof Error ? error.message : error);
    // Don't process.exit — let the app stay up and retry
  }

  mongoose.connection.on("disconnected", () => {
    isConnected = false;
    console.warn("⚠️   MongoDB disconnected. Retrying...");
  });

  mongoose.connection.on("error", (err) => {
    console.error("❌  MongoDB error:", err);
  });
};
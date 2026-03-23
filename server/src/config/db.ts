import mongoose from "mongoose";
import { env } from "./env";

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI, {
      dbName: "kairos-crm",
      family: 4,
    });
    console.log(`✅  MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌  MongoDB connection failed:", error);
    process.exit(1);
  }

  mongoose.connection.on("disconnected", () => {
    console.warn("⚠️   MongoDB disconnected. Retrying...");
  });

  mongoose.connection.on("error", (err) => {
    console.error("❌  MongoDB error:", err);
  });
};

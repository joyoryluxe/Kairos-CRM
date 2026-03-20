import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

interface Env {
  PORT: number;
  NODE_ENV: "development" | "production" | "test";
  MONGO_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  CLIENT_ORIGIN: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GOOGLE_REDIRECT_URI?: string;
}

const getEnv = (): Env => {
  const {
    PORT,
    NODE_ENV,
    MONGO_URI,
    JWT_SECRET,
    JWT_EXPIRES_IN,
    CLIENT_ORIGIN,
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI,
  } = process.env;

  if (!MONGO_URI) throw new Error("MONGO_URI is required in .env");
  if (!JWT_SECRET) throw new Error("JWT_SECRET is required in .env");

  return {
    PORT: Number(PORT) || 5000,
    NODE_ENV: (NODE_ENV as Env["NODE_ENV"]) || "development",
    MONGO_URI,
    JWT_SECRET,
    JWT_EXPIRES_IN: JWT_EXPIRES_IN || "7d",
    CLIENT_ORIGIN: CLIENT_ORIGIN || "http://localhost:5173",
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI,
  };
};

export const env = getEnv();

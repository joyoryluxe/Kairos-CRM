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
  SMTP_HOST: string;
  SMTP_PORT: number;
  SMTP_USER: string;
  SMTP_PASS: string;
  EMAIL_FROM: string;
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
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    EMAIL_FROM,
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
    SMTP_HOST: SMTP_HOST || "smtp.resend.com",
    SMTP_PORT: Number(SMTP_PORT) || 465,
    SMTP_USER: SMTP_USER || "resend",
    SMTP_PASS: SMTP_PASS || "",
    EMAIL_FROM: EMAIL_FROM || "onboarding@resend.dev",
  };
};

export const env = getEnv();

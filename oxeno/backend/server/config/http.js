import { isProduction } from "./environment.js";

const corsOriginEnv = process.env.CORS_ORIGIN;

export const allowedOrigins = (corsOriginEnv || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (isProduction && !corsOriginEnv) {
  throw new Error("CORS_ORIGIN must be set in production to prevent open CORS policies.");
}

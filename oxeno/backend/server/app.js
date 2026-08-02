import express from "express";
import helmet from "helmet";
import pinoHttp from "pino-http";
import { allowedOrigins } from "./config/http.js";
import { trustProxy } from "./config/environment.js";
import healthRoutes from "./routes/healthRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { cors } from "./middleware/cors.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import { apiRateLimiter } from "./middleware/rateLimiters.js";
import { logger } from "./logger.js";

const app = express();

if (trustProxy) {
  app.set("trust proxy", trustProxy);
}

app.disable("x-powered-by");
app.use(pinoHttp({ logger }));
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors(allowedOrigins));
app.use(express.json({ limit: 100_000, type: "*/*" }));
app.use("/api", apiRateLimiter);

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;

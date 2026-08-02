import pino from "pino";

const redact = {
  paths: [
    "req.headers.authorization",
    "req.headers.cookie",
    "password",
    "confirmPassword",
    "credential",
  ],
  censor: "[Redacted]",
};

export const logger = pino({
  level: process.env.LOG_LEVEL?.trim() || (process.env.NODE_ENV === "test" ? "silent" : "info"),
  redact,
});

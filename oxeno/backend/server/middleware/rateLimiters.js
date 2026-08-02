import { rateLimit } from "express-rate-limit";
import { RequestError } from "../errors/RequestError.js";

function rateLimitHandler(request, response, next) {
  next(new RequestError(429, "Too many requests. Please try again later.", "rate_limited"));
}

const standardOptions = {
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: rateLimitHandler,
};

export const apiRateLimiter = rateLimit({
  ...standardOptions,
  windowMs: 15 * 60 * 1000,
  limit: 100,
});

export const authRateLimiter = rateLimit({
  ...standardOptions,
  windowMs: 15 * 60 * 1000,
  limit: 10,
});

import { Router } from "express";
import { getCurrentAccount, googleLogin, login, signup } from "../controllers/authController.js";
import { authenticate } from "../middleware/authenticate.js";
import { asyncRoute } from "../middleware/asyncRoute.js";
import { authRateLimiter } from "../middleware/rateLimiters.js";
import { requireJsonBody } from "../middleware/requireJsonBody.js";
import { validateBody } from "../middleware/validate.js";
import { googleLoginSchema, loginSchema, signupSchema } from "../validators/authSchemas.js";

const router = Router();

router.post(
  "/signup",
  authRateLimiter,
  requireJsonBody,
  validateBody(signupSchema),
  asyncRoute(signup),
);
router.post(
  "/login",
  authRateLimiter,
  requireJsonBody,
  validateBody(loginSchema),
  asyncRoute(login),
);
router.post(
  "/google",
  authRateLimiter,
  requireJsonBody,
  validateBody(googleLoginSchema),
  asyncRoute(googleLogin),
);
router.get("/me", authenticate, getCurrentAccount);

export default router;

import { Router } from "express";
import {
  getCurrentCustomer,
  loginCustomer,
  signupCustomer,
} from "../controllers/customerAuthController.js";
import { authenticate } from "../middleware/authenticate.js";
import { asyncRoute } from "../middleware/asyncRoute.js";
import { requireRoles } from "../middleware/authorize.js";
import { authRateLimiter } from "../middleware/rateLimiters.js";
import { requireJsonBody } from "../middleware/requireJsonBody.js";
import { validateBody } from "../middleware/validate.js";
import { customerLoginSchema, customerSignupSchema } from "../validators/customerSchemas.js";

const router = Router();

router.post(
  "/signup",
  authRateLimiter,
  requireJsonBody,
  validateBody(customerSignupSchema),
  asyncRoute(signupCustomer),
);
router.post(
  "/login",
  authRateLimiter,
  requireJsonBody,
  validateBody(customerLoginSchema),
  asyncRoute(loginCustomer),
);
router.get("/me", authenticate, requireRoles("customer"), getCurrentCustomer);

export default router;

import { Router } from "express";
import { getCustomerDashboardData } from "../controllers/customerDashboardController.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireRoles } from "../middleware/authorize.js";
import { asyncRoute } from "../middleware/asyncRoute.js";

const router = Router();

router.get("/", authenticate, requireRoles("customer"), asyncRoute(getCustomerDashboardData));

export default router;

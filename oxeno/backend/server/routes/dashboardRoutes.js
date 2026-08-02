import { Router } from "express";
import { getDashboard } from "../controllers/dashboardController.js";
import {
  awardCustomerLoyaltyPoints,
  createDashboardOffer,
  getDashboardOffers,
  getLoyaltyAwardOptions,
} from "../controllers/businessToolsController.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireRoles } from "../middleware/authorize.js";
import { asyncRoute } from "../middleware/asyncRoute.js";
import { validateBody } from "../middleware/validate.js";
import { awardLoyaltyPointsSchema, createOfferSchema } from "../validators/businessToolsSchemas.js";

const router = Router();

router.get("/", authenticate, requireRoles("owner", "manager", "staff"), asyncRoute(getDashboard));
router.get(
  "/loyalty-options",
  authenticate,
  requireRoles("owner", "manager", "staff"),
  asyncRoute(getLoyaltyAwardOptions),
);
router.post(
  "/loyalty-points",
  authenticate,
  requireRoles("owner", "manager", "staff"),
  validateBody(awardLoyaltyPointsSchema),
  asyncRoute(awardCustomerLoyaltyPoints),
);
router.get(
  "/offers",
  authenticate,
  requireRoles("owner", "manager", "staff"),
  asyncRoute(getDashboardOffers),
);
router.post(
  "/offers",
  authenticate,
  requireRoles("owner", "manager", "staff"),
  validateBody(createOfferSchema),
  asyncRoute(createDashboardOffer),
);

export default router;

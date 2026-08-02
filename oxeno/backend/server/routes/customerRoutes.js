import { Router } from "express";
import { listBusinessCategories, listBusinesses } from "../controllers/customerController.js";
import { asyncRoute } from "../middleware/asyncRoute.js";
import { validateQuery } from "../middleware/validate.js";
import { businessQuerySchema } from "../validators/customerSchemas.js";

const router = Router();

router.get("/business-categories", asyncRoute(listBusinessCategories));
router.get("/businesses", validateQuery(businessQuerySchema), asyncRoute(listBusinesses));

export default router;

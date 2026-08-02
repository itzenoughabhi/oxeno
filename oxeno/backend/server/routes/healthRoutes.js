import { Router } from "express";
import { getHealth } from "../controllers/healthController.js";
import { asyncRoute } from "../middleware/asyncRoute.js";

const router = Router();

router.get("/", asyncRoute(getHealth));

export default router;

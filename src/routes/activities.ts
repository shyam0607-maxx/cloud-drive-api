import { Router } from "express";
import { activitiesController } from "../controllers/activitiesController";
import { authMiddleware } from "../middleware/auth";
import "express-async-errors";

const router = Router();

router.get("/", authMiddleware, (req, res, next) =>
  activitiesController.getActivities(req as any, res).catch(next)
);

export default router;

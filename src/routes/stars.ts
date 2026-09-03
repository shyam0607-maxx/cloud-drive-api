import { Router } from "express";
import { starsController } from "../controllers/starsController";
import { authMiddleware } from "../middleware/auth";
import "express-async-errors";

const router = Router();

router.post("/", authMiddleware, (req, res, next) =>
  starsController.createStar(req as any, res).catch(next)
);

router.delete("/", authMiddleware, (req, res, next) =>
  starsController.deleteStar(req as any, res).catch(next)
);

router.get("/", authMiddleware, (req, res, next) =>
  starsController.getStarred(req as any, res).catch(next)
);

export default router;

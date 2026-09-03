import { Router } from "express";
import { trashController } from "../controllers/trashController";
import { authMiddleware } from "../middleware/auth";
import "express-async-errors";

const router = Router();

router.get("/", authMiddleware, (req, res, next) =>
  trashController.getTrash(req as any, res).catch(next)
);

router.post("/restore", authMiddleware, (req, res, next) =>
  trashController.restoreItem(req as any, res).catch(next)
);

export default router;

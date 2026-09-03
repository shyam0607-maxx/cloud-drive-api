import { Router } from "express";
import { fileController } from "../controllers/fileController";
import { authMiddleware } from "../middleware/auth";
import "express-async-errors";

const router = Router();

router.get("/", authMiddleware, (req, res, next) =>
  fileController.search(req as any, res).catch(next)
);

export default router;

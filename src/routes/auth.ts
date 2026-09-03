import { Router } from "express";
import { authController } from "../controllers/authController";
import { authMiddleware } from "../middleware/auth";
import "express-async-errors";

const router = Router();

router.post("/register", (req, res, next) =>
  authController.register(req as any, res).catch(next)
);

router.post("/login", (req, res, next) =>
  authController.login(req as any, res).catch(next)
);

router.get("/me", authMiddleware, (req, res, next) =>
  authController.getMe(req as any, res).catch(next)
);

router.post("/logout", authMiddleware, (req, res, next) =>
  authController.logout(req as any, res).catch(next)
);

export default router;

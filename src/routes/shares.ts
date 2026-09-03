import { Router } from "express";
import { shareController } from "../controllers/shareController";
import { authMiddleware } from "../middleware/auth";
import "express-async-errors";

const router = Router();

router.post("/", authMiddleware, (req, res, next) =>
  shareController.createShare(req as any, res).catch(next)
);

router.get("/:resourceType/:resourceId", (req, res, next) =>
  shareController.getShares(req as any, res).catch(next)
);

router.delete("/:shareId", authMiddleware, (req, res, next) =>
  shareController.deleteShare(req as any, res).catch(next)
);

router.post("/link/create", authMiddleware, (req, res, next) =>
  shareController.createLinkShare(req as any, res).catch(next)
);

router.post("/link/access", (req, res, next) =>
  shareController.accessLinkShare(req as any, res).catch(next)
);

router.delete("/link/:linkShareId", authMiddleware, (req, res, next) =>
  shareController.deleteLinkShare(req as any, res).catch(next)
);

export default router;

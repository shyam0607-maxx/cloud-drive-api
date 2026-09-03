import { Router } from "express";
import { folderController } from "../controllers/folderController";
import { authMiddleware } from "../middleware/auth";
import "express-async-errors";

const router = Router();

router.post("/", authMiddleware, (req, res, next) =>
  folderController.create(req as any, res).catch(next)
);

router.get("/", authMiddleware, (req, res, next) =>
  folderController.listContents(req as any, res).catch(next)
);

router.get("/:folderId", authMiddleware, (req, res, next) =>
  folderController.getFolder(req as any, res).catch(next)
);

router.patch("/:folderId/rename", authMiddleware, (req, res, next) =>
  folderController.rename(req as any, res).catch(next)
);

router.patch("/:folderId/move", authMiddleware, (req, res, next) =>
  folderController.move(req as any, res).catch(next)
);

router.delete("/:folderId", authMiddleware, (req, res, next) =>
  folderController.delete(req as any, res).catch(next)
);

router.post("/:folderId/restore", authMiddleware, (req, res, next) =>
  folderController.restore(req as any, res).catch(next)
);

router.get("/:folderId/breadcrumbs", (req, res, next) =>
  folderController.getBreadcrumbs(req as any, res).catch(next)
);

export default router;

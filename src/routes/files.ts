import { Router } from "express";
import { fileController } from "../controllers/fileController";
import { authMiddleware } from "../middleware/auth";
import "express-async-errors";

const router = Router();

router.post("/init", authMiddleware, (req, res, next) =>
  fileController.initUpload(req as any, res).catch(next)
);

router.post("/complete", authMiddleware, (req, res, next) =>
  fileController.completeUpload(req as any, res).catch(next)
);

router.get("/:fileId", authMiddleware, (req, res, next) =>
  fileController.getFile(req as any, res).catch(next)
);

router.get("/:fileId/download", authMiddleware, (req, res, next) =>
  fileController.download(req as any, res).catch(next)
);

router.patch("/:fileId/rename", authMiddleware, (req, res, next) =>
  fileController.rename(req as any, res).catch(next)
);

router.patch("/:fileId/move", authMiddleware, (req, res, next) =>
  fileController.move(req as any, res).catch(next)
);

router.delete("/:fileId", authMiddleware, (req, res, next) =>
  fileController.delete(req as any, res).catch(next)
);

router.post("/:fileId/restore", authMiddleware, (req, res, next) =>
  fileController.restore(req as any, res).catch(next)
);

export default router;

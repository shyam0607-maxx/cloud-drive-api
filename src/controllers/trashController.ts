import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { trashService } from "../services/trashService";

export class TrashController {
  async getTrash(req: AuthRequest, res: Response) {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });

    const items = await trashService.getTrashItems(req.userId);
    res.json({ items });
  }

  async restoreItem(req: AuthRequest, res: Response) {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });

    const { resourceType, resourceId } = req.body;

    if (!resourceType || !resourceId) {
      return res.status(400).json({
        error: { code: "INVALID_INPUT", message: "Missing resourceType or resourceId" },
      });
    }

    await trashService.restoreItem(req.userId, resourceType, resourceId);
    res.json({ success: true });
  }
}

export const trashController = new TrashController();

import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { starService } from "../services/starService";

export class StarsController {
  async createStar(req: AuthRequest, res: Response) {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });

    const { resourceType, resourceId } = req.body;

    if (!resourceType || !resourceId) {
      return res.status(400).json({
        error: { code: "INVALID_INPUT", message: "Missing required fields" },
      });
    }

    await starService.starItem(req.userId, resourceType, resourceId);
    res.json({ success: true });
  }

  async deleteStar(req: AuthRequest, res: Response) {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });

    const { resourceType, resourceId } = req.body;

    if (!resourceType || !resourceId) {
      return res.status(400).json({
        error: { code: "INVALID_INPUT", message: "Missing required fields" },
      });
    }

    await starService.unstarItem(req.userId, resourceType, resourceId);
    res.json({ success: true });
  }

  async getStarred(req: AuthRequest, res: Response) {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });

    const items = await starService.getStarredItems(req.userId);
    res.json(items);
  }
}

export const starsController = new StarsController();

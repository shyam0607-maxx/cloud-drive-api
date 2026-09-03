import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { shareService } from "../services/shareService";
import {
  createShareSchema,
  createLinkShareSchema,
  accessLinkShareSchema,
} from "../validators/resources";

export class ShareController {
  async createShare(req: AuthRequest, res: Response) {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });

    const input = createShareSchema.parse(req.body);
    const share = await shareService.createShare(req.userId, input);

    res.status(201).json({ share });
  }

  async getShares(req: AuthRequest, res: Response) {
    const { resourceType, resourceId } = req.params;
    const shares = await shareService.getShares(
      resourceType as "file" | "folder",
      resourceId
    );

    res.json({ shares });
  }

  async deleteShare(req: AuthRequest, res: Response) {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });

    const { shareId } = req.params;
    await shareService.deleteShare(req.userId, shareId);

    res.status(204).send();
  }

  async createLinkShare(req: AuthRequest, res: Response) {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });

    const input = createLinkShareSchema.parse(req.body);
    const link = await shareService.createLinkShare(req.userId, input);

    res.status(201).json({ link });
  }

  async accessLinkShare(req: AuthRequest, res: Response) {
    const input = accessLinkShareSchema.parse(req.body);
    const result = await shareService.accessLinkShare(input);

    res.json(result);
  }

  async deleteLinkShare(req: AuthRequest, res: Response) {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });

    const { linkShareId } = req.params;
    await shareService.deleteLinkShare(req.userId, linkShareId);

    res.status(204).send();
  }
}

export const shareController = new ShareController();

import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { folderService } from "../services/folderService";
import {
  createFolderSchema,
  renameFolderSchema,
  moveFolderSchema,
} from "../validators/resources";

export class FolderController {
  async create(req: AuthRequest, res: Response) {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });

    const input = createFolderSchema.parse(req.body);
    const folder = await folderService.create(req.userId, input);

    res.status(201).json({ folder });
  }

  async getFolder(req: AuthRequest, res: Response) {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });

    const { folderId } = req.params;
    const folder = await folderService.getFolder(req.userId, folderId);

    res.json({ folder });
  }

  async listContents(req: AuthRequest, res: Response) {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });

    const { folderId } = req.query;
    const contents = await folderService.getFolderContents(
      req.userId,
      (folderId as string) || null
    );

    res.json(contents);
  }

  async rename(req: AuthRequest, res: Response) {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });

    const { folderId } = req.params;
    const input = renameFolderSchema.parse(req.body);
    const folder = await folderService.rename(req.userId, folderId, input);

    res.json({ folder });
  }

  async move(req: AuthRequest, res: Response) {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });

    const { folderId } = req.params;
    const input = moveFolderSchema.parse(req.body);
    const folder = await folderService.move(req.userId, folderId, input);

    res.json({ folder });
  }

  async delete(req: AuthRequest, res: Response) {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });

    const { folderId } = req.params;
    await folderService.delete(req.userId, folderId);

    res.status(204).send();
  }

  async restore(req: AuthRequest, res: Response) {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });

    const { folderId } = req.params;
    const folder = await folderService.restore(req.userId, folderId);

    res.json({ folder });
  }

  async getBreadcrumbs(req: AuthRequest, res: Response) {
    const { folderId } = req.params;
    const breadcrumbs = await folderService.getBreadcrumbs(folderId);

    res.json({ breadcrumbs });
  }
}

export const folderController = new FolderController();

import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { fileService } from "../services/fileService";
import { supabase } from "../config/supabase";
import {
  uploadInitSchema,
  uploadCompleteSchema,
  renameFileSchema,
  moveFileSchema,
} from "../validators/resources";

export class FileController {
  async initUpload(req: AuthRequest, res: Response) {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });

    const input = uploadInitSchema.parse(req.body);
    const result = await fileService.initUpload(req.userId, input);

    res.status(201).json(result);
  }

  async completeUpload(req: AuthRequest, res: Response) {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });

    const input = uploadCompleteSchema.parse(req.body);
    const file = await fileService.completeUpload(req.userId, input);

    res.json({ file });
  }

  async getFile(req: AuthRequest, res: Response) {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });

    const { fileId } = req.params;
    const file = await fileService.getFile(req.userId, fileId);

    res.json({ file });
  }

  async download(req: AuthRequest, res: Response) {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });

    const { fileId } = req.params;
    const result = await fileService.downloadFile(req.userId, fileId);

    res.json(result);
  }

  async rename(req: AuthRequest, res: Response) {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });

    const { fileId } = req.params;
    const input = renameFileSchema.parse(req.body);
    const file = await fileService.rename(req.userId, fileId, input);

    res.json({ file });
  }

  async move(req: AuthRequest, res: Response) {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });

    const { fileId } = req.params;
    const input = moveFileSchema.parse(req.body);
    const file = await fileService.move(req.userId, fileId, input);

    res.json({ file });
  }

  async delete(req: AuthRequest, res: Response) {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });

    const { fileId } = req.params;
    await fileService.delete(req.userId, fileId);

    res.status(204).send();
  }

  async restore(req: AuthRequest, res: Response) {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });

    const { fileId } = req.params;
    const file = await fileService.restore(req.userId, fileId);

    res.json({ file });
  }

  async search(req: AuthRequest, res: Response) {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });

    const query = (req.query.q as string) || "";
    const type = req.query.type as string;
    const starred = req.query.starred === "true";
    const shared = req.query.shared === "true";

    try {
      let filesQuery = supabase
        .from("files")
        .select("*")
        .eq("owner_id", req.userId)
        .eq("is_deleted", false);

      let foldersQuery = supabase
        .from("folders")
        .select("*")
        .eq("owner_id", req.userId)
        .eq("is_deleted", false);

      if (query) {
        filesQuery = filesQuery.ilike("name", `%${query}%`);
        foldersQuery = foldersQuery.ilike("name", `%${query}%`);
      }

      if (starred) {
        const { data: starredIds } = await supabase
          .from("stars")
          .select("resource_id")
          .eq("user_id", req.userId);

        const ids = starredIds?.map((s) => s.resource_id) || [];
        if (ids.length > 0) {
          filesQuery = filesQuery.in("id", ids);
          foldersQuery = foldersQuery.in("id", ids);
        } else {
          filesQuery = filesQuery.eq("id", "null");
          foldersQuery = foldersQuery.eq("id", "null");
        }
      }

      if (shared) {
        const { data: shares } = await supabase
          .from("shares")
          .select("resource_id")
          .eq("grantee_user_id", req.userId);

        const sharedIds = shares?.map((s) => s.resource_id) || [];
        if (sharedIds.length > 0) {
          filesQuery = filesQuery.in("id", sharedIds);
          foldersQuery = foldersQuery.in("id", sharedIds);
        } else {
          filesQuery = filesQuery.eq("id", "null");
          foldersQuery = foldersQuery.eq("id", "null");
        }
      }

      if (type === "file") {
        const { data } = await filesQuery;
        res.json({ files: data || [], folders: [] });
      } else if (type === "folder") {
        const { data } = await foldersQuery;
        res.json({ files: [], folders: data || [] });
      } else {
        const [filesResult, foldersResult] = await Promise.all([
          filesQuery,
          foldersQuery,
        ]);
        res.json({
          files: filesResult.data || [],
          folders: foldersResult.data || [],
        });
      }
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ error: "Failed to search" });
    }
  }
}

export const fileController = new FileController();

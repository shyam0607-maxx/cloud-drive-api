import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { supabase } from "../config/supabase";

export class ActivitiesController {
  async getActivities(req: AuthRequest, res: Response) {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });

    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    const { data, error } = await supabase
      .from("activities")
      .select("id, actor_id, action, resource_type, resource_id, context, created_at")
      .eq("actor_id", req.userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json({ activities: data || [] });
  }
}

export const activitiesController = new ActivitiesController();

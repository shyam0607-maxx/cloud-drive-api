import { supabase } from "../config/supabase";
import { Activity } from "../types";
import { v4 as uuidv4 } from "uuid";

export class ActivityRepository {
  async create(
    actorId: string,
    action: "upload" | "rename" | "delete" | "restore" | "move" | "share" | "download",
    resourceType: "file" | "folder",
    resourceId: string,
    context: Record<string, any> = {}
  ): Promise<Activity> {
    const id = uuidv4();

    const { data, error } = await supabase
      .from("activities")
      .insert({
        id,
        actor_id: actorId,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        context,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapToActivity(data);
  }

  async findByResource(
    resourceType: "file" | "folder",
    resourceId: string,
    limit = 50
  ): Promise<Activity[]> {
    const { data, error } = await supabase
      .from("activities")
      .select()
      .eq("resource_type", resourceType)
      .eq("resource_id", resourceId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).map((activity) => this.mapToActivity(activity));
  }

  async findByUser(userId: string, limit = 50): Promise<Activity[]> {
    const { data, error } = await supabase
      .from("activities")
      .select()
      .eq("actor_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).map((activity) => this.mapToActivity(activity));
  }

  async findRecent(limit = 50): Promise<Activity[]> {
    const { data, error } = await supabase
      .from("activities")
      .select()
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).map((activity) => this.mapToActivity(activity));
  }

  private mapToActivity(data: any): Activity {
    return {
      id: data.id,
      actorId: data.actor_id,
      action: data.action,
      resourceType: data.resource_type,
      resourceId: data.resource_id,
      context: data.context || {},
      createdAt: new Date(data.created_at),
    };
  }
}

export const activityRepository = new ActivityRepository();

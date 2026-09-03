import { supabase } from "../config/supabase";
import { Star } from "../types";

export class StarRepository {
  async create(
    userId: string,
    resourceType: "file" | "folder",
    resourceId: string
  ): Promise<Star> {
    const { data, error } = await supabase
      .from("stars")
      .insert({
        user_id: userId,
        resource_type: resourceType,
        resource_id: resourceId,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapToStar(data);
  }

  async findByUser(userId: string): Promise<Star[]> {
    const { data, error } = await supabase
      .from("stars")
      .select()
      .eq("user_id", userId);

    if (error) throw error;
    return (data || []).map((star) => this.mapToStar(star));
  }

  async findByUserAndResource(
    userId: string,
    resourceType: "file" | "folder",
    resourceId: string
  ): Promise<Star | null> {
    const { data, error } = await supabase
      .from("stars")
      .select()
      .eq("user_id", userId)
      .eq("resource_type", resourceType)
      .eq("resource_id", resourceId)
      .single();

    if (error || !data) return null;
    return this.mapToStar(data);
  }

  async delete(
    userId: string,
    resourceType: "file" | "folder",
    resourceId: string
  ): Promise<void> {
    const { error } = await supabase
      .from("stars")
      .delete()
      .eq("user_id", userId)
      .eq("resource_type", resourceType)
      .eq("resource_id", resourceId);

    if (error) throw error;
  }

  async deleteByResource(
    resourceType: "file" | "folder",
    resourceId: string
  ): Promise<void> {
    const { error } = await supabase
      .from("stars")
      .delete()
      .eq("resource_type", resourceType)
      .eq("resource_id", resourceId);

    if (error) throw error;
  }

  private mapToStar(data: any): Star {
    return {
      userId: data.user_id,
      resourceType: data.resource_type,
      resourceId: data.resource_id,
    };
  }
}

export const starRepository = new StarRepository();

import { supabase } from "../config/supabase";
import { Share } from "../types";
import { v4 as uuidv4 } from "uuid";

export class ShareRepository {
  async create(
    resourceType: "file" | "folder",
    resourceId: string,
    granteeUserId: string,
    role: "viewer" | "editor",
    createdBy: string
  ): Promise<Share> {
    const id = uuidv4();

    const { data, error } = await supabase
      .from("shares")
      .insert({
        id,
        resource_type: resourceType,
        resource_id: resourceId,
        grantee_user_id: granteeUserId,
        role,
        created_by: createdBy,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapToShare(data);
  }

  async findById(id: string): Promise<Share | null> {
    const { data, error } = await supabase
      .from("shares")
      .select()
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return this.mapToShare(data);
  }

  async findByResource(
    resourceType: "file" | "folder",
    resourceId: string
  ): Promise<Share[]> {
    const { data, error } = await supabase
      .from("shares")
      .select()
      .eq("resource_type", resourceType)
      .eq("resource_id", resourceId);

    if (error) throw error;
    return (data || []).map((share) => this.mapToShare(share));
  }

  async findByGrantee(granteeUserId: string): Promise<Share[]> {
    const { data, error } = await supabase
      .from("shares")
      .select()
      .eq("grantee_user_id", granteeUserId);

    if (error) throw error;
    return (data || []).map((share) => this.mapToShare(share));
  }

  async findByResourceAndGrantee(
    resourceType: "file" | "folder",
    resourceId: string,
    granteeUserId: string
  ): Promise<Share | null> {
    const { data, error } = await supabase
      .from("shares")
      .select()
      .eq("resource_type", resourceType)
      .eq("resource_id", resourceId)
      .eq("grantee_user_id", granteeUserId)
      .single();

    if (error || !data) return null;
    return this.mapToShare(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("shares").delete().eq("id", id);

    if (error) throw error;
  }

  async deleteByResource(
    resourceType: "file" | "folder",
    resourceId: string
  ): Promise<void> {
    const { error } = await supabase
      .from("shares")
      .delete()
      .eq("resource_type", resourceType)
      .eq("resource_id", resourceId);

    if (error) throw error;
  }

  private mapToShare(data: any): Share {
    return {
      id: data.id,
      resourceType: data.resource_type,
      resourceId: data.resource_id,
      granteeUserId: data.grantee_user_id,
      role: data.role,
      createdBy: data.created_by,
      createdAt: new Date(data.created_at),
    };
  }
}

export const shareRepository = new ShareRepository();

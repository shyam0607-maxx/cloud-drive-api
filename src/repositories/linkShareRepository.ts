import { supabase } from "../config/supabase";
import { LinkShare } from "../types";
import { v4 as uuidv4 } from "uuid";

export class LinkShareRepository {
  async create(
    resourceType: "file" | "folder",
    resourceId: string,
    token: string,
    role: "viewer",
    passwordHash: string | null,
    expiresAt: Date | null,
    createdBy: string
  ): Promise<LinkShare> {
    const id = uuidv4();

    const { data, error } = await supabase
      .from("link_shares")
      .insert({
        id,
        resource_type: resourceType,
        resource_id: resourceId,
        token,
        role,
        password_hash: passwordHash,
        expires_at: expiresAt?.toISOString() || null,
        created_by: createdBy,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapToLinkShare(data);
  }

  async findById(id: string): Promise<LinkShare | null> {
    const { data, error } = await supabase
      .from("link_shares")
      .select()
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return this.mapToLinkShare(data);
  }

  async findByToken(token: string): Promise<LinkShare | null> {
    const { data, error } = await supabase
      .from("link_shares")
      .select()
      .eq("token", token)
      .single();

    if (error || !data) return null;
    return this.mapToLinkShare(data);
  }

  async findByResource(
    resourceType: "file" | "folder",
    resourceId: string
  ): Promise<LinkShare[]> {
    const { data, error } = await supabase
      .from("link_shares")
      .select()
      .eq("resource_type", resourceType)
      .eq("resource_id", resourceId);

    if (error) throw error;
    return (data || []).map((share) => this.mapToLinkShare(share));
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("link_shares")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  async deleteByResource(
    resourceType: "file" | "folder",
    resourceId: string
  ): Promise<void> {
    const { error } = await supabase
      .from("link_shares")
      .delete()
      .eq("resource_type", resourceType)
      .eq("resource_id", resourceId);

    if (error) throw error;
  }

  private mapToLinkShare(data: any): LinkShare {
    return {
      id: data.id,
      resourceType: data.resource_type,
      resourceId: data.resource_id,
      token: data.token,
      role: data.role,
      passwordHash: data.password_hash,
      expiresAt: data.expires_at ? new Date(data.expires_at) : null,
      createdBy: data.created_by,
      createdAt: new Date(data.created_at),
    };
  }
}

export const linkShareRepository = new LinkShareRepository();

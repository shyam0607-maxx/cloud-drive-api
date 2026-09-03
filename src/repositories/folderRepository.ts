import { supabase } from "../config/supabase";
import { Folder } from "../types";
import { v4 as uuidv4 } from "uuid";

export class FolderRepository {
  async create(
    name: string,
    ownerId: string,
    parentId: string | null = null
  ): Promise<Folder> {
    const id = uuidv4();

    const { data, error } = await supabase
      .from("folders")
      .insert({
        id,
        name,
        owner_id: ownerId,
        parent_id: parentId,
      })
      .select()
      .single();

    if (error) throw error;

    return this.mapToFolder(data);
  }

  async findById(id: string): Promise<Folder | null> {
    const { data, error } = await supabase
      .from("folders")
      .select()
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return this.mapToFolder(data);
  }

  async findByIdIncludingDeleted(id: string): Promise<Folder | null> {
    const { data, error } = await supabase
      .from("folders")
      .select()
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return this.mapToFolder(data);
  }

  async findChildren(parentId: string | null, ownerId: string): Promise<Folder[]> {
    const query = supabase
      .from("folders")
      .select()
      .eq("owner_id", ownerId)
      .eq("is_deleted", false);

    if (parentId) {
      query.eq("parent_id", parentId);
    } else {
      query.is("parent_id", null);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []).map((folder) => this.mapToFolder(folder));
  }

  async getAncestors(folderId: string): Promise<Folder[]> {
    const ancestors: Folder[] = [];
    let currentId: string | null = folderId;

    while (currentId) {
      const folder = await this.findById(currentId);
      if (!folder) break;
      ancestors.unshift(folder);
      currentId = folder.parentId;
    }

    return ancestors;
  }

  async checkIfDescendant(
    ancestorId: string,
    potentialDescendantId: string
  ): Promise<boolean> {
    const ancestors = await this.getAncestors(potentialDescendantId);
    return ancestors.some((f) => f.id === ancestorId);
  }

  async rename(id: string, name: string): Promise<Folder> {
    const { data, error } = await supabase
      .from("folders")
      .update({ name, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return this.mapToFolder(data);
  }

  async move(id: string, parentId: string | null): Promise<Folder> {
    const { data, error } = await supabase
      .from("folders")
      .update({ parent_id: parentId, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return this.mapToFolder(data);
  }

  async softDelete(id: string): Promise<void> {
    const { error } = await supabase
      .from("folders")
      .update({ is_deleted: true, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
  }

  async restore(id: string): Promise<Folder> {
    const { data, error } = await supabase
      .from("folders")
      .update({ is_deleted: false, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return this.mapToFolder(data);
  }

  async permanentDelete(id: string): Promise<void> {
    const { error } = await supabase.from("folders").delete().eq("id", id);

    if (error) throw error;
  }

  async getDeletedFolders(ownerId: string): Promise<Folder[]> {
    const { data, error } = await supabase
      .from("folders")
      .select()
      .eq("owner_id", ownerId)
      .eq("is_deleted", true)
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return (data || []).map((folder) => this.mapToFolder(folder));
  }

  private mapToFolder(data: any): Folder {
    return {
      id: data.id,
      name: data.name,
      ownerId: data.owner_id,
      parentId: data.parent_id,
      isDeleted: data.is_deleted,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}

export const folderRepository = new FolderRepository();

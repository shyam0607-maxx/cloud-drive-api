import { supabase } from "../config/supabase";
import { File } from "../types";
import { v4 as uuidv4 } from "uuid";

export class FileRepository {
  async create(
    name: string,
    mimeType: string,
    sizeBytes: number,
    storageKey: string,
    ownerId: string,
    folderId: string | null = null
  ): Promise<File> {
    const id = uuidv4();

    const { data, error } = await supabase
      .from("files")
      .insert({
        id,
        name,
        mime_type: mimeType,
        size_bytes: sizeBytes,
        storage_key: storageKey,
        owner_id: ownerId,
        folder_id: folderId,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapToFile(data);
  }

  async findById(id: string): Promise<File | null> {
    const { data, error } = await supabase
      .from("files")
      .select()
      .eq("id", id)
      .eq("is_deleted", false)
      .single();

    if (error || !data) return null;
    return this.mapToFile(data);
  }

  async findByIdIncludingDeleted(id: string): Promise<File | null> {
    const { data, error } = await supabase
      .from("files")
      .select()
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return this.mapToFile(data);
  }

  async findByFolder(folderId: string | null, ownerId: string): Promise<File[]> {
    const query = supabase
      .from("files")
      .select()
      .eq("owner_id", ownerId)
      .eq("is_deleted", false);

    if (folderId) {
      query.eq("folder_id", folderId);
    } else {
      query.is("folder_id", null);
    }

    const { data, error } = await query.order("name", { ascending: true });

    if (error) throw error;
    return (data || []).map((file) => this.mapToFile(file));
  }

  async findByOwner(ownerId: string, limit = 100): Promise<File[]> {
    const { data, error } = await supabase
      .from("files")
      .select()
      .eq("owner_id", ownerId)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).map((file) => this.mapToFile(file));
  }

  async rename(id: string, name: string): Promise<File> {
    const { data, error } = await supabase
      .from("files")
      .update({ name, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return this.mapToFile(data);
  }

  async move(id: string, folderId: string | null): Promise<File> {
    const { data, error } = await supabase
      .from("files")
      .update({ folder_id: folderId, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return this.mapToFile(data);
  }

  async softDelete(id: string): Promise<void> {
    const { error } = await supabase
      .from("files")
      .update({ is_deleted: true, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
  }

  async restore(id: string): Promise<File> {
    const { data, error } = await supabase
      .from("files")
      .update({ is_deleted: false, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return this.mapToFile(data);
  }

  async permanentDelete(id: string): Promise<void> {
    const { error } = await supabase.from("files").delete().eq("id", id);

    if (error) throw error;
  }

  async getDeletedFiles(ownerId: string): Promise<File[]> {
    const { data, error } = await supabase
      .from("files")
      .select()
      .eq("owner_id", ownerId)
      .eq("is_deleted", true)
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return (data || []).map((file) => this.mapToFile(file));
  }

  async search(
    ownerId: string,
    query: string,
    limit = 50
  ): Promise<File[]> {
    const { data, error } = await supabase
      .from("files")
      .select()
      .eq("owner_id", ownerId)
      .eq("is_deleted", false)
      .ilike("name", `%${query}%`)
      .order("name", { ascending: true })
      .limit(limit);

    if (error) throw error;
    return (data || []).map((file) => this.mapToFile(file));
  }

  private mapToFile(data: any): File {
    return {
      id: data.id,
      name: data.name,
      mimeType: data.mime_type,
      sizeBytes: data.size_bytes,
      storageKey: data.storage_key,
      ownerId: data.owner_id,
      folderId: data.folder_id,
      versionId: data.version_id,
      checksum: data.checksum,
      isDeleted: data.is_deleted,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}

export const fileRepository = new FileRepository();

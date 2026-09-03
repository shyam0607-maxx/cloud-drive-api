import { supabase } from "../config/supabase";
import { FileVersion } from "../types";
import { v4 as uuidv4 } from "uuid";

export class FileVersionRepository {
  async create(
    fileId: string,
    versionNumber: number,
    storageKey: string,
    sizeBytes: number,
    checksum: string | null = null
  ): Promise<FileVersion> {
    const id = uuidv4();

    const { data, error } = await supabase
      .from("file_versions")
      .insert({
        id,
        file_id: fileId,
        version_number: versionNumber,
        storage_key: storageKey,
        size_bytes: sizeBytes,
        checksum,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapToFileVersion(data);
  }

  async findByFile(fileId: string): Promise<FileVersion[]> {
    const { data, error } = await supabase
      .from("file_versions")
      .select()
      .eq("file_id", fileId)
      .order("version_number", { ascending: false });

    if (error) throw error;
    return (data || []).map((version) => this.mapToFileVersion(version));
  }

  async findByFileAndVersion(
    fileId: string,
    versionNumber: number
  ): Promise<FileVersion | null> {
    const { data, error } = await supabase
      .from("file_versions")
      .select()
      .eq("file_id", fileId)
      .eq("version_number", versionNumber)
      .single();

    if (error || !data) return null;
    return this.mapToFileVersion(data);
  }

  async findLatestVersion(fileId: string): Promise<FileVersion | null> {
    const { data, error } = await supabase
      .from("file_versions")
      .select()
      .eq("file_id", fileId)
      .order("version_number", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return null;
    return this.mapToFileVersion(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("file_versions")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  private mapToFileVersion(data: any): FileVersion {
    return {
      id: data.id,
      fileId: data.file_id,
      versionNumber: data.version_number,
      storageKey: data.storage_key,
      sizeBytes: data.size_bytes,
      checksum: data.checksum,
      createdAt: new Date(data.created_at),
    };
  }
}

export const fileVersionRepository = new FileVersionRepository();

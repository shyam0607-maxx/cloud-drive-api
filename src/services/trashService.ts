import { supabase } from "../config/supabase";

export const trashService = {
  async getTrashItems(userId: string) {
    try {
      const { data: files } = await supabase
        .from("files")
        .select("id, name, size_bytes, updated_at")
        .eq("owner_id", userId)
        .eq("is_deleted", true)
        .order("updated_at", { ascending: false });

      const { data: folders } = await supabase
        .from("folders")
        .select("id, name, updated_at")
        .eq("owner_id", userId)
        .eq("is_deleted", true)
        .order("updated_at", { ascending: false });

      return [
        ...(files?.map((f) => ({
          id: f.id,
          name: f.name,
          type: "file",
          sizeBytes: f.size_bytes,
          updatedAt: f.updated_at,
        })) || []),
        ...(folders?.map((f) => ({
          id: f.id,
          name: f.name,
          type: "folder",
          updatedAt: f.updated_at,
        })) || []),
      ];
    } catch (error) {
      console.error("Get trash items error:", error);
      throw error;
    }
  },

  async restoreItem(userId: string, resourceType: string, resourceId: string) {
    try {
      const table = resourceType === "file" ? "files" : "folders";
      await supabase
        .from(table)
        .update({ is_deleted: false })
        .eq("id", resourceId)
        .eq("owner_id", userId);

      await supabase.from("activities").insert({
        actor_id: userId,
        action: "restore",
        resource_type: resourceType,
        resource_id: resourceId,
      });
    } catch (error) {
      console.error("Restore item error:", error);
      throw error;
    }
  },
};

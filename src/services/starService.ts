import { supabase } from "../config/supabase";

export const starService = {
  async starItem(userId: string, resourceType: string, resourceId: string) {
    try {
      await supabase.from("stars").insert({
        user_id: userId,
        resource_type: resourceType,
        resource_id: resourceId,
      });

      await supabase.from("activities").insert({
        actor_id: userId,
        action: "share",
        resource_type: resourceType,
        resource_id: resourceId,
      });
    } catch (error) {
      console.error("Star item error:", error);
      throw error;
    }
  },

  async unstarItem(userId: string, resourceType: string, resourceId: string) {
    try {
      await supabase
        .from("stars")
        .delete()
        .eq("user_id", userId)
        .eq("resource_type", resourceType)
        .eq("resource_id", resourceId);
    } catch (error) {
      console.error("Unstar item error:", error);
      throw error;
    }
  },
};

import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { sendSocialNotification, sendAppUpdateNotification } from "@/lib/notifications";

/**
 * Global hook that listens for:
 * 1. New social notifications (likes, comments, follows, etc.)
 * 2. New app updates
 * and triggers push notifications on the user's device.
 */
export function usePushNotificationListener() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Listen for social notifications
    const socialChannel = supabase
      .channel("push-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          const notification = payload.new as any;
          if (!notification) return;

          const { data: profile } = await supabase
            .from("profiles")
            .select("display_name")
            .eq("user_id", notification.from_user_id)
            .single();

          const fromName = profile?.display_name || "Alguém";

          sendSocialNotification(
            fromName,
            notification.type,
            notification.comment_text || undefined
          );
        }
      )
      .subscribe();

    // Listen for new app updates
    const updatesChannel = supabase
      .channel("push-app-updates")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "app_updates",
        },
        (payload) => {
          const update = payload.new as any;
          if (!update) return;
          sendAppUpdateNotification(update.title, update.description);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(socialChannel);
      supabase.removeChannel(updatesChannel);
    };
  }, [user]);
}

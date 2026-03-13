import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { sendSocialNotification } from "@/lib/notifications";

/**
 * Global hook that listens for new notifications in realtime
 * and triggers push notifications on the user's device.
 */
export function usePushNotificationListener() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
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

          // Fetch the sender's name
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

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
}

import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { sendSocialNotification, sendAppUpdateNotification } from "@/lib/notifications";
import { toast } from "sonner";

/**
 * Global hook that listens for:
 * 1. New social notifications (likes, comments, follows, etc.)
 * 2. New app updates
 * and triggers push notifications + in-app toasts.
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

    // Listen for new app updates — push + in-app toast
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

          // Push notification
          sendAppUpdateNotification(update.title, update.description);

          // In-app toast
          toast(`🎁 ${update.title}`, {
            description: update.description,
            duration: 8000,
            action: {
              label: "Ver",
              onClick: () => {
                // Trigger updates modal via global event
                window.dispatchEvent(new CustomEvent("glowup:show-updates"));
              },
            },
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(socialChannel);
      supabase.removeChannel(updatesChannel);
    };
  }, [user]);
}

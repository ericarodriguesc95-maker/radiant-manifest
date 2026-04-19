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
            .from("profiles_public" as any)
            .select("display_name")
            .eq("user_id", notification.from_user_id)
            .single();

          const fromName = (profile as any)?.display_name || "Alguém";

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
            description: `${update.description}\n\nAtualizando o app...`,
            duration: 6000,
            action: {
              label: "Ver agora",
              onClick: () => {
                window.dispatchEvent(new CustomEvent("glowup:show-updates"));
              },
            },
          });

          // Auto-reload app after 6s so user sees the toast,
          // then gets the freshest version with the new feature.
          // Guard against multiple reloads in the same session.
          const RELOAD_KEY = "glowup-last-auto-reload";
          const lastReload = parseInt(sessionStorage.getItem(RELOAD_KEY) || "0");
          if (Date.now() - lastReload > 30_000) {
            sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
            setTimeout(() => {
              window.location.reload();
            }, 6000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(socialChannel);
      supabase.removeChannel(updatesChannel);
    };
  }, [user]);
}

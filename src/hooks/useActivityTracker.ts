import { useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const PAGE_NAMES: Record<string, string> = {
  "/": "Home",
  "/diario": "Diário",
  "/metas": "Metas",
  "/alta-performance": "Alta Performance",
  "/financas": "Finanças",
  "/comunidade": "Comunidade",
  "/settings": "Configurações",
  "/reprogramacao": "Reprogramação Mental",
  "/guias": "Guias",
  "/jornada": "Jornada",
  "/vision-board": "Vision Board",
};

export function useActivityTracker() {
  const { user } = useAuth();
  const location = useLocation();
  const lastPage = useRef<string>("");

  const logActivity = useCallback(async (action: string, details?: string, page?: string) => {
    if (!user) return;
    try {
      await supabase.from("activity_log").insert({
        user_id: user.id,
        action,
        details: details || null,
        page: page || location.pathname,
      });
    } catch {
      // Silently fail - don't break user experience
    }
  }, [user, location.pathname]);

  // Track page navigation
  useEffect(() => {
    if (!user) return;
    const currentPath = location.pathname;
    if (currentPath === lastPage.current) return;
    lastPage.current = currentPath;

    const pageName = currentPath.startsWith("/perfil/")
      ? "Perfil"
      : PAGE_NAMES[currentPath] || currentPath;

    logActivity("page_view", pageName, currentPath);
  }, [location.pathname, user, logActivity]);

  return { logActivity };
}

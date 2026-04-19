import { useEffect, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { Sparkles, RefreshCw, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Discreet banner shown when a new build is detected via the service worker.
 * Lets the user reload immediately or dismiss for the session.
 *
 * Skipped entirely in Lovable preview / iframe contexts to avoid SW interference.
 */
export default function NewVersionBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [reloading, setReloading] = useState(false);

  // Don't run inside Lovable preview/iframe — SW only works in production deploy
  const isInIframe = (() => {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  })();
  const isPreviewHost =
    typeof window !== "undefined" &&
    (window.location.hostname.includes("id-preview--") ||
      window.location.hostname.includes("lovableproject.com"));

  const skip = isInIframe || isPreviewHost;

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: !skip,
    onRegisteredSW(swUrl, registration) {
      if (skip || !registration) return;
      // Poll for SW updates every 5 minutes
      setInterval(() => {
        registration.update().catch(() => {});
      }, 5 * 60 * 1000);
    },
  });

  // Listen to a custom event so other code (e.g. realtime app_updates) can also trigger
  useEffect(() => {
    const handler = () => setNeedRefresh(true);
    window.addEventListener("glowup:new-version", handler);
    return () => window.removeEventListener("glowup:new-version", handler);
  }, [setNeedRefresh]);

  if (skip || !needRefresh || dismissed) return null;

  const handleUpdate = async () => {
    setReloading(true);
    try {
      await updateServiceWorker(true);
    } catch {
      window.location.reload();
    }
  };

  return (
    <div
      className={cn(
        "fixed bottom-20 left-3 right-3 z-[90] sm:left-auto sm:right-4 sm:bottom-4 sm:max-w-sm",
        "animate-slide-up"
      )}
    >
      <div className="bg-card/95 backdrop-blur-xl border border-gold/40 rounded-2xl shadow-[0_8px_32px_hsl(43_72%_52%/0.25)] p-3 flex items-center gap-3">
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-gold via-amber-500 to-amber-700 flex items-center justify-center shadow-[0_0_20px_hsl(43_72%_52%/0.4)]">
          <Sparkles className="h-4 w-4 text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-heading font-bold text-foreground leading-tight">
            Nova versão disponível
          </p>
          <p className="text-[11px] font-body text-muted-foreground leading-tight mt-0.5">
            Toque para atualizar e ver as novidades ✨
          </p>
        </div>
        <button
          onClick={handleUpdate}
          disabled={reloading}
          className="flex-shrink-0 bg-gradient-to-br from-gold via-amber-500 to-amber-700 text-primary-foreground text-xs font-body font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 hover:opacity-90 active:scale-95 transition disabled:opacity-60"
        >
          <RefreshCw className={cn("h-3 w-3", reloading && "animate-spin")} />
          {reloading ? "Atualizando" : "Atualizar"}
        </button>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dispensar"
          className="flex-shrink-0 p-1 text-muted-foreground hover:text-foreground transition"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

import { Monitor, Smartphone } from "lucide-react";
import { useViewMode } from "@/contexts/ViewModeContext";
import { cn } from "@/lib/utils";

export default function ViewModeToggle() {
  const { mode, setMode } = useViewMode();

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center bg-card border border-border rounded-xl shadow-lg overflow-hidden">
      <button
        onClick={() => setMode("mobile")}
        className={cn(
          "flex items-center gap-1.5 px-3 py-2 text-xs font-body transition-all",
          mode === "mobile"
            ? "bg-gold/15 text-gold font-semibold"
            : "text-muted-foreground hover:text-foreground"
        )}
        title="Modo App (Celular)"
      >
        <Smartphone className="h-4 w-4" />
        <span className="hidden sm:inline">App</span>
      </button>
      <div className="w-px h-6 bg-border" />
      <button
        onClick={() => setMode("desktop")}
        className={cn(
          "flex items-center gap-1.5 px-3 py-2 text-xs font-body transition-all",
          mode === "desktop"
            ? "bg-gold/15 text-gold font-semibold"
            : "text-muted-foreground hover:text-foreground"
        )}
        title="Modo Site (Computador)"
      >
        <Monitor className="h-4 w-4" />
        <span className="hidden sm:inline">Site</span>
      </button>
    </div>
  );
}

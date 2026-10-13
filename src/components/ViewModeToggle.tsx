import { Monitor, Smartphone } from "lucide-react";
import { useViewMode } from "@/contexts/ViewModeContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function ViewModeToggle() {
  const { mode, setMode } = useViewMode();

  return (
    <div className="hidden lg:flex items-center bg-card border border-border rounded-lg overflow-hidden" role="group" aria-label="Modo de visualização">
      <Button variant="ghost" size="sm"
        onClick={() => setMode("mobile")}
        className={cn(
          "h-8 rounded-none gap-1.5 px-3 text-xs font-body transition-all",
          mode === "mobile"
            ? "bg-gold/15 text-gold font-semibold"
            : "text-muted-foreground hover:text-foreground"
        )}
        title="Modo App (Celular)"
        aria-pressed={mode === "mobile"}
      >
        <Smartphone className="h-4 w-4" />
        <span className="hidden sm:inline">App</span>
      </Button>
      <div className="w-px h-6 bg-border" />
      <Button variant="ghost" size="sm"
        onClick={() => setMode("desktop")}
        className={cn(
          "h-8 rounded-none gap-1.5 px-3 text-xs font-body transition-all",
          mode === "desktop"
            ? "bg-gold/15 text-gold font-semibold"
            : "text-muted-foreground hover:text-foreground"
        )}
        title="Modo Site (Computador)"
        aria-pressed={mode === "desktop"}
      >
        <Monitor className="h-4 w-4" />
        <span className="hidden sm:inline">Site</span>
      </Button>
    </div>
  );
}

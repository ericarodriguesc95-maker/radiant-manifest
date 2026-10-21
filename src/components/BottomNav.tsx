import { Link, useLocation } from "react-router-dom";
import { Home, Compass, Wallet, CalendarDays, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isNavigationActive, phaseLinks } from "@/lib/app-navigation";

export default function BottomNav() {
  const { pathname, search } = useLocation();
  const tabs = [
    { to: "/", icon: Home, label: "Início" },
    { to: "/?view=trilhas", icon: Compass, label: "Trilhas" },
    { to: "/financas", icon: Wallet, label: "Finanças" },
    { to: "/?view=agenda", icon: CalendarDays, label: "Agenda" },
    { to: "/?view=fase", icon: Sparkles, label: "Minha fase" },
  ];
  return <nav className="fixed bottom-0 inset-x-0 z-50 pb-[env(safe-area-inset-bottom)]" aria-label="Navegação principal">
    <div className="mx-auto max-w-lg px-2 pb-2"><div className="grid grid-cols-5 rounded-[22px] border border-border bg-card/95 px-1 py-1 backdrop-blur-md shadow-card">
      {tabs.map(({ to, icon: Icon, label }) => {
        const active = isNavigationActive(to, pathname, search) || (label === "Minha fase" && phaseLinks.some(x => isNavigationActive(x.to, pathname, search))) || (label === "Trilhas" && ["/metas", "/jornada", "/identidade-inabalavel", "/protocolo-14-5"].includes(pathname));
        return <Button asChild key={to} variant="ghost" className={cn("relative h-12 min-w-0 flex-col gap-1 px-0 rounded-xl text-[10px] font-medium", active ? "text-foreground" : "text-muted-foreground")}><Link to={to} aria-current={active ? "page" : undefined}><Icon strokeWidth={active ? 1.9 : 1.5} /><span>{label}</span><span className={cn("absolute bottom-0.5 h-0.5 w-4 rounded-full bg-primary", active ? "opacity-100" : "opacity-0")} /></Link></Button>;
      })}
    </div></div>
  </nav>;
}
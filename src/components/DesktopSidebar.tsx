import { Link, useLocation } from "react-router-dom";
import { Settings, PanelLeftClose, PanelLeftOpen, Heart, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useViewMode } from "@/contexts/ViewModeContext";
import { mainLinks, phaseLinks, isNavigationActive } from "@/lib/app-navigation";
import { useCurrentPhase, phaseNames } from "@/hooks/useCurrentPhase";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import StreakSidebarCard from "./StreakSidebarCard";
import brandLogo from "@/assets/gloow-up-club-logo.png";

export default function DesktopSidebar() {
  const { pathname, search } = useLocation();
  const { user } = useAuth();
  const { sidebarCollapsed: collapsed, toggleSidebar } = useViewMode();
  const phase = useCurrentPhase();
  const renderLink = ({ to, icon: Icon, label }: ReturnType<typeof mainLinks>[number]) => {
    const active = isNavigationActive(to, pathname, search) || (label === "Bíblia" && pathname === "/biblia-365");
    return <Tooltip key={to}><TooltipTrigger asChild><Button asChild variant="ghost" className={cn("sidebar-link h-10 w-full rounded-lg justify-start px-3 text-[13px] font-normal", collapsed && "justify-center px-0", active ? "sidebar-link-active text-foreground font-semibold" : "text-muted-foreground")}><Link to={to} aria-label={label} aria-current={active ? "page" : undefined}><Icon className={cn("shrink-0", active && "text-primary")} strokeWidth={1.7} />{!collapsed && <span>{label}</span>}</Link></Button></TooltipTrigger>{collapsed && <TooltipContent side="right">{label}</TooltipContent>}</Tooltip>;
  };
  return <aside aria-label="Menu lateral" className={cn("compact-sidebar fixed inset-y-0 left-0 border-r border-border z-40 flex flex-col transition-[width] duration-200", collapsed ? "w-[72px]" : "w-[248px]")}>
    <div className={cn("flex items-center gap-2 px-3 py-3 border-b border-border", collapsed && "justify-center px-1")}><Link to="/" aria-label="Gloow Up Club"><img src={brandLogo} alt="Gloow Up Club" className="h-10 w-10 object-contain rounded-full" /></Link>{!collapsed && <span className="text-xs font-semibold">GLOOW UP CLUB</span>}</div>
    <nav className="flex-1 min-h-0 overflow-y-auto px-2 py-2 space-y-0.5" aria-label="Navegação principal">
      {mainLinks(user?.id).map(renderLink)}
      <div className="border-t border-border my-2" />
      {!collapsed && <div className="flex items-center justify-between px-3 py-2 text-[11px]"><span className="text-muted-foreground">Minha fase</span>{phase && <span className="text-primary font-semibold">{phaseNames[phase]}</span>}</div>}
      {phaseLinks.map(renderLink)}
      <div className="border-t border-border my-2" />
      {renderLink({ to: "/saude", icon: Heart, label: "Saúde" })}
      {renderLink({ to: "/comunidade", icon: Users, label: "Comunidade" })}
    </nav>
    {!collapsed && <div className="px-3 pb-2"><StreakSidebarCard /></div>}
    <div className="border-t border-border px-2 py-2">
      {renderLink({ to: "/settings", icon: Settings, label: "Configurações" })}
      <Button variant="ghost" onClick={toggleSidebar} aria-label={collapsed ? "Expandir menu" : "Recolher menu"} title={collapsed ? "Expandir menu" : "Recolher menu"} className={cn("hidden lg:flex h-10 w-full justify-start px-3 rounded-lg text-xs text-muted-foreground", collapsed && "justify-center px-0")}>
        {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}{!collapsed && "Recolher menu"}
      </Button>
    </div>
  </aside>;
}
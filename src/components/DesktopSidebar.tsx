import { NavLink, useLocation } from "react-router-dom";
import { Home, Target, Wallet, Users, BookOpen, User, Heart, Crown, Smartphone, Settings, Zap, Brain, Trophy, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useViewMode } from "@/contexts/ViewModeContext";
import FourPointStar from "./FourPointStar";

export default function DesktopSidebar() {
  const location = useLocation();
  const { user, profile } = useAuth();
  const { setMode } = useViewMode();

  const mainTabs = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/diario", icon: BookOpen, label: "Diário" },
    { to: "/metas", icon: Target, label: "Metas" },
    { to: "/saude", icon: Heart, label: "Saúde" },
    { to: "/financas", icon: Wallet, label: "Finanças" },
    { to: "/comunidade", icon: Users, label: "Comunidade" },
    { to: "/desafios", icon: Trophy, label: "Desafios" },
  ];

  const extraTabs = [
    { to: "/reprogramacao", icon: Brain, label: "Reprogramação" },
    { to: "/alta-performance", icon: Zap, label: "Alta Performance" },
    { to: "/jornada", icon: Crown, label: "Destravar" },
  ];

  const renderLink = ({ to, icon: Icon, label }: typeof mainTabs[0]) => {
    const active = location.pathname === to || (to.startsWith("/perfil/") && location.pathname.startsWith("/perfil/"));
    return (
      <NavLink
        key={to}
        to={to}
        className={cn(
          "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-body",
          active
            ? "bg-gold/10 text-gold font-semibold border border-gold/20"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
        )}
      >
        <Icon className="h-4.5 w-4.5 flex-shrink-0" strokeWidth={active ? 2.5 : 1.8} />
        <span>{label}</span>
      </NavLink>
    );
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border z-40 flex flex-col overflow-y-auto">
      {/* Brand */}
      <div className="px-5 pt-6 pb-4 flex items-center gap-3 border-b border-border">
        <FourPointStar size={28} fill="hsl(43 72% 52%)" className="text-gold flex-shrink-0" />
        <div>
          <h1 className="text-lg font-display font-bold text-foreground">Gloow Up</h1>
          <p className="text-[9px] font-body tracking-[0.2em] uppercase text-gold/60">Club</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="text-[9px] font-body tracking-[0.2em] uppercase text-muted-foreground/50 px-4 mb-2">Principal</p>
        {mainTabs.map(renderLink)}

        <div className="h-px bg-border my-3" />
        <p className="text-[9px] font-body tracking-[0.2em] uppercase text-muted-foreground/50 px-4 mb-2">Módulos</p>
        {extraTabs.map(renderLink)}

        <div className="h-px bg-border my-3" />
        <p className="text-[9px] font-body tracking-[0.2em] uppercase text-muted-foreground/50 px-4 mb-2">Admin</p>
        {renderLink({ to: "/admin/assinaturas", icon: ShieldCheck, label: "Assinaturas" })}
      </nav>

      {/* Profile + mode toggle */}
      <div className="border-t border-border px-3 py-3 space-y-2">
        <NavLink
          to={user ? `/perfil/${user.id}` : "/comunidade"}
          className={cn(
            "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-body",
            location.pathname.startsWith("/perfil/")
              ? "bg-gold/10 text-gold font-semibold border border-gold/20"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          )}
        >
          <User className="h-4.5 w-4.5" />
          <span>{profile?.display_name?.split(" ")[0] || "Perfil"}</span>
        </NavLink>

        <NavLink
          to="/settings"
          className={cn(
            "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-body",
            location.pathname === "/settings"
              ? "bg-gold/10 text-gold font-semibold border border-gold/20"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          )}
        >
          <Settings className="h-4.5 w-4.5" />
          <span>Configurações</span>
        </NavLink>

        {/* Switch to mobile */}
        <button
          onClick={() => setMode("mobile")}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-body text-muted-foreground hover:text-gold hover:bg-gold/5 transition-all w-full"
        >
          <Smartphone className="h-4.5 w-4.5" />
          <span>Modo App</span>
        </button>
      </div>
    </aside>
  );
}

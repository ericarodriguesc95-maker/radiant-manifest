import { NavLink, useLocation } from "react-router-dom";
import { Home, Target, Wallet, Users, Zap, BookOpen, User, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export default function BottomNav() {
  const location = useLocation();
  const { user } = useAuth();

  const tabs = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/diario", icon: BookOpen, label: "Diário" },
    { to: "/metas", icon: Target, label: "Metas" },
    { to: "/alta-performance", icon: Zap, label: "Performance" },
    { to: "/financas", icon: Wallet, label: "Finanças" },
    { to: "/comunidade", icon: Users, label: "Girls" },
    { to: user ? `/perfil/${user.id}` : "/comunidade", icon: User, label: "Perfil" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-md safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-1">
        {tabs.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to || (to.startsWith("/perfil/") && location.pathname.startsWith("/perfil/"));
          return (
            <NavLink
              key={label}
              to={to}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-200 min-w-[48px]",
                active
                  ? "text-gold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", active && "drop-shadow-sm")} strokeWidth={active ? 2.5 : 1.8} />
              <span className={cn("text-[10px] font-body tracking-wide", active ? "font-semibold" : "font-medium")}>
                {label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

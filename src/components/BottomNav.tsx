import { NavLink, useLocation } from "react-router-dom";
import { Home, Wallet, Users, User, Heart, Target, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export default function BottomNav() {
  const location = useLocation();
  const { user } = useAuth();

  const tabs = [
    { to: "/", icon: Home, label: "Home", match: (p: string) => p === "/" },
    { to: "/comunidade", icon: Users, label: "Comunidade", match: (p: string) => p.startsWith("/comunidade") },
    { to: "/diario", icon: BookOpen, label: "Diário", match: (p: string) => p.startsWith("/diario") },
    { to: "/metas", icon: Target, label: "Metas", match: (p: string) => p.startsWith("/metas") },
    { to: "/saude", icon: Heart, label: "Saúde", match: (p: string) => p.startsWith("/saude") },
    { to: "/financas", icon: Wallet, label: "Finanças", match: (p: string) => p.startsWith("/financas") },
    { to: user ? `/perfil/${user.id}` : "/comunidade", icon: User, label: "Perfil", match: (p: string) => p.startsWith("/perfil") },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom)]"
      aria-label="Navegação principal"
    >
      {/* Floating Material You bar */}
      <div className="mx-auto max-w-lg px-3 pb-3">
        <div
          className="relative flex items-center justify-between rounded-[28px] border border-gold/30 bg-[hsl(0_0%_7%/0.88)] px-2 py-2 backdrop-blur-xl"
          style={{
            boxShadow:
              "0 16px 48px -12px hsl(0 0% 0% / 0.75), 0 2px 10px -2px hsl(40 75% 45% / 0.28), inset 0 1px 0 hsl(40 75% 60% / 0.14)",
          }}
        >
          {tabs.map(({ to, icon: Icon, label, match }) => {
            const active = match(location.pathname);
            return (
              <NavLink
                key={label}
                to={to}
                className="group relative flex flex-1 flex-col items-center justify-center gap-0.5 outline-none"
              >
                {/* Active pill */}
                <span
                  className={cn(
                    "flex h-7 w-10 items-center justify-center rounded-full transition-all duration-300 ease-out",
                    active
                      ? "bg-gradient-gold shadow-[0_6px_16px_-6px_hsl(40_75%_45%/0.55)] scale-100"
                      : "bg-transparent scale-90 group-hover:bg-gold/10"
                  )}
                >
                  <Icon
                    className={cn(
                      "transition-all duration-300",
                      active ? "h-[18px] w-[18px] text-white" : "h-[19px] w-[19px] text-foreground/70"
                    )}
                    strokeWidth={active ? 2.6 : 2}
                  />
                </span>
                <span
                  className={cn(
                    "text-[9.5px] font-body tracking-tight transition-colors truncate max-w-full",
                    active ? "font-semibold text-gold" : "font-medium text-muted-foreground"
                  )}
                >
                  {label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

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
      <div className="mx-auto max-w-lg px-3 pb-3">
        <div className="relative flex items-stretch justify-between rounded-[30px] border border-border/70 bg-[hsl(var(--card)/0.92)] px-1.5 py-2 backdrop-blur-xl shadow-[0_18px_44px_-24px_hsl(24_25%_25%/0.55)]">
          {tabs.map(({ to, icon: Icon, label, match }) => {
            const active = match(location.pathname);
            return (
              <NavLink
                key={label}
                to={to}
                className="group relative flex flex-1 flex-col items-center justify-center gap-1 pt-1 outline-none"
              >
                <Icon
                  className={cn(
                    "h-[19px] w-[19px] transition-all duration-300",
                    active ? "text-primary" : "text-foreground/45 group-hover:text-foreground/75",
                  )}
                  strokeWidth={active ? 2.1 : 1.6}
                />
                <span
                  className={cn(
                    "max-w-full truncate text-[8.5px] font-body uppercase tracking-[0.09em] transition-colors",
                    active ? "font-semibold text-foreground" : "font-medium text-muted-foreground/70",
                  )}
                >
                  {label}
                </span>
                <span
                  className={cn(
                    "mt-0.5 h-[3px] rounded-full bg-primary transition-all duration-300",
                    active ? "w-4 opacity-100" : "w-0 opacity-0",
                  )}
                />
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

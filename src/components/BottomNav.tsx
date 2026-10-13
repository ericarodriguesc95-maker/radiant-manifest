import { NavLink, useLocation } from "react-router-dom";
import { Home, Wallet, Users, User, Heart, Target, BookOpen, ClipboardCheck } from "lucide-react";
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
    { to: "/checkpoints", icon: ClipboardCheck, label: "Check-points", match: (p: string) => p.startsWith("/checkpoints") },
    { to: "/saude", icon: Heart, label: "Saúde", match: (p: string) => p.startsWith("/saude") },
    { to: "/financas", icon: Wallet, label: "Finanças", match: (p: string) => p.startsWith("/financas") },
    { to: user ? `/perfil/${user.id}` : "/comunidade", icon: User, label: "Perfil", match: (p: string) => p.startsWith("/perfil") },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom)]"
      aria-label="Navegação principal"
    >
      <div className="mx-auto max-w-lg px-2 pb-2">
        <div className="relative grid grid-cols-8 items-stretch rounded-[24px] border border-border/70 bg-card/95 px-1 py-1 backdrop-blur-md shadow-card">
          {tabs.map(({ to, icon: Icon, label, match }) => {
            const active = match(location.pathname);
            return (
              <NavLink
                key={label}
                to={to}
                className="group relative flex min-h-[56px] min-w-0 flex-col items-center justify-start gap-1 pt-1.5 outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
                aria-current={active ? "page" : undefined}
              >
                <Icon
                  className={cn(
                    "h-[19px] w-[19px] transition-all duration-300",
                    active ? "text-foreground" : "text-muted-foreground group-hover:text-foreground",
                  )}
                  strokeWidth={active ? 1.9 : 1.5}
                />
                <span
                  className={cn(
                    "flex h-6 w-full items-start justify-center break-words px-0.5 text-center text-[8px] leading-3 font-body tracking-normal transition-colors",
                    active ? "font-semibold text-foreground" : "font-medium text-muted-foreground/70",
                  )}
                >
                  {label}
                </span>
                <span
                  className={cn(
                    "absolute bottom-1 h-[2px] rounded-full bg-primary transition-all duration-300",
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

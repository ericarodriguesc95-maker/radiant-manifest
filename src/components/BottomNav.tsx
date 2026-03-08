import { NavLink, useLocation } from "react-router-dom";
import { Home, Target, Wallet, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/metas", icon: Target, label: "Metas" },
  { to: "/financas", icon: Wallet, label: "Finanças" },
  { to: "/comunidade", icon: Users, label: "Girls" },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-md safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {tabs.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to;
          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-[60px]",
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

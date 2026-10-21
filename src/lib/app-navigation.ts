import { Home, Compass, Sparkles, CalendarDays, BookOpen, Wallet, User, Brain, NotebookPen, ListChecks, Trophy, Utensils, Moon } from "lucide-react";

export const phaseLinks = [
  { label: "Reprogramação", to: "/reprogramacao", icon: Brain, sub: "Áudios e exercícios" },
  { label: "Diário", to: "/diario", icon: NotebookPen, sub: "Escrita terapêutica" },
  { label: "Ritual do mês", to: "/ritual-fechamento", icon: ListChecks, sub: "Fechar ciclos" },
  { label: "Evolução", to: "/evolucao", icon: Trophy, sub: "Ver o progresso" },
  { label: "Plano alimentar", to: "/plano-alimentar", icon: Utensils, sub: "Refeições da semana" },
  { label: "Sono", to: "/sono", icon: Moon, sub: "Dormir melhor" },
  { label: "Mente poderosa", to: "/mente-poderosa", icon: Sparkles, sub: "Regulação emocional" },
  { label: "Guias", to: "/guias", icon: BookOpen, sub: "Autocuidado" },
];

export const mainLinks = (userId?: string) => [
  { label: "Início", to: "/", icon: Home },
  { label: "Trilhas", to: "/?view=trilhas", icon: Compass },
  { label: "Programas", to: "/?view=programas", icon: Sparkles },
  { label: "Agenda", to: "/?view=agenda", icon: CalendarDays },
  { label: "Bíblia", to: "/?view=biblia", icon: BookOpen },
  { label: "Finanças", to: "/financas", icon: Wallet },
  { label: "Perfil", to: userId ? `/perfil/${userId}` : "/comunidade", icon: User },
];

export function isNavigationActive(to: string, pathname: string, search: string) {
  const target = new URL(to, "http://localhost");
  if (target.pathname === "/") return pathname === "/" && (new URLSearchParams(search).get("view") || "") === (target.searchParams.get("view") || "");
  return pathname === target.pathname || pathname.startsWith(`${target.pathname}/`);
}

export function resolveNavigationMode(width: number, preferred: "mobile" | "desktop" | null) {
  return width < 768 ? "mobile" : width < 1024 ? "desktop" : preferred || "desktop";
}
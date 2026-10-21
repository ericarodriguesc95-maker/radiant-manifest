import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { resolveNavigationMode } from "@/lib/app-navigation";

type ViewMode = "mobile" | "desktop";

interface ViewModeContextType {
  mode: ViewMode;
  setMode: (m: ViewMode) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

const ViewModeContext = createContext<ViewModeContextType>({
  mode: "mobile",
  setMode: () => {},
  sidebarCollapsed: false,
  toggleSidebar: () => {},
});

export const useViewMode = () => useContext(ViewModeContext);

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const [width, setWidth] = useState(() => window.innerWidth);
  const [collapsed, setCollapsed] = useState(false);
  const [preferredMode, setModeState] = useState<ViewMode | null>(() => {
    try {
      const saved = localStorage.getItem("glowup-view-mode");
      return saved === "mobile" || saved === "desktop" ? saved : null;
    } catch { return null; }
  });
  const mode: ViewMode = resolveNavigationMode(width, preferredMode);
  const sidebarCollapsed = width < 1024 || collapsed;

  useEffect(() => {
    const update = () => setWidth(window.innerWidth);
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const setMode = (m: ViewMode) => {
    setModeState(m);
    try { localStorage.setItem("glowup-view-mode", m); } catch {}
  };

  return (
    <ViewModeContext.Provider value={{ mode, setMode, sidebarCollapsed, toggleSidebar: () => setCollapsed(value => !value) }}>
      {children}
    </ViewModeContext.Provider>
  );
}

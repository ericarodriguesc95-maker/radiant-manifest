import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type ViewMode = "mobile" | "desktop";

interface ViewModeContextType {
  mode: ViewMode;
  setMode: (m: ViewMode) => void;
}

const ViewModeContext = createContext<ViewModeContextType>({
  mode: "mobile",
  setMode: () => {},
});

export const useViewMode = () => useContext(ViewModeContext);

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const [wideScreen, setWideScreen] = useState(() => window.matchMedia("(min-width: 1024px)").matches);
  const [preferredMode, setModeState] = useState<ViewMode | null>(() => {
    try {
      const saved = localStorage.getItem("glowup-view-mode");
      return saved === "mobile" || saved === "desktop" ? saved : null;
    } catch { return null; }
  });
  const mode: ViewMode = wideScreen ? preferredMode || "desktop" : "mobile";

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const update = () => setWideScreen(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const setMode = (m: ViewMode) => {
    setModeState(m);
    try { localStorage.setItem("glowup-view-mode", m); } catch {}
  };

  return (
    <ViewModeContext.Provider value={{ mode, setMode }}>
      {children}
    </ViewModeContext.Provider>
  );
}

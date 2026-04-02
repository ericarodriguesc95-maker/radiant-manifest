import { createContext, useContext, useState, ReactNode } from "react";

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
  const [mode, setModeState] = useState<ViewMode>(() => {
    return (localStorage.getItem("glowup-view-mode") as ViewMode) || "mobile";
  });

  const setMode = (m: ViewMode) => {
    setModeState(m);
    localStorage.setItem("glowup-view-mode", m);
  };

  return (
    <ViewModeContext.Provider value={{ mode, setMode }}>
      {children}
    </ViewModeContext.Provider>
  );
}

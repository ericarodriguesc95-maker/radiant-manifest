import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import BottomNav from "./BottomNav";
import GuidedTour from "./GuidedTour";

export default function AppLayout() {
  const [showTour, setShowTour] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Auto-trigger tour for first-time users
    const completed = localStorage.getItem("glow-tour-completed");
    if (!completed && location.pathname === "/") {
      const timer = setTimeout(() => setShowTour(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Expose global function to trigger tour manually
  useEffect(() => {
    (window as any).__startGlowTour = () => setShowTour(true);
    return () => { delete (window as any).__startGlowTour; };
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Outlet />
      <BottomNav />
      {showTour && <GuidedTour onClose={() => setShowTour(false)} />}
    </div>
  );
}

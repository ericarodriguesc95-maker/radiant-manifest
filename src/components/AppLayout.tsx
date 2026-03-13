import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import BottomNav from "./BottomNav";
import GuidedTour from "./GuidedTour";
import { useActivityTracker } from "@/hooks/useActivityTracker";
import { usePushNotificationListener } from "@/hooks/usePushNotificationListener";

export default function AppLayout() {
  const [showTour, setShowTour] = useState(false);
  const location = useLocation();

  // Activity tracking - auto-logs page views
  useActivityTracker();

  // Listen for social notifications and send push to device
  usePushNotificationListener();

  useEffect(() => {
    const completed = localStorage.getItem("glow-tour-completed");
    if (!completed && location.pathname === "/") {
      const timer = setTimeout(() => setShowTour(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

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

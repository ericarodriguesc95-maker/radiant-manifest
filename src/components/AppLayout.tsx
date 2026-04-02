import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import BottomNav from "./BottomNav";
import DesktopSidebar from "./DesktopSidebar";
import ViewModeToggle from "./ViewModeToggle";
import GuidedTour from "./GuidedTour";
import InstallAppBanner from "./InstallAppBanner";
import WelcomeBackAlert from "./WelcomeBackAlert";
import { useActivityTracker } from "@/hooks/useActivityTracker";
import { usePushNotificationListener } from "@/hooks/usePushNotificationListener";
import { initNotifications } from "@/lib/notifications";
import { useViewMode } from "@/contexts/ViewModeContext";
import { cn } from "@/lib/utils";

export default function AppLayout() {
  const [showTour, setShowTour] = useState(false);
  const location = useLocation();
  const { mode } = useViewMode();
  const isDesktop = mode === "desktop";

  useActivityTracker();
  usePushNotificationListener();

  useEffect(() => {
    initNotifications();
  }, []);

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
    <div className={cn("min-h-screen bg-background", isDesktop ? "pl-64" : "pb-20")}>
      {isDesktop ? <DesktopSidebar /> : <BottomNav />}
      <ViewModeToggle />
      <WelcomeBackAlert />

      <div className={cn(isDesktop && "max-w-5xl mx-auto px-6 py-4")}>
        <Outlet />
      </div>

      {!isDesktop && <InstallAppBanner />}
      {showTour && <GuidedTour onClose={() => setShowTour(false)} />}
    </div>
  );
}

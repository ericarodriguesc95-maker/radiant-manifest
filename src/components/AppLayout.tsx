import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Outlet, useLocation } from "react-router-dom";
import BottomNav from "./BottomNav";
import DesktopSidebar from "./DesktopSidebar";
import ViewModeToggle from "./ViewModeToggle";
import GuidedTour from "./GuidedTour";
import InstallAppBanner from "./InstallAppBanner";
import WelcomeBackAlert from "./WelcomeBackAlert";
import NpsPopup from "./NpsPopup";
import { useActivityTracker } from "@/hooks/useActivityTracker";
import { usePushNotificationListener } from "@/hooks/usePushNotificationListener";
import { useCycleNotifications } from "@/hooks/useCycleNotifications";
import { initNotifications } from "@/lib/notifications";
import { useViewMode } from "@/contexts/ViewModeContext";
import { cn } from "@/lib/utils";

export default function AppLayout() {
  const [showTour, setShowTour] = useState(false);
  const location = useLocation();
  const { mode } = useViewMode();
  const { user } = useAuth();
  const isDesktop = mode === "desktop";

  useActivityTracker();
  usePushNotificationListener();
  useCycleNotifications();

  useEffect(() => {
    initNotifications(user?.id);
  }, [user?.id]);

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
      <div className="flex justify-end px-4 pt-3 pb-1">
        <ViewModeToggle />
      </div>
      <WelcomeBackAlert />

      <div className={cn(isDesktop && "max-w-5xl mx-auto px-6 py-4")}>
        <Outlet />
      </div>

      {!isDesktop && <InstallAppBanner />}
      {showTour && <GuidedTour onClose={() => setShowTour(false)} />}
      <NpsPopup />
    </div>
  );
}

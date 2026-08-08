import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";
import DesktopSidebar from "./DesktopSidebar";
import ViewModeToggle from "./ViewModeToggle";
import GuidedTour from "./GuidedTour";
import BackButton from "./BackButton";
import WelcomeBackAlert from "./WelcomeBackAlert";
import NpsPopup from "./NpsPopup";
import PushPermissionOnboarding from "./PushPermissionOnboarding";
import InstallAppBanner from "./InstallAppBanner";
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

  // Tour agora só inicia manualmente pelo botão no header da Home

  useEffect(() => {
    (window as any).__startGlowTour = () => setShowTour(true);
    return () => { delete (window as any).__startGlowTour; };
  }, []);

  return (
    <>
      <div className={cn("app-shell", isDesktop ? "pl-64" : "pb-28")}>
        <div className="flex justify-end px-4 pt-3 pb-1">
          <ViewModeToggle />
        </div>
        <WelcomeBackAlert />

        <div className={cn(isDesktop && "max-w-5xl mx-auto px-6 py-4")}>
          <BackButton />
          <Outlet />
        </div>

        {showTour && <GuidedTour onClose={() => setShowTour(false)} />}
        <NpsPopup />
        <PushPermissionOnboarding />
        <InstallAppBanner />
      </div>

      {/* Fora do .app-shell para que position:fixed siga a viewport
          (backdrop-filter no shell criaria um containing block) */}
      {isDesktop ? <DesktopSidebar /> : <BottomNav />}
    </>
  );
}


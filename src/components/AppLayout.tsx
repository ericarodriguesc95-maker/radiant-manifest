import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Outlet, useLocation } from "react-router-dom";
import BottomNav from "./BottomNav";
import DesktopSidebar from "./DesktopSidebar";
import ViewModeToggle from "./ViewModeToggle";
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
  const { mode, sidebarCollapsed } = useViewMode();
  const { user } = useAuth();
  const isDesktop = mode === "desktop";
  const location = useLocation();

  useActivityTracker();
  usePushNotificationListener();
  useCycleNotifications();

  useEffect(() => {
    initNotifications(user?.id);
  }, [user?.id]);

  return (
    <>
      <div className={cn("app-shell", isDesktop ? sidebarCollapsed ? "app-shell-site pl-[72px]" : "app-shell-site pl-[248px]" : "app-shell-mobile pb-24")}>
        <div className={cn("flex justify-end px-4 pt-2 pb-0", isDesktop ? "mx-auto max-w-5xl px-4 pt-2" : "mx-auto max-w-2xl")}>
          <ViewModeToggle />
        </div>
        <WelcomeBackAlert />

        <div key={location.pathname + location.search} className={cn("page-in min-w-0", isDesktop ? "max-w-5xl mx-auto px-3 py-2" : "max-w-2xl mx-auto")}>
          <BackButton />
          <Outlet />
        </div>

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


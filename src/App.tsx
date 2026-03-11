import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import HomePage from "@/pages/HomePage";
import MetasPage from "@/pages/MetasPage";
import FinancasPage from "@/pages/FinancasPage";
import ComunidadePage from "@/pages/ComunidadePage";
import VisionBoardPage from "@/pages/VisionBoardPage";
import ReprogramacaoPage from "@/pages/ReprogramacaoPage";
import GuiasPage from "@/pages/GuiasPage";
import AltaPerformancePage from "@/pages/AltaPerformancePage";
import JornadaPage from "@/pages/JornadaPage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import SettingsPage from "@/pages/SettingsPage";
import NotFound from "./pages/NotFound";
import ProfilePage from "@/pages/ProfilePage";
import DiarioPage from "@/pages/DiarioPage";
import AdminActivityPage from "@/pages/AdminActivityPage";
import SaudePage from "@/pages/SaudePage";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

const AppRoutes = () => (
  <Routes>
    {/* Public auth routes */}
    <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
    <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="/reset-password" element={<ResetPasswordPage />} />

    {/* Protected routes */}
    <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
      <Route path="/" element={<HomePage />} />
      <Route path="/metas" element={<MetasPage />} />
      <Route path="/financas" element={<FinancasPage />} />
      <Route path="/comunidade" element={<ComunidadePage />} />
      <Route path="/vision-board" element={<VisionBoardPage />} />
      <Route path="/jornada" element={<JornadaPage />} />
      <Route path="/reprogramacao" element={<ReprogramacaoPage />} />
      <Route path="/guias" element={<GuiasPage />} />
      <Route path="/alta-performance" element={<AltaPerformancePage />} />
      <Route path="/saude" element={<SaudePage />} />
      <Route path="/diario" element={<DiarioPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/admin/atividade" element={<AdminActivityPage />} />
      <Route path="/perfil/:userId" element={<ProfilePage />} />
    </Route>
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

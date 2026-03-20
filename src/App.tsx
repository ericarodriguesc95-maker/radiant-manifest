import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import FourPointStar from "@/components/FourPointStar";
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
import AdminContentPage from "@/pages/AdminContentPage";
import SaudePage from "@/pages/SaudePage";
import DesafiosPage from "@/pages/DesafiosPage";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><FourPointStar size={40} animate="spin" className="text-gold" fill="hsl(43 72% 52%)" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><FourPointStar size={40} animate="spin" className="text-gold" fill="hsl(43 72% 52%)" /></div>;
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
      <Route path="/" element={<ErrorBoundary><HomePage /></ErrorBoundary>} />
      <Route path="/metas" element={<ErrorBoundary><MetasPage /></ErrorBoundary>} />
      <Route path="/financas" element={<ErrorBoundary><FinancasPage /></ErrorBoundary>} />
      <Route path="/comunidade" element={<ErrorBoundary><ComunidadePage /></ErrorBoundary>} />
      <Route path="/vision-board" element={<ErrorBoundary><VisionBoardPage /></ErrorBoundary>} />
      <Route path="/jornada" element={<ErrorBoundary><JornadaPage /></ErrorBoundary>} />
      <Route path="/reprogramacao" element={<ErrorBoundary><ReprogramacaoPage /></ErrorBoundary>} />
      <Route path="/guias" element={<ErrorBoundary><GuiasPage /></ErrorBoundary>} />
      <Route path="/alta-performance" element={<ErrorBoundary><AltaPerformancePage /></ErrorBoundary>} />
      <Route path="/saude" element={<ErrorBoundary><SaudePage /></ErrorBoundary>} />
      <Route path="/diario" element={<ErrorBoundary><DiarioPage /></ErrorBoundary>} />
      <Route path="/settings" element={<ErrorBoundary><SettingsPage /></ErrorBoundary>} />
      <Route path="/admin/atividade" element={<ErrorBoundary><AdminActivityPage /></ErrorBoundary>} />
      <Route path="/admin/conteudo" element={<ErrorBoundary><AdminContentPage /></ErrorBoundary>} />
      <Route path="/perfil/:userId" element={<ErrorBoundary><ProfilePage /></ErrorBoundary>} />
    </Route>
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <ErrorBoundary>
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
  </ErrorBoundary>
);

export default App;

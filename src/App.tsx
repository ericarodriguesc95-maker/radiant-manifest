import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ViewModeProvider } from "@/contexts/ViewModeContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import FourPointStar from "@/components/FourPointStar";
import SplashScreen from "@/components/SplashScreen";
import NewVersionBanner from "@/components/NewVersionBanner";
import ScrollToTop from "@/components/ScrollToTop";
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
import AdminSubscriptionsPage from "@/pages/AdminSubscriptionsPage";
import SaudePage from "@/pages/SaudePage";
import SonoPage from "@/pages/SonoPage";
import DesafiosPage from "@/pages/DesafiosPage";
import RenovarBrilhoPage from "@/pages/RenovarBrilhoPage";
import Biblia365Page from "@/pages/Biblia365Page";
import TestesPage from "@/pages/TestesPage";
import JornadaElitePage from "@/pages/JornadaElitePage";
import ModuloElitePage from "@/pages/ModuloElitePage";
import AdminBibliotecaElitePage from "@/pages/AdminBibliotecaElitePage";
import SugestoesPage from "@/pages/SugestoesPage";
import IdentidadeInabalavelPage from "@/pages/IdentidadeInabalavelPage";
import Protocolo145Page from "@/pages/Protocolo145Page";
import MentePoderosaPage from "@/pages/MentePoderosaPage";
import GlowMovePage from "@/pages/GlowMovePage";
import GlowMovePillarPage from "@/pages/GlowMovePillarPage";
import AdminSugestoesPage from "@/pages/AdminSugestoesPage";
import LandingPage from "@/pages/LandingPage";
import RankingMensalPage from "@/pages/RankingMensalPage";
import ApresentacoesPage from "@/pages/ApresentacoesPage";
import BemVindoPage from "@/pages/BemVindoPage";
import DiretrizesPage from "@/pages/DiretrizesPage";
import TermometroRotinaPage from "@/pages/TermometroRotinaPage";
import PerfilDoMesPage from "@/pages/PerfilDoMesPage";
import { useSubscription } from "@/hooks/useSubscription";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><FourPointStar size={40} animate="spin" className="text-gold" fill="hsl(43 72% 52%)" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function SubscriptionGuard({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function PremiumRoute({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><FourPointStar size={40} animate="spin" className="text-gold" fill="hsl(43 72% 52%)" /></div>;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function RootRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><FourPointStar size={40} animate="spin" className="text-gold" fill="hsl(43 72% 52%)" /></div>;
  if (!user) return <LandingPage />;
  return (
    <SubscriptionGuard>
      <AppLayout />
    </SubscriptionGuard>
  );
}

const AppRoutes = () => (
  <Routes>
    {/* Root: landing for logged-out, app for logged-in */}
    <Route path="/" element={<RootRoute />}>
      <Route index element={<ErrorBoundary><HomePage /></ErrorBoundary>} />
    </Route>
    <Route path="/planos" element={<LandingPage />} />

    {/* Public auth routes */}
    <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
    <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="/reset-password" element={<ResetPasswordPage />} />

    {/* Renewal page - accessible when logged in but no active sub */}
    <Route path="/renovar-brilho" element={<ProtectedRoute><RenovarBrilhoPage /></ProtectedRoute>} />

    {/* Protected + subscription required routes */}
    <Route element={<ProtectedRoute><SubscriptionGuard><AppLayout /></SubscriptionGuard></ProtectedRoute>}>
      <Route path="/metas" element={<ErrorBoundary><MetasPage /></ErrorBoundary>} />
      <Route path="/financas" element={<ErrorBoundary><FinancasPage /></ErrorBoundary>} />
      <Route path="/vision-board" element={<ErrorBoundary><VisionBoardPage /></ErrorBoundary>} />
      <Route path="/jornada" element={<ErrorBoundary><JornadaPage /></ErrorBoundary>} />
      <Route path="/reprogramacao" element={<ErrorBoundary><ReprogramacaoPage /></ErrorBoundary>} />
      <Route path="/guias" element={<ErrorBoundary><GuiasPage /></ErrorBoundary>} />
      <Route path="/alta-performance" element={<ErrorBoundary><AltaPerformancePage /></ErrorBoundary>} />
      <Route path="/diario" element={<ErrorBoundary><DiarioPage /></ErrorBoundary>} />
      <Route path="/settings" element={<ErrorBoundary><SettingsPage /></ErrorBoundary>} />
      <Route path="/admin/atividade" element={<ErrorBoundary><AdminActivityPage /></ErrorBoundary>} />
      <Route path="/admin/conteudo" element={<ErrorBoundary><AdminContentPage /></ErrorBoundary>} />
      <Route path="/admin/assinaturas" element={<ErrorBoundary><AdminSubscriptionsPage /></ErrorBoundary>} />
      <Route path="/admin/biblioteca-elite" element={<ErrorBoundary><AdminBibliotecaElitePage /></ErrorBoundary>} />
      <Route path="/admin/sugestoes" element={<ErrorBoundary><AdminSugestoesPage /></ErrorBoundary>} />
      <Route path="/sugestoes" element={<ErrorBoundary><SugestoesPage /></ErrorBoundary>} />
      <Route path="/perfil/:userId" element={<ErrorBoundary><ProfilePage /></ErrorBoundary>} />

      {/* Premium-locked routes (extra guard for clarity) */}
      <Route path="/comunidade" element={<ErrorBoundary><PremiumRoute><ComunidadePage /></PremiumRoute></ErrorBoundary>} />
      <Route path="/saude" element={<ErrorBoundary><PremiumRoute><SaudePage /></PremiumRoute></ErrorBoundary>} />
      <Route path="/sono" element={<ErrorBoundary><PremiumRoute><SonoPage /></PremiumRoute></ErrorBoundary>} />
      <Route path="/desafios" element={<ErrorBoundary><PremiumRoute><DesafiosPage /></PremiumRoute></ErrorBoundary>} />
      <Route path="/biblia-365" element={<ErrorBoundary><Biblia365Page /></ErrorBoundary>} />
      <Route path="/testes" element={<ErrorBoundary><TestesPage /></ErrorBoundary>} />
      <Route path="/jornada-elite" element={<ErrorBoundary><JornadaElitePage /></ErrorBoundary>} />
      <Route path="/jornada-elite/modulo/:levelId/:moduleId" element={<ErrorBoundary><ModuloElitePage /></ErrorBoundary>} />
      <Route path="/identidade-inabalavel" element={<ErrorBoundary><IdentidadeInabalavelPage /></ErrorBoundary>} />
      <Route path="/protocolo-14-5" element={<ErrorBoundary><Protocolo145Page /></ErrorBoundary>} />
      <Route path="/mente-poderosa" element={<ErrorBoundary><MentePoderosaPage /></ErrorBoundary>} />
      <Route path="/glow-move" element={<ErrorBoundary><PremiumRoute><GlowMovePage /></PremiumRoute></ErrorBoundary>} />
      <Route path="/glow-move/:pillarId" element={<ErrorBoundary><PremiumRoute><GlowMovePillarPage /></PremiumRoute></ErrorBoundary>} />
      <Route path="/ranking-mensal" element={<ErrorBoundary><RankingMensalPage /></ErrorBoundary>} />
      <Route path="/apresentacoes" element={<ErrorBoundary><ApresentacoesPage /></ErrorBoundary>} />
      <Route path="/bem-vindo" element={<ErrorBoundary><BemVindoPage /></ErrorBoundary>} />
      <Route path="/diretrizes" element={<ErrorBoundary><DiretrizesPage /></ErrorBoundary>} />
      <Route path="/meu-mes" element={<ErrorBoundary><TermometroRotinaPage /></ErrorBoundary>} />
    </Route>
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => {
  const [splashDone, setSplashDone] = useState(() => sessionStorage.getItem("splash-seen") === "1");

  useEffect(() => {
    if (splashDone) sessionStorage.setItem("splash-seen", "1");
  }, [splashDone]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <NewVersionBanner />
          {!splashDone && <SplashScreen onFinish={() => setSplashDone(true)} />}
          <BrowserRouter>
            <ScrollToTop />
            <AuthProvider>
              <ViewModeProvider>
                <AppRoutes />
              </ViewModeProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;

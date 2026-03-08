import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import HomePage from "@/pages/HomePage";
import MetasPage from "@/pages/MetasPage";
import FinancasPage from "@/pages/FinancasPage";
import ComunidadePage from "@/pages/ComunidadePage";
import VisionBoardPage from "@/pages/VisionBoardPage";
import ReprogramacaoPage from "@/pages/ReprogramacaoPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/metas" element={<MetasPage />} />
            <Route path="/financas" element={<FinancasPage />} />
            <Route path="/comunidade" element={<ComunidadePage />} />
            <Route path="/vision-board" element={<VisionBoardPage />} />
            <Route path="/reprogramacao" element={<ReprogramacaoPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

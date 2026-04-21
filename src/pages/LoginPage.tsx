import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Crown, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

const eliteQuotes = [
  "Mulheres fortes não esperam oportunidades — elas as criam.",
  "Sua energia é seu maior investimento.",
  "Disciplina é liberdade disfarçada.",
  "O luxo começa com uma mente organizada.",
  "Silêncio e estratégia vencem qualquer ruído.",
  "Você não precisa de permissão para brilhar.",
  "Elegância é a forma mais poderosa de autoridade.",
  "Invista em você — o retorno é garantido.",
  "A mulher que se conhece, governa o mundo.",
  "Consistência transforma o ordinário em extraordinário.",
  "Seu próximo nível exige uma nova versão de você.",
  "Grandes mulheres constroem em silêncio e surpreendem em público.",
];

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % eliteQuotes.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      toast({ title: "Erro ao entrar", description: error.message, variant: "destructive" });
      return;
    }

    if (authData?.user) {
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("status, plan_type, expiry_date")
        .eq("user_id", authData.user.id)
        .maybeSingle();

      const isActive = sub && (
        sub.plan_type === "lifetime" ||
        sub.status === "active" ||
        sub.status === "trialing"
      );
      const isExpired = sub?.plan_type !== "lifetime" && sub?.expiry_date && new Date(sub.expiry_date) < new Date();

      setLoading(false);
      if (!sub || !isActive || isExpired) {
        navigate("/renovar-brilho");
      } else {
        navigate("/");
      }
    } else {
      setLoading(false);
      navigate("/");
    }
  };

  const handleOAuth = async (provider: "google" | "apple") => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth(provider, {
      redirect_uri: window.location.origin,
    });
    setLoading(false);
    if (result?.error) {
      toast({ title: "Erro", description: String(result.error), variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "#0A0A0A" }}>
      {/* Ambient glow effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-20" style={{ background: "radial-gradient(circle, hsl(43 72% 52% / 0.3), transparent 70%)" }} />
      <div className="absolute bottom-[-15%] right: "[-10%] w-[400px] h-[400px] rounded-full opacity-15" style={{ background: "radial-gradient(circle, hsl(43 72% 52% / 0.2), transparent 70%)" }} />

      {/* Pulsing dots */}
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.5); }
        }
        @keyframes text-pulse {
          0%, 100% { opacity: 0.25; text-shadow: 0 0 0px hsl(43 72% 52% / 0); }
          50% { opacity: 0.6; text-shadow: 0 0 20px hsl(43 72% 52% / 0.3); }
        }
        .pulsing-dot {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        .pulsing-text {
          animation: text-pulse 3s ease-in-out infinite;
        }
      `}</style>
      
      {/* Floating glowing dots */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { top: "12%", left: "8%", delay: "0s" },
          { top: "25%", right: "12%", delay: "0.5s" },
          { top: "55%", left: "5%", delay: "1s" },
          { bottom: "35%", right: "8%", delay: "1.5s" },
          { bottom: "15%", left: "15%", delay: "0.3s" },
          { top: "75%", right: "15%", delay: "0.8s" },
          { top: "5%", right: "30%", delay: "1.2s" },
          { bottom: "20%", left: "35%", delay: "0.6s" },
        ].map((pos, i) => (
          <div
            key={i}
            className="absolute pulsing-dot rounded-full"
            style={{
              width: "4px",
              height: "4px",
              background: "hsl(43 72% 52%)",
              boxShadow: "0 0 10px hsl(43 72% 52% / 0.8), 0 0 20px hsl(43 72% 52% / 0.4)",
              ...pos,
              animationDelay: pos.delay,
            }}
          />
        ))}
      </div>

      {/* Floating quotes - scattered around with pulse effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {eliteQuotes.slice(0, 6).map((quote, i) => {
          const positions = [
            { top: "10%", left: "3%", maxW: "160px" },
            { top: "20%", right: "5%", maxW: "150px" },
            { top: "40%", left: "2%", maxW: "140px" },
            { top: "60%", right: "3%", maxW: "155px" },
            { top: "78%", left: "5%", maxW: "145px" },
            { top: "85%", right: "8%", maxW: "150px" },
          ];
          const delays = ["0s", "0.8s", "1.5s", "0.4s", "2s", "1.2s"];
          const pos = positions[i];
          return (
            <p
              key={i}
              className="absolute text-[11px] italic leading-relaxed hidden lg:block pulsing-text"
              style={{
                ...pos,
                maxWidth: pos.maxW,
                color: "hsl(43 60% 55%)",
                fontFamily: "'Georgia', serif",
                animationDelay: delays[i],
              }}
            >
              "{quote}"
            </p>
          );
        })}
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8">

        {/* Rotating quote */}
        <div className="mb-6 text-center max-w-sm px-4 h-14 flex items-center justify-center">
          <p
            key={currentQuote}
            className="text-sm italic animate-fade-in"
            style={{
              color: "hsl(43 60% 60% / 0.6)",
              fontFamily: "'Georgia', serif",
              letterSpacing: "0.02em",
            }}
          >
            "{eliteQuotes[currentQuote]}"
          </p>
        </div>

        {/* Login card */}
        <div
          className="w-full max-w-md rounded-3xl p-8 space-y-6 border"
          style={{
            background: "linear-gradient(145deg, rgba(20,20,20,0.95), rgba(12,12,12,0.98))",
            borderColor: "hsl(43 72% 52% / 0.15)",
            boxShadow: "0 25px 60px -15px rgba(0,0,0,0.7), 0 0 40px -10px hsl(43 72% 52% / 0.08)",
          }}
        >
          {/* Logo area */}
          <div className="text-center space-y-3">
            <div
              className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, hsl(43 72% 52% / 0.2), hsl(43 72% 52% / 0.05))",
                border: "1px solid hsl(43 72% 52% / 0.3)",
              }}
            >
              <Crown className="w-8 h-8" style={{ color: "hsl(43 72% 52%)" }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#F5F5F5" }}>
                GLOOW UP <span style={{ color: "hsl(43 72% 52%)" }}>CLUB ✦</span>
              </h1>
              <p className="text-xs tracking-[0.3em] uppercase mt-1" style={{ color: "hsl(43 50% 55% / 0.5)" }}>
                Exclusivo para mulheres de elite
              </p>
            </div>
          </div>

          {/* OAuth */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleOAuth("google")}
              disabled={loading}
              className="flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02] disabled:opacity-50"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#ccc",
              }}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </button>
            <button
              onClick={() => handleOAuth("apple")}
              disabled={loading}
              className="flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02] disabled:opacity-50"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#ccc",
              }}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
              Apple
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
            <span className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.2)" }}>ou</span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <div
                className="relative flex items-center rounded-xl h-12 px-4 gap-3 transition-all focus-within:ring-1 focus-within:ring-gold/30"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <Mail className="h-4 w-4 flex-shrink-0" style={{ color: "hsl(43 72% 52% / 0.5)" }} />
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 bg-transparent outline-none text-sm placeholder:text-white/20"
                  style={{ color: "#E5E5E5" }}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <div
                className="relative flex items-center rounded-xl h-12 px-4 gap-3"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <Lock className="h-4 w-4 flex-shrink-0" style={{ color: "hsl(43 72% 52% / 0.5)" }} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="flex-1 bg-transparent outline-none text-sm placeholder:text-white/20"
                  style={{ color: "#E5E5E5" }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="flex-shrink-0">
                  {showPassword ? <EyeOff className="h-4 w-4" style={{ color: "rgba(255,255,255,0.3)" }} /> : <Eye className="h-4 w-4" style={{ color: "rgba(255,255,255,0.3)" }} />}
                </button>
              </div>
              <div className="text-right">
                <Link to="/forgot-password" className="text-[11px] hover:underline" style={{ color: "hsl(43 60% 55% / 0.5)" }}>
                  Esqueci minha senha
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-300 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg, hsl(43 72% 52%), hsl(43 72% 42%))",
                color: "#0A0A0A",
                boxShadow: "0 4px 20px -4px hsl(43 72% 52% / 0.4)",
              }}
            >
              {loading ? "Entrando..." : "Acessar minha conta"}
            </button>
          </form>

          {/* Parcelamento info */}
          <div className="text-center pt-2">
            <p className="text-[10px]" style={{ color: "hsl(43 60% 55% / 0.7)" }}>
              ✦ Ainda não é membro? <Link to="/planos" className="underline hover:text-gold">Assine agora</Link> em até <strong style={{ color: "hsl(43 72% 52%)" }}>6x de R$ 5,24</strong>
            </p>
          </div>
        </div>

        {/* Bottom quote */}
        <p className="mt-8 text-center text-[11px] max-w-xs" style={{ color: "rgba(255,255,255,0.12)", fontFamily: "'Georgia', serif" }}>
          "A única competição de uma mulher de elite é com a versão que ela era ontem."
        </p>
      </div>
    </div>
  );
}

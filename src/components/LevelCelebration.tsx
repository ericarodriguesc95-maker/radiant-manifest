import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { Crown, Sparkles, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import FourPointStar from "./FourPointStar";

interface LevelCelebrationProps {
  levelId: number;
  levelName: string;
  levelSubtitle: string;
  levelIcon: string;
  onClose: () => void;
}

export default function LevelCelebration({
  levelId,
  levelName,
  levelSubtitle,
  levelIcon,
  onClose,
}: LevelCelebrationProps) {
  const navigate = useNavigate();
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    // Gold confetti palette
    const goldColors = ["#D4AF37", "#F4D47C", "#B8860B", "#FFD700", "#FFF8DC"];

    const burst = (originX: number) => {
      confetti({
        particleCount: 80,
        spread: 70,
        startVelocity: 55,
        origin: { x: originX, y: 0.6 },
        colors: goldColors,
        scalar: 1.1,
        ticks: 220,
      });
    };

    // Initial double burst
    burst(0.2);
    burst(0.8);

    // Center cannon
    setTimeout(() => {
      confetti({
        particleCount: 140,
        spread: 100,
        startVelocity: 45,
        origin: { x: 0.5, y: 0.5 },
        colors: goldColors,
        scalar: 1.3,
        ticks: 260,
      });
    }, 250);

    // Continuous gentle rain for 2.5s
    const end = Date.now() + 2500;
    const interval = window.setInterval(() => {
      if (Date.now() > end) {
        window.clearInterval(interval);
        return;
      }
      confetti({
        particleCount: 6,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.4 },
        colors: goldColors,
      });
      confetti({
        particleCount: 6,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.4 },
        colors: goldColors,
      });
    }, 200);

    return () => window.clearInterval(interval);
  }, []);

  const handleContinue = () => {
    onClose();
    navigate("/jornada-elite");
  };

  return (
    <div className="fixed inset-0 z-[80] bg-background/95 backdrop-blur-xl flex items-center justify-center p-6 animate-fade-in">
      {/* Radial gold glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gold/10 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-gold/15 blur-[60px]" />
      </div>

      {/* Floating stars */}
      <FourPointStar
        size={20}
        fill="hsl(var(--gold))"
        animate="pulse"
        className="absolute top-[18%] left-[15%] opacity-70"
      />
      <FourPointStar
        size={14}
        fill="hsl(var(--gold))"
        animate="pulse"
        className="absolute top-[28%] right-[18%] opacity-60"
      />
      <FourPointStar
        size={18}
        fill="hsl(var(--gold))"
        animate="pulse"
        className="absolute bottom-[25%] left-[22%] opacity-60"
      />
      <FourPointStar
        size={12}
        fill="hsl(var(--gold))"
        animate="pulse"
        className="absolute bottom-[20%] right-[15%] opacity-70"
      />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-2 rounded-full hover:bg-muted/30 transition-colors z-10"
        aria-label="Fechar"
      >
        <X className="h-5 w-5 text-muted-foreground" />
      </button>

      {/* Content */}
      <div className="relative z-10 max-w-md w-full text-center space-y-6">
        {/* Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/30 animate-stagger">
          <Sparkles className="h-3 w-3 text-gold" />
          <p className="text-[10px] font-body tracking-[0.3em] uppercase text-gold font-semibold">
            Nível {levelId} concluído
          </p>
        </div>

        {/* Badge */}
        <div className="relative mx-auto w-44 h-44 animate-stagger">
          {/* Outer rotating ring */}
          <div className="absolute inset-0 rounded-full border-2 border-gold/30 animate-[spin_20s_linear_infinite]">
            <FourPointStar
              size={16}
              fill="hsl(var(--gold))"
              className="absolute -top-2 left-1/2 -translate-x-1/2"
            />
          </div>
          {/* Inner badge */}
          <div className="absolute inset-3 rounded-full bg-gradient-to-br from-gold via-gold-light to-gold-dark shadow-[0_0_60px_-10px_hsl(var(--gold))] flex items-center justify-center">
            <div className="absolute inset-2 rounded-full border-2 border-background/30" />
            <div className="text-center">
              <div className="text-5xl mb-1">{levelIcon}</div>
              <Crown className="h-5 w-5 text-background mx-auto" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2 animate-stagger">
          <h1 className="text-3xl font-display font-bold text-foreground leading-tight">
            Badge desbloqueado
          </h1>
          <p className="text-2xl font-display font-bold bg-gradient-to-r from-gold-light via-gold to-gold-dark bg-clip-text text-transparent">
            {levelName}
          </p>
          <p className="text-sm font-body italic text-muted-foreground">
            {levelSubtitle}
          </p>
        </div>

        {/* Message */}
        <p className="text-sm font-body text-foreground/80 leading-relaxed max-w-sm mx-auto animate-stagger">
          Você concluiu todos os módulos deste nível. A próxima camada da pirâmide está aguardando a sua presença, rainha. 👑
        </p>

        {/* CTA */}
        <div className="space-y-2 pt-2 animate-stagger">
          <button
            onClick={handleContinue}
            className="w-full py-3.5 rounded-xl bg-gold text-primary-foreground font-body font-bold text-sm shadow-gold hover:brightness-110 transition-all active:scale-[0.98]"
          >
            Continuar para o próximo nível
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl border border-gold/20 text-muted-foreground font-body text-xs hover:text-foreground hover:border-gold/40 transition-all"
          >
            Permanecer aqui
          </button>
        </div>
      </div>
    </div>
  );
}

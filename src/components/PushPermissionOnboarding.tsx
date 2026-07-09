import { useEffect, useState } from "react";
import { Bell, Sparkles, BellRing, ShieldCheck, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { requestNotificationPermission, getPermissionStatus, subscribeToPush } from "@/lib/notifications";
import { toast } from "sonner";

const DISMISS_KEY = "glowup_push_onboarding_dismissed_v1";

export default function PushPermissionOnboarding() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const dismissed = localStorage.getItem(DISMISS_KEY);
    const status = getPermissionStatus();
    if (status === "default" && !dismissed) {
      const t = setTimeout(() => setOpen(true), 2500);
      return () => clearTimeout(t);
    }
  }, [user]);

  const handleEnable = async () => {
    setLoading(true);
    try {
      const granted = await requestNotificationPermission();
      if (granted) {
        if (user?.id) await subscribeToPush(user.id).catch(() => {});
        toast.success("Notificações ativadas! 👑", {
          description: "Você receberá lembretes diários de devocional, hábitos e gratidão.",
        });
        localStorage.setItem(DISMISS_KEY, "1");
        setOpen(false);
      } else {
        toast.error("Permissão negada", {
          description: "Você pode ativar depois nas configurações do navegador.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLater = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleLater(); }}>
      <DialogContent className="max-w-md border border-[#D4AF37]/30 bg-card text-white">
        <button
          onClick={handleLater}
          className="absolute right-3 top-3 text-muted-foreground hover:text-white"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>

        <DialogHeader className="space-y-3 pt-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#D4AF37] to-[#b8941f] shadow-[0_0_30px_rgba(212,175,55,0.5)]">
            <BellRing className="h-8 w-8 text-black" />
          </div>
          <DialogTitle className="text-center text-xl font-semibold tracking-wide">
            Não perca seu glow diário, rainha 👑
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground leading-relaxed">
            Ative as notificações para receber sua devocional, afirmação do dia, lembretes
            de hábitos e gratidão direto no seu celular — mesmo com o app fechado.
          </DialogDescription>
        </DialogHeader>

        <div className="my-3 space-y-3">
          <Benefit icon={<Sparkles className="h-4 w-4" />} text="Afirmação e Palavra do Dia pela manhã" />
          <Benefit icon={<Bell className="h-4 w-4" />} text="Lembretes de hábitos, hidratação e gratidão" />
          <Benefit icon={<ShieldCheck className="h-4 w-4" />} text="100% privado · você desativa quando quiser" />
        </div>

        <div className="rounded-lg border border-[#D4AF37]/20 bg-[#D4AF37]/5 p-3 text-xs text-muted-foreground">
          <strong className="text-[#D4AF37]">Como funciona:</strong> seu navegador vai abrir
          uma caixinha pedindo permissão. Toque em <span className="text-white">"Permitir"</span> para receber.
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <Button
            onClick={handleEnable}
            disabled={loading}
            className="w-full bg-[#D4AF37] text-black hover:bg-[#b8941f] font-semibold"
          >
            <Bell className="mr-2 h-4 w-4" />
            {loading ? "Ativando..." : "Ativar notificações"}
          </Button>
          <Button
            onClick={handleLater}
            variant="ghost"
            className="w-full text-muted-foreground hover:bg-muted/40 hover:text-white"
          >
            Agora não
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Benefit({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D4AF37]/15 text-[#D4AF37]">
        {icon}
      </div>
      <span className="text-foreground">{text}</span>
    </div>
  );
}

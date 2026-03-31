import { useState } from "react";
import { MessageCircle, Brain, Sparkles, Sun, Moon, Clock, ChevronRight, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const motivationalQuotes = [
  "Você é mais forte do que imagina. Hoje é um dia para brilhar! ✨",
  "Cada pequeno passo te aproxima da mulher extraordinária que você está se tornando. 🦋",
  "Sua energia atrai o que você vibra. Vibre alto, rainha! 👑",
  "Não espere a tempestade passar. Dance na chuva e crie seu arco-íris. 🌈",
  "Você não precisa ser perfeita. Você precisa ser autêntica. 💎",
  "O universo conspira a favor de quem tem coragem de sonhar grande. 🌟",
  "Sua melhor versão está sendo construída agora, neste exato momento. 🔥",
  "Gratidão transforma o que temos em suficiente. Agradeça e floresça. 🌸",
  "Mulheres fortes não têm atitudes fáceis, têm atitudes certas. 💪",
  "Acredite no processo. Sua transformação já começou. ✨",
];

const WhatsAppAIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const getPhoneNumber = async (): Promise<string | null> => {
    if (!user) return null;
    const { data } = await supabase
      .from("profiles")
      .select("phone_number")
      .eq("user_id", user.id)
      .single();
    return data?.phone_number || null;
  };

  const openWhatsApp = (phone: string, message: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, "_blank");
  };

  const sendMotivational = async () => {
    setLoading(true);
    const phone = await getPhoneNumber();
    if (!phone) {
      alert("Cadastre seu número de telefone nas Configurações > Perfil para receber mensagens no WhatsApp.");
      setLoading(false);
      return;
    }
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
    const quote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    const message = `🌟 *${greeting}, rainha!* 🌟\n\n${quote}\n\n_Sua IA Glow Up 👑_`;
    openWhatsApp(phone, message);
    setLoading(false);
  };

  const sendReminder = async () => {
    setLoading(true);
    const phone = await getPhoneNumber();
    if (!phone) {
      alert("Cadastre seu número de telefone nas Configurações > Perfil para receber mensagens no WhatsApp.");
      setLoading(false);
      return;
    }
    const hour = new Date().getHours();
    let reminders: string[] = [];

    if (hour < 12) {
      reminders = [
        "☀️ Fazer o Ritual Matinal",
        "🧘‍♀️ Meditar por 5 minutos",
        "📝 Registrar sua vibração na Escala de Hawkins",
        "💊 Tomar seus suplementos",
        "🎯 Revisar suas metas do dia",
      ];
    } else if (hour < 18) {
      reminders = [
        "💧 Beber água (meta: 2L)",
        "🏋️‍♀️ Fazer exercício físico",
        "📖 Ler por 15 minutos",
        "🧠 Exercício de PNL ou reprogramação",
        "✍️ Escrever no diário",
      ];
    } else {
      reminders = [
        "🌙 Fazer ritual noturno de gratidão",
        "📊 Registrar progresso das metas",
        "💭 Ouvir frequências de cura (528Hz)",
        "📱 Registrar hábitos do dia",
        "😴 Preparar para dormir bem",
      ];
    }

    const message = `⏰ *Lembretes da IA Glow Up* ⏰\n\n${reminders.map((r) => `• ${r}`).join("\n")}\n\n_Você é capaz, rainha! 👑_`;
    openWhatsApp(phone, message);
    setLoading(false);
  };

  const sendDailySummary = async () => {
    setLoading(true);
    const phone = await getPhoneNumber();
    if (!phone) {
      alert("Cadastre seu número de telefone nas Configurações > Perfil para receber mensagens no WhatsApp.");
      setLoading(false);
      return;
    }

    // Fetch streak
    let streak = 0;
    if (user) {
      const { data } = await supabase.rpc("calculate_streak", { _user_id: user.id });
      streak = data || 0;
    }

    // Fetch goals count
    let goalsCount = 0;
    if (user) {
      const { count } = await supabase.from("goals").select("*", { count: "exact", head: true }).eq("user_id", user.id);
      goalsCount = count || 0;
    }

    // Fetch today's habits from localStorage
    const completedHabits = Object.keys(localStorage).filter(
      (k) => k.startsWith("glow-habit-") && localStorage.getItem(k) === "true"
    ).length;

    const message = `📊 *Resumo do Dia — Glow Up* 📊\n\n🔥 Streak: ${streak} dia${streak !== 1 ? "s" : ""} consecutivo${streak !== 1 ? "s" : ""}\n✅ Hábitos completados: ${completedHabits}\n🎯 Metas ativas: ${goalsCount}\n\n${streak >= 7 ? "🏆 Incrível! Você está arrasando!" : streak >= 3 ? "💪 Continue assim, rainha!" : "🌱 Cada dia conta. Comece agora!"}\n\n_Sua IA Glow Up 👑_`;
    openWhatsApp(phone, message);
    setLoading(false);
  };

  const options = [
    {
      icon: Sun,
      label: "Frase Motivacional",
      desc: "Receba uma mensagem inspiradora",
      action: sendMotivational,
      gradient: "from-amber-500/20 to-orange-500/10",
    },
    {
      icon: Clock,
      label: "Lembretes do Momento",
      desc: "Tarefas ideais para agora",
      action: sendReminder,
      gradient: "from-purple-500/20 to-indigo-500/10",
    },
    {
      icon: Moon,
      label: "Resumo do Dia",
      desc: "Streak, hábitos e metas",
      action: sendDailySummary,
      gradient: "from-emerald-500/20 to-teal-500/10",
    },
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full relative overflow-hidden rounded-2xl p-5 flex items-center gap-4 transition-all hover:shadow-brand active:scale-[0.98] group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-green-500/10 to-emerald-500/5" />
        <div className="absolute inset-0 glass" />
        <div className="relative z-10 h-12 w-12 rounded-2xl bg-green-500/15 flex items-center justify-center border border-green-500/30 group-hover:bg-green-500/25 transition-all">
          <MessageCircle className="h-6 w-6 text-green-400" />
        </div>
        <div className="relative z-10 flex-1 text-left">
          <p className="text-sm font-display font-bold text-foreground flex items-center gap-2">
            IA WhatsApp
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 font-body tracking-wider uppercase">Novo</span>
          </p>
          <p className="text-[11px] font-body text-muted-foreground mt-0.5">Lembretes, frases e resumos no seu WhatsApp</p>
        </div>
        <ChevronRight className="relative z-10 h-5 w-5 text-green-400/50 group-hover:text-green-400 group-hover:translate-x-0.5 transition-all" />
      </button>
    );
  }

  return (
    <div className="glass rounded-2xl border border-green-500/20 overflow-hidden">
      {/* Header */}
      <div className="relative px-4 py-3 flex items-center justify-between">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/15 to-emerald-500/5" />
        <div className="relative z-10 flex items-center gap-2">
          <Brain className="h-4 w-4 text-green-400" />
          <h3 className="text-xs font-display font-bold text-foreground">IA Glow Up — WhatsApp</h3>
        </div>
        <button onClick={() => setIsOpen(false)} className="relative z-10 p-1 rounded-lg hover:bg-muted/30 transition-colors">
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Options */}
      <div className="p-3 space-y-2">
        {options.map(({ icon: Icon, label, desc, action, gradient }) => (
          <button
            key={label}
            onClick={action}
            disabled={loading}
            className={cn(
              "w-full relative overflow-hidden rounded-xl p-3 flex items-center gap-3 transition-all",
              "hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50",
              "border border-white/5 hover:border-green-500/20"
            )}
          >
            <div className={cn("absolute inset-0 bg-gradient-to-r", gradient)} />
            <div className="relative z-10 h-9 w-9 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Icon className="h-4 w-4 text-green-400" />
            </div>
            <div className="relative z-10 text-left flex-1">
              <p className="text-xs font-display font-bold text-foreground">{label}</p>
              <p className="text-[10px] font-body text-muted-foreground">{desc}</p>
            </div>
            <Sparkles className="relative z-10 h-3.5 w-3.5 text-green-400/40" />
          </button>
        ))}

        <p className="text-[9px] font-body text-muted-foreground/60 text-center pt-1">
          Abre o WhatsApp com a mensagem pronta para enviar 💚
        </p>
      </div>
    </div>
  );
};

export default WhatsAppAIAssistant;

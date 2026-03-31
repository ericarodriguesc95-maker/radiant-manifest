import { useState, useMemo } from "react";
import { ArrowLeft, Sun, Sparkles, Music, Thermometer, PenLine, Heart, Mic, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import RitualMatinal from "./RitualMatinal";
import EuSuperior from "./EuSuperior";
import FrequenciasCura from "./FrequenciasCura";
import TermometroVibracional from "./TermometroVibracional";
import ManifestacaoEscrita from "./ManifestacaoEscrita";
import QuadroDosSonhos from "./QuadroDosSonhos";

type View = "hub" | "ritual" | "eu-superior" | "frequencias" | "termometro" | "manifestacao-escrita" | "quadro-sonhos";

const dailyQuotes = [
  "Você não precisa de mais uma técnica. Você precisa ser cuidada todos os dias, enquanto constrói a realidade que deseja viver.",
  "Manifestar não acontece apenas quando você visualiza. Acontece no jeito como você pensa, sente e se posiciona no dia a dia.",
  "A sua vibração é o convite que o universo lê antes de qualquer palavra que você diga.",
  "Gratidão não é só agradecer. É vibrar na frequência de quem já recebeu.",
  "Você já é a versão que deseja ser. Só precisa parar de duvidar disso.",
  "O universo não responde ao que você quer. Responde ao que você vibra.",
  "Cada pensamento é uma semente. Escolha plantar o que deseja colher.",
  "A abundância começa quando você para de contar o que falta e começa a celebrar o que já existe.",
  "Sua energia fala antes de você. Cuide dela como cuida do seu sonho mais bonito.",
  "Não espere o momento perfeito. Crie a vibração perfeita agora.",
  "Quando você muda a frequência, muda a realidade.",
  "Confie no tempo do universo. Ele sabe exatamente quando entregar o que é seu.",
  "Tudo sempre dá certo pra mim — repita até que seu corpo acredite.",
  "Você merece tudo aquilo que não consegue parar de imaginar.",
  "A melhor versão de você não está no futuro. Está em cada escolha que você faz agora.",
  "Solte o controle. O que é seu vai te encontrar no caminho.",
  "Sua intuição é a voz do seu Eu Superior. Aprenda a ouvi-la.",
  "Cada amanhecer é um recomeço. Use-o com intenção.",
  "Você não atrai o que quer, atrai o que você é. Seja magnética.",
  "A realidade que você deseja já existe. Alinhe-se a ela.",
  "Permita-se receber. Você já fez o suficiente para merecer.",
  "O impossível é só o possível que ainda não acreditaram.",
  "Sua história está sendo reescrita a cada pensamento consciente.",
  "Respire fundo. Você está exatamente onde precisa estar.",
  "A magia acontece quando você para de forçar e começa a fluir.",
  "Não subestime o poder de um dia vivido com presença.",
  "Você é a criadora da sua realidade. Crie com amor.",
  "Quando a dúvida aparecer, lembre-se: você já superou coisas que achou impossíveis.",
  "Seu brilho incomoda quem ainda não encontrou o próprio. Continue brilhando.",
  "Hoje é o dia perfeito pra manifestar algo extraordinário.",
  "A constância transforma intenção em realidade.",
];

const menuItems: { id: View; icon: React.ElementType; label: string }[] = [
  { id: "ritual", icon: Sun, label: "Começar meu dia" },
  { id: "eu-superior", icon: Sparkles, label: "Conversar com meu Eu Superior" },
  { id: "frequencias", icon: Music, label: "Preciso alinhar minha vibração" },
  { id: "manifestacao-escrita", icon: PenLine, label: "Escrever no meu diário vibracional" },
  { id: "quadro-sonhos", icon: ImageIcon, label: "Meu quadro dos sonhos" },
  { id: "termometro", icon: Thermometer, label: "Meu termômetro emocional" },
];

export default function ManifestacaoHub() {
  const [view, setView] = useState<View>("hub");

  if (view !== "hub") {
    const Component = {
      ritual: RitualMatinal,
      "eu-superior": EuSuperior,
      frequencias: FrequenciasCura,
      termometro: TermometroVibracional,
      "manifestacao-escrita": ManifestacaoEscrita,
    }[view];

    return (
      <div className="animate-fade-in">
        <button
          onClick={() => setView("hub")}
          className="flex items-center gap-2 text-sm text-muted-foreground font-body mb-4 hover:text-gold transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>
        <Component />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/10 border border-gold/20">
          <Sparkles className="h-3 w-3 text-gold" />
          <span className="text-[10px] font-body font-semibold text-gold uppercase tracking-widest">Manifestação Consciente</span>
        </div>
        <h2 className="text-xl font-display font-bold text-foreground">
          Meu Manifesto <span className="text-gold">Diário</span>
        </h2>
        <p className="text-xs font-body text-muted-foreground italic leading-relaxed max-w-xs mx-auto">
          "Tudo sempre dá certo pra mim!"
        </p>
        <p className="text-[10px] font-body text-muted-foreground">
          {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Quote card */}
      <div className="glass-gold rounded-2xl p-4 text-center space-y-2">
        <Heart className="h-4 w-4 text-gold mx-auto" />
        <p className="text-xs font-body text-foreground/80 italic leading-relaxed">
          "Você não precisa de mais uma técnica. Você precisa ser cuidada todos os dias, enquanto constrói a realidade que deseja viver."
        </p>
      </div>

      {/* Menu buttons */}
      <div className="space-y-2.5">
        {menuItems.map((item, i) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-gold/90 hover:bg-gold text-background font-body font-semibold text-sm transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg animate-stagger"
              style={{ "--stagger": i } as React.CSSProperties}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Voice command hint */}
      <div className="flex items-center justify-center gap-2 py-2">
        <Mic className="h-3.5 w-3.5 text-gold/60" />
        <p className="text-[10px] font-body text-muted-foreground">
          Comando de voz disponível em cada seção
        </p>
      </div>

      {/* Benefits */}
      <div className="glass rounded-2xl p-4 space-y-3">
        <p className="text-xs font-body font-semibold text-gold uppercase tracking-wider">O que muda na sua vida</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { title: "Clareza imediata", desc: "Acorde sabendo o que quer" },
            { title: "Hábito favorito", desc: "Prazer em evoluir todo dia" },
            { title: "Conexão direta", desc: "Ouça suas respostas internas" },
            { title: "Vibração no bolso", desc: "Eleve sua frequência na hora" },
          ].map(b => (
            <div key={b.title} className="glass-gold rounded-xl p-3 space-y-1">
              <p className="text-[11px] font-body font-semibold text-foreground">{b.title}</p>
              <p className="text-[10px] font-body text-muted-foreground">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

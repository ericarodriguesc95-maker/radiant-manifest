import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, Trophy, Flame, Users, Star, Crown, Diamond, Award, Sparkles, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import FourPointStar from "@/components/FourPointStar";

interface Challenge {
  id: string;
  days: number;
  title: string;
  theme: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  borderColor: string;
  tasks: string[];
}

interface ForumMessage {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: number;
}

const CHALLENGES: Challenge[] = [
  {
    id: "7-mente",
    days: 7,
    title: "Despertar Mental",
    theme: "Mente",
    description: "7 dias para clareza mental, meditação e journaling consciente.",
    icon: <Sparkles className="h-6 w-6" />,
    gradient: "from-[hsl(43,72%,52%)] to-[hsl(43,60%,65%)]",
    borderColor: "border-[hsl(43,72%,52%)/0.4]",
    tasks: ["Meditar 10min", "Journaling", "Leitura 15min", "Respiração 4-7-8", "Gratidão", "Digital detox 1h", "Afirmação positiva"],
  },
  {
    id: "15-corpo",
    days: 15,
    title: "Corpo em Movimento",
    theme: "Corpo",
    description: "15 dias de movimento, hidratação e alimentação consciente.",
    icon: <Flame className="h-6 w-6" />,
    gradient: "from-[hsl(43,72%,52%)] to-[hsl(30,80%,55%)]",
    borderColor: "border-[hsl(30,80%,55%)/0.4]",
    tasks: ["30min exercício", "3L água", "Alimentação limpa", "Skincare", "Alongamento", "Sono 7h+"],
  },
  {
    id: "21-alma",
    days: 21,
    title: "Reconexão Interior",
    theme: "Alma",
    description: "21 dias para reconectar com sua essência, propósito e paz interior.",
    icon: <Star className="h-6 w-6" />,
    gradient: "from-[hsl(43,60%,65%)] to-[hsl(0,0%,75%)]",
    borderColor: "border-[hsl(0,0%,75%)/0.5]",
    tasks: ["Meditação guiada", "Gratidão profunda", "Ho'oponopono", "Visualização", "Natureza 20min", "Desapego de 1 item"],
  },
  {
    id: "30-evolucao",
    days: 30,
    title: "Evolução Total",
    theme: "Evolução Pessoal",
    description: "30 dias integrando mente, corpo e alma para transformação completa.",
    icon: <Trophy className="h-6 w-6" />,
    gradient: "from-[hsl(43,72%,52%)] to-[hsl(0,0%,80%)]",
    borderColor: "border-[hsl(0,0%,80%)/0.5]",
    tasks: ["Rotina matinal", "Exercício", "Leitura", "Meta do dia", "Hidratação", "Reflexão noturna", "Sem redes 2h"],
  },
  {
    id: "45-diamante",
    days: 45,
    title: "Mentalidade Diamante",
    theme: "Mente & Corpo",
    description: "45 dias de disciplina intensa para forjar resiliência e clareza.",
    icon: <Diamond className="h-6 w-6" />,
    gradient: "from-[hsl(0,0%,70%)] to-[hsl(0,0%,85%)]",
    borderColor: "border-[hsl(0,0%,85%)/0.6]",
    tasks: ["Acorda 5h", "Treino intenso", "Leitura 30min", "Cold shower", "Journaling", "Sem açúcar", "Meditação"],
  },
  {
    id: "60-platina",
    days: 60,
    title: "Jornada Platina",
    theme: "Corpo & Alma",
    description: "60 dias de compromisso profundo com a melhor versão de si mesma.",
    icon: <Crown className="h-6 w-6" />,
    gradient: "from-[hsl(0,0%,78%)] to-[hsl(0,0%,92%)]",
    borderColor: "border-[hsl(0,0%,90%)/0.6]",
    tasks: ["Rotina completa", "Treino", "Alimentação clean", "Estudo 1h", "Skincare AM/PM", "Meditação", "Sono regulado"],
  },
  {
    id: "90-elite",
    days: 90,
    title: "Elite Performance",
    theme: "Transformação Total",
    description: "90 dias para uma transformação completa e irreversível. O desafio supremo.",
    icon: <Award className="h-6 w-6" />,
    gradient: "from-[hsl(43,72%,52%)] via-[hsl(0,0%,85%)] to-[hsl(0,0%,95%)]",
    borderColor: "border-[hsl(43,72%,52%)/0.3]",
    tasks: ["Despertar 5h", "Treino 1h", "Leitura 30min", "Meta principal", "Hidratação 3L", "Skincare", "Reflexão", "Sono 22h"],
  },
];

function getParticipantCount(challengeId: string): number {
  const stored = localStorage.getItem(`challenge-participants-${challengeId}`);
  if (stored) return parseInt(stored);
  const base = { "7-mente": 127, "15-corpo": 89, "21-alma": 214, "30-evolucao": 156, "45-diamante": 67, "60-platina": 43, "90-elite": 31 };
  return (base as any)[challengeId] || 50;
}

function joinChallenge(challengeId: string) {
  const key = `challenge-joined-${challengeId}`;
  if (localStorage.getItem(key)) return;
  localStorage.setItem(key, new Date().toISOString());
  const count = getParticipantCount(challengeId);
  localStorage.setItem(`challenge-participants-${challengeId}`, String(count + 1));
}

function isJoined(challengeId: string): boolean {
  return !!localStorage.getItem(`challenge-joined-${challengeId}`);
}

function getChallengeProgress(challengeId: string): Set<number> {
  try {
    const data = localStorage.getItem(`challenge-progress-${challengeId}`);
    return data ? new Set(JSON.parse(data)) : new Set();
  } catch { return new Set(); }
}

function saveChallengeProgress(challengeId: string, days: Set<number>) {
  localStorage.setItem(`challenge-progress-${challengeId}`, JSON.stringify([...days]));
}

function getForumMessages(challengeId: string): ForumMessage[] {
  try {
    const data = localStorage.getItem(`challenge-forum-${challengeId}`);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

function saveForumMessage(challengeId: string, msg: ForumMessage) {
  const msgs = getForumMessages(challengeId);
  msgs.push(msg);
  localStorage.setItem(`challenge-forum-${challengeId}`, JSON.stringify(msgs));
}

// NPS Modal
function NPSModal({ open, onClose, challengeTitle }: { open: boolean; onClose: () => void; challengeTitle: string }) {
  const [score, setScore] = useState<number | null>(null);
  const [shared, setShared] = useState(false);

  const handleShare = () => {
    const text = `🏆 Completei o desafio "${challengeTitle}" no Performance Glow Up! ✨🔥 #GlowUp #Desafio`;
    if (navigator.share) {
      navigator.share({ title: "Conquista Glow Up", text });
    } else {
      navigator.clipboard.writeText(text);
    }
    setShared(true);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center font-display">
            🎉 Parabéns!
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-center">
          <p className="text-sm font-body text-muted-foreground">
            Você concluiu o desafio <strong className="text-foreground">{challengeTitle}</strong>!
          </p>
          <div className="space-y-2">
            <p className="text-xs font-body text-muted-foreground">De 0 a 10, qual a chance de recomendar este desafio?</p>
            <div className="flex gap-1 justify-center flex-wrap">
              {Array.from({ length: 11 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setScore(i)}
                  className={cn(
                    "w-8 h-8 rounded-lg text-xs font-bold transition-all",
                    score === i
                      ? "bg-gold text-white shadow-brand scale-110"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {i}
                </button>
              ))}
            </div>
            {score !== null && (
              <p className="text-xs text-gold font-body animate-fade-in">
                {score >= 9 ? "Incrível! 💛" : score >= 7 ? "Obrigada! ✨" : "Vamos melhorar! 🙏"}
              </p>
            )}
          </div>
          <Button onClick={handleShare} className="w-full bg-gold hover:bg-gold/90 text-white gap-2">
            <Share2 className="h-4 w-4" />
            {shared ? "Copiado! ✨" : "Compartilhar Conclusão"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function DesafiosPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [showForum, setShowForum] = useState(false);
  const [forumMessages, setForumMessages] = useState<ForumMessage[]>([]);
  const [forumMsg, setForumMsg] = useState("");
  const [completedDays, setCompletedDays] = useState<Set<number>>(new Set());
  const [showNPS, setShowNPS] = useState(false);
  const [justCompletedDay, setJustCompletedDay] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedChallenge) {
      setCompletedDays(getChallengeProgress(selectedChallenge.id));
      setForumMessages(getForumMessages(selectedChallenge.id));
    }
  }, [selectedChallenge]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [forumMessages]);

  const handleJoin = (challenge: Challenge) => {
    joinChallenge(challenge.id);
    setSelectedChallenge(challenge);
  };

  const toggleDay = (day: number) => {
    if (!selectedChallenge) return;
    const next = new Set(completedDays);
    if (next.has(day)) {
      next.delete(day);
    } else {
      next.add(day);
      setJustCompletedDay(day);
      setTimeout(() => setJustCompletedDay(null), 1200);
    }
    setCompletedDays(next);
    saveChallengeProgress(selectedChallenge.id, next);

    // Check if challenge is complete
    if (next.size >= selectedChallenge.days && !completedDays.has(day)) {
      setTimeout(() => setShowNPS(true), 800);
    }
  };

  const sendForumMessage = () => {
    if (!forumMsg.trim() || !selectedChallenge || !user) return;
    const msg: ForumMessage = {
      id: `${Date.now()}`,
      userId: user.id,
      userName: profile?.display_name || "Anônima",
      text: forumMsg.trim(),
      timestamp: Date.now(),
    };
    saveForumMessage(selectedChallenge.id, msg);
    setForumMessages(getForumMessages(selectedChallenge.id));
    setForumMsg("");
  };

  // Forum view
  if (showForum && selectedChallenge) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
          <button onClick={() => setShowForum(false)} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <p className="text-sm font-semibold font-body">Mural: {selectedChallenge.title}</p>
            <p className="text-[10px] text-muted-foreground font-body">
              🔥 {getParticipantCount(selectedChallenge.id)} participando
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-20">
          {forumMessages.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8 font-body">
              Seja a primeira a enviar uma mensagem! 💬
            </p>
          )}
          {forumMessages.map(msg => {
            const isMe = msg.userId === user?.id;
            return (
              <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[75%] rounded-2xl px-3 py-2",
                  isMe ? "bg-gold text-white rounded-br-md" : "bg-muted text-foreground rounded-bl-md"
                )}>
                  {!isMe && <p className="text-[10px] font-semibold text-gold mb-0.5">{msg.userName}</p>}
                  <p className="text-sm font-body">{msg.text}</p>
                  <p className={cn("text-[10px] mt-0.5", isMe ? "text-white/60" : "text-muted-foreground")}>
                    {new Date(msg.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="fixed bottom-16 left-0 right-0 flex items-center gap-2 p-3 border-t border-border bg-card max-w-2xl mx-auto">
          <input
            value={forumMsg}
            onChange={e => setForumMsg(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") sendForumMessage(); }}
            placeholder="Mensagem para o grupo..."
            className="flex-1 bg-muted/50 rounded-full px-4 py-2 text-sm font-body outline-none"
          />
          <button onClick={sendForumMessage} disabled={!forumMsg.trim()} className="text-gold disabled:text-muted-foreground">
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }

  // Challenge detail view
  if (selectedChallenge) {
    const progress = (completedDays.size / selectedChallenge.days) * 100;
    return (
      <div className="min-h-screen pb-20 pt-6 px-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setSelectedChallenge(null)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Desafios
          </button>
          <button
            onClick={() => setShowForum(true)}
            className="flex items-center gap-1.5 text-sm font-body text-gold hover:text-gold/80 transition-colors"
          >
            <Users className="h-4 w-4" /> Mural da Turma
          </button>
        </div>

        <div className={cn("rounded-2xl p-6 mb-6 bg-gradient-to-br text-white", selectedChallenge.gradient)}>
          <div className="flex items-center gap-3 mb-3">
            {selectedChallenge.icon}
            <div>
              <h2 className="text-lg font-display font-bold">{selectedChallenge.title}</h2>
              <p className="text-xs opacity-80">{selectedChallenge.theme} · {selectedChallenge.days} dias</p>
            </div>
          </div>
          <div className="bg-white/20 rounded-full h-2 overflow-hidden mb-2">
            <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs opacity-80">{completedDays.size}/{selectedChallenge.days} dias concluídos</p>
        </div>

        <div className="flex items-center gap-2 mb-4 text-sm font-body text-muted-foreground">
          <Flame className="h-4 w-4 text-orange-400" />
          <span>{getParticipantCount(selectedChallenge.id)} meninas participando</span>
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-2 mb-6">
          {Array.from({ length: selectedChallenge.days }, (_, i) => {
            const day = i + 1;
            const done = completedDays.has(day);
            const justDone = justCompletedDay === day;
            return (
              <button
                key={day}
                onClick={() => toggleDay(day)}
                className={cn(
                  "aspect-square rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-300 relative",
                  done
                    ? "bg-gold text-white shadow-brand"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 border border-border"
                )}
              >
                {done ? (
                  <FourPointStar
                    size={16}
                    fill="white"
                    className={cn("text-white", justDone && "animate-star-pulse")}
                  />
                ) : (
                  day
                )}
                {justDone && (
                  <div className="absolute inset-0 rounded-xl animate-ping bg-gold/30 pointer-events-none" />
                )}
              </button>
            );
          })}
        </div>

        {/* Daily tasks */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <h3 className="text-sm font-display font-semibold mb-3">Tarefas do Dia</h3>
          <div className="space-y-2">
            {selectedChallenge.tasks.map((task, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-xl bg-muted/50">
                <div className="h-5 w-5 rounded-full border-2 border-gold/40 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-gold/40" />
                </div>
                <span className="text-sm font-body">{task}</span>
              </div>
            ))}
          </div>
        </div>

        <NPSModal open={showNPS} onClose={() => setShowNPS(false)} challengeTitle={selectedChallenge.title} />
      </div>
    );
  }

  // Challenge selection
  return (
    <div className="min-h-screen pb-20 pt-6 px-4 max-w-2xl mx-auto">
      <div className="mb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="h-5 w-5 text-gold" />
          <h1 className="text-2xl font-display font-semibold text-foreground">Desafios</h1>
        </div>
        <p className="text-sm text-muted-foreground font-body">Escolha sua jornada de transformação</p>
      </div>

      <div className="space-y-4">
        {CHALLENGES.map((challenge, idx) => {
          const joined = isJoined(challenge.id);
          const participants = getParticipantCount(challenge.id);
          return (
            <div
              key={challenge.id}
              className={cn(
                "rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-brand cursor-pointer animate-fade-in",
                challenge.borderColor
              )}
              style={{ animationDelay: `${idx * 80}ms` }}
              onClick={() => joined ? setSelectedChallenge(challenge) : undefined}
            >
              <div className={cn("bg-gradient-to-r p-5 text-white", challenge.gradient)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {challenge.icon}
                    <div>
                      <h3 className="font-display font-bold text-base">{challenge.title}</h3>
                      <p className="text-xs opacity-80">{challenge.theme} · {challenge.days} dias</p>
                    </div>
                  </div>
                  {challenge.days >= 60 && (
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-body">ELITE</span>
                  )}
                </div>
                <p className="text-xs opacity-80 mt-2 font-body leading-relaxed">{challenge.description}</p>
              </div>
              <div className="bg-card px-5 py-3 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-body text-muted-foreground">
                  <Flame className="h-3.5 w-3.5 text-orange-400" />
                  {participants} meninas participando
                </span>
                {joined ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs border-gold text-gold hover:bg-gold/10"
                    onClick={(e) => { e.stopPropagation(); setSelectedChallenge(challenge); }}
                  >
                    Continuar
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="text-xs bg-gold hover:bg-gold/90 text-white"
                    onClick={(e) => { e.stopPropagation(); handleJoin(challenge); }}
                  >
                    Participar também
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Plus, Trash2, Pencil, Check, X, TrendingUp, CreditCard, PiggyBank, ArrowUpDown, Lightbulb, Bot, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, ResponsiveContainer } from "recharts";

type EntryType = "renda" | "fixa" | "variavel" | "cartao" | "poupanca";

interface FinanceEntry {
  id: string;
  description: string;
  amount: number;
  type: EntryType;
}

const monthNames = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const typeLabels: Record<EntryType, string> = {
  renda: "Renda",
  fixa: "Despesa Fixa",
  variavel: "Despesa Variável",
  cartao: "Cartão de Crédito",
  poupanca: "Poupança",
};

const typeColors: Record<EntryType, string> = {
  renda: "text-green-500",
  fixa: "text-red-400",
  variavel: "text-orange-400",
  cartao: "text-purple-400",
  poupanca: "text-blue-400",
};

const typeIcons: Record<EntryType, string> = {
  renda: "💰",
  fixa: "📌",
  variavel: "🛒",
  cartao: "💳",
  poupanca: "🐷",
};

const financeTips = [
  // Consultoria Comportamental Financeira
  { icon: "🧠", title: "Gatilhos Emocionais de Compra", desc: "Identifique quando você compra por ansiedade, tédio ou recompensa emocional. Antes de comprar, espere 48h — se ainda quiser, é desejo real. A neurociência mostra que 70% das compras impulsivas são motivadas por dopamina, não necessidade." },
  { icon: "💔", title: "Síndrome da Impostora Financeira", desc: "Muitas mulheres sentem que 'não merecem' ter dinheiro ou investir. Isso vem de crenças limitantes da infância. Reprograme: 'Eu mereço abundância e sei administrar meu dinheiro com sabedoria.'" },
  { icon: "🪞", title: "Autoconhecimento Financeiro", desc: "Qual seu perfil: gastadora emocional, acumuladora ansiosa ou equilibrada? Entender seu padrão comportamental é o primeiro passo para transformar sua relação com dinheiro." },
  { icon: "⚡", title: "Efeito Manada nas Finanças", desc: "Não compre algo só porque 'todo mundo tem'. Comparação social é o maior sabotador financeiro. Mulheres de elite definem seu próprio padrão de vida baseado em seus valores, não nos dos outros." },
  { icon: "🎯", title: "Metas com Propósito Emocional", desc: "Metas financeiras genéricas falham. Conecte cada meta a um 'porquê' emocional forte: 'Quero R$50 mil para nunca mais depender de ninguém'. O cérebro se motiva mais com significado do que com números." },
  { icon: "💎", title: "Regra 50/30/20 Consciente", desc: "50% necessidades, 30% desejos, 20% investimentos. Mas o segredo comportamental é: pague-se primeiro. Transfira os 20% no dia que receber, antes de gastar qualquer centavo." },
  { icon: "🏦", title: "Reserva = Liberdade Emocional", desc: "6 meses de despesas guardados não é só segurança financeira — é saúde mental. Pesquisas mostram que ter reserva reduz ansiedade em 40% e melhora qualidade do sono." },
  { icon: "💳", title: "Desintoxicação do Cartão", desc: "Se você usa o cartão compulsivamente, faça um 'detox': 30 dias só com dinheiro/débito. Isso ativa a 'dor de pagar' no cérebro, tornando você mais consciente de cada gasto." },
  { icon: "👑", title: "Mentalidade de CEO da Sua Vida", desc: "Trate suas finanças como uma empresa. Faça reuniões semanais consigo mesma: analise receitas, despesas e investimentos. CEOs não ignoram o financeiro — você também não deveria." },
  { icon: "🌙", title: "Ritual Financeiro Noturno", desc: "Antes de dormir, revise seus gastos do dia em 2 minutos. Esse hábito ativa o córtex pré-frontal e cria consciência financeira automática em 21 dias." },
  { icon: "🦋", title: "Perdoe Seus Erros Financeiros", desc: "Culpa por dívidas passadas paralisa. Perdoe-se, aprenda e siga em frente. Neurociência comprova: autocrítica excessiva ativa o modo de sobrevivência e leva a mais gastos compulsivos." },
  { icon: "🔥", title: "Inflação do Estilo de Vida", desc: "Ganhou aumento? Não aumente seus gastos na mesma proporção. Invista pelo menos 50% de cada aumento. Esse é o segredo silencioso das mulheres que constroem riqueza real." },
  { icon: "🛡️", title: "Proteção x Autossabotagem", desc: "Adiar seguro de vida e previdência é autossabotagem disfarçada de 'depois eu vejo'. Mulheres inteligentes protegem o que constroem HOJE, não amanhã." },
  { icon: "🌟", title: "Abundância é Decisão", desc: "Escassez é um programa mental, não uma realidade. Troque 'não tenho dinheiro' por 'como posso gerar mais?'. Seu cérebro responde às perguntas que você faz — faça as certas." },
];

// ─── Finance AI Chat Component ─────────────────────────────────────────────

interface FinanceAIChatProps {
  userId: string;
  renda: number;
  despFixas: number;
  despVar: number;
  cartao: number;
  poupanca: number;
  saldo: number;
}

interface AiMsg {
  role: "user" | "assistant";
  content: string;
}

const FINANCE_AI_KEY = "finance-ai-messages";

function FinanceAIChat({ renda, despFixas, despVar, cartao, poupanca, saldo }: FinanceAIChatProps) {
  const [messages, setMessages] = useState<AiMsg[]>(() => {
    try { const r = localStorage.getItem(FINANCE_AI_KEY); return r ? JSON.parse(r) : []; } catch { return []; }
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try { localStorage.setItem(FINANCE_AI_KEY, JSON.stringify(messages)); } catch {}
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      requestAnimationFrame(() => { scrollRef.current && (scrollRef.current.scrollTop = scrollRef.current.scrollHeight); });
    }
  }, [messages, loading]);

  const sendMessage = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    const userMsg: AiMsg = { role: "user", content: msg };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);

    try {
      const contextMsg = `Contexto financeiro atual da usuária: Renda: R$${renda.toFixed(2)}, Despesas Fixas: R$${despFixas.toFixed(2)}, Despesas Variáveis: R$${despVar.toFixed(2)}, Cartão de Crédito: R$${cartao.toFixed(2)}, Poupança: R$${poupanca.toFixed(2)}, Saldo: R$${saldo.toFixed(2)}`;

      const { data, error } = await supabase.functions.invoke("ai-assistant", {
        body: {
          messages: [
            { role: "user", content: contextMsg },
            { role: "assistant", content: "Entendi seu contexto financeiro! Como posso te ajudar?" },
            ...newMsgs,
          ],
          systemOverride: "Você é uma consultora comportamental financeira especializada em psicologia do dinheiro e finanças para mulheres. Responda sempre em português brasileiro, com linguagem empoderada e prática. Combine análise financeira com insights de neurociência, psicologia comportamental e inteligência emocional. Identifique padrões de autossabotagem, gatilhos emocionais de compra e crenças limitantes sobre dinheiro. Dê dicas baseadas no contexto financeiro real da usuária. Seja concisa, use emojis e formate com markdown. Foque em: comportamento financeiro, reprogramação de crenças sobre dinheiro, investimentos conscientes, planejamento com propósito e mentalidade de abundância feminina.",
        },
      });

      if (error) throw error;
      const reply = data?.reply || "Desculpe, tente novamente 💛";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      toast.error("Erro ao consultar IA financeira");
      setMessages(messages);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "Como economizar mais com meu salário atual?",
    "Dicas para sair das dívidas do cartão",
    "Como começar a investir com pouco dinheiro?",
    "Monte um plano financeiro para mim",
  ];

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden mt-3">
      <div className="p-4 border-b border-border flex items-center gap-2">
        <Bot className="h-4 w-4 text-gold" />
        <div>
          <h3 className="text-sm font-display font-semibold">Consultora Financeira IA ✨</h3>
          <p className="text-[10px] text-muted-foreground font-body">Sua mentora de finanças pessoal</p>
        </div>
      </div>

      <div ref={scrollRef} className="h-[350px] overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <div className="h-12 w-12 rounded-full bg-gold/10 flex items-center justify-center">
              <Bot className="h-6 w-6 text-gold" />
            </div>
            <p className="text-xs font-body text-muted-foreground">
              Pergunte sobre investimentos, economia, planejamento...
            </p>
            <div className="space-y-2 w-full max-w-xs">
              {suggestions.map(s => (
                <button key={s} onClick={() => sendMessage(s)} className="w-full text-left text-[11px] p-2 rounded-lg border border-border bg-muted/30 hover:bg-muted transition-colors text-muted-foreground font-body">
                  💡 {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={cn("max-w-[85%] rounded-2xl px-3 py-2 text-sm font-body",
              m.role === "user" ? "bg-gold text-primary-foreground rounded-br-sm" : "bg-muted/50 border border-border rounded-bl-sm"
            )}>
              {m.role === "assistant" ? (
                <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:m-0 [&_ul]:my-1 [&_li]:my-0">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              ) : <p>{m.content}</p>}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-muted/50 border border-border rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-2 w-2 rounded-full bg-gold animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="h-2 w-2 rounded-full bg-gold animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="h-2 w-2 rounded-full bg-gold animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-border flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          placeholder="Pergunte sobre finanças..."
          disabled={loading}
          className="flex-1 bg-muted/50 border border-border rounded-xl px-3 py-2 text-sm font-body outline-none focus:ring-2 focus:ring-gold/50 placeholder:text-muted-foreground/50 disabled:opacity-50 text-foreground"
        />
        <Button onClick={() => sendMessage()} disabled={!input.trim() || loading} size="icon" className="h-9 w-9 rounded-xl bg-gold text-primary-foreground hover:bg-gold/90 shrink-0">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

const FinancasPage = () => {
  const { user } = useAuth();
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear] = useState(now.getFullYear());
  const [entries, setEntries] = useState<FinanceEntry[]>([]);
  const [allYearEntries, setAllYearEntries] = useState<{ month: number; type: string; amount: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newDesc, setNewDesc] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newType, setNewType] = useState<EntryType>("renda");
  const [notes, setNotes] = useState("");
  const [notesSaving, setNotesSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDesc, setEditDesc] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editType, setEditType] = useState<EntryType>("renda");
  const [activeTab, setActiveTab] = useState("registros");

  const fetchEntries = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [{ data }, { data: noteData }, { data: yearData }] = await Promise.all([
      supabase
        .from("finance_entries")
        .select("*")
        .eq("user_id", user.id)
        .eq("month", currentMonth)
        .eq("year", currentYear)
        .order("created_at", { ascending: true }),
      supabase
        .from("finance_notes")
        .select("content")
        .eq("user_id", user.id)
        .eq("month", currentMonth)
        .eq("year", currentYear)
        .maybeSingle(),
      supabase
        .from("finance_entries")
        .select("month, type, amount")
        .eq("user_id", user.id)
        .eq("year", currentYear),
    ]);
    setEntries((data || []).map((e: any) => ({ id: e.id, description: e.description, amount: Number(e.amount), type: e.type })));
    setAllYearEntries((yearData || []).map((e: any) => ({ month: e.month, type: e.type, amount: Number(e.amount) })));
    setNotes(noteData?.content || "");
    setLoading(false);
  }, [user, currentMonth, currentYear]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const filterByTypes = (types: EntryType[]) => entries.filter(e => types.includes(e.type));

  const renda = entries.filter(e => e.type === "renda").reduce((s, e) => s + e.amount, 0);
  const despFixas = entries.filter(e => e.type === "fixa").reduce((s, e) => s + e.amount, 0);
  const despVar = entries.filter(e => e.type === "variavel").reduce((s, e) => s + e.amount, 0);
  const cartao = entries.filter(e => e.type === "cartao").reduce((s, e) => s + e.amount, 0);
  const poupanca = entries.filter(e => e.type === "poupanca").reduce((s, e) => s + e.amount, 0);
  const saldo = renda - despFixas - despVar - cartao;

  // Chart data
  const chartData = useMemo(() => {
    return monthNames.map((name, i) => {
      const monthEntries = allYearEntries.filter(e => e.month === i);
      const r = monthEntries.filter(e => e.type === "renda").reduce((s, e) => s + e.amount, 0);
      const gastos = monthEntries.filter(e => ["fixa", "variavel", "cartao"].includes(e.type)).reduce((s, e) => s + e.amount, 0);
      const p = monthEntries.filter(e => e.type === "poupanca").reduce((s, e) => s + e.amount, 0);
      return { name: name.slice(0, 3), renda: r, gastos, poupanca: p };
    });
  }, [allYearEntries]);

  const chartConfig = {
    renda: { label: "Renda", color: "hsl(142, 71%, 45%)" },
    gastos: { label: "Gastos", color: "hsl(0, 72%, 50%)" },
    poupanca: { label: "Poupança", color: "hsl(210, 80%, 55%)" },
  };

  const addEntry = async () => {
    if (!newDesc || !newAmount || !user) return;
    const amount = parseFloat(newAmount);
    if (isNaN(amount)) return;
    const { data, error } = await supabase
      .from("finance_entries")
      .insert({ user_id: user.id, description: newDesc, amount, type: newType, month: currentMonth, year: currentYear })
      .select()
      .single();
    if (error) { toast.error("Erro ao adicionar"); return; }
    setEntries(prev => [...prev, { id: data.id, description: data.description, amount: Number(data.amount), type: data.type as EntryType }]);
    setAllYearEntries(prev => [...prev, { month: currentMonth, type: data.type, amount: Number(data.amount) }]);
    setNewDesc(""); setNewAmount(""); setShowAdd(false);
    toast.success("Lançamento adicionado!");
  };

  const removeEntry = async (id: string) => {
    const prev = entries;
    setEntries(e => e.filter(x => x.id !== id));
    const { error } = await supabase.from("finance_entries").delete().eq("id", id);
    if (error) { setEntries(prev); toast.error("Erro ao excluir"); }
    else fetchEntries();
  };

  const startEdit = (entry: FinanceEntry) => {
    setEditingId(entry.id);
    setEditDesc(entry.description);
    setEditAmount(String(entry.amount));
    setEditType(entry.type);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const amount = parseFloat(editAmount);
    if (isNaN(amount)) return;
    const prev = entries;
    setEntries(e => e.map(x => x.id === editingId ? { ...x, description: editDesc, amount, type: editType } : x));
    const { error } = await supabase
      .from("finance_entries")
      .update({ description: editDesc, amount, type: editType })
      .eq("id", editingId);
    if (error) { setEntries(prev); toast.error("Erro ao salvar"); }
    else { toast.success("Atualizado!"); fetchEntries(); }
    setEditingId(null);
  };

  const saveNotes = async () => {
    if (!user) return;
    setNotesSaving(true);
    await supabase
      .from("finance_notes")
      .upsert({ user_id: user.id, month: currentMonth, year: currentYear, content: notes, updated_at: new Date().toISOString() }, { onConflict: "user_id,month,year" });
    setNotesSaving(false);
    toast.success("Notas salvas!");
  };

  const renderEntryList = (types: EntryType[], emptyMsg: string) => {
    const filtered = filterByTypes(types);
    if (loading) return <div className="p-4 text-center text-muted-foreground text-sm font-body">Carregando...</div>;
    if (filtered.length === 0) return <div className="p-4 text-center text-muted-foreground text-sm font-body">{emptyMsg}</div>;
    return (
      <div className="divide-y divide-border">
        {filtered.map(entry => (
          <div key={entry.id} className="flex items-center justify-between p-4">
            {editingId === entry.id ? (
              <div className="flex-1 space-y-2">
                <input value={editDesc} onChange={e => setEditDesc(e.target.value)} className="w-full bg-muted rounded-lg px-2 py-1 text-sm font-body outline-none" />
                <input value={editAmount} onChange={e => setEditAmount(e.target.value)} type="number" className="w-full bg-muted rounded-lg px-2 py-1 text-sm font-body outline-none" />
                <div className="flex gap-1 flex-wrap">
                  {types.map(t => (
                    <button key={t} onClick={() => setEditType(t)} className={cn("px-2 py-0.5 rounded-full text-[10px] font-body", editType === t ? "bg-gold/20 text-gold" : "bg-muted text-muted-foreground")}>
                      {typeLabels[t]}
                    </button>
                  ))}
                </div>
                <div className="flex gap-1">
                  <button onClick={saveEdit} className="p-1 text-green-500"><Check className="h-4 w-4" /></button>
                  <button onClick={() => setEditingId(null)} className="p-1 text-muted-foreground"><X className="h-4 w-4" /></button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{typeIcons[entry.type]}</span>
                  <div>
                    <p className="text-sm font-body font-medium">{entry.description}</p>
                    <p className={cn("text-[10px] font-body", typeColors[entry.type])}>{typeLabels[entry.type]}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("text-sm font-body font-semibold", typeColors[entry.type])}>
                    {entry.type === "renda" ? "+" : "-"} R$ {entry.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                  <button onClick={() => startEdit(entry)} className="p-1 text-muted-foreground hover:text-gold"><Pencil className="h-3 w-3" /></button>
                  <button onClick={() => removeEntry(entry.id)} className="p-1 text-muted-foreground hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground font-body">Faça login para ver suas finanças.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="px-5 pt-12 pb-4">
        <p className="text-sm text-muted-foreground font-body tracking-widest uppercase">Controle</p>
        <h1 className="text-2xl font-display font-bold">Finanças <span className="text-gold">✦</span></h1>
      </header>

      <div className="px-5 space-y-4 pb-28">
        {/* Month selector */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {monthNames.map((m, i) => (
            <button
              key={m}
              onClick={() => setCurrentMonth(i)}
              className={cn(
                "shrink-0 px-3 py-1.5 rounded-full text-xs font-body font-medium transition-all",
                i === currentMonth ? "bg-gold text-primary-foreground" : "bg-muted text-muted-foreground"
              )}
            >
              {m.slice(0, 3)}
            </button>
          ))}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-xl p-4 shadow-card">
            <p className="text-[10px] font-body text-muted-foreground uppercase tracking-wider">Renda</p>
            <p className="text-lg font-display font-bold text-green-500">
              R$ {renda.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-card">
            <p className="text-[10px] font-body text-muted-foreground uppercase tracking-wider">Saldo</p>
            <p className={cn("text-lg font-display font-bold", saldo >= 0 ? "text-gold" : "text-red-400")}>
              R$ {saldo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-card">
            <p className="text-[10px] font-body text-muted-foreground uppercase tracking-wider">Despesas Fixas</p>
            <p className="text-lg font-display font-bold text-red-400">
              R$ {despFixas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-card">
            <p className="text-[10px] font-body text-muted-foreground uppercase tracking-wider">Desp. Variáveis</p>
            <p className="text-lg font-display font-bold text-orange-400">
              R$ {despVar.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-card">
            <p className="text-[10px] font-body text-muted-foreground uppercase tracking-wider">Cartão Crédito</p>
            <p className="text-lg font-display font-bold text-purple-400">
              R$ {cartao.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-card">
            <p className="text-[10px] font-body text-muted-foreground uppercase tracking-wider">Poupança</p>
            <p className="text-lg font-display font-bold text-blue-400">
              R$ {poupanca.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full flex overflow-x-auto no-scrollbar bg-muted/50 h-auto p-1 gap-0.5">
            <TabsTrigger value="registros" className="text-[10px] gap-1 flex-1 min-w-0 data-[state=active]:bg-gold/20 data-[state=active]:text-gold px-1.5 py-1.5">
              <ArrowUpDown className="h-3 w-3 shrink-0" /> Registros
            </TabsTrigger>
            <TabsTrigger value="cartao" className="text-[10px] gap-1 flex-1 min-w-0 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 px-1.5 py-1.5">
              <CreditCard className="h-3 w-3 shrink-0" /> Cartão
            </TabsTrigger>
            <TabsTrigger value="poupanca" className="text-[10px] gap-1 flex-1 min-w-0 data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 px-1.5 py-1.5">
              <PiggyBank className="h-3 w-3 shrink-0" /> Poupança
            </TabsTrigger>
            <TabsTrigger value="grafico" className="text-[10px] gap-1 flex-1 min-w-0 data-[state=active]:bg-gold/20 data-[state=active]:text-gold px-1.5 py-1.5">
              <TrendingUp className="h-3 w-3 shrink-0" /> Gráfico
            </TabsTrigger>
            <TabsTrigger value="dicas" className="text-[10px] gap-1 flex-1 min-w-0 data-[state=active]:bg-gold/20 data-[state=active]:text-gold px-1.5 py-1.5">
              <Lightbulb className="h-3 w-3 shrink-0" /> Dicas
            </TabsTrigger>
            <TabsTrigger value="ia" className="text-[10px] gap-1 flex-1 min-w-0 data-[state=active]:bg-gold/20 data-[state=active]:text-gold px-1.5 py-1.5">
              <Bot className="h-3 w-3 shrink-0" /> IA
            </TabsTrigger>
          </TabsList>

          {/* Registros (Entradas/Saídas) */}
          <TabsContent value="registros">
            <div className="bg-card rounded-2xl border border-border overflow-hidden mt-3">
              <div className="p-4 border-b border-border">
                <h3 className="text-sm font-display font-semibold">Entradas e Saídas</h3>
              </div>
              {renderEntryList(["renda", "fixa", "variavel"], "Nenhum lançamento neste mês.")}
            </div>

            {showAdd && activeTab === "registros" ? (
              <div className="bg-card rounded-2xl p-4 border border-border space-y-3 animate-fade-in mt-3">
                <input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Descrição" className="w-full bg-transparent text-sm font-body outline-none placeholder:text-muted-foreground" autoFocus />
                <input value={newAmount} onChange={e => setNewAmount(e.target.value)} placeholder="Valor (R$)" type="number" className="w-full bg-transparent text-sm font-body outline-none placeholder:text-muted-foreground" />
                <div className="flex gap-2 flex-wrap">
                  {(["renda", "fixa", "variavel"] as EntryType[]).map(t => (
                    <button key={t} onClick={() => setNewType(t)} className={cn("px-3 py-1 rounded-full text-[10px] font-body font-medium transition-all", newType === t ? "bg-gold/20 text-gold ring-1 ring-gold/30" : "bg-muted text-muted-foreground")}>
                      {typeIcons[t]} {typeLabels[t]}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button variant="gold" size="sm" onClick={addEntry}>Adicionar</Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowAdd(false)}>Cancelar</Button>
                </div>
              </div>
            ) : activeTab === "registros" && (
              <Button variant="outline" className="w-full border-dashed mt-3" onClick={() => { setShowAdd(true); setNewType("renda"); }}>
                <Plus className="h-4 w-4 mr-2" /> Novo Lançamento
              </Button>
            )}
          </TabsContent>

          {/* Cartão de Crédito */}
          <TabsContent value="cartao">
            <div className="bg-card rounded-2xl border border-border overflow-hidden mt-3">
              <div className="p-4 border-b border-border flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-purple-400" />
                <h3 className="text-sm font-display font-semibold">Cartão de Crédito</h3>
              </div>
              {renderEntryList(["cartao"], "Nenhum gasto no cartão neste mês.")}
            </div>

            <div className="bg-card/50 rounded-xl p-3 mt-3 border border-purple-500/20">
              <div className="flex justify-between items-center">
                <span className="text-xs font-body text-muted-foreground">Total da Fatura</span>
                <span className="text-sm font-display font-bold text-purple-400">
                  R$ {cartao.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {showAdd && activeTab === "cartao" ? (
              <div className="bg-card rounded-2xl p-4 border border-border space-y-3 animate-fade-in mt-3">
                <input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Descrição da compra" className="w-full bg-transparent text-sm font-body outline-none placeholder:text-muted-foreground" autoFocus />
                <input value={newAmount} onChange={e => setNewAmount(e.target.value)} placeholder="Valor (R$)" type="number" className="w-full bg-transparent text-sm font-body outline-none placeholder:text-muted-foreground" />
                <div className="flex gap-2">
                  <Button variant="gold" size="sm" onClick={() => { setNewType("cartao"); addEntry(); }}>Adicionar</Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowAdd(false)}>Cancelar</Button>
                </div>
              </div>
            ) : activeTab === "cartao" && (
              <Button variant="outline" className="w-full border-dashed mt-3 border-purple-500/30 text-purple-400 hover:bg-purple-500/10" onClick={() => { setShowAdd(true); setNewType("cartao"); }}>
                <Plus className="h-4 w-4 mr-2" /> Adicionar Gasto no Cartão
              </Button>
            )}
          </TabsContent>

          {/* Poupança */}
          <TabsContent value="poupanca">
            <div className="bg-card rounded-2xl border border-border overflow-hidden mt-3">
              <div className="p-4 border-b border-border flex items-center gap-2">
                <PiggyBank className="h-4 w-4 text-blue-400" />
                <h3 className="text-sm font-display font-semibold">Poupança</h3>
              </div>
              {renderEntryList(["poupanca"], "Nenhum depósito na poupança neste mês.")}
            </div>

            <div className="bg-card/50 rounded-xl p-3 mt-3 border border-blue-500/20">
              <div className="flex justify-between items-center">
                <span className="text-xs font-body text-muted-foreground">Total Guardado no Mês</span>
                <span className="text-sm font-display font-bold text-blue-400">
                  R$ {poupanca.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {showAdd && activeTab === "poupanca" ? (
              <div className="bg-card rounded-2xl p-4 border border-border space-y-3 animate-fade-in mt-3">
                <input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Descrição do depósito" className="w-full bg-transparent text-sm font-body outline-none placeholder:text-muted-foreground" autoFocus />
                <input value={newAmount} onChange={e => setNewAmount(e.target.value)} placeholder="Valor (R$)" type="number" className="w-full bg-transparent text-sm font-body outline-none placeholder:text-muted-foreground" />
                <div className="flex gap-2">
                  <Button variant="gold" size="sm" onClick={() => { setNewType("poupanca"); addEntry(); }}>Adicionar</Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowAdd(false)}>Cancelar</Button>
                </div>
              </div>
            ) : activeTab === "poupanca" && (
              <Button variant="outline" className="w-full border-dashed mt-3 border-blue-500/30 text-blue-400 hover:bg-blue-500/10" onClick={() => { setShowAdd(true); setNewType("poupanca"); }}>
                <Plus className="h-4 w-4 mr-2" /> Adicionar à Poupança
              </Button>
            )}
          </TabsContent>

          {/* Gráfico */}
          <TabsContent value="grafico">
            <div className="bg-card rounded-2xl border border-border p-4 mt-3">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-4 w-4 text-gold" />
                <h3 className="text-sm font-display font-semibold">Evolução Mensal — {currentYear}</h3>
              </div>

              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <BarChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="renda" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="gastos" fill="hsl(0, 72%, 50%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="poupanca" fill="hsl(210, 80%, 55%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>

              {/* Legend */}
              <div className="flex justify-center gap-4 mt-3">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-sm bg-green-500" />
                  <span className="text-[10px] font-body text-muted-foreground">Renda</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-sm bg-red-500" />
                  <span className="text-[10px] font-body text-muted-foreground">Gastos</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-sm bg-blue-500" />
                  <span className="text-[10px] font-body text-muted-foreground">Poupança</span>
                </div>
              </div>
            </div>

            {/* Monthly comparison mini cards */}
            <div className="grid grid-cols-3 gap-2 mt-3">
              {chartData.filter((_, i) => i <= currentMonth).slice(-3).map(d => (
                <div key={d.name} className="bg-card rounded-xl p-3 border border-border text-center">
                  <p className="text-[10px] font-body text-muted-foreground uppercase">{d.name}</p>
                  <p className="text-xs font-display font-bold text-green-500">+{d.renda.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}</p>
                  <p className="text-xs font-display font-bold text-red-400">-{d.gastos.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}</p>
                </div>
              ))}
            </div>
          </TabsContent>
          {/* Dicas Financeiras */}
          <TabsContent value="dicas">
            <div className="space-y-3 mt-3">
              <div className="bg-card rounded-2xl border border-border p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="h-4 w-4 text-gold" />
                  <h3 className="text-sm font-display font-semibold">Dicas de Gestão Financeira para Mulheres de Elite ✨</h3>
                </div>
                <div className="space-y-3">
                  {financeTips.map((tip, i) => (
                    <div key={i} className="bg-muted/30 rounded-xl p-3 border border-border/50">
                      <div className="flex items-start gap-2">
                        <span className="text-lg shrink-0">{tip.icon}</span>
                        <div>
                          <p className="text-xs font-display font-semibold text-foreground">{tip.title}</p>
                          <p className="text-[11px] font-body text-muted-foreground mt-1 leading-relaxed">{tip.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* IA Financeira */}
          <TabsContent value="ia">
            <FinanceAIChat userId={user.id} renda={renda} despFixas={despFixas} despVar={despVar} cartao={cartao} poupanca={poupanca} saldo={saldo} />
          </TabsContent>
        </Tabs>

        {/* Notes */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <h3 className="text-sm font-display font-semibold mb-2">📝 Bloco de Notas</h3>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Escreva seus insights financeiros..."
            rows={4}
            className="w-full bg-transparent text-sm font-body outline-none resize-none placeholder:text-muted-foreground"
          />
          <Button variant="gold" size="sm" className="mt-2" onClick={saveNotes} disabled={notesSaving}>
            {notesSaving ? "Salvando..." : "Salvar Notas"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FinancasPage;

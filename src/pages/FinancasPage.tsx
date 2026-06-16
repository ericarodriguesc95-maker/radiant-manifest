import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Pencil, Check, X, TrendingUp, CreditCard, PiggyBank, ArrowUpDown, Lightbulb, Bot, Send, Brain, Briefcase, User as UserIcon, Copy, Target, AlertCircle, Eye, EyeOff, LayoutGrid, Table as TableIcon, ChevronRight, Wallet, PieChart, Tag, Sparkles, Coins, Trophy } from "lucide-react";
import { PieChart as RPieChart, Pie, Cell } from "recharts";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import FinanceProfileQuiz from "@/components/finance/FinanceProfileQuiz";
import PluggyConnectButton from "@/components/finance/PluggyConnectButton";
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
  const [mode, setModeRaw] = useState<"pf" | "cnpj">(() => {
    try { return (localStorage.getItem("fin-mode") as any) === "cnpj" ? "cnpj" : "pf"; } catch { return "pf"; }
  });
  const setMode = (m: "pf" | "cnpj") => {
    setModeRaw(m);
    try { localStorage.setItem("fin-mode", m); } catch {}
  };

  // Budgets (Planejar)
  const [budgets, setBudgets] = useState<Record<string, number>>({});
  // Debts
  interface Debt { id: string; name: string; total_amount: number; paid_amount: number; monthly_interest: number; installments_total: number | null; installments_paid: number; due_date: string | null; notes: string | null; }
  const [debts, setDebts] = useState<Debt[]>([]);
  const [showDebtForm, setShowDebtForm] = useState(false);
  const [debtForm, setDebtForm] = useState({ name: "", total_amount: "", paid_amount: "", monthly_interest: "", installments_total: "", installments_paid: "", due_date: "" });
  const [editingDebtId, setEditingDebtId] = useState<string | null>(null);
  const navigate = useNavigate();

  // ─── Novos estados da reformulação ─────────────────────────────────────
  const [showValues, setShowValues] = useState(true);
  const [dividasView, setDividasView] = useState<"cards" | "tabela">("cards");
  const [dividasFilter, setDividasFilter] = useState<"todas" | "ativas" | "vencidas" | "pagas">("todas");
  const [categoriasView, setCategoriasView] = useState<"minhas" | "open">("minhas");
  const [planejarSort, setPlanejarSort] = useState<"padrao" | "maior" | "pct" | "az">("padrao");
  const [userCategories, setUserCategories] = useState<Array<{ id: string; name: string; kind: string; icon: string; color: string }>>([]);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: "", kind: "despesa", icon: "💼", color: "#D4AF37" });


  // Deep-link from floating IA Financeira bubble
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("openAi") === "1") {
      setActiveTab("ia");
      try { localStorage.setItem("ai-finance-used", "1"); } catch {}
    }
  }, []);

  // Mark IA Financeira as used whenever the user opens that tab
  useEffect(() => {
    if (activeTab === "ia") {
      try { localStorage.setItem("ai-finance-used", "1"); } catch {}
    }
  }, [activeTab]);

  const fetchEntries = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [{ data }, { data: noteData }, { data: yearData }, { data: budgetData }, { data: debtData }] = await Promise.all([
      supabase
        .from("finance_entries")
        .select("*")
        .eq("user_id", user.id)
        .eq("mode", mode)
        .eq("month", currentMonth)
        .eq("year", currentYear)
        .order("created_at", { ascending: true }),
      supabase
        .from("finance_notes")
        .select("content")
        .eq("user_id", user.id)
        .eq("mode", mode)
        .eq("month", currentMonth)
        .eq("year", currentYear)
        .maybeSingle(),
      supabase
        .from("finance_entries")
        .select("month, type, amount")
        .eq("user_id", user.id)
        .eq("mode", mode)
        .eq("year", currentYear),
      supabase
        .from("finance_budgets" as any)
        .select("category, ceiling")
        .eq("user_id", user.id)
        .eq("mode", mode)
        .eq("month", currentMonth)
        .eq("year", currentYear),
      supabase
        .from("finance_debts" as any)
        .select("*")
        .eq("user_id", user.id)
        .eq("mode", mode)
        .order("created_at", { ascending: false }),
    ]);
    setEntries((data || []).map((e: any) => ({ id: e.id, description: e.description, amount: Number(e.amount), type: e.type })));
    setAllYearEntries((yearData || []).map((e: any) => ({ month: e.month, type: e.type, amount: Number(e.amount) })));
    setNotes(noteData?.content || "");
    const bmap: Record<string, number> = {};
    ((budgetData as any[]) || []).forEach((b: any) => { bmap[b.category] = Number(b.ceiling); });
    setBudgets(bmap);
    setDebts(((debtData as any[]) || []).map((d: any) => ({
      id: d.id, name: d.name,
      total_amount: Number(d.total_amount), paid_amount: Number(d.paid_amount),
      monthly_interest: Number(d.monthly_interest),
      installments_total: d.installments_total, installments_paid: d.installments_paid,
      due_date: d.due_date, notes: d.notes,
    })));
    setLoading(false);
  }, [user, currentMonth, currentYear, mode]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  // Carregar categorias do usuário
  useEffect(() => {
    if (!user) return;
    supabase
      .from("finance_categories" as any)
      .select("id, name, kind, icon, color")
      .eq("user_id", user.id)
      .then(({ data }) => setUserCategories(((data as any[]) || []).map(c => ({ id: c.id, name: c.name, kind: c.kind, icon: c.icon, color: c.color }))));
  }, [user]);

  const saveCategory = async () => {
    if (!user || !categoryForm.name.trim()) return;
    const { data, error } = await supabase.from("finance_categories" as any).insert({
      user_id: user.id, name: categoryForm.name.trim(), kind: categoryForm.kind, icon: categoryForm.icon, color: categoryForm.color, is_default: false,
    }).select().single();
    if (error) { toast.error("Erro ao salvar categoria"); return; }
    setUserCategories(prev => [...prev, { id: (data as any).id, name: categoryForm.name, kind: categoryForm.kind, icon: categoryForm.icon, color: categoryForm.color }]);
    setCategoryForm({ name: "", kind: "despesa", icon: "💼", color: "#D4AF37" });
    setShowCategoryForm(false);
    toast.success("Categoria criada!");
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase.from("finance_categories" as any).delete().eq("id", id);
    if (error) { toast.error("Erro ao excluir"); return; }
    setUserCategories(prev => prev.filter(c => c.id !== id));
    toast.success("Categoria removida");
  };

  // Money formatter respeitando showValues
  const money = (v: number) => showValues ? `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "R$ ••••";


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
      .insert({ user_id: user.id, description: newDesc, amount, type: newType, month: currentMonth, year: currentYear, mode })
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
      .upsert({ user_id: user.id, month: currentMonth, year: currentYear, mode, content: notes, updated_at: new Date().toISOString() }, { onConflict: "user_id,month,year,mode" });
    setNotesSaving(false);
    toast.success("Notas salvas!");
  };

  // ─── Copiar lançamentos do mês anterior ──────────────────────────────────
  const copyFromPreviousMonth = async () => {
    if (!user) return;
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const { data: prev } = await supabase
      .from("finance_entries")
      .select("description, amount, type")
      .eq("user_id", user.id)
      .eq("mode", mode)
      .eq("month", prevMonth)
      .eq("year", prevYear);
    if (!prev || prev.length === 0) { toast.info("Nenhum lançamento no mês anterior."); return; }
    const rows = prev.map((p: any) => ({ user_id: user.id, mode, month: currentMonth, year: currentYear, description: p.description, amount: p.amount, type: p.type }));
    const { error } = await supabase.from("finance_entries").insert(rows);
    if (error) { toast.error("Erro ao copiar"); return; }
    toast.success(`${rows.length} lançamento(s) copiado(s)!`);
    fetchEntries();
  };

  // ─── Orçamento por categoria (Planejar) ──────────────────────────────────
  const saveBudget = async (category: string, value: number) => {
    if (!user) return;
    setBudgets(b => ({ ...b, [category]: value }));
    await supabase.from("finance_budgets" as any).upsert({
      user_id: user.id, mode, category, ceiling: value, month: currentMonth, year: currentYear,
    } as any, { onConflict: "user_id,mode,category,month,year" });
  };

  const realByType = (t: EntryType) => entries.filter(e => e.type === t).reduce((s, e) => s + e.amount, 0);

  // ─── Dívidas CRUD ────────────────────────────────────────────────────────
  const totalDebt = debts.reduce((s, d) => s + (d.total_amount - d.paid_amount), 0);
  const totalPaid = debts.reduce((s, d) => s + d.paid_amount, 0);
  const monthlyInterest = debts.reduce((s, d) => s + d.monthly_interest, 0);

  const submitDebt = async () => {
    if (!user || !debtForm.name) return;
    const payload: any = {
      user_id: user.id, mode,
      name: debtForm.name,
      total_amount: parseFloat(debtForm.total_amount) || 0,
      paid_amount: parseFloat(debtForm.paid_amount) || 0,
      monthly_interest: parseFloat(debtForm.monthly_interest) || 0,
      installments_total: debtForm.installments_total ? parseInt(debtForm.installments_total) : null,
      installments_paid: parseInt(debtForm.installments_paid) || 0,
      due_date: debtForm.due_date || null,
    };
    let error;
    if (editingDebtId) ({ error } = await supabase.from("finance_debts" as any).update(payload).eq("id", editingDebtId));
    else ({ error } = await supabase.from("finance_debts" as any).insert(payload));
    if (error) { toast.error("Erro ao salvar dívida"); return; }
    toast.success(editingDebtId ? "Dívida atualizada!" : "Dívida adicionada!");
    setDebtForm({ name: "", total_amount: "", paid_amount: "", monthly_interest: "", installments_total: "", installments_paid: "", due_date: "" });
    setEditingDebtId(null); setShowDebtForm(false);
    fetchEntries();
  };

  const editDebt = (d: Debt) => {
    setEditingDebtId(d.id);
    setDebtForm({
      name: d.name,
      total_amount: String(d.total_amount), paid_amount: String(d.paid_amount),
      monthly_interest: String(d.monthly_interest),
      installments_total: d.installments_total ? String(d.installments_total) : "",
      installments_paid: String(d.installments_paid),
      due_date: d.due_date || "",
    });
    setShowDebtForm(true);
  };

  const deleteDebt = async (id: string) => {
    const { error } = await supabase.from("finance_debts" as any).delete().eq("id", id);
    if (error) { toast.error("Erro ao excluir"); return; }
    toast.success("Dívida excluída");
    fetchEntries();
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

  // Categorias padrão Open Finance (PT-BR)
  const openFinanceCategories = [
    // Receitas
    { name: "Salário", kind: "receita", icon: "💰", color: "#10b981" },
    { name: "Freelance", kind: "receita", icon: "💻", color: "#10b981" },
    { name: "Rendimentos", kind: "receita", icon: "📈", color: "#10b981" },
    { name: "Renda Extra", kind: "receita", icon: "✨", color: "#10b981" },
    { name: "Vendas", kind: "receita", icon: "🛍️", color: "#10b981" },
    { name: "Reembolso", kind: "receita", icon: "↩️", color: "#0ea5e9" },
    { name: "Transferência Pix (Receita)", kind: "receita", icon: "⚡", color: "#06b6d4" },
    { name: "Outros (Receita)", kind: "receita", icon: "📦", color: "#84cc16" },
    // Despesas
    { name: "Alimentação", kind: "despesa", icon: "🍽️", color: "#ef4444" },
    { name: "Moradia", kind: "despesa", icon: "🏠", color: "#f97316" },
    { name: "Transporte", kind: "despesa", icon: "🚗", color: "#3b82f6" },
    { name: "Saúde", kind: "despesa", icon: "❤️", color: "#ef4444" },
    { name: "Lazer", kind: "despesa", icon: "🎉", color: "#a855f7" },
    { name: "Serviços", kind: "despesa", icon: "🔧", color: "#8b5cf6" },
    { name: "Compras", kind: "despesa", icon: "🛒", color: "#ec4899" },
    { name: "Supermercado", kind: "despesa", icon: "🛒", color: "#10b981" },
    { name: "Farmácia", kind: "despesa", icon: "💊", color: "#ef4444" },
    { name: "Combustível", kind: "despesa", icon: "⛽", color: "#f97316" },
    { name: "Fundos de Investimento", kind: "despesa", icon: "💹", color: "#0ea5e9" },
    { name: "Educação", kind: "despesa", icon: "📚", color: "#14b8a6" },
    { name: "Viagem", kind: "despesa", icon: "✈️", color: "#3b82f6" },
    { name: "Investimentos", kind: "despesa", icon: "📊", color: "#0ea5e9" },
    { name: "Tarifas Bancárias", kind: "despesa", icon: "🏦", color: "#64748b" },
    { name: "Delivery", kind: "despesa", icon: "🛵", color: "#f97316" },
    { name: "IOF", kind: "despesa", icon: "📄", color: "#64748b" },
    { name: "Serviços Digitais", kind: "despesa", icon: "🌐", color: "#8b5cf6" },
    { name: "Energia Elétrica", kind: "despesa", icon: "💡", color: "#eab308" },
    { name: "Telecomunicações", kind: "despesa", icon: "📡", color: "#3b82f6" },
    { name: "Seguros", kind: "despesa", icon: "🛡️", color: "#10b981" },
    { name: "Impostos", kind: "despesa", icon: "🧾", color: "#dc2626" },
    { name: "Assinaturas", kind: "despesa", icon: "🎬", color: "#a855f7" },
    { name: "Pets", kind: "despesa", icon: "🐾", color: "#f97316" },
    { name: "Vestuário", kind: "despesa", icon: "👗", color: "#ec4899" },
    { name: "Beleza", kind: "despesa", icon: "💄", color: "#f472b6" },
    { name: "Água", kind: "despesa", icon: "💧", color: "#06b6d4" },
    { name: "Gás", kind: "despesa", icon: "🔥", color: "#f97316" },
    { name: "Internet", kind: "despesa", icon: "📶", color: "#3b82f6" },
    { name: "Telefone", kind: "despesa", icon: "📱", color: "#8b5cf6" },
    { name: "Pagamento Cartão", kind: "despesa", icon: "💳", color: "#f59e0b" },
    { name: "Empréstimos", kind: "despesa", icon: "🏛️", color: "#64748b" },
    { name: "Streaming", kind: "despesa", icon: "▶️", color: "#a855f7" },
    { name: "Transferências", kind: "despesa", icon: "🔄", color: "#06b6d4" },
    { name: "Eletrônicos", kind: "despesa", icon: "💻", color: "#3b82f6" },
    { name: "Livraria", kind: "despesa", icon: "📖", color: "#14b8a6" },
    { name: "Serviços Básicos", kind: "despesa", icon: "🧰", color: "#eab308" },
    { name: "Transporte Público", kind: "despesa", icon: "🚌", color: "#f97316" },
    { name: "Transferência Pix", kind: "despesa", icon: "⚡", color: "#06b6d4" },
    { name: "Transferência Própria", kind: "despesa", icon: "↔️", color: "#8b5cf6" },
  ];

  // Cálculos derivados
  const balanco = renda - despFixas - despVar - cartao;
  const totalDespesas = despFixas + despVar;

  // Gastos por categoria (a partir das descrições — agrupando pelos tipos)
  const gastosPorCategoria = useMemo(() => {
    const map: Record<string, { value: number; color: string; icon: string }> = {
      "Despesas Fixas": { value: despFixas, color: "#ef4444", icon: "📌" },
      "Despesas Variáveis": { value: despVar, color: "#f97316", icon: "🛒" },
      "Cartão de Crédito": { value: cartao, color: "#a855f7", icon: "💳" },
    };
    return Object.entries(map).filter(([, v]) => v.value > 0).map(([name, v]) => ({ name, ...v }));
  }, [despFixas, despVar, cartao]);

  // Dívidas derivadas
  const overdueDebts = debts.filter(d => d.due_date && new Date(d.due_date) < new Date() && (d.total_amount - d.paid_amount) > 0);
  const paidDebts = debts.filter(d => d.paid_amount >= d.total_amount && d.total_amount > 0);
  const activeDebts = debts.filter(d => (d.total_amount - d.paid_amount) > 0 && !(d.due_date && new Date(d.due_date) < new Date()));
  const filteredDebts =
    dividasFilter === "ativas" ? activeDebts :
    dividasFilter === "vencidas" ? overdueDebts :
    dividasFilter === "pagas" ? paidDebts : debts;

  const planejarRows = useMemo(() => {
    const rows = (["renda","fixa","variavel","cartao","poupanca"] as EntryType[]).map(t => {
      const teto = budgets[t] || 0;
      const real = realByType(t);
      const pct = teto > 0 ? (real / teto) * 100 : 0;
      return { type: t, teto, real, pct };
    });
    if (planejarSort === "maior") rows.sort((a,b) => b.real - a.real);
    else if (planejarSort === "pct") rows.sort((a,b) => b.pct - a.pct);
    else if (planejarSort === "az") rows.sort((a,b) => typeLabels[a.type].localeCompare(typeLabels[b.type]));
    return rows;
  }, [budgets, entries, planejarSort]);

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <header className="px-5 pt-10 pb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-display font-bold tracking-tight">Minhas Finanças</h1>
            <button onClick={() => setShowValues(v => !v)} className="text-gold/70 hover:text-gold p-1" aria-label="Mostrar/ocultar valores">
              {showValues ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
          </div>
          <select
            value={`${currentYear}-${currentMonth}`}
            onChange={(e) => { const [, m] = e.target.value.split("-"); setCurrentMonth(parseInt(m)); }}
            className="bg-gold/15 text-gold border border-gold/30 rounded-full px-4 py-1.5 text-xs font-body font-semibold outline-none focus:ring-2 focus:ring-gold/40"
          >
            {monthNames.map((m, i) => (
              <option key={i} value={`${currentYear}-${i}`} className="bg-background text-foreground">
                {m} {currentYear}
              </option>
            ))}
          </select>
        </div>
        <p className="text-[11px] text-muted-foreground font-body mt-1">Quanto entra, quanto sai, quanto sobra. Você no comando, rainha. ✨</p>
      </header>

      <div className="px-5 space-y-4 pb-28">
        {/* PF / CNPJ + Conectar conta */}
        <div className="flex items-center gap-2">
          <div className="flex bg-muted/30 rounded-full p-0.5 text-[10px] font-body">
            <button onClick={() => setMode("pf")} className={cn("px-3 py-1.5 rounded-full transition-all", mode === "pf" ? "bg-gold text-background font-semibold" : "text-muted-foreground")}>
              <UserIcon className="h-3 w-3 inline mr-1" />PF
            </button>
            <button onClick={() => setMode("cnpj")} className={cn("px-3 py-1.5 rounded-full transition-all", mode === "cnpj" ? "bg-gold text-background font-semibold" : "text-muted-foreground")}>
              <Briefcase className="h-3 w-3 inline mr-1" />CNPJ
            </button>
          </div>
          <div className="flex-1"><PluggyConnectButton mode={mode} onSynced={fetchEntries} /></div>
        </div>

        {/* 4 CARDS DE RESUMO */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass rounded-2xl p-4 border-t-2 border-t-blue-400/80 relative overflow-hidden">
            <PiggyBank className="absolute top-3 right-3 h-4 w-4 text-blue-400/40" />
            <p className="text-[9px] font-body text-muted-foreground uppercase tracking-widest">Balanço Mensal</p>
            <p className="text-[10px] font-body text-muted-foreground mt-0.5">Resultado do mês</p>
            <p className={cn("text-base font-display font-bold mt-1", balanco >= 0 ? "text-blue-400" : "text-amber-300")}>{money(balanco)}</p>
          </div>
          <div className="glass rounded-2xl p-4 border-t-2 border-t-green-400/80 relative overflow-hidden">
            <TrendingUp className="absolute top-3 right-3 h-4 w-4 text-green-400/40" />
            <p className="text-[9px] font-body text-muted-foreground uppercase tracking-widest">Receitas</p>
            <p className="text-[10px] font-body text-muted-foreground mt-0.5">Total de entradas</p>
            <p className="text-base font-display font-bold text-green-400 mt-1">{money(renda)}</p>
          </div>
          <div className="glass rounded-2xl p-4 border-t-2 border-t-red-400/80 relative overflow-hidden">
            <ArrowUpDown className="absolute top-3 right-3 h-4 w-4 text-red-400/40" />
            <p className="text-[9px] font-body text-muted-foreground uppercase tracking-widest">Despesas</p>
            <p className="text-[10px] font-body text-muted-foreground mt-0.5">Total de saídas</p>
            <p className="text-base font-display font-bold text-red-400 mt-1">{money(totalDespesas)}</p>
          </div>
          <div className="glass rounded-2xl p-4 border-t-2 border-t-purple-400/80 relative overflow-hidden">
            <CreditCard className="absolute top-3 right-3 h-4 w-4 text-purple-400/40" />
            <p className="text-[9px] font-body text-muted-foreground uppercase tracking-widest">Cartão</p>
            <p className="text-[10px] font-body text-muted-foreground mt-0.5">Fatura atual</p>
            <p className="text-base font-display font-bold text-purple-400 mt-1">{money(cartao)}</p>
          </div>
        </div>

        {/* 7 ABAS */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full flex overflow-x-auto no-scrollbar bg-muted/30 h-auto p-1 gap-1 justify-start rounded-full">
            <TabsTrigger value="geral" className="text-[11px] gap-1.5 shrink-0 whitespace-nowrap data-[state=active]:bg-gold data-[state=active]:text-background rounded-full px-3 py-1.5"><LayoutGrid className="h-3 w-3" />Geral</TabsTrigger>
            <TabsTrigger value="transacoes" className="text-[11px] gap-1.5 shrink-0 whitespace-nowrap data-[state=active]:bg-gold data-[state=active]:text-background rounded-full px-3 py-1.5"><ArrowUpDown className="h-3 w-3" />Transações</TabsTrigger>
            <TabsTrigger value="categorias" className="text-[11px] gap-1.5 shrink-0 whitespace-nowrap data-[state=active]:bg-gold data-[state=active]:text-background rounded-full px-3 py-1.5"><Tag className="h-3 w-3" />Categorias</TabsTrigger>
            <TabsTrigger value="planejar" className="text-[11px] gap-1.5 shrink-0 whitespace-nowrap data-[state=active]:bg-gold data-[state=active]:text-background rounded-full px-3 py-1.5"><Target className="h-3 w-3" />Planejar</TabsTrigger>
            <TabsTrigger value="investir" className="text-[11px] gap-1.5 shrink-0 whitespace-nowrap data-[state=active]:bg-gold data-[state=active]:text-background rounded-full px-3 py-1.5"><TrendingUp className="h-3 w-3" />Investir</TabsTrigger>
            <TabsTrigger value="metas" className="text-[11px] gap-1.5 shrink-0 whitespace-nowrap data-[state=active]:bg-gold data-[state=active]:text-background rounded-full px-3 py-1.5"><Trophy className="h-3 w-3" />Metas</TabsTrigger>
            <TabsTrigger value="dividas" className="text-[11px] gap-1.5 shrink-0 whitespace-nowrap data-[state=active]:bg-gold data-[state=active]:text-background rounded-full px-3 py-1.5"><AlertCircle className="h-3 w-3" />Dívidas</TabsTrigger>
          </TabsList>

          {/* ───── GERAL ───── */}
          <TabsContent value="geral" className="space-y-4 mt-4">
            {/* Atalhos secundários */}
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => document.getElementById("dicas-fin")?.scrollIntoView({ behavior: "smooth" })} className="glass rounded-xl p-2.5 border border-gold/15 text-center hover:border-gold/40 transition-all">
                <Lightbulb className="h-4 w-4 text-gold mx-auto" />
                <p className="text-[10px] font-body mt-1">Dicas</p>
              </button>
              <button onClick={() => document.getElementById("ia-fin")?.scrollIntoView({ behavior: "smooth" })} className="glass rounded-xl p-2.5 border border-gold/15 text-center hover:border-gold/40 transition-all">
                <Bot className="h-4 w-4 text-gold mx-auto" />
                <p className="text-[10px] font-body mt-1">IA Consultora</p>
              </button>
              <button onClick={() => document.getElementById("quiz-fin")?.scrollIntoView({ behavior: "smooth" })} className="glass rounded-xl p-2.5 border border-gold/15 text-center hover:border-gold/40 transition-all">
                <Brain className="h-4 w-4 text-gold mx-auto" />
                <p className="text-[10px] font-body mt-1">Meu perfil</p>
              </button>
            </div>

            {/* Gastos por Categoria + Resumo */}
            <div className="grid md:grid-cols-2 gap-3">
              <div className="glass rounded-2xl p-4 border border-gold/15">
                <h3 className="text-xs font-display font-semibold flex items-center gap-1.5 mb-3"><PieChart className="h-3.5 w-3.5 text-gold" />Gastos por Categoria</h3>
                {gastosPorCategoria.length === 0 ? (
                  <div className="py-8 text-center">
                    <PieChart className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-xs font-body font-semibold">Você ainda não possui despesas neste mês</p>
                    <p className="text-[10px] font-body text-muted-foreground mt-1">Adicione transações para visualizar seus gastos por categoria</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-center">
                      <RPieChart width={180} height={140}>
                        <Pie data={gastosPorCategoria} dataKey="value" cx={90} cy={70} innerRadius={35} outerRadius={60} paddingAngle={2}>
                          {gastosPorCategoria.map((d, i) => <Cell key={i} fill={d.color} />)}
                        </Pie>
                      </RPieChart>
                    </div>
                    <div className="space-y-1.5 mt-2">
                      {gastosPorCategoria.map(c => (
                        <div key={c.name} className="flex items-center justify-between text-[11px] font-body">
                          <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: c.color }} />{c.icon} {c.name}</span>
                          <span className="text-foreground font-semibold">{money(c.value)}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="glass rounded-2xl p-4 border border-gold/15">
                <h3 className="text-xs font-display font-semibold flex items-center gap-1.5 mb-3"><Sparkles className="h-3.5 w-3.5 text-gold" />Resumo Financeiro</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-2 border-b border-border/40">
                    <span className="text-[11px] font-body text-muted-foreground">Maior categoria de gastos</span>
                    <div className="text-right">
                      <p className="text-[11px] font-body font-semibold">{gastosPorCategoria[0]?.name || "Nenhuma"}</p>
                      <p className="text-[10px] font-body text-muted-foreground">{money(gastosPorCategoria[0]?.value || 0)}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border/40">
                    <span className="text-[11px] font-body text-muted-foreground">Receita do mês</span>
                    <span className="text-[11px] font-body font-semibold text-green-400">{money(renda)}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border/40">
                    <span className="text-[11px] font-body text-muted-foreground">Sobra do mês</span>
                    <span className={cn("text-[11px] font-body font-semibold", balanco >= 0 ? "text-gold" : "text-red-400")}>{money(balanco)}</span>
                  </div>
                  {(renda === 0 && totalDespesas === 0) && (
                    <div className="bg-gold/10 border border-gold/30 rounded-xl p-2.5 mt-2 flex items-start gap-2">
                      <Lightbulb className="h-3.5 w-3.5 text-gold shrink-0 mt-0.5" />
                      <p className="text-[10px] font-body text-gold/90 leading-snug">Conecte sua conta bancária ou registre transações para começar seu controle financeiro.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Método de Pagamento + Cartões */}
            <div className="grid md:grid-cols-2 gap-3">
              <div className="glass rounded-2xl p-4 border border-gold/15">
                <h3 className="text-xs font-display font-semibold flex items-center gap-1.5 mb-3"><Wallet className="h-3.5 w-3.5 text-gold" />Gastos por Método de Pagamento</h3>
                {totalDespesas === 0 && cartao === 0 ? (
                  <div className="py-6 text-center">
                    <CreditCard className="h-7 w-7 text-muted-foreground/30 mx-auto mb-1.5" />
                    <p className="text-[11px] font-body text-muted-foreground">Nenhum gasto registrado</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-body"><span>💳 Cartão de Crédito</span><span className="font-semibold">{money(cartao)}</span></div>
                    <div className="flex items-center justify-between text-[11px] font-body"><span>💸 Débito / Dinheiro</span><span className="font-semibold">{money(totalDespesas)}</span></div>
                  </div>
                )}
              </div>

              <div className="glass rounded-2xl p-4 border border-gold/15">
                <h3 className="text-xs font-display font-semibold flex items-center gap-1.5 mb-3"><CreditCard className="h-3.5 w-3.5 text-gold" />Cartões de Crédito</h3>
                <div className="py-6 text-center">
                  <p className="text-[11px] font-body text-muted-foreground">Nenhum cartão de crédito conectado.</p>
                  <p className="text-[10px] font-body text-muted-foreground/70 mt-1">Conecte via Open Finance.</p>
                </div>
              </div>
            </div>

            {/* IA Chat */}
            <div id="ia-fin"><FinanceAIChat userId={user.id} renda={renda} despFixas={despFixas} despVar={despVar} cartao={cartao} poupanca={poupanca} saldo={saldo} /></div>
          </TabsContent>

          {/* ───── TRANSAÇÕES ───── */}
          <TabsContent value="transacoes" className="space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-display font-semibold">Lançamentos do mês</h3>
              <Button variant="outline" size="sm" className="text-[10px] gap-1" onClick={copyFromPreviousMonth}>
                <Copy className="h-3 w-3" />Copiar do mês anterior
              </Button>
            </div>

            <div className="glass rounded-2xl border border-gold/15 overflow-hidden">
              {renderEntryList(["renda", "fixa", "variavel", "cartao", "poupanca"], "Nenhum lançamento neste mês.")}
            </div>

            {showAdd ? (
              <div className="glass rounded-2xl p-4 border border-gold/30 space-y-3 animate-fade-in">
                <input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Descrição" className="w-full bg-muted/40 rounded-lg px-3 py-2 text-sm font-body outline-none" autoFocus />
                <input value={newAmount} onChange={e => setNewAmount(e.target.value)} placeholder="Valor (R$)" type="number" className="w-full bg-muted/40 rounded-lg px-3 py-2 text-sm font-body outline-none" />
                <div className="flex gap-1.5 flex-wrap">
                  {(["renda", "fixa", "variavel", "cartao", "poupanca"] as EntryType[]).map(t => (
                    <button key={t} onClick={() => setNewType(t)} className={cn("px-2.5 py-1 rounded-full text-[10px] font-body", newType === t ? "bg-gold text-background font-semibold" : "bg-muted/40 text-muted-foreground")}>
                      {typeIcons[t]} {typeLabels[t]}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button variant="gold" size="sm" onClick={addEntry}>Adicionar</Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowAdd(false)}>Cancelar</Button>
                </div>
              </div>
            ) : (
              <Button className="w-full bg-gold text-background hover:bg-gold/90 font-semibold" onClick={() => setShowAdd(true)}>
                <Plus className="h-4 w-4 mr-1.5" />Novo Lançamento
              </Button>
            )}
          </TabsContent>

          {/* ───── CATEGORIAS ───── */}
          <TabsContent value="categorias" className="space-y-3 mt-4">
            <div>
              <h3 className="text-base font-display font-bold">Categorias</h3>
              <p className="text-[11px] font-body text-muted-foreground">Use as categorias do Open Finance ou crie as suas próprias para personalizar receitas e despesas.</p>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex gap-1 bg-muted/30 rounded-full p-0.5">
                <button onClick={() => setCategoriasView("minhas")} className={cn("px-3 py-1.5 rounded-full text-[11px] font-body flex items-center gap-1.5", categoriasView === "minhas" ? "bg-gold text-background font-semibold" : "text-muted-foreground")}>
                  <Sparkles className="h-3 w-3" />Minhas categorias <span className="bg-background/20 px-1.5 rounded-full text-[9px]">{userCategories.length}</span>
                </button>
                <button onClick={() => setCategoriasView("open")} className={cn("px-3 py-1.5 rounded-full text-[11px] font-body flex items-center gap-1.5", categoriasView === "open" ? "bg-gold text-background font-semibold" : "text-muted-foreground")}>
                  <Briefcase className="h-3 w-3" />Open Finance <span className="bg-background/20 px-1.5 rounded-full text-[9px]">{openFinanceCategories.length}</span>
                </button>
              </div>
              {categoriasView === "minhas" && (
                <Button className="bg-gold text-background hover:bg-gold/90 text-[11px] h-8 gap-1" onClick={() => setShowCategoryForm(s => !s)}>
                  <Plus className="h-3 w-3" />Nova Categoria
                </Button>
              )}
            </div>

            {categoriasView === "open" && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[10px] font-body text-amber-200/90 leading-snug">
                  <span className="font-semibold">Categorias automáticas do Open Finance.</span> Estas categorias são geradas automaticamente ao classificar suas transações. <span className="font-semibold">Não podem ser editadas ou excluídas</span> para garantir o reconhecimento automático. Para personalizar, crie as suas próprias na aba <em>Minhas categorias</em>. ✨
                </p>
              </div>
            )}

            {showCategoryForm && categoriasView === "minhas" && (
              <div className="glass rounded-2xl p-4 border border-gold/30 space-y-2 animate-fade-in">
                <input value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} placeholder="Nome da categoria" className="w-full bg-muted/40 rounded-lg px-3 py-2 text-sm font-body outline-none" autoFocus />
                <div className="grid grid-cols-3 gap-2">
                  <select value={categoryForm.kind} onChange={e => setCategoryForm({...categoryForm, kind: e.target.value})} className="bg-muted/40 rounded-lg px-2 py-2 text-xs font-body outline-none">
                    <option value="receita">Receita</option>
                    <option value="despesa">Despesa</option>
                  </select>
                  <input value={categoryForm.icon} onChange={e => setCategoryForm({...categoryForm, icon: e.target.value})} placeholder="Emoji" maxLength={2} className="bg-muted/40 rounded-lg px-2 py-2 text-sm font-body outline-none text-center" />
                  <input type="color" value={categoryForm.color} onChange={e => setCategoryForm({...categoryForm, color: e.target.value})} className="w-full h-9 bg-muted/40 rounded-lg cursor-pointer" />
                </div>
                <div className="flex gap-2">
                  <Button variant="gold" size="sm" onClick={saveCategory}>Salvar</Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowCategoryForm(false)}>Cancelar</Button>
                </div>
              </div>
            )}

            {(() => {
              const list = categoriasView === "minhas" ? userCategories : openFinanceCategories.map((c, i) => ({ id: `of-${i}`, ...c }));
              const receitas = list.filter(c => c.kind === "receita");
              const despesas = list.filter(c => c.kind === "despesa");
              return (
                <>
                  <div>
                    <p className="text-xs font-display font-semibold text-green-400 mb-2">💰 Receitas <span className="text-muted-foreground">({receitas.length})</span></p>
                    {receitas.length === 0 ? <p className="text-[11px] text-muted-foreground font-body italic">Nenhuma categoria de receita.</p> : (
                      <div className="flex flex-wrap gap-2">
                        {receitas.map(c => (
                          <div key={c.id} className="rounded-full px-3 py-1.5 text-[11px] font-body flex items-center gap-1.5 border" style={{ background: `${c.color}22`, borderColor: `${c.color}55`, color: c.color }}>
                            <span>{c.icon}</span>{c.name}
                            {categoriasView === "minhas" && <button onClick={() => deleteCategory(c.id)} className="ml-1 opacity-60 hover:opacity-100"><X className="h-3 w-3" /></button>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-display font-semibold text-red-400 mb-2 mt-3">💸 Despesas <span className="text-muted-foreground">({despesas.length})</span></p>
                    {despesas.length === 0 ? <p className="text-[11px] text-muted-foreground font-body italic">Nenhuma categoria de despesa.</p> : (
                      <div className="flex flex-wrap gap-2">
                        {despesas.map(c => (
                          <div key={c.id} className="rounded-full px-3 py-1.5 text-[11px] font-body flex items-center gap-1.5 border" style={{ background: `${c.color}22`, borderColor: `${c.color}55`, color: c.color }}>
                            <span>{c.icon}</span>{c.name}
                            {categoriasView === "minhas" && <button onClick={() => deleteCategory(c.id)} className="ml-1 opacity-60 hover:opacity-100"><X className="h-3 w-3" /></button>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </TabsContent>

          {/* ───── PLANEJAR ───── */}
          <TabsContent value="planejar" className="space-y-3 mt-4">
            <div className="flex justify-end">
              <Button variant="outline" size="sm" className="text-[10px] gap-1" onClick={copyFromPreviousMonth}>
                <Copy className="h-3 w-3" />Copiar do mês anterior
              </Button>
            </div>

            <div className="glass rounded-2xl p-4 border border-gold/15">
              <h3 className="text-sm font-display font-semibold flex items-center gap-1.5"><Wallet className="h-4 w-4 text-gold" />Resumo do Orçamento</h3>
              {Object.values(budgets).every(v => !v) ? (
                <div className="text-center py-4">
                  <p className="text-xs font-body text-muted-foreground">Nenhum orçamento definido ainda.</p>
                  <p className="text-[10px] font-body text-muted-foreground/70 mt-1">Preencha a coluna "Teto de gasto" na tabela abaixo.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                  <div><p className="text-[9px] font-body text-muted-foreground uppercase">Teto Total</p><p className="text-sm font-display font-bold text-gold">{money(Object.values(budgets).reduce((s,v) => s + v, 0))}</p></div>
                  <div><p className="text-[9px] font-body text-muted-foreground uppercase">Realizado</p><p className="text-sm font-display font-bold text-red-400">{money(totalDespesas + cartao)}</p></div>
                  <div><p className="text-[9px] font-body text-muted-foreground uppercase">Disponível</p><p className="text-sm font-display font-bold text-green-400">{money(Math.max(0, Object.values(budgets).reduce((s,v)=>s+v,0) - (totalDespesas + cartao)))}</p></div>
                </div>
              )}
            </div>

            <div className="glass rounded-2xl p-4 border border-gold/15">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-display font-semibold">Gastos por categoria</h3>
                  <p className="text-[10px] font-body text-muted-foreground">Preencha apenas a coluna de "Teto de gasto", o resto é automático.</p>
                </div>
                <select value={planejarSort} onChange={e => setPlanejarSort(e.target.value as any)} className="bg-muted/40 border border-border rounded-lg px-2 py-1 text-[10px] font-body outline-none">
                  <option value="padrao">↕ Padrão</option>
                  <option value="maior">Maior gasto</option>
                  <option value="pct">% usado</option>
                  <option value="az">A → Z</option>
                </select>
              </div>

              <div className="divide-y divide-border/40">
                {planejarRows.map(({ type: t, teto, real, pct }) => {
                  const over = teto > 0 && real > teto;
                  return (
                    <div key={t} className="py-2.5">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-xs font-body font-semibold"><span className="text-base">{typeIcons[t]}</span>{typeLabels[t]}</span>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-muted-foreground">R$</span>
                            <input type="number" placeholder="0,00" defaultValue={teto || ""} onBlur={(e) => { const v = parseFloat(e.target.value) || 0; if (v !== teto) saveBudget(t, v); }} className="w-20 bg-muted/40 rounded-lg px-2 py-1 text-xs font-body outline-none text-right" />
                          </div>
                          <span className="text-xs font-body text-muted-foreground w-16 text-right">{money(real)}</span>
                          <span className={cn("text-[10px] font-body w-10 text-right", over ? "text-red-400" : teto > 0 ? "text-green-400" : "text-muted-foreground")}>{teto > 0 ? `${Math.round(pct)}%` : "—"}</span>
                        </div>
                      </div>
                      {teto > 0 && (
                        <div className="h-1 bg-muted/40 rounded-full overflow-hidden mt-1.5">
                          <div className={cn("h-full transition-all", over ? "bg-red-500" : "bg-gold")} style={{ width: `${Math.min(100, pct)}%` }} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* ───── INVESTIR ───── */}
          <TabsContent value="investir" className="space-y-3 mt-4">
            <div className="glass rounded-2xl p-5 border border-gold/15 text-center">
              <Coins className="h-8 w-8 text-gold mx-auto mb-2" />
              <h3 className="text-base font-display font-bold">Total guardado no mês</h3>
              <p className="text-2xl font-display font-bold text-gold mt-1">{money(poupanca)}</p>
              <p className="text-[10px] font-body text-muted-foreground mt-1">Construindo sua liberdade, rainha. ✨</p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { name: "Renda Fixa", icon: "🏛️", color: "border-blue-400/40 text-blue-400" },
                { name: "Renda Variável", icon: "📈", color: "border-green-400/40 text-green-400" },
                { name: "Cripto", icon: "₿", color: "border-amber-400/40 text-amber-400" },
              ].map(t => (
                <div key={t.name} className={cn("glass rounded-xl p-3 border text-center", t.color)}>
                  <p className="text-xl">{t.icon}</p>
                  <p className="text-[10px] font-body font-semibold mt-1">{t.name}</p>
                  <p className="text-[9px] font-body text-muted-foreground mt-0.5">Em breve</p>
                </div>
              ))}
            </div>

            <div className="glass rounded-2xl border border-gold/15 overflow-hidden">
              <div className="p-3 border-b border-border/40 flex items-center gap-2">
                <PiggyBank className="h-4 w-4 text-blue-400" />
                <h3 className="text-xs font-display font-semibold">Aportes do mês</h3>
              </div>
              {renderEntryList(["poupanca"], "Nenhum aporte neste mês.")}
            </div>

            <Button className="w-full bg-gold text-background hover:bg-gold/90 font-semibold" onClick={() => { setShowAdd(true); setNewType("poupanca"); setActiveTab("transacoes"); }}>
              <Plus className="h-4 w-4 mr-1.5" />Adicionar aporte
            </Button>
          </TabsContent>

          {/* ───── METAS ───── */}
          <TabsContent value="metas" className="space-y-3 mt-4">
            <div className="glass rounded-2xl p-5 border border-gold/15 text-center">
              <Trophy className="h-8 w-8 text-gold mx-auto mb-2" />
              <h3 className="text-base font-display font-bold">Metas Financeiras</h3>
              <p className="text-[11px] font-body text-muted-foreground mt-1 max-w-xs mx-auto">Gerencie suas metas SMART com progresso, marcos e manifestação diária no módulo dedicado.</p>
              <Button className="bg-gold text-background hover:bg-gold/90 mt-3 gap-1" onClick={() => navigate("/metas")}>
                <Target className="h-3.5 w-3.5" />Abrir Metas
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="glass rounded-2xl p-4 border border-gold/15">
              <h3 className="text-xs font-display font-semibold mb-2">💡 Sugestões de metas</h3>
              <div className="space-y-1.5">
                {["Reserva de emergência (6x despesas)", "Primeira viagem internacional", "R$ 10 mil em investimentos", "Quitar todas as dívidas em 12 meses"].map(s => (
                  <div key={s} className="bg-muted/20 rounded-lg px-3 py-2 text-[11px] font-body flex items-center justify-between">
                    {s}
                    <button onClick={() => navigate("/metas")} className="text-gold text-[10px] hover:underline">Criar</button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* ───── DÍVIDAS ───── */}
          <TabsContent value="dividas" className="space-y-3 mt-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-display font-bold">Controle de Dívidas</h3>
                <p className="text-[10px] font-body text-muted-foreground">Gerencie e acompanhe suas dívidas</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex bg-muted/30 rounded-lg p-0.5">
                  <button onClick={() => setDividasView("cards")} className={cn("px-2.5 py-1 rounded-md text-[10px] font-body flex items-center gap-1", dividasView === "cards" ? "bg-gold text-background font-semibold" : "text-muted-foreground")}><LayoutGrid className="h-3 w-3" />Cards</button>
                  <button onClick={() => setDividasView("tabela")} className={cn("px-2.5 py-1 rounded-md text-[10px] font-body flex items-center gap-1", dividasView === "tabela" ? "bg-gold text-background font-semibold" : "text-muted-foreground")}><TableIcon className="h-3 w-3" />Tabela</button>
                </div>
                <Button className="bg-gold text-background hover:bg-gold/90 h-8 text-[11px] gap-1" onClick={() => setShowDebtForm(true)}>
                  <Plus className="h-3 w-3" />Nova Dívida
                </Button>
              </div>
            </div>

            {/* 4 stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="glass rounded-xl p-3 border border-gold/15">
                <p className="text-[10px] font-body text-muted-foreground">Total de Dívidas</p>
                <p className="text-base font-display font-bold text-red-400 mt-0.5">{money(totalDebt)}</p>
                <p className="text-[9px] font-body text-muted-foreground">{activeDebts.length} dívida(s) ativa(s)</p>
              </div>
              <div className="glass rounded-xl p-3 border border-gold/15">
                <p className="text-[10px] font-body text-muted-foreground">Total Pago</p>
                <p className="text-base font-display font-bold text-green-400 mt-0.5">{money(totalPaid)}</p>
                <p className="text-[9px] font-body text-muted-foreground">Valor já quitado</p>
              </div>
              <div className="glass rounded-xl p-3 border border-gold/15">
                <p className="text-[10px] font-body text-muted-foreground">Juros Mensais</p>
                <p className="text-base font-display font-bold text-orange-400 mt-0.5">{money(monthlyInterest)}</p>
                <p className="text-[9px] font-body text-muted-foreground">Custo mensal dos juros</p>
              </div>
              <div className="glass rounded-xl p-3 border border-gold/15">
                <p className="text-[10px] font-body text-muted-foreground">Dívidas Vencidas</p>
                <p className="text-base font-display font-bold text-red-500 mt-0.5">{overdueDebts.length}</p>
                <p className="text-[9px] font-body text-muted-foreground">Requerem atenção urgente</p>
              </div>
            </div>

            {/* Sub-tabs */}
            <div className="flex gap-1 bg-muted/20 rounded-full p-0.5 overflow-x-auto no-scrollbar">
              {[
                { id: "todas", label: `Todas (${debts.length})` },
                { id: "ativas", label: `Ativas (${activeDebts.length})` },
                { id: "vencidas", label: `Vencidas (${overdueDebts.length})` },
                { id: "pagas", label: `Pagas (${paidDebts.length})` },
              ].map(f => (
                <button key={f.id} onClick={() => setDividasFilter(f.id as any)} className={cn("shrink-0 px-3 py-1.5 rounded-full text-[10px] font-body whitespace-nowrap", dividasFilter === f.id ? "bg-gold text-background font-semibold" : "text-muted-foreground")}>{f.label}</button>
              ))}
            </div>

            {/* Lista / tabela */}
            {filteredDebts.length === 0 ? (
              <div className="glass rounded-2xl border border-gold/15 p-8 text-center">
                <AlertCircle className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm font-display font-semibold">Nenhuma dívida encontrada</p>
                <p className="text-[11px] font-body text-muted-foreground mt-1">Comece adicionando sua primeira dívida.</p>
                <Button className="bg-gold text-background hover:bg-gold/90 mt-3 gap-1" onClick={() => setShowDebtForm(true)}>
                  <Plus className="h-3.5 w-3.5" />Adicionar Primeira Dívida
                </Button>
              </div>
            ) : dividasView === "cards" ? (
              <div className="space-y-2">
                {filteredDebts.map(d => {
                  const restante = d.total_amount - d.paid_amount;
                  const pct = d.total_amount > 0 ? Math.round((d.paid_amount / d.total_amount) * 100) : 0;
                  return (
                    <div key={d.id} className="glass rounded-xl border border-gold/15 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-body font-semibold truncate">{d.name}</p>
                          <p className="text-[10px] text-muted-foreground font-body">
                            {d.installments_total ? `${d.installments_paid}/${d.installments_total} parcelas` : "Sem parcelamento"}
                            {d.due_date && ` • Vence ${new Date(d.due_date).toLocaleDateString("pt-BR")}`}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => editDebt(d)} className="p-1 text-muted-foreground hover:text-gold"><Pencil className="h-3 w-3" /></button>
                          <button onClick={() => deleteDebt(d.id)} className="p-1 text-muted-foreground hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
                        </div>
                      </div>
                      <div className="mt-2 grid grid-cols-3 gap-1.5 text-[10px] font-body">
                        <div><span className="text-muted-foreground">Total: </span><span className="font-semibold">{money(d.total_amount)}</span></div>
                        <div><span className="text-muted-foreground">Pago: </span><span className="text-green-400 font-semibold">{money(d.paid_amount)}</span></div>
                        <div><span className="text-muted-foreground">Resta: </span><span className="text-red-400 font-semibold">{money(restante)}</span></div>
                      </div>
                      <div className="mt-1.5 h-1.5 bg-muted/40 rounded-full overflow-hidden"><div className="h-full bg-green-400 transition-all" style={{ width: `${pct}%` }} /></div>
                      {d.monthly_interest > 0 && <p className="text-[10px] text-orange-400 font-body mt-1">📈 Juros mensal: {money(d.monthly_interest)}</p>}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="glass rounded-xl border border-gold/15 overflow-x-auto">
                <table className="w-full text-[11px] font-body">
                  <thead className="bg-muted/20 text-muted-foreground">
                    <tr><th className="text-left p-2">Nome</th><th className="text-right p-2">Total</th><th className="text-right p-2">Pago</th><th className="text-right p-2">Resta</th><th className="text-right p-2">Vence</th><th className="p-2"></th></tr>
                  </thead>
                  <tbody>
                    {filteredDebts.map(d => (
                      <tr key={d.id} className="border-t border-border/40">
                        <td className="p-2 font-semibold">{d.name}</td>
                        <td className="p-2 text-right">{money(d.total_amount)}</td>
                        <td className="p-2 text-right text-green-400">{money(d.paid_amount)}</td>
                        <td className="p-2 text-right text-red-400">{money(d.total_amount - d.paid_amount)}</td>
                        <td className="p-2 text-right">{d.due_date ? new Date(d.due_date).toLocaleDateString("pt-BR") : "—"}</td>
                        <td className="p-2 text-right">
                          <button onClick={() => editDebt(d)} className="p-1 text-muted-foreground hover:text-gold"><Pencil className="h-3 w-3" /></button>
                          <button onClick={() => deleteDebt(d.id)} className="p-1 text-muted-foreground hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {showDebtForm && (
              <div className="glass rounded-2xl p-4 border border-gold/30 space-y-2 animate-fade-in">
                <input value={debtForm.name} onChange={e => setDebtForm({...debtForm, name: e.target.value})} placeholder="Nome da dívida (ex: Cartão Nubank)" className="w-full bg-muted/40 rounded-lg px-3 py-2 text-sm font-body outline-none" autoFocus />
                <div className="grid grid-cols-2 gap-2">
                  <input value={debtForm.total_amount} onChange={e => setDebtForm({...debtForm, total_amount: e.target.value})} type="number" placeholder="Valor total" className="bg-muted/40 rounded-lg px-3 py-2 text-sm font-body outline-none" />
                  <input value={debtForm.paid_amount} onChange={e => setDebtForm({...debtForm, paid_amount: e.target.value})} type="number" placeholder="Já pago" className="bg-muted/40 rounded-lg px-3 py-2 text-sm font-body outline-none" />
                  <input value={debtForm.monthly_interest} onChange={e => setDebtForm({...debtForm, monthly_interest: e.target.value})} type="number" placeholder="Juros mensal (R$)" className="bg-muted/40 rounded-lg px-3 py-2 text-sm font-body outline-none" />
                  <input value={debtForm.due_date} onChange={e => setDebtForm({...debtForm, due_date: e.target.value})} type="date" className="bg-muted/40 rounded-lg px-3 py-2 text-sm font-body outline-none" />
                  <input value={debtForm.installments_total} onChange={e => setDebtForm({...debtForm, installments_total: e.target.value})} type="number" placeholder="Total parcelas" className="bg-muted/40 rounded-lg px-3 py-2 text-sm font-body outline-none" />
                  <input value={debtForm.installments_paid} onChange={e => setDebtForm({...debtForm, installments_paid: e.target.value})} type="number" placeholder="Parcelas pagas" className="bg-muted/40 rounded-lg px-3 py-2 text-sm font-body outline-none" />
                </div>
                <div className="flex gap-2">
                  <Button variant="gold" size="sm" onClick={submitDebt}>{editingDebtId ? "Salvar" : "Adicionar"}</Button>
                  <Button variant="ghost" size="sm" onClick={() => { setShowDebtForm(false); setEditingDebtId(null); setDebtForm({ name: "", total_amount: "", paid_amount: "", monthly_interest: "", installments_total: "", installments_paid: "", due_date: "" }); }}>Cancelar</Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Bloco de notas (mantido) */}
        <div className="glass rounded-2xl border border-gold/15 p-4">
          <h3 className="text-sm font-display font-semibold mb-2">📝 Bloco de Notas Financeiras</h3>
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

        {/* Quiz acessível inline (oculto até clicar) */}
        <details className="glass rounded-2xl border border-gold/15 p-4">
          <summary className="text-sm font-display font-semibold cursor-pointer flex items-center gap-2"><Brain className="h-4 w-4 text-gold" />Refazer quiz de perfil financeiro</summary>
          <div className="mt-3"><FinanceProfileQuiz /></div>
        </details>

        {/* Dicas inline (oculto até clicar) */}
        <details className="glass rounded-2xl border border-gold/15 p-4">
          <summary className="text-sm font-display font-semibold cursor-pointer flex items-center gap-2"><Lightbulb className="h-4 w-4 text-gold" />Dicas comportamentais financeiras</summary>
          <div className="space-y-2 mt-3">
            {financeTips.map((tip, i) => (
              <div key={i} className="bg-muted/20 rounded-xl p-3 border border-border/30">
                <div className="flex items-start gap-2">
                  <span className="text-lg shrink-0">{tip.icon}</span>
                  <div>
                    <p className="text-xs font-display font-semibold">{tip.title}</p>
                    <p className="text-[11px] font-body text-muted-foreground mt-1 leading-relaxed">{tip.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
};

export default FinancasPage;


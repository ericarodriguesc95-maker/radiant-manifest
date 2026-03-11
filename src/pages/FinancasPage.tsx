import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface FinanceEntry {
  id: string;
  description: string;
  amount: number;
  type: "renda" | "fixa" | "variavel";
}

const monthNames = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const typeLabels: Record<string, string> = { renda: "Renda", fixa: "Despesa Fixa", variavel: "Despesa Variável" };
const typeColors: Record<string, string> = {
  renda: "text-green-500",
  fixa: "text-red-400",
  variavel: "text-orange-400",
};

const FinancasPage = () => {
  const { user } = useAuth();
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear] = useState(now.getFullYear());
  const [entries, setEntries] = useState<FinanceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newDesc, setNewDesc] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newType, setNewType] = useState<FinanceEntry["type"]>("renda");
  const [notes, setNotes] = useState("");
  const [notesSaving, setNotesSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDesc, setEditDesc] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editType, setEditType] = useState<FinanceEntry["type"]>("renda");

  const fetchEntries = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("finance_entries")
      .select("*")
      .eq("user_id", user.id)
      .eq("month", currentMonth)
      .eq("year", currentYear)
      .order("created_at", { ascending: true });
    setEntries((data || []).map((e: any) => ({ id: e.id, description: e.description, amount: Number(e.amount), type: e.type })));

    // Fetch notes
    const { data: noteData } = await supabase
      .from("finance_notes")
      .select("content")
      .eq("user_id", user.id)
      .eq("month", currentMonth)
      .eq("year", currentYear)
      .maybeSingle();
    setNotes(noteData?.content || "");
    setLoading(false);
  }, [user, currentMonth, currentYear]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const renda = entries.filter(e => e.type === "renda").reduce((s, e) => s + e.amount, 0);
  const despFixas = entries.filter(e => e.type === "fixa").reduce((s, e) => s + e.amount, 0);
  const despVar = entries.filter(e => e.type === "variavel").reduce((s, e) => s + e.amount, 0);
  const saldo = renda - despFixas - despVar;

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
    setEntries(prev => [...prev, { id: data.id, description: data.description, amount: Number(data.amount), type: data.type as FinanceEntry["type"] }]);
    setNewDesc(""); setNewAmount(""); setShowAdd(false);
    toast.success("Lançamento adicionado!");
  };

  const removeEntry = async (id: string) => {
    const prev = entries;
    setEntries(e => e.filter(x => x.id !== id));
    const { error } = await supabase.from("finance_entries").delete().eq("id", id);
    if (error) { setEntries(prev); toast.error("Erro ao excluir"); }
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
    else toast.success("Atualizado!");
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

      <div className="px-5 space-y-4 pb-6">
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
        </div>

        {/* Entries list */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="text-sm font-display font-semibold">Lançamentos</h3>
          </div>
          {loading ? (
            <div className="p-4 text-center text-muted-foreground text-sm font-body">Carregando...</div>
          ) : entries.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm font-body">Nenhum lançamento neste mês.</div>
          ) : (
            <div className="divide-y divide-border">
              {entries.map(entry => (
                <div key={entry.id} className="flex items-center justify-between p-4">
                  {editingId === entry.id ? (
                    <div className="flex-1 space-y-2">
                      <input value={editDesc} onChange={e => setEditDesc(e.target.value)} className="w-full bg-muted rounded-lg px-2 py-1 text-sm font-body outline-none" />
                      <input value={editAmount} onChange={e => setEditAmount(e.target.value)} type="number" className="w-full bg-muted rounded-lg px-2 py-1 text-sm font-body outline-none" />
                      <div className="flex gap-1">
                        {(Object.keys(typeLabels) as FinanceEntry["type"][]).map(t => (
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
                      <div>
                        <p className="text-sm font-body font-medium">{entry.description}</p>
                        <p className={cn("text-[10px] font-body", typeColors[entry.type])}>{typeLabels[entry.type]}</p>
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
          )}
        </div>

        {/* Add entry */}
        {showAdd ? (
          <div className="bg-card rounded-2xl p-4 border border-border space-y-3 animate-fade-in">
            <input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Descrição" className="w-full bg-transparent text-sm font-body outline-none placeholder:text-muted-foreground" autoFocus />
            <input value={newAmount} onChange={e => setNewAmount(e.target.value)} placeholder="Valor (R$)" type="number" className="w-full bg-transparent text-sm font-body outline-none placeholder:text-muted-foreground" />
            <div className="flex gap-2">
              {(Object.keys(typeLabels) as FinanceEntry["type"][]).map(t => (
                <button key={t} onClick={() => setNewType(t)} className={cn("px-3 py-1 rounded-full text-[10px] font-body font-medium transition-all", newType === t ? "bg-gold/20 text-gold ring-1 ring-gold/30" : "bg-muted text-muted-foreground")}>
                  {typeLabels[t]}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="gold" size="sm" onClick={addEntry}>Adicionar</Button>
              <Button variant="ghost" size="sm" onClick={() => setShowAdd(false)}>Cancelar</Button>
            </div>
          </div>
        ) : (
          <Button variant="outline" className="w-full border-dashed" onClick={() => setShowAdd(true)}>
            <Plus className="h-4 w-4 mr-2" /> Novo Lançamento
          </Button>
        )}

        {/* Notes */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <h3 className="text-sm font-display font-semibold mb-2">Bloco de Notas</h3>
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

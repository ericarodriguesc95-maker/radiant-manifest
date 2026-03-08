import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

const FinancasPage = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [entries, setEntries] = useState<FinanceEntry[]>([
    { id: "1", description: "Salário", amount: 5000, type: "renda" },
    { id: "2", description: "Aluguel", amount: 1500, type: "fixa" },
    { id: "3", description: "Internet", amount: 100, type: "fixa" },
    { id: "4", description: "Restaurante", amount: 250, type: "variavel" },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [newDesc, setNewDesc] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newType, setNewType] = useState<FinanceEntry["type"]>("renda");
  const [notes, setNotes] = useState("");

  const renda = entries.filter(e => e.type === "renda").reduce((s, e) => s + e.amount, 0);
  const despFixas = entries.filter(e => e.type === "fixa").reduce((s, e) => s + e.amount, 0);
  const despVar = entries.filter(e => e.type === "variavel").reduce((s, e) => s + e.amount, 0);
  const saldo = renda - despFixas - despVar;

  const addEntry = () => {
    if (!newDesc || !newAmount) return;
    setEntries(prev => [
      ...prev,
      { id: Date.now().toString(), description: newDesc, amount: parseFloat(newAmount), type: newType },
    ]);
    setNewDesc("");
    setNewAmount("");
    setShowAdd(false);
  };

  const removeEntry = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const typeLabels = { renda: "Renda", fixa: "Despesa Fixa", variavel: "Despesa Variável" };
  const typeColors = {
    renda: "text-green-500",
    fixa: "text-red-400",
    variavel: "text-orange-400",
  };

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
          <div className={cn("bg-card rounded-xl p-4 shadow-card")}>
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
          <div className="divide-y divide-border">
            {entries.map(entry => (
              <div key={entry.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-body font-medium">{entry.description}</p>
                  <p className={cn("text-[10px] font-body", typeColors[entry.type])}>{typeLabels[entry.type]}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("text-sm font-body font-semibold", typeColors[entry.type])}>
                    {entry.type === "renda" ? "+" : "-"} R$ {entry.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                  <button onClick={() => removeEntry(entry.id)} className="p-1 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add entry */}
        {showAdd ? (
          <div className="bg-card rounded-2xl p-4 border border-border space-y-3 animate-fade-in">
            <input
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              placeholder="Descrição"
              className="w-full bg-transparent text-sm font-body outline-none placeholder:text-muted-foreground"
              autoFocus
            />
            <input
              value={newAmount}
              onChange={e => setNewAmount(e.target.value)}
              placeholder="Valor (R$)"
              type="number"
              className="w-full bg-transparent text-sm font-body outline-none placeholder:text-muted-foreground"
            />
            <div className="flex gap-2">
              {(Object.keys(typeLabels) as FinanceEntry["type"][]).map(t => (
                <button
                  key={t}
                  onClick={() => setNewType(t)}
                  className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-body font-medium transition-all",
                    newType === t ? "bg-gold/20 text-gold ring-1 ring-gold/30" : "bg-muted text-muted-foreground"
                  )}
                >
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
        </div>
      </div>
    </div>
  );
};

export default FinancasPage;

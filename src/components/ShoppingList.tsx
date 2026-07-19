import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, ShoppingBasket, Pill, Sparkles, Check, ChevronLeft, ChevronRight, StickyNote, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Category = "supermercado" | "farmacia" | "outros";

interface Item {
  id: string;
  name: string;
  quantity: string | null;
  category: Category;
  checked: boolean;
  sort_order: number;
  month_ref: string;
  notes: string | null;
  price: number | null;
}

const CATS: { key: Category; label: string; icon: any; color: string }[] = [
  { key: "supermercado", label: "Supermercado", icon: ShoppingBasket, color: "#10b981" },
  { key: "farmacia", label: "Farmácia", icon: Pill, color: "#ec4899" },
  { key: "outros", label: "Essenciais", icon: Sparkles, color: "#8b5cf6" },
];

const SEEDS: Record<Category, { name: string; quantity: string }[]> = {
  supermercado: [
    { name: "Aveia em flocos", quantity: "1 pacote" },
    { name: "Ovos", quantity: "1 dúzia" },
    { name: "Iogurte natural", quantity: "500g" },
    { name: "Frango peito", quantity: "1kg" },
    { name: "Salmão", quantity: "300g" },
    { name: "Azeite extra virgem", quantity: "1 garrafa" },
    { name: "Abacate", quantity: "3 un" },
    { name: "Frutas vermelhas", quantity: "1 caixa" },
    { name: "Banana", quantity: "1 cacho" },
    { name: "Chá verde / matchá", quantity: "1 pacote" },
    { name: "Água mineral", quantity: "2L x 6" },
    { name: "Castanhas mistas", quantity: "200g" },
    { name: "Batata doce", quantity: "1kg" },
    { name: "Folhas verdes (rúcula, espinafre)", quantity: "2 maços" },
    { name: "Pasta de amendoim integral", quantity: "1 pote" },
    { name: "Café especial", quantity: "250g" },
  ],
  farmacia: [
    { name: "Vitamina D3", quantity: "1 frasco" },
    { name: "Ômega 3", quantity: "1 frasco" },
    { name: "Magnésio dimalato", quantity: "1 frasco" },
    { name: "Colágeno hidrolisado", quantity: "1 pote" },
    { name: "Complexo B", quantity: "1 frasco" },
    { name: "Ferro (se prescrito)", quantity: "1 frasco" },
    { name: "Absorventes / Coletor", quantity: "1 pacote" },
    { name: "Protetor solar facial FPS 50+", quantity: "1 un" },
    { name: "Hidratante corporal", quantity: "1 un" },
    { name: "Ácido hialurônico sérum", quantity: "1 un" },
    { name: "Fio dental", quantity: "1 un" },
    { name: "Escova de dente macia", quantity: "1 un" },
    { name: "Desodorante natural", quantity: "1 un" },
  ],
  outros: [
    { name: "Vela aromática", quantity: "1 un" },
    { name: "Caderno / diário", quantity: "1 un" },
    { name: "Chá calmante (camomila)", quantity: "1 caixa" },
    { name: "Óleo essencial lavanda", quantity: "1 un" },
    { name: "Máscara facial", quantity: "1 un" },
    { name: "Livro do mês", quantity: "1 un" },
  ],
};

const BRL = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const monthKey = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}-01`;
};

const monthLabel = (iso: string) => {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
};

export default function ShoppingList() {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState<Category>("supermercado");
  const [currentMonth, setCurrentMonth] = useState<string>(monthKey(new Date()));
  const [newName, setNewName] = useState("");
  const [newQty, setNewQty] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("shopping_list_items" as any)
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    setItems((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const addItem = async (name: string, quantity: string, category: Category = activeCat) => {
    if (!user || !name.trim()) return;
    const { data } = await supabase
      .from("shopping_list_items" as any)
      .insert({
        user_id: user.id,
        name: name.trim(),
        quantity: quantity.trim() || null,
        category,
        month_ref: currentMonth,
      })
      .select()
      .single();
    if (data) setItems(prev => [...prev, data as any]);
  };

  const submitNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    await addItem(newName, newQty);
    setNewName(""); setNewQty("");
  };

  const toggle = async (item: Item) => {
    const next = !item.checked;
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, checked: next } : i));
    await supabase.from("shopping_list_items" as any).update({ checked: next }).eq("id", item.id);
  };

  const remove = async (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    if (expandedId === id) setExpandedId(null);
    await supabase.from("shopping_list_items" as any).delete().eq("id", id);
  };

  const updateItem = async (id: string, patch: Partial<Item>) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...patch } as Item : i));
    await supabase.from("shopping_list_items" as any).update(patch).eq("id", id);
  };

  const addAllSeeds = async () => {
    if (!user) return;
    const existing = new Set(
      items
        .filter(i => i.category === activeCat && i.month_ref === currentMonth)
        .map(i => i.name.toLowerCase())
    );
    const rows = SEEDS[activeCat]
      .filter(s => !existing.has(s.name.toLowerCase()))
      .map(s => ({
        user_id: user.id,
        name: s.name,
        quantity: s.quantity,
        category: activeCat,
        month_ref: currentMonth,
      }));
    if (rows.length === 0) { toast.info("Todos os essenciais já estão nesta lista."); return; }
    const { data } = await supabase.from("shopping_list_items" as any).insert(rows).select();
    if (data) setItems(prev => [...prev, ...(data as any)]);
    toast.success(`${rows.length} itens adicionados!`);
  };

  const copyPreviousMonth = async () => {
    if (!user) return;
    const prev = new Date(currentMonth + "T00:00:00");
    prev.setMonth(prev.getMonth() - 1);
    const prevKey = monthKey(prev);
    const source = items.filter(i => i.month_ref === prevKey && i.category === activeCat);
    if (source.length === 0) { toast.info("Nada para copiar do mês anterior."); return; }
    const rows = source.map(s => ({
      user_id: user.id,
      name: s.name,
      quantity: s.quantity,
      category: s.category,
      month_ref: currentMonth,
    }));
    const { data } = await supabase.from("shopping_list_items" as any).insert(rows).select();
    if (data) setItems(prev => [...prev, ...(data as any)]);
    toast.success(`${rows.length} itens copiados do mês anterior!`);
  };

  const clearChecked = async () => {
    if (!user) return;
    const ids = currentItems.filter(i => i.checked).map(i => i.id);
    if (ids.length === 0) return;
    setItems(prev => prev.filter(i => !ids.includes(i.id)));
    await supabase.from("shopping_list_items" as any).delete().in("id", ids);
    toast.success("Itens marcados removidos.");
  };

  const shiftMonth = (delta: number) => {
    const d = new Date(currentMonth + "T00:00:00");
    d.setMonth(d.getMonth() + delta);
    setCurrentMonth(monthKey(d));
    setExpandedId(null);
  };

  const monthItems = useMemo(
    () => items.filter(i => i.month_ref === currentMonth),
    [items, currentMonth]
  );
  const currentItems = useMemo(
    () => monthItems.filter(i => i.category === activeCat),
    [monthItems, activeCat]
  );
  const activeMeta = CATS.find(c => c.key === activeCat)!;
  const doneCount = currentItems.filter(i => i.checked).length;
  const totalCount = currentItems.length;
  const remainingCount = totalCount - doneCount;
  const progress = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);
  const totalSpent = currentItems.reduce((sum, i) => sum + (i.price || 0), 0);
  const monthSpent = monthItems.reduce((sum, i) => sum + (i.price || 0), 0);

  const isCurrentMonth = currentMonth === monthKey(new Date());

  return (
    <div className="space-y-4">
      {/* Month selector */}
      <div className="flex items-center justify-between bg-card border border-border rounded-2xl p-2">
        <button
          onClick={() => shiftMonth(-1)}
          className="h-9 w-9 rounded-xl hover:bg-muted flex items-center justify-center"
          aria-label="Mês anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="text-center">
          <p className="text-sm font-heading font-semibold text-foreground capitalize">
            {monthLabel(currentMonth)}
          </p>
          {monthSpent > 0 && (
            <p className="text-[10px] font-body text-muted-foreground">
              Gasto total no mês: <span className="text-gold font-semibold">{BRL(monthSpent)}</span>
            </p>
          )}
        </div>
        <button
          onClick={() => shiftMonth(1)}
          className="h-9 w-9 rounded-xl hover:bg-muted flex items-center justify-center"
          aria-label="Próximo mês"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Category tabs */}
      <div className="grid grid-cols-3 gap-2">
        {CATS.map(c => {
          const Icon = c.icon;
          const active = c.key === activeCat;
          const catCount = monthItems.filter(i => i.category === c.key).length;
          return (
            <button
              key={c.key}
              onClick={() => { setActiveCat(c.key); setExpandedId(null); }}
              className={cn(
                "flex flex-col items-center gap-1 rounded-2xl border p-3 transition-all relative",
                active ? "border-gold bg-gold/10 shadow-sm" : "border-border bg-card hover:border-gold/40"
              )}
            >
              <Icon className="h-5 w-5" style={{ color: c.color }} />
              <span className="text-[11px] font-body font-medium text-foreground">{c.label}</span>
              {catCount > 0 && (
                <span className="absolute top-1 right-1 text-[9px] font-body font-bold text-gold">
                  {catCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="bg-card border border-border rounded-2xl p-3 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-body">
            <span className="text-muted-foreground">
              <span className="text-foreground font-semibold">{doneCount}</span> de {totalCount} comprados
              {remainingCount > 0 && <span className="text-muted-foreground"> · {remainingCount} restantes</span>}
            </span>
            <span className="text-gold font-bold">{progress}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-gold to-amber-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          {totalSpent > 0 && (
            <p className="text-[11px] font-body text-muted-foreground">
              Gasto em {activeMeta.label.toLowerCase()}: <span className="text-foreground font-semibold">{BRL(totalSpent)}</span>
            </p>
          )}
        </div>
      )}

      {/* Add form */}
      <form onSubmit={submitNew} className="flex gap-2">
        <input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder={`Novo item em ${activeMeta.label}...`}
          className="flex-1 bg-card border border-border rounded-xl px-3 py-2 text-sm font-body outline-none focus:border-gold"
        />
        <input
          value={newQty}
          onChange={e => setNewQty(e.target.value)}
          placeholder="Qtd"
          className="w-20 bg-card border border-border rounded-xl px-3 py-2 text-sm font-body outline-none focus:border-gold"
        />
        <Button type="submit" variant="gold" size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
        </Button>
      </form>

      {/* Quick actions */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={addAllSeeds}
            className="text-[11px] font-body text-gold hover:underline flex items-center gap-1"
          >
            <Sparkles className="h-3 w-3" /> Essenciais
          </button>
          <button
            onClick={copyPreviousMonth}
            className="text-[11px] font-body text-muted-foreground hover:text-gold flex items-center gap-1"
          >
            <ChevronLeft className="h-3 w-3" /> Copiar mês anterior
          </button>
        </div>
        {doneCount > 0 && (
          <button onClick={clearChecked} className="text-[11px] font-body text-muted-foreground hover:text-destructive">
            Limpar {doneCount} marcado(s)
          </button>
        )}
      </div>

      {/* Items */}
      {loading ? (
        <p className="text-center text-sm text-muted-foreground py-8">Carregando...</p>
      ) : currentItems.length === 0 ? (
        <div className="text-center py-10 space-y-3">
          <div className="h-14 w-14 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto">
            <activeMeta.icon className="h-6 w-6" style={{ color: activeMeta.color }} />
          </div>
          <p className="text-sm font-body text-muted-foreground">
            Sua lista de {activeMeta.label.toLowerCase()} em {monthLabel(currentMonth)} está vazia.
          </p>
          <Button variant="gold" size="sm" onClick={addAllSeeds} className="gap-1.5">
            <Sparkles className="h-4 w-4" /> Começar com essenciais
          </Button>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border overflow-hidden divide-y divide-border">
          {currentItems.map(item => {
            const expanded = expandedId === item.id;
            return (
              <div key={item.id}>
                <div className="flex items-center gap-3 p-3">
                  <button
                    onClick={() => toggle(item)}
                    className={cn(
                      "h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0",
                      item.checked ? "bg-green-500 border-green-500 text-white" : "border-muted-foreground/40 hover:border-gold"
                    )}
                  >
                    {item.checked && <Check className="h-3 w-3" strokeWidth={3} />}
                  </button>
                  <button
                    onClick={() => setExpandedId(expanded ? null : item.id)}
                    className="flex-1 min-w-0 text-left"
                  >
                    <p className={cn("text-sm font-body text-foreground truncate", item.checked && "line-through text-muted-foreground")}>
                      {item.name}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {item.quantity && (
                        <p className="text-[11px] font-body text-muted-foreground">{item.quantity}</p>
                      )}
                      {item.price != null && item.price > 0 && (
                        <p className="text-[11px] font-body text-gold font-semibold">{BRL(item.price)}</p>
                      )}
                      {item.notes && (
                        <p className="text-[11px] font-body text-muted-foreground italic truncate">· {item.notes}</p>
                      )}
                    </div>
                  </button>
                  <button
                    onClick={() => setExpandedId(expanded ? null : item.id)}
                    className={cn(
                      "p-1.5 rounded-lg transition-colors",
                      expanded ? "text-gold bg-gold/10" : "text-muted-foreground hover:text-gold"
                    )}
                    aria-label="Editar observação"
                  >
                    <StickyNote className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => remove(item.id)} className="p-1 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                {expanded && (
                  <div className="px-3 pb-3 pt-1 bg-muted/30 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-body text-muted-foreground uppercase tracking-wide">Valor gasto</label>
                        <div className="flex items-center gap-1 bg-background border border-border rounded-lg px-2 py-1.5 mt-0.5">
                          <span className="text-xs text-muted-foreground">R$</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            defaultValue={item.price ?? ""}
                            onBlur={(e) => {
                              const v = e.target.value === "" ? null : Number(e.target.value);
                              if (v !== item.price) updateItem(item.id, { price: v as any });
                            }}
                            placeholder="0,00"
                            className="flex-1 bg-transparent text-sm outline-none font-body w-full"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-body text-muted-foreground uppercase tracking-wide">Quantidade</label>
                        <input
                          defaultValue={item.quantity ?? ""}
                          onBlur={(e) => {
                            const v = e.target.value.trim() || null;
                            if (v !== item.quantity) updateItem(item.id, { quantity: v });
                          }}
                          placeholder="ex: 2 un"
                          className="w-full bg-background border border-border rounded-lg px-2 py-1.5 mt-0.5 text-sm outline-none font-body"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-body text-muted-foreground uppercase tracking-wide">Observação</label>
                      <textarea
                        defaultValue={item.notes ?? ""}
                        onBlur={(e) => {
                          const v = e.target.value.trim() || null;
                          if (v !== item.notes) updateItem(item.id, { notes: v });
                        }}
                        placeholder="marca, mercado, promoção..."
                        rows={2}
                        className="w-full bg-background border border-border rounded-lg px-2 py-1.5 mt-0.5 text-sm outline-none font-body resize-none"
                      />
                    </div>
                    <button
                      onClick={() => setExpandedId(null)}
                      className="text-[11px] font-body text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                      <X className="h-3 w-3" /> Fechar
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!isCurrentMonth && (
        <p className="text-center text-[10px] font-body text-muted-foreground italic">
          Você está vendo o histórico de {monthLabel(currentMonth)}
        </p>
      )}
    </div>
  );
}

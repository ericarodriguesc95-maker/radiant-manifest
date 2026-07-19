import { useEffect, useState } from "react";
import { Plus, Trash2, ShoppingBasket, Pill, Sparkles, Check } from "lucide-react";
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

export default function ShoppingList() {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState<Category>("supermercado");
  const [newName, setNewName] = useState("");
  const [newQty, setNewQty] = useState("");

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("shopping_list_items" as any)
      .select("*")
      .eq("user_id", user.id)
      .order("checked", { ascending: true })
      .order("created_at", { ascending: true });
    setItems((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const addItem = async (name: string, quantity: string, category: Category = activeCat) => {
    if (!user || !name.trim()) return;
    const { data } = await supabase
      .from("shopping_list_items" as any)
      .insert({ user_id: user.id, name: name.trim(), quantity: quantity.trim() || null, category })
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
    await supabase.from("shopping_list_items" as any).delete().eq("id", id);
  };

  const addAllSeeds = async () => {
    if (!user) return;
    const existing = new Set(items.filter(i => i.category === activeCat).map(i => i.name.toLowerCase()));
    const rows = SEEDS[activeCat]
      .filter(s => !existing.has(s.name.toLowerCase()))
      .map(s => ({ user_id: user.id, name: s.name, quantity: s.quantity, category: activeCat }));
    if (rows.length === 0) { toast.info("Todos os essenciais já estão na sua lista."); return; }
    const { data } = await supabase.from("shopping_list_items" as any).insert(rows).select();
    if (data) setItems(prev => [...prev, ...(data as any)]);
    toast.success(`${rows.length} itens adicionados!`);
  };

  const clearChecked = async () => {
    if (!user) return;
    const ids = items.filter(i => i.checked && i.category === activeCat).map(i => i.id);
    if (ids.length === 0) return;
    setItems(prev => prev.filter(i => !ids.includes(i.id)));
    await supabase.from("shopping_list_items" as any).delete().in("id", ids);
    toast.success("Itens marcados removidos.");
  };

  const currentItems = items.filter(i => i.category === activeCat);
  const activeMeta = CATS.find(c => c.key === activeCat)!;
  const doneCount = currentItems.filter(i => i.checked).length;

  return (
    <div className="space-y-4">
      {/* Category tabs */}
      <div className="grid grid-cols-3 gap-2">
        {CATS.map(c => {
          const Icon = c.icon;
          const active = c.key === activeCat;
          return (
            <button
              key={c.key}
              onClick={() => setActiveCat(c.key)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-2xl border p-3 transition-all",
                active ? "border-gold bg-gold/10 shadow-sm" : "border-border bg-card hover:border-gold/40"
              )}
            >
              <Icon className="h-5 w-5" style={{ color: c.color }} />
              <span className="text-[11px] font-body font-medium text-foreground">{c.label}</span>
            </button>
          );
        })}
      </div>

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
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={addAllSeeds}
          className="text-[11px] font-body text-gold hover:underline flex items-center gap-1"
        >
          <Sparkles className="h-3 w-3" /> Adicionar essenciais de {activeMeta.label.toLowerCase()}
        </button>
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
          <p className="text-sm font-body text-muted-foreground">Sua lista de {activeMeta.label.toLowerCase()} está vazia.</p>
          <Button variant="gold" size="sm" onClick={addAllSeeds} className="gap-1.5">
            <Sparkles className="h-4 w-4" /> Começar com essenciais
          </Button>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border overflow-hidden divide-y divide-border">
          {currentItems.map(item => (
            <div key={item.id} className="flex items-center gap-3 p-3">
              <button
                onClick={() => toggle(item)}
                className={cn(
                  "h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0",
                  item.checked ? "bg-green-500 border-green-500 text-white" : "border-muted-foreground/40 hover:border-gold"
                )}
              >
                {item.checked && <Check className="h-3 w-3" strokeWidth={3} />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-body text-foreground truncate", item.checked && "line-through text-muted-foreground")}>
                  {item.name}
                </p>
                {item.quantity && (
                  <p className="text-[11px] font-body text-muted-foreground">{item.quantity}</p>
                )}
              </div>
              <button onClick={() => remove(item.id)} className="p-1 text-muted-foreground hover:text-destructive">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

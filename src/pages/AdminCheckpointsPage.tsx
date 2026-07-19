import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Trash2, Save, Trophy, Smile } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type Row = {
  key: string;
  label: string;
  emoji: string;
  points: number;
  sort_order: number;
  active: boolean;
  _isNew?: boolean;
};

const EMOJI_QUICK = [
  "✨","🌟","👑","💛","💫","🌸","🌺","🌷","🦋","🕯️","📿","🛐","🙏","📖","📚","📄","📝","✍️","📸","📵","📱",
  "☕","🍵","🥗","🥑","🍎","🍇","💧","🥛","💊","🌿","🌱","🌞","🌙","🧘","🧘‍♀️","🏃‍♀️","💪","💃","🚶‍♀️",
  "🎧","🎶","▶️","🎥","💼","💰","💸","📊","🛒","🎁","💖","❤️","💌","🕊️","🌈","⭐","🔥","⚡","💎","🏆",
];

export default function AdminCheckpointsPage() {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("checkpoint_definitions" as any)
      .select("key,label,emoji,points,sort_order,active")
      .order("sort_order", { ascending: true });
    setRows(((data as any[]) || []) as Row[]);
    setLoading(false);
  };

  useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

  const patch = (key: string, patch: Partial<Row>) => {
    setRows(rs => rs.map(r => r.key === key ? { ...r, ...patch } : r));
  };

  const addNew = () => {
    const key = `novo_${Date.now()}`;
    setRows(rs => [
      ...rs,
      { key, label: "", emoji: "✨", points: 5, sort_order: (rs.at(-1)?.sort_order ?? 0) + 10, active: true, _isNew: true },
    ]);
  };

  const save = async (row: Row) => {
    if (!row.label.trim()) {
      toast({ title: "Dê um nome ao check-point", variant: "destructive" });
      return;
    }
    if (row._isNew && !row.key.trim()) {
      toast({ title: "Chave inválida", variant: "destructive" });
      return;
    }
    setSavingKey(row.key);
    const payload = {
      key: row.key.trim(),
      label: row.label.trim(),
      emoji: row.emoji || "✨",
      points: Number(row.points) || 0,
      sort_order: Number(row.sort_order) || 0,
      active: row.active,
    };
    const { error } = await supabase
      .from("checkpoint_definitions" as any)
      .upsert(payload as any, { onConflict: "key" });
    setSavingKey(null);
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Salvo ✨" });
    if (row._isNew) load();
  };

  const remove = async (row: Row) => {
    if (row._isNew) {
      setRows(rs => rs.filter(r => r.key !== row.key));
      return;
    }
    if (!confirm(`Remover "${row.label}"?`)) return;
    const { error } = await supabase.from("checkpoint_definitions" as any).delete().eq("key", row.key);
    if (error) {
      toast({ title: "Erro ao remover", description: error.message, variant: "destructive" });
      return;
    }
    setRows(rs => rs.filter(r => r.key !== row.key));
    toast({ title: "Removido" });
  };

  if (adminLoading) return <div className="p-6 text-center text-muted-foreground">Carregando...</div>;
  if (!isAdmin) return <div className="p-6 text-center text-muted-foreground">Acesso restrito.</div>;

  return (
    <div className="min-h-screen pb-24 pt-6 px-4 max-w-3xl mx-auto">
      <div className="mb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-gradient-gold flex items-center justify-center shadow-gold">
              <Trophy className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-display font-semibold text-foreground">Check-points do dia</h1>
              <p className="text-xs text-muted-foreground">Edite os textos, emojis e pontos que aparecem para as extraordinárias.</p>
            </div>
          </div>
          <Button onClick={addNew} className="gap-2">
            <Plus className="h-4 w-4" /> Novo
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-muted-foreground py-10">Carregando...</p>
      ) : (
        <div className="space-y-3">
          {rows.map(row => (
            <Card key={row.key}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center text-2xl shrink-0 hover:bg-gold/10 border border-border"
                        title="Trocar emoji"
                      >
                        {row.emoji || "✨"}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Smile className="h-4 w-4 text-gold" />
                        <p className="text-xs font-semibold">Escolha um emoji ou digite abaixo</p>
                      </div>
                      <div className="grid grid-cols-8 gap-1 max-h-56 overflow-y-auto mb-2">
                        {EMOJI_QUICK.map(e => (
                          <button
                            key={e}
                            type="button"
                            onClick={() => patch(row.key, { emoji: e })}
                            className="aspect-square text-xl hover:bg-muted rounded-md"
                          >
                            {e}
                          </button>
                        ))}
                      </div>
                      <Input
                        value={row.emoji}
                        onChange={e => patch(row.key, { emoji: e.target.value })}
                        placeholder="Cole qualquer emoji"
                        className="h-8 text-sm"
                      />
                    </PopoverContent>
                  </Popover>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm font-body font-semibold truncate">
                      {row.label || <span className="text-muted-foreground">Sem nome</span>}
                    </CardTitle>
                    <p className="text-[11px] text-muted-foreground truncate">{row.key}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch checked={row.active} onCheckedChange={v => patch(row.key, { active: v })} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {row._isNew && (
                  <div className="space-y-1">
                    <Label className="text-xs">Chave (identificador único, sem espaços)</Label>
                    <Input
                      value={row.key}
                      onChange={e => patch(row.key, { key: e.target.value.replace(/\s+/g, "_").toLowerCase() })}
                      placeholder="ex: meditacao_diaria"
                    />
                  </div>
                )}
                <div className="space-y-1">
                  <Label className="text-xs">Texto que aparece</Label>
                  <Input value={row.label} onChange={e => patch(row.key, { label: e.target.value })} placeholder="Ex: Meditação diária" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Pontos</Label>
                    <Input type="number" value={row.points} onChange={e => patch(row.key, { points: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Ordem</Label>
                    <Input type="number" value={row.sort_order} onChange={e => patch(row.key, { sort_order: Number(e.target.value) })} />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <Button variant="ghost" size="sm" onClick={() => remove(row)} className="text-destructive gap-1.5">
                    <Trash2 className="h-4 w-4" /> Remover
                  </Button>
                  <Button size="sm" onClick={() => save(row)} disabled={savingKey === row.key} className="gap-1.5">
                    <Save className="h-4 w-4" /> {savingKey === row.key ? "Salvando..." : "Salvar"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Plus, Trash2, Edit2, Save, X, ExternalLink, GripVertical, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface ContentItem {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  category: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

const CATEGORIES = [
  { value: "inteligencia-emocional", label: "Inteligência Emocional", icon: "🧠" },
  { value: "psicologia", label: "Psicologia Humana", icon: "💡" },
  { value: "oratoria", label: "Oratória", icon: "🎤" },
  { value: "comunicacao", label: "Comunicação Persuasiva", icon: "💬" },
  { value: "gestao-crise", label: "Gestão de Crise", icon: "🛡️" },
  { value: "podcasts", label: "Podcasts", icon: "🎧" },
  { value: "cursos", label: "Cursos & Plataformas", icon: "🎓" },
  { value: "youtube", label: "Canais YouTube", icon: "📺" },
  { value: "blogs", label: "Blogs & Fontes", icon: "📖" },
  { value: "geral", label: "Geral", icon: "📌" },
];

export default function AdminContentPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ContentItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [form, setForm] = useState({ title: "", description: "", url: "", category: "geral", icon: "📌" });

  useEffect(() => {
    if (!user) return;
    const check = async () => {
      const { data } = await supabase
        .from("user_roles" as any)
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin");
      const adm = (data as any[])?.length > 0;
      setIsAdmin(adm);
      if (!adm) { navigate("/"); return; }
      fetchItems();
    };
    check();
  }, [user]);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("admin_content" as any)
      .select("*")
      .order("category")
      .order("sort_order");
    if (data) setItems(data as unknown as ContentItem[]);
    setLoading(false);
  }, []);

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast({ title: "Título obrigatório", variant: "destructive" });
      return;
    }

    const catInfo = CATEGORIES.find(c => c.value === form.category);
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      url: form.url.trim() || null,
      category: form.category,
      icon: catInfo?.icon || "📌",
      created_by: user!.id,
    };

    if (editingId) {
      await supabase.from("admin_content" as any).update(payload as any).eq("id", editingId);
      toast({ title: "Conteúdo atualizado ✅" });
    } else {
      await supabase.from("admin_content" as any).insert(payload as any);
      toast({ title: "Conteúdo adicionado ✅" });
    }

    setForm({ title: "", description: "", url: "", category: "geral", icon: "📌" });
    setEditingId(null);
    setShowForm(false);
    fetchItems();
  };

  const handleEdit = (item: ContentItem) => {
    setForm({
      title: item.title,
      description: item.description || "",
      url: item.url || "",
      category: item.category,
      icon: item.icon,
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("admin_content" as any).delete().eq("id", id);
    toast({ title: "Conteúdo removido" });
    fetchItems();
  };

  const handleToggleActive = async (item: ContentItem) => {
    await supabase.from("admin_content" as any).update({ is_active: !item.is_active } as any).eq("id", item.id);
    fetchItems();
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ title: "", description: "", url: "", category: "geral", icon: "📌" });
  };

  if (!isAdmin && !loading) return null;

  const grouped = CATEGORIES.map(cat => ({
    ...cat,
    items: items.filter(i => i.category === cat.value),
  })).filter(g => g.items.length > 0);

  return (
    <div className="p-4 pb-24 max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-display font-bold text-foreground">Gestão de Conteúdo</h1>
          <p className="text-xs text-muted-foreground">Admin • Alta Performance</p>
        </div>
        <Button onClick={() => { cancelForm(); setShowForm(true); }} size="sm" className="gap-1 bg-gold text-foreground hover:bg-gold/90">
          <Plus className="h-4 w-4" /> Adicionar
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="border-gold/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">{editingId ? "Editar Conteúdo" : "Novo Conteúdo"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Título *"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
            <Textarea
              placeholder="Descrição (opcional)"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2}
            />
            <Input
              placeholder="URL / Link (opcional)"
              value={form.url}
              onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
            />
            <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.icon} {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1 gap-1 bg-gold text-foreground hover:bg-gold/90">
                <Save className="h-4 w-4" /> Salvar
              </Button>
              <Button variant="ghost" onClick={cancelForm}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content list */}
      {loading ? (
        <p className="text-center text-sm text-muted-foreground py-12">Carregando...</p>
      ) : items.length === 0 ? (
        <div className="text-center py-16 space-y-2">
          <p className="text-4xl">📋</p>
          <p className="text-sm text-muted-foreground">Nenhum conteúdo adicionado ainda</p>
          <p className="text-xs text-muted-foreground">Clique em "Adicionar" para começar</p>
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map(group => (
            <Card key={group.value}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <span>{group.icon}</span>
                  {group.label}
                  <span className="text-xs text-muted-foreground font-normal">({group.items.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {group.items.map(item => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border transition-colors ${
                      item.is_active ? "bg-muted/30 border-border" : "bg-muted/10 border-border/50 opacity-60"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{item.title}</p>
                      {item.description && (
                        <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                      )}
                      {item.url && (
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-gold hover:underline flex items-center gap-0.5 mt-0.5">
                          <ExternalLink className="h-3 w-3" /> Link
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => handleToggleActive(item)} className="p-1.5 rounded hover:bg-muted transition-colors" title={item.is_active ? "Desativar" : "Ativar"}>
                        {item.is_active ? <Eye className="h-3.5 w-3.5 text-green-400" /> : <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />}
                      </button>
                      <button onClick={() => handleEdit(item)} className="p-1.5 rounded hover:bg-muted transition-colors">
                        <Edit2 className="h-3.5 w-3.5 text-gold" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded hover:bg-muted transition-colors">
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

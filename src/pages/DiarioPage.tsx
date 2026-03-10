import { useState, useEffect } from "react";
import { Plus, Trash2, ArrowLeft, Palette, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DiaryNote {
  id: string;
  title: string;
  content: string;
  color: string;
  created_at: string;
  updated_at: string;
}

const NOTE_COLORS = [
  { value: "#C8A45C", label: "Gold" },
  { value: "#F59E0B", label: "Amber" },
  { value: "#EC4899", label: "Rosa" },
  { value: "#8B5CF6", label: "Roxo" },
  { value: "#3B82F6", label: "Azul" },
  { value: "#10B981", label: "Verde" },
  { value: "#F97316", label: "Laranja" },
  { value: "#EF4444", label: "Vermelho" },
  { value: "#6B7280", label: "Cinza" },
  { value: "#1E293B", label: "Escuro" },
];

export default function DiarioPage() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<DiaryNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeNote, setActiveNote] = useState<DiaryNote | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editColor, setEditColor] = useState("#C8A45C");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchNotes = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("diary_notes")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });
    if (data) setNotes(data as DiaryNote[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotes();
  }, [user]);

  const createNote = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("diary_notes")
      .insert({ user_id: user.id, title: "Sem título", content: "", color: "#C8A45C" })
      .select()
      .single();
    if (data) {
      const note = data as DiaryNote;
      setNotes(prev => [note, ...prev]);
      openNote(note);
    }
  };

  const openNote = (note: DiaryNote) => {
    setActiveNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditColor(note.color);
    setShowColorPicker(false);
  };

  const saveNote = async () => {
    if (!activeNote) return;
    setSaving(true);
    await supabase
      .from("diary_notes")
      .update({ title: editTitle || "Sem título", content: editContent, color: editColor })
      .eq("id", activeNote.id);
    setSaving(false);
    setActiveNote(null);
    fetchNotes();
  };

  const deleteNote = async (noteId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    await supabase.from("diary_notes").delete().eq("id", noteId);
    if (activeNote?.id === noteId) setActiveNote(null);
    setNotes(prev => prev.filter(n => n.id !== noteId));
  };

  // Editor view
  if (activeNote) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: `${editColor}10` }}>
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-border">
          <div className="flex items-center justify-between p-3 max-w-2xl mx-auto w-full">
            <button
              onClick={saveNote}
              className="flex items-center gap-1.5 text-sm font-body text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowColorPicker(prev => !prev)}
                className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
                title="Cor do bloco"
              >
                <Palette className="h-4 w-4" style={{ color: editColor }} />
              </button>
              <button
                onClick={() => deleteNote(activeNote.id)}
                className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                title="Excluir nota"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <Button variant="gold" size="sm" onClick={saveNote} disabled={saving}>
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>

          {/* Color picker */}
          {showColorPicker && (
            <div className="flex items-center gap-2 px-4 pb-3 max-w-2xl mx-auto w-full animate-fade-in flex-wrap">
              {NOTE_COLORS.map(c => (
                <button
                  key={c.value}
                  onClick={() => { setEditColor(c.value); setShowColorPicker(false); }}
                  className={cn(
                    "h-7 w-7 rounded-full border-2 transition-all hover:scale-110",
                    editColor === c.value ? "border-foreground scale-110" : "border-transparent"
                  )}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                />
              ))}
            </div>
          )}
        </div>

        {/* Editor */}
        <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 space-y-4">
          <div className="flex items-center gap-3">
            <div
              className="h-1.5 w-8 rounded-full"
              style={{ backgroundColor: editColor }}
            />
          </div>
          <input
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            placeholder="Título da nota..."
            className="w-full bg-transparent text-2xl font-heading font-bold text-foreground placeholder:text-muted-foreground/50 outline-none"
          />
          <textarea
            value={editContent}
            onChange={e => setEditContent(e.target.value)}
            placeholder="Comece a escrever..."
            className="w-full bg-transparent text-sm font-body text-foreground leading-relaxed placeholder:text-muted-foreground/40 outline-none resize-none min-h-[60vh]"
          />
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="p-4 pb-24 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-gold flex items-center justify-center shadow-gold">
            <BookOpen className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-heading font-bold text-foreground">Diário</h1>
            <p className="text-xs font-body text-muted-foreground">Suas anotações e insights</p>
          </div>
        </div>
        <Button variant="gold" size="sm" onClick={createNote} className="gap-1.5">
          <Plus className="h-4 w-4" /> Nova nota
        </Button>
      </div>

      {/* Notes grid */}
      {loading ? (
        <p className="text-center text-sm text-muted-foreground py-12">Carregando notas...</p>
      ) : notes.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-body font-semibold text-foreground">Nenhuma nota ainda</p>
            <p className="text-xs font-body text-muted-foreground mt-1">
              Crie seu primeiro bloco de notas para diário, insights ou listas
            </p>
          </div>
          <Button variant="gold" size="sm" onClick={createNote} className="gap-1.5">
            <Plus className="h-4 w-4" /> Criar primeira nota
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {notes.map(note => (
            <button
              key={note.id}
              onClick={() => openNote(note)}
              className="group relative bg-card rounded-2xl border border-border overflow-hidden text-left transition-all hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]"
            >
              {/* Color bar */}
              <div className="h-1.5 w-full" style={{ backgroundColor: note.color }} />

              <div className="p-3.5 space-y-2">
                <h3 className="text-sm font-body font-semibold text-foreground line-clamp-1">
                  {note.title || "Sem título"}
                </h3>
                <p className="text-[11px] font-body text-muted-foreground line-clamp-3 leading-relaxed min-h-[3rem]">
                  {note.content || "Nota vazia..."}
                </p>
                <p className="text-[10px] font-body text-muted-foreground/60">
                  {format(new Date(note.updated_at), "dd MMM yyyy, HH:mm", { locale: ptBR })}
                </p>
              </div>

              {/* Delete button */}
              <button
                onClick={e => deleteNote(note.id, e)}
                className="absolute top-3 right-2 p-1 rounded-md opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                title="Excluir"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

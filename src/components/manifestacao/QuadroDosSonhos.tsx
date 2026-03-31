import { useState, useRef } from "react";
import { Plus, X, ImageIcon, Sparkles, Trash2, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";

const CATEGORIES = [
  "Carreira", "Saúde", "Amor", "Financeiro", "Viagens", "Pessoal", "Espiritual"
];

interface DreamImage {
  id: string;
  url: string;
  category: string;
  note?: string;
  description?: string;
  createdAt: string;
  targetDate?: string;
}

export default function QuadroDosSonhos() {
  const [images, setImages] = useState<DreamImage[]>(() => {
    const saved = localStorage.getItem("glow-vision-board");
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [showAdd, setShowAdd] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState(CATEGORIES[0]);
  const [newTargetDate, setNewTargetDate] = useState<Date | undefined>();
  const fileRef = useRef<HTMLInputElement>(null);

  const save = (updated: DreamImage[]) => {
    setImages(updated);
    localStorage.setItem("glow-vision-board", JSON.stringify(updated));
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const newImage: DreamImage = {
        id: Date.now().toString(),
        url: reader.result as string,
        category: newCategory,
        note: newNote || undefined,
        description: newDescription || undefined,
        createdAt: new Date().toISOString(),
        targetDate: newTargetDate ? newTargetDate.toISOString() : undefined,
      };
      save([newImage, ...images]);
      setShowAdd(false);
      setNewNote("");
      setNewDescription("");
      setNewTargetDate(undefined);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const removeImage = (id: string) => {
    save(images.filter(img => img.id !== id));
  };

  const filtered = selectedCategory === "Todos" ? images : images.filter(img => img.category === selectedCategory);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/10 border border-gold/20">
          <Sparkles className="h-3 w-3 text-gold" />
          <span className="text-[10px] font-body font-semibold text-gold uppercase tracking-widest">Quadro dos Sonhos</span>
        </div>
        <p className="text-xs font-body text-muted-foreground italic">Monte seu mural visual com os sonhos que você está construindo</p>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {["Todos", ...CATEGORIES].map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-body font-semibold transition-all ${
              selectedCategory === cat
                ? "bg-gold text-background"
                : "bg-gold/10 text-gold border border-gold/20 hover:bg-gold/20"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Add button */}
      {!showAdd && (
        <button
          onClick={() => setShowAdd(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-gold/30 text-gold hover:border-gold/60 hover:bg-gold/5 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span className="text-sm font-body font-semibold">Adicionar ao mural</span>
        </button>
      )}

      {/* Add form */}
      {showAdd && (
        <div className="glass-gold rounded-2xl p-4 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <p className="text-sm font-body font-semibold text-foreground">Novo sonho</p>
            <button onClick={() => { setShowAdd(false); setNewNote(""); setNewDescription(""); setNewTargetDate(undefined); }} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          <select
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-background/50 border border-gold/20 text-sm font-body text-foreground"
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <input
            type="text"
            placeholder="Título do sonho (opcional)"
            value={newNote}
            onChange={e => setNewNote(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-background/50 border border-gold/20 text-sm font-body text-foreground placeholder:text-muted-foreground"
          />

          <textarea
            placeholder="Descreva esse sonho com suas palavras... O que ele significa pra você?"
            value={newDescription}
            onChange={e => setNewDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 rounded-lg bg-background/50 border border-gold/20 text-sm font-body text-foreground placeholder:text-muted-foreground resize-none"
          />

          {/* Target date (optional) */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-body text-muted-foreground">Data desejada para realizar (opcional)</p>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-body text-sm border-gold/20",
                    !newTargetDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-gold" />
                  {newTargetDate ? format(newTargetDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : "Escolher data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={newTargetDate}
                  onSelect={setNewTargetDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gold text-background font-body font-semibold text-sm hover:bg-gold/90 transition-all"
          >
            <ImageIcon className="h-4 w-4" />
            Escolher imagem
          </button>
        </div>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-10 space-y-2">
          <ImageIcon className="h-8 w-8 text-gold/30 mx-auto" />
          <p className="text-xs font-body text-muted-foreground">Seu mural está esperando seus sonhos ✨</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((img, i) => (
            <div
              key={img.id}
              className="glass rounded-2xl overflow-hidden shadow-lg animate-stagger"
              style={{ "--stagger": i } as React.CSSProperties}
            >
              {/* Image */}
              <div className="relative aspect-[16/10] overflow-hidden">
                <img src={img.url} alt={img.note || "Sonho"} className="w-full h-full object-cover" />
                <button onClick={() => removeImage(img.id)} className="absolute top-2 right-2 p-1.5 rounded-full bg-background/70 text-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <span className="absolute top-2 left-2 text-[10px] font-body font-semibold text-gold bg-background/70 px-2 py-0.5 rounded-full">{img.category}</span>
              </div>

              {/* Info */}
              <div className="p-3 space-y-1.5">
                {img.note && <p className="text-sm font-body font-semibold text-foreground">{img.note}</p>}
                {img.description && <p className="text-xs font-body text-muted-foreground leading-relaxed">{img.description}</p>}

                <div className="flex items-center gap-3 pt-1">
                  <div className="flex items-center gap-1 text-[10px] font-body text-muted-foreground">
                    <CalendarIcon className="h-3 w-3 text-gold/60" />
                    Criado em {format(new Date(img.createdAt), "dd/MM/yyyy")}
                  </div>
                  {img.targetDate && (
                    <div className="flex items-center gap-1 text-[10px] font-body text-gold font-semibold">
                      <Sparkles className="h-3 w-3" />
                      Meta: {format(new Date(img.targetDate), "dd/MM/yyyy")}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

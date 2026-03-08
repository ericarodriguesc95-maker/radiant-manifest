import { useState, useRef } from "react";
import { Plus, X, ImageIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VisionItem {
  id: string;
  imageUrl: string;
  caption: string;
  category: string;
}

const categories = [
  { id: "all", label: "Todos", emoji: "✨" },
  { id: "carreira", label: "Carreira", emoji: "💼" },
  { id: "saude", label: "Saúde", emoji: "🏋️‍♀️" },
  { id: "relacionamentos", label: "Amor", emoji: "💕" },
  { id: "financeiro", label: "Dinheiro", emoji: "💰" },
  { id: "viagens", label: "Viagens", emoji: "✈️" },
  { id: "lifestyle", label: "Lifestyle", emoji: "🌸" },
];

const VisionBoardPage = () => {
  const [items, setItems] = useState<VisionItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [newCaption, setNewCaption] = useState("");
  const [newCategory, setNewCategory] = useState("lifestyle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [viewItem, setViewItem] = useState<VisionItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = activeCategory === "all" ? items : items.filter(i => i.category === activeCategory);

  // Pinterest-style: distribute items into 2 columns
  const col1: VisionItem[] = [];
  const col2: VisionItem[] = [];
  filtered.forEach((item, i) => {
    if (i % 2 === 0) col1.push(item);
    else col2.push(item);
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setShowAdd(true);
  };

  const addItem = () => {
    if (!previewUrl) return;
    const newItem: VisionItem = {
      id: Date.now().toString(),
      imageUrl: previewUrl,
      caption: newCaption,
      category: newCategory,
    };
    setItems(prev => [newItem, ...prev]);
    setNewCaption("");
    setPreviewUrl(null);
    setSelectedFile(null);
    setShowAdd(false);
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    setViewItem(null);
  };

  const cancelAdd = () => {
    setShowAdd(false);
    setPreviewUrl(null);
    setSelectedFile(null);
    setNewCaption("");
  };

  return (
    <div className="min-h-screen">
      <header className="px-5 pt-12 pb-2">
        <p className="text-sm text-muted-foreground font-body tracking-widest uppercase">Meu</p>
        <h1 className="text-2xl font-display font-bold">Vision Board <span className="text-gold">✦</span></h1>
        <p className="text-xs text-muted-foreground font-body mt-1">Visualize seus sonhos todos os dias</p>
      </header>

      <div className="px-5 space-y-4 pb-6">
        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "shrink-0 px-3 py-1.5 rounded-full text-xs font-body font-medium transition-all flex items-center gap-1",
                activeCategory === cat.id
                  ? "bg-gold text-primary-foreground shadow-gold"
                  : "bg-card text-muted-foreground border border-border"
              )}
            >
              <span>{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Add image button */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Add modal */}
        {showAdd && previewUrl && (
          <div className="bg-card rounded-2xl border border-border p-4 space-y-3 animate-fade-in">
            <div className="relative rounded-xl overflow-hidden">
              <img src={previewUrl} alt="Preview" className="w-full max-h-60 object-cover rounded-xl" />
              <button
                onClick={cancelAdd}
                className="absolute top-2 right-2 h-7 w-7 rounded-full bg-secondary/80 backdrop-blur flex items-center justify-center"
              >
                <X className="h-4 w-4 text-secondary-foreground" />
              </button>
            </div>
            <input
              value={newCaption}
              onChange={e => setNewCaption(e.target.value)}
              placeholder="Adicione uma legenda inspiradora..."
              className="w-full bg-transparent text-sm font-body outline-none placeholder:text-muted-foreground"
            />
            <div className="flex gap-2 flex-wrap">
              {categories
                .filter(c => c.id !== "all")
                .map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setNewCategory(cat.id)}
                    className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-body font-medium transition-all",
                      newCategory === cat.id
                        ? "bg-gold/20 text-gold ring-1 ring-gold/30"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {cat.emoji} {cat.label}
                  </button>
                ))}
            </div>
            <Button variant="gold" size="sm" onClick={addItem} className="w-full">
              <Sparkles className="h-3.5 w-3.5 mr-1" /> Adicionar ao Vision Board
            </Button>
          </div>
        )}

        {!showAdd && (
          <Button
            variant="outline"
            className="w-full border-dashed"
            onClick={() => fileInputRef.current?.click()}
          >
            <Plus className="h-4 w-4 mr-2" /> Adicionar Imagem
          </Button>
        )}

        {/* Pinterest masonry grid */}
        {filtered.length > 0 ? (
          <div className="flex gap-3">
            {[col1, col2].map((col, colIdx) => (
              <div key={colIdx} className="flex-1 flex flex-col gap-3">
                {col.map(item => {
                  const cat = categories.find(c => c.id === item.category);
                  return (
                    <button
                      key={item.id}
                      onClick={() => setViewItem(item)}
                      className="relative rounded-2xl overflow-hidden shadow-card group animate-fade-in text-left"
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.caption}
                        className="w-full object-cover"
                        style={{ minHeight: colIdx === 0 ? "160px" : "200px" }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      {item.caption && (
                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-secondary/90 to-transparent">
                          <p className="text-xs font-body text-secondary-foreground font-medium leading-tight">
                            {item.caption}
                          </p>
                          {cat && (
                            <span className="text-[10px] text-gold font-body">
                              {cat.emoji} {cat.label}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-gold/10 flex items-center justify-center mb-4">
              <ImageIcon className="h-7 w-7 text-gold" />
            </div>
            <h3 className="font-display font-semibold text-foreground mb-1">Seu Vision Board está vazio</h3>
            <p className="text-xs text-muted-foreground font-body max-w-[200px]">
              Adicione imagens que representem seus sonhos e objetivos
            </p>
          </div>
        )}
      </div>

      {/* Fullscreen view */}
      {viewItem && (
        <div className="fixed inset-0 z-50 bg-secondary/95 backdrop-blur-md flex flex-col animate-fade-in">
          <div className="flex items-center justify-between p-4">
            <button onClick={() => setViewItem(null)}>
              <X className="h-5 w-5 text-secondary-foreground" />
            </button>
            <button
              onClick={() => removeItem(viewItem.id)}
              className="text-xs font-body text-destructive"
            >
              Remover
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center px-5">
            <img
              src={viewItem.imageUrl}
              alt={viewItem.caption}
              className="max-w-full max-h-[60vh] object-contain rounded-2xl"
            />
          </div>
          {viewItem.caption && (
            <div className="p-6 text-center">
              <p className="font-display text-lg text-secondary-foreground font-medium italic">
                "{viewItem.caption}"
              </p>
              <span className="text-xs text-gold font-body mt-2 inline-block">
                {categories.find(c => c.id === viewItem.category)?.emoji}{" "}
                {categories.find(c => c.id === viewItem.category)?.label}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VisionBoardPage;

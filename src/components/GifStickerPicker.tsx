import { useState, useEffect, useCallback, useRef } from "react";
import { Search, Smile, X, Star, Loader2, Package, Plus, Upload, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

interface GifResult {
  id: string;
  title: string;
  url: string;
  preview: string;
  width: number;
  height: number;
}

interface SavedSticker {
  id: string;
  url: string;
  preview_url: string | null;
  type: string;
  label: string | null;
}

interface StickerPack {
  id: string;
  user_id: string;
  name: string;
  cover_url: string | null;
  is_public: boolean;
  items: { id: string; image_url: string; label: string | null }[];
}

const STICKER_CATEGORIES = [
  {
    name: "Reações",
    emoji: "😊",
    stickers: ["😂", "🤣", "😍", "🥰", "😘", "🤩", "😎", "🥺", "😭", "😱", "🤯", "🥳", "🤗", "🫶", "👏", "🙌"],
  },
  {
    name: "Amor",
    emoji: "❤️",
    stickers: ["❤️", "💖", "💕", "💗", "💝", "💘", "💞", "💓", "🥰", "😍", "😘", "💋", "🫶", "🤗", "💐", "🌹"],
  },
  {
    name: "Motivação",
    emoji: "💪",
    stickers: ["💪", "🔥", "⭐", "✨", "🌟", "💯", "🏆", "👑", "🚀", "🎯", "💎", "🦋", "🌈", "🙏", "🫡", "💫"],
  },
  {
    name: "Festa",
    emoji: "🎉",
    stickers: ["🎉", "🥳", "🎊", "🎈", "🎂", "🍰", "🥂", "🍾", "💃", "🕺", "🎶", "🎵", "🪩", "🎁", "🎀", "🎆"],
  },
  {
    name: "Natureza",
    emoji: "🌸",
    stickers: ["🌸", "🌺", "🌻", "🌷", "🌹", "🌼", "🍀", "🌿", "🦋", "🌈", "☀️", "🌙", "⭐", "🌊", "🌴", "🍃"],
  },
];

interface Props {
  onSelect: (url: string, type: "gif" | "sticker") => void;
  onClose: () => void;
}

export default function GifStickerPicker({ onSelect, onClose }: Props) {
  const { user } = useAuth();
  const [tab, setTab] = useState<"stickers" | "gifs" | "packs" | "favorites">("stickers");
  const [searchQuery, setSearchQuery] = useState("");
  const [gifResults, setGifResults] = useState<GifResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<SavedSticker[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();

  // Sticker packs
  const [packs, setPacks] = useState<StickerPack[]>([]);
  const [selectedPack, setSelectedPack] = useState<StickerPack | null>(null);
  const [showCreatePack, setShowCreatePack] = useState(false);
  const [newPackName, setNewPackName] = useState("");
  const [uploadingSticker, setUploadingSticker] = useState(false);
  const stickerInputRef = useRef<HTMLInputElement>(null);

  // Fetch favorites
  useEffect(() => {
    if (!user) return;
    const fetchFavorites = async () => {
      const { data } = await supabase
        .from("saved_stickers")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (data) setFavorites(data as SavedSticker[]);
    };
    fetchFavorites();
  }, [user]);

  // Fetch sticker packs
  useEffect(() => {
    const fetchPacks = async () => {
      const { data: packsData } = await supabase
        .from("sticker_packs")
        .select("*")
        .order("created_at", { ascending: false });

      if (!packsData) return;

      const packIds = packsData.map((p: any) => p.id);
      const { data: itemsData } = await supabase
        .from("sticker_pack_items")
        .select("*")
        .in("pack_id", packIds.length > 0 ? packIds : ["00000000-0000-0000-0000-000000000000"]);

      const itemsByPack = new Map<string, any[]>();
      (itemsData || []).forEach((item: any) => {
        if (!itemsByPack.has(item.pack_id)) itemsByPack.set(item.pack_id, []);
        itemsByPack.get(item.pack_id)!.push(item);
      });

      setPacks(packsData.map((p: any) => ({
        ...p,
        items: itemsByPack.get(p.id) || [],
      })));
    };
    fetchPacks();
  }, []);

  const searchGifs = useCallback(async (query: string, type: "gif" | "sticker") => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("search-gifs", {
        body: { query, type, limit: 20 },
      });
      if (!error && data?.results) {
        setGifResults(data.results);
      }
    } catch (e) {
      console.error("GIF search error:", e);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (tab === "gifs") searchGifs("", "gif");
  }, [tab]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      if (query.trim()) {
        searchGifs(query, "gif");
      } else {
        searchGifs("", "gif");
      }
    }, 500);
  };

  const toggleFavorite = async (url: string, previewUrl: string | null, type: "gif" | "sticker", label?: string) => {
    if (!user) return;
    const existing = favorites.find(f => f.url === url);
    if (existing) {
      await supabase.from("saved_stickers").delete().eq("id", existing.id);
      setFavorites(prev => prev.filter(f => f.id !== existing.id));
    } else {
      const { data } = await supabase.from("saved_stickers").insert({
        user_id: user.id, url, preview_url: previewUrl, type, label: label || null,
      }).select().single();
      if (data) setFavorites(prev => [data as SavedSticker, ...prev]);
    }
  };

  const isFavorited = (url: string) => favorites.some(f => f.url === url);

  // Sticker pack management
  const createPack = async () => {
    if (!newPackName.trim() || !user) return;
    const { data } = await supabase.from("sticker_packs").insert({
      user_id: user.id, name: newPackName.trim(), is_public: true,
    }).select().single();
    if (data) {
      const newPack = { ...data, items: [] } as StickerPack;
      setPacks(prev => [newPack, ...prev]);
      setSelectedPack(newPack);
      setShowCreatePack(false);
      setNewPackName("");
    }
  };

  const deletePack = async (packId: string) => {
    await supabase.from("sticker_packs").delete().eq("id", packId);
    setPacks(prev => prev.filter(p => p.id !== packId));
    if (selectedPack?.id === packId) setSelectedPack(null);
  };

  const uploadStickerToPack = async (file: File, packId: string) => {
    if (!user) return;
    setUploadingSticker(true);
    const ext = file.name.split(".").pop() || "png";
    const path = `${user.id}/${packId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("stickers").upload(path, file);
    if (error) { console.error("Upload error:", error); setUploadingSticker(false); return; }
    const { data: urlData } = supabase.storage.from("stickers").getPublicUrl(path);

    const { data: item } = await supabase.from("sticker_pack_items").insert({
      pack_id: packId, image_url: urlData.publicUrl, label: file.name.split(".")[0],
    }).select().single();

    if (item) {
      setPacks(prev => prev.map(p =>
        p.id === packId ? { ...p, items: [...p.items, item as any], cover_url: p.cover_url || urlData.publicUrl } : p
      ));
      if (selectedPack?.id === packId) {
        setSelectedPack(prev => prev ? { ...prev, items: [...prev.items, item as any] } : null);
      }
      // Update cover if first item
      const pack = packs.find(p => p.id === packId);
      if (pack && !pack.cover_url) {
        await supabase.from("sticker_packs").update({ cover_url: urlData.publicUrl }).eq("id", packId);
      }
    }
    setUploadingSticker(false);
  };

  const deletePackItem = async (itemId: string, packId: string) => {
    await supabase.from("sticker_pack_items").delete().eq("id", itemId);
    setPacks(prev => prev.map(p =>
      p.id === packId ? { ...p, items: p.items.filter(i => i.id !== itemId) } : p
    ));
    if (selectedPack?.id === packId) {
      setSelectedPack(prev => prev ? { ...prev, items: prev.items.filter(i => i.id !== itemId) } : null);
    }
  };

  const tabs = [
    { key: "stickers" as const, label: "Emoji", icon: Smile },
    { key: "packs" as const, label: "Packs", icon: Package },
    { key: "gifs" as const, label: "GIFs", icon: Search },
    { key: "favorites" as const, label: "★", icon: Star },
  ];

  return (
    <div className="bg-card border border-border rounded-2xl shadow-lg overflow-hidden w-full max-w-sm animate-fade-in">
      {/* Header tabs */}
      <div className="flex items-center justify-between px-2 py-2 border-b border-border">
        <div className="flex gap-0.5">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setSearchQuery(""); setSelectedPack(null); }}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-body font-medium transition-colors",
                tab === t.key ? "bg-gold/20 text-gold" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <t.icon className="h-3 w-3" />
              {t.label}
            </button>
          ))}
        </div>
        <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Search bar for GIFs */}
      {tab === "gifs" && (
        <div className="px-3 py-2 border-b border-border">
          <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-1.5">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Buscar GIFs..."
              className="flex-1 bg-transparent text-xs font-body outline-none placeholder:text-muted-foreground"
              autoFocus
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="h-64 overflow-y-auto p-2">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 text-gold animate-spin" />
          </div>
        )}

        {/* Emoji Stickers tab */}
        {tab === "stickers" && !loading && (
          <div>
            <div className="flex gap-1 mb-2 overflow-x-auto pb-1">
              {STICKER_CATEGORIES.map((cat, i) => (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(i)}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-body whitespace-nowrap transition-colors",
                    selectedCategory === i ? "bg-gold/20 text-gold" : "text-muted-foreground hover:bg-muted/50"
                  )}
                >
                  <span className="text-sm">{cat.emoji}</span>
                  {cat.name}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-8 gap-1">
              {STICKER_CATEGORIES[selectedCategory].stickers.map((emoji, i) => (
                <button
                  key={`${emoji}-${i}`}
                  onClick={() => onSelect(`emoji:${emoji}`, "sticker")}
                  className="relative group h-10 w-10 flex items-center justify-center text-2xl hover:bg-muted/50 rounded-lg transition-colors"
                >
                  {emoji}
                  <span
                    onClick={e => { e.stopPropagation(); toggleFavorite(`emoji:${emoji}`, null, "sticker", emoji); }}
                    className="absolute -top-0.5 -right-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Star className={cn("h-3 w-3", isFavorited(`emoji:${emoji}`) ? "fill-gold text-gold" : "text-muted-foreground")} />
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sticker Packs tab */}
        {tab === "packs" && !loading && (
          <div>
            {!selectedPack ? (
              <>
                {/* Create new pack */}
                {showCreatePack ? (
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="text"
                      value={newPackName}
                      onChange={e => setNewPackName(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") createPack(); }}
                      placeholder="Nome do pack..."
                      className="flex-1 bg-muted/50 text-xs font-body rounded-lg px-3 py-2 outline-none border border-border focus:border-gold"
                      autoFocus
                    />
                    <Button variant="gold" size="sm" onClick={createPack} className="h-7 text-xs">Criar</Button>
                    <button onClick={() => setShowCreatePack(false)} className="text-muted-foreground"><X className="h-4 w-4" /></button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowCreatePack(true)}
                    className="w-full flex items-center gap-2 p-3 rounded-xl border border-dashed border-border hover:border-gold hover:bg-gold/5 transition-colors mb-3"
                  >
                    <Plus className="h-4 w-4 text-gold" />
                    <span className="text-xs font-body font-medium text-muted-foreground">Criar novo pack de figurinhas</span>
                  </button>
                )}

                {/* Pack list */}
                <div className="grid grid-cols-3 gap-2">
                  {packs.map(pack => (
                    <button
                      key={pack.id}
                      onClick={() => setSelectedPack(pack)}
                      className="relative group flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-muted/50 transition-colors"
                    >
                      {pack.cover_url ? (
                        <img src={pack.cover_url} alt={pack.name} className="h-14 w-14 rounded-lg object-cover" />
                      ) : (
                        <div className="h-14 w-14 rounded-lg bg-muted/50 flex items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <span className="text-[10px] font-body font-medium text-center truncate w-full">{pack.name}</span>
                      <span className="text-[9px] text-muted-foreground">{pack.items.length} figurinhas</span>
                      {pack.user_id === user?.id && (
                        <span
                          onClick={e => { e.stopPropagation(); deletePack(pack.id); }}
                          className="absolute top-0.5 right-0.5 p-0.5 bg-destructive/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <Trash2 className="h-2.5 w-2.5 text-destructive-foreground" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {packs.length === 0 && (
                  <p className="text-center text-xs text-muted-foreground font-body py-6">
                    Nenhum pack ainda. Crie o primeiro! 🎨
                  </p>
                )}
              </>
            ) : (
              <>
                {/* Pack detail view */}
                <div className="flex items-center gap-2 mb-3">
                  <button onClick={() => setSelectedPack(null)} className="text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                  <span className="text-xs font-body font-semibold flex-1">{selectedPack.name}</span>
                  {selectedPack.user_id === user?.id && (
                    <button
                      onClick={() => stickerInputRef.current?.click()}
                      disabled={uploadingSticker}
                      className="flex items-center gap-1 text-[11px] font-body text-gold hover:text-gold/80"
                    >
                      {uploadingSticker ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                      Adicionar
                    </button>
                  )}
                  <input
                    ref={stickerInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={e => {
                      const files = e.target.files;
                      if (files && selectedPack) {
                        Array.from(files).forEach(f => uploadStickerToPack(f, selectedPack.id));
                      }
                      e.target.value = "";
                    }}
                  />
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {selectedPack.items.map(item => (
                    <div
                      key={item.id}
                      className="relative group cursor-pointer rounded-lg overflow-hidden"
                      onClick={() => onSelect(item.image_url, "sticker")}
                    >
                      <img
                        src={item.image_url}
                        alt={item.label || ""}
                        className="w-full h-16 object-contain hover:scale-110 transition-transform bg-muted/30 rounded-lg p-1"
                        loading="lazy"
                      />
                      <div className="absolute top-0 right-0 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span
                          onClick={e => { e.stopPropagation(); toggleFavorite(item.image_url, item.image_url, "sticker", item.label || undefined); }}
                          className="p-0.5 bg-black/50 rounded-full cursor-pointer"
                        >
                          <Star className={cn("h-2.5 w-2.5", isFavorited(item.image_url) ? "fill-gold text-gold" : "text-white")} />
                        </span>
                        {selectedPack.user_id === user?.id && (
                          <span
                            onClick={e => { e.stopPropagation(); deletePackItem(item.id, selectedPack.id); }}
                            className="p-0.5 bg-destructive/80 rounded-full cursor-pointer"
                          >
                            <X className="h-2.5 w-2.5 text-destructive-foreground" />
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {selectedPack.items.length === 0 && (
                  <p className="text-center text-xs text-muted-foreground font-body py-6">
                    Pack vazio. {selectedPack.user_id === user?.id ? "Adicione figurinhas! ⬆️" : ""}
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {/* GIF results */}
        {tab === "gifs" && !loading && (
          <div className="grid grid-cols-2 gap-1.5">
            {gifResults.map(gif => (
              <div
                key={gif.id}
                className="relative group cursor-pointer rounded-lg overflow-hidden"
                onClick={() => onSelect(gif.url, "gif")}
              >
                <img src={gif.preview || gif.url} alt={gif.title} className="w-full h-24 object-cover hover:scale-105 transition-transform" loading="lazy" />
                <span
                  onClick={e => { e.stopPropagation(); toggleFavorite(gif.url, gif.preview, "gif", gif.title); }}
                  className="absolute top-1 right-1 p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Star className={cn("h-3 w-3", isFavorited(gif.url) ? "fill-gold text-gold" : "text-white")} />
                </span>
              </div>
            ))}
            {gifResults.length === 0 && (
              <p className="col-span-2 text-center text-xs text-muted-foreground font-body py-8">
                {searchQuery ? "Nenhum GIF encontrado" : "Busque GIFs acima ✨"}
              </p>
            )}
          </div>
        )}

        {/* Favorites */}
        {tab === "favorites" && (
          <div className="grid grid-cols-4 gap-1.5">
            {favorites.map(fav => (
              <div
                key={fav.id}
                className="relative group cursor-pointer rounded-lg overflow-hidden"
                onClick={() => onSelect(fav.url, fav.type as "gif" | "sticker")}
              >
                {fav.url.startsWith("emoji:") ? (
                  <div className="h-14 w-full flex items-center justify-center text-3xl hover:bg-muted/50 transition-colors">{fav.url.replace("emoji:", "")}</div>
                ) : (
                  <img src={fav.preview_url || fav.url} alt={fav.label || ""} className="w-full h-14 object-cover hover:scale-105 transition-transform" loading="lazy" />
                )}
                <span
                  onClick={e => { e.stopPropagation(); toggleFavorite(fav.url, fav.preview_url, fav.type as "gif" | "sticker", fav.label || undefined); }}
                  className="absolute top-0.5 right-0.5 p-0.5 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <X className="h-2.5 w-2.5 text-white" />
                </span>
              </div>
            ))}
            {favorites.length === 0 && (
              <p className="col-span-4 text-center text-xs text-muted-foreground font-body py-8">Nenhum favorito salvo ainda ⭐</p>
            )}
          </div>
        )}
      </div>

      {tab === "gifs" && (
        <div className="px-3 py-1.5 border-t border-border text-center">
          <span className="text-[10px] text-muted-foreground font-body">Powered by Tenor</span>
        </div>
      )}
    </div>
  );
}

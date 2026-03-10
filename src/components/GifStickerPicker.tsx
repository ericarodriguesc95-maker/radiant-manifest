import { useState, useEffect, useCallback, useRef } from "react";
import { Search, Heart, Smile, X, Star, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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

// Popular emoji stickers (categorized)
const STICKER_CATEGORIES = [
  {
    name: "Reações",
    emoji: "😊",
    stickers: [
      "😂", "🤣", "😍", "🥰", "😘", "🤩", "😎", "🥺",
      "😭", "😱", "🤯", "🥳", "🤗", "🫶", "👏", "🙌",
    ],
  },
  {
    name: "Amor",
    emoji: "❤️",
    stickers: [
      "❤️", "💖", "💕", "💗", "💝", "💘", "💞", "💓",
      "🥰", "😍", "😘", "💋", "🫶", "🤗", "💐", "🌹",
    ],
  },
  {
    name: "Motivação",
    emoji: "💪",
    stickers: [
      "💪", "🔥", "⭐", "✨", "🌟", "💯", "🏆", "👑",
      "🚀", "🎯", "💎", "🦋", "🌈", "🙏", "🫡", "💫",
    ],
  },
  {
    name: "Festa",
    emoji: "🎉",
    stickers: [
      "🎉", "🥳", "🎊", "🎈", "🎂", "🍰", "🥂", "🍾",
      "💃", "🕺", "🎶", "🎵", "🪩", "🎁", "🎀", "🎆",
    ],
  },
  {
    name: "Natureza",
    emoji: "🌸",
    stickers: [
      "🌸", "🌺", "🌻", "🌷", "🌹", "🌼", "🍀", "🌿",
      "🦋", "🌈", "☀️", "🌙", "⭐", "🌊", "🌴", "🍃",
    ],
  },
];

interface Props {
  onSelect: (url: string, type: "gif" | "sticker") => void;
  onClose: () => void;
}

export default function GifStickerPicker({ onSelect, onClose }: Props) {
  const { user } = useAuth();
  const [tab, setTab] = useState<"stickers" | "gifs" | "favorites">("stickers");
  const [searchQuery, setSearchQuery] = useState("");
  const [gifResults, setGifResults] = useState<GifResult[]>([]);
  const [stickerResults, setStickerResults] = useState<GifResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<SavedSticker[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();

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

  const searchGifs = useCallback(async (query: string, type: "gif" | "sticker") => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("search-gifs", {
        body: { query, type, limit: 20 },
      });
      if (!error && data?.results) {
        if (type === "gif") setGifResults(data.results);
        else setStickerResults(data.results);
      }
    } catch (e) {
      console.error("GIF search error:", e);
    }
    setLoading(false);
  }, []);

  // Load trending on tab switch
  useEffect(() => {
    if (tab === "gifs") searchGifs("", "gif");
    if (tab === "stickers" && stickerResults.length === 0) {
      // Only load Tenor stickers if user searches
    }
  }, [tab]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      if (query.trim()) {
        searchGifs(query, tab === "gifs" ? "gif" : "sticker");
      } else if (tab === "gifs") {
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
        user_id: user.id,
        url,
        preview_url: previewUrl,
        type,
        label: label || null,
      }).select().single();
      if (data) setFavorites(prev => [data as SavedSticker, ...prev]);
    }
  };

  const isFavorited = (url: string) => favorites.some(f => f.url === url);

  const handleSelectEmoji = (emoji: string) => {
    // For emoji stickers, we use a special format
    onSelect(`emoji:${emoji}`, "sticker");
  };

  return (
    <div className="bg-card border border-border rounded-2xl shadow-lg overflow-hidden w-full max-w-sm animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="flex gap-1">
          {([
            { key: "stickers", label: "Figurinhas", icon: Smile },
            { key: "gifs", label: "GIFs", icon: Search },
            { key: "favorites", label: "Favoritos", icon: Star },
          ] as const).map(t => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setSearchQuery(""); }}
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-body font-medium transition-colors",
                tab === t.key ? "bg-gold/20 text-gold" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          ))}
        </div>
        <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Search bar for GIFs */}
      {(tab === "gifs" || (tab === "stickers" && searchQuery)) && (
        <div className="px-3 py-2 border-b border-border">
          <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-1.5">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              placeholder={tab === "gifs" ? "Buscar GIFs..." : "Buscar figurinhas..."}
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
            {/* Category tabs */}
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

            {/* Emoji grid */}
            <div className="grid grid-cols-8 gap-1">
              {STICKER_CATEGORIES[selectedCategory].stickers.map((emoji, i) => (
                <button
                  key={`${emoji}-${i}`}
                  onClick={() => handleSelectEmoji(emoji)}
                  className="relative group h-10 w-10 flex items-center justify-center text-2xl hover:bg-muted/50 rounded-lg transition-colors"
                >
                  {emoji}
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      toggleFavorite(`emoji:${emoji}`, null, "sticker", emoji);
                    }}
                    className="absolute -top-0.5 -right-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Star
                      className={cn(
                        "h-3 w-3",
                        isFavorited(`emoji:${emoji}`) ? "fill-gold text-gold" : "text-muted-foreground"
                      )}
                    />
                  </button>
                </button>
              ))}
            </div>

            {/* Tenor sticker search hint */}
            <div className="mt-3 text-center">
              <button
                onClick={() => { setTab("stickers"); handleSearch(""); }}
                className="text-[11px] text-muted-foreground font-body hover:text-gold transition-colors"
              >
                🔍 Busque figurinhas animadas na barra acima
              </button>
            </div>
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
                <img
                  src={gif.preview || gif.url}
                  alt={gif.title}
                  className="w-full h-24 object-cover hover:scale-105 transition-transform"
                  loading="lazy"
                />
                <button
                  onClick={e => {
                    e.stopPropagation();
                    toggleFavorite(gif.url, gif.preview, "gif", gif.title);
                  }}
                  className="absolute top-1 right-1 p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Star
                    className={cn(
                      "h-3 w-3",
                      isFavorited(gif.url) ? "fill-gold text-gold" : "text-white"
                    )}
                  />
                </button>
              </div>
            ))}
            {gifResults.length === 0 && !loading && (
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
                  <div className="h-14 w-full flex items-center justify-center text-3xl hover:bg-muted/50 transition-colors">
                    {fav.url.replace("emoji:", "")}
                  </div>
                ) : (
                  <img
                    src={fav.preview_url || fav.url}
                    alt={fav.label || ""}
                    className="w-full h-14 object-cover hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                )}
                <button
                  onClick={e => {
                    e.stopPropagation();
                    toggleFavorite(fav.url, fav.preview_url, fav.type as "gif" | "sticker", fav.label || undefined);
                  }}
                  className="absolute top-0.5 right-0.5 p-0.5 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-2.5 w-2.5 text-white" />
                </button>
              </div>
            ))}
            {favorites.length === 0 && (
              <p className="col-span-4 text-center text-xs text-muted-foreground font-body py-8">
                Nenhum favorito salvo ainda ⭐
              </p>
            )}
          </div>
        )}
      </div>

      {/* Tenor attribution */}
      {tab === "gifs" && (
        <div className="px-3 py-1.5 border-t border-border text-center">
          <span className="text-[10px] text-muted-foreground font-body">Powered by Tenor</span>
        </div>
      )}
    </div>
  );
}

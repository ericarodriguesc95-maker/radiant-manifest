import { useState, useRef, useEffect } from "react";
import { Smile } from "lucide-react";
import { cn } from "@/lib/utils";

const SKIN_TONES = [
  { label: "Padrão", modifier: "", color: "#FFCC4D" },
  { label: "Claro", modifier: "🏻", color: "#FADCBC" },
  { label: "Médio claro", modifier: "🏼", color: "#E0BB95" },
  { label: "Médio", modifier: "🏽", color: "#BF8F68" },
  { label: "Médio escuro", modifier: "🏾", color: "#9B643D" },
  { label: "Escuro", modifier: "🏿", color: "#594539" },
];

const EMOJI_CATEGORIES = [
  {
    name: "Mais usados",
    emojis: ["😀","😂","🥰","😍","😘","🤩","😊","🙏","❤️","🔥","✨","💪","👏","🎉","💕","😢","😭","🥺","😎","🤗","💖","🌟","👑","🦋","🌸","💫","✅","🙌","💃","🌹"]
  },
  {
    name: "Rostos",
    emojis: ["😀","😃","😄","😁","😆","😅","🤣","😂","🙂","😊","😇","🥰","😍","🤩","😘","😗","😚","😙","🥲","😋","😛","😜","🤪","😝","🤑","🤗","🤭","🤫","🤔","😐","😑","😶","😏","😒","🙄","😬","😮‍💨","🤥","😌","😔","😪","🤤","😴","😷","🤒","🤕","🤢","🤮","🥵","🥶","🥴","😵","🤯","🤠","🥳","🥸","😎","🤓","🧐","😕","😟","🙁","😮","😯","😲","😳","🥺","😦","😧","😨","😰","😥","😢","😭","😱","😖","😣","😞","😓","😩","😫","🥱","😤","😡","😠","🤬","😈","👿","💀"]
  },
  {
    name: "Gestos",
    emojis: ["👋","🤚","🖐️","✋","🖖","👌","🤌","🤏","✌️","🤞","🤟","🤘","🤙","👈","👉","👆","🖕","👇","☝️","👍","👎","✊","👊","🤛","🤜","👏","🙌","👐","🤲","🤝","🙏","💪","🦾","🖊️"]
  },
  {
    name: "Amor",
    emojis: ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❣️","💕","💞","💓","💗","💖","💘","💝","💟","♥️","😍","🥰","😘","💋","💑","👩‍❤️‍👨","👩‍❤️‍👩","💏"]
  },
  {
    name: "Natureza",
    emojis: ["🌸","🌺","🌻","🌼","🌷","🌹","🥀","🌵","🌴","🌳","🌲","🍀","🍃","🍂","🍁","🌿","🌱","🌾","💐","🦋","🐝","🌈","☀️","🌙","⭐","🌟","💫","✨","⚡","🔥","🌊"]
  },
  {
    name: "Objetos",
    emojis: ["🎉","🎊","🎈","🎁","🏆","🥇","🎯","💎","👑","💄","👗","👠","👜","🎵","🎶","🎤","📸","💻","📱","💡","📚","✏️","🖋️","📝","💌","🗝️","🔑","💰","🧿"]
  },
];

// Emojis that support skin tone modifiers
const SKIN_TONE_EMOJIS = new Set([
  "👋","🤚","🖐️","✋","🖖","👌","🤌","🤏","✌️","🤞","🤟","🤘","🤙",
  "👈","👉","👆","🖕","👇","☝️","👍","👎","✊","👊","🤛","🤜","👏",
  "🙌","👐","🤲","🤝","🙏","💪","🤳","💃","🕺","👋","🤚",
]);

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  className?: string;
  size?: "sm" | "md";
}

const EmojiPicker = ({ onSelect, className, size = "md" }: EmojiPickerProps) => {
  const [open, setOpen] = useState(false);
  const [skinTone, setSkinTone] = useState(0);
  const [activeCategory, setActiveCategory] = useState(0);
  const [showSkinTones, setShowSkinTones] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setShowSkinTones(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const applyTone = (emoji: string) => {
    if (skinTone === 0 || !SKIN_TONE_EMOJIS.has(emoji)) return emoji;
    return emoji + SKIN_TONES[skinTone].modifier;
  };

  const handleSelect = (emoji: string) => {
    onSelect(applyTone(emoji));
  };

  const isSmall = size === "sm";

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => { setOpen(!open); setShowSkinTones(false); }}
        className={cn(
          "rounded-lg text-muted-foreground hover:text-gold hover:bg-gold/10 transition-colors",
          isSmall ? "p-1" : "p-2"
        )}
        title="Emojis"
      >
        <Smile className={isSmall ? "h-3.5 w-3.5" : "h-4.5 w-4.5"} />
      </button>

      {open && (
        <div className={cn(
          "absolute z-50 bg-card border border-border rounded-2xl shadow-xl",
          isSmall ? "bottom-8 right-0 w-64" : "bottom-10 left-0 w-72"
        )}>
          {/* Header with skin tone */}
          <div className="flex items-center justify-between px-3 pt-3 pb-1">
            <span className="text-xs font-body font-semibold text-muted-foreground">Emojis</span>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSkinTones(!showSkinTones)}
                className="flex items-center gap-1 text-xs font-body text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-muted/50"
              >
                <span
                  className="h-4 w-4 rounded-full border border-border"
                  style={{ backgroundColor: SKIN_TONES[skinTone].color }}
                />
                <span className="text-[10px]">Tom</span>
              </button>
              {showSkinTones && (
                <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-xl shadow-lg p-2 flex gap-1.5 z-50">
                  {SKIN_TONES.map((tone, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => { setSkinTone(i); setShowSkinTones(false); }}
                      className={cn(
                        "h-6 w-6 rounded-full border-2 transition-all hover:scale-110",
                        skinTone === i ? "border-gold scale-110" : "border-transparent"
                      )}
                      style={{ backgroundColor: tone.color }}
                      title={tone.label}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Category tabs */}
          <div className="flex gap-0.5 px-2 pb-1 overflow-x-auto scrollbar-hide">
            {EMOJI_CATEGORIES.map((cat, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveCategory(i)}
                className={cn(
                  "px-2 py-1 text-[10px] font-body rounded-md whitespace-nowrap transition-colors",
                  activeCategory === i
                    ? "bg-gold/20 text-gold font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Emoji grid */}
          <div className="px-2 pb-2 max-h-48 overflow-y-auto scrollbar-hide">
            <div className="grid grid-cols-8 gap-0.5">
              {EMOJI_CATEGORIES[activeCategory].emojis.map((emoji, i) => (
                <button
                  key={`${emoji}-${i}`}
                  type="button"
                  onClick={() => handleSelect(emoji)}
                  className="h-8 w-8 flex items-center justify-center text-lg hover:bg-muted/60 rounded-lg transition-colors"
                >
                  {applyTone(emoji)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmojiPicker;

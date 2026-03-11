import { useState, useRef, useCallback, useEffect } from "react";
import { X, Type, Smile, Trash2, Plus, Minus, AlignCenter, AlignLeft, AlignRight, Move, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Overlay {
  id: string;
  type: "text" | "emoji";
  content: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  fontSize: number;
  fontFamily: string;
  color: string;
  align: "left" | "center" | "right";
}

interface StoryEditorProps {
  mediaSrc: string;
  mediaType: "image" | "video";
  onPublish: (canvas: HTMLCanvasElement | null, overlays: Overlay[]) => void;
  onBack: () => void;
  uploading: boolean;
}

const FONTS = [
  { name: "Clássica", family: "'Playfair Display', serif" },
  { name: "Moderna", family: "'Inter', sans-serif" },
  { name: "Negrito", family: "'Arial Black', sans-serif" },
  { name: "Cursiva", family: "'Georgia', serif" },
  { name: "Mono", family: "'Courier New', monospace" },
];

const TEXT_COLORS = ["#FFFFFF", "#000000", "#FFD700", "#FF4444", "#44FF44", "#4488FF", "#FF44FF", "#FF8800"];

const EMOJI_LIST = [
  "😍", "🔥", "💪", "✨", "🌟", "💖", "🙏", "🎯", "👑", "💎",
  "🦋", "🌸", "💫", "⭐", "🌙", "☀️", "🌈", "❤️", "💜", "💛",
  "😊", "🥰", "😎", "🤩", "💃", "🎉", "🏆", "💐", "🌺", "🎀",
  "✅", "📈", "💰", "🧘‍♀️", "❤️‍🔥", "🫶", "💅", "👸", "🌻", "🍀",
];

const StoryEditor = ({ mediaSrc, mediaType, onPublish, onBack, uploading }: StoryEditorProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Image transform (pan & zoom)
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const pinchStart = useRef<number | null>(null);
  const pinchScaleStart = useRef(1);

  // Overlays
  const [overlays, setOverlays] = useState<Overlay[]>([]);
  const [activeOverlay, setActiveOverlay] = useState<string | null>(null);
  const [draggingOverlay, setDraggingOverlay] = useState<string | null>(null);
  const dragStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });

  // Tool panels
  const [showTextTool, setShowTextTool] = useState(false);
  const [showEmojiTool, setShowEmojiTool] = useState(false);
  const [editingText, setEditingText] = useState("");
  const [textFontIdx, setTextFontIdx] = useState(0);
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [textSize, setTextSize] = useState(28);
  const [editingOverlayId, setEditingOverlayId] = useState<string | null>(null);

  // ---- Image Pan & Zoom ----
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setScale(s => Math.max(0.5, Math.min(3, s - e.deltaY * 0.002)));
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    // Don't pan if touching an overlay
    if ((e.target as HTMLElement).closest("[data-overlay]")) return;
    setIsPanning(true);
    panStart.current = { x: e.clientX, y: e.clientY, tx: translate.x, ty: translate.y };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, [translate]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isPanning) return;
    const dx = e.clientX - panStart.current.x;
    const dy = e.clientY - panStart.current.y;
    setTranslate({ x: panStart.current.tx + dx, y: panStart.current.ty + dy });
  }, [isPanning]);

  const handlePointerUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Touch pinch zoom
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      pinchStart.current = dist;
      pinchScaleStart.current = scale;
    }
  }, [scale]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchStart.current !== null) {
      e.preventDefault();
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = dist / pinchStart.current;
      setScale(Math.max(0.5, Math.min(3, pinchScaleStart.current * ratio)));
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    pinchStart.current = null;
  }, []);

  // ---- Overlay Drag ----
  const startOverlayDrag = useCallback((id: string, e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setDraggingOverlay(id);
    setActiveOverlay(id);
    const overlay = overlays.find(o => o.id === id);
    if (overlay) {
      dragStart.current = { x: e.clientX, y: e.clientY, ox: overlay.x, oy: overlay.y };
    }
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, [overlays]);

  const moveOverlay = useCallback((e: React.PointerEvent) => {
    if (!draggingOverlay || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dx = ((e.clientX - dragStart.current.x) / rect.width) * 100;
    const dy = ((e.clientY - dragStart.current.y) / rect.height) * 100;
    setOverlays(prev => prev.map(o =>
      o.id === draggingOverlay
        ? { ...o, x: Math.max(0, Math.min(100, dragStart.current.ox + dx)), y: Math.max(0, Math.min(100, dragStart.current.oy + dy)) }
        : o
    ));
  }, [draggingOverlay]);

  const endOverlayDrag = useCallback(() => {
    setDraggingOverlay(null);
  }, []);

  // ---- Add Text Overlay ----
  const addTextOverlay = () => {
    if (!editingText.trim()) return;
    if (editingOverlayId) {
      setOverlays(prev => prev.map(o =>
        o.id === editingOverlayId
          ? { ...o, content: editingText, fontSize: textSize, fontFamily: FONTS[textFontIdx].family, color: textColor }
          : o
      ));
      setEditingOverlayId(null);
    } else {
      const newOverlay: Overlay = {
        id: `text-${Date.now()}`,
        type: "text",
        content: editingText,
        x: 50,
        y: 50,
        fontSize: textSize,
        fontFamily: FONTS[textFontIdx].family,
        color: textColor,
        align: "center",
      };
      setOverlays(prev => [...prev, newOverlay]);
    }
    setEditingText("");
    setShowTextTool(false);
  };

  const editOverlay = (id: string) => {
    const o = overlays.find(ov => ov.id === id);
    if (!o || o.type !== "text") return;
    setEditingText(o.content);
    setTextSize(o.fontSize);
    setTextColor(o.color);
    setTextFontIdx(FONTS.findIndex(f => f.family === o.fontFamily) || 0);
    setEditingOverlayId(id);
    setShowTextTool(true);
  };

  // ---- Add Emoji Overlay ----
  const addEmoji = (emoji: string) => {
    const newOverlay: Overlay = {
      id: `emoji-${Date.now()}`,
      type: "emoji",
      content: emoji,
      x: 30 + Math.random() * 40,
      y: 30 + Math.random() * 40,
      fontSize: 40,
      fontFamily: "sans-serif",
      color: "#fff",
      align: "center",
    };
    setOverlays(prev => [...prev, newOverlay]);
    setShowEmojiTool(false);
  };

  const deleteOverlay = (id: string) => {
    setOverlays(prev => prev.filter(o => o.id !== id));
    setActiveOverlay(null);
  };

  // ---- Render to Canvas for upload ----
  const renderToCanvas = useCallback((): Promise<HTMLCanvasElement | null> => {
    return new Promise((resolve) => {
      if (mediaType === "video") {
        resolve(null); // videos keep overlays as metadata
        return;
      }
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const W = 1080;
        const H = 1920;
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext("2d");
        if (!ctx) { resolve(null); return; }

        // Draw image with transform
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, W, H);
        ctx.save();
        ctx.translate(W / 2 + (translate.x / 100) * W, H / 2 + (translate.y / 100) * H);
        ctx.scale(scale, scale);
        const imgRatio = img.width / img.height;
        const canvasRatio = W / H;
        let drawW: number, drawH: number;
        if (imgRatio > canvasRatio) {
          drawH = H;
          drawW = H * imgRatio;
        } else {
          drawW = W;
          drawH = W / imgRatio;
        }
        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();

        // Draw overlays
        overlays.forEach(o => {
          const ox = (o.x / 100) * W;
          const oy = (o.y / 100) * H;
          const scaledSize = o.fontSize * (W / 400);
          ctx.save();
          ctx.translate(ox, oy);
          if (o.type === "emoji") {
            ctx.font = `${scaledSize}px sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(o.content, 0, 0);
          } else {
            ctx.font = `${scaledSize}px ${o.fontFamily}`;
            ctx.fillStyle = o.color;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.shadowColor = "rgba(0,0,0,0.6)";
            ctx.shadowBlur = 8;
            const lines = o.content.split("\n");
            lines.forEach((line, i) => {
              ctx.fillText(line, 0, (i - (lines.length - 1) / 2) * scaledSize * 1.2);
            });
          }
          ctx.restore();
        });

        resolve(canvas);
      };
      img.src = mediaSrc;
    });
  }, [mediaSrc, mediaType, scale, translate, overlays]);

  const handlePublish = async () => {
    const canvas = await renderToCanvas();
    onPublish(canvas, overlays);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 z-20 relative">
        <button onClick={onBack} className="text-white/80 hover:text-white">
          <X className="h-6 w-6" />
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setShowTextTool(!showTextTool); setShowEmojiTool(false); setEditingOverlayId(null); setEditingText(""); }}
            className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors ${showTextTool ? "bg-white/30" : "bg-white/10 hover:bg-white/20"}`}
          >
            <Type className="h-5 w-5 text-white" />
          </button>
          <button
            onClick={() => { setShowEmojiTool(!showEmojiTool); setShowTextTool(false); }}
            className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors ${showEmojiTool ? "bg-white/30" : "bg-white/10 hover:bg-white/20"}`}
          >
            <Smile className="h-5 w-5 text-white" />
          </button>
        </div>
        <Button variant="gold" size="sm" onClick={handlePublish} disabled={uploading}>
          {uploading ? "..." : "Publicar"}
        </Button>
      </div>

      {/* Editor canvas area */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden touch-none select-none"
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={(e) => { handlePointerMove(e); moveOverlay(e); }}
        onPointerUp={() => { handlePointerUp(); endOverlayDrag(); }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Media */}
        {mediaType === "image" ? (
          <img
            ref={imgRef}
            src={mediaSrc}
            alt=""
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            style={{
              transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
              transformOrigin: "center center",
            }}
            draggable={false}
          />
        ) : (
          <video
            src={mediaSrc}
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            style={{
              transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
              transformOrigin: "center center",
            }}
            autoPlay
            loop
            muted
            playsInline
          />
        )}

        {/* Zoom hint */}
        {scale === 1 && translate.x === 0 && translate.y === 0 && overlays.length === 0 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 pointer-events-none animate-pulse">
            <ZoomIn className="h-4 w-4 text-white/70" />
            <span className="text-white/70 text-xs font-body">Arraste ou use pinça para ajustar</span>
          </div>
        )}

        {/* Overlays */}
        {overlays.map(o => (
          <div
            key={o.id}
            data-overlay
            className={`absolute cursor-grab active:cursor-grabbing select-none ${activeOverlay === o.id ? "ring-2 ring-white/60 rounded-lg" : ""}`}
            style={{
              left: `${o.x}%`,
              top: `${o.y}%`,
              transform: "translate(-50%, -50%)",
              zIndex: 10,
              touchAction: "none",
            }}
            onPointerDown={(e) => startOverlayDrag(o.id, e)}
            onDoubleClick={() => o.type === "text" && editOverlay(o.id)}
          >
            {o.type === "emoji" ? (
              <span style={{ fontSize: `${o.fontSize}px`, userSelect: "none" }}>{o.content}</span>
            ) : (
              <p
                style={{
                  fontSize: `${o.fontSize}px`,
                  fontFamily: o.fontFamily,
                  color: o.color,
                  textAlign: o.align,
                  textShadow: "0 2px 8px rgba(0,0,0,0.7)",
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.2,
                  maxWidth: "80vw",
                  userSelect: "none",
                  pointerEvents: "none",
                }}
              >
                {o.content}
              </p>
            )}
            {activeOverlay === o.id && (
              <button
                className="absolute -top-3 -right-3 h-6 w-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg"
                onPointerDown={(e) => { e.stopPropagation(); deleteOverlay(o.id); }}
              >
                <Trash2 className="h-3 w-3 text-white" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Text tool panel */}
      {showTextTool && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/90 backdrop-blur-md p-4 z-30 rounded-t-2xl animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center gap-2 mb-3">
            <input
              value={editingText}
              onChange={(e) => setEditingText(e.target.value)}
              placeholder="Digite sua frase..."
              className="flex-1 bg-white/10 text-white rounded-xl px-4 py-3 text-sm outline-none placeholder:text-white/40 font-body"
              style={{ fontFamily: FONTS[textFontIdx].family }}
              autoFocus
            />
            <Button variant="gold" size="sm" onClick={addTextOverlay} disabled={!editingText.trim()}>
              {editingOverlayId ? "Salvar" : "Adicionar"}
            </Button>
          </div>

          {/* Font selector */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-2 scrollbar-none">
            {FONTS.map((f, i) => (
              <button
                key={f.name}
                onClick={() => setTextFontIdx(i)}
                className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${i === textFontIdx ? "bg-white/25 text-white" : "bg-white/10 text-white/60"}`}
                style={{ fontFamily: f.family }}
              >
                {f.name}
              </button>
            ))}
          </div>

          {/* Size control */}
          <div className="flex items-center gap-3 mb-2">
            <span className="text-white/50 text-xs font-body">Tamanho</span>
            <button onClick={() => setTextSize(s => Math.max(14, s - 2))} className="text-white/70 p-1 rounded bg-white/10">
              <Minus className="h-3 w-3" />
            </button>
            <span className="text-white/70 text-xs w-6 text-center">{textSize}</span>
            <button onClick={() => setTextSize(s => Math.min(60, s + 2))} className="text-white/70 p-1 rounded bg-white/10">
              <Plus className="h-3 w-3" />
            </button>
          </div>

          {/* Color picker */}
          <div className="flex gap-2">
            {TEXT_COLORS.map(c => (
              <button
                key={c}
                onClick={() => setTextColor(c)}
                className={`h-7 w-7 rounded-full border-2 transition-transform ${textColor === c ? "border-white scale-110" : "border-white/20"}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Emoji tool panel */}
      {showEmojiTool && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/90 backdrop-blur-md p-4 z-30 rounded-t-2xl animate-in slide-in-from-bottom duration-200">
          <p className="text-white/60 text-xs font-body mb-3">Toque para adicionar ao story</p>
          <div className="grid grid-cols-8 gap-2 max-h-48 overflow-y-auto">
            {EMOJI_LIST.map((emoji, i) => (
              <button
                key={i}
                onClick={() => addEmoji(emoji)}
                className="text-2xl h-10 w-10 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryEditor;

import { useState, useRef } from "react";
import { X, Type, Image, Camera, Video, Minus, Plus, AlignCenter, AlignLeft, AlignRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

interface StoryCreatorProps {
  onClose: () => void;
  onCreated: () => void;
}

const BG_COLORS = [
  "#C8A45C", "#E74C3C", "#8E44AD", "#2980B9", "#27AE60",
  "#F39C12", "#1ABC9C", "#2C3E50", "#E91E63", "#FF6B6B",
];

const FONTS = [
  { name: "Clássica", family: "'Playfair Display', serif", key: "playfair" },
  { name: "Moderna", family: "'Inter', sans-serif", key: "inter" },
  { name: "Negrito", family: "'Arial Black', sans-serif", key: "arial-black" },
  { name: "Cursiva", family: "'Georgia', serif", key: "georgia" },
  { name: "Mono", family: "'Courier New', monospace", key: "mono" },
];

const MIN_FONT_SIZE = 14;
const MAX_FONT_SIZE = 48;

const StoryCreator = ({ onClose, onCreated }: StoryCreatorProps) => {
  const { user } = useAuth();
  const [mode, setMode] = useState<"choose" | "text" | "media">("choose");
  const [textContent, setTextContent] = useState("");
  const [bgColor, setBgColor] = useState(BG_COLORS[0]);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [fontSize, setFontSize] = useState(24);
  const [fontIndex, setFontIndex] = useState(0);
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">("center");
  const [showFontPicker, setShowFontPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const currentFont = FONTS[fontIndex];

  const cycleAlign = () => {
    setTextAlign((prev) => (prev === "center" ? "left" : prev === "left" ? "right" : "center"));
  };

  const handleFileSelect = (file: File) => {
    const isVideo = file.type.startsWith("video/");
    setMediaType(isVideo ? "video" : "image");
    setMediaFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setMediaPreview(e.target?.result as string);
    reader.readAsDataURL(file);
    setMode("media");
  };

  const publish = async () => {
    if (!user) return;
    setUploading(true);

    try {
      if (mode === "text") {
        if (!textContent.trim()) return;
        // Encode font/size/align metadata in text_content as JSON prefix
        const meta = JSON.stringify({ font: currentFont.key, size: fontSize, align: textAlign });
        const content = `<!--meta:${meta}-->${textContent.trim()}`;
        await supabase.from("stories").insert({
          user_id: user.id,
          media_type: "text",
          text_content: content,
          bg_color: bgColor,
        });
      } else if (mode === "media" && mediaFile) {
        const ext = mediaFile.name.split(".").pop() || "bin";
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from("community-media").upload(path, mediaFile);
        if (error) throw error;
        const { data } = supabase.storage.from("community-media").getPublicUrl(path);

        await supabase.from("stories").insert({
          user_id: user.id,
          media_url: data.publicUrl,
          media_type: mediaType,
          text_content: caption.trim() || null,
        });
      }
      onCreated();
    } catch (err) {
      console.error("Story upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  const AlignIcon = textAlign === "center" ? AlignCenter : textAlign === "left" ? AlignLeft : AlignRight;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <button onClick={onClose} className="text-white/80 hover:text-white">
          <X className="h-6 w-6" />
        </button>
        <span className="text-white/80 font-body text-sm">Novo Story</span>
        {mode !== "choose" && (
          <Button
            variant="gold"
            size="sm"
            onClick={publish}
            disabled={uploading || (mode === "text" && !textContent.trim()) || (mode === "media" && !mediaFile)}
          >
            {uploading ? "Publicando..." : "Publicar"}
          </Button>
        )}
        {mode === "choose" && <div className="w-20" />}
      </div>

      {/* Choose mode */}
      {mode === "choose" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8">
          <h2 className="text-white font-display text-xl mb-4">Criar Story</h2>
          <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
            <button
              onClick={() => setMode("text")}
              className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/10 hover:bg-white/15 transition-colors"
            >
              <Type className="h-8 w-8 text-gold" />
              <span className="text-white/90 font-body text-sm">Texto</span>
            </button>
            <label className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/10 hover:bg-white/15 transition-colors cursor-pointer">
              <Image className="h-8 w-8 text-gold" />
              <span className="text-white/90 font-body text-sm">Galeria</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileSelect(f);
                }}
              />
            </label>
            <label className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/10 hover:bg-white/15 transition-colors cursor-pointer">
              <Camera className="h-8 w-8 text-gold" />
              <span className="text-white/90 font-body text-sm">Câmera</span>
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileSelect(f);
                }}
              />
            </label>
            <label className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/10 hover:bg-white/15 transition-colors cursor-pointer">
              <Video className="h-8 w-8 text-gold" />
              <span className="text-white/90 font-body text-sm">Vídeo</span>
              <input
                type="file"
                accept="video/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileSelect(f);
                }}
              />
            </label>
          </div>
        </div>
      )}

      {/* Text mode */}
      {mode === "text" && (
        <div className="flex-1 flex flex-col transition-colors duration-300 relative" style={{ backgroundColor: bgColor }}>
          {/* Text toolbar */}
          <div className="flex items-center justify-between px-4 py-2 bg-black/30 backdrop-blur-sm">
            {/* Font selector */}
            <button
              onClick={() => setShowFontPicker(!showFontPicker)}
              className="text-white/90 text-xs px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 transition-colors font-body"
              style={{ fontFamily: currentFont.family }}
            >
              {currentFont.name}
            </button>

            {/* Font size controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFontSize((s) => Math.max(MIN_FONT_SIZE, s - 2))}
                className="text-white/80 hover:text-white p-1 rounded-full bg-white/10"
                disabled={fontSize <= MIN_FONT_SIZE}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="text-white/70 text-xs font-body w-8 text-center">{fontSize}</span>
              <button
                onClick={() => setFontSize((s) => Math.min(MAX_FONT_SIZE, s + 2))}
                className="text-white/80 hover:text-white p-1 rounded-full bg-white/10"
                disabled={fontSize >= MAX_FONT_SIZE}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Alignment */}
            <button
              onClick={cycleAlign}
              className="text-white/80 hover:text-white p-1.5 rounded-full bg-white/10"
            >
              <AlignIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Font picker dropdown */}
          {showFontPicker && (
            <div className="absolute top-[calc(3.5rem+56px)] left-4 z-10 bg-black/80 backdrop-blur-md rounded-xl p-2 flex flex-col gap-1">
              {FONTS.map((font, i) => (
                <button
                  key={font.key}
                  onClick={() => { setFontIndex(i); setShowFontPicker(false); }}
                  className={`text-left px-4 py-2 rounded-lg text-sm transition-colors ${
                    i === fontIndex ? "bg-white/20 text-white" : "text-white/70 hover:bg-white/10"
                  }`}
                  style={{ fontFamily: font.family }}
                >
                  {font.name}
                </button>
              ))}
            </div>
          )}

          {/* Text area */}
          <div className="flex-1 flex items-center justify-center px-6">
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Digite seu texto..."
              className="w-full max-w-sm bg-transparent text-white placeholder:text-white/40 outline-none resize-none"
              style={{
                fontSize: `${fontSize}px`,
                fontFamily: currentFont.family,
                textAlign: textAlign,
                lineHeight: 1.3,
              }}
              rows={Math.max(3, Math.min(8, Math.ceil(textContent.length / 20) || 3))}
              autoFocus
            />
          </div>

          {/* Color picker */}
          <div className="flex gap-2 justify-center pb-6 px-4">
            {BG_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => setBgColor(color)}
                className={`h-8 w-8 rounded-full border-2 transition-transform ${
                  bgColor === color ? "border-white scale-110" : "border-white/30"
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Media mode */}
      {mode === "media" && mediaPreview && (
        <div className="flex-1 flex flex-col items-center justify-center px-4 relative">
          {mediaType === "video" ? (
            <video
              src={mediaPreview}
              className="max-h-[70vh] max-w-full rounded-2xl object-contain"
              controls
              autoPlay
              muted
            />
          ) : (
            <img
              src={mediaPreview}
              alt=""
              className="max-h-[70vh] max-w-full rounded-2xl object-contain"
            />
          )}
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Adicionar legenda..."
            className="mt-4 w-full max-w-sm bg-white/10 text-white rounded-xl px-4 py-3 font-body text-sm placeholder:text-white/40 outline-none"
          />
        </div>
      )}
    </div>
  );
};

export default StoryCreator;

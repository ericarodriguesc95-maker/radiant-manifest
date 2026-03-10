import { useState, useRef } from "react";
import { X, Type, Image, Camera, Video, Palette } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

interface StoryCreatorProps {
  onClose: () => void;
  onCreated: () => void;
}

const BG_COLORS = [
  "#C8A45C", // gold
  "#E74C3C", // red
  "#8E44AD", // purple
  "#2980B9", // blue
  "#27AE60", // green
  "#F39C12", // orange
  "#1ABC9C", // teal
  "#2C3E50", // dark
  "#E91E63", // pink
  "#FF6B6B", // coral
];

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

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
        await supabase.from("stories").insert({
          user_id: user.id,
          media_type: "text",
          text_content: textContent.trim(),
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
        <div
          className="flex-1 flex flex-col items-center justify-center px-8 transition-colors duration-300"
          style={{ backgroundColor: bgColor }}
        >
          <textarea
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            placeholder="Digite seu texto..."
            className="w-full max-w-sm bg-transparent text-white text-center text-2xl font-display placeholder:text-white/40 outline-none resize-none"
            rows={5}
            autoFocus
          />
          {/* Color picker */}
          <div className="flex gap-2 mt-8">
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

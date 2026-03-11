import { useState, useRef, useEffect, useCallback } from "react";
import { X, Type, Image, Camera, Video, Minus, Plus, AlignCenter, AlignLeft, AlignRight, SwitchCamera, Circle, StopCircle } from "lucide-react";
import StoryEditor from "./StoryEditor";
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
  const [mode, setMode] = useState<"choose" | "text" | "media" | "camera">("choose");
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

  // Camera state
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [cameraReady, setCameraReady] = useState(false);

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

  // Camera functions
  const startCamera = useCallback(async (facing: "user" | "environment") => {
    setCameraReady(false);
    // Stop existing stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1080 }, height: { ideal: 1920 } },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setCameraReady(true);
        };
      }
    } catch (err) {
      console.error("Camera error:", err);
      // Fallback to native file picker
      setMode("choose");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
  }, []);

  const flipCamera = useCallback(() => {
    const newFacing = facingMode === "user" ? "environment" : "user";
    setFacingMode(newFacing);
    startCamera(newFacing);
  }, [facingMode, startCamera]);

  const takePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Mirror if front camera
    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `photo_${Date.now()}.jpg`, { type: "image/jpeg" });
      stopCamera();
      handleFileSelect(file);
    }, "image/jpeg", 0.9);
  }, [facingMode, stopCamera]);

  const startRecording = useCallback(() => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    const recorder = new MediaRecorder(streamRef.current, {
      mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? "video/webm;codecs=vp9" : "video/webm",
    });
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      const file = new File([blob], `video_${Date.now()}.webm`, { type: "video/webm" });
      stopCamera();
      handleFileSelect(file);
    };
    recorder.start();
    mediaRecorderRef.current = recorder;
    setIsRecording(true);
    setRecordingTime(0);
    recordingTimerRef.current = setInterval(() => {
      setRecordingTime(t => t + 1);
    }, 1000);
  }, [stopCamera]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
  }, []);

  // Start camera when entering camera mode
  useEffect(() => {
    if (mode === "camera") {
      startCamera(facingMode);
    }
    return () => {
      if (mode === "camera") {
        stopCamera();
      }
    };
  }, [mode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const publish = async () => {
    if (!user) return;
    setUploading(true);

    try {
      if (mode === "text") {
        if (!textContent.trim()) return;
        const meta = JSON.stringify({ font: currentFont.key, size: fontSize, align: textAlign });
        const content = `<!--meta:${meta}-->${textContent.trim()}`;
        await supabase.from("stories").insert({
          user_id: user.id,
          media_type: "text",
          text_content: content,
          bg_color: bgColor,
        });
        onCreated();
      }
    } catch (err) {
      console.error("Story upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleEditorPublish = async (canvas: HTMLCanvasElement | null) => {
    if (!user || !mediaFile) return;
    setUploading(true);
    try {
      let uploadFile = mediaFile;
      // If canvas is provided (image with overlays), use the rendered canvas
      if (canvas) {
        const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/jpeg", 0.92));
        if (blob) {
          uploadFile = new File([blob], `story_${Date.now()}.jpg`, { type: "image/jpeg" });
        }
      }
      const ext = uploadFile.name.split(".").pop() || "bin";
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("community-media").upload(path, uploadFile);
      if (error) throw error;
      const { data } = supabase.storage.from("community-media").getPublicUrl(path);

      await supabase.from("stories").insert({
        user_id: user.id,
        media_url: data.publicUrl,
        media_type: mediaType,
        text_content: null,
      });
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
        <button onClick={() => { if (mode === "camera") stopCamera(); onClose(); }} className="text-white/80 hover:text-white">
          <X className="h-6 w-6" />
        </button>
        <span className="text-white/80 font-body text-sm">Novo Story</span>
        {mode !== "choose" && mode !== "camera" && (
          <Button
            variant="gold"
            size="sm"
            onClick={publish}
            disabled={uploading || (mode === "text" && !textContent.trim()) || (mode === "media" && !mediaFile)}
          >
            {uploading ? "Publicando..." : "Publicar"}
          </Button>
        )}
        {(mode === "choose" || mode === "camera") && <div className="w-20" />}
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
            <button
              onClick={() => setMode("camera")}
              className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/10 hover:bg-white/15 transition-colors"
            >
              <Camera className="h-8 w-8 text-gold" />
              <span className="text-white/90 font-body text-sm">Câmera</span>
            </button>
            <label className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/10 hover:bg-white/15 transition-colors cursor-pointer">
              <Video className="h-8 w-8 text-gold" />
              <span className="text-white/90 font-body text-sm">Vídeo</span>
              <input
                type="file"
                accept="video/*"
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

      {/* Camera mode - Instagram style */}
      {mode === "camera" && (
        <div className="flex-1 flex flex-col relative overflow-hidden">
          {/* Live camera preview */}
          <div className="flex-1 relative bg-black flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
              style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }}
            />
            <canvas ref={canvasRef} className="hidden" />

            {!cameraReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                <div className="animate-spin h-8 w-8 border-4 border-gold border-t-transparent rounded-full" />
              </div>
            )}

            {/* Recording indicator */}
            {isRecording && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-full px-4 py-2">
                <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
                <span className="text-white text-sm font-body">{formatTime(recordingTime)}</span>
              </div>
            )}
          </div>

          {/* Camera controls */}
          <div className="bg-black/80 backdrop-blur-sm px-6 py-6 flex items-center justify-between">
            {/* Flip camera */}
            <button
              onClick={flipCamera}
              className="h-12 w-12 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors"
            >
              <SwitchCamera className="h-5 w-5 text-white" />
            </button>

            {/* Shutter / Record button */}
            {!isRecording ? (
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={takePhoto}
                  className="h-[72px] w-[72px] rounded-full border-4 border-white flex items-center justify-center hover:scale-105 transition-transform"
                >
                  <div className="h-[60px] w-[60px] rounded-full bg-white" />
                </button>
                <span className="text-white/50 text-xs font-body">Toque = foto · Segure = vídeo</span>
              </div>
            ) : (
              <button
                onClick={stopRecording}
                className="h-[72px] w-[72px] rounded-full border-4 border-red-500 flex items-center justify-center hover:scale-105 transition-transform"
              >
                <StopCircle className="h-8 w-8 text-red-500" />
              </button>
            )}

            {/* Record video button */}
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="h-12 w-12 rounded-full bg-red-500/80 flex items-center justify-center hover:bg-red-500 transition-colors"
              >
                <Circle className="h-5 w-5 text-white fill-white" />
              </button>
            ) : (
              <div className="w-12" />
            )}
          </div>
        </div>
      )}

      {/* Text mode */}
      {mode === "text" && (
        <div className="flex-1 flex flex-col transition-colors duration-300 relative" style={{ backgroundColor: bgColor }}>
          {/* Text toolbar */}
          <div className="flex items-center justify-between px-4 py-2 bg-black/30 backdrop-blur-sm">
            <button
              onClick={() => setShowFontPicker(!showFontPicker)}
              className="text-white/90 text-xs px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 transition-colors font-body"
              style={{ fontFamily: currentFont.family }}
            >
              {currentFont.name}
            </button>

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

            <button
              onClick={cycleAlign}
              className="text-white/80 hover:text-white p-1.5 rounded-full bg-white/10"
            >
              <AlignIcon className="h-4 w-4" />
            </button>
          </div>

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

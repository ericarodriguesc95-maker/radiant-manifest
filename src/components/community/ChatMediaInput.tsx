import { useState, useRef } from "react";
import { Send, Image, Mic, Video, Smile, X, Camera, Paperclip, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import GifStickerPicker from "@/components/GifStickerPicker";

interface ChatMediaInputProps {
  onSend: (text: string, mediaUrl?: string, mediaType?: string) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
}

export default function ChatMediaInput({ onSend, disabled, placeholder = "Mensagem..." }: ChatMediaInputProps) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [showMediaMenu, setShowMediaMenu] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordingVideo, setRecordingVideo] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoRecorderRef = useRef<MediaRecorder | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const chunksRef = useRef<Blob[]>([]);
  const videoChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const uploadFile = async (file: File, type: string): Promise<{ url: string; mediaType: string } | null> => {
    setUploading(true);
    const ext = file.name.split(".").pop() || "bin";
    const path = `chat/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("community-media").upload(path, file);
    setUploading(false);
    if (error) return null;
    const { data: { publicUrl } } = supabase.storage.from("community-media").getPublicUrl(path);
    return { url: publicUrl, mediaType: type };
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>, forceType?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const type = forceType || (file.type.startsWith("image") ? "image" : file.type.startsWith("video") ? "video" : file.type.startsWith("audio") ? "audio" : "file");
    const result = await uploadFile(file, type);
    if (result) {
      await handleSend(text, result.url, result.mediaType);
    }
    e.target.value = "";
    setShowMediaMenu(false);
  };

  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const file = new File([blob], `audio-${Date.now()}.webm`, { type: "audio/webm" });
        const result = await uploadFile(file, "audio");
        if (result) await handleSend("🎙️ Áudio", result.url, result.mediaType);
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setRecording(true);
    } catch { /* no mic */ }
  };

  const stopAudioRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const startVideoRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play();
      }
      const mr = new MediaRecorder(stream);
      videoChunksRef.current = [];
      mr.ondataavailable = (e) => videoChunksRef.current.push(e.data);
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        if (videoPreviewRef.current) videoPreviewRef.current.srcObject = null;
        const blob = new Blob(videoChunksRef.current, { type: "video/webm" });
        const file = new File([blob], `video-${Date.now()}.webm`, { type: "video/webm" });
        const result = await uploadFile(file, "video");
        if (result) await handleSend("🎬 Vídeo", result.url, result.mediaType);
        setRecordingVideo(false);
      };
      mr.start();
      videoRecorderRef.current = mr;
      setRecordingVideo(true);
      setShowMediaMenu(false);
    } catch { /* no camera */ }
  };

  const stopVideoRecording = () => {
    videoRecorderRef.current?.stop();
  };

  const handleStickerSelect = async (url: string, type: string) => {
    setShowStickers(false);
    await handleSend("", url, "sticker");
  };

  const handleSend = async (t?: string, mediaUrl?: string, mediaType?: string) => {
    const finalText = (t ?? text).trim();
    if (!finalText && !mediaUrl) return;
    setSending(true);
    await onSend(finalText || "", mediaUrl, mediaType);
    setText("");
    setSending(false);
  };

  if (recordingVideo) {
    return (
      <div className="p-3 border-t border-border/50 bg-card/80 backdrop-blur-sm">
        <div className="relative rounded-xl overflow-hidden bg-black mb-2">
          <video ref={videoPreviewRef} className="w-full h-40 object-cover" muted playsInline />
          <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-red-500/90 rounded-full px-2 py-0.5">
            <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
            <span className="text-[10px] text-white font-bold">GRAVANDO</span>
          </div>
        </div>
        <button
          onClick={stopVideoRecording}
          className="w-full flex items-center justify-center gap-2 bg-red-500 text-white rounded-full py-2.5 text-sm font-semibold"
        >
          <Square className="h-4 w-4" /> Parar gravação
        </button>
      </div>
    );
  }

  return (
    <div className="border-t border-border/50 bg-card/80 backdrop-blur-sm relative">
      {showStickers && (
        <div className="absolute bottom-full left-0 right-0 h-72 z-20">
          <GifStickerPicker onSelect={handleStickerSelect} onClose={() => setShowStickers(false)} />
        </div>
      )}

      {showMediaMenu && (
        <div className="absolute bottom-full left-2 mb-1 bg-card border border-border/50 rounded-xl shadow-lg p-2 space-y-1 z-20 animate-fade-in">
          <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 px-3 py-2 text-sm font-body hover:bg-muted/40 rounded-lg w-full text-left">
            <Image className="h-4 w-4 text-gold" /> Foto
          </button>
          <button onClick={() => videoRef.current?.click()} className="flex items-center gap-2 px-3 py-2 text-sm font-body hover:bg-muted/40 rounded-lg w-full text-left">
            <Video className="h-4 w-4 text-gold" /> Vídeo
          </button>
          <button onClick={startVideoRecording} className="flex items-center gap-2 px-3 py-2 text-sm font-body hover:bg-muted/40 rounded-lg w-full text-left">
            <Camera className="h-4 w-4 text-gold" /> Gravar vídeo
          </button>
          <button onClick={() => { setShowMediaMenu(false); startAudioRecording(); }} className="flex items-center gap-2 px-3 py-2 text-sm font-body hover:bg-muted/40 rounded-lg w-full text-left">
            <Mic className="h-4 w-4 text-gold" /> Áudio
          </button>
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e, "image")} />
      <input ref={videoRef} type="file" accept="video/*" className="hidden" onChange={e => handleFile(e, "video")} />

      <div className="flex items-center gap-1.5 p-2.5">
        {recording ? (
          <div className="flex-1 flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm text-red-400 font-body">Gravando...</span>
            <button onClick={stopAudioRecording} className="ml-auto h-9 w-9 rounded-full bg-red-500 flex items-center justify-center text-white">
              <Square className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <button onClick={() => { setShowMediaMenu(!showMediaMenu); setShowStickers(false); }} className="h-9 w-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-gold transition-colors shrink-0">
              <Paperclip className="h-5 w-5" />
            </button>
            <button onClick={() => { setShowStickers(!showStickers); setShowMediaMenu(false); }} className="h-9 w-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-gold transition-colors shrink-0">
              <Smile className="h-5 w-5" />
            </button>
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !sending) handleSend(); }}
              placeholder={uploading ? "Enviando mídia..." : placeholder}
              disabled={disabled || uploading}
              className="flex-1 bg-muted/40 rounded-full px-4 py-2.5 text-sm font-body outline-none focus:ring-1 focus:ring-gold/30 transition-all min-w-0"
            />
            <button
              onClick={() => handleSend()}
              disabled={(!text.trim() && !uploading) || sending || disabled}
              className="h-9 w-9 rounded-full bg-gold flex items-center justify-center text-white disabled:opacity-30 transition-opacity shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

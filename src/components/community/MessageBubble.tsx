import { useState, useRef } from "react";
import { Check, CheckCheck, Pencil, X, Check as CheckIcon, Play, Pause, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface MessageBubbleProps {
  id: string;
  text: string;
  created_at: string;
  isMe: boolean;
  senderName?: string | null;
  senderAvatar?: string | null;
  showSender?: boolean;
  read?: boolean;
  media_url?: string | null;
  media_type?: string | null;
  table: "direct_messages" | "chat_room_messages";
  canEdit?: boolean;
  onEdited?: () => void;
  formatTime: (d: string) => string;
  getInitials: (name: string | null) => string;
}

const URL_REGEX = /(https?:\/\/[^\s<]+)/g;

function renderTextWithLinks(text: string) {
  const parts = text.split(URL_REGEX);
  return parts.map((part, i) => {
    if (URL_REGEX.test(part)) {
      URL_REGEX.lastIndex = 0;
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="underline font-medium break-all"
          onClick={e => e.stopPropagation()}
        >
          {part.length > 40 ? part.slice(0, 37) + "..." : part}
        </a>
      );
    }
    return part;
  });
}

export default function MessageBubble({
  id, text, created_at, isMe, senderName, senderAvatar, showSender,
  read, media_url, media_type, table, canEdit, onEdited, formatTime, getInitials
}: MessageBubbleProps) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(text);
  const [saving, setSaving] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const saveEdit = async () => {
    if (!editText.trim() || editText.trim() === text) { setEditing(false); return; }
    setSaving(true);
    await supabase.from(table).update({ text: editText.trim() } as any).eq("id", id);
    setSaving(false);
    setEditing(false);
    onEdited?.();
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); } else { audioRef.current.play(); }
    setPlaying(!playing);
  };

  const isImage = media_type?.startsWith("image");
  const isVideo = media_type?.startsWith("video");
  const isAudio = media_type?.startsWith("audio");
  const isSticker = media_type === "sticker";

  return (
    <div className={cn("flex gap-2", isMe ? "justify-end" : "justify-start")}>
      {!isMe && showSender ? (
        senderAvatar ? (
          <img src={senderAvatar} className="h-7 w-7 rounded-full object-cover mt-1" alt="" loading="lazy" />
        ) : (
          <div className="h-7 w-7 rounded-full bg-gold/15 flex items-center justify-center text-[10px] font-bold text-gold mt-1">
            {getInitials(senderName || null)}
          </div>
        )
      ) : !isMe ? <div className="w-7" /> : null}

      <div className="max-w-[75%] group relative">
        {/* Edit button */}
        {canEdit && isMe && !editing && (
          <button
            onClick={() => { setEditing(true); setEditText(text); }}
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-card border border-border/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-sm"
          >
            <Pencil className="h-3 w-3 text-muted-foreground" />
          </button>
        )}

        {/* Sticker (no bubble) */}
        {isSticker && media_url && (
          <div className="mb-1">
            {media_url.startsWith("emoji:") ? (
              <span className="text-5xl">{media_url.replace("emoji:", "")}</span>
            ) : (
              <img
                src={media_url}
                alt="sticker"
                className="h-24 w-24 object-contain"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            )}
          </div>
        )}

        {/* Media content */}
        {!isSticker && (isImage || isVideo || isAudio) && media_url && (
          <div className={cn(
            "rounded-2xl overflow-hidden mb-1",
            isMe ? "rounded-br-md" : "rounded-bl-md"
          )}>
            {isImage && <img src={media_url} alt="" className="max-w-full max-h-60 rounded-2xl object-cover" loading="lazy" />}
            {isVideo && (
              <video src={media_url} controls className="max-w-full max-h-60 rounded-2xl" preload="metadata" />
            )}
            {isAudio && (
              <div className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-2xl",
                isMe ? "bg-gold text-white" : "bg-card border border-border/50"
              )}>
                <button onClick={toggleAudio} className="shrink-0">
                  {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </button>
                <div className="flex-1 h-1 bg-white/20 rounded-full">
                  <div className="h-full w-1/3 bg-white/60 rounded-full" />
                </div>
                <audio ref={audioRef} src={media_url} onEnded={() => setPlaying(false)} />
              </div>
            )}
          </div>
        )}

        {/* Text bubble */}
        {(text || (!isSticker && !media_url)) && (
          <div className={cn(
            "rounded-2xl px-3 py-2",
            isMe ? "bg-gold text-white rounded-br-md" : "bg-card border border-border/50 text-foreground rounded-bl-md"
          )}>
            {!isMe && showSender && senderName && (
              <p className="text-[10px] font-semibold text-gold mb-0.5">{senderName}</p>
            )}
            {editing ? (
              <div className="flex items-center gap-1">
                <input
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditing(false); }}
                  className="flex-1 bg-transparent text-sm outline-none border-b border-white/30"
                  autoFocus
                />
                <button onClick={saveEdit} disabled={saving} className="shrink-0"><CheckIcon className="h-4 w-4" /></button>
                <button onClick={() => setEditing(false)} className="shrink-0"><X className="h-4 w-4" /></button>
              </div>
            ) : (
              <p className="text-sm font-body whitespace-pre-wrap break-words">{renderTextWithLinks(text)}</p>
            )}
            <div className={cn("flex items-center gap-1 mt-0.5", isMe ? "justify-end" : "")}>
              <span className={cn("text-[10px]", isMe ? "text-white/60" : "text-muted-foreground")}>
                {formatTime(created_at)}
              </span>
              {isMe && read !== undefined && (
                read ? <CheckCheck className="h-3 w-3 text-white/80" /> : <Check className="h-3 w-3 text-white/50" />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

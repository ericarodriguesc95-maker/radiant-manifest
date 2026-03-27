import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Send, Hash, Plus, Users, X, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";

interface Room {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  participant_count: number;
}

interface RoomMessage {
  id: string;
  user_id: string;
  text: string;
  created_at: string;
  display_name: string | null;
  avatar_url: string | null;
}

const ROOM_ICONS = ["💬", "💎", "👑", "🔥", "✨", "🌸", "💅", "🎯", "🧘‍♀️", "💪", "📚", "🎨", "🍷", "☕", "🌙"];

export default function ChatRooms({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomDesc, setNewRoomDesc] = useState("");
  const [newRoomIcon, setNewRoomIcon] = useState("💬");
  const [creating, setCreating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchRooms = useCallback(async () => {
    const { data } = await supabase.from("chat_rooms").select("*").order("created_at");
    if (!data) return;

    // Get participant counts per room
    const roomsWithCounts: Room[] = await Promise.all(
      data.map(async (room: any) => {
        const { data: uniqueUsers } = await supabase
          .from("chat_room_messages")
          .select("user_id")
          .eq("room_id", room.id);
        const uniqueCount = new Set(uniqueUsers?.map((u: any) => u.user_id) || []).size;
        return { ...room, participant_count: uniqueCount };
      })
    );
    setRooms(roomsWithCounts);
  }, []);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  const fetchMessages = useCallback(async (roomId: string) => {
    const { data: msgs } = await supabase
      .from("chat_room_messages")
      .select("id, user_id, text, created_at")
      .eq("room_id", roomId)
      .order("created_at", { ascending: true })
      .limit(200);

    if (!msgs) return;
    const userIds = [...new Set(msgs.map(m => m.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name, avatar_url")
      .in("user_id", userIds.length > 0 ? userIds : ["00000000-0000-0000-0000-000000000000"]);
    const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

    setMessages(msgs.map(m => ({
      ...m,
      display_name: profileMap.get(m.user_id)?.display_name || "Usuária",
      avatar_url: profileMap.get(m.user_id)?.avatar_url || null,
    })));
  }, []);

  useEffect(() => {
    if (!selectedRoom) return;
    fetchMessages(selectedRoom.id);
    const channel = supabase
      .channel(`room-${selectedRoom.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_room_messages", filter: `room_id=eq.${selectedRoom.id}` }, () => {
        fetchMessages(selectedRoom.id);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedRoom, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMsg.trim() || !selectedRoom || !user) return;
    await supabase.from("chat_room_messages").insert({
      room_id: selectedRoom.id,
      user_id: user.id,
      text: newMsg.trim(),
    });
    setNewMsg("");
  };

  const createRoom = async () => {
    if (!newRoomName.trim() || !user) return;
    setCreating(true);
    await supabase.from("chat_rooms").insert({
      name: newRoomName.trim(),
      description: newRoomDesc.trim() || null,
      icon: newRoomIcon,
      created_by: user.id,
    });
    setNewRoomName("");
    setNewRoomDesc("");
    setNewRoomIcon("💬");
    setShowCreate(false);
    setCreating(false);
    fetchRooms();
  };

  const getInitials = (name: string | null) => name ? name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "?";
  const formatTime = (d: string) => format(new Date(d), "HH:mm");

  // Chat thread view
  if (selectedRoom) {
    return (
      <div className="flex flex-col h-full bg-background">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 bg-card/80 backdrop-blur-sm">
          <button onClick={() => setSelectedRoom(null)} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center">
            <span className="text-lg">{selectedRoom.icon}</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold font-body">{selectedRoom.name}</p>
            <div className="flex items-center gap-1.5">
              <Users className="h-3 w-3 text-gold" />
              <span className="text-[10px] text-muted-foreground font-body">
                {selectedRoom.participant_count} participante{selectedRoom.participant_count !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Sparkles className="h-8 w-8 text-gold/40 mb-3" />
              <p className="text-sm font-body">Seja a primeira a enviar uma mensagem! ✨</p>
            </div>
          )}
          {messages.map((msg, i) => {
            const isMe = msg.user_id === user?.id;
            const showAvatar = !isMe && (i === 0 || messages[i - 1].user_id !== msg.user_id);
            return (
              <div key={msg.id} className={cn("flex gap-2", isMe ? "justify-end" : "justify-start")}>
                {!isMe && showAvatar ? (
                  msg.avatar_url ? (
                    <img src={msg.avatar_url} className="h-7 w-7 rounded-full object-cover mt-1" alt="" loading="lazy" />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-gold/15 flex items-center justify-center text-[10px] font-bold text-gold mt-1">
                      {getInitials(msg.display_name)}
                    </div>
                  )
                ) : !isMe ? <div className="w-7" /> : null}
                <div className={cn(
                  "max-w-[75%] rounded-2xl px-3 py-2",
                  isMe
                    ? "bg-gold text-white rounded-br-md"
                    : "bg-card border border-border/50 text-foreground rounded-bl-md"
                )}>
                  {!isMe && showAvatar && (
                    <p className="text-[10px] font-semibold text-gold mb-0.5">{msg.display_name}</p>
                  )}
                  <p className="text-sm font-body">{msg.text}</p>
                  <p className={cn("text-[10px] mt-0.5", isMe ? "text-white/60" : "text-muted-foreground")}>
                    {formatTime(msg.created_at)}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 p-3 border-t border-border/50 bg-card/80 backdrop-blur-sm">
          <input
            value={newMsg}
            onChange={e => setNewMsg(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") sendMessage(); }}
            placeholder="Mensagem..."
            className="flex-1 bg-muted/40 rounded-full px-4 py-2.5 text-sm font-body outline-none focus:ring-1 focus:ring-gold/30 transition-all"
          />
          <button
            onClick={sendMessage}
            disabled={!newMsg.trim()}
            className="h-9 w-9 rounded-full bg-gold flex items-center justify-center text-white disabled:opacity-30 transition-opacity"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // Create room modal
  if (showCreate) {
    return (
      <div className="flex flex-col h-full bg-background">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 bg-card/80 backdrop-blur-sm">
          <button onClick={() => setShowCreate(false)} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <p className="text-sm font-semibold font-body">Criar Nova Sala</p>
        </div>
        <div className="flex-1 p-5 space-y-5">
          {/* Icon selector */}
          <div>
            <label className="text-xs font-body text-muted-foreground uppercase tracking-wider mb-2 block">Ícone</label>
            <div className="flex flex-wrap gap-2">
              {ROOM_ICONS.map(icon => (
                <button
                  key={icon}
                  onClick={() => setNewRoomIcon(icon)}
                  className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center text-lg transition-all",
                    newRoomIcon === icon
                      ? "bg-gold/20 ring-2 ring-gold scale-110"
                      : "bg-muted/40 hover:bg-muted/60"
                  )}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-body text-muted-foreground uppercase tracking-wider mb-2 block">Nome da Sala</label>
            <input
              value={newRoomName}
              onChange={e => setNewRoomName(e.target.value)}
              placeholder="Ex: Skincare & Glow"
              className="w-full bg-muted/40 rounded-xl px-4 py-3 text-sm font-body outline-none focus:ring-1 focus:ring-gold/30 transition-all"
              maxLength={40}
            />
          </div>

          <div>
            <label className="text-xs font-body text-muted-foreground uppercase tracking-wider mb-2 block">Descrição (opcional)</label>
            <textarea
              value={newRoomDesc}
              onChange={e => setNewRoomDesc(e.target.value)}
              placeholder="Sobre o que é essa sala?"
              className="w-full bg-muted/40 rounded-xl px-4 py-3 text-sm font-body outline-none resize-none focus:ring-1 focus:ring-gold/30 transition-all"
              rows={2}
              maxLength={100}
            />
          </div>

          <Button
            variant="gold"
            className="w-full"
            onClick={createRoom}
            disabled={!newRoomName.trim() || creating}
          >
            {creating ? "Criando..." : "✨ Criar Sala"}
          </Button>
        </div>
      </div>
    );
  }

  // Room list
  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-card/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-gold" />
            <p className="text-sm font-semibold font-body">Salas de Chat</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="h-8 w-8 rounded-full bg-gold/15 flex items-center justify-center text-gold hover:bg-gold/25 transition-colors"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {rooms.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Hash className="h-8 w-8 text-gold/30 mb-3" />
            <p className="text-sm font-body">Nenhuma sala ainda</p>
            <button onClick={() => setShowCreate(true)} className="text-sm text-gold font-body mt-2 font-medium">
              Criar a primeira sala ✨
            </button>
          </div>
        )}
        {rooms.map(room => (
          <button
            key={room.id}
            onClick={() => setSelectedRoom(room)}
            className="flex items-center gap-3 px-4 py-4 w-full hover:bg-muted/30 transition-all border-b border-border/30 group"
          >
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-gold/15 to-gold/5 flex items-center justify-center group-hover:from-gold/25 group-hover:to-gold/10 transition-all">
              <span className="text-2xl">{room.icon}</span>
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-body font-semibold group-hover:text-gold transition-colors">{room.name}</p>
              {room.description && (
                <p className="text-xs font-body text-muted-foreground truncate">{room.description}</p>
              )}
            </div>
            <div className="flex items-center gap-1 bg-muted/40 rounded-full px-2.5 py-1">
              <Users className="h-3 w-3 text-gold" />
              <span className="text-[11px] font-body font-medium text-muted-foreground">{room.participant_count}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

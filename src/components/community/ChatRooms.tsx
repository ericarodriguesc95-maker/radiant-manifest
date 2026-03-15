import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Send, Hash } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Room {
  id: string;
  name: string;
  description: string | null;
  icon: string;
}

interface RoomMessage {
  id: string;
  user_id: string;
  text: string;
  created_at: string;
  display_name: string | null;
  avatar_url: string | null;
}

export default function ChatRooms({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.from("chat_rooms").select("*").order("created_at").then(({ data }) => {
      if (data) setRooms(data as Room[]);
    });
  }, []);

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

  const getInitials = (name: string | null) => name ? name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "?";
  const formatTime = (d: string) => format(new Date(d), "HH:mm");

  if (selectedRoom) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
          <button onClick={() => setSelectedRoom(null)} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="text-lg">{selectedRoom.icon}</span>
          <div>
            <p className="text-sm font-semibold font-body">{selectedRoom.name}</p>
            {selectedRoom.description && (
              <p className="text-[10px] text-muted-foreground font-body">{selectedRoom.description}</p>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, i) => {
            const isMe = msg.user_id === user?.id;
            const showAvatar = !isMe && (i === 0 || messages[i - 1].user_id !== msg.user_id);
            return (
              <div key={msg.id} className={cn("flex gap-2", isMe ? "justify-end" : "justify-start")}>
                {!isMe && showAvatar ? (
                  msg.avatar_url ? (
                    <img src={msg.avatar_url} className="h-7 w-7 rounded-full object-cover mt-1" />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary mt-1">
                      {getInitials(msg.display_name)}
                    </div>
                  )
                ) : !isMe ? <div className="w-7" /> : null}
                <div className={cn(
                  "max-w-[75%] rounded-2xl px-3 py-2",
                  isMe
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-muted text-foreground rounded-bl-md"
                )}>
                  {!isMe && showAvatar && (
                    <p className="text-[10px] font-semibold text-primary mb-0.5">{msg.display_name}</p>
                  )}
                  <p className="text-sm font-body">{msg.text}</p>
                  <p className={cn("text-[10px] mt-0.5", isMe ? "text-primary-foreground/60" : "text-muted-foreground")}>
                    {formatTime(msg.created_at)}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex items-center gap-2 p-3 border-t border-border bg-card">
          <input
            value={newMsg}
            onChange={e => setNewMsg(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") sendMessage(); }}
            placeholder="Mensagem..."
            className="flex-1 bg-muted/50 rounded-full px-4 py-2 text-sm font-body outline-none"
          />
          <button onClick={sendMessage} disabled={!newMsg.trim()} className="text-primary disabled:text-muted-foreground">
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Hash className="h-4 w-4 text-primary" />
        <p className="text-sm font-semibold font-body">Salas de Chat</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        {rooms.map(room => (
          <button
            key={room.id}
            onClick={() => setSelectedRoom(room)}
            className="flex items-center gap-3 px-4 py-4 w-full hover:bg-muted/50 transition-colors border-b border-border/50"
          >
            <span className="text-2xl">{room.icon}</span>
            <div className="flex-1 text-left">
              <p className="text-sm font-body font-semibold">{room.name}</p>
              {room.description && (
                <p className="text-xs font-body text-muted-foreground">{room.description}</p>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

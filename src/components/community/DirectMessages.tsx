import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Send, Search, Plus, Check, CheckCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useOnlinePresence } from "@/hooks/useOnlinePresence";
import MessageBubble from "./MessageBubble";
import ChatMediaInput from "./ChatMediaInput";

interface Conversation {
  id: string;
  other_user_id: string;
  other_display_name: string;
  other_avatar_url: string | null;
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

interface Message {
  id: string;
  sender_id: string;
  text: string;
  created_at: string;
  read: boolean;
  media_url: string | null;
  media_type: string | null;
}

export default function DirectMessages({ onClose, openConversationUserId }: { onClose: () => void; openConversationUserId?: string | null }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [search, setSearch] = useState("");
  const [allUsers, setAllUsers] = useState<{ user_id: string; display_name: string | null; avatar_url: string | null }[]>([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const [selectedOther, setSelectedOther] = useState<{ user_id: string; display_name: string | null; avatar_url: string | null } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const onlineUsers = useOnlinePresence(user?.id);
  const [loaded, setLoaded] = useState(false);

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    const { data: myConvs } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", user.id);
    if (!myConvs?.length) { setConversations([]); setLoaded(true); return; }

    const convIds = myConvs.map(c => c.conversation_id);
    const { data: participants } = await supabase
      .from("conversation_participants")
      .select("conversation_id, user_id")
      .in("conversation_id", convIds)
      .neq("user_id", user.id);

    if (!participants?.length) { setConversations([]); setLoaded(true); return; }

    const otherUserIds = [...new Set(participants.map(p => p.user_id))];
    const { data: profiles } = await supabase
      .from("profiles_public" as any)
      .select("user_id, display_name, avatar_url")
      .in("user_id", otherUserIds);
    const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

    const convs: Conversation[] = [];
    for (const p of participants) {
      const prof = profileMap.get(p.user_id);
      const { data: lastMsg } = await supabase
        .from("direct_messages")
        .select("text, created_at")
        .eq("conversation_id", p.conversation_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      const { count } = await supabase
        .from("direct_messages")
        .select("*", { count: "exact", head: true })
        .eq("conversation_id", p.conversation_id)
        .eq("read", false)
        .neq("sender_id", user.id);

      convs.push({
        id: p.conversation_id,
        other_user_id: p.user_id,
        other_display_name: prof?.display_name || "Usuária",
        other_avatar_url: prof?.avatar_url || null,
        last_message: lastMsg?.text || "",
        last_message_at: lastMsg?.created_at || "",
        unread_count: count || 0,
      });
    }
    convs.sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());
    setConversations(convs);
    setLoaded(true);
  }, [user]);

  useEffect(() => {
    fetchConversations();
    supabase.from("profiles_public" as any).select("user_id, display_name, avatar_url").then(({ data }: any) => {
      if (data) setAllUsers(data.filter(u => u.user_id !== user?.id));
    });
  }, [fetchConversations, user]);

  // Auto-open conversation from external click
  useEffect(() => {
    if (!openConversationUserId || !loaded || !user) return;
    const existing = conversations.find(c => c.other_user_id === openConversationUserId);
    if (existing) {
      setSelectedConv(existing.id);
      setSelectedOther({ user_id: existing.other_user_id, display_name: existing.other_display_name, avatar_url: existing.other_avatar_url });
    } else {
      const otherUser = allUsers.find(u => u.user_id === openConversationUserId);
      if (otherUser) startConversation(otherUser);
    }
  }, [openConversationUserId, loaded, conversations, allUsers]);

  const fetchMessages = useCallback(async (convId: string) => {
    const { data } = await supabase
      .from("direct_messages")
      .select("id, sender_id, text, created_at, read, media_url, media_type")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });
    if (data) setMessages(data);
    if (user) {
      await supabase
        .from("direct_messages")
        .update({ read: true })
        .eq("conversation_id", convId)
        .neq("sender_id", user.id);
    }
  }, [user]);

  useEffect(() => {
    if (!selectedConv) return;
    fetchMessages(selectedConv);
    const channel = supabase
      .channel(`dm-${selectedConv}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "direct_messages", filter: `conversation_id=eq.${selectedConv}` }, () => {
        fetchMessages(selectedConv);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedConv, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startConversation = async (otherUser: typeof allUsers[0]) => {
    if (!user) return;
    const existing = conversations.find(c => c.other_user_id === otherUser.user_id);
    if (existing) {
      setSelectedConv(existing.id);
      setSelectedOther(otherUser);
      setShowNewChat(false);
      return;
    }
    // Generate ID client-side to avoid SELECT after INSERT (RLS blocks SELECT before participants exist)
    const convId = crypto.randomUUID();
    const { error: convErr } = await supabase.from("conversations").insert({ id: convId });
    if (convErr) { console.error("conv insert error", convErr); return; }
    const { error: partErr } = await supabase.from("conversation_participants").insert([
      { conversation_id: convId, user_id: user.id },
      { conversation_id: convId, user_id: otherUser.user_id },
    ]);
    if (partErr) { console.error("participants insert error", partErr); return; }
    setSelectedConv(convId);
    setSelectedOther(otherUser);
    setShowNewChat(false);
    fetchConversations();
  };

  const sendMessage = async (text: string, mediaUrl?: string, mediaType?: string) => {
    if ((!text.trim() && !mediaUrl) || !selectedConv || !user) return;
    await supabase.from("direct_messages").insert({
      conversation_id: selectedConv,
      sender_id: user.id,
      text: text || "",
      media_url: mediaUrl || null,
      media_type: mediaType || null,
    });
    await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", selectedConv);
  };

  const getInitials = (name: string | null) => name ? name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "?";
  const formatTime = (d: string) => {
    if (!d) return "";
    const date = new Date(d);
    const diff = Date.now() - date.getTime();
    if (diff < 86400000) return format(date, "HH:mm");
    return format(date, "dd/MM", { locale: ptBR });
  };

  const AvatarWithStatus = ({ url, name, userId, size = "h-11 w-11" }: { url: string | null; name: string | null; userId: string; size?: string }) => (
    <div className="relative shrink-0">
      {url ? (
        <img src={url} alt="" className={cn(size, "rounded-full object-cover")} loading="lazy" />
      ) : (
        <div className={cn(size, "rounded-full bg-gold/15 flex items-center justify-center text-xs font-bold text-gold")}>
          {getInitials(name)}
        </div>
      )}
      <span className={cn(
        "absolute -bottom-0.5 -right-0.5 block h-3 w-3 rounded-full border-2 border-card",
        onlineUsers.has(userId) ? "bg-emerald-400" : "bg-muted-foreground/30"
      )} />
    </div>
  );

  // Message thread view
  if (selectedConv) {
    const other = selectedOther || conversations.find(c => c.id === selectedConv);
    const otherName = selectedOther?.display_name || (other as Conversation)?.other_display_name || "Chat";
    const otherAvatar = selectedOther?.avatar_url || (other as Conversation)?.other_avatar_url || null;
    const otherUserId = selectedOther?.user_id || (other as Conversation)?.other_user_id || "";

    return (
      <div className="flex flex-col h-full bg-background">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 bg-card/80 backdrop-blur-sm">
          <button onClick={() => { setSelectedConv(null); setSelectedOther(null); fetchConversations(); }} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <AvatarWithStatus url={otherAvatar} name={otherName} userId={otherUserId} size="h-9 w-9" />
          <div>
            <p className="text-sm font-semibold font-body">{otherName}</p>
            <p className="text-[10px] text-muted-foreground font-body">
              {onlineUsers.has(otherUserId) ? <span className="text-emerald-400">Online</span> : "Offline"}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              id={msg.id}
              text={msg.text}
              created_at={msg.created_at}
              isMe={msg.sender_id === user?.id}
              read={msg.read}
              media_url={msg.media_url}
              media_type={msg.media_type}
              table="direct_messages"
              canEdit={msg.sender_id === user?.id}
              onEdited={() => fetchMessages(selectedConv)}
              formatTime={formatTime}
              getInitials={getInitials}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        <ChatMediaInput onSend={sendMessage} placeholder="Mensagem..." />
      </div>
    );
  }

  // New chat user list
  if (showNewChat) {
    const filtered = allUsers.filter(u => u.display_name?.toLowerCase().includes(search.toLowerCase()));
    return (
      <div className="flex flex-col h-full bg-background">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 bg-card/80 backdrop-blur-sm">
          <button onClick={() => setShowNewChat(false)} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <p className="text-sm font-semibold font-body">Nova conversa</p>
        </div>
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 bg-muted/40 rounded-full px-4 py-2.5">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar usuária..." className="flex-1 bg-transparent text-sm font-body outline-none" autoFocus />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map(u => (
            <button key={u.user_id} onClick={() => startConversation(u)} className="flex items-center gap-3 px-4 py-3 w-full hover:bg-muted/30 transition-all">
              <AvatarWithStatus url={u.avatar_url} name={u.display_name} userId={u.user_id} size="h-11 w-11" />
              <div className="text-left">
                <p className="text-sm font-body font-semibold">{u.display_name}</p>
                <p className="text-[10px] text-muted-foreground font-body">
                  {onlineUsers.has(u.user_id) ? <span className="text-emerald-400">Online agora</span> : "Toque para conversar"}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Conversation list
  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-card/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <p className="text-sm font-semibold font-body">Mensagens</p>
        </div>
        <button onClick={() => setShowNewChat(true)} className="h-8 w-8 rounded-full bg-gold/15 flex items-center justify-center text-gold hover:bg-gold/25 transition-colors">
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Send className="h-8 w-8 text-gold/30 mb-3" />
            <p className="text-sm font-body">Nenhuma conversa ainda</p>
            <button onClick={() => setShowNewChat(true)} className="text-sm text-gold font-body mt-2 font-medium">Iniciar conversa ✨</button>
          </div>
        ) : (
          conversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => { setSelectedConv(conv.id); setSelectedOther({ user_id: conv.other_user_id, display_name: conv.other_display_name, avatar_url: conv.other_avatar_url }); }}
              className="flex items-center gap-3 px-4 py-3.5 w-full hover:bg-muted/30 transition-all border-b border-border/30 text-left"
            >
              <AvatarWithStatus url={conv.other_avatar_url} name={conv.other_display_name} userId={conv.other_user_id} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-body font-semibold truncate">{conv.other_display_name}</p>
                <p className="text-xs font-body text-muted-foreground truncate">{conv.last_message}</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-[10px] text-muted-foreground">{formatTime(conv.last_message_at)}</span>
                {conv.unread_count > 0 && (
                  <span className="h-5 min-w-5 rounded-full bg-gold text-white text-[10px] font-bold flex items-center justify-center px-1">{conv.unread_count}</span>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

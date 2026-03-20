import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Send, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
}

type SendingState = "idle" | "sending" | "sent";

export default function DirectMessages({ onClose }: { onClose: () => void }) {
  const { user, profile } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [search, setSearch] = useState("");
  const [allUsers, setAllUsers] = useState<{ user_id: string; display_name: string | null; avatar_url: string | null }[]>([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const [selectedOther, setSelectedOther] = useState<{ user_id: string; display_name: string | null; avatar_url: string | null } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    const { data: myConvs } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", user.id);
    if (!myConvs?.length) return;

    const convIds = myConvs.map(c => c.conversation_id);
    const { data: participants } = await supabase
      .from("conversation_participants")
      .select("conversation_id, user_id")
      .in("conversation_id", convIds)
      .neq("user_id", user.id);

    if (!participants?.length) return;

    const otherUserIds = [...new Set(participants.map(p => p.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
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
  }, [user]);

  useEffect(() => {
    fetchConversations();
    supabase.from("profiles").select("user_id, display_name, avatar_url").then(({ data }) => {
      if (data) setAllUsers(data.filter(u => u.user_id !== user?.id));
    });
  }, [fetchConversations, user]);

  const fetchMessages = useCallback(async (convId: string) => {
    const { data } = await supabase
      .from("direct_messages")
      .select("id, sender_id, text, created_at")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });
    if (data) setMessages(data);
    // Mark as read
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
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "direct_messages", filter: `conversation_id=eq.${selectedConv}` }, () => {
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
    // Check if conversation already exists
    const existing = conversations.find(c => c.other_user_id === otherUser.user_id);
    if (existing) {
      setSelectedConv(existing.id);
      setSelectedOther(otherUser);
      setShowNewChat(false);
      return;
    }
    // Create new conversation
    const { data: conv } = await supabase.from("conversations").insert({}).select("id").single();
    if (!conv) return;
    await supabase.from("conversation_participants").insert([
      { conversation_id: conv.id, user_id: user.id },
      { conversation_id: conv.id, user_id: otherUser.user_id },
    ]);
    setSelectedConv(conv.id);
    setSelectedOther(otherUser);
    setShowNewChat(false);
    fetchConversations();
  };

  const sendMessage = async () => {
    if (!newMsg.trim() || !selectedConv || !user) return;
    await supabase.from("direct_messages").insert({
      conversation_id: selectedConv,
      sender_id: user.id,
      text: newMsg.trim(),
    });
    setNewMsg("");
    await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", selectedConv);
  };

  const getInitials = (name: string | null) => name ? name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "?";

  const formatTime = (d: string) => {
    if (!d) return "";
    const date = new Date(d);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 86400000) return format(date, "HH:mm");
    return format(date, "dd/MM", { locale: ptBR });
  };

  // Message thread view
  if (selectedConv) {
    const other = selectedOther || conversations.find(c => c.id === selectedConv);
    const otherName = selectedOther?.display_name || (other as Conversation)?.other_display_name || "Chat";

    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
          <button onClick={() => { setSelectedConv(null); setSelectedOther(null); }} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
            {selectedOther?.avatar_url ? (
              <img src={selectedOther.avatar_url} className="h-8 w-8 rounded-full object-cover" />
            ) : (
              getInitials(otherName)
            )}
          </div>
          <p className="text-sm font-semibold font-body">{otherName}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.map(msg => (
            <div key={msg.id} className={cn("flex", msg.sender_id === user?.id ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[75%] rounded-2xl px-3 py-2 text-sm font-body",
                msg.sender_id === user?.id
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-muted text-foreground rounded-bl-md"
              )}>
                <p>{msg.text}</p>
                <p className={cn("text-[10px] mt-0.5", msg.sender_id === user?.id ? "text-primary-foreground/60" : "text-muted-foreground")}>
                  {formatTime(msg.created_at)}
                </p>
              </div>
            </div>
          ))}
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

  // New chat user list
  if (showNewChat) {
    const filtered = allUsers.filter(u => u.display_name?.toLowerCase().includes(search.toLowerCase()));
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
          <button onClick={() => setShowNewChat(false)} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <p className="text-sm font-semibold font-body">Nova conversa</p>
        </div>
        <div className="px-4 py-2">
          <div className="flex items-center gap-2 bg-muted/50 rounded-full px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar usuária..."
              className="flex-1 bg-transparent text-sm font-body outline-none"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map(u => (
            <button
              key={u.user_id}
              onClick={() => startConversation(u)}
              className="flex items-center gap-3 px-4 py-3 w-full hover:bg-muted/50 transition-colors"
            >
              {u.avatar_url ? (
                <img src={u.avatar_url} className="h-10 w-10 rounded-full object-cover" />
              ) : (
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                  {getInitials(u.display_name)}
                </div>
              )}
              <p className="text-sm font-body font-medium">{u.display_name}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Conversation list
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <p className="text-sm font-semibold font-body">Mensagens</p>
        </div>
        <button onClick={() => setShowNewChat(true)} className="text-sm text-primary font-body font-medium">
          Nova
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <p className="text-sm font-body">Nenhuma conversa ainda</p>
            <button onClick={() => setShowNewChat(true)} className="text-sm text-primary font-body mt-2">
              Iniciar conversa
            </button>
          </div>
        ) : (
          conversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => { setSelectedConv(conv.id); setSelectedOther({ user_id: conv.other_user_id, display_name: conv.other_display_name, avatar_url: conv.other_avatar_url }); }}
              className="flex items-center gap-3 px-4 py-3 w-full hover:bg-muted/50 transition-colors border-b border-border/50"
            >
              {conv.other_avatar_url ? (
                <img src={conv.other_avatar_url} className="h-11 w-11 rounded-full object-cover" />
              ) : (
                <div className="h-11 w-11 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                  {getInitials(conv.other_display_name)}
                </div>
              )}
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-body font-semibold truncate">{conv.other_display_name}</p>
                <p className="text-xs font-body text-muted-foreground truncate">{conv.last_message}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] text-muted-foreground">{formatTime(conv.last_message_at)}</span>
                {conv.unread_count > 0 && (
                  <span className="h-5 min-w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center px-1">
                    {conv.unread_count}
                  </span>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

import { useEffect, useState, useCallback } from "react";
import { X, Heart, MessageCircle, Droplets, Brain, Target, AtSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Notification {
  id: string;
  type: "like" | "comment";
  from_name: string;
  from_avatar: string | null;
  comment_text: string | null;
  read: boolean;
  created_at: string;
}

const staticReminders = [
  { icon: Droplets, text: "Hora de beber água! 💧", time: "Agora" },
  { icon: Brain, text: "Sua meditação diária te espera 🧘‍♀️", time: "10:00" },
  { icon: Target, text: "Revise suas metas da semana 🎯", time: "20:00" },
];

export default function NotificationsPanel({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (!data || data.length === 0) { setNotifications([]); return; }

    const fromIds = [...new Set(data.map((n: any) => n.from_user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name, avatar_url")
      .in("user_id", fromIds);

    const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));

    setNotifications(data.map((n: any) => {
      const prof = profileMap.get(n.from_user_id);
      return {
        id: n.id,
        type: n.type,
        from_name: prof?.display_name || "Alguém",
        from_avatar: prof?.avatar_url || null,
        comment_text: n.comment_text,
        read: n.read,
        created_at: n.created_at,
      };
    }));

    // Mark all as read
    const unreadIds = data.filter((n: any) => !n.read).map((n: any) => n.id);
    if (unreadIds.length > 0) {
      await supabase.from("notifications").update({ read: true }).in("id", unreadIds);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Realtime
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("my-notifications")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${user.id}`,
      }, () => fetchNotifications())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, fetchNotifications]);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMin = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diffMin < 1) return "agora";
    if (diffMin < 60) return `${diffMin}min`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h`;
    return format(date, "dd MMM", { locale: ptBR });
  };

  const getInitials = (name: string) =>
    name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="mx-5 mb-4 bg-card rounded-2xl shadow-card border border-border overflow-hidden animate-fade-in max-h-[70vh] overflow-y-auto">
      <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card z-10">
        <h3 className="text-sm font-display font-semibold">Notificações</h3>
        <button onClick={onClose} className="p-1">
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      <div className="divide-y divide-border">
        {/* Social notifications */}
        {notifications.map(n => (
          <div key={n.id} className={`flex items-start gap-3 p-4 ${!n.read ? "bg-gold/5" : ""}`}>
            <div className="relative flex-shrink-0">
              {n.from_avatar ? (
                <img src={n.from_avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gold/20 flex items-center justify-center text-xs font-bold text-gold">
                  {getInitials(n.from_name)}
                </div>
              )}
              <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-card flex items-center justify-center">
                {n.type === "like" ? (
                  <Heart className="h-2.5 w-2.5 fill-red-400 text-red-400" />
                ) : (
                  <MessageCircle className="h-2.5 w-2.5 text-gold" />
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-body">
                <span className="font-semibold">{n.from_name}</span>{" "}
                {n.type === "like" ? "curtiu seu post ❤️" : "comentou no seu post"}
              </p>
              {n.comment_text && (
                <p className="text-[11px] font-body text-muted-foreground mt-0.5 truncate">"{n.comment_text}"</p>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground font-body flex-shrink-0">{formatTime(n.created_at)}</span>
          </div>
        ))}

        {notifications.length > 0 && (
          <div className="px-4 py-2">
            <p className="text-[10px] text-muted-foreground font-body uppercase tracking-wider">Lembretes</p>
          </div>
        )}

        {/* Static reminders */}
        {staticReminders.map((n, i) => (
          <div key={`r-${i}`} className="flex items-center gap-3 p-4">
            <div className="h-8 w-8 rounded-full bg-gold/10 flex items-center justify-center">
              <n.icon className="h-4 w-4 text-gold" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-body">{n.text}</p>
            </div>
            <span className="text-[10px] text-muted-foreground font-body">{n.time}</span>
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="px-4 py-3">
            <p className="text-xs text-muted-foreground font-body text-center">Nenhuma notificação social ainda ✨</p>
          </div>
        )}
      </div>
    </div>
  );
}

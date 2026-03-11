import { useState, useEffect } from "react";
import { X, ChevronRight, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AppUpdate {
  id: string;
  version: string;
  title: string;
  description: string;
  how_to_use: string | null;
  icon: string;
  created_at: string;
}

interface AppUpdatesModalProps {
  onClose: () => void;
}

export default function AppUpdatesModal({ onClose }: AppUpdatesModalProps) {
  const { user } = useAuth();
  const [updates, setUpdates] = useState<AppUpdate[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [mode, setMode] = useState<"unread" | "all">("unread");

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const [{ data: allUpdates }, { data: reads }] = await Promise.all([
        supabase.from("app_updates").select("*").order("created_at", { ascending: false }),
        supabase.from("app_update_reads").select("update_id").eq("user_id", user.id),
      ]);
      const readSet = new Set((reads || []).map((r: any) => r.update_id));
      setReadIds(readSet);
      const all = (allUpdates || []) as AppUpdate[];
      setUpdates(all);
      // If there are unread updates, show walkthrough mode
      const unread = all.filter(u => !readSet.has(u.id));
      if (unread.length === 0) {
        setMode("all");
      } else {
        setMode("unread");
      }
      setLoading(false);
    };
    fetch();
  }, [user]);

  const unreadUpdates = updates.filter(u => !readIds.has(u.id));
  const currentUpdates = mode === "unread" ? unreadUpdates : updates;

  const markAsRead = async (updateId: string) => {
    if (!user || readIds.has(updateId)) return;
    await supabase.from("app_update_reads").insert({ user_id: user.id, update_id: updateId });
    setReadIds(prev => new Set(prev).add(updateId));
  };

  const markAllAsRead = async () => {
    if (!user) return;
    const unread = updates.filter(u => !readIds.has(u.id));
    if (unread.length === 0) return;
    const inserts = unread.map(u => ({ user_id: user.id, update_id: u.id }));
    await supabase.from("app_update_reads").insert(inserts);
    setReadIds(new Set(updates.map(u => u.id)));
  };

  // Walkthrough mode for unread updates
  if (mode === "unread" && unreadUpdates.length > 0) {
    const current = unreadUpdates[currentIndex];
    if (!current) { onClose(); return null; }

    const goNext = async () => {
      await markAsRead(current.id);
      if (currentIndex < unreadUpdates.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        onClose();
      }
    };

    return (
      <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-card border border-border rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl animate-scale-in">
          {/* Header gradient */}
          <div className="bg-gradient-gold px-4 py-3 text-center relative">
            <button onClick={onClose} className="absolute top-2 right-2 text-primary-foreground/70 hover:text-primary-foreground">
              <X className="h-4 w-4" />
            </button>
            <span className="text-3xl block mb-1">{current.icon}</span>
            <p className="text-[9px] font-body text-primary-foreground/70 uppercase tracking-widest">
              v{current.version}
            </p>
            <h2 className="text-base font-heading font-bold text-primary-foreground">
              {current.title}
            </h2>
          </div>

          <div className="p-4 space-y-3">
            <p className="text-xs font-body text-foreground leading-relaxed">
              {current.description}
            </p>

            {current.how_to_use && (
              <div className="bg-muted/50 rounded-lg p-3 border border-border">
                <p className="text-[9px] font-body font-semibold text-gold uppercase tracking-wider mb-1">
                  💡 Como usar
                </p>
                <p className="text-[11px] font-body text-muted-foreground leading-relaxed">
                  {current.how_to_use}
                </p>
              </div>
            )}

            {/* Progress dots */}
            <div className="flex items-center justify-center gap-1 pt-1">
              {unreadUpdates.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1 rounded-full transition-all",
                    i === currentIndex ? "w-5 bg-gold" : "w-1 bg-muted-foreground/30"
                  )}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => { await markAllAsRead(); onClose(); }}
                className="flex-1 text-muted-foreground text-xs h-8"
              >
                Pular
              </Button>
              <Button variant="gold" size="sm" onClick={goNext} className="flex-1 gap-1 text-xs h-8">
                {currentIndex < unreadUpdates.length - 1 ? (
                  <>Próximo <ChevronRight className="h-3 w-3" /></>
                ) : (
                  <>Entendi! <Sparkles className="h-3 w-3" /></>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full list mode
  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center animate-fade-in">
      <div className="bg-card border border-border rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-gold" />
            <h2 className="text-lg font-heading font-bold text-foreground">Novidades do App</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted transition-colors">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Updates list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <p className="text-center text-sm text-muted-foreground py-8">Carregando...</p>
          ) : currentUpdates.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <CheckCircle2 className="h-10 w-10 text-gold mx-auto" />
              <p className="text-sm font-body text-foreground font-semibold">Tudo em dia!</p>
              <p className="text-xs font-body text-muted-foreground">Nenhuma atualização nova.</p>
            </div>
          ) : (
            currentUpdates.map(update => (
              <button
                key={update.id}
                onClick={() => setExpandedId(expandedId === update.id ? null : update.id)}
                className={cn(
                  "w-full text-left bg-muted/30 rounded-2xl border transition-all",
                  !readIds.has(update.id) ? "border-gold/30 bg-gold/5" : "border-border",
                  expandedId === update.id && "ring-1 ring-gold/20"
                )}
              >
                <div className="flex items-start gap-3 p-3.5">
                  <span className="text-2xl mt-0.5">{update.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-body text-gold font-semibold">v{update.version}</span>
                      {!readIds.has(update.id) && (
                        <span className="text-[9px] font-body bg-gold text-primary-foreground px-1.5 py-0.5 rounded-full font-semibold">NOVO</span>
                      )}
                    </div>
                    <h3 className="text-sm font-body font-semibold text-foreground mt-0.5">{update.title}</h3>
                    <p className="text-xs font-body text-muted-foreground mt-1 leading-relaxed">{update.description}</p>

                    {expandedId === update.id && update.how_to_use && (
                      <div className="mt-3 bg-background rounded-xl p-3 border border-border animate-fade-in">
                        <p className="text-[10px] font-body font-semibold text-gold uppercase tracking-wider mb-1.5">💡 Como usar</p>
                        <p className="text-xs font-body text-muted-foreground leading-relaxed">{update.how_to_use}</p>
                      </div>
                    )}

                    <p className="text-[10px] font-body text-muted-foreground/50 mt-2">
                      {format(new Date(update.created_at), "dd MMM yyyy", { locale: ptBR })}
                    </p>
                  </div>
                  <ChevronRight className={cn(
                    "h-4 w-4 text-muted-foreground/40 mt-2 transition-transform",
                    expandedId === update.id && "rotate-90"
                  )} />
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

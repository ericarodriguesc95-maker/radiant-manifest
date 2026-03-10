import { useState, useEffect, useCallback, useRef } from "react";
import { X, Trash2, Eye, Send, Heart, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface StoryItem {
  id: string;
  user_id: string;
  media_url: string | null;
  media_type: string;
  text_content: string | null;
  bg_color: string | null;
  created_at: string;
  display_name: string | null;
  avatar_url: string | null;
  viewed: boolean;
}

interface GroupedStories {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  stories: StoryItem[];
  hasUnviewed: boolean;
}

interface StoryViewerProps {
  group: GroupedStories;
  onClose: () => void;
}

interface CommentWithProfile {
  id: string;
  user_id: string;
  text: string;
  created_at: string;
  display_name: string | null;
  avatar_url: string | null;
}

const STORY_DURATION = 6000;
const REACTION_EMOJIS = ["❤️", "🔥", "😍", "😂", "😮", "👏🏻", "👏🏽", "👏🏿", "💪🏻", "💪🏽", "💪🏿", "✨", "🙌🏻", "🙌🏽", "🙌🏿", "🥰"];

const StoryViewer = ({ group, onClose }: StoryViewerProps) => {
  const { user, profile } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const [showViewers, setShowViewers] = useState(false);
  const [viewers, setViewers] = useState<{ display_name: string | null; avatar_url: string | null }[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<CommentWithProfile[]>([]);
  const [commentText, setCommentText] = useState("");
  const [reactions, setReactions] = useState<{ emoji: string; count: number }[]>([]);
  const [myReaction, setMyReaction] = useState<string | null>(null);
  const [showReactions, setShowReactions] = useState(false);
  const [reactionBurst, setReactionBurst] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef(0);
  const progressRef = useRef(0);
  const commentInputRef = useRef<HTMLInputElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const story = group.stories[currentIndex];
  const isOwner = user?.id === group.user_id;
  const isPanelOpen = showViewers || showComments;

  // Mark as viewed
  useEffect(() => {
    if (!user || !story || user.id === story.user_id) return;
    supabase.from("story_views").upsert(
      { story_id: story.id, viewer_id: user.id },
      { onConflict: "story_id,viewer_id" }
    );
  }, [story?.id, user]);

  // Fetch view count
  useEffect(() => {
    if (!story) return;
    supabase
      .from("story_views")
      .select("*", { count: "exact", head: true })
      .eq("story_id", story.id)
      .then(({ count }) => setViewCount(count || 0));
  }, [story?.id]);

  // Fetch reactions
  const fetchReactions = useCallback(async () => {
    if (!story || !user) return;
    const { data } = await supabase
      .from("story_reactions")
      .select("emoji, user_id")
      .eq("story_id", story.id);
    if (data) {
      const counts = new Map<string, number>();
      let mine: string | null = null;
      data.forEach((r: any) => {
        counts.set(r.emoji, (counts.get(r.emoji) || 0) + 1);
        if (r.user_id === user.id) mine = r.emoji;
      });
      setReactions(Array.from(counts.entries()).map(([emoji, count]) => ({ emoji, count })));
      setMyReaction(mine);
    }
  }, [story?.id, user]);

  useEffect(() => { fetchReactions(); }, [fetchReactions]);

  // Fetch comments
  const fetchComments = useCallback(async () => {
    if (!story) return;
    const { data } = await supabase
      .from("story_comments")
      .select("*")
      .eq("story_id", story.id)
      .order("created_at", { ascending: true });
    if (data && data.length > 0) {
      const userIds = [...new Set(data.map((c: any) => c.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds);
      const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));
      setComments(data.map((c: any) => {
        const prof = profileMap.get(c.user_id);
        return { ...c, display_name: prof?.display_name || "Usuária", avatar_url: prof?.avatar_url || null };
      }));
    } else {
      setComments([]);
    }
  }, [story?.id]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  // Auto-advance timer
  const startTimer = useCallback(() => {
    if (story?.media_type === "video") return;
    startTimeRef.current = Date.now();
    progressRef.current = progress;
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const newProgress = progressRef.current + (elapsed / STORY_DURATION) * 100;
      if (newProgress >= 100) {
        clearInterval(timerRef.current!);
        goNext();
      } else {
        setProgress(newProgress);
        progressRef.current = newProgress;
        startTimeRef.current = Date.now();
      }
    }, 50);
  }, [currentIndex, group.stories.length]);

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => {
    setProgress(0);
    progressRef.current = 0;
    setShowComments(false);
    setShowViewers(false);
    setShowReactions(false);
    if (!paused) startTimer();
    return stopTimer;
  }, [currentIndex]);

  useEffect(() => {
    if (paused || isPanelOpen) {
      stopTimer();
    } else {
      startTimer();
    }
    return stopTimer;
  }, [paused, isPanelOpen]);

  const goNext = () => {
    stopTimer();
    if (currentIndex < group.stories.length - 1) {
      setCurrentIndex((i) => i + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const goPrev = () => {
    stopTimer();
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setProgress(0);
    }
  };

  const deleteStory = async () => {
    if (!story) return;
    await supabase.from("stories").delete().eq("id", story.id);
    if (group.stories.length <= 1) {
      onClose();
    } else {
      group.stories.splice(currentIndex, 1);
      setCurrentIndex(Math.min(currentIndex, group.stories.length - 1));
      setProgress(0);
    }
  };

  const fetchViewers = async () => {
    if (!story) return;
    const { data } = await supabase
      .from("story_views")
      .select("viewer_id")
      .eq("story_id", story.id);
    if (data && data.length > 0) {
      const viewerIds = data.map((v: any) => v.viewer_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .in("user_id", viewerIds);
      setViewers(profiles || []);
    } else {
      setViewers([]);
    }
    setShowComments(false);
    setShowViewers(true);
    setPaused(true);
    stopTimer();
  };

  const toggleReaction = async (emoji: string) => {
    if (!user || !story) return;
    if (myReaction === emoji) {
      await supabase.from("story_reactions").delete().eq("story_id", story.id).eq("user_id", user.id);
      setMyReaction(null);
    } else {
      await supabase.from("story_reactions").upsert(
        { story_id: story.id, user_id: user.id, emoji },
        { onConflict: "story_id,user_id" }
      );
      setMyReaction(emoji);
      setReactionBurst(emoji);
      setTimeout(() => setReactionBurst(null), 800);
    }
    setShowReactions(false);
    fetchReactions();
  };

  const sendComment = async () => {
    if (!user || !story || !commentText.trim()) return;
    await supabase.from("story_comments").insert({
      story_id: story.id,
      user_id: user.id,
      text: commentText.trim(),
    });
    setCommentText("");
    fetchComments();
    setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: "smooth" }), 200);
  };

  const openComments = () => {
    setShowViewers(false);
    setShowComments(true);
    setPaused(true);
    stopTimer();
    setTimeout(() => commentInputRef.current?.focus(), 300);
  };

  const closePanel = () => {
    setShowViewers(false);
    setShowComments(false);
    setPaused(false);
  };

  if (!story) return null;

  const totalReactions = reactions.reduce((sum, r) => sum + r.count, 0);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Progress bars */}
      <div className="flex gap-1 p-3 pt-4">
        {group.stories.map((_, i) => (
          <div key={i} className="flex-1 h-[3px] bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-75"
              style={{
                width: i < currentIndex ? "100%" : i === currentIndex ? `${progress}%` : "0%",
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-3">
          {group.avatar_url ? (
            <img src={group.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
          ) : (
            <div className="h-8 w-8 rounded-full bg-card flex items-center justify-center text-xs font-bold text-muted-foreground">
              {(group.display_name || "U")[0].toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-white text-sm font-body font-medium">
              {isOwner ? "Você" : group.display_name?.split(" ")[0] || "Usuária"}
            </p>
            <p className="text-white/50 text-[10px] font-body">
              {formatDistanceToNow(new Date(story.created_at), { addSuffix: true, locale: ptBR })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {isOwner && (
            <button onClick={fetchViewers} className="flex items-center gap-1 text-white/70 hover:text-white p-2">
              <Eye className="h-5 w-5" />
              <span className="text-xs">{viewCount}</span>
            </button>
          )}
          {isOwner && (
            <button onClick={deleteStory} className="text-white/70 hover:text-white p-2">
              <Trash2 className="h-5 w-5" />
            </button>
          )}
          <button onClick={onClose} className="text-white/70 hover:text-white p-2">
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Story content */}
      <div
        className="flex-1 relative flex items-center justify-center overflow-hidden"
        onMouseDown={() => { if (!isPanelOpen) { setPaused(true); stopTimer(); } }}
        onMouseUp={() => { if (!isPanelOpen) setPaused(false); }}
        onTouchStart={() => { if (!isPanelOpen) { setPaused(true); stopTimer(); } }}
        onTouchEnd={() => { if (!isPanelOpen) setPaused(false); }}
      >
        {/* Navigation zones */}
        {!isPanelOpen && (
          <>
            <button onClick={(e) => { e.stopPropagation(); goPrev(); }} className="absolute left-0 top-0 h-full w-1/3 z-10" />
            <button onClick={(e) => { e.stopPropagation(); goNext(); }} className="absolute right-0 top-0 h-full w-2/3 z-10" />
          </>
        )}

        {/* Reaction burst animation */}
        {reactionBurst && (
          <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
            <span className="text-7xl animate-bounce">{reactionBurst}</span>
          </div>
        )}

        {story.media_type === "text" ? (
          <div className="w-full h-full flex items-center justify-center px-8" style={{ backgroundColor: story.bg_color || "#C8A45C" }}>
            <p className="text-white text-center text-2xl font-display leading-relaxed">{story.text_content}</p>
          </div>
        ) : story.media_type === "video" ? (
          <video src={story.media_url || ""} className="max-h-full max-w-full object-contain" autoPlay playsInline onEnded={goNext} />
        ) : (
          <div className="w-full h-full relative">
            <img src={story.media_url || ""} alt="" className="w-full h-full object-contain" />
            {story.text_content && (
              <div className="absolute bottom-24 left-0 right-0 text-center px-6">
                <p className="text-white text-lg font-body bg-black/40 backdrop-blur-sm rounded-xl px-4 py-3 inline-block">{story.text_content}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom bar: reactions + comments */}
      {!isPanelOpen && (
        <div className="px-4 py-3 flex items-center gap-2">
          {/* Reaction bubbles */}
          {reactions.length > 0 && (
            <div className="flex items-center gap-1 mr-1">
              {reactions.slice(0, 3).map((r) => (
                <span key={r.emoji} className="text-sm">{r.emoji}</span>
              ))}
              <span className="text-white/50 text-xs ml-0.5">{totalReactions}</span>
            </div>
          )}

          {/* Quick reaction */}
          <button
            onClick={() => { setShowReactions(!showReactions); setPaused(true); stopTimer(); }}
            className={`p-2 rounded-full transition-colors ${myReaction ? "bg-white/20" : "bg-white/10 hover:bg-white/15"}`}
          >
            <Heart className={`h-5 w-5 ${myReaction ? "text-red-400 fill-red-400" : "text-white/80"}`} />
          </button>

          {/* Comment button + input */}
          <button onClick={openComments} className="flex-1 flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 hover:bg-white/15 transition-colors">
            <MessageCircle className="h-4 w-4 text-white/60" />
            <span className="text-white/50 text-sm font-body">
              {comments.length > 0 ? `${comments.length} comentário${comments.length > 1 ? "s" : ""}` : "Comentar..."}
            </span>
          </button>
        </div>
      )}

      {/* Reaction picker */}
      {showReactions && !isPanelOpen && (
        <div className="absolute bottom-20 left-4 right-4 bg-card/95 backdrop-blur-md rounded-2xl px-3 py-2 flex flex-wrap gap-1 z-30 shadow-lg justify-center">
          {REACTION_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => toggleReaction(emoji)}
              className={`text-2xl p-1 rounded-lg hover:bg-muted transition-colors ${myReaction === emoji ? "bg-muted scale-110" : ""}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Viewers panel */}
      {showViewers && (
        <div className="absolute inset-x-0 bottom-0 bg-card/95 backdrop-blur-md rounded-t-2xl max-h-[50vh] overflow-y-auto z-20 p-4 animate-in slide-in-from-bottom">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-foreground font-display font-bold">👁 Visualizações ({viewers.length})</h3>
            <button onClick={closePanel} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
          </div>
          {viewers.length === 0 ? (
            <p className="text-muted-foreground text-sm font-body text-center py-6">Ninguém viu ainda 👀</p>
          ) : (
            <div className="space-y-3">
              {viewers.map((v, i) => (
                <div key={i} className="flex items-center gap-3">
                  {v.avatar_url ? (
                    <img src={v.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover" />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                      {(v.display_name || "U")[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-foreground text-sm font-body">{v.display_name || "Usuária"}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Comments panel */}
      {showComments && (
        <div className="absolute inset-x-0 bottom-0 bg-card/95 backdrop-blur-md rounded-t-2xl max-h-[60vh] z-20 flex flex-col animate-in slide-in-from-bottom">
          <div className="flex items-center justify-between p-4 pb-2 border-b border-border">
            <h3 className="text-foreground font-display font-bold">💬 Comentários ({comments.length})</h3>
            <button onClick={closePanel} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[100px]">
            {comments.length === 0 ? (
              <p className="text-muted-foreground text-sm font-body text-center py-6">Seja a primeira a comentar! ✨</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="flex gap-2.5">
                  {c.avatar_url ? (
                    <img src={c.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground flex-shrink-0">
                      {(c.display_name || "U")[0].toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-foreground text-xs font-body font-semibold">{c.display_name || "Usuária"}</span>
                      <span className="text-muted-foreground text-[10px] font-body">
                        {formatDistanceToNow(new Date(c.created_at), { addSuffix: true, locale: ptBR })}
                      </span>
                    </div>
                    <p className="text-foreground text-sm font-body mt-0.5">{c.text}</p>
                  </div>
                  {c.user_id === user?.id && (
                    <button
                      onClick={async () => {
                        await supabase.from("story_comments").delete().eq("id", c.id);
                        fetchComments();
                      }}
                      className="text-muted-foreground hover:text-destructive p-1 flex-shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
            <div ref={commentsEndRef} />
          </div>

          {/* Comment input */}
          <div className="p-3 border-t border-border flex items-center gap-2">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="h-7 w-7 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground flex-shrink-0">
                {(profile?.display_name || "U")[0].toUpperCase()}
              </div>
            )}
            <input
              ref={commentInputRef}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") sendComment(); }}
              placeholder="Escreva um comentário..."
              className="flex-1 bg-muted/50 rounded-full px-4 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground outline-none"
            />
            <button
              onClick={sendComment}
              disabled={!commentText.trim()}
              className="p-2 text-gold disabled:text-muted-foreground transition-colors"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryViewer;

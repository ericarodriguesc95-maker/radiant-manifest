import { useState, useEffect, useCallback, useRef } from "react";
import { X, ChevronLeft, ChevronRight, Trash2, Eye } from "lucide-react";
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

const STORY_DURATION = 6000; // 6 seconds per story

const StoryViewer = ({ group, onClose }: StoryViewerProps) => {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const [showViewers, setShowViewers] = useState(false);
  const [viewers, setViewers] = useState<{ display_name: string | null; avatar_url: string | null }[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef(0);
  const progressRef = useRef(0);

  const story = group.stories[currentIndex];
  const isOwner = user?.id === group.user_id;

  // Mark as viewed
  useEffect(() => {
    if (!user || !story || user.id === story.user_id) return;
    supabase.from("story_views").upsert(
      { story_id: story.id, viewer_id: user.id },
      { onConflict: "story_id,viewer_id" }
    );
  }, [story?.id, user]);

  // Fetch view count for own stories
  useEffect(() => {
    if (!isOwner || !story) return;
    supabase
      .from("story_views")
      .select("*", { count: "exact", head: true })
      .eq("story_id", story.id)
      .then(({ count }) => setViewCount(count || 0));
  }, [story?.id, isOwner]);

  // Auto-advance timer
  const startTimer = useCallback(() => {
    if (story?.media_type === "video") return; // video controls its own timing
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
    if (!paused) startTimer();
    return stopTimer;
  }, [currentIndex, paused]);

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
    }
    setShowViewers(true);
    setPaused(true);
    stopTimer();
  };

  if (!story) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Progress bars */}
      <div className="flex gap-1 p-3 pt-4">
        {group.stories.map((_, i) => (
          <div key={i} className="flex-1 h-[3px] bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-75"
              style={{
                width:
                  i < currentIndex ? "100%" : i === currentIndex ? `${progress}%` : "0%",
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
        <div className="flex items-center gap-2">
          {isOwner && (
            <>
              <button onClick={fetchViewers} className="text-white/70 hover:text-white p-1">
                <Eye className="h-5 w-5" />
                {viewCount > 0 && (
                  <span className="text-[10px] ml-1">{viewCount}</span>
                )}
              </button>
              <button onClick={deleteStory} className="text-white/70 hover:text-white p-1">
                <Trash2 className="h-5 w-5" />
              </button>
            </>
          )}
          <button onClick={onClose} className="text-white/70 hover:text-white p-1">
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Story content */}
      <div
        className="flex-1 relative flex items-center justify-center"
        onMouseDown={() => { setPaused(true); stopTimer(); }}
        onMouseUp={() => { setPaused(false); }}
        onTouchStart={() => { setPaused(true); stopTimer(); }}
        onTouchEnd={() => { setPaused(false); }}
      >
        {/* Navigation zones */}
        <button
          onClick={(e) => { e.stopPropagation(); goPrev(); }}
          className="absolute left-0 top-0 h-full w-1/3 z-10"
        />
        <button
          onClick={(e) => { e.stopPropagation(); goNext(); }}
          className="absolute right-0 top-0 h-full w-2/3 z-10"
        />

        {story.media_type === "text" ? (
          <div
            className="w-full h-full flex items-center justify-center px-8"
            style={{ backgroundColor: story.bg_color || "#C8A45C" }}
          >
            <p className="text-white text-center text-2xl font-display leading-relaxed">
              {story.text_content}
            </p>
          </div>
        ) : story.media_type === "video" ? (
          <video
            src={story.media_url || ""}
            className="max-h-full max-w-full object-contain"
            autoPlay
            playsInline
            onEnded={goNext}
          />
        ) : (
          <div className="w-full h-full relative">
            <img
              src={story.media_url || ""}
              alt=""
              className="w-full h-full object-contain"
            />
            {story.text_content && (
              <div className="absolute bottom-16 left-0 right-0 text-center px-6">
                <p className="text-white text-lg font-body bg-black/40 backdrop-blur-sm rounded-xl px-4 py-3 inline-block">
                  {story.text_content}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Viewers modal */}
      {showViewers && (
        <div className="absolute inset-x-0 bottom-0 bg-card/95 backdrop-blur-md rounded-t-2xl max-h-[50vh] overflow-y-auto z-20 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-foreground font-display font-bold">
              Visualizações ({viewers.length})
            </h3>
            <button
              onClick={() => { setShowViewers(false); setPaused(false); }}
              className="text-muted-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {viewers.length === 0 ? (
            <p className="text-muted-foreground text-sm font-body">Ninguém viu ainda</p>
          ) : (
            <div className="space-y-3">
              {viewers.map((v, i) => (
                <div key={i} className="flex items-center gap-3">
                  {v.avatar_url ? (
                    <img src={v.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
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
    </div>
  );
};

export default StoryViewer;

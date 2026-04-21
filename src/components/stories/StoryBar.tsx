import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import StoryViewer from "./StoryViewer";
import StoryCreator from "./StoryCreator";

interface StoryWithProfile {
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
  stories: StoryWithProfile[];
  hasUnviewed: boolean;
}

const StoryBar = () => {
  const { user } = useAuth();
  const [groupedStories, setGroupedStories] = useState<GroupedStories[]>([]);
  const [showCreator, setShowCreator] = useState(false);
  const [viewingGroup, setViewingGroup] = useState<GroupedStories | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStories = async () => {
    if (!user) return;

    const { data: stories } = await supabase
      .from("stories")
      .select("*")
      .order("created_at", { ascending: true });

    if (!stories) { setLoading(false); return; }

    const userIds = [...new Set(stories.map((s: any) => s.user_id))];
    const { data: profiles } = await supabase
      .from("profiles_public" as any)
      .select("user_id, display_name, avatar_url")
      .in("user_id", userIds.length > 0 ? userIds : ["00000000-0000-0000-0000-000000000000"]);

    const { data: views } = await supabase
      .from("story_views")
      .select("story_id")
      .eq("viewer_id", user.id);

    const viewedIds = new Set((views || []).map((v: any) => v.story_id));
    const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));

    const enriched: StoryWithProfile[] = stories.map((s: any) => {
      const prof = profileMap.get(s.user_id);
      return {
        ...s,
        display_name: prof?.display_name || "Usuária",
        avatar_url: prof?.avatar_url || null,
        viewed: viewedIds.has(s.id),
      };
    });

    // Group by user, own stories first
    const groups = new Map<string, GroupedStories>();
    enriched.forEach((s) => {
      if (!groups.has(s.user_id)) {
        groups.set(s.user_id, {
          user_id: s.user_id,
          display_name: s.display_name,
          avatar_url: s.avatar_url,
          stories: [],
          hasUnviewed: false,
        });
      }
      const g = groups.get(s.user_id)!;
      g.stories.push(s);
      if (!s.viewed) g.hasUnviewed = true;
    });

    const sorted = Array.from(groups.values()).sort((a, b) => {
      if (a.user_id === user.id) return -1;
      if (b.user_id === user.id) return 1;
      if (a.hasUnviewed && !b.hasUnviewed) return -1;
      if (!a.hasUnviewed && b.hasUnviewed) return 1;
      return 0;
    });

    setGroupedStories(sorted);
    setLoading(false);
  };

  useEffect(() => { fetchStories(); }, [user]);

  useEffect(() => {
    const channel = supabase
      .channel("stories-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "stories" }, () => fetchStories())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const myHasStories = groupedStories.some((g) => g.user_id === user?.id);

  return (
    <>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
        {/* Add story button */}
        <button
          onClick={() => setShowCreator(true)}
          className="flex flex-col items-center gap-1 flex-shrink-0"
        >
          <div className="relative">
            <div className="h-16 w-16 rounded-full bg-card border-2 border-dashed border-gold/50 flex items-center justify-center">
              <Plus className="h-6 w-6 text-gold" />
            </div>
          </div>
          <span className="text-[10px] text-muted-foreground font-body w-16 text-center truncate">
            Seu story
          </span>
        </button>

        {/* Story circles */}
        {groupedStories.map((group) => (
          <button
            key={group.user_id}
            onClick={() => setViewingGroup(group)}
            className="flex flex-col items-center gap-1 flex-shrink-0"
          >
            <div
              className={`h-16 w-16 rounded-full p-[2.5px] ${
                group.hasUnviewed
                  ? "bg-gradient-to-tr from-gold via-gold-light to-gold-dark"
                  : "bg-muted"
              }`}
            >
              <div className="h-full w-full rounded-full bg-background p-[2px]">
                {group.avatar_url ? (
                  <img
                    src={group.avatar_url}
                    alt=""
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full rounded-full bg-card flex items-center justify-center text-sm font-display font-bold text-muted-foreground">
                    {(group.display_name || "U")[0].toUpperCase()}
                  </div>
                )}
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground font-body w-16 text-center truncate">
              {group.user_id === user?.id ? "Você" : group.display_name?.split(" ")[0] || "Usuária"}
            </span>
          </button>
        ))}
      </div>

      {showCreator && (
        <StoryCreator
          onClose={() => setShowCreator(false)}
          onCreated={() => { setShowCreator(false); fetchStories(); }}
        />
      )}

      {viewingGroup && (
        <StoryViewer
          group={viewingGroup}
          onClose={() => { setViewingGroup(null); fetchStories(); }}
        />
      )}
    </>
  );
};

export default StoryBar;

import { useState, useEffect, useCallback } from "react";
import { Heart, Send, Image as ImageIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Leaderboard from "@/components/Leaderboard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PostWithProfile {
  id: string;
  user_id: string;
  text: string;
  likes_count: number;
  created_at: string;
  display_name: string | null;
  avatar_url: string | null;
  liked_by_me: boolean;
}

const ComunidadePage = () => {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<PostWithProfile[]>([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    if (!user) return;

    const { data: postsData } = await supabase
      .from("community_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (!postsData) return;

    // Get all unique user_ids
    const userIds = [...new Set(postsData.map((p: any) => p.user_id))];

    // Fetch profiles for all users
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name, avatar_url")
      .in("user_id", userIds);

    // Fetch likes by current user
    const { data: myLikes } = await supabase
      .from("post_likes")
      .select("post_id")
      .eq("user_id", user.id);

    const likedPostIds = new Set((myLikes || []).map((l: any) => l.post_id));
    const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));

    const enrichedPosts: PostWithProfile[] = postsData.map((post: any) => {
      const prof = profileMap.get(post.user_id);
      return {
        id: post.id,
        user_id: post.user_id,
        text: post.text,
        likes_count: post.likes_count,
        created_at: post.created_at,
        display_name: prof?.display_name || "Usuária",
        avatar_url: prof?.avatar_url || null,
        liked_by_me: likedPostIds.has(post.id),
      };
    });

    setPosts(enrichedPosts);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("community-posts")
      .on("postgres_changes", { event: "*", schema: "public", table: "community_posts" }, () => {
        fetchPosts();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchPosts]);

  // Pick up pending conquista from HomePage
  useEffect(() => {
    const pending = sessionStorage.getItem("pending-conquista");
    if (pending && user) {
      sessionStorage.removeItem("pending-conquista");
      supabase.from("community_posts").insert({ user_id: user.id, text: pending }).then(() => fetchPosts());
    }
  }, [user, fetchPosts]);

  const createPost = async () => {
    if (!newPost.trim() || !user) return;
    await supabase.from("community_posts").insert({ user_id: user.id, text: newPost.trim() });
    setNewPost("");
    fetchPosts();
  };

  const toggleLike = async (postId: string, currentlyLiked: boolean) => {
    if (!user) return;
    if (currentlyLiked) {
      await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", user.id);
      await supabase.from("community_posts").update({ likes_count: Math.max(0, (posts.find(p => p.id === postId)?.likes_count || 1) - 1) }).eq("id", postId);
    } else {
      await supabase.from("post_likes").insert({ post_id: postId, user_id: user.id });
      await supabase.from("community_posts").update({ likes_count: (posts.find(p => p.id === postId)?.likes_count || 0) + 1 }).eq("id", postId);
    }
    fetchPosts();
  };

  const deletePost = async (postId: string) => {
    await supabase.from("community_posts").delete().eq("id", postId);
    fetchPosts();
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "agora";
    if (diffMin < 60) return `${diffMin}min`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h`;
    return format(date, "dd MMM 'às' HH:mm", { locale: ptBR });
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen">
      <header className="px-5 pt-12 pb-4">
        <p className="text-sm text-muted-foreground font-body tracking-widest uppercase">Nossa</p>
        <h1 className="text-2xl font-display font-bold">Comunidade <span className="text-gold">✦</span></h1>
      </header>

      <div className="px-5 space-y-4 pb-6">
        <Leaderboard />

        {/* Create post */}
        <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
          <div className="flex items-start gap-3">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-gold/20 flex items-center justify-center text-xs font-bold text-gold">
                {getInitials(profile?.display_name || null)}
              </div>
            )}
            <textarea
              value={newPost}
              onChange={e => setNewPost(e.target.value)}
              placeholder="Compartilhe com as girls..."
              rows={2}
              className="flex-1 bg-transparent text-sm font-body outline-none resize-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex items-center justify-end">
            <Button variant="gold" size="sm" onClick={createPost} disabled={!newPost.trim()}>
              <Send className="h-3.5 w-3.5 mr-1" /> Postar
            </Button>
          </div>
        </div>

        {/* Feed */}
        {loading ? (
          <p className="text-center text-sm text-muted-foreground py-8">Carregando posts...</p>
        ) : posts.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">Nenhum post ainda. Seja a primeira! ✨</p>
        ) : (
          posts.map(post => (
            <div key={post.id} className="bg-card rounded-2xl border border-border overflow-hidden animate-fade-in">
              <div className="flex items-center gap-3 p-4 pb-2">
                {post.avatar_url ? (
                  <img src={post.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover" />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-gold/20 flex items-center justify-center text-xs font-bold text-gold">
                    {getInitials(post.display_name)}
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm font-body font-semibold">
                    {post.user_id === user?.id ? "Você" : post.display_name}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-body">{formatTime(post.created_at)}</p>
                </div>
                {post.user_id === user?.id && (
                  <button onClick={() => deletePost(post.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="px-4 pb-3">
                <p className="text-sm font-body leading-relaxed">{post.text}</p>
              </div>

              <div className="flex items-center gap-4 px-4 py-3 border-t border-border">
                <button
                  onClick={() => toggleLike(post.id, post.liked_by_me)}
                  className="flex items-center gap-1.5 text-sm font-body transition-colors"
                >
                  <Heart className={cn("h-4 w-4", post.liked_by_me ? "fill-red-400 text-red-400" : "text-muted-foreground")} />
                  <span className={cn(post.liked_by_me ? "text-red-400" : "text-muted-foreground")}>{post.likes_count}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ComunidadePage;

import { useState, useEffect, useCallback } from "react";
import { Heart, Send, Trash2, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Leaderboard from "@/components/Leaderboard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Comment {
  id: string;
  user_id: string;
  text: string;
  created_at: string;
  display_name: string | null;
  avatar_url: string | null;
}

interface PostWithProfile {
  id: string;
  user_id: string;
  text: string;
  likes_count: number;
  created_at: string;
  display_name: string | null;
  avatar_url: string | null;
  liked_by_me: boolean;
  comments: Comment[];
  comments_count: number;
}

const ComunidadePage = () => {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<PostWithProfile[]>([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});

  const fetchPosts = useCallback(async () => {
    if (!user) return;

    const { data: postsData } = await supabase
      .from("community_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (!postsData) return;

    // Get all unique user_ids from posts
    const postUserIds = [...new Set(postsData.map((p: any) => p.user_id))];

    // Fetch all comments
    const postIds = postsData.map((p: any) => p.id);
    const { data: commentsData } = await supabase
      .from("post_comments")
      .select("*")
      .in("post_id", postIds.length > 0 ? postIds : ["00000000-0000-0000-0000-000000000000"])
      .order("created_at", { ascending: true });

    // Get all unique user_ids from comments too
    const commentUserIds = (commentsData || []).map((c: any) => c.user_id);
    const allUserIds = [...new Set([...postUserIds, ...commentUserIds])];

    // Fetch profiles
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name, avatar_url")
      .in("user_id", allUserIds.length > 0 ? allUserIds : ["00000000-0000-0000-0000-000000000000"]);

    // Fetch likes by current user
    const { data: myLikes } = await supabase
      .from("post_likes")
      .select("post_id")
      .eq("user_id", user.id);

    const likedPostIds = new Set((myLikes || []).map((l: any) => l.post_id));
    const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));

    // Group comments by post
    const commentsByPost = new Map<string, Comment[]>();
    (commentsData || []).forEach((c: any) => {
      const prof = profileMap.get(c.user_id);
      const comment: Comment = {
        id: c.id,
        user_id: c.user_id,
        text: c.text,
        created_at: c.created_at,
        display_name: prof?.display_name || "Usuária",
        avatar_url: prof?.avatar_url || null,
      };
      if (!commentsByPost.has(c.post_id)) commentsByPost.set(c.post_id, []);
      commentsByPost.get(c.post_id)!.push(comment);
    });

    const enrichedPosts: PostWithProfile[] = postsData.map((post: any) => {
      const prof = profileMap.get(post.user_id);
      const comments = commentsByPost.get(post.id) || [];
      return {
        id: post.id,
        user_id: post.user_id,
        text: post.text,
        likes_count: post.likes_count,
        created_at: post.created_at,
        display_name: prof?.display_name || "Usuária",
        avatar_url: prof?.avatar_url || null,
        liked_by_me: likedPostIds.has(post.id),
        comments,
        comments_count: comments.length,
      };
    });

    setPosts(enrichedPosts);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Realtime subscription for posts, comments, and likes
  useEffect(() => {
    const channel = supabase
      .channel("community-feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "community_posts" }, () => fetchPosts())
      .on("postgres_changes", { event: "*", schema: "public", table: "post_comments" }, () => fetchPosts())
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

  const toggleLike = async (postId: string, postOwnerId: string, currentlyLiked: boolean) => {
    if (!user) return;
    if (currentlyLiked) {
      await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", user.id);
      await supabase.from("community_posts").update({
        likes_count: Math.max(0, (posts.find(p => p.id === postId)?.likes_count || 1) - 1)
      }).eq("id", postId);
    } else {
      await supabase.from("post_likes").insert({ post_id: postId, user_id: user.id });
      await supabase.from("community_posts").update({
        likes_count: (posts.find(p => p.id === postId)?.likes_count || 0) + 1
      }).eq("id", postId);
      // Send notification to post owner (if not self)
      if (postOwnerId !== user.id) {
        await supabase.from("notifications").insert({
          user_id: postOwnerId,
          from_user_id: user.id,
          type: "like",
          post_id: postId,
        });
      }
    }
    fetchPosts();
  };

  const addComment = async (postId: string, postOwnerId: string) => {
    const text = commentTexts[postId]?.trim();
    if (!text || !user) return;
    await supabase.from("post_comments").insert({ post_id: postId, user_id: user.id, text });
    // Send notification to post owner (if not self)
    if (postOwnerId !== user.id) {
      await supabase.from("notifications").insert({
        user_id: postOwnerId,
        from_user_id: user.id,
        type: "comment",
        post_id: postId,
        comment_text: text,
      });
    }
    setCommentTexts(prev => ({ ...prev, [postId]: "" }));
    // Auto-expand comments after posting
    setExpandedComments(prev => new Set(prev).add(postId));
    fetchPosts();
  };

  const deletePost = async (postId: string) => {
    await supabase.from("community_posts").delete().eq("id", postId);
    fetchPosts();
  };

  const deleteComment = async (commentId: string) => {
    await supabase.from("post_comments").delete().eq("id", commentId);
    fetchPosts();
  };

  const toggleComments = (postId: string) => {
    setExpandedComments(prev => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
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

  const Avatar = ({ url, name, size = "h-9 w-9" }: { url: string | null; name: string | null; size?: string }) => (
    url ? (
      <img src={url} alt="" className={`${size} rounded-full object-cover`} />
    ) : (
      <div className={`${size} rounded-full bg-gold/20 flex items-center justify-center text-xs font-bold text-gold`}>
        {getInitials(name)}
      </div>
    )
  );

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
            <Avatar url={profile?.avatar_url || null} name={profile?.display_name || null} size="h-8 w-8" />
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
              {/* Post header */}
              <div className="flex items-center gap-3 p-4 pb-2">
                <Avatar url={post.avatar_url} name={post.display_name} />
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

              {/* Post content */}
              <div className="px-4 pb-3">
                <p className="text-sm font-body leading-relaxed">{post.text}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 px-4 py-3 border-t border-border">
                <button
                  onClick={() => toggleLike(post.id, post.user_id, post.liked_by_me)}
                  className="flex items-center gap-1.5 text-sm font-body transition-colors"
                >
                  <Heart className={cn("h-4 w-4", post.liked_by_me ? "fill-red-400 text-red-400" : "text-muted-foreground")} />
                  <span className={cn(post.liked_by_me ? "text-red-400" : "text-muted-foreground")}>{post.likes_count}</span>
                </button>
                <button
                  onClick={() => toggleComments(post.id)}
                  className="flex items-center gap-1.5 text-sm font-body text-muted-foreground transition-colors hover:text-foreground"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>{post.comments_count}</span>
                  {post.comments_count > 0 && (
                    expandedComments.has(post.id) 
                      ? <ChevronUp className="h-3 w-3" /> 
                      : <ChevronDown className="h-3 w-3" />
                  )}
                </button>
              </div>

              {/* Comments section */}
              {expandedComments.has(post.id) && (
                <div className="border-t border-border animate-fade-in">
                  {/* Existing comments */}
                  {post.comments.length > 0 && (
                    <div className="px-4 pt-3 space-y-3">
                      {post.comments.map(comment => (
                        <div key={comment.id} className="flex gap-2.5 group">
                          <Avatar url={comment.avatar_url} name={comment.display_name} size="h-7 w-7" />
                          <div className="flex-1 min-w-0">
                            <div className="bg-muted/50 rounded-xl px-3 py-2">
                              <p className="text-xs font-body font-semibold">
                                {comment.user_id === user?.id ? "Você" : comment.display_name}
                              </p>
                              <p className="text-xs font-body text-foreground/80">{comment.text}</p>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 px-1">
                              <span className="text-[10px] text-muted-foreground font-body">{formatTime(comment.created_at)}</span>
                              {comment.user_id === user?.id && (
                                <button 
                                  onClick={() => deleteComment(comment.id)} 
                                  className="text-[10px] text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                                >
                                  excluir
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add comment input */}
                  <div className="flex items-center gap-2 p-3">
                    <Avatar url={profile?.avatar_url || null} name={profile?.display_name || null} size="h-7 w-7" />
                    <div className="flex-1 flex items-center bg-muted/50 rounded-full px-3 py-1.5">
                      <input
                        type="text"
                        value={commentTexts[post.id] || ""}
                        onChange={e => setCommentTexts(prev => ({ ...prev, [post.id]: e.target.value }))}
                        onKeyDown={e => { if (e.key === "Enter") addComment(post.id, post.user_id); }}
                        placeholder="Escreva um comentário..."
                        className="flex-1 bg-transparent text-xs font-body outline-none placeholder:text-muted-foreground"
                      />
                      <button
                        onClick={() => addComment(post.id, post.user_id)}
                        disabled={!commentTexts[post.id]?.trim()}
                        className="text-gold disabled:text-muted-foreground transition-colors ml-2"
                      >
                        <Send className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ComunidadePage;

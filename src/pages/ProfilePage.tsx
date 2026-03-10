import { useState, useEffect, useCallback, useRef } from "react";
import { ArrowLeft, Camera, Heart, MessageCircle, UserPlus, UserMinus, Pencil, Check, X, Image } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useOnlinePresence } from "@/hooks/useOnlinePresence";
import { Button } from "@/components/ui/button";
import { renderTextWithMentions } from "@/components/MentionInput";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProfileData {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  bio: string | null;
  created_at: string;
}

interface PostData {
  id: string;
  text: string;
  media_url: string | null;
  media_type: string | null;
  likes_count: number;
  created_at: string;
  comments_count: number;
}

const ProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const onlineUsers = useOnlinePresence(user?.id);

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Edit mode (own profile)
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const isMe = user?.id === userId;

  const fetchProfile = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    const [{ data: prof }, { count: followers }, { count: following }, { data: postsData }] = await Promise.all([
      supabase.from("profiles").select("user_id, display_name, avatar_url, cover_url, bio, created_at").eq("user_id", userId).single(),
      supabase.from("user_follows").select("*", { count: "exact", head: true }).eq("following_id", userId),
      supabase.from("user_follows").select("*", { count: "exact", head: true }).eq("follower_id", userId),
      supabase.from("community_posts").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    ]);

    if (prof) {
      setProfile(prof as ProfileData);
      setEditName(prof.display_name || "");
      setEditBio(prof.bio || "");
    }
    setFollowersCount(followers || 0);
    setFollowingCount(following || 0);

    if (postsData) {
      // Get comment counts
      const postIds = postsData.map((p: any) => p.id);
      const { data: commentsData } = await supabase
        .from("post_comments")
        .select("post_id")
        .in("post_id", postIds.length > 0 ? postIds : ["00000000-0000-0000-0000-000000000000"]);

      const commentCounts = new Map<string, number>();
      (commentsData || []).forEach((c: any) => {
        commentCounts.set(c.post_id, (commentCounts.get(c.post_id) || 0) + 1);
      });

      setPosts(postsData.map((p: any) => ({
        id: p.id,
        text: p.text,
        media_url: p.media_url,
        media_type: p.media_type,
        likes_count: p.likes_count,
        created_at: p.created_at,
        comments_count: commentCounts.get(p.id) || 0,
      })));
    }

    // Check follow status
    if (user && userId !== user.id) {
      const { data: followData } = await supabase
        .from("user_follows")
        .select("id")
        .eq("follower_id", user.id)
        .eq("following_id", userId)
        .single();
      setIsFollowing(!!followData);
    }

    setLoading(false);
  }, [userId, user]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const toggleFollow = async () => {
    if (!user || !userId) return;
    if (isFollowing) {
      await supabase.from("user_follows").delete().eq("follower_id", user.id).eq("following_id", userId);
      setIsFollowing(false);
      setFollowersCount(prev => Math.max(0, prev - 1));
    } else {
      await supabase.from("user_follows").insert({ follower_id: user.id, following_id: userId });
      setIsFollowing(true);
      setFollowersCount(prev => prev + 1);
      // Notify
      const { data: latestPost } = await supabase.from("community_posts").select("id").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).single();
      if (latestPost) {
        await supabase.from("notifications").insert({
          user_id: userId, from_user_id: user.id, type: "follow", post_id: latestPost.id,
        });
      }
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return;
    setUploadingAvatar(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      await supabase.from("profiles").update({ avatar_url: data.publicUrl }).eq("user_id", user.id);
      setProfile(prev => prev ? { ...prev, avatar_url: data.publicUrl } : null);
    }
    setUploadingAvatar(false);
  };

  const uploadCover = async (file: File) => {
    if (!user) return;
    setUploadingCover(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/cover-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      await supabase.from("profiles").update({ cover_url: data.publicUrl }).eq("user_id", user.id);
      setProfile(prev => prev ? { ...prev, cover_url: data.publicUrl } : null);
    }
    setUploadingCover(false);
  };

  const saveProfile = async () => {
    if (!user) return;
    await supabase.from("profiles").update({
      display_name: editName.trim() || null,
      bio: editBio.trim() || null,
    }).eq("user_id", user.id);
    setProfile(prev => prev ? { ...prev, display_name: editName.trim(), bio: editBio.trim() } : null);
    setEditing(false);
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-gold border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground font-body">Perfil não encontrado</p>
        <Button variant="outline" onClick={() => navigate(-1)}>Voltar</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-6">
      {/* Cover photo */}
      <div className="relative h-44 bg-gradient-to-br from-gold/20 via-gold/10 to-background overflow-hidden">
        {profile.cover_url && (
          <img src={profile.cover_url} alt="" className="w-full h-full object-cover" />
        )}

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-10 left-4 p-2 bg-card/80 backdrop-blur-sm rounded-full text-foreground hover:bg-card transition-colors z-10"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        {/* Cover edit button */}
        {isMe && (
          <button
            onClick={() => coverInputRef.current?.click()}
            className="absolute bottom-3 right-3 p-2 bg-card/80 backdrop-blur-sm rounded-full text-foreground hover:bg-card transition-colors z-10"
          >
            {uploadingCover ? (
              <div className="h-4 w-4 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
          </button>
        )}
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) uploadCover(f); e.target.value = ""; }}
        />
      </div>

      {/* Profile info */}
      <div className="px-5 -mt-12 relative z-10">
        {/* Avatar */}
        <div className="relative inline-block">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="h-24 w-24 rounded-full object-cover border-4 border-card shadow-lg" />
          ) : (
            <div className="h-24 w-24 rounded-full bg-gold/20 flex items-center justify-center text-2xl font-bold text-gold border-4 border-card shadow-lg">
              {getInitials(profile.display_name)}
            </div>
          )}
          {/* Online indicator */}
          {userId && (
            <span className={cn(
              "absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-card",
              onlineUsers.has(userId) ? "bg-emerald-400" : "bg-muted-foreground/40"
            )} />
          )}
          {/* Avatar edit */}
          {isMe && (
            <button
              onClick={() => avatarInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-1.5 bg-gold rounded-full text-primary-foreground shadow-sm"
            >
              {uploadingAvatar ? (
                <div className="h-3 w-3 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera className="h-3 w-3" />
              )}
            </button>
          )}
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) uploadAvatar(f); e.target.value = ""; }}
          />
        </div>

        {/* Name & bio */}
        <div className="mt-3">
          {editing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="w-full bg-muted/50 text-lg font-display font-bold rounded-xl px-3 py-2 outline-none border border-border focus:border-gold"
                placeholder="Seu nome"
              />
              <textarea
                value={editBio}
                onChange={e => setEditBio(e.target.value)}
                className="w-full bg-muted/50 text-sm font-body rounded-xl px-3 py-2 outline-none border border-border focus:border-gold resize-none"
                placeholder="Sua bio..."
                rows={3}
              />
              <div className="flex gap-2">
                <Button variant="gold" size="sm" onClick={saveProfile}>
                  <Check className="h-3.5 w-3.5 mr-1" /> Salvar
                </Button>
                <Button variant="outline" size="sm" onClick={() => setEditing(false)}>
                  <X className="h-3.5 w-3.5 mr-1" /> Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-display font-bold">{profile.display_name || "Usuária"}</h1>
                {isMe && (
                  <button onClick={() => setEditing(true)} className="p-1 text-muted-foreground hover:text-gold transition-colors">
                    <Pencil className="h-4 w-4" />
                  </button>
                )}
              </div>
              {profile.bio && (
                <p className="text-sm font-body text-muted-foreground mt-1">{profile.bio}</p>
              )}
              {!profile.bio && isMe && (
                <button onClick={() => setEditing(true)} className="text-xs font-body text-muted-foreground mt-1 hover:text-gold transition-colors">
                  + Adicionar bio
                </button>
              )}
            </>
          )}
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-6 mt-4">
          <div className="text-center">
            <p className="text-lg font-display font-bold">{posts.length}</p>
            <p className="text-[10px] font-body text-muted-foreground uppercase tracking-wider">Posts</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-display font-bold">{followersCount}</p>
            <p className="text-[10px] font-body text-muted-foreground uppercase tracking-wider">Seguidoras</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-display font-bold">{followingCount}</p>
            <p className="text-[10px] font-body text-muted-foreground uppercase tracking-wider">Seguindo</p>
          </div>
        </div>

        {/* Follow button */}
        {!isMe && (
          <button
            onClick={toggleFollow}
            className={cn(
              "mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-body font-semibold transition-all",
              isFollowing
                ? "bg-gold/10 text-gold border border-gold/30 hover:bg-gold/20"
                : "bg-gold text-primary-foreground hover:bg-gold/90"
            )}
          >
            {isFollowing ? <><UserMinus className="h-4 w-4" /> Seguindo</> : <><UserPlus className="h-4 w-4" /> Seguir</>}
          </button>
        )}

        {/* Posts section */}
        <div className="mt-6">
          <h2 className="text-sm font-display font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Publicações
          </h2>

          {posts.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-sm text-muted-foreground font-body">
                {isMe ? "Você ainda não publicou nada ✨" : "Nenhuma publicação ainda"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map(post => (
                <div key={post.id} className="bg-card rounded-2xl border border-border overflow-hidden">
                  {/* Post content */}
                  <div className="p-4">
                    {/* Text - hide default media labels */}
                    {post.text && post.text !== "GIF" && post.text !== "✨" && !post.text.startsWith("📎") && (
                      <p className="text-sm font-body leading-relaxed">{renderTextWithMentions(post.text)}</p>
                    )}

                    {/* Image */}
                    {post.media_url && post.media_type === "image" && (
                      <img src={post.media_url} alt="" className="mt-2 rounded-xl w-full max-h-80 object-cover" loading="lazy" />
                    )}

                    {/* Emoji sticker */}
                    {post.media_url && post.media_type === "sticker" && post.media_url.startsWith("emoji:") && (
                      <div className="mt-2 text-center">
                        <span className="text-7xl">{post.media_url.replace("emoji:", "")}</span>
                      </div>
                    )}

                    {/* GIF or animated sticker */}
                    {post.media_url && (post.media_type === "gif" || (post.media_type === "sticker" && !post.media_url.startsWith("emoji:"))) && (
                      <img src={post.media_url} alt="GIF" className="mt-2 rounded-xl max-w-[280px] max-h-60" loading="lazy" />
                    )}

                    {/* Document */}
                    {post.media_url && post.media_type === "document" && (
                      <a href={post.media_url} target="_blank" rel="noopener noreferrer"
                        className="mt-2 flex items-center gap-2 bg-muted/50 rounded-xl px-3 py-2 text-sm font-body text-foreground hover:bg-muted/70 transition-colors">
                        📎 Documento anexado
                      </a>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center gap-4 px-4 py-2.5 border-t border-border text-muted-foreground">
                    <div className="flex items-center gap-1.5 text-xs font-body">
                      <Heart className="h-3.5 w-3.5" />
                      <span>{post.likes_count}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-body">
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>{post.comments_count}</span>
                    </div>
                    <span className="ml-auto text-[10px] font-body">{formatTime(post.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

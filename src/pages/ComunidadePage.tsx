import { useState, useEffect, useCallback, useRef } from "react";
import { Heart, Send, Trash2, MessageCircle, ChevronDown, ChevronUp, Image, Paperclip, Camera, Mic, X, Play, Pause, FileText, Pencil, Check } from "lucide-react";
import EmojiPicker from "@/components/EmojiPicker";
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
  media_url: string | null;
  media_type: string | null;
}

const ComunidadePage = () => {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<PostWithProfile[]>([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});

  // Edit state
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editPostText, setEditPostText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState("");

  // Media attachment state
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Audio playback state for feed
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const fetchPosts = useCallback(async () => {
    if (!user) return;

    const { data: postsData } = await supabase
      .from("community_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (!postsData) return;

    const postUserIds = [...new Set(postsData.map((p: any) => p.user_id))];
    const postIds = postsData.map((p: any) => p.id);

    const { data: commentsData } = await supabase
      .from("post_comments")
      .select("*")
      .in("post_id", postIds.length > 0 ? postIds : ["00000000-0000-0000-0000-000000000000"])
      .order("created_at", { ascending: true });

    const commentUserIds = (commentsData || []).map((c: any) => c.user_id);
    const allUserIds = [...new Set([...postUserIds, ...commentUserIds])];

    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name, avatar_url")
      .in("user_id", allUserIds.length > 0 ? allUserIds : ["00000000-0000-0000-0000-000000000000"]);

    const { data: myLikes } = await supabase
      .from("post_likes")
      .select("post_id")
      .eq("user_id", user.id);

    const likedPostIds = new Set((myLikes || []).map((l: any) => l.post_id));
    const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));

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
        media_url: post.media_url || null,
        media_type: post.media_type || null,
      };
    });

    setPosts(enrichedPosts);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  useEffect(() => {
    const channel = supabase
      .channel("community-feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "community_posts" }, () => fetchPosts())
      .on("postgres_changes", { event: "*", schema: "public", table: "post_comments" }, () => fetchPosts())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchPosts]);

  useEffect(() => {
    const pending = sessionStorage.getItem("pending-conquista");
    if (pending && user) {
      sessionStorage.removeItem("pending-conquista");
      supabase.from("community_posts").insert({ user_id: user.id, text: pending }).then(() => fetchPosts());
    }
  }, [user, fetchPosts]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) { audioRef.current.pause(); }
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    };
  }, []);

  const uploadMedia = async (file: File): Promise<{ url: string; type: string } | null> => {
    if (!user) return null;
    const ext = file.name.split(".").pop() || "bin";
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("community-media").upload(path, file);
    if (error) { console.error("Upload error:", error); return null; }
    const { data } = supabase.storage.from("community-media").getPublicUrl(path);

    let type = "document";
    if (file.type.startsWith("image/")) type = "image";
    else if (file.type.startsWith("audio/")) type = "audio";
    return { url: data.publicUrl, type };
  };

  const handleFileSelect = (file: File, type: string) => {
    setMediaFile(file);
    setMediaType(type);
    if (type === "image") {
      const reader = new FileReader();
      reader.onload = (e) => setMediaPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else if (type === "audio") {
      setMediaPreview("audio");
    } else {
      setMediaPreview("document");
    }
  };

  const clearMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
  };

  // Audio recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const file = new File([blob], `audio-${Date.now()}.webm`, { type: "audio/webm" });
        handleFileSelect(file, "audio");
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access denied:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  };

  const formatRecordingTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const createPost = async () => {
    if ((!newPost.trim() && !mediaFile) || !user) return;
    setUploading(true);

    let media: { url: string; type: string } | null = null;
    if (mediaFile) {
      media = await uploadMedia(mediaFile);
    }

    await supabase.from("community_posts").insert({
      user_id: user.id,
      text: newPost.trim() || (media ? `📎 ${media.type === "image" ? "Imagem" : media.type === "audio" ? "Áudio" : "Documento"}` : ""),
      media_url: media?.url || null,
      media_type: media?.type || null,
    });

    setNewPost("");
    clearMedia();
    setUploading(false);
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
      if (postOwnerId !== user.id) {
        await supabase.from("notifications").insert({
          user_id: postOwnerId, from_user_id: user.id, type: "like", post_id: postId,
        });
      }
    }
    fetchPosts();
  };

  const addComment = async (postId: string, postOwnerId: string) => {
    const text = commentTexts[postId]?.trim();
    if (!text || !user) return;
    await supabase.from("post_comments").insert({ post_id: postId, user_id: user.id, text });
    if (postOwnerId !== user.id) {
      await supabase.from("notifications").insert({
        user_id: postOwnerId, from_user_id: user.id, type: "comment", post_id: postId, comment_text: text,
      });
    }
    setCommentTexts(prev => ({ ...prev, [postId]: "" }));
    setExpandedComments(prev => new Set(prev).add(postId));
    fetchPosts();
  };

  const deletePost = async (postId: string) => {
    await supabase.from("community_posts").delete().eq("id", postId);
    fetchPosts();
  };

  const startEditPost = (post: PostWithProfile) => {
    setEditingPostId(post.id);
    setEditPostText(post.text);
  };

  const saveEditPost = async () => {
    if (!editingPostId || !editPostText.trim()) return;
    await supabase.from("community_posts").update({ text: editPostText.trim() }).eq("id", editingPostId);
    setEditingPostId(null);
    setEditPostText("");
    fetchPosts();
  };

  const deleteComment = async (commentId: string) => {
    await supabase.from("post_comments").delete().eq("id", commentId);
    fetchPosts();
  };

  const startEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditCommentText(comment.text);
  };

  const saveEditComment = async () => {
    if (!editingCommentId || !editCommentText.trim()) return;
    await supabase.from("post_comments").update({ text: editCommentText.trim() }).eq("id", editingCommentId);
    setEditingCommentId(null);
    setEditCommentText("");
    fetchPosts();
  };

  const toggleComments = (postId: string) => {
    setExpandedComments(prev => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId); else next.add(postId);
      return next;
    });
  };

  const toggleAudioPlayback = (url: string) => {
    if (playingAudio === url) {
      audioRef.current?.pause();
      setPlayingAudio(null);
    } else {
      if (audioRef.current) audioRef.current.pause();
      const audio = new Audio(url);
      audio.onended = () => setPlayingAudio(null);
      audio.play();
      audioRef.current = audio;
      setPlayingAudio(url);
    }
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

  const MediaPreviewBadge = () => {
    if (!mediaPreview) return null;
    return (
      <div className="relative inline-flex items-center gap-2 bg-muted/60 rounded-xl px-3 py-2 text-xs font-body text-foreground">
        {mediaType === "image" && mediaPreview !== "audio" && mediaPreview !== "document" ? (
          <img src={mediaPreview} alt="preview" className="h-16 w-16 rounded-lg object-cover" />
        ) : mediaType === "audio" ? (
          <div className="flex items-center gap-2">
            <Mic className="h-4 w-4 text-gold" />
            <span>Áudio gravado</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-gold" />
            <span className="truncate max-w-[150px]">{mediaFile?.name}</span>
          </div>
        )}
        <button onClick={clearMedia} className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full p-0.5">
          <X className="h-3 w-3" />
        </button>
      </div>
    );
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
            <Avatar url={profile?.avatar_url || null} name={profile?.display_name || null} size="h-8 w-8" />
            <textarea
              value={newPost}
              onChange={e => setNewPost(e.target.value)}
              placeholder="Compartilhe com as girls..."
              rows={2}
              className="flex-1 bg-transparent text-sm font-body outline-none resize-none placeholder:text-muted-foreground"
            />
          </div>

          {/* Media preview */}
          {mediaPreview && (
            <div className="pl-11">
              <MediaPreviewBadge />
            </div>
          )}

          {/* Recording indicator */}
          {isRecording && (
            <div className="pl-11 flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-destructive animate-pulse" />
              <span className="text-sm font-body text-destructive font-medium">
                Gravando {formatRecordingTime(recordingTime)}
              </span>
              <Button variant="destructive" size="sm" onClick={stopRecording} className="h-7 text-xs">
                Parar
              </Button>
            </div>
          )}

          {/* Action bar */}
          <div className="flex items-center justify-between pl-11">
            <div className="flex items-center gap-1">
              {/* Image */}
              <button
                onClick={() => imageInputRef.current?.click()}
                className="p-2 rounded-lg text-muted-foreground hover:text-gold hover:bg-gold/10 transition-colors"
                title="Anexar imagem"
              >
                <Image className="h-4.5 w-4.5" />
              </button>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) handleFileSelect(f, "image");
                  e.target.value = "";
                }}
              />

              {/* Camera */}
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="p-2 rounded-lg text-muted-foreground hover:text-gold hover:bg-gold/10 transition-colors"
                title="Tirar foto"
              >
                <Camera className="h-4.5 w-4.5" />
              </button>
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) handleFileSelect(f, "image");
                  e.target.value = "";
                }}
              />

              {/* Document */}
              <button
                onClick={() => docInputRef.current?.click()}
                className="p-2 rounded-lg text-muted-foreground hover:text-gold hover:bg-gold/10 transition-colors"
                title="Anexar documento"
              >
                <Paperclip className="h-4.5 w-4.5" />
              </button>
              <input
                ref={docInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
                className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) handleFileSelect(f, "document");
                  e.target.value = "";
                }}
              />

              {/* Audio record */}
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  isRecording
                    ? "text-destructive bg-destructive/10"
                    : "text-muted-foreground hover:text-gold hover:bg-gold/10"
                )}
                title={isRecording ? "Parar gravação" : "Gravar áudio"}
              >
                <Mic className="h-4.5 w-4.5" />
              </button>

              {/* Emoji picker */}
              <EmojiPicker onSelect={(emoji) => setNewPost(prev => prev + emoji)} />
            </div>

            <Button
              variant="gold"
              size="sm"
              onClick={createPost}
              disabled={(!newPost.trim() && !mediaFile) || uploading}
            >
              {uploading ? (
                <span className="flex items-center gap-1.5">
                  <div className="h-3 w-3 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Enviando...
                </span>
              ) : (
                <><Send className="h-3.5 w-3.5 mr-1" /> Postar</>
              )}
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
                  <div className="flex items-center gap-1">
                    {editingPostId === post.id ? (
                      <>
                        <button onClick={saveEditPost} className="text-gold hover:text-gold/80 transition-colors p-1" title="Salvar">
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => setEditingPostId(null)} className="text-muted-foreground hover:text-foreground transition-colors p-1" title="Cancelar">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEditPost(post)} className="text-muted-foreground hover:text-gold transition-colors p-1" title="Editar">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => deletePost(post.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1" title="Excluir">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Post content */}
              <div className="px-4 pb-3">
                {editingPostId === post.id ? (
                  <textarea
                    value={editPostText}
                    onChange={e => setEditPostText(e.target.value)}
                    className="w-full bg-muted/50 text-sm font-body rounded-xl px-3 py-2 outline-none resize-none border border-gold/30 focus:border-gold"
                    rows={3}
                    autoFocus
                  />
                ) : (
                  <p className="text-sm font-body leading-relaxed">{post.text}</p>
                )}

                {/* Post media */}
                {post.media_url && post.media_type === "image" && (
                  <img
                    src={post.media_url}
                    alt="Post"
                    className="mt-3 rounded-xl w-full max-h-80 object-cover"
                    loading="lazy"
                  />
                )}

                {post.media_url && post.media_type === "audio" && (
                  <button
                    onClick={() => toggleAudioPlayback(post.media_url!)}
                    className="mt-3 flex items-center gap-3 bg-muted/50 rounded-xl px-4 py-3 w-full hover:bg-muted/70 transition-colors"
                  >
                    {playingAudio === post.media_url ? (
                      <Pause className="h-5 w-5 text-gold" />
                    ) : (
                      <Play className="h-5 w-5 text-gold" />
                    )}
                    <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
                      <div className={cn(
                        "h-full bg-gold rounded-full transition-all",
                        playingAudio === post.media_url ? "w-1/2 animate-pulse" : "w-0"
                      )} />
                    </div>
                    <Mic className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}

                {post.media_url && post.media_type === "document" && (
                  <a
                    href={post.media_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 flex items-center gap-3 bg-muted/50 rounded-xl px-4 py-3 hover:bg-muted/70 transition-colors"
                  >
                    <FileText className="h-5 w-5 text-gold" />
                    <span className="text-sm font-body text-foreground">Documento anexado</span>
                  </a>
                )}
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
                              {editingCommentId === comment.id ? (
                                <div className="flex items-center gap-1 mt-1">
                                  <input
                                    type="text"
                                    value={editCommentText}
                                    onChange={e => setEditCommentText(e.target.value)}
                                    onKeyDown={e => { if (e.key === "Enter") saveEditComment(); }}
                                    className="flex-1 bg-transparent text-xs font-body outline-none border-b border-gold/30 focus:border-gold"
                                    autoFocus
                                  />
                                  <button onClick={saveEditComment} className="text-gold p-0.5"><Check className="h-3 w-3" /></button>
                                  <button onClick={() => setEditingCommentId(null)} className="text-muted-foreground p-0.5"><X className="h-3 w-3" /></button>
                                </div>
                              ) : (
                                <p className="text-xs font-body text-foreground/80">{comment.text}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 px-1">
                              <span className="text-[10px] text-muted-foreground font-body">{formatTime(comment.created_at)}</span>
                              {comment.user_id === user?.id && editingCommentId !== comment.id && (
                                <>
                                  <button
                                    onClick={() => startEditComment(comment)}
                                    className="text-[10px] text-muted-foreground hover:text-gold transition-colors opacity-0 group-hover:opacity-100"
                                  >
                                    editar
                                  </button>
                                  <button
                                    onClick={() => deleteComment(comment.id)}
                                    className="text-[10px] text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                                  >
                                    excluir
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

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
                      <EmojiPicker
                        size="sm"
                        onSelect={(emoji) => setCommentTexts(prev => ({ ...prev, [post.id]: (prev[post.id] || "") + emoji }))}
                      />
                      <button
                        onClick={() => addComment(post.id, post.user_id)}
                        disabled={!commentTexts[post.id]?.trim()}
                        className="text-gold disabled:text-muted-foreground transition-colors ml-1"
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

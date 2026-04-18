import { useState, useEffect, useCallback, useRef } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Heart, Send, Trash2, MessageCircle, ChevronDown, ChevronUp, Image, Paperclip, Camera, Mic, X, Play, Pause, FileText, Pencil, Check, Smile, Bell, UserPlus, UserMinus, Settings, Mail, Hash, Eye } from "lucide-react";
import EmojiPicker from "@/components/EmojiPicker";
import StoryBar from "@/components/stories/StoryBar";
import MentionInput, { renderTextWithMentions } from "@/components/MentionInput";
import { useOnlinePresence } from "@/hooks/useOnlinePresence";
import GifStickerPicker from "@/components/GifStickerPicker";
import NotificationsPanel from "@/components/NotificationsPanel";
import DirectMessages from "@/components/community/DirectMessages";
import ChatRooms from "@/components/community/ChatRooms";

import { sendNotification, requestNotificationPermission } from "@/lib/notifications";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Leaderboard from "@/components/Leaderboard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
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
  views_count: number;
  viewers?: { user_id: string; display_name: string | null; avatar_url: string | null }[];
}

const ComunidadePage = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<PostWithProfile[]>([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});
  const [allUsers, setAllUsers] = useState<{ user_id: string; display_name: string | null; avatar_url: string | null }[]>([]);

  // Follow system
  const [followingSet, setFollowingSet] = useState<Set<string>>(new Set());
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [viewingProfileUserId, setViewingProfileUserId] = useState<string | null>(null);
  const [showDMs, setShowDMs] = useState(false);
  const [showChatRooms, setShowChatRooms] = useState(false);
  const [dmTargetUserId, setDmTargetUserId] = useState<string | null>(null);
  const [viewingPostViewers, setViewingPostViewers] = useState<string | null>(null);

  // Online presence
  const onlineUsers = useOnlinePresence(user?.id);

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
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [postStickerPickerId, setPostStickerPickerId] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Fetch all users for mention suggestions + follows + unread count
  useEffect(() => {
    if (!user) return;
    const fetchUsers = async () => {
      const { data } = await supabase.from("profiles_public" as any).select("user_id, display_name, avatar_url");
      if (data) setAllUsers((data as any).filter((u: any) => u.user_id !== user?.id));
    };
    const fetchFollows = async () => {
      const { data } = await supabase.from("user_follows").select("following_id").eq("follower_id", user.id);
      if (data) setFollowingSet(new Set(data.map((f: any) => f.following_id)));
    };
    const fetchUnread = async () => {
      const { count } = await supabase.from("notifications").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("read", false);
      setUnreadCount(count || 0);
    };
    fetchUsers();
    fetchFollows();
    fetchUnread();
  }, [user]);

  const fetchPosts = useCallback(async () => {
    if (!user) return;

    // Parallel fetch: posts, my likes
    const [postsRes, myLikesRes] = await Promise.all([
      supabase.from("community_posts").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("post_likes").select("post_id").eq("user_id", user.id),
    ]);

    const postsData = postsRes.data;
    if (!postsData) return;

    const postUserIds = [...new Set(postsData.map((p: any) => p.user_id))];
    const postIds = postsData.map((p: any) => p.id);
    const safePostIds = postIds.length > 0 ? postIds : ["00000000-0000-0000-0000-000000000000"];

    // Parallel fetch: comments, profiles, view counts
    const [commentsRes, viewsRes] = await Promise.all([
      supabase.from("post_comments").select("*").in("post_id", safePostIds).order("created_at", { ascending: true }),
      supabase.from("post_views").select("post_id, viewer_id").in("post_id", safePostIds),
    ]);

    const commentsData = commentsRes.data || [];
    const commentUserIds = commentsData.map((c: any) => c.user_id);
    const allUserIds = [...new Set([...postUserIds, ...commentUserIds])];
    const safeUserIds = allUserIds.length > 0 ? allUserIds : ["00000000-0000-0000-0000-000000000000"];

    const { data: profiles } = await supabase
      .from("profiles_public" as any)
      .select("user_id, display_name, avatar_url")
      .in("user_id", safeUserIds);

    const likedPostIds = new Set((myLikesRes.data || []).map((l: any) => l.post_id));
    const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));

    // Build view counts from single query
    const viewCountMap = new Map<string, number>();
    const viewersMap = new Map<string, { user_id: string; display_name: string | null; avatar_url: string | null }[]>();
    const viewsData = viewsRes.data || [];
    for (const v of viewsData) {
      viewCountMap.set(v.post_id, (viewCountMap.get(v.post_id) || 0) + 1);
      if (!viewersMap.has(v.post_id)) viewersMap.set(v.post_id, []);
      const prof = profileMap.get(v.viewer_id);
      if (prof) viewersMap.get(v.post_id)!.push(prof);
    }

    // Track views in background (non-blocking)
    if (postIds.length > 0) {
      Promise.all(postIds.map(pid =>
        supabase.from("post_views").upsert(
          { post_id: pid, viewer_id: user.id },
          { onConflict: "post_id,viewer_id" }
        )
      ));
    }

    const commentsByPost = new Map<string, Comment[]>();
    commentsData.forEach((c: any) => {
      const prof = profileMap.get(c.user_id);
      const comment: Comment = {
        id: c.id, user_id: c.user_id, text: c.text, created_at: c.created_at,
        display_name: prof?.display_name || "Usuária", avatar_url: prof?.avatar_url || null,
      };
      if (!commentsByPost.has(c.post_id)) commentsByPost.set(c.post_id, []);
      commentsByPost.get(c.post_id)!.push(comment);
    });

    const enrichedPosts: PostWithProfile[] = postsData.map((post: any) => {
      const prof = profileMap.get(post.user_id);
      const comments = commentsByPost.get(post.id) || [];
      return {
        id: post.id, user_id: post.user_id, text: post.text, likes_count: post.likes_count,
        created_at: post.created_at, display_name: prof?.display_name || "Usuária",
        avatar_url: prof?.avatar_url || null, liked_by_me: likedPostIds.has(post.id),
        comments, comments_count: comments.length,
        media_url: post.media_url || null, media_type: post.media_type || null,
        views_count: viewCountMap.get(post.id) || 0,
        viewers: (viewersMap.get(post.id) || []).slice(0, 50),
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

  // Realtime push notifications for likes, comments, mentions
  useEffect(() => {
    if (!user) return;
    requestNotificationPermission();

    const channel = supabase
      .channel("my-push-notifications")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${user.id}`,
      }, async (payload: any) => {
        const n = payload.new;
        if (!n || n.from_user_id === user.id) return;

        // Fetch from_user name
        const { data: prof } = await supabase
          .from("profiles_public" as any)
          .select("display_name")
          .eq("user_id", n.from_user_id)
          .single();
        const name = (prof as any)?.display_name || "Alguém";

        if (n.type === "like") {
          sendNotification("❤️ Curtida", `${name} curtiu seu post!`, `like-${n.id}`);
        } else if (n.type === "comment") {
          sendNotification("💬 Comentário", `${name} comentou: "${(n.comment_text || "").slice(0, 60)}"`, `comment-${n.id}`);
        } else if (n.type === "mention") {
          sendNotification("📣 Menção", `${name} mencionou você: "${(n.comment_text || "").slice(0, 60)}"`, `mention-${n.id}`);
        } else if (n.type === "welcome") {
          sendNotification("🦋 Nova integrante!", `${name} entrou para o Gloow Up Club!`, `welcome-${n.id}`);
        } else if (n.type === "new_post") {
          sendNotification("📝 Novo post!", `${name} publicou: "${(n.comment_text || "").slice(0, 60)}"`, `new_post-${n.id}`);
        } else if (n.type === "follow") {
          sendNotification("👤 Nova seguidora!", `${name} começou a te seguir!`, `follow-${n.id}`);
        }
        // Update unread count
        setUnreadCount(prev => prev + 1);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

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

  const handleStickerGifSelect = (url: string, type: "gif" | "sticker") => {
    setShowStickerPicker(false);
    // For emoji stickers, send as text post with large emoji
    if (url.startsWith("emoji:")) {
      const emoji = url.replace("emoji:", "");
      // Set as media so it renders large
      setMediaFile(null);
      setMediaPreview(url);
      setMediaType("sticker");
      return;
    }
    // For GIF/animated sticker URLs
    setMediaFile(null);
    setMediaPreview(url);
    setMediaType(type);
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

  // Extract mentioned user_ids from text
  const extractMentionedUserIds = (text: string): string[] => {
    const mentions = text.match(/@(\S+(?:\s\S+)?)/g);
    if (!mentions) return [];
    const ids: string[] = [];
    mentions.forEach(m => {
      const name = m.slice(1).trim();
      const found = allUsers.find(u => u.display_name?.toLowerCase() === name.toLowerCase());
      if (found) ids.push(found.user_id);
    });
    return [...new Set(ids)];
  };

  // Follow/unfollow
  const toggleFollow = async (targetUserId: string) => {
    if (!user) return;
    const isFollowing = followingSet.has(targetUserId);
    if (isFollowing) {
      await supabase.from("user_follows").delete().eq("follower_id", user.id).eq("following_id", targetUserId);
      setFollowingSet(prev => { const n = new Set(prev); n.delete(targetUserId); return n; });
    } else {
      await supabase.from("user_follows").insert({ follower_id: user.id, following_id: targetUserId });
      setFollowingSet(prev => new Set(prev).add(targetUserId));
      // Get a valid post_id for the notification (use the user's latest post or a dummy)
      const { data: latestPost } = await supabase.from("community_posts").select("id").eq("user_id", targetUserId).order("created_at", { ascending: false }).limit(1).single();
      const postId = latestPost?.id;
      if (postId) {
        await supabase.from("notifications").insert({
          user_id: targetUserId, from_user_id: user.id, type: "follow", post_id: postId,
        });
      }
    }
  };

  // Send mention notifications
  const sendMentionNotifications = async (text: string, postId: string) => {
    if (!user) return;
    const mentionedIds = extractMentionedUserIds(text);
    for (const uid of mentionedIds) {
      if (uid !== user.id) {
        await supabase.from("notifications").insert({
          user_id: uid,
          from_user_id: user.id,
          type: "mention",
          post_id: postId,
          comment_text: text.slice(0, 100),
        });
      }
    }
  };

  const createPost = async () => {
    const hasSticker = mediaPreview && (mediaType === "gif" || mediaType === "sticker") && !mediaFile;
    if ((!newPost.trim() && !mediaFile && !hasSticker) || !user) return;
    setUploading(true);

    let mediaUrl: string | null = null;
    let finalMediaType: string | null = null;

    if (mediaFile) {
      const media = await uploadMedia(mediaFile);
      if (media) { mediaUrl = media.url; finalMediaType = media.type; }
    } else if (hasSticker && mediaPreview) {
      // Sticker or GIF URL (no file upload needed)
      mediaUrl = mediaPreview;
      finalMediaType = mediaType;
    }

    const postText = newPost.trim() || (mediaUrl
      ? (finalMediaType === "gif" ? "GIF" : finalMediaType === "sticker" ? "✨" : `📎 ${finalMediaType === "image" ? "Imagem" : finalMediaType === "audio" ? "Áudio" : "Documento"}`)
      : "");

    const { data: insertedPost } = await supabase.from("community_posts").insert({
      user_id: user.id,
      text: postText,
      media_url: mediaUrl,
      media_type: finalMediaType,
    }).select("id").single();

    // Send mention notifications + notify all users about new post
    if (insertedPost) {
      await sendMentionNotifications(postText, insertedPost.id);

      // Notify all other users about the new post
      const mentionedIds = extractMentionedUserIds(postText);
      for (const u of allUsers) {
        if (u.user_id !== user.id && !mentionedIds.includes(u.user_id)) {
          await supabase.from("notifications").insert({
            user_id: u.user_id,
            from_user_id: user.id,
            type: "new_post",
            post_id: insertedPost.id,
            comment_text: postText.slice(0, 100),
          });
        }
      }
    }

    setNewPost("");
    clearMedia();
    setUploading(false);
    fetchPosts();
  };

  const toggleLike = async (postId: string, postOwnerId: string, currentlyLiked: boolean) => {
    if (!user) return;
    const { data: liked } = await supabase.rpc("toggle_post_like", { _post_id: postId });
    if (liked && postOwnerId !== user.id) {
      await supabase.from("notifications").insert({
        user_id: postOwnerId, from_user_id: user.id, type: "like", post_id: postId,
      });
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
    // Send mention notifications from comment
    await sendMentionNotifications(text, postId);

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

  const handlePostStickerReaction = async (postId: string, postOwnerId: string, url: string, type: "gif" | "sticker") => {
    if (!user) return;
    setPostStickerPickerId(null);
    // Post a comment with the sticker/gif as text marker
    const stickerText = type === "sticker" && url.startsWith("emoji:") 
      ? url.replace("emoji:", "") 
      : `[${type}:${url}]`;
    await supabase.from("post_comments").insert({ post_id: postId, user_id: user.id, text: stickerText });
    if (postOwnerId !== user.id) {
      await supabase.from("notifications").insert({
        user_id: postOwnerId, from_user_id: user.id, type: "comment", post_id: postId, comment_text: `reagiu com ${type === "gif" ? "um GIF" : "uma figurinha"}`,
      });
    }
    setExpandedComments(prev => new Set(prev).add(postId));
    fetchPosts();
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

  const Avatar = ({ url, name, size = "h-9 w-9", userId, clickable = false }: { url: string | null; name: string | null; size?: string; userId?: string; clickable?: boolean }) => (
    <div
      className={cn("relative shrink-0", clickable && "cursor-pointer")}
      onClick={clickable && userId ? () => navigate(`/perfil/${userId}`) : undefined}
    >
      {url ? (
        <img src={url} alt="" className={`${size} rounded-full object-cover`} />
      ) : (
        <div className={`${size} rounded-full bg-gold/20 flex items-center justify-center text-xs font-bold text-gold`}>
          {getInitials(name)}
        </div>
      )}
      {userId && (
        <span
          className={cn(
            "absolute -bottom-0.5 -right-0.5 block rounded-full border-2 border-card",
            size.includes("7") || size.includes("8") ? "h-2.5 w-2.5" : "h-3 w-3",
            onlineUsers.has(userId) ? "bg-emerald-400" : "bg-muted-foreground/40"
          )}
        />
      )}
    </div>
  );

  const MediaPreviewBadge = () => {
    if (!mediaPreview) return null;
    return (
      <div className="relative inline-flex items-center gap-2 bg-muted/60 rounded-xl px-3 py-2 text-xs font-body text-foreground">
        {mediaType === "sticker" && mediaPreview.startsWith("emoji:") ? (
          <span className="text-4xl">{mediaPreview.replace("emoji:", "")}</span>
        ) : mediaType === "gif" || (mediaType === "sticker" && !mediaPreview.startsWith("emoji:")) ? (
          <img src={mediaPreview} alt="preview" className="h-16 rounded-lg object-cover" />
        ) : mediaType === "image" && mediaPreview !== "audio" && mediaPreview !== "document" ? (
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

  // Render text with clickable URLs and mentions
  const renderTextWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    const elements = parts.map((part, i) => {
      if (urlRegex.test(part)) {
        return <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-primary underline break-all">{part}</a>;
      }
      return <span key={i}>{renderTextWithMentions(part)}</span>;
    });
    return <>{elements}</>;
  };

  // DMs are now rendered as a floating bubble/sheet overlay below

  if (showChatRooms) {
    return (
      <div className="min-h-screen bg-background">
        <ChatRooms onClose={() => setShowChatRooms(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Instagram-style header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border/30">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-display font-bold tracking-tight">
            Girls <span className="text-gold">✦</span>
          </h1>
          <div className="flex items-end gap-1">
            <button
              onClick={() => { setShowDMs(true); try { localStorage.setItem("dm-used", "1"); } catch {} }}
              className="flex flex-col items-center gap-0.5 px-1.5 py-1 rounded-xl hover:bg-muted/50 transition-colors group"
              title="Mensagens diretas"
            >
              <span className="relative p-2 rounded-full bg-gold/10 ring-1 ring-gold/40 shadow-[0_0_14px_rgba(212,175,55,0.45)] group-hover:shadow-[0_0_20px_rgba(212,175,55,0.7)] transition-shadow">
                <Mail className="h-[18px] w-[18px] text-gold" />
              </span>
              <span className="text-[9px] font-body font-semibold text-gold/90 leading-none">DM</span>
            </button>
            <button
              onClick={() => { setShowChatRooms(true); try { localStorage.setItem("chatrooms-used", "1"); } catch {} }}
              className="flex flex-col items-center gap-0.5 px-1.5 py-1 rounded-xl hover:bg-muted/50 transition-colors group"
              title="Salas de chat por assunto"
            >
              <span className="relative p-2 rounded-full bg-gold/10 ring-1 ring-gold/40 shadow-[0_0_14px_rgba(212,175,55,0.45)] group-hover:shadow-[0_0_20px_rgba(212,175,55,0.7)] transition-shadow">
                <Hash className="h-[18px] w-[18px] text-gold" />
              </span>
              <span className="text-[9px] font-body font-semibold text-gold/90 leading-none">Salas</span>
            </button>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 rounded-full hover:bg-muted/50 transition-colors self-center"
              title="Notificações"
            >
              <Bell className="h-5 w-5 text-foreground" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-4 min-w-4 rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground flex items-center justify-center px-1">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => navigate("/settings")}
              className="p-2.5 rounded-full hover:bg-muted/50 transition-colors self-center"
              title="Configurações"
            >
              <Settings className="h-5 w-5 text-foreground" />
            </button>
          </div>
        </div>
      </header>

      {showNotifications && <NotificationsPanel onClose={() => { setShowNotifications(false); setUnreadCount(0); }} />}

      <div className="px-0 space-y-0 pb-6">
        {/* Stories - full width like Instagram */}
        <div className="px-4 py-3 border-b border-border/30">
          <StoryBar />
        </div>

        <div className="px-4 pt-3">
          <Leaderboard />
        </div>

        {/* Create post */}
        <div className="mx-4 mt-3 bg-card rounded-2xl border border-border/50 p-4 space-y-3">
          <div className="flex items-start gap-3">
            <Avatar url={profile?.avatar_url || null} name={profile?.display_name || null} size="h-8 w-8" userId={user?.id} />
            <MentionInput
              value={newPost}
              onChange={setNewPost}
              placeholder="Compartilhe com as girls... Use @ para mencionar"
              users={allUsers}
              as="textarea"
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

              {/* Sticker/GIF picker */}
              <button
                onClick={() => setShowStickerPicker(prev => !prev)}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  showStickerPicker ? "text-gold bg-gold/10" : "text-muted-foreground hover:text-gold hover:bg-gold/10"
                )}
                title="Figurinhas e GIFs"
              >
                <Smile className="h-4.5 w-4.5" />
              </button>
            </div>

            <Button
              variant="gold"
              size="sm"
              onClick={createPost}
              disabled={(!newPost.trim() && !mediaFile && !mediaPreview) || uploading}
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

          {/* Sticker/GIF picker popup */}
          {showStickerPicker && (
            <div className="mt-2">
              <GifStickerPicker
                onSelect={handleStickerGifSelect}
                onClose={() => setShowStickerPicker(false)}
              />
            </div>
          )}
        </div>

        {/* Feed */}
        <div className="space-y-3 px-4 mt-3">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">Nenhum post ainda. Seja a primeira! ✨</p>
        ) : (
          posts.map(post => (
            <div key={post.id} className="bg-card rounded-2xl border border-border/50 overflow-hidden">
              {/* Post header */}
              <div className="flex items-center gap-3 p-4 pb-2">
                <Avatar url={post.avatar_url} name={post.display_name} userId={post.user_id} clickable />
                <div className="flex-1">
                  <p
                    className="text-sm font-body font-semibold cursor-pointer hover:text-gold transition-colors"
                    onClick={() => navigate(`/perfil/${post.user_id}`)}
                  >
                    {post.user_id === user?.id ? "Você" : post.display_name}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-body">{formatTime(post.created_at)}</p>
                </div>
                {post.user_id !== user?.id && (
                  <button
                    onClick={() => toggleFollow(post.user_id)}
                    className={cn(
                      "flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-body font-medium transition-colors border",
                      followingSet.has(post.user_id)
                        ? "border-gold/30 text-gold bg-gold/10"
                        : "border-border text-muted-foreground hover:border-gold hover:text-gold"
                    )}
                  >
                    {followingSet.has(post.user_id) ? (
                      <><UserMinus className="h-3 w-3" /> Seguindo</>
                    ) : (
                      <><UserPlus className="h-3 w-3" /> Seguir</>
                    )}
                  </button>
                )}
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
                  <p className="text-sm font-body leading-relaxed">{renderTextWithLinks(post.text)}</p>
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

                {/* Sticker (emoji) */}
                {post.media_url && post.media_type === "sticker" && post.media_url.startsWith("emoji:") && (
                  <div className="mt-3 text-center">
                    <span className="text-7xl">{post.media_url.replace("emoji:", "")}</span>
                  </div>
                )}

                {/* GIF or animated sticker */}
                {post.media_url && (post.media_type === "gif" || (post.media_type === "sticker" && !post.media_url.startsWith("emoji:"))) && (
                  <img
                    src={post.media_url}
                    alt={post.media_type === "gif" ? "GIF" : "Sticker"}
                    className="mt-3 rounded-xl max-w-[280px] max-h-60"
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
                <button
                  onClick={() => setPostStickerPickerId(prev => prev === post.id ? null : post.id)}
                  className={cn(
                    "flex items-center gap-1.5 text-sm font-body transition-colors",
                    postStickerPickerId === post.id ? "text-gold" : "text-muted-foreground hover:text-foreground"
                  )}
                  title="Reagir com figurinha"
                >
                  <Smile className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewingPostViewers(viewingPostViewers === post.id ? null : post.id)}
                  className="flex items-center gap-1 text-xs font-body text-muted-foreground ml-auto hover:text-foreground transition-colors"
                >
                  <Eye className="h-3.5 w-3.5" />
                  {post.views_count}
                </button>
              </div>

              {/* Viewers list popup */}
              {viewingPostViewers === post.id && post.viewers && post.viewers.length > 0 && (
                <div className="px-4 py-3 border-t border-border animate-fade-in">
                  <p className="text-[10px] text-muted-foreground font-body mb-2 uppercase tracking-wider">Visto por</p>
                  <div className="flex flex-wrap gap-2">
                    {post.viewers.map(v => (
                      <button
                        key={v.user_id}
                        onClick={() => navigate(`/perfil/${v.user_id}`)}
                        className="flex items-center gap-1.5 bg-muted/50 rounded-full px-2 py-1 hover:bg-muted transition-colors"
                      >
                        {v.avatar_url ? (
                          <img src={v.avatar_url} className="h-5 w-5 rounded-full object-cover" alt="" />
                        ) : (
                          <div className="h-5 w-5 rounded-full bg-gold/20 flex items-center justify-center text-[8px] font-bold text-gold">
                            {v.display_name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                        )}
                        <span className="text-[10px] font-body">{v.user_id === user?.id ? "Você" : v.display_name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Post sticker reaction picker */}
              {postStickerPickerId === post.id && (
                <div className="px-4 pb-3 border-t border-border animate-fade-in">
                  <GifStickerPicker
                    onSelect={(url, type) => handlePostStickerReaction(post.id, post.user_id, url, type)}
                    onClose={() => setPostStickerPickerId(null)}
                  />
                </div>
              )}

              {/* Comments section */}
              {expandedComments.has(post.id) && (
                <div className="border-t border-border animate-fade-in">
                  {post.comments.length > 0 && (
                    <div className="px-4 pt-3 space-y-3">
                      {post.comments.map(comment => (
                        <div key={comment.id} className="flex gap-2.5 group">
                          <Avatar url={comment.avatar_url} name={comment.display_name} size="h-7 w-7" userId={comment.user_id} clickable />
                          <div className="flex-1 min-w-0">
                            <div className="bg-muted/50 rounded-xl px-3 py-2">
                              <p
                                className="text-xs font-body font-semibold cursor-pointer hover:text-gold transition-colors"
                                onClick={() => navigate(`/perfil/${comment.user_id}`)}
                              >
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
                              ) : /^\[gif:(.+)\]$/.test(comment.text) ? (
                                <img
                                  src={comment.text.match(/^\[gif:(.+)\]$/)?.[1] || ""}
                                  alt="GIF"
                                  className="mt-1 rounded-lg max-w-[200px] max-h-40"
                                  loading="lazy"
                                />
                              ) : /^\[sticker:(.+)\]$/.test(comment.text) ? (
                                <img
                                  src={comment.text.match(/^\[sticker:(.+)\]$/)?.[1] || ""}
                                  alt="Sticker"
                                  className="mt-1 rounded-lg max-w-[150px] max-h-36"
                                  loading="lazy"
                                />
                              ) : comment.text.length <= 4 && /^[\p{Emoji}]+$/u.test(comment.text) ? (
                                <span className="text-4xl mt-1 block">{comment.text}</span>
                              ) : (
                                <p className="text-xs font-body text-foreground/80">{renderTextWithMentions(comment.text)}</p>
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
                    <Avatar url={profile?.avatar_url || null} name={profile?.display_name || null} size="h-7 w-7" userId={user?.id} />
                    <div className="flex-1 flex items-center bg-muted/50 rounded-full px-3 py-1.5">
                      <MentionInput
                        value={commentTexts[post.id] || ""}
                        onChange={(val) => setCommentTexts(prev => ({ ...prev, [post.id]: val }))}
                        onKeyDown={e => { if (e.key === "Enter") addComment(post.id, post.user_id); }}
                        placeholder="Comentar... Use @ para mencionar"
                        users={allUsers}
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
      {/* DM Floating Sheet */}
      <Sheet open={showDMs} onOpenChange={(open) => { if (!open) { setShowDMs(false); setDmTargetUserId(null); } }}>
        <SheetContent side="right" className="w-full sm:w-[420px] p-0 overflow-hidden">
          <DirectMessages onClose={() => { setShowDMs(false); setDmTargetUserId(null); }} openConversationUserId={dmTargetUserId} />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ComunidadePage;

import { useState, useEffect } from "react";
import { X, UserPlus, UserMinus, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  userId: string;
  onClose: () => void;
  isFollowing: boolean;
  onToggleFollow: (userId: string) => void;
  isOnline: boolean;
}

export default function UserProfileModal({ userId, onClose, isFollowing, onToggleFollow, isOnline }: Props) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<{
    display_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    created_at: string;
  } | null>(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [postsCount, setPostsCount] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      const [{ data: prof }, { count: followers }, { count: following }, { count: posts }] = await Promise.all([
        supabase.from("profiles_public" as any).select("display_name, avatar_url, bio, created_at").eq("user_id", userId).single(),
        supabase.from("user_follows").select("*", { count: "exact", head: true }).eq("following_id", userId),
        supabase.from("user_follows").select("*", { count: "exact", head: true }).eq("follower_id", userId),
        supabase.from("community_posts").select("*", { count: "exact", head: true }).eq("user_id", userId),
      ]);
      if (prof) setProfile(prof as any);
      setFollowersCount(followers || 0);
      setFollowingCount(following || 0);
      setPostsCount(posts || 0);
    };
    fetchProfile();
  }, [userId]);

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  };

  const isMe = user?.id === userId;

  if (!profile) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-card rounded-2xl border border-border shadow-lg w-[340px] max-w-[90vw] overflow-hidden animate-fade-in" onClick={e => e.stopPropagation()}>
        {/* Header bg */}
        <div className="h-20 bg-gradient-to-br from-gold/30 to-gold/10 relative">
          <button onClick={onClose} className="absolute top-3 right-3 p-1 bg-card/80 rounded-full text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center -mt-10 px-5 pb-5">
          <div className="relative">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="h-20 w-20 rounded-full object-cover border-4 border-card" />
            ) : (
              <div className="h-20 w-20 rounded-full bg-gold/20 flex items-center justify-center text-xl font-bold text-gold border-4 border-card">
                {getInitials(profile.display_name)}
              </div>
            )}
            <span className={cn(
              "absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-card",
              isOnline ? "bg-emerald-400" : "bg-muted-foreground/40"
            )} />
          </div>

          <h3 className="text-lg font-display font-bold mt-3">{profile.display_name || "Usuária"}</h3>
          
          {profile.bio && (
            <p className="text-xs font-body text-muted-foreground text-center mt-1 max-w-[240px]">{profile.bio}</p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-6 mt-4">
            <div className="text-center">
              <p className="text-lg font-display font-bold">{postsCount}</p>
              <p className="text-[10px] font-body text-muted-foreground">Posts</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-display font-bold">{followersCount}</p>
              <p className="text-[10px] font-body text-muted-foreground">Seguidoras</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-display font-bold">{followingCount}</p>
              <p className="text-[10px] font-body text-muted-foreground">Seguindo</p>
            </div>
          </div>

          {/* Follow button */}
          {!isMe && (
            <button
              onClick={() => onToggleFollow(userId)}
              className={cn(
                "mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-body font-semibold transition-all",
                isFollowing
                  ? "bg-gold/10 text-gold border border-gold/30 hover:bg-gold/20"
                  : "bg-gold text-primary-foreground hover:bg-gold/90"
              )}
            >
              {isFollowing ? (
                <><UserMinus className="h-4 w-4" /> Seguindo</>
              ) : (
                <><UserPlus className="h-4 w-4" /> Seguir</>
              )}
            </button>
          )}

          {isMe && (
            <p className="mt-4 text-xs font-body text-muted-foreground">Este é seu perfil ✨</p>
          )}
        </div>
      </div>
    </div>
  );
}

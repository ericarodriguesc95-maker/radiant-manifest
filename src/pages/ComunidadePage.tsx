import { useState, useEffect } from "react";
import { Heart, MessageCircle, Send, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Leaderboard from "@/components/Leaderboard";

interface Post {
  id: string;
  author: string;
  avatar: string;
  text: string;
  image?: string;
  likes: number;
  liked: boolean;
  comments: { author: string; text: string }[];
  time: string;
}

const initialPosts: Post[] = [
  {
    id: "1",
    author: "Marina Silva",
    avatar: "🦋",
    text: "Dia 30 de meditação consecutiva! O Ho'oponopono mudou minha vida. Quem mais pratica? 🧘‍♀️✨",
    likes: 24,
    liked: false,
    comments: [
      { author: "Ana Clara", text: "Inspiração demais! 💫" },
      { author: "Juliana", text: "Comecei ontem! Vamos juntas 🙏" },
    ],
    time: "2h",
  },
  {
    id: "2",
    author: "Camila Santos",
    avatar: "🌸",
    text: "Meta do mês: skincare completa todas as noites. Quem topa o desafio? Postem suas rotinas! 💆‍♀️",
    likes: 18,
    liked: true,
    comments: [{ author: "Beatriz", text: "Bora! Minha pele precisa 😅" }],
    time: "5h",
  },
  {
    id: "3",
    author: "Fernanda Oliveira",
    avatar: "👑",
    text: "Consegui minha promoção! Obrigada ao planejamento SMART daqui. Vocês são incríveis, girls! 🎉💛",
    likes: 56,
    liked: false,
    comments: [],
    time: "1d",
  },
];

const ComunidadePage = () => {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [newPost, setNewPost] = useState("");
  const [showComments, setShowComments] = useState<string | null>(null);

  // Pick up pending conquista from HomePage
  useEffect(() => {
    const pending = sessionStorage.getItem("pending-conquista");
    if (pending) {
      sessionStorage.removeItem("pending-conquista");
      const post: Post = {
        id: Date.now().toString(),
        author: "Você",
        avatar: "💎",
        text: pending,
        likes: 0,
        liked: false,
        comments: [],
        time: "agora",
      };
      setPosts(prev => [post, ...prev]);
    }
  }, []);

  const toggleLike = (id: string) => {
    setPosts(prev =>
      prev.map(p =>
        p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
      )
    );
  };

  const createPost = () => {
    if (!newPost.trim()) return;
    const post: Post = {
      id: Date.now().toString(),
      author: "Você",
      avatar: "💎",
      text: newPost,
      likes: 0,
      liked: false,
      comments: [],
      time: "agora",
    };
    setPosts(prev => [post, ...prev]);
    setNewPost("");
  };

  return (
    <div className="min-h-screen">
      <header className="px-5 pt-12 pb-4">
        <p className="text-sm text-muted-foreground font-body tracking-widest uppercase">Nossa</p>
        <h1 className="text-2xl font-display font-bold">Comunidade <span className="text-gold">✦</span></h1>
      </header>

      <div className="px-5 space-y-4 pb-6">
        {/* Leaderboard */}
        <Leaderboard />

        {/* Create post */}
        <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💎</span>
            <textarea
              value={newPost}
              onChange={e => setNewPost(e.target.value)}
              placeholder="Compartilhe com as girls..."
              rows={2}
              className="flex-1 bg-transparent text-sm font-body outline-none resize-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex items-center justify-between">
            <button className="p-2 text-muted-foreground hover:text-gold transition-colors">
              <ImageIcon className="h-5 w-5" />
            </button>
            <Button variant="gold" size="sm" onClick={createPost} disabled={!newPost.trim()}>
              <Send className="h-3.5 w-3.5 mr-1" /> Postar
            </Button>
          </div>
        </div>

        {/* Feed */}
        {posts.map(post => (
          <div key={post.id} className="bg-card rounded-2xl border border-border overflow-hidden animate-fade-in">
            {/* Post header */}
            <div className="flex items-center gap-3 p-4 pb-2">
              <span className="text-2xl">{post.avatar}</span>
              <div className="flex-1">
                <p className="text-sm font-body font-semibold">{post.author}</p>
                <p className="text-[10px] text-muted-foreground font-body">{post.time}</p>
              </div>
            </div>

            {/* Post content */}
            <div className="px-4 pb-3">
              <p className="text-sm font-body leading-relaxed">{post.text}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 px-4 py-3 border-t border-border">
              <button
                onClick={() => toggleLike(post.id)}
                className="flex items-center gap-1.5 text-sm font-body transition-colors"
              >
                <Heart
                  className={cn("h-4 w-4", post.liked ? "fill-red-400 text-red-400" : "text-muted-foreground")}
                />
                <span className={cn(post.liked ? "text-red-400" : "text-muted-foreground")}>{post.likes}</span>
              </button>
              <button
                onClick={() => setShowComments(showComments === post.id ? null : post.id)}
                className="flex items-center gap-1.5 text-sm font-body text-muted-foreground"
              >
                <MessageCircle className="h-4 w-4" />
                <span>{post.comments.length}</span>
              </button>
            </div>

            {/* Comments */}
            {showComments === post.id && post.comments.length > 0 && (
              <div className="px-4 pb-4 space-y-2 animate-fade-in">
                {post.comments.map((c, i) => (
                  <div key={i} className="flex gap-2 pl-2 border-l-2 border-gold/30">
                    <div>
                      <span className="text-xs font-body font-semibold">{c.author}</span>
                      <p className="text-xs font-body text-muted-foreground">{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComunidadePage;

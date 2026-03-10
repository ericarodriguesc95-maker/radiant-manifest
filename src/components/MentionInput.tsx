import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

interface UserSuggestion {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
}

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  users: UserSuggestion[];
  className?: string;
  as?: "textarea" | "input";
  rows?: number;
  autoFocus?: boolean;
}

const MentionInput = ({
  value,
  onChange,
  onKeyDown,
  placeholder,
  users,
  className,
  as = "input",
  rows = 2,
  autoFocus,
}: MentionInputProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const filtered = users.filter(
    (u) =>
      u.display_name &&
      u.display_name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 6);

  const handleChange = useCallback(
    (newValue: string) => {
      onChange(newValue);

      // Check if user is typing a mention
      const cursorPos = inputRef.current?.selectionStart || newValue.length;
      const textBeforeCursor = newValue.slice(0, cursorPos);
      const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

      if (mentionMatch) {
        setQuery(mentionMatch[1]);
        setShowSuggestions(true);
        setSelectedIndex(0);
      } else {
        setShowSuggestions(false);
      }
    },
    [onChange]
  );

  const insertMention = useCallback(
    (user: UserSuggestion) => {
      const cursorPos = inputRef.current?.selectionStart || value.length;
      const textBeforeCursor = value.slice(0, cursorPos);
      const textAfterCursor = value.slice(cursorPos);
      const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

      if (mentionMatch) {
        const beforeMention = textBeforeCursor.slice(0, mentionMatch.index);
        const name = user.display_name || "usuária";
        const newValue = `${beforeMention}@${name} ${textAfterCursor}`;
        onChange(newValue);
      }

      setShowSuggestions(false);
      inputRef.current?.focus();
    },
    [value, onChange]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSuggestions && filtered.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filtered.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        insertMention(filtered[selectedIndex]);
        return;
      }
      if (e.key === "Escape") {
        setShowSuggestions(false);
        return;
      }
    }
    onKeyDown?.(e);
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  };

  const sharedProps = {
    ref: inputRef as any,
    value,
    onChange: (e: any) => handleChange(e.target.value),
    onKeyDown: handleKeyDown,
    placeholder,
    className,
    autoFocus,
  };

  return (
    <div className="relative flex-1">
      {as === "textarea" ? (
        <textarea {...sharedProps} rows={rows} />
      ) : (
        <input type="text" {...sharedProps} />
      )}

      {showSuggestions && filtered.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 bottom-full mb-1 left-0 w-56 bg-card border border-border rounded-xl shadow-xl overflow-hidden"
        >
          {filtered.map((u, i) => (
            <button
              key={u.user_id}
              type="button"
              onClick={() => insertMention(u)}
              className={cn(
                "flex items-center gap-2 w-full px-3 py-2 text-left text-xs font-body transition-colors",
                i === selectedIndex ? "bg-gold/15 text-foreground" : "hover:bg-muted/50 text-foreground"
              )}
            >
              {u.avatar_url ? (
                <img src={u.avatar_url} alt="" className="h-6 w-6 rounded-full object-cover" />
              ) : (
                <div className="h-6 w-6 rounded-full bg-gold/20 flex items-center justify-center text-[10px] font-bold text-gold">
                  {getInitials(u.display_name)}
                </div>
              )}
              <span className="truncate font-medium">{u.display_name || "Usuária"}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MentionInput;

/** Render text with highlighted @mentions */
export const renderTextWithMentions = (text: string) => {
  const parts = text.split(/(@\w[\w\s]*?)(?=\s@|\s|$)/g);
  return parts.map((part, i) => {
    if (part.startsWith("@")) {
      return (
        <span key={i} className="text-gold font-semibold">
          {part}
        </span>
      );
    }
    return part;
  });
};

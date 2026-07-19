import { useAuth } from "@/contexts/AuthContext";
import { applySkinTone, SkinToneKey } from "@/lib/skinTone";

export function useSkinTone() {
  const { profile } = useAuth();
  const tone = (profile?.skin_tone || "default") as SkinToneKey;
  return {
    tone,
    apply: (text: string) => applySkinTone(text, tone),
  };
}

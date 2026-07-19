import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { SKIN_TONES, SkinToneKey } from "@/lib/skinTone";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Hand } from "lucide-react";

export default function SkinToneSelector() {
  const { user, profile, refreshProfile } = useAuth();
  const current = (profile?.skin_tone || "default") as SkinToneKey;
  const [saving, setSaving] = useState<string | null>(null);

  const pick = async (key: SkinToneKey) => {
    if (!user || saving) return;
    setSaving(key);
    const { error } = await supabase
      .from("profiles")
      .update({ skin_tone: key } as any)
      .eq("user_id", user.id);
    setSaving(null);
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
      return;
    }
    await refreshProfile();
    toast({ title: "Tom de pele atualizado ✨" });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Hand className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">Tom de pele dos emojis</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground">
          Escolha o tom que combina com você — vale para os emojis do app inteiro.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-6 gap-2">
          {(Object.keys(SKIN_TONES) as SkinToneKey[]).map((key) => {
            const t = SKIN_TONES[key];
            const active = current === key;
            return (
              <button
                key={key}
                onClick={() => pick(key)}
                disabled={saving !== null}
                title={t.label}
                className={cn(
                  "aspect-square rounded-xl border-2 flex items-center justify-center text-2xl transition-all",
                  active
                    ? "border-gold bg-gold/10 shadow-gold scale-105"
                    : "border-border bg-background hover:border-gold/40"
                )}
              >
                {t.swatch}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

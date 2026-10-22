import AnimatedEmoji from "@/components/ui/animated-emoji";
import { useEffect, useState } from "react";
import { Sparkles, RefreshCw, ChevronDown, ChevronUp, Pencil, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { parseFutureSelfDetails, type FutureSelfDetails } from "../../supabase/functions/_shared/future-self-details";

const empty = { goal: "", challenge: "", feeling: "", age: 0, city: "" };
export default function FutureSelfMessage() {
  const { user } = useAuth();
  const [message, setMessage] = useState<{ message: string; title: string } | null>(null);
  const [details, setDetails] = useState<FutureSelfDetails>(empty);
  const [editing, setEditing] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const today = new Date().toISOString().slice(0, 10);
  const generate = async (raw: FutureSelfDetails, force = false) => {
    if (!user) return;
    const info = parseFutureSelfDetails(raw);
    if (!info) { setError("Preencha suas informações básicas para receber a mensagem."); setEditing(true); return; }
    const key = `future-self:v2:${user.id}:${today}:${JSON.stringify(info)}`;
    if (!force) { try { const cached = JSON.parse(localStorage.getItem(key) || "null"); if (cached?.message) { setMessage(cached); return; } } catch {} }
    setBusy(true);setError("");
    try {
      const { data, error: failure } = await supabase.functions.invoke("future-self-message", { body: { details: info, date: today } });
      if (failure || !data?.message) throw new Error();
      setMessage(data);localStorage.setItem(key, JSON.stringify(data));
    } catch { setError("Não foi possível gerar sua mensagem agora. Tente novamente."); }
    finally { setBusy(false); }
  };
  useEffect(() => {
    if (!user) return;
    let active = true;
    setLoading(true);setMessage(null);setError("");
    setMinimized(localStorage.getItem(`future-self-minimized:${user.id}`) === "true");
    supabase.from("profiles").select("future_self_details").eq("user_id", user.id).single().then(({ data, error: failure }) => {
      if (!active) return;
      setLoading(false);
      if (failure) { setError("Não foi possível carregar suas informações. Reabra a página.");return; }
      const saved = parseFutureSelfDetails(data?.future_self_details);
      setDetails(saved || empty);setEditing(!saved);
      if (saved) void generate(saved);
    });
    return () => { active = false; };
  }, [user?.id, today]);
  const save = async (event: React.FormEvent) => {
    event.preventDefault();const info = parseFutureSelfDetails(details);
    if (!user || !info) return;
    setBusy(true);
    const { error: failure } = await supabase.from("profiles").update({ future_self_details: { ...info } }).eq("user_id", user.id).select("user_id").single();
    setBusy(false);
    if (failure) { toast({ title: "Não foi possível salvar suas informações", variant: "destructive" });return; }
    setDetails(info);setEditing(false);setMessage(null);await generate(info, true);
  };
  const toggle = () => { const next = !minimized;setMinimized(next);if (user) localStorage.setItem(`future-self-minimized:${user.id}`, String(next)); };
  return <section className="relative rounded-card p-4 border border-border shadow-card bg-highlight-butter">
    <div className="flex items-start justify-between gap-2"><div className="flex min-w-0 items-center gap-2"><Sparkles className="h-5 w-5 text-primary shrink-0" /><div><p className="text-[10px] uppercase font-bold text-primary">Mensagem de você daqui a 1 ano</p><p className="text-[10px] text-muted-foreground">Renova todos os dias</p></div></div><div className="flex shrink-0">
      {!minimized && !editing && !loading && <><Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Editar informações da mensagem futura" title="Editar informações" onClick={() => setEditing(true)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Gerar nova mensagem" title="Gerar nova mensagem" disabled={busy} onClick={() => void generate(details, true)}><RefreshCw className="h-3.5 w-3.5" /></Button></>}
      <Button variant="ghost" size="icon" className="h-7 w-7" aria-label={minimized ? "Expandir mensagem futura" : "Minimizar mensagem futura"} title={minimized ? "Expandir mensagem" : "Minimizar mensagem"} aria-expanded={!minimized} onClick={toggle}>{minimized ? <ChevronDown /> : <ChevronUp />}</Button>
    </div></div>
    {!minimized && <div className="mt-3 space-y-3">
      {loading ? <p role="status" className="text-xs text-muted-foreground">Carregando...</p> : editing ? <form onSubmit={save} className="space-y-3">
        <div className="grid grid-cols-[80px_minmax(0,1fr)] gap-2"><div className="space-y-1"><Label htmlFor="future-age" className="text-xs">Idade</Label><Input id="future-age" type="number" min={1} max={120} required value={details.age || ""} onChange={e => setDetails({ ...details, age: Number(e.target.value) })} disabled={busy} /></div><div className="space-y-1"><Label htmlFor="future-city" className="text-xs">Cidade</Label><Input id="future-city" required maxLength={100} value={details.city} onChange={e => setDetails({ ...details, city: e.target.value })} disabled={busy} /></div></div>
        {([["goal", "O que você quer conquistar em um ano?", "Ex.: cuidar melhor da minha saúde"], ["challenge", "Qual é seu maior desafio hoje?", "Ex.: manter a constância"], ["feeling", "Como você quer se sentir?", "Ex.: confiante e realizada"]] as const).map(([key,label,placeholder]) => <div key={key} className="space-y-1"><Label htmlFor={`future-${key}`} className="text-xs">{label}</Label><Input id={`future-${key}`} value={details[key]} onChange={e => setDetails({ ...details, [key]: e.target.value })} required maxLength={300} placeholder={placeholder} disabled={busy} /></div>)}
        <Button type="submit" size="sm" disabled={busy || !parseFutureSelfDetails(details)} className="w-full"><Save />{busy ? "Salvando..." : "Salvar e receber mensagem"}</Button>
      </form> : busy && !message ? <p role="status" className="text-xs text-muted-foreground">Preparando sua mensagem...</p> : message ? <><div className="flex items-start gap-2"><div className="min-w-0 space-y-2"><p className="text-sm font-display font-bold italic">“{message.title}”</p><p className="text-[13px] leading-relaxed">{message.message}</p></div><span aria-hidden className="shrink-0"><AnimatedEmoji name="letter" size={32} /></span></div><p className="text-[10px] text-muted-foreground">Com amor, você daqui a 1 ano 👑</p></> : null}
      {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
    </div>}
  </section>;
}

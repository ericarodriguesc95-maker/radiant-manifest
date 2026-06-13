import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Landmark, Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

declare global {
  interface Window {
    PluggyConnect?: any;
  }
}

const WIDGET_SCRIPT = "https://cdn.pluggy.ai/pluggy-connect/v2.10.0/pluggy-connect.js";

interface PluggyItem {
  id: string;
  pluggy_item_id: string;
  connector_name: string | null;
  connector_image_url: string | null;
  status: string;
  last_synced_at: string | null;
}

interface Props {
  mode: "pf" | "cnpj";
  onSynced?: () => void;
}

export default function PluggyConnectButton({ mode, onSynced }: Props) {
  const [loadingScript, setLoadingScript] = useState(false);
  const [busy, setBusy] = useState(false);
  const [items, setItems] = useState<PluggyItem[]>([]);
  const widgetRef = useRef<any>(null);

  const loadItems = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("pluggy_items" as any)
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setItems((data as any) || []);
  };

  useEffect(() => { loadItems(); }, []);

  const ensureScript = async () => {
    if (window.PluggyConnect) return;
    setLoadingScript(true);
    await new Promise<void>((resolve, reject) => {
      const s = document.createElement("script");
      s.src = WIDGET_SCRIPT;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("Falha ao carregar widget Pluggy"));
      document.body.appendChild(s);
    });
    setLoadingScript(false);
  };

  const sync = async (itemId: string) => {
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("pluggy-sync", { body: { itemId, mode } });
      if (error) throw error;
      toast.success(`Sincronizado: ${data?.inserted || 0} novos lançamentos`);
      onSynced?.();
      loadItems();
    } catch (e: any) {
      toast.error("Erro ao sincronizar: " + (e?.message || ""));
    } finally {
      setBusy(false);
    }
  };

  const openConnect = async (existingItemId?: string) => {
    try {
      setBusy(true);
      await ensureScript();
      const { data, error } = await supabase.functions.invoke("pluggy-connect-token", {
        body: existingItemId ? { itemId: existingItemId } : {},
      });
      if (error) throw error;
      const accessToken = (data as any)?.accessToken;
      if (!accessToken) throw new Error("Token não recebido");

      widgetRef.current = new window.PluggyConnect({
        connectToken: accessToken,
        includeSandbox: true,
        onSuccess: async (itemData: any) => {
          const newItemId = itemData?.item?.id || existingItemId;
          if (newItemId) await sync(newItemId);
        },
        onError: (err: any) => {
          console.error("Pluggy error", err);
          toast.error("Não foi possível conectar a conta");
        },
      });
      widgetRef.current.init();
    } catch (e: any) {
      toast.error(e?.message || "Erro ao abrir conexão");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Landmark className="h-4 w-4 text-gold" />
          <h3 className="text-sm font-display font-semibold">Contas conectadas</h3>
        </div>
        <Button size="sm" variant="gold" className="text-xs gap-1" onClick={() => openConnect()} disabled={busy || loadingScript}>
          {busy || loadingScript ? <Loader2 className="h-3 w-3 animate-spin" /> : "+"} Conectar conta
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground font-body">
          Conecte sua conta via Open Finance e seus lançamentos aparecem aqui automaticamente. 🔒 Seguro e regulado pelo Banco Central.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((it) => (
            <li key={it.id} className="flex items-center justify-between bg-muted/30 rounded-xl px-3 py-2">
              <div className="flex items-center gap-2 min-w-0">
                {it.connector_image_url && (
                  <img src={it.connector_image_url} alt="" className="h-6 w-6 rounded" />
                )}
                <div className="min-w-0">
                  <p className="text-xs font-body font-medium truncate">{it.connector_name || "Conta"}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {it.status} {it.last_synced_at ? `· ${new Date(it.last_synced_at).toLocaleString("pt-BR")}` : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => sync(it.pluggy_item_id)}
                  disabled={busy}
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-gold"
                  title="Atualizar"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${busy ? "animate-spin" : ""}`} />
                </button>
                <button
                  onClick={() => openConnect(it.pluggy_item_id)}
                  className="text-[10px] underline text-muted-foreground hover:text-gold"
                  title="Reautenticar"
                >
                  reconectar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

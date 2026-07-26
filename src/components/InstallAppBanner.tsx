import { useState, useEffect } from "react";
import { X, Smartphone, ChevronDown, ChevronUp, Download, Monitor } from "lucide-react";

const DISMISSED_KEY = "glowup-install-banner-dismissed";
const DISMISS_DURATION = 3 * 24 * 60 * 60 * 1000; // 3 days

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as any).standalone === true
  );
}

export default function InstallAppBanner() {
  const [show, setShow] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    if (isStandalone()) return;

    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (dismissed && Date.now() - parseInt(dismissed) < DISMISS_DURATION) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

    const timer = setTimeout(() => setShow(true), 4000);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
  };

  const install = async () => {
    if (!deferredPrompt) {
      setExpanded(true);
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") dismiss();
    setDeferredPrompt(null);
  };

  if (!show) return null;

  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isAndroid = /Android/.test(ua);
  const isDesktop = !isIOS && !isAndroid;

  return (
    <div className="fixed bottom-24 left-3 right-3 z-50 animate-slide-up md:left-auto md:right-6 md:max-w-sm md:bottom-6">
      <div className="bg-card border border-gold/30 rounded-2xl shadow-[0_8px_32px_hsl(43_72%_52%/0.15)] overflow-hidden backdrop-blur-md">
        <div className="flex items-center gap-3 p-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
            {isDesktop ? <Monitor className="h-5 w-5 text-gold" /> : <Smartphone className="h-5 w-5 text-gold" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-heading font-bold text-foreground">
              Instalar Gloow Up Club 👑
            </p>
            <p className="text-[11px] font-body text-muted-foreground">
              {isDesktop ? "Acesso rápido no seu computador, como um app" : "Acesso rápido no celular, como um app nativo"}
            </p>
          </div>
          <button onClick={dismiss} className="p-1.5 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-3 pb-3 flex gap-2">
          {(deferredPrompt || (!isIOS)) && (
            <button
              onClick={install}
              className="flex-1 bg-gold text-black text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 hover:bg-gold/90 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              {deferredPrompt ? "Instalar agora" : "Como instalar"}
            </button>
          )}
          {isIOS && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex-1 bg-gold text-black text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5"
            >
              Ver passo a passo
              {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>

        {expanded && (
          <div className="px-4 pb-4 pt-1 space-y-3 border-t border-border animate-fade-in">
            {isIOS ? (
              <>
                <Step n={1} text='Toque no botão "Compartilhar" (ícone ↑) na barra do Safari' />
                <Step n={2} text='Role e selecione "Adicionar à Tela de Início"' />
                <Step n={3} text='Toque em "Adicionar" e pronto! 🎉' />
              </>
            ) : isAndroid ? (
              <>
                <Step n={1} text='Toque no menu (⋮) do Chrome ou navegador' />
                <Step n={2} text='Selecione "Adicionar à tela inicial" ou "Instalar app"' />
                <Step n={3} text="Confirme e o ícone do Club vai aparecer na sua home 🎉" />
              </>
            ) : (
              <>
                <Step n={1} text="No Chrome/Edge, clique no ícone de instalar na barra de endereço (⊕)" />
                <Step n={2} text='Ou abra o menu (⋮) e escolha "Instalar Gloow Up Club"' />
                <Step n={3} text="Pronto! Vai abrir em janela própria como app 🎉" />
              </>
            )}
            <p className="text-[10px] text-muted-foreground text-center pt-1">
              Funciona no navegador. Sem loja de apps, sem download pesado.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Step({ n, text }: { n: number; text: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gold/15 text-gold text-[10px] font-bold flex items-center justify-center">
        {n}
      </span>
      <p className="text-xs font-body text-foreground leading-relaxed pt-0.5">{text}</p>
    </div>
  );
}

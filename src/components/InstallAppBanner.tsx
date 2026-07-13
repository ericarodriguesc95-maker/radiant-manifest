import { useState, useEffect } from "react";
import { X, Smartphone, ChevronDown, ChevronUp } from "lucide-react";

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

  useEffect(() => {
    if (isStandalone()) return;

    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (dismissed && Date.now() - parseInt(dismissed) < DISMISS_DURATION) return;

    const timer = setTimeout(() => setShow(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
  };

  if (!show) return null;

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);

  return (
    <div className="fixed bottom-24 left-3 right-3 z-50 animate-slide-up">
      <div className="bg-card border border-gold/30 rounded-2xl shadow-[0_8px_32px_hsl(43_72%_52%/0.15)] overflow-hidden">
        {/* Main bar */}
        <div className="flex items-center gap-3 p-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
            <Smartphone className="h-5 w-5 text-gold" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-heading font-bold text-foreground">
              Crie seu atalho no celular 👑
            </p>
            <p className="text-[11px] font-body text-muted-foreground">
              Acesso rápido pelo navegador, sem precisar baixar nada
            </p>
          </div>
          <button onClick={dismiss} className="p-1.5 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-1 py-1.5 text-[10px] font-body text-gold border-t border-border hover:bg-muted/30 transition-colors"
        >
          Como criar o atalho passo a passo
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>

        {/* Step by step */}
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
                <Step n={1} text="No Chrome, clique no ícone de instalar na barra de endereço" />
                <Step n={2} text='Ou clique no menu (⋮) → "Instalar app"' />
                <Step n={3} text="Confirme e pronto! O acesso fica na sua área de trabalho 🎉" />
              </>
            )}
            <p className="text-[10px] text-muted-foreground text-center pt-1">
              O Gloow Up Club funciona pelo navegador. Não é necessário baixar em loja de apps.
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

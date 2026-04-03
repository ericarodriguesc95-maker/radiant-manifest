import { Sparkles, Crown, ArrowRight, MessageCircle, Star, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RenovarBrilhoPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8">
      {/* Decorative top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gold/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-md w-full text-center space-y-8">
        {/* Crown icon */}
        <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-gold/30 to-gold/10 flex items-center justify-center border border-gold/30 shadow-lg shadow-gold/20">
          <Crown className="w-10 h-10 text-gold" />
        </div>

        {/* Title */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-foreground">
            Seu brilho não pode parar! ✨
          </h1>
          <div className="flex items-center justify-center gap-1 text-gold">
            <Star className="w-4 h-4 fill-gold" />
            <Star className="w-4 h-4 fill-gold" />
            <Star className="w-4 h-4 fill-gold" />
            <Star className="w-4 h-4 fill-gold" />
            <Star className="w-4 h-4 fill-gold" />
          </div>
        </div>

        {/* Persuasive text */}
        <p className="text-muted-foreground text-base leading-relaxed">
          Notamos que sua assinatura expirou. Não deixe seu progresso nos desafios e sua evolução mental ficarem para trás.{" "}
          <span className="text-foreground font-medium">
            Recupere seu acesso agora e continue sua jornada de alta performance.
          </span>
        </p>

        {/* Benefits */}
        <div className="bg-card/50 border border-border rounded-2xl p-5 space-y-3 text-left">
          <p className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-gold" />
            O que você está perdendo:
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {[
              "Assistente IA personalizada",
              "Rastreamento completo de saúde",
              "Comunidade exclusiva Glow Up",
              "Desafios de alta performance",
              "Meditações e reprogramação mental",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Heart className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA Button */}
        <Button
          asChild
          className="w-full h-14 text-lg font-bold bg-gradient-to-r from-gold to-amber-500 hover:from-amber-500 hover:to-gold text-black rounded-2xl shadow-lg shadow-gold/30 transition-all duration-300 hover:scale-[1.02]"
        >
          <a
            href="https://planosdosite.lovable.app/"
            target="_blank"
            rel="noopener noreferrer"
          >
            RENOVAR MINHA ASSINATURA
            <ArrowRight className="w-5 h-5 ml-2" />
          </a>
        </Button>

        {/* Support link */}
        <a
          href="https://wa.me/message/M64TKGTEYIZRK1"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          Já pagou e não liberou? Fale com a Érica.
        </a>
      </div>
    </div>
  );
}

import { useState } from "react";
import { X, Clock, Calendar, KeyRound } from "lucide-react";
import { SUCCESS_KEYS, SuccessKey } from "@/data/eliteJourneyData";
import { cn } from "@/lib/utils";

const DAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export default function SuccessKeysCards() {
  const [activeKey, setActiveKey] = useState<SuccessKey | null>(null);

  const todayName = DAYS[new Date().getDay()];

  const getTodayExercise = (key: SuccessKey) =>
    key.exercises.find((e) => e.day === todayName) || key.exercises[0];

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {SUCCESS_KEYS.map((key, i) => {
          const exercise = getTodayExercise(key);
          return (
            <button
              key={key.id}
              onClick={() => setActiveKey(key)}
              className={cn(
                "animate-stagger group relative overflow-hidden rounded-2xl p-4 text-left transition-all duration-300",
                "glass border border-gold/15 hover:border-gold/40",
                "hover:shadow-glow active:scale-[0.97]"
              )}
              style={{ "--stagger": i } as React.CSSProperties}
            >
              <div className={cn("absolute inset-0 bg-gradient-to-br opacity-60 group-hover:opacity-100 transition-opacity", key.color)} />
              {/* Pyramid/key gold accent */}
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br from-gold/20 to-transparent rounded-full blur-2xl" />

              <div className="relative z-10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-gold/30 to-gold/5 border border-gold/30 flex items-center justify-center text-xl shadow-gold">
                    {key.icon}
                  </div>
                  <KeyRound className="h-3.5 w-3.5 text-gold/50" />
                </div>
                <div>
                  <p className="text-[9px] font-body tracking-[0.25em] uppercase text-gold/70 mb-1">Chave</p>
                  <h3 className="text-sm font-display font-bold text-foreground leading-tight">{key.name}</h3>
                  <p className="text-[10px] font-body text-muted-foreground mt-1 leading-relaxed">{key.description}</p>
                </div>
                <div className="pt-2 border-t border-gold/10 flex items-center gap-1.5">
                  <Clock className="h-3 w-3 text-gold/60" />
                  <span className="text-[10px] font-body text-gold/80">Hoje · {exercise.duration}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Modal */}
      {activeKey && (
        <div
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in"
          onClick={() => setActiveKey(null)}
        >
          <div
            className="relative w-full max-w-md rounded-t-3xl sm:rounded-3xl glass-strong border border-gold/30 p-6 shadow-brand animate-in slide-in-from-bottom-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveKey(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <X className="h-4 w-4 text-foreground" />
            </button>

            {(() => {
              const ex = getTodayExercise(activeKey);
              return (
                <div className="space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-gold/30 to-gold/5 border border-gold/40 flex items-center justify-center text-3xl shadow-gold">
                      {activeKey.icon}
                    </div>
                    <div>
                      <p className="text-[9px] font-body tracking-[0.3em] uppercase text-gold/70">Chave do Sucesso</p>
                      <h2 className="text-lg font-display font-bold text-foreground">{activeKey.name}</h2>
                    </div>
                  </div>

                  <div className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-gold" />
                      <span className="text-[10px] font-body tracking-[0.2em] uppercase text-gold/80">Exercício de {ex.day}</span>
                    </div>
                    <h3 className="text-xl font-display font-bold text-foreground">{ex.title}</h3>
                    <p className="text-sm font-body text-muted-foreground leading-relaxed">{ex.instruction}</p>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gold/10 border border-gold/20">
                      <Clock className="h-3 w-3 text-gold" />
                      <span className="text-[11px] font-body text-gold font-semibold">{ex.duration}</span>
                    </div>
                  </div>

                  <div className="rounded-xl bg-muted/20 border border-gold/10 p-3">
                    <p className="text-[10px] font-body tracking-[0.15em] uppercase text-gold/60 mb-1">Toda a semana</p>
                    <p className="text-[11px] font-body text-muted-foreground leading-relaxed">
                      Volte aqui amanhã para um novo exercício. Cada chave tem 7 práticas diárias que constroem maestria.
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </>
  );
}

import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { BarChart3, Clock, Lightbulb, Rocket, Sparkles } from "lucide-react";

interface Section {
  title: string;
  icon: typeof BarChart3;
  color: string;
  content: string;
}

interface Props { plan: string }

// Splits a markdown plan by H2 (## ) into themed sections.
export function PlanSections({ plan }: Props) {
  const sections = useMemo(() => parsePlan(plan), [plan]);

  if (sections.length === 0) {
    // Fallback: render raw markdown
    return (
      <div className="prose prose-invert prose-sm sm:prose-base max-w-none
        prose-headings:text-gold prose-strong:text-gold
        prose-p:text-foreground/90 prose-li:text-foreground/90">
        <ReactMarkdown>{plan}</ReactMarkdown>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {sections.map((section, idx) => {
        const Icon = section.icon;
        return (
          <div
            key={idx}
            className="relative rounded-2xl border border-gold/25 bg-gradient-to-br from-card via-card to-background/60 overflow-hidden group"
          >
            {/* Glow accent */}
            <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gold/10 blur-3xl pointer-events-none" />

            {/* Section header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gold/15 bg-gold/5">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${section.color} border border-gold/30 shrink-0`}>
                <Icon className="h-5 w-5 text-gold" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-[0.2em] text-gold/60 font-medium">Parte {idx + 1}</p>
                <h3 className="font-serif text-lg sm:text-xl text-gold leading-tight">{section.title}</h3>
              </div>
            </div>

            {/* Section body */}
            <div className="px-5 py-5">
              <div className="prose prose-invert prose-sm sm:prose-base max-w-none
                prose-headings:text-gold prose-headings:font-serif
                prose-h3:text-base prose-h3:mt-5 prose-h3:mb-2 prose-h3:text-gold/90 prose-h3:font-semibold
                prose-h4:text-sm prose-h4:text-gold/80 prose-h4:uppercase prose-h4:tracking-wide
                prose-p:text-foreground/85 prose-p:leading-relaxed prose-p:my-2
                prose-strong:text-gold prose-strong:font-semibold
                prose-ul:my-3 prose-ul:space-y-1.5 prose-li:text-foreground/85 prose-li:my-0
                prose-li:marker:text-gold/60
                prose-table:my-4 prose-table:rounded-lg prose-table:overflow-hidden prose-table:border prose-table:border-gold/25
                prose-thead:bg-gold/10
                prose-th:text-gold prose-th:font-semibold prose-th:text-xs prose-th:uppercase prose-th:tracking-wide prose-th:px-3 prose-th:py-2.5 prose-th:border prose-th:border-gold/20
                prose-td:px-3 prose-td:py-2.5 prose-td:border prose-td:border-gold/15 prose-td:text-foreground/85 prose-td:text-sm
                prose-tr:hover:bg-gold/5
                prose-blockquote:border-l-gold prose-blockquote:bg-gold/5 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r prose-blockquote:not-italic">
                <ReactMarkdown>{section.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Parser ──────────────────────────────────────────────────────────
function parsePlan(plan: string): Section[] {
  if (!plan) return [];
  // Strip leading "## " sections
  const lines = plan.split("\n");
  const sections: Section[] = [];
  let currentTitle = "";
  let currentBuffer: string[] = [];

  const flush = () => {
    if (currentTitle) {
      sections.push({
        title: cleanTitle(currentTitle),
        icon: pickIcon(currentTitle),
        color: pickColor(sections.length),
        content: currentBuffer.join("\n").trim(),
      });
    }
  };

  for (const line of lines) {
    const h2 = line.match(/^##\s+(.+)/);
    if (h2) {
      flush();
      currentTitle = h2[1];
      currentBuffer = [];
    } else {
      currentBuffer.push(line);
    }
  }
  flush();

  return sections;
}

function cleanTitle(raw: string): string {
  // Remove leading numbering like "1. " or "1) "
  return raw.replace(/^\s*\d+[.)]\s*/, "").trim();
}

function pickIcon(title: string): typeof BarChart3 {
  const t = title.toLowerCase();
  if (t.includes("análise") || t.includes("analise") || t.includes("perfil") || t.includes("diagn")) return BarChart3;
  if (t.includes("plano") || t.includes("regula") || t.includes("horário") || t.includes("horario") || t.includes("ritual")) return Clock;
  if (t.includes("dica") || t.includes("ouro") || t.includes("ciência") || t.includes("ciencia") || t.includes("neuro")) return Lightbulb;
  if (t.includes("próximo") || t.includes("proximo") || t.includes("passo") || t.includes("encerr")) return Rocket;
  return Sparkles;
}

function pickColor(idx: number): string {
  const palette = ["bg-gold/15", "bg-gold/10", "bg-gold/15", "bg-gold/10"];
  return palette[idx % palette.length];
}

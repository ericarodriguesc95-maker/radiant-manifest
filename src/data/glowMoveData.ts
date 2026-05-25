import { Brain, Sparkles, Heart, Zap, Coins, Moon, Leaf, type LucideIcon } from "lucide-react";

export type PillarId =
  | "recablea"
  | "quem-sou-eu"
  | "dentro-de-mim"
  | "a-que-aparece"
  | "abundo"
  | "conecto"
  | "meu-templo";

export interface Pillar {
  id: PillarId;
  nome: string;
  subtitulo: string;
  conceito: string;
  ancora: string;
  icon: LucideIcon;
}

export const PHASES = [
  { n: 1, nome: "Reconhecer" },
  { n: 2, nome: "Soltar" },
  { n: 3, nome: "Construir" },
  { n: 4, nome: "Enraizar" },
] as const;

export const PILLARS: Pillar[] = [
  {
    id: "recablea",
    nome: "Recablea",
    subtitulo: "Neurociência",
    conceito: "Reprogramar padrões mentais com base em neuroplasticidade, dopamina, ciclos de atenção e formação de hábitos.",
    ancora: "Toda repetição esculpe um caminho novo no cérebro.",
    icon: Brain,
  },
  {
    id: "quem-sou-eu",
    nome: "Quem sou eu",
    subtitulo: "Identidade feminina",
    conceito: "Autoconceito, arquétipos femininos, presença, voz, como a mulher se percebe e se posiciona no mundo.",
    ancora: "Eu me lembro de quem eu sempre fui.",
    icon: Sparkles,
  },
  {
    id: "dentro-de-mim",
    nome: "Dentro de mim",
    subtitulo: "Psicologia",
    conceito: "Regulação emocional, crenças limitantes, autocompaixão, padrões relacionais, sombra psicológica.",
    ancora: "Tudo o que sinto tem lugar dentro de mim.",
    icon: Heart,
  },
  {
    id: "a-que-aparece",
    nome: "A que aparece",
    subtitulo: "Disciplina",
    conceito: "Consistência sem motivação, micro-hábitos, identidade de ação, responsabilidade radical, presença mesmo nos dias difíceis.",
    ancora: "Eu sou a que aparece, mesmo nos dias difíceis.",
    icon: Zap,
  },
  {
    id: "abundo",
    nome: "Abundo",
    subtitulo: "Dinheiro e finanças",
    conceito: "Mentalidade financeira, relação com dinheiro, educação financeira prática, consciência de abundância e ações concretas de gestão.",
    ancora: "Dinheiro flui por onde há consciência.",
    icon: Coins,
  },
  {
    id: "conecto",
    nome: "Conecto",
    subtitulo: "Espiritual",
    conceito: "Propósito, gratidão, fé, intuição feminina, rituais de conexão interna, presença plena.",
    ancora: "Estou conectada com algo maior que me sustenta.",
    icon: Moon,
  },
  {
    id: "meu-templo",
    nome: "Meu templo",
    subtitulo: "Corpo físico",
    conceito: "Movimento, alimentação consciente, descanso, escuta corporal, relação de cuidado com o próprio corpo.",
    ancora: "Meu corpo é o templo onde eu habito.",
    icon: Leaf,
  },
];

export const getPillar = (id: string) => PILLARS.find((p) => p.id === id);

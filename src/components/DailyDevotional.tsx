import { useState, useEffect } from "react";
import { BookMarked, ChevronDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Religion = "crista" | "espirita" | "budista" | "islamica" | "judaica" | "universal";

const religionLabels: Record<Religion, string> = {
  crista: "Cristã",
  espirita: "Espírita",
  budista: "Budista",
  islamica: "Islâmica",
  judaica: "Judaica",
  universal: "Universalista",
};

const devotionalsByReligion: Record<Religion, { verse: string; reflection: string; devotional: string }[]> = {
  crista: [
    {
      verse: "Porque eu sei os planos que tenho para vocês — Jeremias 29:11",
      reflection: "Mesmo quando o caminho parece confuso, Deus já preparou direção e futuro. Hoje, escolha confiar no processo.",
      devotional: "Entregue suas preocupações em oração, respire fundo e dê um passo prático de fé naquilo que você já sabe que precisa fazer.",
    },
    {
      verse: "Tudo posso naquele que me fortalece — Filipenses 4:13",
      reflection: "Sua força não depende apenas do seu humor ou energia; ela também vem da constância espiritual.",
      devotional: "Antes de iniciar suas tarefas, declare este versículo em voz alta e peça força para manter foco e disciplina.",
    },
    {
      verse: "Confie no Senhor de todo o coração — Provérbios 3:5",
      reflection: "Confiar é soltar o controle que gera ansiedade. Troque a necessidade de controlar tudo por serenidade no presente.",
      devotional: "Escreva uma preocupação e, ao lado, uma ação simples que represente confiança prática em Deus.",
    },
  ],
  espirita: [
    {
      verse: "Fora da caridade não há salvação — Allan Kardec",
      reflection: "A verdadeira evolução espiritual se manifesta nos pequenos atos de bondade do dia a dia.",
      devotional: "Pratique um ato de caridade hoje, seja material ou emocional. Um gesto sincero transforma quem dá e quem recebe.",
    },
    {
      verse: "Conhece-te a ti mesmo — O Livro dos Espíritos",
      reflection: "O autoconhecimento é a chave para a reforma íntima. Observe seus pensamentos e ações com honestidade.",
      devotional: "Reserve 10 minutos para refletir sobre uma atitude que você gostaria de melhorar e trace um plano simples para isso.",
    },
    {
      verse: "Nascer, morrer, renascer ainda e progredir sempre, tal é a lei — Allan Kardec",
      reflection: "Cada desafio é uma oportunidade de crescimento. Sua jornada é contínua e cada passo importa.",
      devotional: "Identifique um desafio atual e encare-o como uma lição. Que aprendizado ele traz para sua evolução?",
    },
  ],
  budista: [
    {
      verse: "A paz vem de dentro de você mesmo. Não a procure à sua volta — Buda",
      reflection: "A serenidade não depende das circunstâncias externas, mas da sua relação com o momento presente.",
      devotional: "Medite por 10 minutos focando na respiração. Quando pensamentos surgirem, observe-os sem julgamento e retorne ao respiro.",
    },
    {
      verse: "Milhares de velas podem ser acesas a partir de uma única vela — Buda",
      reflection: "Sua luz interior não diminui quando compartilhada. Ao contrário, ela se multiplica e ilumina outros caminhos.",
      devotional: "Ofereça uma palavra gentil ou um sorriso sincero a alguém hoje. Observe como isso transforma o ambiente ao redor.",
    },
    {
      verse: "Não insista no passado, não sonhe com o futuro, concentre a mente no momento presente — Buda",
      reflection: "A atenção plena ao agora dissolve a ansiedade do futuro e a tristeza do passado.",
      devotional: "Escolha uma atividade cotidiana e faça-a com atenção plena: sinta cada textura, som e sensação.",
    },
  ],
  islamica: [
    {
      verse: "Certamente com a dificuldade vem a facilidade — Alcorão, 94:6",
      reflection: "Toda provação carrega em si a semente do alívio. A paciência (sabr) é uma forma de adoração.",
      devotional: "Em momentos de dificuldade hoje, repita esta ayah e confie que Allah já preparou o caminho da facilidade.",
    },
    {
      verse: "Allah não sobrecarrega nenhuma alma além da sua capacidade — Alcorão, 2:286",
      reflection: "Você tem a força necessária para enfrentar cada desafio que se apresenta. Confie na sabedoria divina.",
      devotional: "Faça uma du'a pedindo força e clareza. Depois, dê o primeiro passo prático em direção à solução.",
    },
    {
      verse: "E quem deposita confiança em Allah, Ele lhe será suficiente — Alcorão, 65:3",
      reflection: "Tawakkul é confiar em Allah depois de fazer o seu melhor esforço. É a união entre ação e fé.",
      devotional: "Planeje suas tarefas do dia com dedicação e, ao final, entregue os resultados a Allah com serenidade.",
    },
  ],
  judaica: [
    {
      verse: "Ouve, ó Israel: o Senhor nosso Deus, o Senhor é um — Deuteronômio 6:4",
      reflection: "A unidade de Deus nos lembra que tudo está conectado. Cada ação sua faz parte de um propósito maior.",
      devotional: "Ao acordar, recite o Shemá e comece o dia com intenção e gratidão pela vida que lhe foi dada.",
    },
    {
      verse: "Não é a ti que cabe completar a obra, mas também não és livre para desistir dela — Pirkei Avot 2:16",
      reflection: "A perfeição não é exigida, mas a persistência sim. Continue caminhando, mesmo em passos pequenos.",
      devotional: "Escolha uma mitsvá prática para hoje: um ato de bondade, estudo ou caridade, por menor que seja.",
    },
    {
      verse: "Em todo lugar que eu faça mencionar o Meu nome, virei a ti e te abençoarei — Êxodo 20:24",
      reflection: "A presença divina está disponível em qualquer lugar onde haja sinceridade e busca espiritual.",
      devotional: "Dedique um momento do dia para uma prece sincera, reconhecendo as bênçãos presentes em sua vida.",
    },
  ],
  universal: [
    {
      verse: "Seja a mudança que você deseja ver no mundo — Mahatma Gandhi",
      reflection: "A transformação coletiva começa com a individual. Suas escolhas diárias moldam o mundo ao redor.",
      devotional: "Identifique uma mudança positiva que você quer ver e pratique-a hoje em sua própria vida.",
    },
    {
      verse: "A gratidão transforma o que temos em suficiente — Melody Beattie",
      reflection: "Quando focamos no que já possuímos, a escassez dá lugar à abundância interior.",
      devotional: "Escreva 3 coisas pelas quais você é grata hoje. Releia antes de dormir e sinta a gratidão no coração.",
    },
    {
      verse: "O único modo de fazer um excelente trabalho é amar o que você faz — Steve Jobs",
      reflection: "Propósito e paixão transformam tarefas comuns em missões extraordinárias.",
      devotional: "Reflita sobre o que traz significado ao seu dia. Dedique mais energia a isso e observe a diferença.",
    },
  ],
};

export default function DailyDevotional() {
  const [religion, setReligion] = useState<Religion | null>(() => {
    const saved = localStorage.getItem("user-religion");
    return saved as Religion | null;
  });

  const [index] = useState(() => {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    return dayOfYear % 3;
  });

  useEffect(() => {
    if (religion) localStorage.setItem("user-religion", religion);
  }, [religion]);

  if (!religion) {
    return (
      <section className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm">
        <div className="flex items-center gap-2">
          <BookMarked className="h-4 w-4 text-primary" />
          <p className="text-[10px] font-body tracking-[0.2em] uppercase text-primary">Palavra do Dia</p>
        </div>
        <p className="text-sm font-body text-card-foreground leading-relaxed">
          Para personalizar sua palavra do dia, selecione sua orientação espiritual:
        </p>
        <div className="grid grid-cols-2 gap-2">
          {(Object.entries(religionLabels) as [Religion, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setReligion(key)}
              className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-body text-card-foreground hover:border-primary hover:bg-primary/5 transition-colors text-center"
            >
              {label}
            </button>
          ))}
        </div>
      </section>
    );
  }

  const devotionals = devotionalsByReligion[religion];
  const devotional = devotionals[index];

  return (
    <section className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookMarked className="h-4 w-4 text-primary" />
          <p className="text-[10px] font-body tracking-[0.2em] uppercase text-primary">Palavra do Dia</p>
        </div>
        <Select value={religion} onValueChange={(v) => setReligion(v as Religion)}>
          <SelectTrigger className="h-7 w-auto gap-1 border-none bg-muted/50 px-2 text-[10px] font-body text-muted-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.entries(religionLabels) as [Religion, string][]).map(([key, label]) => (
              <SelectItem key={key} value={key} className="text-xs">{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-base font-display font-medium text-card-foreground leading-relaxed italic">"{devotional.verse}"</p>

      <div className="space-y-3 border-t border-border pt-3">
        <div>
          <p className="text-[10px] font-body tracking-[0.2em] uppercase text-muted-foreground mb-1">Reflexão</p>
          <p className="text-sm font-body text-muted-foreground leading-relaxed">{devotional.reflection}</p>
        </div>
        <div>
          <p className="text-[10px] font-body tracking-[0.2em] uppercase text-muted-foreground mb-1">Prática do Dia</p>
          <p className="text-sm font-body text-muted-foreground leading-relaxed">{devotional.devotional}</p>
        </div>
      </div>
    </section>
  );
}

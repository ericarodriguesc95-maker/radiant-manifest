import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CATEGORIES: Record<string, { emoji: string[]; phrases: string[] }> = {
  Fitness: { emoji: ["💪","🏋️‍♀️","🥗","💧","🔥","🏃‍♀️"], phrases: ["Treino pago","Foco no shape","Hoje tem treino","Bora suar","Disciplina diária","Corpo em construção","Sem desculpas","Dia de perna","Água em dia","Cardio feito","Projeto verão","Mais forte hoje","Treinei sim","Saúde primeiro","Pós treino","Pré treino","Meta batida","Dieta on","Foco e força","Sou constante","Academia é terapia","Suor é progresso","Hábitos saudáveis","Respira e vai","Um dia de cada vez","Glow fitness","Energia lá em cima","Movimento é vida","Eu consigo","Dia vencido"] },
  Empreendedoras: { emoji: ["💼","👑","💰","📈","✨","🚀"], phrases: ["CEO de mim","Dia de vendas","Novidade no ar","Link na bio","Chama no direct","Vagas abertas","Bastidores","Trabalhando duro","Meta do mês","Pedido saindo","Obrigada clientes","Lançamento","Promoção","Últimas vagas","Feito com amor","Empreender é coragem","Sonho grande","Negócio próprio","Foco no lucro","Faturando","Mulher de negócios","Novo produto","Agenda aberta","Resultado real","Cliente feliz","Construindo império","Ela pode tudo","Atendimento on","Prova social","Gratidão"] },
  Estudantes: { emoji: ["📚","✏️","🎓","☕","🧠","📝"], phrases: ["Modo estudo","Foco total","Semana de provas","Café e livros","Revisão feita","Pomodoro on","Aprovada","Rumo à aprovação","Resumos prontos","Estudando hoje","Meta de estudos","Biblioteca vibes","Futura doutora","Mente brilhante","Caderno organizado","Leitura do dia","Sem procrastinar","Formatura vem","Concurseira","Estudar é poder","Prova amanhã","Matéria nova","Questões feitas","Pausa merecida","Conhecimento é luxo","Disciplina vence","Eu vou passar","Rotina de estudos","Nota dez","Bora estudar"] },
  Marketing: { emoji: ["📱","🎬","💡","📊","🎯","📣"], phrases: ["Arrasta pra cima","Salva esse post","Comenta aqui","Novo reels","Enquete","Responde aí","Dica do dia","Você sabia","Antes e depois","Spoiler","Em breve","Ao vivo hoje","Live às 20h","Conteúdo novo","Engajamento","Compartilha","Marca aí","Toque para ver","Mais no feed","Vem ver","Tutorial","Passo a passo","Atenção","Novidade","Top 3","Erro comum","Segredo revelado","Sorteio","Story do dia","Me conta"] },
  Rotina: { emoji: ["☀️","🌙","🧘‍♀️","🗓️","🌸","💖"], phrases: ["Bom dia","Boa noite","Rotina matinal","Autocuidado","Skincare feito","Dia produtivo","Checklist","Momento gratidão","Devocional","Meditação feita","Leitura","Organizando","Dia de folga","Casa limpa","Planner do dia","Café da manhã","Hora do chá","Pausa","Domingo de reset","Segunda nova","Sexta feira","Mood do dia","Dormindo cedo","Acordei cedo","Glow up","Paz interior","Vibes boas","Hoje eu escolho","Rainha da rotina","Extraordinária"] },
};

const STYLES = [
  { bg: "#C57D5B", fg: "#FAF8F5" },
  { bg: "#28201A", fg: "#FAF8F5" },
  { bg: "#F3E1D5", fg: "#28201A" },
  { bg: "#FFF7DE", fg: "#A9623F" },
  { bg: "#F8D7E3", fg: "#8A3B5C" },
  { bg: "#FAF8F5", fg: "#28201A" },
  { bg: "#D8BE84", fg: "#28201A" },
];

function drawSticker(text: string, emoji: string, s: { bg: string; fg: string }) {
  const c = document.createElement("canvas");
  c.width = 600; c.height = 300;
  const x = c.getContext("2d")!;
  x.fillStyle = s.bg; x.strokeStyle = "#FFFFFF"; x.lineWidth = 14;
  x.beginPath(); x.roundRect(12, 12, 576, 276, 130); x.fill(); x.stroke();
  x.textAlign = "center"; x.textBaseline = "middle";
  x.font = "90px serif"; x.fillText(emoji, 300, 105);
  x.fillStyle = s.fg;
  let size = 56; x.font = `italic 700 ${size}px 'Playfair Display', serif`;
  while (x.measureText(text).width > 520 && size > 24) { size -= 2; x.font = `italic 700 ${size}px 'Playfair Display', serif`; }
  x.fillText(text, 300, 210);
  return c.toDataURL("image/png");
}

function download(text: string, emoji: string, s: { bg: string; fg: string }) {
  const a = document.createElement("a");
  a.href = drawSticker(text, emoji, s);
  a.download = `figurinha-${text.toLowerCase().replace(/[^a-z0-9]+/gi, "-")}.png`;
  a.click();
}

function Preview({ text, emoji, s }: { text: string; emoji: string; s: { bg: string; fg: string } }) {
  return (
    <button onClick={() => download(text, emoji, s)} className="group relative flex aspect-[2/1] flex-col items-center justify-center rounded-full border-4 border-background shadow-md transition hover:-translate-y-1" style={{ background: s.bg, color: s.fg }} aria-label={`Baixar figurinha ${text}`}>
      <span className="text-2xl leading-none">{emoji}</span>
      <span className="px-2 text-center font-display text-xs font-bold italic leading-tight">{text}</span>
      <Download className="absolute right-2 top-2 h-3 w-3 opacity-0 group-hover:opacity-80" />
    </button>
  );
}

export default function FigurinhasPage() {
  const cats = Object.keys(CATEGORIES);
  const [cat, setCat] = useState(cats[0]);
  const [q, setQ] = useState("");
  const [limit, setLimit] = useState(84);
  const [myText, setMyText] = useState("Meu dia extraordinário");
  const [myEmoji, setMyEmoji] = useState("👑");
  const [myStyle, setMyStyle] = useState(0);

  const all = useMemo(() => {
    const list: { text: string; emoji: string; s: (typeof STYLES)[number] }[] = [];
    const { emoji, phrases } = CATEGORIES[cat];
    phrases.forEach((p, i) => STYLES.forEach((s, j) => list.push({ text: p, emoji: emoji[(i + j) % emoji.length], s })));
    return list.filter((f) => f.text.toLowerCase().includes(q.toLowerCase()));
  }, [cat, q]);

  const total = cats.reduce((n, c) => n + CATEGORIES[c].phrases.length * STYLES.length, 0);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 pb-28">
      <header>
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Stories</p>
        <h1 className="font-display text-3xl">Figurinhas <em className="text-primary">para stories</em></h1>
        <p className="text-sm text-muted-foreground">{total}+ figurinhas prontas para baixar. Toque em uma para salvar e use no Instagram.</p>
      </header>

      <section className="space-y-3 rounded-3xl border bg-card p-4">
        <h2 className="font-display text-xl">Crie a sua ✨</h2>
        <div className="grid gap-3 sm:grid-cols-[1fr_90px]">
          <Input value={myText} maxLength={40} onChange={(e) => setMyText(e.target.value)} placeholder="Seu texto" />
          <Input value={myEmoji} maxLength={4} onChange={(e) => setMyEmoji(e.target.value)} placeholder="Emoji" />
        </div>
        <div className="flex flex-wrap gap-2">
          {STYLES.map((s, i) => (
            <button key={i} onClick={() => setMyStyle(i)} aria-label={`Estilo ${i + 1}`} className={`h-8 w-8 rounded-full border-2 ${myStyle === i ? "ring-2 ring-primary" : ""}`} style={{ background: s.bg }} />
          ))}
        </div>
        <div className="flex items-center gap-4">
          <div className="w-48"><Preview text={myText || " "} emoji={myEmoji} s={STYLES[myStyle]} /></div>
          <Button className="rounded-full" onClick={() => download(myText, myEmoji, STYLES[myStyle])}><Download className="mr-2 h-4 w-4" />Baixar</Button>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        {cats.map((c) => (
          <button key={c} onClick={() => { setCat(c); setLimit(84); }} className={`rounded-full border px-4 py-1.5 text-sm ${cat === c ? "bg-foreground text-background" : ""}`}>{c}</button>
        ))}
      </div>
      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar figurinha..." />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {all.slice(0, limit).map((f, i) => <Preview key={i} {...f} />)}
      </div>
      {limit < all.length && (
        <div className="text-center"><Button variant="outline" className="rounded-full" onClick={() => setLimit(limit + 84)}>Ver mais</Button></div>
      )}
    </div>
  );
}

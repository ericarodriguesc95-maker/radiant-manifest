import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CATEGORIES: Record<string, { emoji: string[]; phrases: string[] }> = {
  "Fé": { emoji: ["🙏","✝️","🕊️","📖","💛","✨"], phrases: ["Deus no controle","Gratidão a Deus","Fé que move","Orando por você","De joelhos","Ele é fiel","Tudo posso","Deus é bom","Em oração","Fé e foco","Abençoada","Confia no processo","Deus cuida","Salmo do dia","Palavra viva","Coração grato","Meu refúgio","Graça sobre graça","Deus sabe","Paz de Cristo","Milagre vem","Filha do Rei","Louvando","Na presença","Fé inabalável","Devocional feito","Deus proverá","Glória a Deus","Amém","De comer rezando"] },
  "Skincare": { emoji: ["🧴","✨","🌸","💆‍♀️","🫧","💧"], phrases: ["Skincare feito","Pele de vidro","Glow natural","Protetor sempre","Hidratada","Noite de máscara","Rotina de pele","Vitamina C on","Ácido da noite","Cuidando de mim","Pele em dia","Limpeza feita","Skin first","Autocuidado","Pele de pêssego","Sérum aplicado","Brilho próprio","Sem filtro","Pele feliz","Beleza natural","Hora do skincare","Antes e depois","Tônico ok","Spa em casa","Glow up","Pele renovada","Cuida da pele","Banho de lua","Olheiras out","Make leve"] },
  "Bom dia": { emoji: ["☀️","☕","🌻","🌅","💛","🌼"], phrases: ["Bom dia","Bom dia, mundo","Café primeiro","Acordei grata","Dia lindo","Bom dia, Deus","Novo dia","Bora viver","Bom dia, rainha","Sol de hoje","Começando o dia","Manhã abençoada","Bom dia, amores","Energia boa","Acordei cedo","Rotina matinal","Que dia lindo","Bom dia, vida","Hoje vai dar certo","Despertando","Bom dia, gente","Primeiro o café","Dia de vencer","Gratidão matinal","Manhã produtiva","Café com fé","Sorria","Mais um dia","Bom dia, sol","Partiu dia"] },
  "Boa tarde": { emoji: ["🌤️","🍃","☕","🌷","💫","🍰"], phrases: ["Boa tarde","Boa tarde, amores","Café da tarde","Tarde produtiva","Pausa merecida","Boa tarde, gente","Metade do dia","Seguindo firme","Hora do lanche","Tarde linda","Boa tarde, rainha","Foco na tarde","Chá das cinco","Tarde abençoada","Respira","Bora terminar","Ainda dá tempo","Tarde de sol","Boa tarde, vida","Vibe da tarde","Recarregando","Tarde em paz","Café e foco","Lanchinho","Pôr do sol","Quase lá","Tarde feliz","Gratidão","Boa tarde, mundo","Segue o baile"] },
  "Boa noite": { emoji: ["🌙","✨","🛌","⭐","💤","🌌"], phrases: ["Boa noite","Boa noite, amores","Hora de dormir","Dia vencido","Missão cumprida","Doces sonhos","Boa noite, Deus","Descansando","Até amanhã","Noite de paz","Sono dos justos","Boa noite, rainha","Desligando","Chá e cama","Gratidão pelo dia","Lua linda","Noite de skincare","Recarregar","Durma bem","Boa noite, gente","Fim de expediente","Pijama on","Noite abençoada","Dormindo cedo","Sonhe alto","Amanhã tem mais","Boa noite, mundo","Silêncio","Paz interior","Cama chamando"] },
  "Motivacionais": { emoji: ["🔥","🚀","💪","🌟","🎯","👑"], phrases: ["Você consegue","Não desista","Um passo por vez","Só vai","Acredite","Feito é melhor","Seja constante","Foco no objetivo","Você é capaz","Disciplina vence","Recomece","Sonhe grande","Nada me para","O melhor está vindo","Persista","Confie em você","Faça por você","Coragem","Mais forte hoje","Vai dar certo","Seja luz","Plante hoje","Siga em frente","É o seu momento","Ninguém te para","Evoluindo","Pequenos passos","Hoje sim","Bora vencer","Extraordinária"] },
  "Engraçadas": { emoji: ["😂","🤪","🙃","😅","🫠","🤡"], phrases: ["Socorro","Só por hoje","Fingindo costume","Plena","Sofrendo bonita","Café ou caos","Cansada mas linda","Dieta amanhã","Eu ri","Me ajuda","Chorei aqui","Sem paciência","Modo avião","Vida de adulta","Boleto pago","Sobrevivi","Nem ligo","Eu mereço","Que fase","Falei nada","Deu ruim","Tô passada","Nunca nem vi","Rindo de nervoso","Essa sou eu","Me deixa","Ai que preguiça","Tô de boa","Que vergonha","Já volto"] },
  "Bordões": { emoji: ["🤌","💅","😎","👀","🗣️","🔥"], phrases: ["Paz e amor","Vai dar namoro","Ranço","Lacrou","Tá tranquilo","Tá favorável","É sobre isso","E tá tudo bem","Gratiluz","Sextou","Deu bom","Não é mesmo","Aceita que dói menos","Só observo","Que isso, novinha","Arrasou","Ninguém solta a mão","Hoje não","Diva","Mulher","Brilha muito","Respeita","Sem condições","Pode isso?","Rainha","Vem tranquilo","Maravilhosa","Já pode casar","Faz o L de luxo","Chique é ser feliz"] },
  "Datas": { emoji: ["🎉","🎄","💝","🐰","🎂","🎆"], phrases: ["Feliz Natal","Feliz Ano Novo","Feliz Páscoa","Dia das Mães","Dia dos Pais","Dia da Mulher","Dia dos Namorados","Feliz aniversário","Parabéns","Carnaval","Festa junina","Arraiá","Dia das Crianças","Black Friday","Feriado","Boas festas","Dia do amigo","Dia da avó","Outubro Rosa","Novembro Azul","Setembro Amarelo","Halloween","Réveillon","Dia do cliente","Dia do professor","Dia da secretária","Dia do trabalho","Volta às aulas","Primavera chegou","Férias"] },
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

export type Effect = "pilula" | "escrita" | "giz";
export const EFFECTS: { id: Effect; label: string }[] = [
  { id: "escrita", label: "✍️ Escrita" },
  { id: "giz", label: "🖍️ Giz" },
  { id: "pilula", label: "💊 Pílula" },
];
type St = { bg: string; fg: string };

function splitLines(text: string) {
  const w = text.split(" ");
  if (w.length < 2) return ["", text];
  const k = Math.ceil(w.length / 2) - (w.length > 2 ? 0 : 0);
  return [w.slice(0, k).join(" "), w.slice(k).join(" ")];
}

function fit(x: CanvasRenderingContext2D, text: string, font: (n: number) => string, start: number, max: number) {
  let n = start; x.font = font(n);
  while (x.measureText(text).width > max && n > 20) { n -= 2; x.font = font(n); }
}

function chalkify(x: CanvasRenderingContext2D, w: number, h: number) {
  x.save(); x.globalCompositeOperation = "destination-out";
  for (let i = 0; i < 9000; i++) {
    x.globalAlpha = Math.random() * 0.7;
    x.fillRect(Math.random() * w, Math.random() * h, Math.random() * 2.5, Math.random() * 1.5);
  }
  x.globalCompositeOperation = "destination-over"; x.restore();
}

function drawSticker(text: string, emoji: string, s: St, effect: Effect) {
  const c = document.createElement("canvas");
  c.width = 800; c.height = 400;
  const x = c.getContext("2d")!;
  x.textAlign = "center"; x.textBaseline = "middle";
  if (effect === "pilula") {
    x.fillStyle = s.bg; x.strokeStyle = "#FFFFFF"; x.lineWidth = 16;
    x.beginPath(); x.roundRect(20, 50, 760, 300, 150); x.fill(); x.stroke();
    x.font = "90px serif"; x.fillText(emoji, 400, 150);
    x.fillStyle = s.fg;
    fit(x, text, (n) => `italic 700 ${n}px 'Playfair Display', serif`, 64, 680);
    x.fillText(text, 400, 265);
  } else {
    const [l1, l2] = splitLines(text);
    const color = effect === "giz" ? "#FFFFFF" : s.bg;
    x.fillStyle = color;
    x.shadowColor = effect === "giz" ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.9)";
    x.shadowBlur = effect === "giz" ? 4 : 10;
    if (l1) {
      fit(x, l1, (n) => effect === "giz" ? `${n}px 'Gochi Hand', cursive` : `700 ${n}px 'Caveat', cursive`, 96, 680);
      x.fillText(l1, 400, 140);
    }
    fit(x, l2, (n) => effect === "giz" ? `${n}px 'Gochi Hand', cursive` : `700 ${n}px 'Fredoka', sans-serif`, 120, 700);
    x.fillText(l2, 400, l1 ? 250 : 200);
    x.shadowBlur = 0;
    x.font = "54px serif"; x.fillText(emoji, 400, 350);
    if (effect === "giz") chalkify(x, 800, 330);
  }
  return c.toDataURL("image/png");
}

async function download(text: string, emoji: string, s: St, effect: Effect) {
  try { await document.fonts.load("700 40px Caveat"); await document.fonts.load("40px 'Gochi Hand'"); await document.fonts.load("700 40px Fredoka"); } catch { /* ignore */ }
  const a = document.createElement("a");
  a.href = drawSticker(text, emoji, s, effect);
  a.download = `figurinha-${text.toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/gi, "-")}.png`;
  a.click();
}

function Preview({ text, emoji, s, effect }: { text: string; emoji: string; s: St; effect: Effect }) {
  const [l1, l2] = splitLines(text);
  if (effect === "pilula") return (
    <button onClick={() => download(text, emoji, s, effect)} className="group relative flex aspect-[2/1] flex-col items-center justify-center rounded-full border-4 border-background shadow-md transition hover:-translate-y-1" style={{ background: s.bg, color: s.fg }} aria-label={`Baixar figurinha ${text}`}>
      <span className="text-2xl leading-none">{emoji}</span>
      <span className="px-2 text-center font-display text-xs font-bold italic leading-tight">{text}</span>
      <Download className="absolute right-2 top-2 h-3 w-3 opacity-0 group-hover:opacity-80" />
    </button>
  );
  const giz = effect === "giz";
  return (
    <button onClick={() => download(text, emoji, s, effect)} className="group relative flex aspect-[2/1] flex-col items-center justify-center overflow-hidden rounded-2xl border shadow-sm transition hover:-translate-y-1" style={{ background: giz ? "#2F3B33" : "repeating-conic-gradient(#f4efe9 0% 25%, #fbf8f5 0% 50%) 50% / 16px 16px", color: giz ? "#FFFFFF" : s.bg }} aria-label={`Baixar figurinha ${text}`}>
      {l1 && <span className="px-2 text-center text-lg leading-none" style={{ fontFamily: giz ? "'Gochi Hand', cursive" : "'Caveat', cursive", fontWeight: 700, opacity: giz ? 0.9 : 1 }}>{l1}</span>}
      <span className="px-2 text-center text-base leading-tight" style={{ fontFamily: giz ? "'Gochi Hand', cursive" : "'Fredoka', sans-serif", fontWeight: 700, textShadow: giz ? "0 0 2px rgba(255,255,255,.7)" : "0 0 6px #fff" }}>{l2}</span>
      <span className="text-sm leading-none">{emoji}</span>
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
  const [effect, setEffect] = useState<Effect>("escrita");

  const all = useMemo(() => {
    const list: { text: string; emoji: string; s: (typeof STYLES)[number] }[] = [];
    const { emoji, phrases } = CATEGORIES[cat];
    phrases.forEach((p, i) => STYLES.forEach((s, j) => list.push({ text: p, emoji: emoji[(i + j) % emoji.length], s })));
    return list.filter((f) => f.text.toLowerCase().includes(q.toLowerCase()));
  }, [cat, q]);

  const total = cats.reduce((n, c) => n + CATEGORIES[c].phrases.length * STYLES.length, 0) * EFFECTS.length;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 pb-28">
      <header>
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Stories</p>
        <h1 className="font-display text-3xl">Figurinhas <em className="text-primary">para stories</em></h1>
        <p className="text-sm text-muted-foreground">{total}+ figurinhas prontas para baixar. Escolha o efeito (escrita, giz ou pílula), toque para salvar com fundo transparente e use no Instagram.</p>
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
          <div className="w-48"><Preview text={myText || " "} emoji={myEmoji} s={STYLES[myStyle]} effect={effect} /></div>
          <Button className="rounded-full" onClick={() => download(myText, myEmoji, STYLES[myStyle], effect)}><Download className="mr-2 h-4 w-4" />Baixar</Button>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        <span className="self-center text-[11px] uppercase tracking-widest text-muted-foreground">Efeito</span>
        {EFFECTS.map((e) => (
          <button key={e.id} onClick={() => setEffect(e.id)} className={`rounded-full border px-4 py-1.5 text-sm ${effect === e.id ? "bg-primary text-primary-foreground" : ""}`}>{e.label}</button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {cats.map((c) => (
          <button key={c} onClick={() => { setCat(c); setLimit(84); }} className={`rounded-full border px-4 py-1.5 text-sm ${cat === c ? "bg-foreground text-background" : ""}`}>{c}</button>
        ))}
      </div>
      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar figurinha..." />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {all.slice(0, limit).map((f, i) => <Preview key={i} {...f} effect={effect} />)}
      </div>
      {limit < all.length && (
        <div className="text-center"><Button variant="outline" className="rounded-full" onClick={() => setLimit(limit + 84)}>Ver mais</Button></div>
      )}
    </div>
  );
}

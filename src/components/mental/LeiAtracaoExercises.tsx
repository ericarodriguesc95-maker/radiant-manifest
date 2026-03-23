import { useState, useEffect } from "react";
import { ArrowLeft, Pen, Send, Sparkles, Trash2, Brain, ChevronDown, ChevronUp, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Exercise {
  id: string;
  title: string;
  category: "financeiro" | "autoconfianca" | "carreira" | "relacionamento" | "geral";
  instruction: string;
  neurociencia: string;
  dicaPratica: string;
  type: "escrita" | "visualizacao" | "acao";
}

const exercises: Exercise[] = [
  { id: "la1", title: "Carta ao Universo (Metas Financeiras)", category: "financeiro", type: "escrita", instruction: "Escreva uma carta detalhada ao universo descrevendo sua vida financeira ideal. Use o presente: 'Eu tenho', 'Eu ganho'. Inclua valores específicos, sensações e como você usa esse dinheiro para impactar vidas.", neurociencia: "Ao escrever metas específicas no presente, você ativa o Sistema Ativador Reticular (RAS), que começa a filtrar oportunidades financeiras alinhadas. Estudos da Dominican University mostraram que escrever metas aumenta em 42% a probabilidade de alcançá-las.", dicaPratica: "Escreva logo ao acordar, quando o córtex pré-frontal está mais ativo e o cérebro em ondas Alpha — perfeito para programação." },
  { id: "la2", title: "Afirmações 'Eu Sou' para Autoconfiança", category: "autoconfianca", type: "escrita", instruction: "Complete 15 frases começando com 'Eu sou...' focando em qualidades que deseja manifestar. Ex: 'Eu sou magnética', 'Eu sou irresistível em negociações', 'Eu sou digna de sucesso'.", neurociencia: "Afirmações em primeira pessoa ativam o córtex pré-frontal ventromedial, área ligada à autoimagem. Com repetição (mínimo 21 dias), criam novos caminhos neurais que substituem crenças limitantes armazenadas na amígdala.", dicaPratica: "Cole post-its com suas 3 melhores afirmações no espelho do banheiro. Repita em voz alta durante a rotina matinal." },
  { id: "la3", title: "Gratidão Antecipada (Carreira)", category: "carreira", type: "escrita", instruction: "Agradeça por 10 conquistas profissionais que ainda não aconteceram, como se já fossem reais. Ex: 'Obrigada pela promoção para gerente', 'Obrigada pelo contrato com o cliente X'.", neurociencia: "A gratidão antecipada engana o cérebro positivamente — ele libera dopamina e serotonina como se a conquista já tivesse ocorrido. Isso cria um estado emocional que atrai comportamentos alinhados com o sucesso.", dicaPratica: "Faça no trajeto do ônibus/metrô pela manhã. Use o bloco de notas do celular se preferir." },
  { id: "la4", title: "Meu Dia Perfeito de Trabalho", category: "carreira", type: "visualizacao", instruction: "Descreva em detalhes como seria seu dia perfeito de trabalho, do amanhecer ao anoitecer. Inclua onde trabalha, com quem, quanto ganha, como se sente. Use todos os 5 sentidos na descrição.", neurociencia: "A visualização detalhada ativa as mesmas áreas motoras e sensoriais do cérebro que a experiência real (pesquisa da Cleveland Clinic). Seu cérebro literalmente 'ensaia' o sucesso, criando familiaridade neural com o resultado desejado.", dicaPratica: "Leia sua descrição antes de dormir — o subconsciente processa durante o sono e consolida a 'memória futura'." },
  { id: "la5", title: "Reenquadramento de Crenças sobre Dinheiro", category: "financeiro", type: "escrita", instruction: "Liste 10 crenças limitantes sobre dinheiro que herdou da família (Ex: 'Dinheiro não dá em árvore', 'Rico é desonesto'). Para cada uma, escreva a versão oposta e fortalecedora.", neurociencia: "Crenças limitantes são circuitos neurais consolidados pela repetição na infância. O reenquadramento consciente ativa a neuroplasticidade — ao repetir a nova crença, você enfraquece o circuito antigo e fortalece o novo (Lei de Hebb).", dicaPratica: "Faça este exercício uma vez e revise semanalmente. Leia as novas crenças em voz alta antes de reuniões sobre dinheiro." },
  { id: "la6", title: "Visualização Criativa: Cliente Ideal", category: "carreira", type: "visualizacao", instruction: "Feche os olhos por 5 minutos e visualize seu cliente ideal entrando em contato. Veja o e-mail/mensagem chegando. Sinta a alegria. Visualize a negociação fluindo e o contrato sendo assinado.", neurociencia: "O RAS não diferencia entre experiência real e vividamente imaginada. Ao visualizar repetidamente o cenário desejado, você treina seu cérebro para reconhecer oportunidades reais que se assemelham à visualização.", dicaPratica: "Faça 5 min antes de abrir e-mails ou entrar no LinkedIn. Isso 'calibra' seu RAS para oportunidades do dia." },
  { id: "la7", title: "Journaling de Gratidão (Diário)", category: "geral", type: "escrita", instruction: "Escreva 5 coisas pelas quais é grata hoje + 3 coisas que deram certo (mesmo pequenas) + 1 coisa que aprendeu. Seja específica: não 'família', mas 'a risada da minha filha hoje às 19h'.", neurociencia: "A gratidão específica ativa mais intensamente o córtex cingulado e a ínsula anterior do que a gratidão genérica. Pesquisadores da Indiana University provaram que journaling de gratidão por 4 semanas muda padrões de ativação cerebral por meses.", dicaPratica: "Use os últimos 5 min antes de dormir. Pode ser no celular. A consistência importa mais que a extensão." },
  { id: "la8", title: "Script de Abundância (369)", category: "financeiro", type: "escrita", instruction: "Método 369 de Nikola Tesla adaptado: Escreva sua afirmação financeira principal 3x pela manhã, 6x à tarde, 9x antes de dormir. Ex: 'Eu ganho R$20.000/mês com facilidade e ajudando pessoas'.", neurociencia: "A repetição espaçada é o método mais eficaz de consolidação de memória de longo prazo (curva de Ebbinghaus). Escrever 3 vezes ao dia cria 'checkpoints' neurais que reforçam a crença progressivamente.", dicaPratica: "Use um caderninho dedicado. Leva apenas 3 minutos por sessão. Faça por 33 dias consecutivos para resultado máximo." },
  { id: "la9", title: "Mapa de Evidências", category: "autoconfianca", type: "escrita", instruction: "Liste 20 conquistas da sua vida — de pequenas a grandes. Formatado: o desafio + como você superou + o resultado. Isso prova ao seu cérebro que você é capaz de realizar o que deseja.", neurociencia: "Revisitar sucessos passados ativa o circuito de recompensa (núcleo accumbens → córtex pré-frontal) e libera dopamina. Isso contrabalança o viés de negatividade do cérebro, que naturalmente lembra mais das falhas.", dicaPratica: "Mantenha essa lista no celular. Leia antes de entrevistas, apresentações ou momentos de dúvida." },
  { id: "la10", title: "Visualização do Futuro Eu (5 anos)", category: "geral", type: "visualizacao", instruction: "Escreva uma carta da sua versão de 5 anos no futuro para você de hoje. O que ela diria? Quais conselhos daria? Como é a vida dela? Quais decisões de hoje ela mais agradece?", neurociencia: "A 'viagem mental no tempo' ativa o hipocampo e o córtex pré-frontal medial simultaneamente. Pesquisas mostram que pessoas que se conectam emocionalmente com seu 'eu futuro' tomam decisões mais sábias no presente.", dicaPratica: "Faça em um momento tranquilo do fim de semana. Guarde a carta e releia mensalmente." },
  { id: "la11", title: "Prospecção Mental de Clientes", category: "carreira", type: "acao", instruction: "Antes de prospectar, escreva 5 qualidades que você oferece + 3 problemas que resolve + o resultado que entrega. Depois visualize-se apresentando isso com confiança e carisma para o cliente.", neurociencia: "Preparação mental ativa a memória de trabalho no córtex pré-frontal dorsolateral, facilitando acesso rápido aos argumentos durante a conversa real. É o equivalente mental de um aquecimento antes do exercício.", dicaPratica: "Faça 10 min antes de cada sessão de prospecção. Use como ritual pré-ligação/e-mail." },
  { id: "la12", title: "Diário de Sincronicidades", category: "geral", type: "escrita", instruction: "Registre toda 'coincidência significativa' do dia: pessoas que apareceram na hora certa, oportunidades inesperadas, insights súbitos. Ao notar padrões, você treina o RAS para captar mais.", neurociencia: "O RAS funciona por confirmação de padrões. Ao documentar sincronicidades, você treina conscientemente seu filtro atencional para notar mais conexões — criando um ciclo virtuoso de percepção-oportunidade.", dicaPratica: "Mantenha uma nota no celular só para isso. Uma frase por sincronicidade basta." },
  { id: "la13", title: "Afirmações de Merecimento", category: "autoconfianca", type: "escrita", instruction: "Escreva 10 frases que começam com 'Eu mereço...' relacionadas a dinheiro, amor, saúde e carreira. Após escrever, leia em voz alta olhando no espelho.", neurociencia: "Muitas pessoas têm um 'teto de merecimento' inconsciente — um limite máximo de sucesso que o subconsciente permite. As afirmações de merecimento reprogramam o sistema límbico para aceitar novos patamares.", dicaPratica: "Fale em voz alta no banheiro com a porta fechada se tiver vergonha. O ato de ouvir sua própria voz reforça 3x mais que ler em silêncio." },
  { id: "la14", title: "Check-In de Vibração", category: "geral", type: "acao", instruction: "3x ao dia (manhã, tarde, noite), pause 30 segundos e pergunte: 'Em qual frequência estou agora? 1 (baixa) a 10 (alta)?'. Se estiver abaixo de 6, faça uma ação para subir: música, respiração, gratidão.", neurociencia: "A autoconsciência emocional (interoceptção) é uma habilidade treinável. Pessoas com alta interoceptção tomam decisões melhores e têm maior regulação emocional. O check-in treina a ínsula anterior.", dicaPratica: "Coloque 3 alarmes no celular com o texto '🌟 Vibração?'. Em 30 dias isso vira automático." },
  { id: "la15", title: "Carta de Liberação", category: "geral", type: "escrita", instruction: "Escreva uma carta a tudo que quer liberar: medos, rancores, crenças. Seja específica e honesta. No final, escreva: 'Eu escolho me libertar agora'. (Opcional: queime ou rasgue a carta como ritual).", neurociencia: "A escrita expressiva (Pennebaker, UT Austin) reduz sintomas de estresse em 25-30% e melhora a função imunológica. Externalizar pensamentos reduz a atividade da amígdala e fortalece o controle pré-frontal.", dicaPratica: "Faça em um momento privado. Não se censure — ninguém vai ler. Chorar é liberador e parte do processo." },
  { id: "la16", title: "Quadro de Visão Mental", category: "financeiro", type: "visualizacao", instruction: "Sem recortar revistas, crie um quadro de visão mental: feche os olhos e 'monte' seu painel ideal com imagens do que quer manifestar. A casa, o carro, a viagem, o saldo bancário. Descreva-o por escrito depois.", neurociencia: "A visualização mental ativa o lobo occipital (processamento visual) mesmo sem estímulo externo. Quanto mais detalhada, mais neurônios são recrutados, e mais o RAS entende o que deve priorizar.", dicaPratica: "Faça uma vez por semana e refine. Depois, crie um quadro real com imagens do Pinterest ou revistas." },
  { id: "la17", title: "Diálogo com o Medo", category: "autoconfianca", type: "escrita", instruction: "Personifique seu medo e escreva um diálogo com ele. Pergunte: 'O que você está tentando me proteger?'. Ouça a resposta. Depois diga: 'Obrigada pela proteção, mas eu consigo a partir daqui'.", neurociencia: "A personificação de emoções (técnica da terapia IFS — Internal Family Systems) reduz a identificação com o medo. Ao tratá-lo como uma 'parte' separada, você ativa o observador interno (córtex pré-frontal) em vez de reagir automaticamente.", dicaPratica: "Faça quando sentir uma resistência forte antes de algo importante — é o medo falando." },
  { id: "la18", title: "Afirmações de Vendas/Negócios", category: "carreira", type: "escrita", instruction: "Escreva 10 afirmações sobre sua capacidade profissional: 'Eu atraio clientes que valorizam meu trabalho', 'Meus preços refletem meu valor', 'Eu fecho negócios com facilidade'.", neurociencia: "Afirmações específicas ao contexto profissional ativam a memória semântica associada ao trabalho, criando priming positivo. Você entra em reuniões com o estado neural de quem já venceu.", dicaPratica: "Leia em voz alta no carro antes de chegar ao trabalho. 3 minutos bastam." },
  { id: "la19", title: "Journaling: O que preciso ouvir hoje?", category: "autoconfianca", type: "escrita", instruction: "Pergunte ao seu eu interior: 'O que eu preciso ouvir hoje?'. Escreva sem pensar, sem editar, por 5 minutos corridos. Deixe fluir. A resposta pode te surpreender.", neurociencia: "A escrita livre (freewriting) desativa o córtex pré-frontal dorsolateral — o 'editor interno' — permitindo acesso a conteúdos do subconsciente. É similar ao estado hipnagógico (entre vigília e sono).", dicaPratica: "Faça imediatamente ao acordar, antes de olhar o celular, quando a mente racional ainda está 'desligando'." },
  { id: "la20", title: "Ritual de Fechamento: Semana em Revisão", category: "geral", type: "escrita", instruction: "Todo domingo, responda: 1) O que manifestei esta semana? 2) O que aprendi? 3) O que libero? 4) O que quero criar na próxima semana? 5) Qual minha intenção nº1?", neurociencia: "A revisão semanal é uma forma de metacognição — 'pensar sobre o pensamento'. Ativa o córtex pré-frontal medial e consolida aprendizados no hipocampo, transformando experiências em sabedoria aplicável.", dicaPratica: "Domingo à noite, com um chá. Leva 15 min. É o hábito de alta performance mais subestimado." },
];

const categoryLabels = [
  { id: "all", label: "Todos" },
  { id: "financeiro", label: "💰 Financeiro" },
  { id: "autoconfianca", label: "👑 Autoconfiança" },
  { id: "carreira", label: "💼 Carreira" },
  { id: "geral", label: "✨ Geral" },
];

interface Entry { id: string; exerciseId: string; text: string; date: string; }

export default function LeiAtracaoExercises({ onBack }: { onBack: () => void }) {
  const [entries, setEntries] = useState<Entry[]>(() => {
    try { return JSON.parse(localStorage.getItem("lei-atracao-entries") || "[]"); } catch { return []; }
  });
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [view, setView] = useState<"exercicios" | "diario">("exercicios");
  const [filterCat, setFilterCat] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem("lei-atracao-entries", JSON.stringify(entries));
  }, [entries]);

  const completedIds = new Set(entries.map(e => e.exerciseId));
  const filtered = filterCat === "all" ? exercises : exercises.filter(e => e.category === filterCat);

  const saveEntry = () => {
    if (!text.trim() || !activeExercise) return;
    const entry: Entry = { id: Date.now().toString(), exerciseId: activeExercise, text, date: new Date().toLocaleDateString("pt-BR") };
    setEntries(prev => [entry, ...prev]);
    setText("");
    setActiveExercise(null);
  };

  const activeEx = exercises.find(e => e.id === activeExercise);

  return (
    <div className="min-h-screen">
      <header className="px-5 pt-12 pb-2">
        <button onClick={onBack} className="flex items-center gap-1 text-muted-foreground text-sm font-body mb-2">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>
        <h1 className="text-xl font-display font-bold">Lei da Atração & RAS <span className="text-gold">✦</span></h1>
        <p className="text-xs text-muted-foreground font-body mt-1">20 exercícios para manifestar sua vida ideal</p>
        <p className="text-[10px] text-gold font-body">{completedIds.size}/20 completados</p>
      </header>

      {/* RAS explanation banner */}
      <div className="px-5 mb-3">
        <div className="bg-purple-500/5 rounded-xl p-3 border border-purple-500/10">
          <div className="flex items-center gap-1.5 mb-1">
            <Brain className="h-3.5 w-3.5 text-purple-500" />
            <p className="text-[10px] font-body font-semibold text-purple-500 uppercase tracking-wider">RAS — Sistema Ativador Reticular</p>
          </div>
          <p className="text-[10px] font-body text-muted-foreground leading-relaxed">
            Seu cérebro processa ~11 milhões de bits/s, mas só ~50 chegam à consciência. O RAS decide quais. Estes exercícios treinam seu RAS para priorizar oportunidades alinhadas com suas metas.
          </p>
        </div>
      </div>

      <div className="px-5 space-y-3 pb-6">
        {/* Tabs */}
        <div className="flex gap-2">
          {(["exercicios", "diario"] as const).map(t => (
            <button key={t} onClick={() => { setView(t); setActiveExercise(null); }} className={cn("px-4 py-2 rounded-full text-xs font-body font-medium transition-all", view === t ? "bg-gold text-primary-foreground" : "bg-card text-muted-foreground border border-border")}>
              {t === "exercicios" ? "Exercícios" : `Diário (${entries.length})`}
            </button>
          ))}
        </div>

        {view === "exercicios" && !activeExercise && (
          <>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categoryLabels.map(c => (
                <button key={c.id} onClick={() => setFilterCat(c.id)} className={cn("text-[10px] font-body px-3 py-1.5 rounded-full border whitespace-nowrap transition-all", filterCat === c.id ? "bg-gold/20 border-gold text-gold" : "border-border text-muted-foreground")}>
                  {c.label}
                </button>
              ))}
            </div>
            <div className="space-y-2.5">
              {filtered.map(ex => {
                const isExpanded = expandedId === ex.id;
                const done = completedIds.has(ex.id);
                return (
                  <div key={ex.id} className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
                    <button onClick={() => setExpandedId(isExpanded ? null : ex.id)} className="w-full p-3.5 flex items-center gap-3 text-left">
                      <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0 text-xs", done ? "bg-gold/20 text-gold" : "bg-muted text-muted-foreground")}>
                        {done ? "✦" : ex.type === "escrita" ? "✍️" : ex.type === "visualizacao" ? "👁️" : "⚡"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-body font-semibold truncate">{ex.title}</p>
                        <p className="text-[10px] text-muted-foreground font-body truncate">{ex.instruction.slice(0, 60)}...</p>
                      </div>
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
                    </button>
                    {isExpanded && (
                      <div className="px-3.5 pb-3.5 space-y-2.5 animate-fade-in">
                        <p className="text-xs font-body text-foreground leading-relaxed">{ex.instruction}</p>
                        <div className="bg-purple-500/5 rounded-lg p-2.5 border border-purple-500/10">
                          <p className="text-[10px] font-body font-semibold text-purple-500 mb-0.5">🧠 Neurociência</p>
                          <p className="text-[10px] font-body text-muted-foreground leading-relaxed">{ex.neurociencia}</p>
                        </div>
                        <div className="bg-gold/5 rounded-lg p-2.5 border border-gold/10">
                          <p className="text-[10px] font-body font-semibold text-gold mb-0.5">💡 Dica prática</p>
                          <p className="text-[10px] font-body text-muted-foreground leading-relaxed">{ex.dicaPratica}</p>
                        </div>
                        {ex.type === "escrita" && (
                          <Button variant="gold" size="sm" onClick={() => setActiveExercise(ex.id)} className="w-full">
                            <Pen className="h-3.5 w-3.5 mr-1" /> Começar exercício
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {view === "exercicios" && activeExercise && activeEx && (
          <div className="bg-card rounded-2xl border border-border p-4 space-y-3 animate-fade-in">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-gold" />
              <span className="text-sm font-body font-semibold">{activeEx.title}</span>
            </div>
            <p className="text-xs text-muted-foreground font-body leading-relaxed italic">{activeEx.instruction}</p>
            <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Comece a escrever aqui..." rows={8} className="w-full bg-muted/50 rounded-xl p-3 text-sm font-body outline-none resize-none placeholder:text-muted-foreground" autoFocus />
            <div className="flex gap-2">
              <Button variant="gold" size="sm" onClick={saveEntry} disabled={!text.trim()}>
                <Send className="h-3.5 w-3.5 mr-1" /> Salvar
              </Button>
              <Button variant="ghost" size="sm" onClick={() => { setActiveExercise(null); setText(""); }}>
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {view === "diario" && (
          <div className="space-y-2.5">
            {entries.length === 0 ? (
              <div className="text-center py-12">
                <Pen className="h-8 w-8 text-gold/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground font-body">Nenhuma entrada ainda</p>
              </div>
            ) : entries.map(entry => {
              const ex = exercises.find(e => e.id === entry.exerciseId);
              return (
                <div key={entry.id} className="bg-card rounded-2xl border border-border p-4 shadow-card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-body font-semibold text-gold">{ex?.title || "Exercício"}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground font-body">{entry.date}</span>
                      <button onClick={() => setEntries(prev => prev.filter(e => e.id !== entry.id))}>
                        <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm font-body text-foreground leading-relaxed whitespace-pre-wrap">{entry.text}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

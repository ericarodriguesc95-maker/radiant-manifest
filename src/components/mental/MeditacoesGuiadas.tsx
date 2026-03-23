import { useState, useRef, useEffect, useCallback } from "react";
import { ArrowLeft, Play, Pause, SkipForward, Clock, Volume2, VolumeX, Music, TreePine, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface Meditation {
  id: string;
  title: string;
  description: string;
  duration: string;
  durationSec: number;
  emoji: string;
  category: "foco" | "ansiedade" | "sono" | "autoestima" | "abundancia" | "cura";
  steps: string[];
  dicaPratica: string;
}

const meditations: Meditation[] = [
  { id: "1", title: "Foco Laser para o Trabalho", description: "Ative Beta alto antes de tarefas importantes", duration: "8 min", durationSec: 480, emoji: "🎯", category: "foco", dicaPratica: "Use nos primeiros 8 min da manhã antes de abrir e-mails.", steps: ["Sente-se com a coluna ereta. Feche os olhos.", "Respire fundo: inspire 4s, segure 4s, expire 4s.", "Visualize um feixe de luz dourada saindo da sua testa.", "Esse feixe ilumina exatamente a tarefa mais importante do dia.", "Veja cada detalhe da tarefa sendo completada com excelência.", "Sinta a satisfação de concluir com maestria.", "Repita: 'Minha mente é afiada e focada'.", "Abra os olhos lentamente e comece."] },
  { id: "2", title: "Alívio de Ansiedade Pós-Reunião", description: "Reduza cortisol com respiração 4-7-8", duration: "6 min", durationSec: 360, emoji: "🌊", category: "ansiedade", dicaPratica: "Faça logo após sair da reunião, até no banheiro do escritório.", steps: ["Encontre um lugar para sentar. Pode ser a cadeira do escritório.", "Coloque as mãos sobre as coxas, palmas para cima.", "Inspire pelo nariz contando até 4.", "Segure o ar contando até 7.", "Expire lentamente pela boca contando até 8.", "Repita 4 ciclos de 4-7-8.", "Imagine cada expiração levando embora a tensão da reunião.", "Sinta seus ombros descendo e a mandíbula relaxando.", "Repita: 'Eu sou calma. Eu sou capaz'."] },
  { id: "3", title: "Sono Reparador", description: "Relaxamento progressivo para dormir profundamente", duration: "15 min", durationSec: 900, emoji: "🌙", category: "sono", dicaPratica: "Faça deitada na cama, com luzes apagadas e fones. Não se preocupe em ouvir até o final — adormecer é o objetivo.", steps: ["Deite-se confortavelmente e feche os olhos.", "Respire naturalmente e observe o ar entrando e saindo.", "Relaxe os músculos do rosto. Solte a testa, os olhos, o maxilar.", "Deixe os ombros derrreterem no colchão.", "Relaxe os braços, as mãos, cada dedo.", "Solte o abdômen completamente.", "Relaxe as pernas, os pés, os dedos dos pés.", "Imagine-se flutuando numa nuvem macia e dourada.", "A nuvem te embala suavemente. Você está segura.", "Cada respiração te leva mais fundo no relaxamento.", "Não há nada para fazer. Apenas ser."] },
  { id: "4", title: "Autoconfiança Inabalável", description: "Ative memórias de poder pessoal", duration: "10 min", durationSec: 600, emoji: "👑", category: "autoestima", dicaPratica: "Faça antes de apresentações, entrevistas ou encontros importantes.", steps: ["Feche os olhos e respire fundo três vezes.", "Lembre de um momento em que você se sentiu absolutamente poderosa.", "Reviva esse momento com todos os sentidos: cores, sons, cheiros.", "Sinta a confiança crescendo no seu peito como uma chama dourada.", "Expanda essa chama para todo o seu corpo.", "Você brilha. Você é capaz. Você é imbatível.", "Veja-se entrando na sala com presença magnética.", "Todos percebem sua segurança e competência.", "Repita: 'Eu nasci para brilhar e me permito brilhar agora'."] },
  { id: "5", title: "Abundância Financeira", description: "Reprograme crenças sobre dinheiro", duration: "10 min", durationSec: 600, emoji: "💰", category: "abundancia", dicaPratica: "Faça pela manhã, antes de começar atividades relacionadas a trabalho/vendas.", steps: ["Sente-se confortavelmente e feche os olhos.", "Imagine uma chuva de moedas douradas caindo suavemente sobre você.", "Cada moeda representa uma oportunidade que já está a caminho.", "Sinta gratidão pelo dinheiro que já tem — ele é prova de que merece mais.", "Visualize sua conta bancária com o valor que deseja.", "Sinta a tranquilidade de ter segurança financeira.", "Repita: 'Dinheiro flui para mim com facilidade e alegria'.", "Imagine-se ajudando pessoas com sua prosperidade.", "Abra os olhos sabendo que você é um ímã de abundância."] },
  { id: "6", title: "Descompressão do Dia", description: "Libere o estresse acumulado do expediente", duration: "8 min", durationSec: 480, emoji: "🍃", category: "ansiedade", dicaPratica: "Perfeita para o trajeto de volta pra casa ou logo ao chegar.", steps: ["Feche os olhos e expire todo o ar com força pela boca.", "Inspire profundamente e imagine o ar entrando dourado e limpo.", "Expire e visualize uma fumaça cinza saindo — são as preocupações do dia.", "Repita 5 vezes esta respiração de limpeza.", "Agora imagine que está embaixo de uma cachoeira de luz.", "A água dourada lava todas as tensões, cobranças e preocupações.", "Você está se renovando. O dia de trabalho já acabou.", "Repita: 'Eu mereço descansar. Meu tempo é meu agora'."] },
  { id: "7", title: "Criatividade e Inovação", description: "Ative ondas Alpha para soluções criativas", duration: "7 min", durationSec: 420, emoji: "💡", category: "foco", dicaPratica: "Faça quando sentir bloqueio criativo ou antes de brainstorming.", steps: ["Feche os olhos e respire lentamente.", "Imagine uma porta dourada à sua frente.", "Abra a porta e entre num jardim infinito de possibilidades.", "Cada flor representa uma ideia. Olhe ao redor — são milhares.", "Escolha uma flor e examine seus detalhes.", "Essa flor contém a solução que você precisa.", "Sinta a inspiração fluindo naturalmente.", "Repita: 'Minha criatividade é infinita e eu confio nela'."] },
  { id: "8", title: "Cura Emocional", description: "Processe emoções difíceis com compaixão", duration: "12 min", durationSec: 720, emoji: "💗", category: "cura", dicaPratica: "Use quando sentir tristeza, frustração ou após conflitos emocionais.", steps: ["Coloque a mão direita sobre o coração.", "Sinta sua pulsação. Esse coração bate por você.", "Reconheça a emoção que está sentindo. Não lute contra ela.", "Diga internamente: 'Eu vejo essa dor e não preciso fugir dela'.", "Imagine essa emoção como uma cor. Qual cor ela tem?", "Agora imagine uma luz dourada envolvendo essa cor.", "A luz não elimina — ela transforma, suaviza, integra.", "Sinta seu coração mais leve a cada respiração.", "Repita: 'Eu me permito sentir e me permito curar'."] },
  { id: "9", title: "Manhã de Alta Performance", description: "Ative corpo e mente para um dia extraordinário", duration: "10 min", durationSec: 600, emoji: "🌅", category: "foco", dicaPratica: "Faça assim que acordar, sentada na cama antes de levantar.", steps: ["Antes de abrir os olhos, sorria. Só o gesto já libera serotonina.", "Respire fundo 3 vezes com intenção.", "Repita: 'Hoje é um dia extraordinário e eu estou pronta'.", "Visualize as 3 coisas mais importantes que vai realizar hoje.", "Veja-se completando cada uma com excelência e alegria.", "Sinta gratidão antecipada por essas conquistas.", "Imagine energia dourada enchendo cada célula do seu corpo.", "Abra os olhos com propósito e levante-se com presença."] },
  { id: "10", title: "Confiança para Vendas/Prospecção", description: "Ative o estado de carisma magnético", duration: "8 min", durationSec: 480, emoji: "💎", category: "autoestima", dicaPratica: "Faça 10 min antes de ligar para clientes ou fazer propostas.", steps: ["Feche os olhos e lembre do seu maior fechamento/conquista.", "Reviva a sensação de sucesso e competência.", "Agora visualize o cliente/prospect que vai abordar.", "Veja a conversa fluindo com naturalidade e conexão.", "O cliente se sente seguro e confia em você.", "Vocês fecham um acordo que beneficia ambos.", "Repita: 'Eu gero valor. Pessoas querem trabalhar comigo'.", "Abra os olhos com a energia de quem já venceu."] },
  { id: "11", title: "Controle de Ansiedade no Trânsito", description: "Técnica rápida para acalmar no engarrafamento", duration: "5 min", durationSec: 300, emoji: "🚗", category: "ansiedade", dicaPratica: "Use no carro parado. Mantenha os olhos abertos mas suavize o olhar.", steps: ["Respire fundo pelo nariz, expire pela boca.", "Solte os ombros que provavelmente estão tensos.", "Relaxe as mãos no volante — sem apertar.", "Observe o ambiente sem julgamento.", "Inspire contando 4. Segure 4. Expire 4.", "Repita 5 ciclos desta respiração quadrada.", "Repita: 'Eu estou segura. Esse momento vai passar'."] },
  { id: "12", title: "Perdão e Liberação", description: "Solte mágoas e libere espaço para o novo", duration: "12 min", durationSec: 720, emoji: "🕊️", category: "cura", dicaPratica: "Faça no fim de semana, quando tiver espaço emocional para processar.", steps: ["Feche os olhos e leve a atenção ao coração.", "Pense em alguém que te magoou.", "Não precisa concordar com o que fizeram.", "Diga internamente: 'Eu escolho me libertar dessa dor'.", "Imagine um fio dourado conectando vocês dois.", "Com compaixão, corte esse fio com uma tesoura de luz.", "Sinta o alívio de soltar o peso.", "Repita: 'Eu me perdoo e perdoo os outros. Sou livre'."] },
  { id: "13", title: "Visualização de Metas (90 dias)", description: "Projete seus próximos 90 dias com clareza", duration: "10 min", durationSec: 600, emoji: "📋", category: "abundancia", dicaPratica: "Faça uma vez por semana, preferencialmente domingo à noite.", steps: ["Feche os olhos e imagine um calendário dourado flutuando.", "Avance 90 dias no futuro. Você está lá agora.", "O que conquistou nesses 90 dias?", "Onde está? Como se sente? Quem está ao seu lado?", "Veja os números: quanto ganhou, quanto economizou?", "Sinta o orgulho de ter feito acontecer.", "Agora volte ao presente carregando essa certeza.", "Repita: 'Eu já sou quem preciso ser para alcançar tudo isso'."] },
  { id: "14", title: "Body Scan para Tensão", description: "Mapeie e libere tensão do corpo todo", duration: "12 min", durationSec: 720, emoji: "🫧", category: "ansiedade", dicaPratica: "Faça na pausa do almoço ou antes de dormir.", steps: ["Deite ou sente-se confortavelmente.", "Leve a atenção ao topo da cabeça.", "Escaneie lentamente: testa, olhos, maxilar.", "Onde sente tensão? Respire para esse ponto.", "Desça para pescoço e ombros. Solte.", "Braços, mãos, dedos. Relaxe cada um.", "Peito e abdômen. Deixe expandir livremente.", "Quadris, pernas, pés. Solte o peso.", "Sinta todo o corpo leve e relaxado.", "Repita: 'Meu corpo é meu templo e eu cuido dele com amor'."] },
  { id: "15", title: "Amor Próprio Profundo", description: "Reconecte-se com sua essência e valor", duration: "10 min", durationSec: 600, emoji: "💕", category: "autoestima", dicaPratica: "Faça quando se sentir insegura, comparando-se ou duvidando de si.", steps: ["Coloque as duas mãos sobre o coração.", "Sinta o calor das suas mãos. Esse calor é amor.", "Diga: 'Eu me amo exatamente como sou agora'.", "Lembre de 3 coisas que você superou na vida.", "Você sobreviveu a 100% dos seus piores dias.", "Isso prova que você é mais forte do que imagina.", "Imagine sua versão de 5 anos te abraçando com orgulho.", "Repita: 'Eu sou digna de amor, sucesso e felicidade'."] },
  { id: "16", title: "Respiração Energizante (Kapalabhati)", description: "Aumente energia sem cafeína", duration: "5 min", durationSec: 300, emoji: "⚡", category: "foco", dicaPratica: "Substitua o segundo café da tarde por esta respiração de 5 min.", steps: ["Sente-se com a coluna ereta.", "Inspire naturalmente pelo nariz.", "Expire com força e rapidez pelo nariz, contraindo o abdômen.", "A inspiração será automática — não force.", "Faça 30 expirações rápidas.", "Pause e respire naturalmente por 30 segundos.", "Repita mais 2 rodadas de 30 expirações.", "Sinta a energia circulando. Você está desperta e viva."] },
  { id: "17", title: "Proteção Energética", description: "Crie um escudo antes de ambientes pesados", duration: "5 min", durationSec: 300, emoji: "🛡️", category: "cura", dicaPratica: "Faça antes de reuniões difíceis ou encontros com pessoas que drenam sua energia.", steps: ["Feche os olhos e respire fundo.", "Imagine uma bolha dourada se formando ao redor do seu corpo.", "Essa bolha é permeável ao amor e à positividade.", "Mas bloqueia negatividade, fofoca e energia pesada.", "Sinta-se protegida e segura dentro dela.", "Repita: 'Minha energia é minha. Eu escolho o que absorvo'."] },
  { id: "18", title: "Gratidão Noturna", description: "Encerre o dia com frequência alta", duration: "7 min", durationSec: 420, emoji: "🙏", category: "abundancia", dicaPratica: "Faça na cama, depois de guardar o celular — pode ser a última coisa do dia.", steps: ["Deite-se e feche os olhos.", "Revise seu dia como um filme.", "Encontre 5 momentos pelos quais é grata.", "Podem ser simples: o café quente, um sorriso, o sol.", "Sinta a gratidão no peito. Deixe ela crescer.", "Agradeça ao seu corpo por ter te sustentado hoje.", "Agradeça à vida por mais um dia.", "Repita: 'Eu sou grata por tudo que vivi hoje'."] },
  { id: "19", title: "Foco Pré-Estudo", description: "Prepare o cérebro para absorver informações", duration: "6 min", durationSec: 360, emoji: "📚", category: "foco", dicaPratica: "Faça sentada na mesa de estudo, antes de abrir o material.", steps: ["Sente-se com a coluna ereta e feche os olhos.", "Respire fundo 5 vezes, cada vez mais lentamente.", "Imagine seu cérebro como uma esponja limpa e absorbente.", "Visualize as informações entrando como luz dourada.", "Seu cérebro organiza tudo em gavetas perfeitas.", "Diga: 'Eu aprendo com facilidade e retenho com alegria'.", "Abra os olhos focada e pronta para absorver."] },
  { id: "20", title: "Reset Mental de 3 Minutos", description: "Micro-meditação para qualquer momento", duration: "3 min", durationSec: 180, emoji: "🔄", category: "ansiedade", dicaPratica: "Use entre tarefas, no banheiro do trabalho, na fila do banco — qualquer lugar.", steps: ["Pare o que está fazendo. Respire fundo.", "1 minuto: observe sua respiração sem mudar nada.", "2º minuto: relaxe conscientemente ombros, maxilar e mãos.", "3º minuto: defina sua intenção para os próximos 30 min.", "Abra os olhos renovada."] },
];

const categories = [
  { id: "all", label: "Todas" },
  { id: "foco", label: "🎯 Foco" },
  { id: "ansiedade", label: "🌊 Ansiedade" },
  { id: "sono", label: "🌙 Sono" },
  { id: "autoestima", label: "👑 Autoestima" },
  { id: "abundancia", label: "💰 Abundância" },
  { id: "cura", label: "💗 Cura" },
];

const bgSounds = [
  { id: "none", label: "Sem som", icon: "🔇" },
  { id: "432hz", label: "432 Hz", icon: "🎵", desc: "Frequência da harmonia universal. Reduz ansiedade e promove calma profunda." },
  { id: "528hz", label: "528 Hz", icon: "🎶", desc: "Frequência do amor e reparação do DNA. Usada em terapia sonora para cura." },
  { id: "rain", label: "Chuva Leve", icon: "🌧️", desc: "Ruído rosa natural. Melhora o foco e mascara distrações ambientais." },
  { id: "ocean", label: "Mar", icon: "🌊", desc: "Ondas rítmicas sincronizam a respiração e ativam relaxamento parassimpático." },
  { id: "forest", label: "Floresta", icon: "🌳", desc: "Sons de pássaros e vento reduzem cortisol em até 16% (estudo japonês Shinrin-yoku)." },
];

function getVoices(gender: "female" | "male") {
  const voices = window.speechSynthesis.getVoices();
  const genderHint = gender === "female" ? ["female", "feminina", "mulher"] : ["male", "masculin", "homem"];
  const ptVoices = voices.filter(v => v.lang.startsWith("pt"));
  const genderMatch = ptVoices.find(v => genderHint.some(h => v.name.toLowerCase().includes(h)));
  if (genderMatch) return genderMatch;
  // Fallback: for female try higher pitch voices, for male lower
  return ptVoices[0] || voices[0] || null;
}

export default function MeditacoesGuiadas({ onBack }: { onBack: () => void }) {
  const [activeMeditation, setActiveMeditation] = useState<Meditation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [bgSound, setBgSound] = useState("none");
  const [voiceGender, setVoiceGender] = useState<"female" | "male">("female");
  const [filterCat, setFilterCat] = useState("all");
  const [showSoundInfo, setShowSoundInfo] = useState(false);
  const [completedIds, setCompletedIds] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("meditation-completed") || "[]"); } catch { return []; }
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoAdvanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  useEffect(() => {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
  }, []);

  // Background sound with Web Audio API for Hz tones
  useEffect(() => {
    // Cleanup previous
    if (oscillatorRef.current) { try { oscillatorRef.current.stop(); } catch {} oscillatorRef.current = null; }
    if (audioCtxRef.current && bgSound === "none") { try { audioCtxRef.current.close(); } catch {} audioCtxRef.current = null; }

    if (!isPlaying || bgSound === "none") return;

    if (bgSound === "432hz" || bgSound === "528hz") {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = bgSound === "432hz" ? 432 : 528;
      gain.gain.value = 0.08;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      audioCtxRef.current = ctx;
      oscillatorRef.current = osc;
      gainRef.current = gain;
    }
    // Nature sounds use white/pink noise approximation
    if (bgSound === "rain" || bgSound === "ocean" || bgSound === "forest") {
      const ctx = new AudioContext();
      const bufferSize = 2 * ctx.sampleRate;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      if (bgSound === "rain") {
        // Pink noise for rain
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179; b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520; b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522; b5 = -0.7616 * b5 - white * 0.0168980;
          data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
          b6 = white * 0.115926;
        }
      } else {
        // Brown noise for ocean/forest
        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          lastOut = (lastOut + (0.02 * white)) / 1.02;
          data[i] = lastOut * (bgSound === "ocean" ? 1.5 : 0.8);
        }
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      const gain = ctx.createGain();
      gain.gain.value = bgSound === "forest" ? 0.15 : 0.12;
      source.connect(gain);
      gain.connect(ctx.destination);
      source.start();
      audioCtxRef.current = ctx;
    }

    return () => {
      if (oscillatorRef.current) { try { oscillatorRef.current.stop(); } catch {} oscillatorRef.current = null; }
      if (audioCtxRef.current) { try { audioCtxRef.current.close(); } catch {} audioCtxRef.current = null; }
    };
  }, [isPlaying, bgSound]);

  const speakStep = useCallback((text: string, onEnd?: () => void) => {
    if (!voiceEnabled) { onEnd?.(); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = getVoices(voiceGender);
    if (voice) utterance.voice = voice;
    utterance.lang = "pt-BR";
    utterance.rate = 0.82;
    utterance.pitch = voiceGender === "female" ? 1.15 : 0.9;
    utterance.volume = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => { setIsSpeaking(false); onEnd?.(); };
    utterance.onerror = () => { setIsSpeaking(false); onEnd?.(); };
    window.speechSynthesis.speak(utterance);
  }, [voiceEnabled, voiceGender]);

  const advanceToNextStep = useCallback(() => {
    if (!activeMeditation) return;
    setCurrentStep(prev => {
      const next = prev + 1;
      if (next >= activeMeditation.steps.length) {
        setIsPlaying(false);
        window.speechSynthesis.cancel();
        // Mark completed
        setCompletedIds(prev => {
          const updated = prev.includes(activeMeditation.id) ? prev : [...prev, activeMeditation.id];
          localStorage.setItem("meditation-completed", JSON.stringify(updated));
          return updated;
        });
        return prev;
      }
      return next;
    });
  }, [activeMeditation]);

  useEffect(() => {
    if (!isPlaying || !activeMeditation) return;
    speakStep(activeMeditation.steps[currentStep], () => {
      autoAdvanceRef.current = setTimeout(advanceToNextStep, 5000);
    });
    return () => { if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current); };
  }, [isPlaying, currentStep, activeMeditation, speakStep, advanceToNextStep]);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => setElapsed(p => p + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying]);

  const startMeditation = (m: Meditation) => {
    setActiveMeditation(m);
    setCurrentStep(0);
    setElapsed(0);
    setIsPlaying(false);
    window.speechSynthesis.cancel();
  };

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      window.speechSynthesis.cancel();
      if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
    } else {
      setIsPlaying(true);
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const filtered = filterCat === "all" ? meditations : meditations.filter(m => m.category === filterCat);

  if (activeMeditation) {
    const progress = activeMeditation.durationSec > 0 ? Math.min((elapsed / activeMeditation.durationSec) * 100, 100) : 0;
    const selectedBg = bgSounds.find(s => s.id === bgSound);

    return (
      <div className="min-h-screen">
        <header className="px-5 pt-12 pb-2">
          <button onClick={() => { setActiveMeditation(null); setIsPlaying(false); window.speechSynthesis.cancel(); }} className="flex items-center gap-1 text-muted-foreground text-sm font-body mb-2">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </button>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{activeMeditation.emoji}</span>
            <div>
              <h1 className="text-lg font-display font-bold">{activeMeditation.title}</h1>
              <p className="text-[10px] text-muted-foreground font-body">{activeMeditation.dicaPratica}</p>
            </div>
          </div>
        </header>

        <div className="px-5 pb-6 flex flex-col items-center">
          {/* Progress ring */}
          <div className="relative w-44 h-44 flex items-center justify-center my-4">
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
              <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--gold))" strokeWidth="3" strokeLinecap="round" strokeDasharray={`${Math.PI * 90}`} strokeDashoffset={`${Math.PI * 90 * (1 - progress / 100)}`} className="transition-all duration-1000" />
            </svg>
            <div className="text-center">
              <p className="text-2xl font-display font-bold">{formatTime(elapsed)}</p>
              <p className="text-[10px] text-muted-foreground font-body">{activeMeditation.duration}</p>
            </div>
          </div>

          {isSpeaking && (
            <div className="flex items-center gap-1.5 mb-2 animate-pulse">
              {[1, 2, 3, 2, 1].map((h, i) => <div key={i} className="rounded-full bg-gold" style={{ height: `${h * 4}px`, width: "3px" }} />)}
              <span className="text-[10px] text-gold font-body ml-1">falando...</span>
            </div>
          )}

          <div className="bg-card rounded-2xl border border-border p-5 w-full mb-4 min-h-[80px] flex items-center justify-center">
            <p className="text-center text-base font-display font-medium leading-relaxed animate-fade-in" key={currentStep}>
              {activeMeditation.steps[currentStep]}
            </p>
          </div>

          <div className="flex gap-1.5 mb-4">
            {activeMeditation.steps.map((_, i) => (
              <div key={i} className={cn("h-1.5 rounded-full transition-all", i === currentStep ? "w-5 bg-gold" : i < currentStep ? "w-1.5 bg-gold/50" : "w-1.5 bg-muted")} />
            ))}
          </div>

          {/* Sound & Voice selectors */}
          <div className="w-full space-y-3 mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Music className="h-3.5 w-3.5 text-muted-foreground" />
              {bgSounds.map(s => (
                <button key={s.id} onClick={() => setBgSound(s.id)} className={cn("text-[10px] font-body px-2 py-1 rounded-full border transition-all", bgSound === s.id ? "bg-gold/20 border-gold text-gold" : "border-border text-muted-foreground")}>
                  {s.icon} {s.label}
                </button>
              ))}
            </div>
            {selectedBg && selectedBg.desc && (
              <p className="text-[10px] text-muted-foreground font-body bg-gold/5 rounded-lg p-2 border border-gold/10">✦ {selectedBg.desc}</p>
            )}
            <div className="flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              {(["female", "male"] as const).map(g => (
                <button key={g} onClick={() => setVoiceGender(g)} className={cn("text-[10px] font-body px-3 py-1 rounded-full border transition-all", voiceGender === g ? "bg-gold/20 border-gold text-gold" : "border-border text-muted-foreground")}>
                  {g === "female" ? "👩 Feminina" : "👨 Masculina"}
                </button>
              ))}
              <button onClick={() => setVoiceEnabled(!voiceEnabled)} className="ml-auto p-1.5 rounded-full hover:bg-muted transition-colors">
                {voiceEnabled ? <Volume2 className="h-4 w-4 text-gold" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-6">
            <button onClick={() => { window.speechSynthesis.cancel(); if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current); advanceToNextStep(); }} className="h-12 w-12 rounded-full bg-card border border-border flex items-center justify-center shadow-card">
              <SkipForward className="h-5 w-5 text-muted-foreground" />
            </button>
            <button onClick={togglePlay} className="h-16 w-16 rounded-full bg-gradient-gold flex items-center justify-center shadow-gold">
              {isPlaying ? <Pause className="h-6 w-6 text-primary-foreground" /> : <Play className="h-6 w-6 text-primary-foreground ml-0.5" />}
            </button>
            <div className="h-12 w-12" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="px-5 pt-12 pb-2">
        <button onClick={onBack} className="flex items-center gap-1 text-muted-foreground text-sm font-body mb-2">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>
        <h1 className="text-xl font-display font-bold">Meditações Guiadas <span className="text-gold">✦</span></h1>
        <p className="text-xs text-muted-foreground font-body mt-1">20 meditações com áudio, frequências Hz e sons da natureza</p>
        <p className="text-[10px] text-gold font-body mt-0.5">{completedIds.length}/20 completadas</p>
      </header>

      <div className="px-5 pb-2">
        <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {categories.map(c => (
            <button key={c.id} onClick={() => setFilterCat(c.id)} className={cn("text-[10px] font-body px-3 py-1.5 rounded-full border whitespace-nowrap transition-all", filterCat === c.id ? "bg-gold/20 border-gold text-gold" : "border-border text-muted-foreground")}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 space-y-2.5 pb-6">
        {filtered.map(m => (
          <button key={m.id} onClick={() => startMeditation(m)} className="w-full bg-card rounded-2xl border border-border p-3.5 flex items-center gap-3 shadow-card hover:shadow-gold/10 transition-all active:scale-[0.98]">
            <span className="text-2xl">{m.emoji}</span>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-body font-semibold truncate">{m.title}</p>
              <p className="text-[10px] text-muted-foreground font-body truncate">{m.description}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {completedIds.includes(m.id) && <span className="text-gold text-xs">✦</span>}
              <div className="flex items-center gap-0.5 text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span className="text-[10px] font-body">{m.duration}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

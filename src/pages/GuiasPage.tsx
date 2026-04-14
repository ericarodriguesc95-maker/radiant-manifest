import { Sparkles, Sun, Moon, Droplets, Heart, Flame, Apple, Dumbbell, BookOpen, Home, Target, Calendar, Users, Brain, DollarSign, Activity, Baby, Bell, Award, MessageCircle, PenLine, BarChart3 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

function GuideSection({ icon, title, steps }: { icon: React.ReactNode; title: string; steps: string[] }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-foreground flex items-center gap-2">{icon} {title}</p>
      <div className="space-y-1.5 pl-1">
        {steps.map((step, i) => (
          <div key={i} className="flex gap-2 items-start">
            <span className="text-xs font-bold text-primary mt-0.5 flex-shrink-0">{i + 1}.</span>
            <p className="text-xs text-muted-foreground">{step}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function GuiasPage() {
  return (
    <div className="min-h-screen pb-20 pt-6 px-4 max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-display font-semibold text-foreground">Guias Completos</h1>
        </div>
        <p className="text-sm text-muted-foreground font-body">Tudo que você precisa saber para usar o app ao máximo</p>
      </div>

      <Tabs defaultValue="funcoes" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="funcoes" className="text-xs">Funções</TabsTrigger>
          <TabsTrigger value="skincare" className="text-xs">Skincare</TabsTrigger>
          <TabsTrigger value="saude" className="text-xs">Saúde</TabsTrigger>
        </TabsList>

        {/* === FUNÇÕES DO APP === */}
        <TabsContent value="funcoes" className="space-y-4">
          <Accordion type="single" collapsible className="space-y-2">

            {/* HOME */}
            <AccordionItem value="home" className="border rounded-lg px-3">
              <AccordionTrigger className="text-sm">
                <span className="flex items-center gap-2"><Home className="h-4 w-4 text-primary" /> Página Inicial</span>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <GuideSection icon={<Sparkles className="h-4 w-4 text-primary" />} title="Afirmação do Dia" steps={[
                  "A afirmação muda automaticamente todos os dias",
                  "Toque em 'Copiar' para compartilhar com alguém",
                  "Use como mantra matinal para começar o dia positiva",
                ]} />
                <GuideSection icon={<Heart className="h-4 w-4 text-primary" />} title="Palavra do Dia" steps={[
                  "Selecione sua orientação espiritual (22 opções disponíveis)",
                  "Leia o versículo, reflexão e prática do dia",
                  "Use as setas para navegar para dias anteriores",
                ]} />
                <GuideSection icon={<Award className="h-4 w-4 text-primary" />} title="Streak & Hábitos" steps={[
                  "Marque seus hábitos diários para manter o streak",
                  "Complete todos os hábitos do dia para ganhar a medalha",
                  "Streaks consecutivos desbloqueiam medalhas especiais (7, 14, 21, 30 dias)",
                  "Veja sua posição no ranking da comunidade",
                ]} />
                <GuideSection icon={<Bell className="h-4 w-4 text-primary" />} title="Novidades do App" steps={[
                  "Toque no ícone de presente (🎁) para ver atualizações",
                  "Cada atualização tem 'Como usar' com passo a passo",
                  "Novas atualizações geram notificação push automática",
                ]} />
              </AccordionContent>
            </AccordionItem>

            {/* SAÚDE & FITNESS */}
            <AccordionItem value="saude" className="border rounded-lg px-3">
              <AccordionTrigger className="text-sm">
                <span className="flex items-center gap-2"><Activity className="h-4 w-4 text-primary" /> Saúde & Fitness</span>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <GuideSection icon={<span>⚖️</span>} title="Perfil de Saúde" steps={[
                  "Toque no lápis para editar seu perfil",
                  "Preencha peso atual, meta, altura, idade e nível de atividade",
                  "Veja seu IMC, TMB e ingestão ideal de proteína/água",
                  "Registre seu peso regularmente para acompanhar a evolução",
                  "Adicione fotos de progresso (opcional) para comparar visualmente",
                ]} />
                <GuideSection icon={<span>🍽️</span>} title="Dieta & Nutrição" steps={[
                  "Toque em 'Adicionar Refeição' para registrar",
                  "Use a busca de alimentos (70+ itens) para auto-cálculo de macros",
                  "Ajuste a quantidade em gramas para valores precisos",
                  "Veja o resumo de calorias e macros do dia",
                  "Edite ou exclua refeições a qualquer momento",
                ]} />
                <GuideSection icon={<span>💪</span>} title="Treino & Exercícios" steps={[
                  "Toque em 'Adicionar Exercício' e escolha a categoria",
                  "Registre duração, séries, repetições e carga",
                  "Veja o 'Treino do Dia' com sugestões baseadas no dia da semana",
                  "Ative o rastreador de atividades para contar passos via GPS",
                ]} />
                <GuideSection icon={<span>💊</span>} title="Suplementos & Medicações" steps={[
                  "Adicione suplementos com nome, dose e categoria",
                  "Marque o check diário quando tomar cada um",
                  "Consulte a aba Medic. para guias de contraceptivos e injetáveis",
                  "Use o calculador de escalonamento para Tirzepatida/Semaglutida",
                ]} />
                <GuideSection icon={<span>📊</span>} title="Dashboard Semanal" steps={[
                  "Acompanhe calorias, treinos e peso da semana",
                  "Veja médias e tendências automaticamente",
                  "Compare com suas metas de saúde",
                ]} />
              </AccordionContent>
            </AccordionItem>

            {/* CICLO MENSTRUAL */}
            <AccordionItem value="ciclo" className="border rounded-lg px-3 border-pink-500/20">
              <AccordionTrigger className="text-sm">
                <span className="flex items-center gap-2"><Baby className="h-4 w-4 text-pink-500" /> Ciclo Menstrual <span className="text-[9px] bg-pink-500/10 text-pink-500 px-1.5 py-0.5 rounded-full">NOVO</span></span>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <GuideSection icon={<span>🩸</span>} title="Registrar Ciclo" steps={[
                  "Vá em Saúde → aba Ciclo → 'Registrar Ciclo'",
                  "Informe a data de início (e fim, se souber) da menstruação",
                  "Selecione a intensidade: Leve, Médio ou Intenso",
                  "Escolha seu humor e marque os sintomas que está sentindo",
                  "Adicione observações opcionais e salve",
                  "Para editar: toque no ícone de lápis no histórico",
                  "Para excluir: toque no ícone de lixeira",
                ]} />
                <GuideSection icon={<span>🌸</span>} title="Período Fértil & Previsões" steps={[
                  "Registre pelo menos 2 ciclos para previsões mais precisas",
                  "O app calcula automaticamente: ciclo médio, próxima menstruação e dia de ovulação",
                  "O indicador mostra: rosa = período fértil, verde = não fértil",
                  "A janela fértil dura ~6 dias (4 antes + 1 após ovulação)",
                  "Quanto mais ciclos registrar, mais precisa a previsão",
                ]} />
                <GuideSection icon={<span>🗺️</span>} title="Mapa de Fases" steps={[
                  "A barra colorida mostra as 4 fases do ciclo atual",
                  "Vermelho = Menstrual, Verde = Folicular, Rosa = Fértil, Roxo = Lútea",
                  "A linha preta indica o dia atual do ciclo",
                  "O gráfico de histórico compara duração dos últimos 8 ciclos",
                ]} />
                <GuideSection icon={<Brain className="h-4 w-4 text-primary" />} title="Guia Diário com Neurociência" steps={[
                  "O card 'Guia do Dia' aparece automaticamente após registrar um ciclo",
                  "Mostra os humores possíveis para o dia baseado na fase hormonal",
                  "Lista os sintomas mais comuns esperados",
                  "Indica seu nível de energia e libido",
                  "Oferece dicas científicas personalizadas (ex: melhor fase para treinar, estudar, socializar)",
                  "Explore 'Fases do Ciclo & Dicas' para guias detalhados de cada fase",
                  "Leia 'Neurociência do Ciclo' para entender como hormônios afetam seu cérebro",
                ]} />
                <GuideSection icon={<Bell className="h-4 w-4 text-primary" />} title="Notificações de Ciclo" steps={[
                  "Permita notificações quando o app solicitar",
                  "Você receberá alertas 1-3 dias antes do período fértil",
                  "Você receberá alertas 1-3 dias antes da menstruação",
                  "Os alertas são verificados automaticamente a cada 6h",
                  "Cada alerta aparece no máximo 1 vez por dia",
                ]} />
              </AccordionContent>
            </AccordionItem>

            {/* FINANÇAS */}
            <AccordionItem value="financas" className="border rounded-lg px-3">
              <AccordionTrigger className="text-sm">
                <span className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-primary" /> Finanças</span>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <GuideSection icon={<span>📝</span>} title="Registros Financeiros" steps={[
                  "Adicione rendas, despesas fixas e variáveis",
                  "Navegue entre meses para planejamento futuro",
                  "Veja saldo automático (Renda - Gastos) no topo",
                  "Edite ou exclua lançamentos a qualquer momento",
                ]} />
                <GuideSection icon={<BarChart3 className="h-4 w-4 text-primary" />} title="Gráficos & Análise" steps={[
                  "Acesse a aba 'Gráfico' para ver evolução mensal",
                  "Compare renda vs gastos em barras coloridas",
                  "Identifique padrões de gastos ao longo dos meses",
                ]} />
                <GuideSection icon={<Brain className="h-4 w-4 text-primary" />} title="Consultoria Comportamental" steps={[
                  "Acesse a aba 'Consultoria' para dicas de psicologia do dinheiro",
                  "Entenda seus gatilhos emocionais com dinheiro",
                  "Aprenda sobre neurociência do poupar e investir",
                ]} />
                <GuideSection icon={<span>💰</span>} title="Quiz de Perfil Financeiro (NOVO)" steps={[
                  "Vá em Finanças → aba Consultoria",
                  "Role até encontrar o Quiz de Perfil Financeiro",
                  "Responda as 8 perguntas com honestidade",
                  "Descubra seu perfil: Gastadora Emocional, Acumuladora Ansiosa, Equilibrada Consciente ou Impulsiva Desconectada",
                  "Leia as dicas personalizadas para o seu perfil",
                  "Refaça quando quiser para ver sua evolução",
                ]} />
                <GuideSection icon={<span>🤖</span>} title="IA Financeira" steps={[
                  "Acesse a aba 'IA' para conversar com a assistente",
                  "A IA analisa seus registros reais (saldo, gastos, renda)",
                  "Peça conselhos personalizados sobre economia, investimentos e orçamento",
                ]} />
              </AccordionContent>
            </AccordionItem>

            {/* COMUNIDADE */}
            <AccordionItem value="comunidade" className="border rounded-lg px-3">
              <AccordionTrigger className="text-sm">
                <span className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Comunidade</span>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <GuideSection icon={<MessageCircle className="h-4 w-4 text-primary" />} title="Feed & Posts" steps={[
                  "Publique textos, fotos e vídeos no feed",
                  "Curta, comente e interaja com outras meninas",
                  "Mencione amigas com @nome nos comentários",
                  "Siga perfis para ver conteúdos relevantes",
                ]} />
                <GuideSection icon={<span>📖</span>} title="Stories" steps={[
                  "Toque no + no topo da comunidade para criar um story",
                  "Tire uma foto ou escreva um texto com fundo colorido",
                  "Use o editor para adicionar texto, emojis e ajustar",
                  "Stories ficam visíveis por 24 horas",
                  "Reaja e comente nos stories das amigas",
                ]} />
                <GuideSection icon={<span>💬</span>} title="Chat & Mensagens" steps={[
                  "Acesse salas de chat temáticas na aba Chat",
                  "Envie mensagens diretas (DMs) para amigas",
                  "Compartilhe fotos, GIFs e stickers nas conversas",
                  "Crie figurinhas personalizadas na aba Stickers",
                ]} />
              </AccordionContent>
            </AccordionItem>

            {/* AGENDA */}
            <AccordionItem value="agenda" className="border rounded-lg px-3">
              <AccordionTrigger className="text-sm">
                <span className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /> Agenda & Calendário</span>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <GuideSection icon={<Calendar className="h-4 w-4 text-primary" />} title="Eventos & Lembretes" steps={[
                  "Toque em um dia no calendário para adicionar evento",
                  "Defina título, horário, cor e descrição",
                  "Configure lembretes (5min, 15min, 30min, 1h antes)",
                  "Eventos recorrentes: diário, semanal ou mensal",
                  "Marque como concluído quando finalizar (fica verde e riscado)",
                  "Receba notificações push nos horários configurados",
                ]} />
              </AccordionContent>
            </AccordionItem>

            {/* METAS */}
            <AccordionItem value="metas" className="border rounded-lg px-3">
              <AccordionTrigger className="text-sm">
                <span className="flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> Metas & Objetivos</span>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <GuideSection icon={<Target className="h-4 w-4 text-primary" />} title="Criar e Acompanhar Metas" steps={[
                  "Crie metas por categoria (Pessoal, Saúde, Carreira, etc.)",
                  "Adicione tarefas específicas para cada meta",
                  "Atualize o progresso conforme avança (0-100%)",
                  "Adicione notas de progresso para registrar sua jornada",
                  "Veja o histórico de atualizações de cada meta",
                ]} />
              </AccordionContent>
            </AccordionItem>

            {/* DIÁRIO */}
            <AccordionItem value="diario" className="border rounded-lg px-3">
              <AccordionTrigger className="text-sm">
                <span className="flex items-center gap-2"><PenLine className="h-4 w-4 text-primary" /> Diário</span>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <GuideSection icon={<PenLine className="h-4 w-4 text-primary" />} title="Escrever no Diário" steps={[
                  "Crie notas com título e conteúdo livre",
                  "Escolha uma cor para organizar visualmente",
                  "Use para gratidão, reflexões, desabafos ou ideias",
                  "Edite e atualize suas notas quando quiser",
                  "Pesquise notas antigas pelo título",
                ]} />
              </AccordionContent>
            </AccordionItem>

            {/* MANIFESTAÇÃO */}
            <AccordionItem value="manifestacao" className="border rounded-lg px-3">
              <AccordionTrigger className="text-sm">
                <span className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Manifestação & Reprogramação</span>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <GuideSection icon={<span>✨</span>} title="Hub de Manifestação" steps={[
                  "Quadro dos Sonhos: cole imagens e textos do que deseja manifestar",
                  "Manifestação Escrita: use os métodos 369, 555 ou escrita livre",
                  "Ritual Matinal: roteiro guiado para começar o dia com intenção",
                  "Eu Superior: converse com sua versão mais elevada via IA",
                  "Termômetro Vibracional: meça sua vibração emocional diária",
                  "Frequências de Cura: ouça frequências sonoras terapêuticas",
                ]} />
                <GuideSection icon={<Brain className="h-4 w-4 text-primary" />} title="Reprogramação Mental" steps={[
                  "Meditações Guiadas: escolha entre foco, ansiedade, sono e mais",
                  "Lei da Atração: exercícios práticos de visualização e gratidão",
                  "Ho'oponopono: prática havaiana de perdão e cura",
                  "Neurociência & PNL: técnicas de reprogramação de crenças limitantes",
                ]} />
              </AccordionContent>
            </AccordionItem>

            {/* BÍBLIA 365 */}
            <AccordionItem value="biblia" className="border rounded-lg px-3">
              <AccordionTrigger className="text-sm">
                <span className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary" /> Bíblia 365</span>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <GuideSection icon={<BookOpen className="h-4 w-4 text-primary" />} title="Plano de Leitura Anual" steps={[
                  "Siga o plano diário de leitura da Bíblia em 1 ano",
                  "Marque os dias concluídos no calendário",
                  "Veja seu progresso geral em porcentagem",
                  "O plano inclui Antigo e Novo Testamento organizados",
                ]} />
              </AccordionContent>
            </AccordionItem>

            {/* INSTALAÇÃO */}
            <AccordionItem value="instalacao" className="border rounded-lg px-3">
              <AccordionTrigger className="text-sm">
                <span className="flex items-center gap-2"><span>📲</span> Instalar o App</span>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <GuideSection icon={<span>🍎</span>} title="iPhone (iOS)" steps={[
                  "Abra o app no Safari (obrigatório ser Safari)",
                  "Toque no ícone de compartilhar (quadrado com seta para cima)",
                  "Role e toque em 'Adicionar à Tela de Início'",
                  "Confirme o nome e toque em 'Adicionar'",
                  "O ícone aparecerá na sua tela como um app normal",
                ]} />
                <GuideSection icon={<span>🤖</span>} title="Android" steps={[
                  "Abra o app no Chrome",
                  "Toque nos 3 pontinhos no canto superior direito",
                  "Toque em 'Instalar aplicativo' ou 'Adicionar à tela inicial'",
                  "Confirme e o app será instalado como um app real",
                ]} />
              </AccordionContent>
            </AccordionItem>

          </Accordion>
        </TabsContent>

        {/* === SKINCARE === */}
        <TabsContent value="skincare" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sun className="h-5 w-5 text-primary" />
                <CardTitle>Rotina Matinal</CardTitle>
              </div>
              <CardDescription>Protocolo para começar o dia com pele protegida</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">1. Limpeza</p>
                <p className="text-sm text-muted-foreground">Sabonete facial suave para remover oleosidade acumulada durante a noite</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">2. Vitamina C</p>
                <p className="text-sm text-muted-foreground">Sérum antioxidante para proteger contra radicais livres e uniformizar o tom</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">3. Hidratante</p>
                <p className="text-sm text-muted-foreground">Creme leve adequado ao seu tipo de pele</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">4. Protetor Solar FPS 50+</p>
                <p className="text-sm text-muted-foreground">Proteção UVA/UVB - o passo mais importante da rotina</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Moon className="h-5 w-5 text-primary" />
                <CardTitle>Rotina Noturna</CardTitle>
              </div>
              <CardDescription>Protocolo de regeneração e tratamento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">1. Dupla Limpeza</p>
                <p className="text-sm text-muted-foreground">Primeiro óleo/balm para remover maquiagem, depois sabonete facial</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">2. Ativo (alternar)</p>
                <p className="text-sm text-muted-foreground">Retinol (anti-idade), Ácidos (renovação) ou Niacinamida (poros)</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">3. Hidratante Noturno</p>
                <p className="text-sm text-muted-foreground">Textura rica para regeneração durante o sono</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">4. Área dos Olhos</p>
                <p className="text-sm text-muted-foreground">Creme específico para prevenir linhas finas</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Droplets className="h-5 w-5 text-primary" />
                <CardTitle>Dicas Essenciais</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {["Beba 2-3L de água por dia para hidratação celular", "Durma 7-8h para regeneração completa da pele", "Troque fronhas semanalmente para evitar acne", "Reaplique protetor solar a cada 2-3 horas"].map((tip, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">{tip}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* === SAÚDE === */}
        <TabsContent value="saude" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-primary" />
                <CardTitle>Fundamentos</CardTitle>
              </div>
              <CardDescription>Base científica para emagrecimento saudável</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                ["Déficit Calórico Inteligente", "Reduza 300-500 calorias do seu gasto diário, nunca menos de 1200kcal/dia"],
                ["Proteína em Cada Refeição", "1,6-2g por kg de peso corporal - preserva massa muscular e aumenta saciedade"],
                ["Carboidratos Estratégicos", "Prefira integrais e concentre no pré/pós-treino para energia"],
              ].map(([title, desc], i) => (
                <div key={i} className="space-y-2">
                  <p className="text-sm font-semibold text-foreground">{title}</p>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Apple className="h-5 w-5 text-primary" />
                <CardTitle>Protocolo Diário</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                ["Ao Acordar", "300-500ml água + café preto (opcional) para acelerar metabolismo"],
                ["Café da Manhã (7-8h)", "Proteína + gordura boa + fibra (ex: ovos, abacate, aveia)"],
                ["Almoço (12-13h)", "Proteína magra + carboidrato integral + salada grande"],
                ["Lanche (16h)", "Proteína leve (iogurte grego, whey, castanhas)"],
                ["Jantar (19-20h)", "Proteína + vegetais, carboidrato reduzido"],
              ].map(([title, desc], i) => (
                <div key={i} className="space-y-2">
                  <p className="text-sm font-semibold text-foreground">{title}</p>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-primary" />
                <CardTitle>Estratégia de Treino</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                ["Musculação (3-5x semana)", "Prioridade #1 - preserva músculo, acelera metabolismo"],
                ["Cardio Inteligente (2-3x semana)", "20-30min HIIT ou 40-60min moderado - DEPOIS da musculação"],
                ["NEAT (diário)", "8.000-10.000 passos por dia - queima calórica sem esforço"],
              ].map(([title, desc], i) => (
                <div key={i} className="space-y-2">
                  <p className="text-sm font-semibold text-foreground">{title}</p>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                <CardTitle>Mentalidade</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                "Meta saudável: 0,5-1kg por semana (não mais!)",
                "Foco em hábitos, não em perfeição - 80% de consistência gera resultados",
                "Durma bem (7-9h) - cortisol alto bloqueia perda de gordura",
                "Refeição livre 1x/semana - saúde mental é parte do processo",
              ].map((tip, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">{tip}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

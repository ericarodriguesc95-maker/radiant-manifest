import { Sparkles, Sun, Moon, Droplets, Heart, Flame, Apple, Dumbbell, Zap, BookOpen, Headphones, GraduationCap, Palette, ExternalLink } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function GuiasPage() {
  return (
    <div className="min-h-screen pb-20 pt-6 px-4 max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-display font-semibold text-foreground">Guias de Bem-Estar</h1>
        </div>
        <p className="text-sm text-muted-foreground font-body">Skincare e saúde para sua melhor versão</p>
      </div>

      <Tabs defaultValue="skincare" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="skincare">Skincare</TabsTrigger>
          <TabsTrigger value="emagrecimento">Saúde</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Skincare Tab */}
        <TabsContent value="skincare" className="space-y-6">
          {/* Morning Routine */}
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

          {/* Night Routine */}
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

          {/* Essential Tips */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Droplets className="h-5 w-5 text-primary" />
                <CardTitle>Dicas Essenciais</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-3 items-start">
                <div className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">Beba 2-3L de água por dia para hidratação celular</p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">Durma 7-8h para regeneração completa da pele</p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">Troque fronhas semanalmente para evitar acne</p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">Reaplique protetor solar a cada 2-3 horas</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Emagrecimento Tab */}
        <TabsContent value="emagrecimento" className="space-y-6">
          {/* Fundamentals */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-primary" />
                <CardTitle>Fundamentos</CardTitle>
              </div>
              <CardDescription>Base científica para emagrecimento saudável</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Déficit Calórico Inteligente</p>
                <p className="text-sm text-muted-foreground">Reduza 300-500 calorias do seu gasto diário, nunca menos de 1200kcal/dia</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Proteína em Cada Refeição</p>
                <p className="text-sm text-muted-foreground">1,6-2g por kg de peso corporal - preserva massa muscular e aumenta saciedade</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Carboidratos Estratégicos</p>
                <p className="text-sm text-muted-foreground">Prefira integrais e concentre no pré/pós-treino para energia</p>
              </div>
            </CardContent>
          </Card>

          {/* Daily Protocol */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Apple className="h-5 w-5 text-primary" />
                <CardTitle>Protocolo Diário</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Ao Acordar</p>
                <p className="text-sm text-muted-foreground">300-500ml água + café preto (opcional) para acelerar metabolismo</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Café da Manhã (7-8h)</p>
                <p className="text-sm text-muted-foreground">Proteína + gordura boa + fibra (ex: ovos, abacate, aveia)</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Almoço (12-13h)</p>
                <p className="text-sm text-muted-foreground">Proteína magra + carboidrato integral + salada grande</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Lanche (16h)</p>
                <p className="text-sm text-muted-foreground">Proteína leve (iogurte grego, whey, castanhas)</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Jantar (19-20h)</p>
                <p className="text-sm text-muted-foreground">Proteína + vegetais, carboidrato reduzido</p>
              </div>
            </CardContent>
          </Card>

          {/* Training */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-primary" />
                <CardTitle>Estratégia de Treino</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Musculação (3-5x semana)</p>
                <p className="text-sm text-muted-foreground">Prioridade #1 - preserva músculo, acelera metabolismo</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Cardio Inteligente (2-3x semana)</p>
                <p className="text-sm text-muted-foreground">20-30min HIIT ou 40-60min moderado - DEPOIS da musculação</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">NEAT (diário)</p>
                <p className="text-sm text-muted-foreground">8.000-10.000 passos por dia - queima calórica sem esforço</p>
              </div>
            </CardContent>
          </Card>

          {/* Mindset */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                <CardTitle>Mentalidade</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-3 items-start">
                <div className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">Meta saudável: 0,5-1kg por semana (não mais!)</p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">Foco em hábitos, não em perfeição - 80% de consistência gera resultados</p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">Durma bem (7-9h) - cortisol alto bloqueia perda de gordura</p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">Refeição livre 1x/semana - saúde mental é parte do processo</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          {/* Study Techniques */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <CardTitle>Técnicas de Estudo</CardTitle>
              </div>
              <CardDescription>Métodos cientificamente validados para aprendizado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Pomodoro + Revisão Espaçada</p>
                <p className="text-sm text-muted-foreground">25min foco intenso + 5min pausa. Revise em 1h, 1 dia, 1 semana, 1 mês</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Método Feynman</p>
                <p className="text-sm text-muted-foreground">Explique o conceito como se ensinasse para uma criança - revela lacunas</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Active Recall</p>
                <p className="text-sm text-muted-foreground">Teste-se constantemente sem consultar - fortalece memória de longo prazo</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Interleaving</p>
                <p className="text-sm text-muted-foreground">Alterne entre assuntos diferentes - melhora associação de conceitos</p>
              </div>
            </CardContent>
          </Card>

          {/* Podcasts */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Headphones className="h-5 w-5 text-primary" />
                <CardTitle>Podcasts Essenciais</CardTitle>
              </div>
              <CardDescription>Aprenda em movimento - deslocamento, treino, tarefas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <a href="https://www.youtube.com/@hubermanlab" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">Huberman Lab</p>
                  <p className="text-xs text-muted-foreground">Neurociência, produtividade, saúde</p>
                </div>
                <ExternalLink className="h-4 w-4 text-primary flex-shrink-0" />
              </a>
              <a href="https://www.youtube.com/@lexfridman" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">Lex Fridman</p>
                  <p className="text-xs text-muted-foreground">IA, filosofia, ciência, liderança</p>
                </div>
                <ExternalLink className="h-4 w-4 text-primary flex-shrink-0" />
              </a>
              <a href="https://www.youtube.com/@PrimoCast" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">PrimoCast</p>
                  <p className="text-xs text-muted-foreground">Empreendedorismo e negócios BR</p>
                </div>
                <ExternalLink className="h-4 w-4 text-primary flex-shrink-0" />
              </a>
              <a href="https://www.youtube.com/@FlowPodcastBR" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">Flow Podcast</p>
                  <p className="text-xs text-muted-foreground">Cultura, ciência e sociedade</p>
                </div>
                <ExternalLink className="h-4 w-4 text-primary flex-shrink-0" />
              </a>
            </CardContent>
          </Card>

          {/* Cursos & Plataformas */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                <CardTitle>Cursos & Plataformas</CardTitle>
              </div>
              <CardDescription>Educação de alta qualidade online</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <a href="https://www.coursera.org/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">Coursera</p>
                  <p className="text-xs text-muted-foreground">Universidades de elite - Stanford, Yale, Google</p>
                </div>
                <ExternalLink className="h-4 w-4 text-primary flex-shrink-0" />
              </a>
              <a href="https://www.udemy.com/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">Udemy</p>
                  <p className="text-xs text-muted-foreground">Skills práticas - programação, design, negócios</p>
                </div>
                <ExternalLink className="h-4 w-4 text-primary flex-shrink-0" />
              </a>
              <a href="https://www.edx.org/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">edX</p>
                  <p className="text-xs text-muted-foreground">MIT, Harvard - cursos acadêmicos gratuitos</p>
                </div>
                <ExternalLink className="h-4 w-4 text-primary flex-shrink-0" />
              </a>
              <a href="https://www.masterclass.com/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">MasterClass</p>
                  <p className="text-xs text-muted-foreground">Mestres em suas áreas - liderança, criatividade</p>
                </div>
                <ExternalLink className="h-4 w-4 text-primary flex-shrink-0" />
              </a>
            </CardContent>
          </Card>

          {/* Hobbies Produtivos */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                <CardTitle>Hobbies de Alta Performance</CardTitle>
              </div>
              <CardDescription>Desenvolvimento pessoal através do lazer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Xadrez</p>
                <p className="text-sm text-muted-foreground">Estratégia, paciência, pensamento crítico - chess.com, lichess.org</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Leitura Estratégica</p>
                <p className="text-sm text-muted-foreground">20 páginas/dia - biografias, filosofia, ciência (não ficção)</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Escrita/Journaling</p>
                <p className="text-sm text-muted-foreground">Clareza mental, processamento emocional, criatividade</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Música (instrumento)</p>
                <p className="text-sm text-muted-foreground">Disciplina, coordenação, flow state</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Idiomas</p>
                <p className="text-sm text-muted-foreground">Duolingo, Anki - plasticidade cerebral</p>
              </div>
            </CardContent>
          </Card>

          {/* YouTube Channels */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <CardTitle>Canais YouTube</CardTitle>
              </div>
              <CardDescription>Conhecimento de alta densidade</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <a href="https://www.youtube.com/@veritasium" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">Veritasium</p>
                  <p className="text-xs text-muted-foreground">Ciência e engenharia explicadas</p>
                </div>
                <ExternalLink className="h-4 w-4 text-primary flex-shrink-0" />
              </a>
              <a href="https://www.youtube.com/@AliAbdaal" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">Ali Abdaal</p>
                  <p className="text-xs text-muted-foreground">Produtividade, finanças, lifestyle</p>
                </div>
                <ExternalLink className="h-4 w-4 text-primary flex-shrink-0" />
              </a>
              <a href="https://www.youtube.com/@TheDiaryOfACEO" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">Diary of a CEO</p>
                  <p className="text-xs text-muted-foreground">Entrevistas com CEOs e especialistas</p>
                </div>
                <ExternalLink className="h-4 w-4 text-primary flex-shrink-0" />
              </a>
              <a href="https://www.youtube.com/@ThomasFrank" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">Thomas Frank</p>
                  <p className="text-xs text-muted-foreground">Estudo, produtividade, organização</p>
                </div>
                <ExternalLink className="h-4 w-4 text-primary flex-shrink-0" />
              </a>
            </CardContent>
          </Card>

          {/* Blogs & News */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <CardTitle>Blogs & Fontes de Informação</CardTitle>
              </div>
              <CardDescription>Mantenha-se atualizado e informado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <a href="https://www.lesswrong.com/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">LessWrong</p>
                  <p className="text-xs text-muted-foreground">Racionalidade, IA, pensamento crítico</p>
                </div>
                <ExternalLink className="h-4 w-4 text-primary flex-shrink-0" />
              </a>
              <a href="https://waitbutwhy.com/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">Wait But Why</p>
                  <p className="text-xs text-muted-foreground">Grandes ideias explicadas de forma visual</p>
                </div>
                <ExternalLink className="h-4 w-4 text-primary flex-shrink-0" />
              </a>
              <a href="https://news.ycombinator.com/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">Hacker News</p>
                  <p className="text-xs text-muted-foreground">Tech, startups, ciência - comunidade de elite</p>
                </div>
                <ExternalLink className="h-4 w-4 text-primary flex-shrink-0" />
              </a>
              <a href="https://www.farnamstreetblog.com/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">Farnam Street</p>
                  <p className="text-xs text-muted-foreground">Modelos mentais, decisões melhores</p>
                </div>
                <ExternalLink className="h-4 w-4 text-primary flex-shrink-0" />
              </a>
              <a href="https://www.ted.com/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">TED Talks</p>
                  <p className="text-xs text-muted-foreground">Ideias que valem a pena espalhar</p>
                </div>
                <ExternalLink className="h-4 w-4 text-primary flex-shrink-0" />
              </a>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <CardTitle>Ações Rápidas - Busque Agora</CardTitle>
              </div>
              <CardDescription>Tópicos para pesquisar e expandir conhecimento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-3 items-start">
                <div className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">"Como criar um segundo cérebro" - organização de conhecimento</p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">"Atomic Habits James Clear" - construção de hábitos</p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">"Deep Work Cal Newport" - foco profundo e produtividade</p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">"Zettelkasten method" - sistema de notas conectadas</p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">"Melhores frameworks de produtividade 2024"</p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">"Tim Ferriss 4-Hour Work Week" - otimização de tempo</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

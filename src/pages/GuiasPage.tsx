import { Sparkles, Sun, Moon, Droplets, Heart, Flame, Apple, Dumbbell, BookOpen, Headphones, GraduationCap, Palette, TrendingUp, ExternalLink } from "lucide-react";
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

        {/* Alta Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          {/* Study Techniques */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <CardTitle>Técnicas de Estudo</CardTitle>
              </div>
              <CardDescription>Métodos comprovados para aprendizado acelerado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Técnica Pomodoro</p>
                <p className="text-sm text-muted-foreground">25min foco intenso + 5min pausa. Após 4 ciclos, 15-30min de descanso</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Repetição Espaçada (Anki)</p>
                <p className="text-sm text-muted-foreground">Revise em intervalos crescentes: 1 dia, 3 dias, 7 dias, 14 dias, 30 dias</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Método Feynman</p>
                <p className="text-sm text-muted-foreground">Ensine o conceito em linguagem simples - se não conseguir, você não entendeu</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Active Recall</p>
                <p className="text-sm text-muted-foreground">Teste-se constantemente. Relembre sem consultar material - 3x mais efetivo que reler</p>
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
              <CardDescription>Conteúdo de alto nível enquanto você se desloca</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">Huberman Lab</p>
                  <p className="text-xs text-muted-foreground">Neurociência aplicada - performance, sono, foco</p>
                </div>
                <a href="https://www.youtube.com/@hubermanlab" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">Lex Fridman Podcast</p>
                  <p className="text-xs text-muted-foreground">IA, ciência, filosofia - conversas profundas</p>
                </div>
                <a href="https://www.youtube.com/@lexfridman" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">Flow Podcast (Brasil)</p>
                  <p className="text-xs text-muted-foreground">Empreendedorismo, tecnologia, cultura brasileira</p>
                </div>
                <a href="https://www.youtube.com/@flownews" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">PrimoCast</p>
                  <p className="text-xs text-muted-foreground">Desenvolvimento pessoal e mentalidade de crescimento</p>
                </div>
                <a href="https://www.youtube.com/@PrimoCast" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Courses */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                <CardTitle>Plataformas de Cursos</CardTitle>
              </div>
              <CardDescription>Invista em conhecimento de qualidade</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">Coursera</p>
                  <p className="text-xs text-muted-foreground">Certificados de universidades top - IA, negócios, data science</p>
                </div>
                <a href="https://www.coursera.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">Udemy</p>
                  <p className="text-xs text-muted-foreground">Cursos práticos - programação, design, marketing digital</p>
                </div>
                <a href="https://www.udemy.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">Alura</p>
                  <p className="text-xs text-muted-foreground">Tech em português - front-end, back-end, DevOps, UX</p>
                </div>
                <a href="https://www.alura.com.br" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">Masterclass</p>
                  <p className="text-xs text-muted-foreground">Aprenda com mestres - criatividade, liderança, storytelling</p>
                </div>
                <a href="https://www.masterclass.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Hobbies */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                <CardTitle>Hobbies para Alta Performance</CardTitle>
              </div>
              <CardDescription>Atividades que desenvolvem soft skills críticas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Xadrez</p>
                <p className="text-sm text-muted-foreground">Pensamento estratégico, paciência, antecipação - chess.com, lichess.org</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Leitura Diária</p>
                <p className="text-sm text-muted-foreground">30min/dia mínimo - biografias, filosofia, ciência. Meta: 1 livro/semana</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Journaling</p>
                <p className="text-sm text-muted-foreground">Manhã: planejar dia. Noite: reflexão e gratidão. Clareza mental ++</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Instrumento Musical</p>
                <p className="text-sm text-muted-foreground">Melhora memória, coordenação, disciplina - 20min diários suficientes</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Idiomas</p>
                <p className="text-sm text-muted-foreground">Duolingo diário + consumo de conteúdo no idioma-alvo (séries, podcasts)</p>
              </div>
            </CardContent>
          </Card>

          {/* YouTube Channels */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <CardTitle>Canais no YouTube</CardTitle>
              </div>
              <CardDescription>Conteúdo educacional de altíssima qualidade</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">Ali Abdaal</p>
                  <p className="text-xs text-muted-foreground">Produtividade baseada em evidências</p>
                </div>
                <a href="https://www.youtube.com/@aliabdaal" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">Veritasium</p>
                  <p className="text-xs text-muted-foreground">Ciência e engenharia explicadas de forma incrível</p>
                </div>
                <a href="https://www.youtube.com/@veritasium" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">Fábio Holder</p>
                  <p className="text-xs text-muted-foreground">Alta performance e mentalidade vencedora (PT-BR)</p>
                </div>
                <a href="https://www.youtube.com/@FabioHolder" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">Thomas Frank</p>
                  <p className="text-xs text-muted-foreground">Técnicas de estudo universitário e organização</p>
                </div>
                <a href="https://www.youtube.com/@Thomasfrank" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">Fireship</p>
                  <p className="text-xs text-muted-foreground">Programação e tecnologia - conteúdo rápido e denso</p>
                </div>
                <a href="https://www.youtube.com/@Fireship" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Blogs & News */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <CardTitle>Blogs & Notícias</CardTitle>
              </div>
              <CardDescription>Mantenha-se atualizado e inspirado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">Hacker News</p>
                  <p className="text-xs text-muted-foreground">Tech, startups, ciência - comunidade de alto nível</p>
                </div>
                <a href="https://news.ycombinator.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">Wait But Why</p>
                  <p className="text-xs text-muted-foreground">Ensaios profundos sobre IA, procrastinação, futuro</p>
                </div>
                <a href="https://waitbutwhy.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">Stratechery</p>
                  <p className="text-xs text-muted-foreground">Análises estratégicas de tech e negócios</p>
                </div>
                <a href="https://stratechery.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">The Hustle</p>
                  <p className="text-xs text-muted-foreground">Newsletter diária - negócios, tech, tendências</p>
                </div>
                <a href="https://thehustle.co" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">Nexo Jornal (Brasil)</p>
                  <p className="text-xs text-muted-foreground">Jornalismo analítico e contextualizado</p>
                </div>
                <a href="https://www.nexojornal.com.br" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Daily Routine */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle>Rotina de Alta Performance</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-3 items-start">
                <div className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">5h-6h: Acordar cedo - hora de ouro para deep work sem interrupções</p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">Manhã: 90min de trabalho intenso no projeto mais importante (sem email/celular)</p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">15min de aprendizado durante almoço (podcast/artigo)</p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">Tarde: Blocos de 90min com pausas de 15min - respeite ciclos ultradianos</p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">Noite: Desligue telas 1h antes de dormir - leia, journaling, planejamento do dia seguinte</p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">Domingos: Revisão semanal + planejamento estratégico da próxima semana</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

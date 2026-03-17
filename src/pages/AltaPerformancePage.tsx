import { useState, useEffect } from "react";
import { Zap, BookOpen, Headphones, GraduationCap, Palette, ExternalLink, ArrowLeft, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface AdminContent {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  category: string;
  icon: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  "inteligencia-emocional": "Inteligência Emocional",
  "psicologia": "Psicologia Humana",
  "oratoria": "Oratória",
  "comunicacao": "Comunicação Persuasiva",
  "gestao-crise": "Gestão de Crise",
  "podcasts": "Podcasts",
  "cursos": "Cursos & Plataformas",
  "youtube": "Canais YouTube",
  "blogs": "Blogs & Fontes",
  "geral": "Geral",
};

export default function AltaPerformancePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [adminContent, setAdminContent] = useState<AdminContent[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.from("admin_content" as any).select("*").eq("is_active", true).order("category").order("sort_order")
      .then(({ data }) => { if (data) setAdminContent(data as unknown as AdminContent[]); });
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase.from("user_roles" as any).select("role").eq("user_id", user.id).eq("role", "admin")
      .then(({ data }) => setIsAdmin((data as any[])?.length > 0));
  }, [user]);

  const groupedAdmin = Object.entries(
    adminContent.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, AdminContent[]>)
  );

  return (
    <div className="min-h-screen pb-20 pt-6 px-4 max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>
          {isAdmin && (
            <button onClick={() => navigate("/admin/conteudo")} className="flex items-center gap-1 text-xs text-gold hover:text-gold/80 transition-colors">
              <Settings className="h-3.5 w-3.5" />
              Gerenciar
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 mb-2">
          <Zap className="h-5 w-5 text-gold" />
          <h1 className="text-2xl font-display font-semibold text-foreground">Alta Performance</h1>
        </div>
        <p className="text-sm text-muted-foreground font-body">Guia completo para desenvolvimento pessoal e profissional</p>
      </div>

      <div className="space-y-6">
        {/* Admin-added content */}
        {groupedAdmin.map(([category, items]) => (
          <Card key={category}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <span>{items[0]?.icon}</span>
                <CardTitle>{CATEGORY_LABELS[category] || category}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map(item => (
                <div key={item.id}>
                  {item.url ? (
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-foreground">{item.title}</p>
                        {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
                      </div>
                      <ExternalLink className="h-4 w-4 text-gold flex-shrink-0" />
                    </a>
                  ) : (
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-sm font-semibold text-foreground">{item.title}</p>
                      {item.description && <p className="text-xs text-muted-foreground mt-1">{item.description}</p>}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
        {/* Study Techniques */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <CardTitle>Técnicas de Estudo</CardTitle>
            </div>
            <CardDescription>Métodos cientificamente validados para aprendizado</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="w-full">
              <AccordionItem value="pomodoro">
                <AccordionTrigger className="text-sm font-semibold text-foreground">Pomodoro + Revisão Espaçada</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground space-y-2">
                  <p>A técnica Pomodoro consiste em dividir o estudo em blocos de <strong className="text-foreground">25 minutos de foco intenso</strong> seguidos de <strong className="text-foreground">5 minutos de pausa</strong>. A cada 4 ciclos, faça uma pausa maior de 15-30 min.</p>
                  <p>Combine com a <strong className="text-foreground">Revisão Espaçada</strong>: revise o conteúdo após 1 hora, 1 dia, 1 semana e 1 mês. Isso combate a curva do esquecimento e consolida a memória de longo prazo.</p>
                  <p className="text-xs italic">💡 Use apps como Forest ou Toggl para cronometrar seus pomodoros.</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="feynman">
                <AccordionTrigger className="text-sm font-semibold text-foreground">Método Feynman</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground space-y-2">
                  <p>Criado pelo físico Richard Feynman, este método tem 4 passos:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li><strong className="text-foreground">Escolha um conceito</strong> e estude-o</li>
                    <li><strong className="text-foreground">Explique como se ensinasse a uma criança</strong> — use linguagem simples</li>
                    <li><strong className="text-foreground">Identifique lacunas</strong> — onde travou? Volte e estude mais</li>
                    <li><strong className="text-foreground">Simplifique e use analogias</strong> — refine sua explicação</li>
                  </ol>
                  <p className="text-xs italic">💡 Gravar áudios explicando o assunto é uma ótima forma de praticar.</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="active-recall">
                <AccordionTrigger className="text-sm font-semibold text-foreground">Active Recall</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground space-y-2">
                  <p>Em vez de reler anotações passivamente, <strong className="text-foreground">teste-se constantemente</strong>. Feche o livro e tente lembrar o que acabou de estudar.</p>
                  <p>Técnicas práticas:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Crie flashcards (Anki é excelente para isso)</li>
                    <li>Escreva perguntas sobre o conteúdo e responda sem consultar</li>
                    <li>Faça resumos de memória após cada sessão de estudo</li>
                  </ul>
                  <p className="text-xs italic">💡 Estudos mostram que testar a si mesmo é 50% mais eficaz que reler.</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="interleaving">
                <AccordionTrigger className="text-sm font-semibold text-foreground">Interleaving</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground space-y-2">
                  <p>Em vez de estudar um único assunto por horas, <strong className="text-foreground">alterne entre tópicos diferentes</strong> numa mesma sessão.</p>
                  <p>Exemplo: 30min de matemática → 30min de história → 30min de ciências. Isso força o cérebro a <strong className="text-foreground">diferenciar e conectar conceitos</strong>, melhorando a retenção.</p>
                  <p className="text-xs italic">💡 Parece mais difícil no início, mas os resultados a longo prazo são muito superiores ao estudo em blocos.</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
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
            {[
              { href: "https://www.youtube.com/@joeljota", name: "Joel Jota", desc: "Alta performance, disciplina, mentalidade vencedora" },
              { href: "https://www.youtube.com/@hubermanlab", name: "Huberman Lab", desc: "Neurociência, produtividade, saúde" },
              { href: "https://www.youtube.com/@lexfridman", name: "Lex Fridman", desc: "IA, filosofia, ciência, liderança" },
              { href: "https://www.youtube.com/@PrimoCast", name: "PrimoCast", desc: "Empreendedorismo e negócios BR" },
              { href: "https://www.youtube.com/@FlowPodcastBR", name: "Flow Podcast", desc: "Cultura, ciência e sociedade" },
            ].map(({ href, name, desc }) => (
              <a key={name} href={href} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">{name}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
                <ExternalLink className="h-4 w-4 text-primary flex-shrink-0" />
              </a>
            ))}
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
            {[
              { href: "https://www.coursera.org/", name: "Coursera", desc: "Universidades de elite - Stanford, Yale, Google" },
              { href: "https://www.udemy.com/", name: "Udemy", desc: "Skills práticas - programação, design, negócios" },
              { href: "https://www.edx.org/", name: "edX", desc: "MIT, Harvard - cursos acadêmicos gratuitos" },
              { href: "https://www.masterclass.com/", name: "MasterClass", desc: "Mestres em suas áreas - liderança, criatividade" },
            ].map(({ href, name, desc }) => (
              <a key={name} href={href} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">{name}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
                <ExternalLink className="h-4 w-4 text-primary flex-shrink-0" />
              </a>
            ))}
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
            {[
              { title: "Xadrez", desc: "Estratégia, paciência, pensamento crítico - chess.com, lichess.org" },
              { title: "Leitura Estratégica", desc: "20 páginas/dia - biografias, filosofia, ciência (não ficção)" },
              { title: "Escrita/Journaling", desc: "Clareza mental, processamento emocional, criatividade" },
              { title: "Música (instrumento)", desc: "Disciplina, coordenação, flow state" },
              { title: "Idiomas", desc: "Duolingo, Anki - plasticidade cerebral" },
            ].map(({ title, desc }) => (
              <div key={title} className="space-y-2">
                <p className="text-sm font-semibold text-foreground">{title}</p>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
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
            {[
              { href: "https://www.youtube.com/@veritasium", name: "Veritasium", desc: "Ciência e engenharia explicadas" },
              { href: "https://www.youtube.com/@AliAbdaal", name: "Ali Abdaal", desc: "Produtividade, finanças, lifestyle" },
              { href: "https://www.youtube.com/@TheDiaryOfACEO", name: "Diary of a CEO", desc: "Entrevistas com CEOs e especialistas" },
              { href: "https://www.youtube.com/@ThomasFrank", name: "Thomas Frank", desc: "Estudo, produtividade, organização" },
            ].map(({ href, name, desc }) => (
              <a key={name} href={href} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">{name}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
                <ExternalLink className="h-4 w-4 text-primary flex-shrink-0" />
              </a>
            ))}
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
            {[
              { href: "https://www.lesswrong.com/", name: "LessWrong", desc: "Racionalidade, IA, pensamento crítico" },
              { href: "https://waitbutwhy.com/", name: "Wait But Why", desc: "Grandes ideias explicadas de forma visual" },
              { href: "https://news.ycombinator.com/", name: "Hacker News", desc: "Tech, startups, ciência - comunidade de elite" },
              { href: "https://www.farnamstreetblog.com/", name: "Farnam Street", desc: "Modelos mentais, decisões melhores" },
              { href: "https://www.ted.com/", name: "TED Talks", desc: "Ideias que valem a pena espalhar" },
            ].map(({ href, name, desc }) => (
              <a key={name} href={href} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">{name}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
                <ExternalLink className="h-4 w-4 text-primary flex-shrink-0" />
              </a>
            ))}
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
            {[
              '"Como criar um segundo cérebro" - organização de conhecimento',
              '"Atomic Habits James Clear" - construção de hábitos',
              '"Deep Work Cal Newport" - foco profundo e produtividade',
              '"Zettelkasten method" - sistema de notas conectadas',
              '"Melhores frameworks de produtividade 2024"',
              '"Tim Ferriss 4-Hour Work Week" - otimização de tempo',
            ].map((text) => (
              <div key={text} className="flex gap-3 items-start">
                <div className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">{text}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

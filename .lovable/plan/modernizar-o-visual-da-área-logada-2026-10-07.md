# Modernizar o visual da área logada

Só muda a aparência: textos, módulos, IAs, dados, preços, links e regras de acesso continuam iguais. A página de vendas não muda. Não terá modo escuro.

## O que muda

1. **Cores e letras de todo o app logado**
   - Fundo creme claro, cards claros com borda fina e sombra suave.
   - Destaques em terracota, cards rosados e amarelados com degradê e um botão escuro principal.
   - Títulos em Playfair, com a parte final em itálico terracota.
   - Textos em Raleway, rótulos pequenos em caixa alta e etiquetas em pílula com contorno.
   - Sai todo o dourado.

2. **Barra de navegação do celular**
   - Mesma pílula flutuante, agora mais clara e translúcida.
   - O item ativo fica escuro, com um sublinhado terracota.

3. **Menu lateral no computador**
   - Fundo claro de 230px.
   - O item ativo fica numa pílula rosada.
   - Embaixo, um card amarelado mostra a sequência de dias.

4. **Home**
   - **Topo:** logo redonda, saudação em Playfair e ícones redondos.
   - **Banner "Apresente-se":** degradê que se move devagar, luzes suaves e emojis subindo do lado direito.
   - **Mensagem de você daqui a 1 ano:** card amarelado com um emoji flutuando.
   - **Seus rituais:** viram um card único em lista.
   - **Sequência:** barra que se enche ao carregar.
   - **Medalhas:** as conquistadas ganham um brilho passando.
   - **Demais blocos:** ficam com a mesma estrutura, só com o novo estilo.

5. **Emojis animados**
   - No máximo um por item: fogo na sequência, alvo nas metas, troféu nos desafios, mãos juntas no devocional, diamante nas finanças, gota, sono e flor em saúde e ciclo, brilho na IA.
   - Os ícones do menu continuam simples, sem emoji.

6. **Movimento**
   - Fotos de perfil e de capa com um zoom lento.
   - Cards que sobem um pouco ao passar o mouse e, no computador, inclinam de leve.
   - Barras de progresso que se enchem.
   - Troca de página suave e listas que entram uma a uma.

7. **Comemoração ao concluir**
   - Ao marcar tarefa, hábito, check-point ou meta, uma pequena explosão de emojis aparece por cerca de 1 segundo.

8. **Celular e acessibilidade**
   - No celular: menos partículas, sem inclinação dos cards, toques fáceis e texto legível.
   - As animações desligam para quem pede menos movimento no aparelho e param quando estão fora da tela.

## Detalhes técnicos

- **Tokens e fontes:** reescrever os tokens HSL em `src/index.css` e `tailwind.config.ts` com a nova paleta. Os tokens `gold` e `brand` passam a apontar para terracota, para que todas as telas mudem de uma vez, sem editar página por página. Criar os tokens `--highlight-rose` e `--highlight-butter` e as sombras.
- **Componentes reutilizáveis:** `AnimatedEmoji` (Noto webp, classes `float` e `pop`), `Tag`, `AnimatedProgress`, `TiltCard`, `HeroBanner` e `celebrate()` para o confete.
- **Keyframes no CSS global:** gradient-shift, float, pop, shine, ken-burns, rise-fade, page-in e stagger. Tudo dentro de `prefers-reduced-motion`, com pausa por IntersectionObserver através de um hook.
- **Arquivos editados:** `AppLayout.tsx` (transição de página), `BottomNav.tsx`, `DesktopSidebar.tsx`, `HomePage.tsx` (só apresentação), `DailyCheckpoints.tsx`, `HabitTracker.tsx`, `MetasPage.tsx` (confete ao concluir), `DailyStreak.tsx`, `StreakMedals.tsx`, `FutureSelfMessage.tsx`, além da aplicação de emojis nos cabeçalhos de Metas, Finanças, Saúde e Desafios.
- **Sem alterações:** `LandingPage.tsx`, `LoginPage.tsx`, banco de dados, rotas e lógica.

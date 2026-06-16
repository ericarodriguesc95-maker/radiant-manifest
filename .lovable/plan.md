# Refazer página de Finanças

Adotar a **estrutura dos prints** (7 abas) e os componentes principais, mas **mantendo 100% o tema visual original do Gloow Up Club**: fundo preto `#0D0D0D`, dourado `#D4AF37`, glassmorphism, fontes display/body, sem rosa/branco do print.

## Cabeçalho da página

- Título "Minhas Finanças" + ícone de olho (mostrar/ocultar valores) + seletor de mês como **dropdown único** (substituindo a barra horizontal de meses)
- Botão "Conectar conta" (Pluggy) logo abaixo
- **4 cards de resumo** (substituindo o grid atual de 6):
  - Balanço Mensal (azul) — Resultado do mês
  - Receitas (verde) — Total de entradas
  - Despesas (vermelho) — Total de saídas
  - Cartão (roxo) — Fatura atual
- Toggle PF / CNPJ mantido

## Novas 7 abas (na ordem do print)

1. **Geral** — Dashboard com 4 blocos:
   - Gastos por Categoria (donut chart)
   - Resumo Financeiro (maior categoria, receita do mês, alerta)
   - Gastos por Método de Pagamento
   - Cartões de Crédito conectados
2. **Transações** — Lista única (entradas + saídas + cartão), filtros por tipo/categoria, inline edit/delete (reaproveita lógica atual de `registros`)
3. **Categorias** — **NOVA**. Sub-abas "Minhas categorias" / "Open Finance" (78 padrão). CRUD em `finance_categories`. Pills coloridas (cor + ícone) agrupadas em Receitas/Despesas. Botão "Nova Categoria"
4. **Planejar** — Polir o atual: botão "Copiar do mês anterior", card "Resumo do Orçamento", tabela Categoria/Teto/Real/Status com dropdown de ordenação (Padrão / Maior gasto / % usado / A-Z)
5. **Investir** — **NOVA**. Aproveita aba "Poupança/Guardar" atual + cards de tipos de investimento (Renda Fixa, Variável, Cripto) + total acumulado
6. **Metas** — **NOVA**. Link/integração com `/metas` filtrando metas financeiras. Cards de progresso por meta
7. **Dívidas** — Redesenho:
   - Toggle Cards / Tabela
   - Botão "Nova Dívida" dourado sólido
   - 4 cards stat: Total de Dívidas, Total Pago, Juros Mensais, Dívidas Vencidas
   - Sub-abas: Todas / Ativas / Vencidas / Pagas / Pausadas
   - Empty state com CTA "Adicionar Primeira Dívida"

## Onde vão as abas removidas?

As abas atuais **Dicas · Consultora IA · Meu Perfil (Quiz)** não estão nos prints. Proposta: mover para um **menu lateral compacto** dentro de "Geral" (três botões "Dicas comportamentais", "Falar com consultora IA", "Refazer quiz de perfil") — não perdemos nada e a navegação principal fica limpa.

## Visual (mantém o app)

- Fundo: `bg-background` (preto)
- Cards: `glass` + borda `border-gold/15`
- Botões críticos: `bg-gold text-background` sólido (sem gradiente)
- Tabs: dark com indicador dourado, **não** branco/rosa do print
- Pills de categoria: cores vivas permitidas (azul/verde/laranja/vermelho/rosa) só nos badges das categorias, igual aos prints
- Travessões `—` evitados nos textos

## Banco

- `finance_categories` já existe — só adiciono seed das 78 categorias Open Finance em PT-BR via migração
- `finance_debts` já existe — só uso as colunas
- `finance_budgets` já existe — uso na aba Planejar

## Escopo da entrega (1 turno)

1. Reescrita do `FinancasPage.tsx` com a nova estrutura de 7 abas + header novo
2. Migração: seed das 78 categorias Open Finance padrão em PT-BR
3. Componentização: extrair cada aba (`GeralTab`, `TransacoesTab`, `CategoriasTab`, `PlanejarTab`, `InvestirTab`, `MetasTab`, `DividasTab`) em `src/components/finance/tabs/` para o arquivo principal não passar de 200 linhas

Aprova esse escopo? Se sim, executo tudo. Se quiser cortar algo (ex.: "deixa Investir e Metas pra depois") me avisa.

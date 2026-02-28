<div align="center">

# ExtraTeto

**Supersalários do Judiciário Brasileiro expostos em dados**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite)](https://www.sqlite.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Dashboard público que expõe remunerações acima do teto constitucional no sistema de Justiça brasileiro.
Dados reais. Transparência cidadã. Sem filtro.

<!--
  SCREENSHOT / DEMO
  Substitua o comentário abaixo por uma imagem ou GIF do projeto:
  ![ExtraTeto Demo](./docs/screenshot.png)
  Ou adicione um link para demo ao vivo:
  [Ver Demo ao Vivo](https://extrateto.org)
-->

</div>

---

## Sobre

O **ExtraTeto** é uma plataforma de jornalismo de dados que monitora e expõe os supersalários do Judiciário brasileiro — remunerações que ultrapassam o teto constitucional de **R$ 46.366,19**.

O projeto coleta dados públicos da API do [DadosJusBr](https://dadosjusbr.org/), processa e armazena localmente em SQLite, e apresenta visualizações interativas que permitem qualquer cidadão fiscalizar como o dinheiro público está sendo gasto.

### Por que isso importa?

- Mais de **10.000 membros** do Judiciário recebem acima do teto por mês
- O total pago acima do teto ultrapassa **R$ 6,5 bilhões por ano**
- A média de excesso por membro é de **R$ 50.000/mês**
- Com esse dinheiro seria possível construir **206 hospitais** ou **2.953 creches**

---

## Features

- **Ranking interativo** — Busca, filtragem e ordenação de todos os membros do Judiciário por remuneração
- **Mapa de calor** — Visualização geográfica dos supersalários por estado brasileiro
- **Estatísticas agregadas** — Top 10 órgãos, composição da remuneração, comparações salariais
- **Páginas por órgão** — Detalhamento individual de cada tribunal e ministério público
- **Detecção de anomalias** — Variações atípicas de remuneração entre meses consecutivos com filtros por estado/órgão
- **Evolução temporal** — Histórico mensal de pagamentos por membro
- **Sync automático** — GitHub Action atualiza os dados nos dias 1, 10 e 20 de cada mês
- **API pública REST** — Endpoints documentados para consumo externo dos dados
- **Exportação CSV** — Download dos dados filtrados com proteção contra CSV injection
- **Compartilhamento social** — Botões para Twitter/X, Facebook, WhatsApp e link direto
- **SEO otimizado** — Open Graph, JSON-LD, sitemap, robots.txt
- **Responsivo** — Layout adaptável de mobile a desktop

---

## Tech Stack

| Camada | Tecnologia |
|--------|-----------|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Server Components) |
| **UI** | [React 19](https://react.dev/) + [TypeScript 5](https://www.typescriptlang.org/) |
| **Estilização** | [Tailwind CSS 4](https://tailwindcss.com/) |
| **Gráficos** | [Recharts 3](https://recharts.org/) |
| **Animações** | [Framer Motion 12](https://www.framer.com/motion/) |
| **Ícones** | [Lucide React](https://lucide.dev/) |
| **Banco de Dados** | [SQLite](https://www.sqlite.org/) via [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) |
| **ORM** | [Drizzle ORM](https://orm.drizzle.team/) |
| **Busca** | [SQLite FTS5](https://www.sqlite.org/fts5.html) (full-text search server-side) |
| **Virtualização** | [@tanstack/react-virtual](https://tanstack.com/virtual) |
| **Testes** | [Vitest](https://vitest.dev/) + [Playwright](https://playwright.dev/) |
| **Fonte de Dados** | [DadosJusBr API](https://dadosjusbr.org/) |

---

## Getting Started

### Pré-requisitos

- [Node.js](https://nodejs.org/) >= 18
- [npm](https://www.npmjs.com/) >= 9

### Instalação

```bash
# Clone o repositório
git clone https://github.com/skottrun/extrateto.git
cd extrateto

# Instale as dependências
npm install
```

### Populando o banco de dados

O projeto usa SQLite local. Você precisa popular o banco antes de rodar:

```bash
# Opção 1: Seed com dados mock (rápido, para desenvolvimento)
npm run db:seed

# Opção 2: Sincronizar dados reais da API DadosJusBr
npm run db:sync

# Sincronizar um mês específico
npx tsx scripts/sync-data.ts --year 2025 --month 1

# Sincronizar todos os meses disponíveis
npx tsx scripts/sync-data.ts --all

# Forçar re-sincronização (sobrescreve dados existentes)
npx tsx scripts/sync-data.ts --year 2025 --month 1 --force
```

### Rodando o projeto

```bash
# Servidor de desenvolvimento
npm run dev

# Build de produção
npm run build
npm start
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

---

## Uso

### Interface Web

| Página | Rota | Descrição |
|--------|------|-----------|
| Ranking | `/` | Lista completa com busca, filtros e ordenação |
| Mapa | `/mapa` | Mapa de calor por estado |
| Estatísticas | `/estatisticas` | Gráficos e análises agregadas |
| Órgãos | `/orgao` | Lista de tribunais e MPs |
| Detalhe Órgão | `/orgao/[slug]` | Dados detalhados por órgão |
| Anomalias | `/anomalias` | Detecção de variações atípicas de remuneração |
| API Docs | `/api-docs` | Documentação interativa da API |
| Metodologia | `/metodologia` | Explicação da coleta e tratamento |
| Sobre | `/sobre` | Sobre o projeto |

### API REST

```bash
# Listar membros (paginado)
curl http://localhost:3000/api/v1/membros?page=1&limit=10

# Filtrar por estado
curl http://localhost:3000/api/v1/membros?estado=SP

# Filtrar por órgão
curl http://localhost:3000/api/v1/membros?orgao=TJ-SP

# Buscar por nome
curl http://localhost:3000/api/v1/membros?nome=silva

# Apenas acima do teto
curl http://localhost:3000/api/v1/membros?acima_teto=true

# Ordenar
curl http://localhost:3000/api/v1/membros?sort=maior_acima_teto

# Histórico de um membro
curl "http://localhost:3000/api/v1/membros/historico?nome=João Silva&orgao=TJ-SP"

# Listar estados
curl http://localhost:3000/api/v1/estados

# Listar órgãos
curl http://localhost:3000/api/v1/orgaos
```

---

## Estrutura de Pastas

```
extrateto/
├── .github/workflows/       # GitHub Actions (cron-sync automático)
├── data/                    # Banco SQLite (versionado, atualizado pelo cron)
├── e2e/                     # Testes E2E (Playwright)
├── scripts/
│   └── sync-data.ts         # Script de sincronização com DadosJusBr
├── public/                  # Assets estáticos
├── src/
│   ├── app/                 # Rotas (Next.js App Router)
│   │   ├── api/
│   │   │   ├── search/      # GET /api/search (busca FTS5)
│   │   │   └── v1/          # API REST
│   │   │       ├── estados/ # GET /api/v1/estados
│   │   │       ├── membros/ # GET /api/v1/membros
│   │   │       └── orgaos/  # GET /api/v1/orgaos
│   │   ├── anomalias/       # Página de detecção de anomalias
│   │   ├── estatisticas/    # Página de estatísticas
│   │   ├── mapa/            # Página do mapa
│   │   ├── orgao/           # Páginas de órgãos
│   │   └── ...              # Demais páginas
│   ├── components/          # Componentes React reutilizáveis
│   │   ├── brazil-map.tsx   # Mapa interativo do Brasil
│   │   ├── kpi-cards.tsx    # Cards de indicadores
│   │   ├── member-card.tsx  # Card de membro
│   │   ├── salary-bar.tsx   # Barra de composição salarial
│   │   └── ...
│   ├── data/                # Camada de dados e cache
│   │   └── get-members.ts   # Queries com cache em memória
│   └── lib/                 # Utilitários e banco
│       ├── db/              # Schema Drizzle + queries SQLite
│       ├── aggregations.ts  # Funções de agregação
│       ├── constants.ts     # Constantes (estados, órgãos, teto)
│       ├── export-csv.ts    # Exportação CSV segura
│       └── utils.ts         # Formatação de moeda, percentual, etc.
├── next.config.ts           # Configuração Next.js + security headers
├── middleware.ts             # Rate limiting + CORS
├── package.json
└── tsconfig.json
```

---

## Testes

```bash
# Testes unitários
npm test

# Testes unitários em watch mode
npm run test:watch

# Testes E2E (requer servidor rodando)
npm run test:e2e
```

---

## Roadmap

- [ ] Autenticação para API (rate limiting público já implementado)
- [ ] Notificações de novos dados disponíveis
- [ ] Comparativo temporal (evolução ano a ano)
- [ ] Exportação em PDF dos relatórios
- [ ] Integração com dados do CNJ (Conselho Nacional de Justiça)
- [ ] PWA (Progressive Web App) para acesso offline
- [ ] Modo embarcado (widget para outros sites)
- [ ] i18n (tradução para inglês)

---

## Contribuição

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/minha-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona minha feature'`)
4. Push para a branch (`git push origin feature/minha-feature`)
5. Abra um Pull Request

### Diretrizes

- Siga o padrão de código existente (TypeScript strict, ESLint)
- Adicione testes para novas funcionalidades
- Mantenha o README atualizado
- Use commits descritivos em português

---

## Licença

Distribuído sob a licença MIT. Veja [LICENSE](LICENSE) para mais informações.

---

## Contato

- GitHub: https://github.com/skottrun
- Twitter: https://x.com/skottrun

---

<div align="center">

**Dados públicos, fiscalização cidadã.**

Feito com dados do [DadosJusBr](https://dadosjusbr.org/)

</div>

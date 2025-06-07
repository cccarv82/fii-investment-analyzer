# Arquitetura do Sistema - FII Investment App

## Visão Geral da Arquitetura

### Stack Tecnológico
- **Frontend**: React 19 + Vite
- **Styling**: Tailwind CSS 4.1
- **UI Components**: shadcn/ui + Radix UI
- **Icons**: Lucide React
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod
- **Routing**: React Router DOM
- **Animations**: Framer Motion
- **State Management**: React Context + Local Storage
- **Package Manager**: pnpm

### Arquitetura de Dados

#### Fontes de Dados
1. **Plexa API** (Principal)
   - Lista de FIIs
   - Cotações em tempo real
   - Dados fundamentais
   - Histórico de dividendos

2. **CVM Dados Abertos** (Complementar)
   - Demonstrações financeiras
   - Informes oficiais

#### Sistema de Cache
- **Cotações**: 15 minutos
- **Dados fundamentais**: 1 hora
- **Lista de FIIs**: 24 horas
- **Análises de IA**: 30 minutos

### Estrutura de Componentes

```
src/
├── components/
│   ├── ui/                    # Componentes base (shadcn/ui)
│   ├── layout/               # Layout components
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   └── Footer.jsx
│   ├── investment/           # Componentes de investimento
│   │   ├── InvestmentForm.jsx
│   │   ├── SuggestionCard.jsx
│   │   ├── PortfolioSummary.jsx
│   │   └── FIICard.jsx
│   ├── portfolio/            # Gestão de carteira
│   │   ├── PortfolioManager.jsx
│   │   ├── AssetList.jsx
│   │   └── PerformanceChart.jsx
│   ├── charts/               # Gráficos e visualizações
│   │   ├── PieChart.jsx
│   │   ├── LineChart.jsx
│   │   └── BarChart.jsx
│   └── common/               # Componentes comuns
│       ├── LoadingSpinner.jsx
│       ├── ErrorBoundary.jsx
│       └── SearchInput.jsx
├── hooks/                    # Custom hooks
│   ├── useAPI.js
│   ├── usePortfolio.js
│   ├── useCache.js
│   └── useAnalysis.js
├── lib/                      # Utilitários e serviços
│   ├── api/
│   │   ├── plexa.js
│   │   ├── cvm.js
│   │   └── ai.js
│   ├── utils/
│   │   ├── calculations.js
│   │   ├── formatters.js
│   │   └── validators.js
│   ├── storage/
│   │   ├── localStorage.js
│   │   └── indexedDB.js
│   └── analysis/
│       ├── fundamentalAnalysis.js
│       └── portfolioOptimization.js
├── contexts/                 # React contexts
│   ├── PortfolioContext.jsx
│   ├── APIContext.jsx
│   └── ThemeContext.jsx
├── pages/                    # Páginas principais
│   ├── Dashboard.jsx
│   ├── Investment.jsx
│   ├── Portfolio.jsx
│   ├── Analysis.jsx
│   └── Settings.jsx
└── types/                    # TypeScript types (se migrar)
    ├── api.ts
    ├── portfolio.ts
    └── analysis.ts
```

### Fluxo de Dados

#### 1. Entrada de Orçamento
```
User Input → InvestmentForm → API Request → AI Analysis → Suggestions
```

#### 2. Gestão de Carteira
```
Portfolio Data → Local Storage → Context → Components → UI Updates
```

#### 3. Análise Fundamentalista
```
FII Data → AI Service → Analysis Results → Cache → Display
```

### Modelos de Dados

#### FII (Fundo de Investimento Imobiliário)
```javascript
{
  ticker: string,
  name: string,
  cnpj: string,
  sector: string,
  subsector: string,
  segment: string,
  currentPrice: number,
  dividendYield: number,
  pvp: number,
  liquidez: number,
  patrimonio: number,
  lastDividend: {
    value: number,
    date: string,
    type: string
  },
  fundamentals: {
    ffo: number,
    noi: number,
    vacancyRate: number,
    priceToFFO: number
  }
}
```

#### Portfolio
```javascript
{
  id: string,
  assets: [
    {
      ticker: string,
      quantity: number,
      averagePrice: number,
      currentValue: number,
      totalInvested: number,
      dividendsReceived: number,
      performance: number
    }
  ],
  totalInvested: number,
  currentValue: number,
  totalDividends: number,
  monthlyYield: number,
  diversification: {
    bySector: object,
    bySegment: object
  },
  createdAt: string,
  updatedAt: string
}
```

#### Investment Suggestion
```javascript
{
  ticker: string,
  recommendedAmount: number,
  percentage: number,
  reasoning: string,
  expectedYield: number,
  riskLevel: string,
  fundamentalScore: number,
  aiConfidence: number
}
```

### Configurações de API

#### Plexa API
```javascript
const PLEXA_CONFIG = {
  baseURL: 'https://api.plexa.com.br',
  endpoints: {
    fiis: '/fiis',
    quotes: '/quotes',
    dividends: '/dividends',
    fundamentals: '/fundamentals'
  },
  rateLimit: {
    requests: 1500,
    period: 'month',
    perMinute: 10
  }
}
```

#### Cache Strategy
```javascript
const CACHE_CONFIG = {
  quotes: 15 * 60 * 1000,      // 15 minutos
  fundamentals: 60 * 60 * 1000, // 1 hora
  fiis: 24 * 60 * 60 * 1000,   // 24 horas
  analysis: 30 * 60 * 1000     // 30 minutos
}
```

### Responsividade

#### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

#### Layout Adaptativo
- Mobile: Stack vertical, navegação por tabs
- Tablet: Sidebar colapsável, grid 2 colunas
- Desktop: Sidebar fixa, grid 3 colunas

### Performance

#### Otimizações
1. **Lazy Loading**: Componentes e rotas
2. **Memoization**: React.memo para componentes pesados
3. **Virtual Scrolling**: Para listas grandes de FIIs
4. **Image Optimization**: Lazy loading de imagens
5. **Bundle Splitting**: Code splitting por rota

#### Métricas Alvo
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

### Segurança

#### Proteções
1. **Input Validation**: Zod schemas
2. **XSS Protection**: Sanitização de dados
3. **API Rate Limiting**: Controle de requisições
4. **Data Encryption**: Dados sensíveis no localStorage

### Próximos Passos
1. Implementar estrutura base de componentes
2. Configurar roteamento
3. Implementar serviços de API
4. Criar sistema de cache
5. Desenvolver componentes de UI


# Documentação Técnica - FII Investment Analyzer

## Arquitetura do Sistema

### Visão Geral
O FII Investment Analyzer é uma Single Page Application (SPA) construída com React que oferece análise completa de investimentos em FIIs. A arquitetura segue padrões modernos de desenvolvimento frontend com foco em performance, escalabilidade e experiência do usuário.

### Estrutura de Diretórios

```
src/
├── components/          # Componentes reutilizáveis
│   ├── charts/         # Componentes de gráficos
│   ├── common/         # Componentes comuns
│   ├── investment/     # Componentes de investimento
│   ├── layout/         # Componentes de layout
│   ├── portfolio/      # Componentes de carteira
│   └── ui/            # Componentes de interface base
├── contexts/           # Contextos React
│   ├── AIContext.jsx   # Gerenciamento de IA
│   └── PortfolioContext.jsx # Gerenciamento de carteira
├── hooks/              # Custom hooks
├── lib/                # Bibliotecas e utilitários
│   ├── analysis/       # Análises e simulações
│   ├── api/           # Integrações de API
│   ├── storage/       # Persistência de dados
│   └── utils/         # Utilitários gerais
├── pages/              # Páginas da aplicação
└── App.jsx            # Componente principal
```

### Fluxo de Dados

1. **Estado Global**: Gerenciado via React Context
2. **Persistência**: localStorage e IndexedDB
3. **APIs Externas**: Integração com OpenAI e APIs de FIIs
4. **Cache**: Sistema de cache inteligente para otimização

## Componentes Principais

### Layout System
- **Layout.jsx**: Container principal com sidebar e header
- **Header.jsx**: Barra superior com navegação e tema
- **Sidebar.jsx**: Menu lateral responsivo

### Gestão de Estado
- **PortfolioContext**: Estado da carteira e posições
- **AIContext**: Configuração e estado da IA

### Visualizações
- **Charts.jsx**: Componentes de gráficos com Recharts
- **Dashboard.jsx**: Página principal com resumo
- **Simulations.jsx**: Simulações e projeções

## APIs e Integrações

### APIs de Dados de FIIs

#### 1. Plexa API
```javascript
// Endpoint principal
const PLEXA_BASE_URL = 'https://api.plexa.com.br';

// Exemplo de uso
const getFIIData = async (ticker) => {
  const response = await fetch(`${PLEXA_BASE_URL}/fiis/${ticker}`);
  return response.json();
};
```

#### 2. CVM Dados Abertos
```javascript
// Dados regulamentares
const CVM_BASE_URL = 'https://dados.cvm.gov.br/dados';

// Informações de fundos
const getFundInfo = async (cnpj) => {
  const response = await fetch(`${CVM_BASE_URL}/FI/DOC/INF_DIARIO/DADOS/`);
  return response.json();
};
```

### Integração com OpenAI

#### Configuração
```javascript
const openai = new OpenAI({
  apiKey: userApiKey,
  dangerouslyAllowBrowser: true
});
```

#### Análise Fundamentalista
```javascript
const analyzePortfolio = async (positions, userProfile) => {
  const prompt = `
    Analise a seguinte carteira de FIIs:
    ${JSON.stringify(positions)}
    
    Perfil do investidor: ${userProfile.riskProfile}
    Objetivo: ${userProfile.investmentGoal}
    
    Forneça análise fundamentalista detalhada...
  `;
  
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7
  });
  
  return response.choices[0].message.content;
};
```

## Sistema de Persistência

### LocalStorage
Usado para configurações e dados leves:
```javascript
// Configurações da aplicação
const saveSettings = (settings) => {
  localStorage.setItem('fii-app-settings', JSON.stringify(settings));
};

// API Key da OpenAI
const saveApiKey = (apiKey) => {
  localStorage.setItem('fii-app-openai-key', apiKey);
};
```

### IndexedDB
Para dados complexos da carteira:
```javascript
const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('FIIPortfolioDB', 1);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Store para posições
      if (!db.objectStoreNames.contains('positions')) {
        const positionsStore = db.createObjectStore('positions', { keyPath: 'id' });
        positionsStore.createIndex('ticker', 'ticker', { unique: false });
      }
      
      // Store para dividendos
      if (!db.objectStoreNames.contains('dividends')) {
        const dividendsStore = db.createObjectStore('dividends', { keyPath: 'id' });
        dividendsStore.createIndex('date', 'date', { unique: false });
      }
    };
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};
```

## Sistema de Cache

### Implementação
```javascript
class CacheManager {
  constructor() {
    this.cache = new Map();
    this.ttl = new Map();
  }
  
  set(key, value, ttlMs = 300000) { // 5 minutos default
    this.cache.set(key, value);
    this.ttl.set(key, Date.now() + ttlMs);
  }
  
  get(key) {
    if (this.ttl.get(key) < Date.now()) {
      this.cache.delete(key);
      this.ttl.delete(key);
      return null;
    }
    return this.cache.get(key);
  }
}
```

### Estratégias de Cache
- **Dados de FIIs**: 5 minutos
- **Análises de IA**: 30 minutos
- **Dados de mercado**: 15 minutos

## Simulações e Cálculos

### Simulador de Investimentos
```javascript
class InvestmentSimulator {
  // Projeção de patrimônio com aportes mensais
  projectPatrimony(initialAmount, monthlyContribution, years, annualReturn) {
    const months = years * 12;
    const monthlyReturn = annualReturn / 12;
    let currentValue = initialAmount;
    const evolution = [];
    
    for (let month = 0; month <= months; month++) {
      if (month > 0) {
        currentValue *= (1 + monthlyReturn);
        currentValue += monthlyContribution;
      }
      
      evolution.push({
        month,
        value: currentValue,
        totalContributed: initialAmount + (monthlyContribution * month),
        totalReturn: currentValue - (initialAmount + (monthlyContribution * month))
      });
    }
    
    return evolution;
  }
  
  // Cálculo de métricas de risco
  calculateSharpeRatio(portfolioReturn, riskFreeRate, volatility) {
    return (portfolioReturn - riskFreeRate) / volatility;
  }
  
  // Estimativa de Beta da carteira
  estimatePortfolioBeta(positions) {
    const sectorBetas = {
      'Logística': 1.2,
      'Shoppings': 1.1,
      'Lajes Corporativas': 0.9,
      'Híbrido': 1.0,
      'Recebíveis': 0.7
    };
    
    return positions.reduce((totalBeta, position) => {
      const weight = position.percentage / 100;
      const beta = sectorBetas[position.sector] || 1.0;
      return totalBeta + (weight * beta);
    }, 0);
  }
}
```

## Geração de Relatórios

### PDF com jsPDF
```javascript
import jsPDF from 'jspdf';
import 'jspdf-autotable';

class ReportGenerator {
  generatePortfolioReport(portfolioData) {
    const doc = new jsPDF();
    
    // Cabeçalho
    doc.setFontSize(20);
    doc.text('Relatório de Carteira de FIIs', 20, 30);
    
    // Tabela de posições
    const positionsData = portfolioData.positions.map(position => [
      position.ticker,
      position.totalShares.toString(),
      this.formatCurrency(position.averagePrice),
      this.formatCurrency(position.totalInvested)
    ]);
    
    doc.autoTable({
      head: [['Ticker', 'Cotas', 'Preço Médio', 'Valor Investido']],
      body: positionsData,
      startY: 50
    });
    
    return doc;
  }
}
```

### CSV Export
```javascript
class CSVGenerator {
  generatePortfolioCSV(portfolioData) {
    const headers = ['Ticker', 'Cotas', 'Preço Médio', 'Valor Investido'];
    const rows = portfolioData.positions.map(position => [
      position.ticker,
      position.totalShares,
      position.averagePrice.toFixed(2),
      position.totalInvested.toFixed(2)
    ]);
    
    return [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');
  }
}
```

## Performance e Otimização

### Code Splitting
```javascript
// Lazy loading de páginas
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Portfolio = lazy(() => import('./pages/Portfolio'));
const Analysis = lazy(() => import('./pages/Analysis'));

// Suspense wrapper
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/" element={<Dashboard />} />
    <Route path="/portfolio" element={<Portfolio />} />
    <Route path="/analysis" element={<Analysis />} />
  </Routes>
</Suspense>
```

### Memoização
```javascript
// Componentes pesados
const ExpensiveChart = memo(({ data }) => {
  return <ComplexChart data={data} />;
});

// Cálculos custosos
const portfolioMetrics = useMemo(() => {
  return calculateComplexMetrics(positions);
}, [positions]);
```

### Virtual Scrolling
Para listas grandes de FIIs:
```javascript
const VirtualizedFIIList = ({ fiis }) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 });
  
  const visibleFIIs = fiis.slice(visibleRange.start, visibleRange.end);
  
  return (
    <div onScroll={handleScroll}>
      {visibleFIIs.map(fii => <FIICard key={fii.ticker} fii={fii} />)}
    </div>
  );
};
```

## Responsividade e Acessibilidade

### Breakpoints Tailwind
```css
/* Mobile first approach */
.container {
  @apply w-full px-4;
}

/* Tablet */
@screen md {
  .container {
    @apply px-6;
  }
}

/* Desktop */
@screen lg {
  .container {
    @apply px-8 max-w-7xl mx-auto;
  }
}
```

### Acessibilidade
```javascript
// ARIA labels
<button 
  aria-label="Adicionar novo investimento"
  aria-describedby="add-investment-help"
>
  <PlusIcon />
</button>

// Focus management
const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

const trapFocus = (element) => {
  const focusable = element.querySelectorAll(focusableElements);
  const firstFocusable = focusable[0];
  const lastFocusable = focusable[focusable.length - 1];
  
  // Implementar trap de foco
};
```

## Testes

### Estrutura de Testes
```javascript
// __tests__/components/Portfolio.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { PortfolioProvider } from '../contexts/PortfolioContext';
import Portfolio from '../pages/Portfolio';

describe('Portfolio Component', () => {
  test('renders portfolio summary', () => {
    render(
      <PortfolioProvider>
        <Portfolio />
      </PortfolioProvider>
    );
    
    expect(screen.getByText('Valor Total Investido')).toBeInTheDocument();
  });
  
  test('adds new position', () => {
    render(
      <PortfolioProvider>
        <Portfolio />
      </PortfolioProvider>
    );
    
    fireEvent.click(screen.getByText('Adicionar Posição'));
    // Verificar modal de adição
  });
});
```

### Testes de Integração
```javascript
// __tests__/integration/api.test.js
import { plexaAPI } from '../lib/api/plexa';

describe('API Integration', () => {
  test('fetches FII data successfully', async () => {
    const data = await plexaAPI.getFIIData('HGLG11');
    expect(data).toHaveProperty('ticker');
    expect(data.ticker).toBe('HGLG11');
  });
});
```

## Deploy e CI/CD

### Vercel Configuration
```json
// vercel.json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Build
        run: npm run build
        
      - name: Deploy to Vercel
        uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## Monitoramento e Analytics

### Error Tracking
```javascript
// lib/monitoring.js
class ErrorTracker {
  static logError(error, context = {}) {
    console.error('Application Error:', {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    });
    
    // Enviar para serviço de monitoramento
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoring(error, context);
    }
  }
  
  static sendToMonitoring(error, context) {
    // Implementar integração com Sentry, LogRocket, etc.
  }
}
```

### Performance Monitoring
```javascript
// lib/performance.js
class PerformanceMonitor {
  static measurePageLoad() {
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const loadTime = navigation.loadEventEnd - navigation.fetchStart;
      
      console.log(`Page load time: ${loadTime}ms`);
      
      // Enviar métricas
      this.sendMetrics({
        type: 'page_load',
        duration: loadTime,
        timestamp: Date.now()
      });
    });
  }
  
  static measureComponentRender(componentName, renderTime) {
    this.sendMetrics({
      type: 'component_render',
      component: componentName,
      duration: renderTime,
      timestamp: Date.now()
    });
  }
}
```

## Segurança

### Sanitização de Dados
```javascript
// lib/security.js
class SecurityUtils {
  static sanitizeInput(input) {
    return input
      .replace(/[<>]/g, '') // Remove HTML tags
      .trim()
      .substring(0, 1000); // Limita tamanho
  }
  
  static validateApiKey(apiKey) {
    const pattern = /^sk-[a-zA-Z0-9]{48}$/;
    return pattern.test(apiKey);
  }
  
  static encryptSensitiveData(data) {
    // Implementar criptografia para dados sensíveis
    return btoa(data); // Base64 básico (usar crypto real em produção)
  }
}
```

### Content Security Policy
```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://api.openai.com https://api.plexa.com.br;
">
```

## Troubleshooting

### Problemas Comuns

#### 1. Build Falhando
```bash
# Limpar cache
rm -rf node_modules package-lock.json
npm install

# Verificar versão do Node
node --version # Deve ser 18+
```

#### 2. IA Não Funcionando
```javascript
// Verificar configuração
const checkAIConfig = () => {
  const apiKey = localStorage.getItem('fii-app-openai-key');
  if (!apiKey) {
    console.warn('OpenAI API key not configured');
    return false;
  }
  
  if (!apiKey.startsWith('sk-')) {
    console.error('Invalid API key format');
    return false;
  }
  
  return true;
};
```

#### 3. Performance Lenta
```javascript
// Profiling de componentes
import { Profiler } from 'react';

const onRenderCallback = (id, phase, actualDuration) => {
  if (actualDuration > 100) {
    console.warn(`Slow component: ${id} took ${actualDuration}ms`);
  }
};

<Profiler id="Portfolio" onRender={onRenderCallback}>
  <Portfolio />
</Profiler>
```

## Extensibilidade

### Plugin System
```javascript
// lib/plugins.js
class PluginManager {
  constructor() {
    this.plugins = new Map();
  }
  
  register(name, plugin) {
    this.plugins.set(name, plugin);
  }
  
  execute(hookName, data) {
    for (const [name, plugin] of this.plugins) {
      if (plugin.hooks && plugin.hooks[hookName]) {
        data = plugin.hooks[hookName](data);
      }
    }
    return data;
  }
}

// Exemplo de plugin
const analyticsPlugin = {
  hooks: {
    'portfolio.add': (position) => {
      console.log('Position added:', position);
      return position;
    }
  }
};
```

### API Extensibility
```javascript
// lib/api/registry.js
class APIRegistry {
  constructor() {
    this.providers = new Map();
  }
  
  register(name, provider) {
    this.providers.set(name, provider);
  }
  
  async getFIIData(ticker) {
    for (const [name, provider] of this.providers) {
      try {
        const data = await provider.getFIIData(ticker);
        if (data) return data;
      } catch (error) {
        console.warn(`Provider ${name} failed:`, error);
      }
    }
    throw new Error('No provider available');
  }
}
```

---

Esta documentação técnica fornece uma visão completa da arquitetura, implementação e manutenção do FII Investment Analyzer. Para dúvidas específicas, consulte o código fonte ou abra uma issue no repositório.


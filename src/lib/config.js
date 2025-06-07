// Configurações da API Plexa
export const PLEXA_CONFIG = {
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
};

// Configurações de cache
export const CACHE_CONFIG = {
  quotes: 15 * 60 * 1000,      // 15 minutos
  fundamentals: 60 * 60 * 1000, // 1 hora
  fiis: 24 * 60 * 60 * 1000,   // 24 horas
  analysis: 30 * 60 * 1000     // 30 minutos
};

// Configurações da aplicação
export const APP_CONFIG = {
  name: 'FII Investment Analyzer',
  version: '1.0.0',
  description: 'Análise Inteligente de Fundos Imobiliários',
  maxPortfolioAssets: 50,
  minInvestmentAmount: 100,
  maxInvestmentAmount: 1000000,
  defaultCurrency: 'BRL'
};

// Configurações de responsividade
export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280
};

// Configurações de performance
export const PERFORMANCE_CONFIG = {
  virtualScrollThreshold: 100,
  debounceDelay: 300,
  maxCacheSize: 50 * 1024 * 1024, // 50MB
  maxCacheAge: 7 * 24 * 60 * 60 * 1000 // 7 dias
};


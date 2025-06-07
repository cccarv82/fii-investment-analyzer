import { cache, CacheKeys, withCache } from '../storage/cache.js';
import { CACHE_CONFIG } from '../config.js';

// Configuração da API Plexa
const PLEXA_BASE_URL = 'https://api.plexa.com.br';

// Headers padrão para requisições
const getHeaders = (token = null) => {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

// Função para fazer requisições HTTP
const fetchWithRetry = async (url, options = {}, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: getHeaders(options.token)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.warn(`Tentativa ${i + 1} falhou:`, error.message);
      
      if (i === retries - 1) {
        throw error;
      }
      
      // Aguardar antes de tentar novamente
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};

// API Service para Plexa
export class PlexaAPIService {
  constructor(token = null) {
    this.token = token;
    this.baseURL = PLEXA_BASE_URL;
  }

  // Buscar lista de todos os FIIs
  async getFIIsList() {
    const cacheKey = CacheKeys.FII_LIST;
    
    return withCache(
      cacheKey,
      async () => {
        const url = `${this.baseURL}/fiis`;
        const data = await fetchWithRetry(url, { token: this.token });
        
        // Processar e padronizar dados
        return data.map(fii => ({
          ticker: fii.ticker || fii.codigo,
          name: fii.name || fii.nome,
          cnpj: fii.cnpj,
          sector: fii.sector || fii.setor,
          subsector: fii.subsector || fii.subsetor,
          segment: fii.segment || fii.segmento,
          management: fii.management || fii.gestao,
          administrator: fii.administrator || fii.administrador
        }));
      },
      CACHE_CONFIG.fiis
    );
  }

  // Buscar cotação de um ou múltiplos FIIs
  async getQuotes(tickers) {
    const tickerList = Array.isArray(tickers) ? tickers : [tickers];
    const cacheKey = CacheKeys.FII_QUOTES(tickerList.join(','));
    
    return withCache(
      cacheKey,
      async () => {
        const tickerParam = tickerList.join(',');
        const url = `${this.baseURL}/quotes?tickers=${tickerParam}`;
        const data = await fetchWithRetry(url, { token: this.token });
        
        // Padronizar formato de resposta
        const quotes = Array.isArray(data) ? data : [data];
        return quotes.map(quote => ({
          ticker: quote.ticker || quote.codigo,
          price: quote.price || quote.preco,
          change: quote.change || quote.variacao,
          changePercent: quote.changePercent || quote.variacao_percentual,
          volume: quote.volume,
          lastUpdate: quote.lastUpdate || quote.ultima_atualizacao || new Date().toISOString()
        }));
      },
      CACHE_CONFIG.quotes
    );
  }

  // Buscar dados fundamentais de um FII
  async getFundamentals(ticker) {
    const cacheKey = CacheKeys.FII_FUNDAMENTALS(ticker);
    
    return withCache(
      cacheKey,
      async () => {
        const url = `${this.baseURL}/fundamentals/${ticker}`;
        const data = await fetchWithRetry(url, { token: this.token });
        
        return {
          ticker: data.ticker || ticker,
          dividendYield: data.dividendYield || data.dividend_yield,
          pvp: data.pvp || data.price_to_book,
          patrimonio: data.patrimonio || data.net_worth,
          liquidez: data.liquidez || data.liquidity,
          vacancyRate: data.vacancyRate || data.taxa_vacancia,
          ffo: data.ffo,
          noi: data.noi,
          lastUpdate: data.lastUpdate || new Date().toISOString()
        };
      },
      CACHE_CONFIG.fundamentals
    );
  }

  // Buscar histórico de dividendos
  async getDividends(ticker, months = 12) {
    const cacheKey = CacheKeys.FII_DIVIDENDS(ticker);
    
    return withCache(
      cacheKey,
      async () => {
        const url = `${this.baseURL}/dividends/${ticker}?months=${months}`;
        const data = await fetchWithRetry(url, { token: this.token });
        
        return (data.dividends || data).map(dividend => ({
          ticker: dividend.ticker || ticker,
          value: dividend.value || dividend.valor,
          date: dividend.date || dividend.data,
          type: dividend.type || dividend.tipo || 'dividend',
          exDate: dividend.exDate || dividend.data_ex,
          paymentDate: dividend.paymentDate || dividend.data_pagamento
        }));
      },
      CACHE_CONFIG.fundamentals
    );
  }

  // Buscar dados históricos de preços
  async getHistoricalData(ticker, period = '1y') {
    const cacheKey = CacheKeys.FII_HISTORICAL(ticker, period);
    
    return withCache(
      cacheKey,
      async () => {
        const url = `${this.baseURL}/historical/${ticker}?period=${period}`;
        const data = await fetchWithRetry(url, { token: this.token });
        
        return (data.prices || data).map(price => ({
          date: price.date || price.data,
          open: price.open || price.abertura,
          high: price.high || price.maxima,
          low: price.low || price.minima,
          close: price.close || price.fechamento,
          volume: price.volume
        }));
      },
      CACHE_CONFIG.fundamentals
    );
  }

  // Buscar dados da taxa Selic
  async getSelicRate() {
    const cacheKey = CacheKeys.SELIC_RATE;
    
    return withCache(
      cacheKey,
      async () => {
        const url = `${this.baseURL}/selic/current`;
        const data = await fetchWithRetry(url, { token: this.token });
        
        return {
          rate: data.rate || data.taxa,
          date: data.date || data.data,
          nextMeeting: data.nextMeeting || data.proxima_reuniao
        };
      },
      CACHE_CONFIG.fundamentals
    );
  }

  // Buscar múltiplos dados de uma vez (otimizado)
  async getBulkData(tickers) {
    const promises = [
      this.getQuotes(tickers),
      ...tickers.map(ticker => this.getFundamentals(ticker)),
      ...tickers.map(ticker => this.getDividends(ticker, 6))
    ];

    try {
      const results = await Promise.allSettled(promises);
      
      const quotes = results[0].status === 'fulfilled' ? results[0].value : [];
      const fundamentals = results.slice(1, tickers.length + 1)
        .map((result, index) => ({
          ticker: tickers[index],
          data: result.status === 'fulfilled' ? result.value : null
        }));
      const dividends = results.slice(tickers.length + 1)
        .map((result, index) => ({
          ticker: tickers[index],
          data: result.status === 'fulfilled' ? result.value : []
        }));

      return {
        quotes,
        fundamentals,
        dividends
      };
    } catch (error) {
      console.error('Erro ao buscar dados em lote:', error);
      throw error;
    }
  }
}

// Instância padrão da API (sem token)
export const plexaAPI = new PlexaAPIService();

// Factory para criar instância com token
export const createPlexaAPI = (token) => {
  return new PlexaAPIService(token);
};

// Utilitários para verificar status da API
export const checkAPIStatus = async () => {
  try {
    const response = await fetch(`${PLEXA_BASE_URL}/health`, {
      method: 'GET',
      headers: getHeaders()
    });
    
    return {
      status: response.ok ? 'online' : 'offline',
      responseTime: Date.now() - performance.now()
    };
  } catch (error) {
    return {
      status: 'offline',
      error: error.message
    };
  }
};

// Rate limiting simples
class RateLimiter {
  constructor(maxRequests = 10, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
  }

  canMakeRequest() {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    
    if (this.requests.length >= this.maxRequests) {
      return false;
    }
    
    this.requests.push(now);
    return true;
  }

  getTimeUntilReset() {
    if (this.requests.length === 0) return 0;
    
    const oldestRequest = Math.min(...this.requests);
    return Math.max(0, this.windowMs - (Date.now() - oldestRequest));
  }
}

export const rateLimiter = new RateLimiter(10, 60000); // 10 req/min


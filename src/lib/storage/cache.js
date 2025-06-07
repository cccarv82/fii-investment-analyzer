import { CACHE_CONFIG } from '../config.js';

// Sistema de cache em memória com TTL
class CacheManager {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
  }

  // Definir item no cache com TTL
  set(key, value, ttl = CACHE_CONFIG.fundamentals) {
    // Limpar timer existente se houver
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    // Armazenar valor
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl
    });

    // Configurar timer para expiração
    const timer = setTimeout(() => {
      this.delete(key);
    }, ttl);

    this.timers.set(key, timer);
  }

  // Obter item do cache
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Verificar se expirou
    if (Date.now() - item.timestamp > item.ttl) {
      this.delete(key);
      return null;
    }

    return item.value;
  }

  // Verificar se existe no cache
  has(key) {
    return this.get(key) !== null;
  }

  // Deletar item do cache
  delete(key) {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
    this.cache.delete(key);
  }

  // Limpar todo o cache
  clear() {
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
    this.cache.clear();
  }

  // Obter estatísticas do cache
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  // Estimar uso de memória (aproximado)
  estimateMemoryUsage() {
    let size = 0;
    this.cache.forEach((item, key) => {
      size += JSON.stringify(key).length;
      size += JSON.stringify(item.value).length;
    });
    return size;
  }

  // Limpar itens expirados
  cleanup() {
    const now = Date.now();
    const expiredKeys = [];

    this.cache.forEach((item, key) => {
      if (now - item.timestamp > item.ttl) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach(key => this.delete(key));
    return expiredKeys.length;
  }
}

// Instância global do cache
export const cache = new CacheManager();

// Utilitários para chaves de cache
export const CacheKeys = {
  FII_LIST: 'fii_list',
  FII_QUOTES: (ticker) => `fii_quotes_${ticker}`,
  FII_FUNDAMENTALS: (ticker) => `fii_fundamentals_${ticker}`,
  FII_DIVIDENDS: (ticker) => `fii_dividends_${ticker}`,
  FII_HISTORICAL: (ticker, period) => `fii_historical_${ticker}_${period}`,
  MARKET_DATA: 'market_data',
  SELIC_RATE: 'selic_rate',
  AI_ANALYSIS: (ticker) => `ai_analysis_${ticker}`,
  PORTFOLIO_ANALYSIS: (portfolioId) => `portfolio_analysis_${portfolioId}`
};

// Wrapper para cache com fallback
export const withCache = async (key, fetchFunction, ttl) => {
  // Tentar obter do cache primeiro
  const cached = cache.get(key);
  if (cached) {
    return cached;
  }

  try {
    // Buscar dados frescos
    const data = await fetchFunction();
    
    // Armazenar no cache
    cache.set(key, data, ttl);
    
    return data;
  } catch (error) {
    console.error(`Erro ao buscar dados para chave ${key}:`, error);
    throw error;
  }
};

// Cache específico para localStorage (persistente)
export class PersistentCache {
  constructor(prefix = 'fii_app_') {
    this.prefix = prefix;
  }

  set(key, value, ttl = 24 * 60 * 60 * 1000) { // 24h padrão
    const item = {
      value,
      timestamp: Date.now(),
      ttl
    };

    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(item));
    } catch (error) {
      console.warn('Erro ao salvar no localStorage:', error);
    }
  }

  get(key) {
    try {
      const item = localStorage.getItem(this.prefix + key);
      if (!item) return null;

      const parsed = JSON.parse(item);
      
      // Verificar se expirou
      if (Date.now() - parsed.timestamp > parsed.ttl) {
        this.delete(key);
        return null;
      }

      return parsed.value;
    } catch (error) {
      console.warn('Erro ao ler do localStorage:', error);
      return null;
    }
  }

  has(key) {
    return this.get(key) !== null;
  }

  delete(key) {
    try {
      localStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.warn('Erro ao deletar do localStorage:', error);
    }
  }

  clear() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Erro ao limpar localStorage:', error);
    }
  }

  cleanup() {
    try {
      const keys = Object.keys(localStorage);
      let cleaned = 0;

      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          const item = localStorage.getItem(key);
          if (item) {
            try {
              const parsed = JSON.parse(item);
              if (Date.now() - parsed.timestamp > parsed.ttl) {
                localStorage.removeItem(key);
                cleaned++;
              }
            } catch (error) {
              // Item corrompido, remover
              localStorage.removeItem(key);
              cleaned++;
            }
          }
        }
      });

      return cleaned;
    } catch (error) {
      console.warn('Erro ao limpar localStorage:', error);
      return 0;
    }
  }
}

// Instância do cache persistente
export const persistentCache = new PersistentCache();

// Auto-limpeza periódica
setInterval(() => {
  cache.cleanup();
  persistentCache.cleanup();
}, 5 * 60 * 1000); // A cada 5 minutos


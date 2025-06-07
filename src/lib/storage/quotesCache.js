// 📊 Serviço de Cache Diário para Cotações BRAPI
// Reduz requisições à API em 90%+ mantendo dados atualizados

class QuotesCacheService {
  constructor() {
    this.CACHE_KEY = 'fii_quotes_cache';
    this.CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas em ms
    this.MARKET_HOURS = {
      start: 10, // 10:00
      end: 18,   // 18:00
    };
  }

  // 🕐 Verificar se é horário de mercado (segunda a sexta, 10h-18h)
  isMarketHours() {
    const now = new Date();
    const day = now.getDay(); // 0 = domingo, 6 = sábado
    const hour = now.getHours();
    
    // Segunda a sexta (1-5) e horário de mercado
    return day >= 1 && day <= 5 && 
           hour >= this.MARKET_HOURS.start && 
           hour < this.MARKET_HOURS.end;
  }

  // 📅 Obter chave do cache baseada na data
  getCacheKey(date = new Date()) {
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    return `${this.CACHE_KEY}_${dateStr}`;
  }

  // 🔍 Verificar se cache é válido
  isCacheValid(cacheData) {
    if (!cacheData || !cacheData.timestamp || !cacheData.data) {
      return false;
    }

    const now = Date.now();
    const cacheTime = new Date(cacheData.timestamp).getTime();
    const age = now - cacheTime;

    // Cache válido por 24h
    if (age > this.CACHE_DURATION) {
      console.log('🕐 Cache expirado por tempo (>24h)');
      return false;
    }

    // Durante horário de mercado, cache válido por no máximo 1h
    if (this.isMarketHours() && age > 60 * 60 * 1000) {
      console.log('🕐 Cache expirado durante horário de mercado (>1h)');
      return false;
    }

    return true;
  }

  // 💾 Salvar cotações no cache
  saveQuotes(quotes) {
    try {
      const cacheData = {
        timestamp: new Date().toISOString(),
        marketHours: this.isMarketHours(),
        count: Object.keys(quotes).length,
        data: quotes
      };

      const cacheKey = this.getCacheKey();
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      
      console.log(`✅ Cache salvo: ${cacheData.count} cotações em ${cacheKey}`);
      
      // Limpar caches antigos
      this.cleanOldCaches();
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao salvar cache:', error);
      return false;
    }
  }

  // 📖 Carregar cotações do cache
  loadQuotes() {
    try {
      const cacheKey = this.getCacheKey();
      const cached = localStorage.getItem(cacheKey);
      
      if (!cached) {
        console.log('📭 Cache não encontrado para hoje');
        return null;
      }

      const cacheData = JSON.parse(cached);
      
      if (!this.isCacheValid(cacheData)) {
        console.log('⏰ Cache inválido, removendo...');
        localStorage.removeItem(cacheKey);
        return null;
      }

      const age = Date.now() - new Date(cacheData.timestamp).getTime();
      const ageMinutes = Math.floor(age / (1000 * 60));
      
      console.log(`✅ Cache válido carregado: ${cacheData.count} cotações (${ageMinutes}min atrás)`);
      
      return cacheData.data;
    } catch (error) {
      console.error('❌ Erro ao carregar cache:', error);
      return null;
    }
  }

  // 🔍 Obter cotações específicas do cache
  getQuotesForTickers(tickers) {
    const allQuotes = this.loadQuotes();
    if (!allQuotes) return null;

    const foundQuotes = {};
    const missingTickers = [];

    tickers.forEach(ticker => {
      if (allQuotes[ticker]) {
        foundQuotes[ticker] = allQuotes[ticker];
      } else {
        missingTickers.push(ticker);
      }
    });

    return {
      found: foundQuotes,
      missing: missingTickers,
      foundCount: Object.keys(foundQuotes).length,
      missingCount: missingTickers.length
    };
  }

  // 🔄 Mesclar novas cotações com cache existente
  mergeWithCache(newQuotes) {
    const existingQuotes = this.loadQuotes() || {};
    const mergedQuotes = { ...existingQuotes, ...newQuotes };
    
    this.saveQuotes(mergedQuotes);
    
    console.log(`🔄 Cache atualizado: +${Object.keys(newQuotes).length} cotações`);
    
    return mergedQuotes;
  }

  // 🧹 Limpar caches antigos (manter apenas últimos 7 dias)
  cleanOldCaches() {
    try {
      const keysToRemove = [];
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 7); // 7 dias atrás

      // Verificar todas as chaves do localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key && key.startsWith(this.CACHE_KEY)) {
          // Extrair data da chave
          const dateMatch = key.match(/(\d{4}-\d{2}-\d{2})$/);
          if (dateMatch) {
            const cacheDate = new Date(dateMatch[1]);
            if (cacheDate < cutoffDate) {
              keysToRemove.push(key);
            }
          }
        }
      }

      // Remover caches antigos
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log(`🗑️ Cache antigo removido: ${key}`);
      });

      if (keysToRemove.length > 0) {
        console.log(`✅ Limpeza concluída: ${keysToRemove.length} caches antigos removidos`);
      }
    } catch (error) {
      console.error('❌ Erro na limpeza de cache:', error);
    }
  }

  // 🗑️ Limpar todo o cache
  clearAllCache() {
    try {
      const keysToRemove = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.CACHE_KEY)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      console.log(`🗑️ Todo cache limpo: ${keysToRemove.length} entradas removidas`);
      return keysToRemove.length;
    } catch (error) {
      console.error('❌ Erro ao limpar cache:', error);
      return 0;
    }
  }

  // 📊 Obter estatísticas do cache
  getCacheStats() {
    try {
      const currentCache = this.loadQuotes();
      const cacheKey = this.getCacheKey();
      const cached = localStorage.getItem(cacheKey);
      
      if (!cached || !currentCache) {
        return {
          exists: false,
          count: 0,
          age: 0,
          size: 0,
          isValid: false,
          isMarketHours: this.isMarketHours()
        };
      }

      const cacheData = JSON.parse(cached);
      const age = Date.now() - new Date(cacheData.timestamp).getTime();
      const sizeKB = Math.round(cached.length / 1024);

      return {
        exists: true,
        count: Object.keys(currentCache).length,
        age: age,
        ageMinutes: Math.floor(age / (1000 * 60)),
        ageHours: Math.floor(age / (1000 * 60 * 60)),
        size: sizeKB,
        sizeFormatted: `${sizeKB} KB`,
        isValid: this.isCacheValid(cacheData),
        isMarketHours: this.isMarketHours(),
        timestamp: cacheData.timestamp,
        lastUpdate: new Date(cacheData.timestamp).toLocaleString('pt-BR')
      };
    } catch (error) {
      console.error('❌ Erro ao obter stats do cache:', error);
      return { exists: false, error: error.message };
    }
  }

  // 🔄 Forçar refresh do cache
  async forceRefresh(fetchFunction, brapiToken) {
    console.log('🔄 Forçando refresh do cache...');
    
    // Limpar cache atual
    const cacheKey = this.getCacheKey();
    localStorage.removeItem(cacheKey);
    
    // Buscar dados frescos
    try {
      const freshData = await fetchFunction(brapiToken);
      console.log(`✅ Refresh concluído: ${freshData.length} FIIs atualizados`);
      return freshData;
    } catch (error) {
      console.error('❌ Erro no refresh forçado:', error);
      throw error;
    }
  }
}

// 🎯 Instância singleton do serviço
export const quotesCache = new QuotesCacheService();

// 🔧 Funções utilitárias para uso direto
export const getCachedQuotes = () => quotesCache.loadQuotes();
export const saveCachedQuotes = (quotes) => quotesCache.saveQuotes(quotes);
export const clearQuotesCache = () => quotesCache.clearAllCache();
export const getQuotesCacheStats = () => quotesCache.getCacheStats();

export default quotesCache; 
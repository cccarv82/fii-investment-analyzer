// 🚀 FII DATA API - INTERFACE FRONTEND PARA SISTEMA HÍBRIDO
// Wrapper para acessar o sistema híbrido via API calls

class FIIDataAPI {
  constructor() {
    this.baseUrl = 'http://localhost:3001/api/fii-data';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
  }

  /**
   * 🔍 BUSCAR DADOS DE FIIs ESPECÍFICOS
   */
  async getFIIData(tickers = null) {
    // Se não especificar tickers, buscar todos
    if (!tickers) {
      return this.getAllFIIs();
    }

    const cacheKey = `fii-data-${tickers.sort().join(',')}`;
    
    // Verificar cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        console.log('📦 Dados obtidos do cache');
        return cached.data;
      }
    }

    try {
      console.log(`🔍 Buscando dados de FIIs via API: ${tickers.join(', ')}`);
      
      const response = await fetch(`${this.baseUrl}/get-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tickers })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Salvar no cache
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      console.log(`✅ Dados de ${data.length} FIIs obtidos com sucesso`);
      return data;

    } catch (error) {
      console.error('❌ Erro ao buscar dados FII:', error);
      throw error;
    }
  }

  /**
   * 🌐 BUSCAR TODOS OS FIIs DISPONÍVEIS
   */
  async getAllFIIs() {
    const cacheKey = 'all-fiis';
    
    // Verificar cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        console.log('📦 Todos os FIIs obtidos do cache');
        return cached.data;
      }
    }

    try {
      console.log('🌐 Buscando todos os FIIs via API...');
      
      const response = await fetch(`${this.baseUrl}/all-fiis`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Salvar no cache
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      console.log(`✅ ${data.length} FIIs obtidos com sucesso`);
      return data;

    } catch (error) {
      console.error('❌ Erro ao buscar todos os FIIs:', error);
      throw error;
    }
  }

  /**
   * 🎯 BUSCAR MELHORES FIIs PARA IA
   */
  async getBestFIIs(limit = 10, filters = {}) {
    try {
      console.log(`🎯 Buscando top ${limit} FIIs para análise...`);
      
      const response = await fetch(`${this.baseUrl}/best-fiis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ limit, filters })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ Top ${data.length} FIIs obtidos para análise`);
      return data;

    } catch (error) {
      console.error('❌ Erro ao buscar melhores FIIs:', error);
      throw error;
    }
  }

  /**
   * 🔄 ATUALIZAR DADOS FORÇADAMENTE
   */
  async refreshData(tickers = null) {
    try {
      console.log('🔄 Forçando atualização de dados...');
      
      const response = await fetch(`${this.baseUrl}/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tickers })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Limpar cache
      this.cache.clear();
      
      console.log(`✅ ${data.updated_count} FIIs atualizados com sucesso!`);
      return data;

    } catch (error) {
      console.error('❌ Erro ao atualizar dados:', error);
      throw error;
    }
  }

  /**
   * 📊 OBTER ESTATÍSTICAS DO SISTEMA
   */
  async getStats() {
    try {
      console.log('📊 Obtendo estatísticas do sistema...');
      
      const response = await fetch(`${this.baseUrl}/stats`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const stats = await response.json();
      console.log('📈 Estatísticas obtidas:', stats);
      return stats;

    } catch (error) {
      console.error('❌ Erro ao obter estatísticas:', error);
      throw error;
    }
  }

  /**
   * 🔍 BUSCAR FII ESPECÍFICO
   */
  async getFII(ticker) {
    const data = await this.getFIIData([ticker]);
    return data.length > 0 ? data[0] : null;
  }

  /**
   * 📈 ANÁLISE FUNDAMENTALISTA
   */
  async getAnalysis(ticker) {
    try {
      console.log(`📈 Obtendo análise fundamentalista de ${ticker}...`);
      
      const response = await fetch(`${this.baseUrl}/analysis/${ticker}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const analysis = await response.json();
      console.log(`✅ Análise de ${ticker} obtida`);
      return analysis;

    } catch (error) {
      console.error('❌ Erro ao obter análise:', error);
      throw error;
    }
  }

  /**
   * 🧹 LIMPAR CACHE
   */
  clearCache() {
    this.cache.clear();
    console.log('🧹 Cache limpo');
  }

  /**
   * 🎯 BUSCAR MELHORES FIIs PARA IA (alias para getBestFIIs)
   */
  async getBestFIIsForAI(limit = 20, filters = {}) {
    return this.getBestFIIs(limit, filters);
  }

  /**
   * 📊 OBTER ESTATÍSTICAS DO SISTEMA (alias para getStats)
   */
  async getSystemStats() {
    return this.getStats();
  }

  /**
   * 🧹 LIMPEZA DO SISTEMA
   */
  async cleanup() {
    try {
      console.log('🧹 Executando limpeza do sistema...');
      
      const response = await fetch(`${this.baseUrl}/cleanup`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      this.clearCache();
      console.log('✅ Limpeza do sistema concluída');
      return { success: true };

    } catch (error) {
      console.error('❌ Erro na limpeza do sistema:', error);
      throw error;
    }
  }
}

// Instância singleton
const fiiDataAPI = new FIIDataAPI();

export default fiiDataAPI; 
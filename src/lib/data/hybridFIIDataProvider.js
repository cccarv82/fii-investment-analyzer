// 🚀 HYBRID FII DATA PROVIDER
// Combina Status Invest (dados básicos) + Fundamentus (dados FFO)

import statusInvestScraper from './statusInvestScraper.js';
import fundamentusScraper from './fundamentusScraper.js';

class HybridFIIDataProvider {
  constructor() {
    this.requestDelay = 1000; // 1 segundo entre requests
    this.maxRetries = 3;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
  }

  /**
   * 🎯 MÉTODO PRINCIPAL: Buscar dados completos de um FII
   */
  async getFIIData(ticker) {
    try {
      console.log(`🔍 Buscando dados completos do ${ticker} (Status Invest + Fundamentus)...`);
      
      // Verificar cache
      const cached = this.getFromCache(ticker);
      if (cached) {
        console.log(`✅ Dados do ${ticker} encontrados no cache`);
        return cached;
      }
      
      // Buscar dados em paralelo das duas fontes
      const [statusInvestData, fundamentusData] = await Promise.allSettled([
        this.getStatusInvestData(ticker),
        this.getFundamentusData(ticker)
      ]);
      
      // Combinar dados das duas fontes
      const combinedData = this.combineData(
        ticker,
        statusInvestData.status === 'fulfilled' ? statusInvestData.value : null,
        fundamentusData.status === 'fulfilled' ? fundamentusData.value : null
      );
      
      // Validar dados combinados
      const validation = this.validateCombinedData(combinedData);
      
      // Adicionar metadados
      const finalData = {
        ...combinedData,
        validation,
        sources: {
          status_invest: statusInvestData.status === 'fulfilled',
          fundamentus: fundamentusData.status === 'fulfilled'
        },
        scraped_at: new Date().toISOString(),
        cache_key: `hybrid_${ticker}_${Date.now()}`
      };
      
      // Salvar no cache
      this.saveToCache(ticker, finalData);
      
      console.log(`✅ Dados híbridos do ${ticker} extraídos com sucesso!`);
      console.log(`📊 Qualidade: ${validation.overall_score.toFixed(1)}% (SI: ${statusInvestData.status === 'fulfilled' ? '✅' : '❌'}, Fund: ${fundamentusData.status === 'fulfilled' ? '✅' : '❌'})`);
      
      return finalData;
      
    } catch (error) {
      console.error(`❌ Erro ao buscar dados híbridos ${ticker}:`, error.message);
      throw error;
    }
  }

  /**
   * 📊 BUSCAR DADOS DO STATUS INVEST
   */
  async getStatusInvestData(ticker) {
    try {
      console.log(`🔍 Buscando dados básicos do ${ticker} no Status Invest...`);
      const data = await statusInvestScraper.getFIIData(ticker);
      console.log(`✅ Status Invest: Dados básicos extraídos para ${ticker}`);
      return data;
    } catch (error) {
      console.warn(`⚠️ Status Invest falhou para ${ticker}:`, error.message);
      throw error;
    }
  }

  /**
   * 💰 BUSCAR DADOS FFO DO FUNDAMENTUS
   */
  async getFundamentusData(ticker) {
    try {
      console.log(`🔍 Buscando dados FFO do ${ticker} no Fundamentus...`);
      const data = await fundamentusScraper.getFIIData(ticker);
      console.log(`✅ Fundamentus: Dados FFO extraídos para ${ticker}`);
      return data;
    } catch (error) {
      console.warn(`⚠️ Fundamentus falhou para ${ticker}:`, error.message);
      throw error;
    }
  }

  /**
   * 🔄 COMBINAR DADOS DAS DUAS FONTES
   */
  combineData(ticker, statusInvestData, fundamentusData) {
    console.log(`🔄 Combinando dados do ${ticker}...`);
    
    // Dados base
    const combinedData = {
      ticker: ticker.toUpperCase(),
      name: null,
      price: null,
      
      // Dados básicos (prioridade: Status Invest)
      dividend_yield: null,
      pvp: null,
      liquidity: null,
      vacancy_rate: null,
      admin_fee: null,
      management_company: null,
      
      // Dados FFO (prioridade: Fundamentus)
      ffo_yield: null,
      ffo_per_share: null,
      ffo_12m: null,
      ffo_3m: null,
      p_ffo: null,
      
      // Dados financeiros complementares
      market_cap: null,
      shares_outstanding: null,
      revenue_12m: null,
      distributed_income_12m: null,
      total_assets: null,
      net_equity: null,
      equity_per_share: null,
      
      // Metadados
      sector: 'Fundos Imobiliários',
      is_active: true
    };
    
    // Aplicar dados do Status Invest (dados básicos)
    if (statusInvestData) {
      console.log(`📊 Aplicando dados do Status Invest...`);
      
      combinedData.name = statusInvestData.name || statusInvestData.ticker;
      combinedData.price = statusInvestData.price;
      combinedData.dividend_yield = statusInvestData.dividend_yield;
      combinedData.pvp = statusInvestData.pvp;
      combinedData.liquidity = statusInvestData.liquidity;
      combinedData.vacancy_rate = statusInvestData.vacancy_rate;
      combinedData.admin_fee = statusInvestData.admin_fee;
      combinedData.management_company = statusInvestData.management_company;
      combinedData.market_cap = statusInvestData.market_cap;
      combinedData.shares_outstanding = statusInvestData.shares_outstanding;
    }
    
    // Aplicar dados do Fundamentus (dados FFO + complementares)
    if (fundamentusData) {
      console.log(`💰 Aplicando dados FFO do Fundamentus...`);
      
      // Dados FFO (prioridade total do Fundamentus)
      combinedData.ffo_yield = fundamentusData.ffo_yield;
      combinedData.ffo_per_share = fundamentusData.ffo_per_share;
      combinedData.ffo_12m = fundamentusData.ffo_12m;
      combinedData.ffo_3m = fundamentusData.ffo_3m;
      combinedData.p_ffo = fundamentusData.p_ffo;
      
      // Dados financeiros complementares (se não temos do Status Invest)
      if (!combinedData.price && fundamentusData.price) {
        combinedData.price = fundamentusData.price;
      }
      if (!combinedData.dividend_yield && fundamentusData.dividend_yield) {
        combinedData.dividend_yield = fundamentusData.dividend_yield;
      }
      if (!combinedData.pvp && fundamentusData.pvp) {
        combinedData.pvp = fundamentusData.pvp;
      }
      if (!combinedData.market_cap && fundamentusData.market_cap) {
        combinedData.market_cap = fundamentusData.market_cap;
      }
      if (!combinedData.shares_outstanding && fundamentusData.shares_outstanding) {
        combinedData.shares_outstanding = fundamentusData.shares_outstanding;
      }
      
      // Dados exclusivos do Fundamentus
      combinedData.revenue_12m = fundamentusData.revenue_12m;
      combinedData.distributed_income_12m = fundamentusData.distributed_income_12m;
      combinedData.total_assets = fundamentusData.total_assets;
      combinedData.net_equity = fundamentusData.net_equity;
      combinedData.equity_per_share = fundamentusData.equity_per_share;
    }
    
    // Calcular P/FFO se temos preço e FFO por cota
    if (combinedData.price && combinedData.ffo_per_share && !combinedData.p_ffo) {
      combinedData.p_ffo = parseFloat((combinedData.price / combinedData.ffo_per_share).toFixed(2));
      console.log(`✅ P/FFO calculado: ${combinedData.p_ffo}`);
    }
    
    console.log(`✅ Dados combinados para ${ticker}:`, {
      basic_data: !!statusInvestData,
      ffo_data: !!fundamentusData,
      price: combinedData.price,
      ffo_yield: combinedData.ffo_yield,
      p_ffo: combinedData.p_ffo
    });
    
    return combinedData;
  }

  /**
   * ✅ VALIDAR DADOS COMBINADOS
   */
  validateCombinedData(data) {
    const validation = {
      basic_data_score: 0,
      ffo_data_score: 0,
      financial_data_score: 0,
      overall_score: 0,
      missing_fields: [],
      data_sources: {
        status_invest_fields: 0,
        fundamentus_fields: 0
      }
    };
    
    // Validar dados básicos (Status Invest)
    const basicFields = ['price', 'dividend_yield', 'pvp', 'liquidity', 'admin_fee'];
    let basicScore = 0;
    
    basicFields.forEach(field => {
      if (data[field] !== null && data[field] !== undefined) {
        basicScore++;
        validation.data_sources.status_invest_fields++;
      } else {
        validation.missing_fields.push(field);
      }
    });
    
    validation.basic_data_score = (basicScore / basicFields.length) * 100;
    
    // Validar dados FFO (Fundamentus)
    const ffoFields = ['ffo_yield', 'ffo_per_share', 'p_ffo'];
    let ffoScore = 0;
    
    ffoFields.forEach(field => {
      if (data[field] !== null && data[field] !== undefined) {
        ffoScore++;
        validation.data_sources.fundamentus_fields++;
      } else {
        validation.missing_fields.push(field);
      }
    });
    
    validation.ffo_data_score = (ffoScore / ffoFields.length) * 100;
    
    // Validar dados financeiros complementares
    const financialFields = ['market_cap', 'shares_outstanding', 'total_assets', 'net_equity'];
    let financialScore = 0;
    
    financialFields.forEach(field => {
      if (data[field] !== null && data[field] !== undefined) {
        financialScore++;
      }
    });
    
    validation.financial_data_score = (financialScore / financialFields.length) * 100;
    
    // Score geral (ponderado)
    validation.overall_score = (
      validation.basic_data_score * 0.4 +
      validation.ffo_data_score * 0.4 +
      validation.financial_data_score * 0.2
    );
    
    return validation;
  }

  /**
   * 📊 BUSCAR MÚLTIPLOS FIIs
   */
  async getFIIsData(tickers, onProgress = null) {
    const results = [];
    const errors = [];
    
    console.log(`🚀 Iniciando scraping híbrido de ${tickers.length} FIIs...`);
    
    for (let i = 0; i < tickers.length; i++) {
      const ticker = tickers[i];
      
      try {
        if (onProgress) {
          onProgress({
            current: i + 1,
            total: tickers.length,
            ticker,
            percentage: Math.round(((i + 1) / tickers.length) * 100)
          });
        }
        
        const data = await this.getFIIData(ticker);
        results.push(data);
        
        // Rate limiting entre requests
        if (i < tickers.length - 1) {
          await this.delay(this.requestDelay);
        }
        
      } catch (error) {
        console.error(`❌ Erro ao processar ${ticker}:`, error.message);
        errors.push({ ticker, error: error.message });
      }
    }
    
    // Estatísticas finais
    const stats = this.calculateStats(results);
    
    console.log(`✅ Scraping híbrido concluído: ${results.length} sucessos, ${errors.length} erros`);
    console.log(`📊 Qualidade média: ${stats.average_quality.toFixed(1)}%`);
    console.log(`💰 FFO disponível: ${stats.ffo_availability.toFixed(1)}%`);
    
    return {
      success: results,
      errors,
      stats: {
        total: tickers.length,
        success_count: results.length,
        error_count: errors.length,
        success_rate: (results.length / tickers.length) * 100,
        ...stats
      }
    };
  }

  /**
   * 📊 CALCULAR ESTATÍSTICAS
   */
  calculateStats(results) {
    if (results.length === 0) {
      return {
        average_quality: 0,
        ffo_availability: 0,
        basic_data_availability: 0,
        source_distribution: { status_invest: 0, fundamentus: 0, both: 0 }
      };
    }
    
    const totalQuality = results.reduce((sum, r) => sum + r.validation.overall_score, 0);
    const ffoAvailable = results.filter(r => r.ffo_yield !== null).length;
    const basicDataAvailable = results.filter(r => r.price !== null).length;
    
    const sourceDistribution = {
      status_invest: results.filter(r => r.sources.status_invest && !r.sources.fundamentus).length,
      fundamentus: results.filter(r => !r.sources.status_invest && r.sources.fundamentus).length,
      both: results.filter(r => r.sources.status_invest && r.sources.fundamentus).length
    };
    
    return {
      average_quality: totalQuality / results.length,
      ffo_availability: (ffoAvailable / results.length) * 100,
      basic_data_availability: (basicDataAvailable / results.length) * 100,
      source_distribution: sourceDistribution
    };
  }

  /**
   * 🗄️ GERENCIAMENTO DE CACHE
   */
  getFromCache(ticker) {
    const cached = this.cache.get(ticker.toUpperCase());
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  saveToCache(ticker, data) {
    this.cache.set(ticker.toUpperCase(), {
      data,
      timestamp: Date.now()
    });
  }

  clearCache() {
    this.cache.clear();
    console.log('🗑️ Cache limpo');
  }

  /**
   * 🛠️ UTILITÁRIOS
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 📊 OBTER ESTATÍSTICAS DO CACHE
   */
  getCacheStats() {
    const now = Date.now();
    const validEntries = Array.from(this.cache.values()).filter(
      entry => (now - entry.timestamp) < this.cacheTimeout
    );
    
    return {
      total_entries: this.cache.size,
      valid_entries: validEntries.length,
      expired_entries: this.cache.size - validEntries.length,
      cache_hit_rate: validEntries.length > 0 ? (validEntries.length / this.cache.size) * 100 : 0
    };
  }
}

// 🚀 EXPORTAR INSTÂNCIA SINGLETON
const hybridFIIDataProvider = new HybridFIIDataProvider();
export default hybridFIIDataProvider; 
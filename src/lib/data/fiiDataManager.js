// 🚀 FII DATA MANAGER - SOLUÇÃO DEFINITIVA HÍBRIDA
// Sistema completo de gestão de dados fundamentalistas com FFO

import hybridFIIDataProvider from './hybridFIIDataProvider.js';
import { supabase } from '../supabase.js';

class FIIDataManager {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 24 * 60 * 60 * 1000; // 24 horas
    this.isUpdating = false;
    this.lastUpdate = null;
    
    // Lista de FIIs mais negociados para análise
    this.topFIIs = [
      'MXRF11', 'CPTS11', 'RBRF11', 'HGLG11', 'XPML11',
      'KNRI11', 'BCFF11', 'HGRU11', 'VISC11', 'KNCR11',
      'IRDM11', 'RECR11', 'KNHY11', 'BPML11', 'VGIR11',
      'XPLG11', 'HGRE11', 'HGCR11', 'VILG11', 'BTLG11',
      'RBRR11', 'ALZR11', 'JSRE11', 'URPR11', 'MALL11',
      'GGRC11', 'TGAR11', 'RBRP11', 'XPPR11', 'FIIB11'
    ];
  }

  /**
   * 🎯 MÉTODO PRINCIPAL: Obter dados de FIIs
   */
  async getFIIData(tickers = null) {
    try {
      console.log('🚀 Iniciando busca de dados FII (Sistema Híbrido)...');
      
      // Se não especificou tickers, usar lista padrão
      const targetTickers = tickers || this.topFIIs;
      
      // Verificar cache primeiro
      const cachedData = await this.getCachedData(targetTickers);
      const needsUpdate = this.needsDataUpdate(cachedData, targetTickers);
      
      if (!needsUpdate && cachedData.length > 0) {
        console.log(`✅ Usando dados em cache (${cachedData.length} FIIs)`);
        return cachedData;
      }
      
      // Buscar dados atualizados usando sistema híbrido
      console.log(`🔄 Atualizando dados de ${targetTickers.length} FIIs (Status Invest + Fundamentus)...`);
      const freshData = await this.fetchFreshData(targetTickers);
      
      // Salvar no cache e Supabase
      await this.saveData(freshData);
      
      console.log(`✅ Dados híbridos atualizados com sucesso (${freshData.length} FIIs)`);
      return freshData;
      
    } catch (error) {
      console.error('❌ Erro ao obter dados FII:', error);
      
      // Fallback para dados em cache mesmo que antigos
      const fallbackData = await this.getFallbackData(tickers);
      if (fallbackData.length > 0) {
        console.warn(`⚠️ Usando dados de fallback (${fallbackData.length} FIIs)`);
        return fallbackData;
      }
      
      throw error;
    }
  }

  /**
   * 📊 BUSCAR MELHORES FIIs PARA IA
   */
  async getBestFIIsForAI(limit = 20) {
    try {
      console.log(`🎯 Buscando top ${limit} FIIs para análise IA (com dados FFO)...`);
      
      // Buscar dados completos
      const allData = await this.getFIIData();
      
      // Filtrar e ranquear por qualidade (incluindo FFO)
      const rankedFIIs = allData
        .filter(fii => this.isValidForAnalysis(fii))
        .sort((a, b) => this.calculateOverallScore(b) - this.calculateOverallScore(a))
        .slice(0, limit);
      
      console.log(`✅ Selecionados ${rankedFIIs.length} FIIs de alta qualidade (com FFO)`);
      
      // Adicionar dados enriquecidos para IA
      return rankedFIIs.map(fii => this.enrichDataForAI(fii));
      
    } catch (error) {
      console.error('❌ Erro ao buscar melhores FIIs:', error);
      throw error;
    }
  }

  /**
   * 🔄 BUSCAR DADOS FRESCOS DO SISTEMA HÍBRIDO
   */
  async fetchFreshData(tickers) {
    const results = [];
    const errors = [];
    
    console.log(`🌐 Fazendo scraping híbrido de ${tickers.length} FIIs...`);
    
    // Usar sistema híbrido com callback de progresso
    const scrapingResult = await hybridFIIDataProvider.getFIIsData(
      tickers,
      (progress) => {
        console.log(`📊 Progresso: ${progress.percentage}% (${progress.current}/${progress.total}) - ${progress.ticker}`);
      }
    );
    
    // Processar resultados
    for (const data of scrapingResult.success) {
      try {
        // Validar dados híbridos
        const validation = this.validateHybridData(data);
        if (!validation.isValid) {
          console.warn(`⚠️ Dados híbridos inválidos para ${data.ticker}:`, validation.errors);
          continue;
        }
        
        // Processar e enriquecer dados
        const processedData = this.processHybridData(data);
        results.push(processedData);
        
      } catch (error) {
        console.error(`❌ Erro ao processar ${data.ticker}:`, error);
        errors.push({ ticker: data.ticker, error: error.message });
      }
    }
    
    // Log de estatísticas
    console.log(`📈 Scraping híbrido concluído:`);
    console.log(`   ✅ Sucessos: ${results.length}`);
    console.log(`   ❌ Erros: ${scrapingResult.errors.length + errors.length}`);
    console.log(`   📊 Taxa de sucesso: ${scrapingResult.stats.success_rate.toFixed(1)}%`);
    console.log(`   💰 FFO disponível: ${scrapingResult.stats.ffo_availability.toFixed(1)}%`);
    
    return results;
  }

  /**
   * 🔧 PROCESSAR DADOS HÍBRIDOS
   */
  processHybridData(hybridData) {
    // Dados básicos (Status Invest + Fundamentus)
    const processed = {
      ticker: hybridData.ticker,
      name: hybridData.name,
      price: hybridData.price,
      market_cap: hybridData.market_cap,
      shares_outstanding: hybridData.shares_outstanding,
      
      // Métricas fundamentalistas (Status Invest)
      dividend_yield: hybridData.dividend_yield,
      pvp: hybridData.pvp,
      liquidity: hybridData.liquidity,
      vacancy_rate: hybridData.vacancy_rate,
      admin_fee: hybridData.admin_fee,
      management_company: hybridData.management_company,
      
      // Dados FFO (Fundamentus) - NOVIDADE!
      ffo_yield: hybridData.ffo_yield,
      ffo_per_share: hybridData.ffo_per_share,
      ffo_12m: hybridData.ffo_12m,
      ffo_3m: hybridData.ffo_3m,
      p_ffo: hybridData.p_ffo,
      
      // Dados financeiros complementares
      revenue_12m: hybridData.revenue_12m,
      distributed_income_12m: hybridData.distributed_income_12m,
      total_assets: hybridData.total_assets,
      net_equity: hybridData.net_equity,
      equity_per_share: hybridData.equity_per_share,
      
      // Metadados do sistema híbrido
      data_sources: hybridData.sources,
      data_quality: hybridData.validation,
      source: 'hybrid_system',
      last_update: new Date().toISOString(),
      is_active: true
    };
    
    // Calcular métricas adicionais
    processed.dividend_yield_monthly = processed.dividend_yield ? processed.dividend_yield / 12 : null;
    processed.market_cap_billions = processed.market_cap ? processed.market_cap / 1000000000 : null;
    processed.price_to_book_category = this.categorizePVP(processed.pvp);
    processed.dividend_category = this.categorizeDividendYield(processed.dividend_yield);
    processed.liquidity_category = this.categorizeLiquidity(processed.liquidity);
    
    // Adicionar análise de risco (incluindo FFO)
    processed.risk_level = this.calculateRiskLevel(processed);
    processed.investment_thesis = this.generateInvestmentThesis(processed);
    
    // Scores de qualidade específicos do sistema híbrido
    processed.quality_score = this.calculateHybridQualityScore(processed);
    processed.sustainability_score = this.calculateSustainabilityScore(processed);
    processed.growth_score = this.calculateGrowthScore(processed);
    
    return processed;
  }

  /**
   * ✅ VALIDAR DADOS HÍBRIDOS
   */
  validateHybridData(data) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: []
    };
    
    // Validações básicas
    if (!data.ticker) {
      validation.isValid = false;
      validation.errors.push('Ticker ausente');
    }
    
    if (!data.price || data.price <= 0) {
      validation.isValid = false;
      validation.errors.push('Preço inválido');
    }
    
    // Validações FFO (warnings se ausentes)
    if (!data.ffo_yield) {
      validation.warnings.push('FFO Yield ausente');
    }
    
    if (!data.ffo_per_share) {
      validation.warnings.push('FFO/Cota ausente');
    }
    
    if (!data.p_ffo) {
      validation.warnings.push('P/FFO ausente');
    }
    
    // Validar qualidade geral
    if (data.validation && data.validation.overall_score < 30) {
      validation.isValid = false;
      validation.errors.push('Qualidade de dados muito baixa');
    }
    
    return validation;
  }

  /**
   * 📊 CALCULAR SCORE DE QUALIDADE HÍBRIDO
   */
  calculateHybridQualityScore(fii) {
    let score = 0;
    let maxScore = 0;
    
    // Dados básicos (40% do score)
    const basicFields = ['price', 'dividend_yield', 'pvp', 'liquidity'];
    basicFields.forEach(field => {
      maxScore += 10;
      if (fii[field] !== null && fii[field] !== undefined) {
        score += 10;
      }
    });
    
    // Dados FFO (40% do score) - NOVIDADE!
    const ffoFields = ['ffo_yield', 'ffo_per_share', 'p_ffo'];
    ffoFields.forEach(field => {
      maxScore += 13.33;
      if (fii[field] !== null && fii[field] !== undefined) {
        score += 13.33;
      }
    });
    
    // Dados complementares (20% do score)
    const complementaryFields = ['admin_fee', 'vacancy_rate', 'management_company'];
    complementaryFields.forEach(field => {
      maxScore += 6.67;
      if (fii[field] !== null && fii[field] !== undefined) {
        score += 6.67;
      }
    });
    
    return Math.round((score / maxScore) * 10);
  }

  /**
   * 📈 CALCULAR SCORE DE SUSTENTABILIDADE (incluindo FFO)
   */
  calculateSustainabilityScore(fii) {
    let score = 5; // Base
    
    // Dividend Yield sustentável
    if (fii.dividend_yield >= 6 && fii.dividend_yield <= 12) score += 2;
    else if (fii.dividend_yield > 12) score -= 1;
    
    // FFO Yield sustentável - NOVIDADE!
    if (fii.ffo_yield >= 8 && fii.ffo_yield <= 15) score += 2;
    else if (fii.ffo_yield > 15) score -= 1;
    
    // P/VP conservador
    if (fii.pvp >= 0.8 && fii.pvp <= 1.2) score += 1;
    else if (fii.pvp > 1.5) score -= 1;
    
    // P/FFO conservador - NOVIDADE!
    if (fii.p_ffo >= 8 && fii.p_ffo <= 15) score += 1;
    else if (fii.p_ffo > 20) score -= 1;
    
    // Taxa de vacância baixa
    if (fii.vacancy_rate && fii.vacancy_rate < 5) score += 1;
    else if (fii.vacancy_rate > 15) score -= 1;
    
    return Math.max(1, Math.min(10, score));
  }

  /**
   * 🚀 CALCULAR SCORE DE CRESCIMENTO (incluindo FFO)
   */
  calculateGrowthScore(fii) {
    let score = 5; // Base
    
    // Liquidez alta indica potencial de crescimento
    if (fii.liquidity > 1000000) score += 2;
    else if (fii.liquidity < 100000) score -= 1;
    
    // FFO Yield alto indica potencial - NOVIDADE!
    if (fii.ffo_yield > 10) score += 1;
    
    // P/FFO baixo indica oportunidade - NOVIDADE!
    if (fii.p_ffo && fii.p_ffo < 12) score += 1;
    
    // Gestora conhecida
    if (fii.management_company && fii.management_company.length > 0) score += 1;
    
    return Math.max(1, Math.min(10, score));
  }

  /**
   * 💾 SALVAR DADOS NO SUPABASE E CACHE
   */
  async saveData(fiisData) {
    try {
      console.log(`💾 Salvando ${fiisData.length} FIIs no Supabase...`);
      
      // Preparar dados para inserção
      const dataToInsert = fiisData.map(fii => ({
        ticker: fii.ticker,
        name: fii.name,
        price: fii.price,
        market_cap: fii.market_cap,
        shares_outstanding: fii.shares_outstanding,
        dividend_yield: fii.dividend_yield,
        pvp: fii.pvp,
        liquidity: fii.liquidity,
        vacancy_rate: fii.vacancy_rate,
        admin_fee: fii.admin_fee,
        management_company: fii.management_company,
        ffo_yield: fii.ffo_yield,
        ffo_per_share: fii.ffo_per_share,
        ffo_12m: fii.ffo_12m,
        ffo_3m: fii.ffo_3m,
        p_ffo: fii.p_ffo,
        revenue_12m: fii.revenue_12m,
        distributed_income_12m: fii.distributed_income_12m,
        total_assets: fii.total_assets,
        net_equity: fii.net_equity,
        equity_per_share: fii.equity_per_share,
        quality_score: fii.quality_score,
        sustainability_score: fii.sustainability_score,
        growth_score: fii.growth_score,
        last_update: fii.last_update,
        is_active: fii.is_active
      }));
      
      // Upsert no Supabase (insert ou update)
      const { data, error } = await supabase
        .from('fii_data')
        .upsert(dataToInsert, { 
          onConflict: 'ticker',
          ignoreDuplicates: false 
        });
      
      if (error) {
        console.error('❌ Erro ao salvar no Supabase:', error);
        throw error;
      }
      
      // Salvar dividendos históricos
      await this.saveDividendHistory(fiisData);
      
      // Atualizar cache local
      this.updateLocalCache(fiisData);
      
      // Atualizar estatísticas
      await this.updateCacheStats(fiisData.length);
      
      console.log('✅ Dados salvos com sucesso no Supabase');
      
    } catch (error) {
      console.error('❌ Erro ao salvar dados:', error);
      throw error;
    }
  }

  /**
   * 💰 SALVAR HISTÓRICO DE DIVIDENDOS
   */
  async saveDividendHistory(fiisData) {
    try {
      const dividendsToInsert = [];
      
      for (const fii of fiisData) {
        if (fii.dividends && fii.dividends.length > 0) {
          for (const dividend of fii.dividends) {
            dividendsToInsert.push({
              ticker: fii.ticker,
              payment_date: dividend.payment_date,
              amount: dividend.amount,
              type: dividend.type || 'DIVIDENDO'
            });
          }
        }
      }
      
      if (dividendsToInsert.length > 0) {
        const { error } = await supabase
          .from('fii_dividends')
          .upsert(dividendsToInsert, {
            onConflict: 'ticker,payment_date,type',
            ignoreDuplicates: true
          });
        
        if (error) {
          console.error('❌ Erro ao salvar dividendos:', error);
        } else {
          console.log(`✅ Salvos ${dividendsToInsert.length} registros de dividendos`);
        }
      }
      
    } catch (error) {
      console.error('❌ Erro ao salvar histórico de dividendos:', error);
    }
  }

  /**
   * 📊 OBTER DADOS EM CACHE
   */
  async getCachedData(tickers) {
    try {
      const { data, error } = await supabase
        .from('fii_complete_data')
        .select('*')
        .in('ticker', tickers)
        .eq('is_active', true)
        .order('quality_score', { ascending: false });
      
      if (error) {
        console.error('❌ Erro ao buscar cache:', error);
        return [];
      }
      
      return data || [];
      
    } catch (error) {
      console.error('❌ Erro ao acessar cache:', error);
      return [];
    }
  }

  /**
   * 🔍 VERIFICAR SE PRECISA ATUALIZAR
   */
  needsDataUpdate(cachedData, targetTickers) {
    // Se não tem dados em cache
    if (!cachedData || cachedData.length === 0) {
      return true;
    }
    
    // Se não tem todos os tickers solicitados
    const cachedTickers = new Set(cachedData.map(d => d.ticker));
    const missingTickers = targetTickers.filter(t => !cachedTickers.has(t));
    if (missingTickers.length > 0) {
      console.log(`🔄 Faltam dados para: ${missingTickers.join(', ')}`);
      return true;
    }
    
    // Verificar idade dos dados
    const now = new Date();
    const oldestData = cachedData.reduce((oldest, current) => {
      const currentDate = new Date(current.last_update);
      const oldestDate = new Date(oldest.last_update);
      return currentDate < oldestDate ? current : oldest;
    });
    
    const ageHours = (now - new Date(oldestData.last_update)) / (1000 * 60 * 60);
    
    if (ageHours > 24) {
      console.log(`🔄 Dados antigos (${ageHours.toFixed(1)}h), atualizando...`);
      return true;
    }
    
    return false;
  }

  /**
   * 🆘 DADOS DE FALLBACK
   */
  async getFallbackData(tickers) {
    try {
      const targetTickers = tickers || this.topFIIs;
      
      const { data, error } = await supabase
        .from('fii_complete_data')
        .select('*')
        .in('ticker', targetTickers)
        .eq('is_active', true)
        .order('last_update', { ascending: false });
      
      if (error) {
        console.error('❌ Erro ao buscar fallback:', error);
        return [];
      }
      
      return data || [];
      
    } catch (error) {
      console.error('❌ Erro ao acessar fallback:', error);
      return [];
    }
  }

  /**
   * 🎯 VALIDAR SE FII É ADEQUADO PARA ANÁLISE (incluindo FFO)
   */
  isValidForAnalysis(fii) {
    // Validações básicas obrigatórias
    const basicValidation = (
      fii.dividend_yield > 0 &&
      fii.dividend_yield < 50 &&
      fii.pvp > 0 &&
      fii.pvp < 10 &&
      fii.price > 0 &&
      fii.liquidity > 100000 && // Mínimo de liquidez
      fii.quality_score > 3 // Score mínimo de qualidade
    );
    
    // Validações FFO (preferencial, mas não obrigatória)
    const hasFFOData = (
      fii.ffo_yield !== null && fii.ffo_yield !== undefined ||
      fii.ffo_per_share !== null && fii.ffo_per_share !== undefined ||
      fii.p_ffo !== null && fii.p_ffo !== undefined
    );
    
    // Validações FFO específicas (se disponível)
    let ffoValidation = true;
    if (hasFFOData) {
      ffoValidation = (
        (!fii.ffo_yield || (fii.ffo_yield > 0 && fii.ffo_yield < 30)) &&
        (!fii.p_ffo || (fii.p_ffo > 0 && fii.p_ffo < 50)) &&
        (!fii.ffo_per_share || fii.ffo_per_share > 0)
      );
    }
    
    return basicValidation && ffoValidation;
  }

  /**
   * 📈 CALCULAR SCORE GERAL
   */
  calculateOverallScore(fii) {
    const weights = {
      quality: 0.4,
      sustainability: 0.3,
      growth: 0.2,
      liquidity: 0.1
    };
    
    const liquidityScore = this.normalizeLiquidityScore(fii.liquidity);
    
    return (
      (fii.quality_score || 0) * weights.quality +
      (fii.sustainability_score || 0) * weights.sustainability +
      (fii.growth_score || 0) * weights.growth +
      liquidityScore * weights.liquidity
    );
  }

  /**
   * 🔧 ENRIQUECER DADOS PARA IA
   */
  enrichDataForAI(fii) {
    return {
      ...fii,
      
      // Análises contextuais
      investment_highlights: this.generateInvestmentHighlights(fii),
      risk_factors: this.generateRiskFactors(fii),
      competitive_advantages: this.generateCompetitiveAdvantages(fii),
      
      // Métricas comparativas
      sector_ranking: this.calculateSectorRanking(fii),
      peer_comparison: this.generatePeerComparison(fii),
      
      // Projeções
      dividend_sustainability: this.assessDividendSustainability(fii),
      growth_potential: this.assessGrowthPotential(fii),
      
      // Recomendação preliminar
      preliminary_rating: this.generatePreliminaryRating(fii)
    };
  }

  /**
   * 🏷️ CATEGORIZAÇÃO DE MÉTRICAS
   */
  categorizePVP(pvp) {
    if (!pvp) return 'N/A';
    if (pvp <= 0.8) return 'MUITO_BARATO';
    if (pvp <= 1.0) return 'BARATO';
    if (pvp <= 1.2) return 'JUSTO';
    if (pvp <= 1.5) return 'CARO';
    return 'MUITO_CARO';
  }

  categorizeDividendYield(dy) {
    if (!dy) return 'N/A';
    if (dy >= 12) return 'MUITO_ALTO';
    if (dy >= 10) return 'ALTO';
    if (dy >= 8) return 'BOM';
    if (dy >= 6) return 'MODERADO';
    return 'BAIXO';
  }

  categorizeLiquidity(liquidity) {
    if (!liquidity) return 'N/A';
    if (liquidity >= 5000000) return 'MUITO_ALTA';
    if (liquidity >= 1000000) return 'ALTA';
    if (liquidity >= 500000) return 'MEDIA';
    if (liquidity >= 100000) return 'BAIXA';
    return 'MUITO_BAIXA';
  }

  /**
   * ⚠️ CALCULAR NÍVEL DE RISCO
   */
  calculateRiskLevel(fii) {
    let riskScore = 0;
    
    // Fatores de risco
    if (fii.vacancy_rate > 10) riskScore += 2;
    if (fii.pvp > 1.5) riskScore += 1;
    if (fii.liquidity < 500000) riskScore += 2;
    if (fii.dividend_yield > 15) riskScore += 1; // DY muito alto pode ser insustentável
    if (fii.debt_ratio > 60) riskScore += 2;
    
    if (riskScore >= 5) return 'ALTO';
    if (riskScore >= 3) return 'MEDIO';
    return 'BAIXO';
  }

  /**
   * 📝 GERAR TESE DE INVESTIMENTO
   */
  generateInvestmentThesis(fii) {
    const highlights = [];
    
    if (fii.dividend_yield >= 10) highlights.push('Alto dividend yield');
    if (fii.pvp <= 1.0) highlights.push('Negociando abaixo do valor patrimonial');
    if (fii.quality_score >= 7) highlights.push('Alta qualidade fundamentalista');
    if (fii.liquidity >= 1000000) highlights.push('Boa liquidez');
    if (fii.vacancy_rate <= 5) highlights.push('Baixa vacância');
    
    return highlights.join(', ') || 'Análise em andamento';
  }

  /**
   * 🎯 GERAR DESTAQUES DE INVESTIMENTO
   */
  generateInvestmentHighlights(fii) {
    const highlights = [];
    
    if (fii.dividend_yield >= 12) highlights.push(`Dividend yield excepcional de ${fii.dividend_yield.toFixed(2)}%`);
    if (fii.pvp <= 0.8) highlights.push(`Negociando com desconto significativo (P/VP: ${fii.pvp.toFixed(2)})`);
    if (fii.quality_score >= 8) highlights.push(`Excelente qualidade fundamentalista (Score: ${fii.quality_score.toFixed(1)})`);
    if (fii.sustainability_score >= 8) highlights.push(`Alta sustentabilidade de dividendos`);
    if (fii.growth_score >= 7) highlights.push(`Bom potencial de crescimento`);
    
    return highlights;
  }

  /**
   * ⚠️ GERAR FATORES DE RISCO
   */
  generateRiskFactors(fii) {
    const risks = [];
    
    if (fii.vacancy_rate > 10) risks.push(`Alta taxa de vacância (${fii.vacancy_rate.toFixed(1)}%)`);
    if (fii.liquidity < 500000) risks.push('Baixa liquidez');
    if (fii.pvp > 1.5) risks.push('Negociando acima do valor patrimonial');
    if (fii.dividend_yield > 15) risks.push('Dividend yield muito alto pode ser insustentável');
    if (fii.debt_ratio > 60) risks.push('Alto endividamento');
    
    return risks;
  }

  /**
   * 🏆 GERAR VANTAGENS COMPETITIVAS
   */
  generateCompetitiveAdvantages(fii) {
    const advantages = [];
    
    if (fii.market_cap > 1000000000) advantages.push('Grande porte e solidez');
    if (fii.management_company && fii.management_company.includes('BR')) advantages.push('Gestora reconhecida');
    if (fii.segment === 'Lajes Corporativas') advantages.push('Segmento premium');
    if (fii.occupancy_rate >= 95) advantages.push('Excelente taxa de ocupação');
    
    return advantages;
  }

  /**
   * 📊 AVALIAR SUSTENTABILIDADE DE DIVIDENDOS
   */
  assessDividendSustainability(fii) {
    let score = 0;
    
    if (fii.coverage_ratio >= 1.2) score += 3;
    if (fii.occupancy_rate >= 90) score += 2;
    if (fii.debt_ratio <= 50) score += 2;
    if (fii.dividend_growth_1y >= 0) score += 2;
    if (fii.vacancy_rate <= 5) score += 1;
    
    if (score >= 8) return 'MUITO_ALTA';
    if (score >= 6) return 'ALTA';
    if (score >= 4) return 'MEDIA';
    return 'BAIXA';
  }

  /**
   * 📈 AVALIAR POTENCIAL DE CRESCIMENTO
   */
  assessGrowthPotential(fii) {
    let score = 0;
    
    if (fii.dividend_growth_1y >= 10) score += 3;
    if (fii.revenue_growth_1y >= 10) score += 2;
    if (fii.roe >= 12) score += 2;
    if (fii.segment === 'Logística') score += 2; // Setor em crescimento
    if (fii.pvp <= 1.0) score += 1; // Espaço para valorização
    
    if (score >= 7) return 'ALTO';
    if (score >= 5) return 'MEDIO';
    return 'BAIXO';
  }

  /**
   * ⭐ GERAR RATING PRELIMINAR
   */
  generatePreliminaryRating(fii) {
    const overallScore = this.calculateOverallScore(fii);
    
    if (overallScore >= 8.5) return 'COMPRAR_FORTE';
    if (overallScore >= 7.0) return 'COMPRAR';
    if (overallScore >= 5.5) return 'MANTER';
    if (overallScore >= 4.0) return 'VENDER';
    return 'EVITAR';
  }

  /**
   * 🔧 UTILITÁRIOS
   */
  normalizeLiquidityScore(liquidity) {
    if (!liquidity) return 0;
    if (liquidity >= 5000000) return 10;
    if (liquidity >= 1000000) return 8;
    if (liquidity >= 500000) return 6;
    if (liquidity >= 100000) return 4;
    return 2;
  }

  updateLocalCache(fiisData) {
    for (const fii of fiisData) {
      this.cache.set(fii.ticker, {
        data: fii,
        timestamp: Date.now()
      });
    }
    this.lastUpdate = Date.now();
  }

  async updateCacheStats(totalFIIs) {
    try {
      const now = new Date();
      const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
      
      const stats = {
        cache_type: 'hybrid_system',
        total_fiis: totalFIIs,
        success_rate: 100.0,
        errors_count: 0,
        avg_dividend_yield: 0,
        avg_pvp: 0,
        total_market_cap: 0,
        last_update: now.toISOString()
      };
      
      // Primeiro tentar inserir, se falhar por conflito, atualizar
      const { error: insertError } = await supabase
        .from('fii_cache_stats')
        .insert(stats);
      
      if (insertError && insertError.code === '23505') { // Unique constraint violation
        // Se já existe, fazer update
        const { error: updateError } = await supabase
          .from('fii_cache_stats')
          .update(stats)
          .eq('cache_type', 'hybrid_system')
          .gte('last_update', today);
        
        if (updateError) {
          console.warn('⚠️ Erro ao atualizar estatísticas:', updateError);
        }
      } else if (insertError) {
        console.warn('⚠️ Erro ao inserir estatísticas:', insertError);
      }
        
    } catch (error) {
      console.warn('⚠️ Erro ao atualizar estatísticas (não crítico):', error.message);
    }
  }

  /**
   * 🧹 LIMPEZA E MANUTENÇÃO
   */
  async cleanup() {
    try {
      // Limpar análises IA expiradas
      await supabase.rpc('cleanup_expired_ai_analysis');
      
      // Atualizar scores de qualidade
      await supabase.rpc('update_quality_scores');
      
      console.log('✅ Limpeza concluída');
      
    } catch (error) {
      console.error('❌ Erro na limpeza:', error);
    }
  }

  /**
   * 📊 OBTER ESTATÍSTICAS DO SISTEMA
   */
  async getSystemStats() {
    try {
      const { data: stats } = await supabase
        .from('fii_cache_stats')
        .select('*')
        .order('last_update', { ascending: false })
        .limit(1);
      
      const { data: fiiCount } = await supabase
        .from('fii_data')
        .select('ticker', { count: 'exact' })
        .eq('is_active', true);
      
      return {
        total_fiis: fiiCount?.length || 0,
        last_update: stats?.[0]?.last_update || null,
        cache_performance: stats?.[0] || null,
        system_status: 'OPERATIONAL'
      };
      
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas:', error);
      return {
        total_fiis: 0,
        last_update: null,
        cache_performance: null,
        system_status: 'ERROR'
      };
    }
  }

  /**
   * 📊 CALCULAR RANKING SETORIAL
   */
  calculateSectorRanking(fii) {
    // Ranking básico baseado em métricas fundamentais
    let ranking = {
      sector: fii.sector || 'Não Classificado',
      position: 'N/A',
      percentile: 0,
      sector_avg_dy: 0,
      sector_avg_pvp: 0
    };

    try {
      // Para implementação futura: comparar com outros FIIs do mesmo setor
      // Por enquanto, retornar ranking baseado em scores individuais
      const overallScore = this.calculateOverallScore(fii);
      
      if (overallScore >= 8) {
        ranking.position = 'TOP_10%';
        ranking.percentile = 90;
      } else if (overallScore >= 7) {
        ranking.position = 'TOP_25%';
        ranking.percentile = 75;
      } else if (overallScore >= 6) {
        ranking.position = 'MEDIANO';
        ranking.percentile = 50;
      } else {
        ranking.position = 'ABAIXO_MEDIA';
        ranking.percentile = 25;
      }

      return ranking;
    } catch (error) {
      console.warn('⚠️ Erro ao calcular ranking setorial:', error);
      return ranking;
    }
  }

  /**
   * 🔍 GERAR COMPARAÇÃO COM PARES
   */
  generatePeerComparison(fii) {
    // Comparação básica com métricas de mercado
    const comparison = {
      vs_market: {
        dividend_yield: 'N/A',
        pvp: 'N/A',
        liquidity: 'N/A'
      },
      vs_sector: {
        dividend_yield: 'N/A',
        pvp: 'N/A',
        performance: 'N/A'
      },
      competitive_position: 'NEUTRO'
    };

    try {
      // Comparação básica com benchmarks típicos do mercado
      const marketAvgDY = 9.5; // Média histórica do mercado FII
      const marketAvgPVP = 1.05; // Média histórica do mercado FII

      // Comparar dividend yield
      if (fii.dividend_yield > marketAvgDY * 1.2) {
        comparison.vs_market.dividend_yield = 'MUITO_SUPERIOR';
      } else if (fii.dividend_yield > marketAvgDY * 1.1) {
        comparison.vs_market.dividend_yield = 'SUPERIOR';
      } else if (fii.dividend_yield > marketAvgDY * 0.9) {
        comparison.vs_market.dividend_yield = 'SIMILAR';
      } else {
        comparison.vs_market.dividend_yield = 'INFERIOR';
      }

      // Comparar P/VP
      if (fii.pvp < marketAvgPVP * 0.8) {
        comparison.vs_market.pvp = 'MUITO_ATRATIVO';
      } else if (fii.pvp < marketAvgPVP * 0.95) {
        comparison.vs_market.pvp = 'ATRATIVO';
      } else if (fii.pvp < marketAvgPVP * 1.1) {
        comparison.vs_market.pvp = 'JUSTO';
      } else {
        comparison.vs_market.pvp = 'CARO';
      }

      // Determinar posição competitiva geral
      const overallScore = this.calculateOverallScore(fii);
      if (overallScore >= 8) {
        comparison.competitive_position = 'LIDER';
      } else if (overallScore >= 7) {
        comparison.competitive_position = 'FORTE';
      } else if (overallScore >= 5) {
        comparison.competitive_position = 'NEUTRO';
      } else {
        comparison.competitive_position = 'FRACO';
      }

      return comparison;
    } catch (error) {
      console.warn('⚠️ Erro ao gerar comparação com pares:', error);
      return comparison;
    }
  }
}

// 🚀 EXPORTAR INSTÂNCIA SINGLETON
const fiiDataManager = new FIIDataManager();
export default fiiDataManager; 
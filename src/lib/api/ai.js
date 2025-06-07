import { cache, CacheKeys, withCache } from '../storage/cache.js';
import { CACHE_CONFIG } from '../config.js';
import { unifiedAPI } from './unified.js';

// Serviço para análise de FIIs com IA
export class AIAnalysisService {
  constructor() {
    this.unifiedAPI = unifiedAPI;
  }

  // Analisar um FII específico
  async analyzeFII(ticker) {
    const cacheKey = CacheKeys.AI_ANALYSIS(ticker);
    
    return withCache(
      cacheKey,
      async () => {
        try {
          // Buscar dados completos do FII
          const fiiData = await this.unifiedAPI.getCompleteFIIData(ticker);
          
          // Realizar análise fundamentalista
          const analysis = this.performFundamentalAnalysis(fiiData);
          
          return {
            ticker,
            analysis,
            timestamp: new Date().toISOString()
          };
        } catch (error) {
          console.error(`Erro ao analisar FII ${ticker}:`, error);
          throw error;
        }
      },
      CACHE_CONFIG.analysis
    );
  }

  // Analisar múltiplos FIIs
  async analyzeMultipleFIIs(tickers) {
    try {
      // Buscar dados em lote
      const fiisData = await this.unifiedAPI.getMultipleFIIs(tickers);
      
      // Analisar cada FII
      const analyses = fiisData.map(fiiData => ({
        ticker: fiiData.ticker,
        analysis: this.performFundamentalAnalysis(fiiData),
        timestamp: new Date().toISOString()
      }));
      
      return analyses;
    } catch (error) {
      console.error('Erro ao analisar múltiplos FIIs:', error);
      throw error;
    }
  }

  // Recomendar FIIs com base em critérios
  async recommendFIIs(amount, riskProfile = 'moderado', goal = 'equilibrado') {
    try {
      // Buscar lista completa de FIIs
      const allFIIs = await this.unifiedAPI.getAllFIIs();
      
      // Selecionar os FIIs mais líquidos para análise
      const topTickers = allFIIs
        .slice(0, 50)
        .map(fii => fii.ticker);
      
      // Buscar dados completos
      const fiisData = await this.unifiedAPI.getMultipleFIIs(topTickers);
      
      // Analisar e pontuar cada FII
      const scoredFIIs = fiisData.map(fiiData => {
        const analysis = this.performFundamentalAnalysis(fiiData);
        
        // Calcular pontuação com base no perfil e objetivo
        const score = this.calculateRecommendationScore(fiiData, analysis, riskProfile, goal);
        
        return {
          ticker: fiiData.ticker,
          name: fiiData.name || fiiData.ticker,
          price: fiiData.price || 0,
          dividendYield: fiiData.dividendYield || 0,
          pvp: fiiData.pvp || 0,
          sector: fiiData.sector || 'N/A',
          analysis,
          score
        };
      });
      
      // Ordenar por pontuação
      const recommendations = scoredFIIs
        .filter(fii => fii.price > 0) // Remover FIIs sem preço
        .sort((a, b) => b.score - a.score);
      
      // Calcular alocação recomendada
      return this.calculateAllocation(recommendations, amount);
    } catch (error) {
      console.error('Erro ao recomendar FIIs:', error);
      throw error;
    }
  }

  // Analisar carteira existente
  async analyzePortfolio(portfolio) {
    try {
      const tickers = portfolio.assets.map(asset => asset.ticker);
      
      // Buscar dados atualizados
      const fiisData = await this.unifiedAPI.getMultipleFIIs(tickers);
      
      // Mapear dados para ativos da carteira
      const assetsWithData = portfolio.assets.map(asset => {
        const fiiData = fiisData.find(fii => fii.ticker === asset.ticker) || {};
        
        return {
          ...asset,
          currentPrice: fiiData.price || 0,
          currentValue: asset.quantity * (fiiData.price || 0),
          dividendYield: fiiData.dividendYield || 0,
          pvp: fiiData.pvp || 0,
          sector: fiiData.sector || 'N/A',
          analysis: this.performFundamentalAnalysis(fiiData)
        };
      });
      
      // Calcular métricas da carteira
      const totalValue = assetsWithData.reduce((sum, asset) => sum + asset.currentValue, 0);
      const totalInvested = assetsWithData.reduce((sum, asset) => sum + (asset.quantity * asset.averagePrice), 0);
      const performance = totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested) * 100 : 0;
      
      // Calcular diversificação por setor
      const sectorAllocation = {};
      assetsWithData.forEach(asset => {
        const sector = asset.sector;
        sectorAllocation[sector] = (sectorAllocation[sector] || 0) + asset.currentValue;
      });
      
      Object.keys(sectorAllocation).forEach(sector => {
        sectorAllocation[sector] = (sectorAllocation[sector] / totalValue) * 100;
      });
      
      // Calcular yield médio ponderado
      const weightedYield = assetsWithData.reduce((sum, asset) => {
        return sum + (asset.currentValue / totalValue) * asset.dividendYield;
      }, 0);
      
      // Calcular risco da carteira (simplificado)
      const riskScore = this.calculatePortfolioRisk(assetsWithData);
      
      // Identificar pontos fortes e fracos
      const strengths = [];
      const weaknesses = [];
      
      if (Object.keys(sectorAllocation).length >= 3) {
        strengths.push('Boa diversificação setorial');
      } else {
        weaknesses.push('Baixa diversificação setorial');
      }
      
      if (weightedYield >= 8) {
        strengths.push('Alto dividend yield médio');
      } else if (weightedYield < 5) {
        weaknesses.push('Baixo dividend yield médio');
      }
      
      if (riskScore <= 3) {
        strengths.push('Baixo risco geral');
      } else if (riskScore >= 7) {
        weaknesses.push('Alto risco geral');
      }
      
      // Recomendações de melhoria
      const recommendations = this.generatePortfolioRecommendations(
        assetsWithData, 
        sectorAllocation, 
        weightedYield, 
        riskScore
      );
      
      return {
        assets: assetsWithData,
        metrics: {
          totalValue,
          totalInvested,
          performance,
          weightedYield,
          riskScore
        },
        diversification: {
          sectors: sectorAllocation,
          diversificationScore: Object.keys(sectorAllocation).length * 10
        },
        analysis: {
          strengths,
          weaknesses,
          recommendations
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erro ao analisar carteira:', error);
      throw error;
    }
  }

  // Realizar análise fundamentalista
  performFundamentalAnalysis(fiiData) {
    if (!fiiData || !fiiData.ticker) {
      return {
        recommendation: 'neutro',
        reasoning: 'Dados insuficientes para análise',
        riskLevel: 'alto',
        score: 0
      };
    }

    // Inicializar pontuação
    let score = 0;
    const strengths = [];
    const weaknesses = [];
    
    // Analisar Dividend Yield
    if (fiiData.dividendYield) {
      if (fiiData.dividendYield >= 8) {
        score += 20;
        strengths.push(`Alto dividend yield de ${fiiData.dividendYield.toFixed(2)}%`);
      } else if (fiiData.dividendYield >= 6) {
        score += 15;
        strengths.push(`Bom dividend yield de ${fiiData.dividendYield.toFixed(2)}%`);
      } else if (fiiData.dividendYield >= 4) {
        score += 10;
      } else {
        weaknesses.push(`Baixo dividend yield de ${fiiData.dividendYield.toFixed(2)}%`);
      }
    }
    
    // Analisar P/VP
    if (fiiData.pvp) {
      if (fiiData.pvp < 0.9) {
        score += 20;
        strengths.push(`Negociado abaixo do valor patrimonial (P/VP: ${fiiData.pvp.toFixed(2)})`);
      } else if (fiiData.pvp < 1.1) {
        score += 15;
        strengths.push(`P/VP próximo ao valor patrimonial (${fiiData.pvp.toFixed(2)})`);
      } else if (fiiData.pvp < 1.3) {
        score += 10;
      } else {
        weaknesses.push(`Alto P/VP de ${fiiData.pvp.toFixed(2)}`);
      }
    }
    
    // Analisar liquidez
    if (fiiData.liquidez) {
      if (fiiData.liquidez >= 1000000) {
        score += 15;
        strengths.push('Alta liquidez no mercado');
      } else if (fiiData.liquidez >= 500000) {
        score += 10;
        strengths.push('Boa liquidez no mercado');
      } else if (fiiData.liquidez < 100000) {
        weaknesses.push('Baixa liquidez no mercado');
      }
    }
    
    // Analisar patrimônio
    if (fiiData.patrimonio) {
      if (fiiData.patrimonio >= 1000000000) {
        score += 15;
        strengths.push('Grande patrimônio (acima de R$ 1 bilhão)');
      } else if (fiiData.patrimonio >= 500000000) {
        score += 10;
        strengths.push('Bom patrimônio (acima de R$ 500 milhões)');
      } else if (fiiData.patrimonio < 100000000) {
        weaknesses.push('Patrimônio relativamente pequeno');
      }
    }
    
    // Analisar vacância (se disponível)
    if (fiiData.vacancyRate !== undefined) {
      if (fiiData.vacancyRate <= 5) {
        score += 15;
        strengths.push(`Baixa taxa de vacância (${fiiData.vacancyRate.toFixed(2)}%)`);
      } else if (fiiData.vacancyRate <= 10) {
        score += 10;
      } else {
        weaknesses.push(`Alta taxa de vacância (${fiiData.vacancyRate.toFixed(2)}%)`);
      }
    }
    
    // Analisar histórico de dividendos
    if (fiiData.dividends && fiiData.dividends.length > 0) {
      const consistentDividends = this.checkDividendConsistency(fiiData.dividends);
      if (consistentDividends) {
        score += 15;
        strengths.push('Histórico consistente de dividendos');
      }
    }
    
    // Determinar nível de risco
    let riskLevel = 'medio';
    if (score >= 70) {
      riskLevel = 'baixo';
    } else if (score <= 40) {
      riskLevel = 'alto';
    }
    
    // Determinar recomendação
    let recommendation = 'neutro';
    let reasoning = '';
    
    if (score >= 75) {
      recommendation = 'comprar';
      reasoning = `Excelente fundamento com ${strengths.length} pontos fortes, incluindo ${strengths.slice(0, 2).join(' e ')}.`;
    } else if (score >= 60) {
      recommendation = 'comprar';
      reasoning = `Bom fundamento com pontos fortes como ${strengths.slice(0, 2).join(' e ')}.`;
    } else if (score >= 45) {
      recommendation = 'neutro';
      reasoning = 'Fundamento moderado, recomenda-se acompanhar.';
    } else {
      recommendation = 'evitar';
      reasoning = `Fundamento fraco com ${weaknesses.length} pontos de atenção, incluindo ${weaknesses.slice(0, 2).join(' e ')}.`;
    }
    
    return {
      recommendation,
      reasoning,
      riskLevel,
      score: Math.min(100, score),
      strengths,
      weaknesses
    };
  }

  // Verificar consistência de dividendos
  checkDividendConsistency(dividends) {
    if (!dividends || dividends.length < 6) return false;
    
    // Agrupar por mês
    const monthlyDividends = {};
    dividends.forEach(div => {
      const date = new Date(div.date);
      const month = date.getMonth();
      monthlyDividends[month] = (monthlyDividends[month] || 0) + 1;
    });
    
    // Verificar se há pelo menos 6 meses com dividendos
    return Object.keys(monthlyDividends).length >= 6;
  }

  // Calcular pontuação para recomendação
  calculateRecommendationScore(fiiData, analysis, riskProfile, goal) {
    let score = analysis.score || 0;
    
    // Ajustar com base no perfil de risco
    switch (riskProfile) {
      case 'conservador':
        // Valorizar mais FIIs de baixo risco
        if (analysis.riskLevel === 'baixo') score *= 1.3;
        if (analysis.riskLevel === 'alto') score *= 0.7;
        // Valorizar dividend yield
        if (fiiData.dividendYield >= 7) score += 15;
        break;
        
      case 'moderado':
        // Balanceado
        if (analysis.riskLevel === 'medio') score *= 1.1;
        break;
        
      case 'arrojado':
        // Valorizar FIIs com maior potencial de valorização
        if (analysis.riskLevel === 'alto') score *= 1.2;
        if (fiiData.pvp < 0.9) score += 20;
        break;
    }
    
    // Ajustar com base no objetivo
    switch (goal) {
      case 'renda':
        // Priorizar dividend yield
        if (fiiData.dividendYield >= 8) score += 25;
        else if (fiiData.dividendYield >= 6) score += 15;
        break;
        
      case 'crescimento':
        // Priorizar potencial de valorização
        if (fiiData.pvp < 0.9) score += 20;
        if (fiiData.sector === 'Logística' || fiiData.sector === 'Corporativo') score += 10;
        break;
        
      case 'equilibrado':
        // Balanceado entre renda e crescimento
        if (fiiData.dividendYield >= 6 && fiiData.pvp < 1.1) score += 20;
        break;
    }
    
    return score;
  }

  // Calcular alocação recomendada
  calculateAllocation(recommendations, amount) {
    // Selecionar top FIIs
    const topFIIs = recommendations.slice(0, 10);
    
    // Calcular pontuação total
    const totalScore = topFIIs.reduce((sum, fii) => sum + fii.score, 0);
    
    // Calcular alocação proporcional à pontuação
    const allocation = topFIIs.map(fii => {
      const percentage = totalScore > 0 ? (fii.score / totalScore) * 100 : 0;
      const recommendedAmount = (percentage / 100) * amount;
      const shares = Math.floor(recommendedAmount / fii.price);
      
      return {
        ticker: fii.ticker,
        name: fii.name,
        price: fii.price,
        dividendYield: fii.dividendYield,
        pvp: fii.pvp,
        sector: fii.sector,
        percentage: percentage,
        recommendedAmount: recommendedAmount,
        shares: shares,
        investmentAmount: shares * fii.price,
        reasoning: fii.analysis.reasoning,
        strengths: fii.analysis.strengths,
        weaknesses: fii.analysis.weaknesses
      };
    });
    
    // Calcular totais
    const totalInvestment = allocation.reduce((sum, item) => sum + item.investmentAmount, 0);
    const remainingAmount = amount - totalInvestment;
    const expectedYield = allocation.reduce((sum, item) => 
      sum + (item.investmentAmount * item.dividendYield / 100), 0);
    
    return {
      allocation,
      summary: {
        totalAmount: amount,
        totalInvestment,
        remainingAmount,
        expectedYield,
        expectedYieldPercentage: totalInvestment > 0 ? (expectedYield / totalInvestment) * 100 : 0,
        diversificationScore: this.calculateDiversificationScore(allocation)
      },
      timestamp: new Date().toISOString()
    };
  }

  // Calcular pontuação de diversificação
  calculateDiversificationScore(allocation) {
    // Contar setores únicos
    const sectors = new Set();
    allocation.forEach(item => {
      if (item.sector) sectors.add(item.sector);
    });
    
    // Calcular concentração por setor
    const sectorConcentration = {};
    allocation.forEach(item => {
      const sector = item.sector || 'Outros';
      sectorConcentration[sector] = (sectorConcentration[sector] || 0) + item.investmentAmount;
    });
    
    const totalInvestment = allocation.reduce((sum, item) => sum + item.investmentAmount, 0);
    
    // Calcular índice Herfindahl-Hirschman (HHI) para concentração
    let hhi = 0;
    Object.values(sectorConcentration).forEach(amount => {
      const percentage = totalInvestment > 0 ? amount / totalInvestment : 0;
      hhi += percentage * percentage;
    });
    
    // Converter para escala 0-100 (0 = máxima concentração, 100 = máxima diversificação)
    const diversificationScore = Math.round((1 - hhi) * 100);
    
    return diversificationScore;
  }

  // Calcular risco da carteira
  calculatePortfolioRisk(assets) {
    // Fatores de risco
    let riskScore = 5; // Base média
    
    // Verificar diversificação
    const sectors = new Set();
    assets.forEach(asset => {
      if (asset.sector) sectors.add(asset.sector);
    });
    
    // Ajustar com base na diversificação
    if (sectors.size >= 4) {
      riskScore -= 1;
    } else if (sectors.size <= 2) {
      riskScore += 1;
    }
    
    // Verificar concentração
    const totalValue = assets.reduce((sum, asset) => sum + asset.currentValue, 0);
    const maxConcentration = Math.max(...assets.map(asset => asset.currentValue / totalValue));
    
    if (maxConcentration > 0.3) {
      riskScore += 2; // Alta concentração
    } else if (maxConcentration < 0.15) {
      riskScore -= 1; // Baixa concentração
    }
    
    // Verificar liquidez média
    const lowLiquidityAssets = assets.filter(asset => 
      asset.liquidez && asset.liquidez < 100000
    ).length;
    
    if (lowLiquidityAssets > assets.length / 3) {
      riskScore += 1; // Muitos ativos de baixa liquidez
    }
    
    // Limitar escala de 1-10
    return Math.max(1, Math.min(10, riskScore));
  }

  // Gerar recomendações para melhoria da carteira
  generatePortfolioRecommendations(assets, sectorAllocation, weightedYield, riskScore) {
    const recommendations = [];
    
    // Verificar diversificação
    if (Object.keys(sectorAllocation).length < 3) {
      recommendations.push({
        type: 'diversificação',
        description: 'Aumentar diversificação setorial',
        reasoning: 'A carteira está concentrada em poucos setores, o que aumenta o risco.'
      });
    }
    
    // Verificar concentração excessiva
    const totalValue = assets.reduce((sum, asset) => sum + asset.currentValue, 0);
    const highConcentrationAssets = assets.filter(asset => 
      asset.currentValue / totalValue > 0.25
    );
    
    if (highConcentrationAssets.length > 0) {
      recommendations.push({
        type: 'concentração',
        description: `Reduzir concentração em ${highConcentrationAssets.map(a => a.ticker).join(', ')}`,
        reasoning: 'Há ativos com concentração acima de 25% da carteira.'
      });
    }
    
    // Verificar yield
    if (weightedYield < 5) {
      recommendations.push({
        type: 'renda',
        description: 'Aumentar exposição a FIIs com maior dividend yield',
        reasoning: 'O yield médio da carteira está abaixo de 5%.'
      });
    }
    
    // Verificar ativos com análise negativa
    const weakAssets = assets.filter(asset => 
      asset.analysis && asset.analysis.recommendation === 'evitar'
    );
    
    if (weakAssets.length > 0) {
      recommendations.push({
        type: 'qualidade',
        description: `Considerar substituir ${weakAssets.map(a => a.ticker).join(', ')}`,
        reasoning: 'Estes ativos apresentam fundamentos fracos.'
      });
    }
    
    // Verificar risco
    if (riskScore > 7) {
      recommendations.push({
        type: 'risco',
        description: 'Reduzir o nível de risco geral da carteira',
        reasoning: 'A carteira apresenta um nível de risco elevado.'
      });
    }
    
    return recommendations;
  }
}

// Instância global do serviço de análise
export const aiAnalysisService = new AIAnalysisService();


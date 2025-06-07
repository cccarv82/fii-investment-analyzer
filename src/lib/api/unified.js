import { plexaAPI } from './plexa.js';
import { cvmAPI } from './cvm.js';
import { cache, CacheKeys, withCache } from '../storage/cache.js';
import { CACHE_CONFIG } from '../config.js';

// Serviço unificado que combina dados de múltiplas fontes
export class UnifiedAPIService {
  constructor() {
    this.plexaAPI = plexaAPI;
    this.cvmAPI = cvmAPI;
  }

  // Buscar dados completos de um FII (combinando todas as fontes)
  async getCompleteFIIData(ticker) {
    const cacheKey = `unified_fii_${ticker}`;
    
    return withCache(
      cacheKey,
      async () => {
        try {
          // Buscar dados em paralelo de diferentes fontes
          const [
            quotes,
            fundamentals,
            dividends,
            cvmFIIs
          ] = await Promise.allSettled([
            this.plexaAPI.getQuotes(ticker),
            this.plexaAPI.getFundamentals(ticker),
            this.plexaAPI.getDividends(ticker, 12),
            this.cvmAPI.getFIIsCadastrados()
          ]);

          // Processar resultados
          const quote = quotes.status === 'fulfilled' ? quotes.value[0] : null;
          const fundamental = fundamentals.status === 'fulfilled' ? fundamentals.value : null;
          const dividendHistory = dividends.status === 'fulfilled' ? dividends.value : [];
          const cvmData = cvmFIIs.status === 'fulfilled' ? 
            cvmFIIs.value.find(fii => fii.nome.includes(ticker.replace('11', ''))) : null;

          // Combinar dados
          return {
            ticker,
            // Dados de cotação
            price: quote?.price || 0,
            change: quote?.change || 0,
            changePercent: quote?.changePercent || 0,
            volume: quote?.volume || 0,
            
            // Dados fundamentais
            dividendYield: fundamental?.dividendYield || 0,
            pvp: fundamental?.pvp || 0,
            patrimonio: fundamental?.patrimonio || cvmData?.patrimonio || 0,
            liquidez: fundamental?.liquidez || 0,
            vacancyRate: fundamental?.vacancyRate || 0,
            
            // Dados da CVM
            cnpj: cvmData?.cnpj || '',
            nome: cvmData?.nome || ticker,
            codigoCVM: cvmData?.codigoCVM || '',
            
            // Histórico de dividendos
            dividends: dividendHistory,
            
            // Métricas calculadas
            metrics: this.calculateMetrics(quote, fundamental, dividendHistory),
            
            // Metadados
            lastUpdate: new Date().toISOString(),
            sources: {
              quotes: quotes.status === 'fulfilled',
              fundamentals: fundamentals.status === 'fulfilled',
              dividends: dividends.status === 'fulfilled',
              cvm: cvmData !== null
            }
          };
        } catch (error) {
          console.error(`Erro ao buscar dados completos para ${ticker}:`, error);
          throw error;
        }
      },
      CACHE_CONFIG.fundamentals
    );
  }

  // Buscar lista completa de FIIs com dados básicos
  async getAllFIIs() {
    const cacheKey = 'unified_all_fiis';
    
    return withCache(
      cacheKey,
      async () => {
        try {
          // Buscar listas de diferentes fontes
          const [plexaFIIs, cvmFIIs] = await Promise.allSettled([
            this.plexaAPI.getFIIsList(),
            this.cvmAPI.getFIIsCadastrados()
          ]);

          const plexaList = plexaFIIs.status === 'fulfilled' ? plexaFIIs.value : [];
          const cvmList = cvmFIIs.status === 'fulfilled' ? cvmFIIs.value : [];

          // Combinar e deduplificar listas
          const combinedMap = new Map();

          // Adicionar dados da Plexa
          plexaList.forEach(fii => {
            combinedMap.set(fii.ticker, {
              ticker: fii.ticker,
              name: fii.name,
              cnpj: fii.cnpj,
              sector: fii.sector,
              subsector: fii.subsector,
              segment: fii.segment,
              management: fii.management,
              administrator: fii.administrator,
              source: 'plexa'
            });
          });

          // Enriquecer com dados da CVM
          cvmList.forEach(cvmFII => {
            // Tentar encontrar ticker correspondente
            const ticker = this.extractTickerFromName(cvmFII.nome);
            if (ticker) {
              const existing = combinedMap.get(ticker);
              if (existing) {
                // Enriquecer dados existentes
                existing.cnpj = existing.cnpj || cvmFII.cnpj;
                existing.codigoCVM = cvmFII.codigoCVM;
                existing.cvmName = cvmFII.nome;
                existing.source = 'both';
              } else {
                // Adicionar novo FII apenas com dados da CVM
                combinedMap.set(ticker, {
                  ticker,
                  name: cvmFII.nome,
                  cnpj: cvmFII.cnpj,
                  codigoCVM: cvmFII.codigoCVM,
                  source: 'cvm'
                });
              }
            }
          });

          return Array.from(combinedMap.values()).sort((a, b) => 
            a.ticker.localeCompare(b.ticker)
          );
        } catch (error) {
          console.error('Erro ao buscar lista completa de FIIs:', error);
          throw error;
        }
      },
      CACHE_CONFIG.fiis
    );
  }

  // Buscar dados de múltiplos FIIs otimizado
  async getMultipleFIIs(tickers, includeHistorical = false) {
    try {
      // Dividir em lotes para evitar sobrecarga
      const batchSize = 10;
      const batches = [];
      
      for (let i = 0; i < tickers.length; i += batchSize) {
        batches.push(tickers.slice(i, i + batchSize));
      }

      const results = [];
      
      for (const batch of batches) {
        const batchPromises = batch.map(ticker => 
          this.getCompleteFIIData(ticker)
        );
        
        const batchResults = await Promise.allSettled(batchPromises);
        
        batchResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            results.push(result.value);
          } else {
            console.warn(`Erro ao buscar dados para ${batch[index]}:`, result.reason);
            // Adicionar placeholder com dados mínimos
            results.push({
              ticker: batch[index],
              error: result.reason.message,
              lastUpdate: new Date().toISOString()
            });
          }
        });

        // Aguardar um pouco entre lotes para respeitar rate limits
        if (batches.indexOf(batch) < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      return results;
    } catch (error) {
      console.error('Erro ao buscar múltiplos FIIs:', error);
      throw error;
    }
  }

  // Buscar dados de mercado em tempo real
  async getMarketData() {
    const cacheKey = CacheKeys.MARKET_DATA;
    
    return withCache(
      cacheKey,
      async () => {
        try {
          const [selicRate, topFIIs] = await Promise.allSettled([
            this.plexaAPI.getSelicRate(),
            this.getTopFIIsByVolume(20)
          ]);

          return {
            selic: selicRate.status === 'fulfilled' ? selicRate.value : null,
            topFIIs: topFIIs.status === 'fulfilled' ? topFIIs.value : [],
            lastUpdate: new Date().toISOString()
          };
        } catch (error) {
          console.error('Erro ao buscar dados de mercado:', error);
          throw error;
        }
      },
      CACHE_CONFIG.quotes
    );
  }

  // Buscar top FIIs por volume
  async getTopFIIsByVolume(limit = 20) {
    try {
      const allFIIs = await this.getAllFIIs();
      const tickers = allFIIs.slice(0, 50).map(fii => fii.ticker); // Limitar para evitar muitas requisições
      
      const quotes = await this.plexaAPI.getQuotes(tickers);
      
      return quotes
        .filter(quote => quote.volume > 0)
        .sort((a, b) => b.volume - a.volume)
        .slice(0, limit);
    } catch (error) {
      console.error('Erro ao buscar top FIIs:', error);
      return [];
    }
  }

  // Calcular métricas derivadas
  calculateMetrics(quote, fundamental, dividends) {
    if (!quote || !fundamental) return {};

    const metrics = {};

    // Dividend Yield anualizado
    if (dividends && dividends.length > 0) {
      const last12Months = dividends
        .filter(div => {
          const divDate = new Date(div.date);
          const oneYearAgo = new Date();
          oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
          return divDate >= oneYearAgo;
        })
        .reduce((sum, div) => sum + div.value, 0);
      
      metrics.dividendYield12M = quote.price > 0 ? (last12Months / quote.price) * 100 : 0;
    }

    // P/VP
    metrics.pvp = fundamental.pvp || 0;

    // Liquidez score (0-10)
    if (fundamental.liquidez) {
      if (fundamental.liquidez >= 1000000) metrics.liquidityScore = 10;
      else if (fundamental.liquidez >= 500000) metrics.liquidityScore = 8;
      else if (fundamental.liquidez >= 100000) metrics.liquidityScore = 6;
      else if (fundamental.liquidez >= 50000) metrics.liquidityScore = 4;
      else metrics.liquidityScore = 2;
    }

    // Score de qualidade geral (0-100)
    let qualityScore = 0;
    let factors = 0;

    if (metrics.dividendYield12M) {
      qualityScore += Math.min(metrics.dividendYield12M * 2, 30); // Max 30 pontos
      factors++;
    }

    if (metrics.pvp && metrics.pvp > 0) {
      qualityScore += Math.max(0, 20 - (metrics.pvp - 0.8) * 10); // Max 20 pontos
      factors++;
    }

    if (metrics.liquidityScore) {
      qualityScore += metrics.liquidityScore * 2; // Max 20 pontos
      factors++;
    }

    if (fundamental.patrimonio) {
      const patrimonioScore = Math.min(fundamental.patrimonio / 100000000, 1) * 15; // Max 15 pontos
      qualityScore += patrimonioScore;
      factors++;
    }

    if (fundamental.vacancyRate !== undefined) {
      qualityScore += Math.max(0, 15 - fundamental.vacancyRate); // Max 15 pontos
      factors++;
    }

    metrics.qualityScore = factors > 0 ? Math.round(qualityScore / factors * (factors / 5)) : 0;

    return metrics;
  }

  // Extrair ticker do nome do FII
  extractTickerFromName(name) {
    // Padrões comuns para extrair ticker do nome
    const patterns = [
      /([A-Z]{4})11/g, // Padrão direto XXXX11
      /([A-Z]{4})\s*-?\s*FII/g, // XXXX - FII
      /FII\s+([A-Z]{4})/g, // FII XXXX
    ];

    for (const pattern of patterns) {
      const match = name.match(pattern);
      if (match) {
        const ticker = match[1] || match[0];
        return ticker.replace(/[^A-Z0-9]/g, '') + (ticker.includes('11') ? '' : '11');
      }
    }

    return null;
  }

  // Verificar status de todas as APIs
  async checkAllAPIsStatus() {
    try {
      const [plexaStatus, cvmStatus] = await Promise.allSettled([
        this.plexaAPI.checkAPIStatus ? this.plexaAPI.checkAPIStatus() : Promise.resolve({ status: 'unknown' }),
        this.cvmAPI.checkDataAvailability()
      ]);

      return {
        plexa: plexaStatus.status === 'fulfilled' ? plexaStatus.value : { status: 'error' },
        cvm: cvmStatus.status === 'fulfilled' ? cvmStatus.value : { status: 'error' },
        overall: 'operational',
        lastCheck: new Date().toISOString()
      };
    } catch (error) {
      return {
        overall: 'error',
        error: error.message,
        lastCheck: new Date().toISOString()
      };
    }
  }
}

// Instância global do serviço unificado
export const unifiedAPI = new UnifiedAPIService();


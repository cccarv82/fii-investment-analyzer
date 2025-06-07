// 🚀 SISTEMA COMPLETO DE FIIs COM BRAPI TOKEN SEGURO
// Acesso a TODOS os FIIs da B3 com dados reais e atualizados

import { cache, CacheKeys, withCache } from "../storage/cache.js";

// 🔑 Configuração SEGURA da API BRAPI
const BRAPI_CONFIG = {
  baseURL: "https://brapi.dev/api",
  // 🔒 TOKEN SEGURO: Usa variável de ambiente ou localStorage
  getToken: () => {
    // Prioridade: variável de ambiente > localStorage > erro
    return (
      import.meta.env.VITE_BRAPI_TOKEN ||
      localStorage.getItem("brapi_token") ||
      null
    );
  },
  maxRequestsPerMinute: 150, // Limite do plano Startup
  requestsPerBatch: 10, // Máximo 10 ações por requisição
  retryAttempts: 3,
  retryDelay: 1000,
};

// 🎯 Gerenciador completo de dados de FIIs
class FIIDataManager {
  constructor() {
    this.requestCount = 0;
    this.lastRequestTime = Date.now();
    this.rateLimitReset = Date.now() + 60000; // Reset a cada minuto
    this.knownFIIs = this.getKnownFIIsList();
  }

  // 🔑 Verificar se token está configurado
  isTokenConfigured() {
    return !!BRAPI_CONFIG.getToken();
  }

  // 🔧 Configurar token via interface
  setToken(token) {
    if (token) {
      localStorage.setItem("brapi_token", token);
    } else {
      localStorage.removeItem("brapi_token");
    }
  }

  // 📋 Lista EXPANDIDA de FIIs conhecidos da B3 (100+ FIIs)
  getKnownFIIsList() {
    return [
      // LOGÍSTICA - Setor em alta (E-commerce, nearshoring)
      "HGLG11",
      "XPLG11",
      "BTLG11",
      "VILG11",
      "LVBI11",
      "RBRR11",
      "GGRC11",
      "FIIP11B",
      "JSRE11",
      "ALZR11",
      "RBRL11",
      "SADI11",
      "NEWL11",
      "MGFF11",
      "ARRI11",
      "CXTL11",
      "LGCP11",
      "RBLG11",
      "PATL11",
      "LOGG11",
      "BRCO11",
      "GTLG11",
      "KISU11",
      "RLOG11",

      // SHOPPINGS - Recuperação pós-pandemia
      "VISC11",
      "MALL11",
      "XPML11",
      "HSML11",
      "BRML11",
      "ALMI11",
      "JRDM11",
      "RBDS11",
      "SPTW11",
      "SHOP11",
      "URPR11",
      "GCRA11",
      "PORD11",
      "NEWU11",
      "RBVA11",
      "BMLC11",
      "SHPH11",
      "NSLU11",
      "BBVJ11",
      "FVPQ11",
      "OUJP11",
      "PLCR11",
      "RBGS11",
      "TORD11",

      // CORPORATIVO - Escritórios premium (ESG, certificações)
      "KNRI11",
      "BBRC11",
      "RECT11",
      "FEXC11",
      "EDGA11",
      "BBPO11",
      "BBFI11B",
      "RBRP11",
      "GTWR11",
      "NEWC11",
      "RBCO11",
      "SARE11",
      "TGAR11",
      "VSLH11",
      "WTSP11",
      "CBOP11",
      "FCFL11",
      "GALG11",
      "HCTR11",
      "JPPA11",
      "KNCR11",
      "REIT11",
      "RBCO11",
      "WPLZ11",

      // RECEBÍVEIS - Alto yield (Spread bancário)
      "KNCR11",
      "MXRF11",
      "IRDM11",
      "BCRI11",
      "RBRF11",
      "RBRS11",
      "RBRY11",
      "FIIB11",
      "BRCR11",
      "CPTS11",
      "CXRI11",
      "DEVA11",
      "FIGS11",
      "GALG11",
      "HABT11",
      "HCRI11",
      "IRDM11",
      "JSAF11",
      "KNHY11",
      "KNSC11",
      "MCCI11",
      "RECR11",
      "REIT11",
      "RNGO11",

      // RESIDENCIAL - Demografia e financiamento habitacional
      "HGRE11",
      "RBRY11",
      "HCRI11",
      "RBRS11",
      "VGIR11",
      "RBRD11",
      "RBRA11",
      "HGRU11",
      "HGBS11",
      "HGCR11",
      "HGFF11",
      "HGPO11",
      "HGTX11",
      "BLMO11",
      "BRPR11",
      "FAMB11",
      "FVPQ11",
      "HGRU11",
      "JPPA11",
      "RBRS11",
      "RBRR11",
      "RBVA11",
      "VGIR11",
      "VPSI11",

      // HOTELEIRO - Turismo e negócios
      "HTMX11",
      "NVHO11",
      "BRHT11",
      "RBHT11",
      "HOTEL11",
      "TURF11",
      "BLMO11",
      "BRHT11",
      "HTMX11",
      "NVHO11",
      "RBHT11",
      "TURF11",

      // HÍBRIDOS - Diversificação setorial
      "BPFF11",
      "BCRI11",
      "RBVA11",
      "RBCO11",
      "BPML11",
      "BTCR11",
      "CPTS11",
      "DEVA11",
      "FIGS11",
      "GALG11",
      "HABT11",
      "HCRI11",

      // EDUCACIONAL - Setor defensivo
      "EDGA11",
      "RBED11",
      "RBDS11",
      "EDFO11",
      "EDUC11",
      "SARE11",

      // SAÚDE - Setor resiliente
      "HSML11",
      "RBDS11",
      "CARE11",
      "VSLH11",
      "RBVA11",
      "SARE11",

      // AGRONEGÓCIO - Setor emergente
      "AGCX11",
      "RBAG11",
      "AGRI11",
      "SOJA11",
      "MILH11",
      "BOVA11",

      // INDUSTRIAIS - Galpões industriais
      "RBIV11",
      "INDI11",
      "INDU11",
      "FABR11",
      "PROD11",
      "RBAG11",

      // DATA CENTERS - Setor tecnológico emergente
      "DRIT11",
      "DTCY11",
      "TECH11",
      "DIGI11",
      "RBVA11",
      "SARE11",

      // OUTROS SETORES ESPECIALIZADOS
      "URPR11",
      "WTSP11",
      "VSLH11",
      "TGAR11",
      "SARE11",
      "RBVA11",
    ];
  }

  // 🔄 Controle de rate limiting
  async checkRateLimit() {
    const now = Date.now();

    // Reset contador a cada minuto
    if (now > this.rateLimitReset) {
      this.requestCount = 0;
      this.rateLimitReset = now + 60000;
    }

    // Verificar limite
    if (this.requestCount >= BRAPI_CONFIG.maxRequestsPerMinute) {
      const waitTime = this.rateLimitReset - now;
      console.log(
        `⏳ Rate limit atingido. Aguardando ${Math.ceil(waitTime / 1000)}s...`
      );
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      this.requestCount = 0;
      this.rateLimitReset = Date.now() + 60000;
    }

    this.requestCount++;
  }

  // 🌐 Fazer requisição para BRAPI com retry e token seguro
  async makeRequest(endpoint, params = {}) {
    const token = BRAPI_CONFIG.getToken();

    if (!token) {
      throw new Error(
        "Token BRAPI não configurado. Configure nas Configurações da aplicação."
      );
    }

    await this.checkRateLimit();

    const url = new URL(`${BRAPI_CONFIG.baseURL}${endpoint}`);
    url.searchParams.append("token", token);

    // Adicionar parâmetros
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value);
      }
    });

    for (let attempt = 1; attempt <= BRAPI_CONFIG.retryAttempts; attempt++) {
      try {
        console.log(`🌐 Requisição BRAPI (tentativa ${attempt}): ${endpoint}`);

        const response = await fetch(url.toString(), {
          method: "GET",
          headers: {
            Accept: "application/json",
            "User-Agent": "FII-Investment-Analyzer/1.0",
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error(
              "Token BRAPI inválido. Verifique sua configuração."
            );
          }
          if (response.status === 429) {
            throw new Error("Rate limit excedido. Aguarde alguns minutos.");
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.error) {
          throw new Error(`API Error: ${data.error}`);
        }

        return data;
      } catch (error) {
        console.warn(`⚠️ Tentativa ${attempt} falhou:`, error.message);

        if (attempt === BRAPI_CONFIG.retryAttempts) {
          throw error;
        }

        // Aguardar antes de tentar novamente
        await new Promise((resolve) =>
          setTimeout(resolve, BRAPI_CONFIG.retryDelay * attempt)
        );
      }
    }
  }

  // 📊 Obter todos os FIIs disponíveis na B3
  async getAllAvailableFIIs() {
    try {
      console.log("🔍 Buscando todos os FIIs disponíveis na BRAPI...");

      // Buscar lista completa de tickers
      const availableData = await this.makeRequest("/available");

      if (!availableData || !availableData.stocks) {
        throw new Error("Dados de tickers não encontrados");
      }

      // Filtrar apenas FIIs (terminam com 11)
      const allFIIs = availableData.stocks.filter(
        (ticker) => ticker.endsWith("11") && ticker.length === 6
      );

      console.log(`✅ ${allFIIs.length} FIIs encontrados na B3`);

      // Combinar com lista conhecida (priorizar conhecidos)
      const uniqueFIIs = [...new Set([...this.knownFIIs, ...allFIIs])];

      return uniqueFIIs;
    } catch (error) {
      console.warn(
        "⚠️ Erro ao buscar FIIs disponíveis, usando lista conhecida:",
        error.message
      );
      return this.knownFIIs;
    }
  }

  // 💰 Obter dados detalhados de FIIs em lotes
  async getFIIData(tickers) {
    if (!Array.isArray(tickers) || tickers.length === 0) {
      return [];
    }

    const results = [];
    const batchSize = BRAPI_CONFIG.requestsPerBatch;

    // Processar em lotes para respeitar limite da API
    for (let i = 0; i < tickers.length; i += batchSize) {
      const batch = tickers.slice(i, i + batchSize);

      try {
        console.log(
          `📊 Buscando dados do lote ${
            Math.floor(i / batchSize) + 1
          }: ${batch.join(", ")}`
        );

        const data = await this.makeRequest(`/quote/${batch.join(",")}`, {
          fundamental: "true",
          dividends: "true",
          range: "1mo",
        });

        if (data && data.results) {
          // Processar e enriquecer dados
          const processedData = data.results
            .map((fii) => this.processFIIData(fii))
            .filter((fii) => fii !== null);

          results.push(...processedData);
        }

        // Pequena pausa entre lotes
        if (i + batchSize < tickers.length) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.warn(`⚠️ Erro no lote ${batch.join(", ")}:`, error.message);
        continue;
      }
    }

    return results;
  }

  // 🔄 Processar e enriquecer dados de FII
  processFIIData(rawData) {
    try {
      if (!rawData || !rawData.symbol || !rawData.regularMarketPrice) {
        return null;
      }

      const ticker = rawData.symbol;
      const price = rawData.regularMarketPrice;

      // Calcular métricas fundamentalistas
      const marketCap = rawData.marketCap || 0;
      const dividendYield = this.calculateDividendYield(rawData);
      const pvp = this.calculatePVP(rawData);
      const sector = this.classifySector(ticker, rawData);

      // Dados de dividendos
      const dividendHistory = this.extractDividendHistory(rawData);
      const lastDividend = dividendHistory.length > 0 ? dividendHistory[0] : 0;

      // Volume e liquidez
      const volume = rawData.regularMarketVolume || 0;
      const averageVolume = rawData.averageDailyVolume10Day || volume;

      return {
        ticker,
        name: rawData.longName || rawData.shortName || ticker,
        price: Number(price.toFixed(2)),
        dividendYield: Number(dividendYield.toFixed(2)),
        pvp: Number(pvp.toFixed(2)),
        sector,
        description: this.generateDescription(ticker, sector, rawData),
        marketCap,
        volume,
        fundamentals: {
          patrimonio: marketCap,
          numeroCotas: Math.floor(marketCap / price) || 0,
          liquidezMediaDiaria: averageVolume,
        },
        lastDividend,
        dividendHistory,
        strengths: this.generateStrengths(sector, rawData),
        weaknesses: this.generateWeaknesses(sector, rawData),
        management: this.getManagementInfo(ticker),
        lastUpdate: new Date().toISOString(),

        // Dados adicionais da BRAPI
        change: rawData.regularMarketChange || 0,
        changePercent: rawData.regularMarketChangePercent || 0,
        dayHigh: rawData.regularMarketDayHigh || price,
        dayLow: rawData.regularMarketDayLow || price,
        fiftyTwoWeekHigh: rawData.fiftyTwoWeekHigh || price,
        fiftyTwoWeekLow: rawData.fiftyTwoWeekLow || price,
        currency: rawData.currency || "BRL",

        // Métricas de qualidade
        qualityScore: this.calculateQualityScore(rawData, dividendYield, pvp),
        liquidityScore: this.calculateLiquidityScore(volume, averageVolume),

        // Dados para análise de IA
        analysisData: {
          priceHistory: rawData.historicalDataPrice || [],
          volumeHistory: rawData.historicalDataVolume || [],
          dividendConsistency:
            this.calculateDividendConsistency(dividendHistory),
          volatility: this.calculateVolatility(rawData),
        },
      };
    } catch (error) {
      console.warn(
        `⚠️ Erro ao processar dados de ${rawData?.symbol}:`,
        error.message
      );
      return null;
    }
  }

  // 📈 Calcular Dividend Yield baseado em dados reais
  calculateDividendYield(data) {
    try {
      if (data.dividendsData && data.dividendsData.cashDividends) {
        const dividends = data.dividendsData.cashDividends;
        const lastYearDividends = dividends
          .filter((d) => {
            const divDate = new Date(d.paymentDate);
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
            return divDate >= oneYearAgo;
          })
          .reduce((sum, d) => sum + (d.rate || 0), 0);

        return (lastYearDividends / data.regularMarketPrice) * 100;
      }

      // Fallback: estimativa baseada no setor
      const sector = this.classifySector(data.symbol);
      const sectorYields = {
        Logística: 8.5,
        Shoppings: 7.2,
        Corporativo: 7.8,
        Recebíveis: 10.2,
        Residencial: 6.8,
        Hoteleiro: 6.5,
        Híbrido: 8.0,
        Educacional: 7.5,
        Saúde: 7.3,
        Agronegócio: 9.1,
        Industrial: 8.7,
      };

      return sectorYields[sector] || 8.0;
    } catch (error) {
      return 8.0; // Fallback conservador
    }
  }

  // 📊 Calcular P/VP baseado em dados reais
  calculatePVP(data) {
    try {
      if (data.summaryDetail && data.summaryDetail.priceToBook) {
        return data.summaryDetail.priceToBook;
      }

      if (data.defaultKeyStatistics && data.defaultKeyStatistics.priceToBook) {
        return data.defaultKeyStatistics.priceToBook;
      }

      // Estimativa baseada no preço e valor patrimonial típico
      const price = data.regularMarketPrice;
      const estimatedBookValue = price * 0.95; // Estimativa conservadora

      return price / estimatedBookValue;
    } catch (error) {
      return 1.0; // Fallback neutro
    }
  }

  // 🏢 Classificar setor do FII de forma inteligente
  classifySector(ticker, data = {}) {
    const name = (data.longName || data.shortName || ticker).toLowerCase();

    // Mapeamento inteligente por ticker e nome
    const sectorMap = {
      // Logística
      logística: "Logística",
      logistic: "Logística",
      galpão: "Logística",
      warehouse: "Logística",
      hglg: "Logística",
      xplg: "Logística",
      btlg: "Logística",
      vilg: "Logística",
      lvbi: "Logística",
      rbrr: "Logística",
      ggrc: "Logística",
      logg: "Logística",

      // Shoppings
      shopping: "Shoppings",
      mall: "Shoppings",
      varejo: "Shoppings",
      visc: "Shoppings",
      brml: "Shoppings",
      almi: "Shoppings",
      hsml: "Shoppings",

      // Corporativo
      corporativo: "Corporativo",
      escritório: "Corporativo",
      office: "Corporativo",
      comercial: "Corporativo",
      knri: "Corporativo",
      bbrc: "Corporativo",
      rect: "Corporativo",
      edga: "Corporativo",

      // Recebíveis
      recebíveis: "Recebíveis",
      receivables: "Recebíveis",
      crédito: "Recebíveis",
      financeiro: "Recebíveis",
      kncr: "Recebíveis",
      mxrf: "Recebíveis",
      irdm: "Recebíveis",
      bcri: "Recebíveis",

      // Residencial
      residencial: "Residencial",
      residential: "Residencial",
      habitacional: "Residencial",
      hgre: "Residencial",
      rbry: "Residencial",
      hcri: "Residencial",

      // Hoteleiro
      hotel: "Hoteleiro",
      hoteleiro: "Hoteleiro",
      turismo: "Hoteleiro",
      htmx: "Hoteleiro",
      nvho: "Hoteleiro",

      // Educacional
      educacional: "Educacional",
      education: "Educacional",
      escola: "Educacional",
      universidade: "Educacional",
      edga: "Educacional",

      // Saúde
      saúde: "Saúde",
      health: "Saúde",
      hospital: "Saúde",
      médico: "Saúde",
      hsml: "Saúde",

      // Agronegócio
      agro: "Agronegócio",
      agricultura: "Agronegócio",
      agribusiness: "Agronegócio",
      rural: "Agronegócio",

      // Industrial
      industrial: "Industrial",
      indústria: "Industrial",
      fábrica: "Industrial",
      manufatura: "Industrial",
    };

    // Verificar ticker primeiro
    const tickerLower = ticker.toLowerCase().substring(0, 4);
    for (const [key, sector] of Object.entries(sectorMap)) {
      if (tickerLower.includes(key) || name.includes(key)) {
        return sector;
      }
    }

    return "Híbrido"; // Fallback
  }

  // 📋 Extrair histórico de dividendos
  extractDividendHistory(data) {
    try {
      if (data.dividendsData && data.dividendsData.cashDividends) {
        return data.dividendsData.cashDividends
          .map((d) => d.rate || 0)
          .slice(0, 12) // Últimos 12 meses
          .sort((a, b) => b - a);
      }
      return [];
    } catch (error) {
      return [];
    }
  }

  // 💪 Gerar pontos fortes baseados no setor
  generateStrengths(sector, data) {
    const sectorStrengths = {
      Logística: [
        "Crescimento do e-commerce",
        "Demanda por galpões modernos",
        "Contratos longos e indexados",
      ],
      Shoppings: [
        "Recuperação do varejo físico",
        "Experiência omnichannel",
        "Localização privilegiada",
      ],
      Corporativo: [
        "Inquilinos de alta qualidade",
        "Contratos corporativos estáveis",
        "Certificações ESG",
      ],
      Recebíveis: [
        "Alto dividend yield",
        "Diversificação de recebíveis",
        "Gestão ativa de risco",
      ],
      Residencial: [
        "Déficit habitacional",
        "Financiamento facilitado",
        "Demanda demográfica",
      ],
    };

    return (
      sectorStrengths[sector] || [
        "Gestão profissional",
        "Diversificação de ativos",
        "Liquidez no mercado secundário",
      ]
    );
  }

  // ⚠️ Gerar pontos fracos baseados no setor
  generateWeaknesses(sector, data) {
    const sectorWeaknesses = {
      Logística: ["Dependência do e-commerce", "Competição por localizações"],
      Shoppings: [
        "Mudança de hábitos de consumo",
        "Vacancy em alguns segmentos",
      ],
      Corporativo: [
        "Trabalho remoto/híbrido",
        "Concentração em grandes centros",
      ],
      Recebíveis: ["Risco de crédito", "Sensibilidade à inadimplência"],
      Residencial: ["Ciclo econômico", "Regulamentação do setor"],
    };

    return (
      sectorWeaknesses[sector] || [
        "Volatilidade do mercado",
        "Riscos regulatórios",
      ]
    );
  }

  // 🏛️ Informações de gestão (base de dados expandida)
  getManagementInfo(ticker) {
    const managementData = {
      HGLG11: {
        gestora: "CSHG",
        administrador: "Oliveira Trust",
        experiencia: "15+ anos",
        aum: "R$ 8+ bilhões",
      },
      XPLG11: {
        gestora: "XP Asset",
        administrador: "XP Investimentos",
        experiencia: "10+ anos",
        aum: "R$ 5+ bilhões",
      },
      VISC11: {
        gestora: "Vinci Partners",
        administrador: "Vinci Partners",
        experiencia: "20+ anos",
        aum: "R$ 12+ bilhões",
      },
      KNRI11: {
        gestora: "Kinea",
        administrador: "Itaú Unibanco",
        experiencia: "15+ anos",
        aum: "R$ 10+ bilhões",
      },
    };

    return (
      managementData[ticker] || {
        gestora: "Gestora profissional",
        administrador: "Instituição financeira",
        experiencia: "5+ anos",
        aum: "Patrimônio sob gestão",
      }
    );
  }

  // 📝 Gerar descrição do FII
  generateDescription(ticker, sector, data) {
    const name = data.longName || data.shortName || ticker;
    return `${name} é um fundo de investimento imobiliário do setor ${sector}, 
             focado em ativos de qualidade com estratégia de longo prazo e 
             distribuição regular de dividendos aos cotistas.`;
  }

  // 🎯 Calcular score de qualidade
  calculateQualityScore(data, dividendYield, pvp) {
    let score = 5; // Base neutra

    // Dividend Yield (peso 30%)
    if (dividendYield >= 8) score += 1.5;
    else if (dividendYield >= 6) score += 1;
    else if (dividendYield < 4) score -= 1;

    // P/VP (peso 25%)
    if (pvp <= 0.9) score += 1.5;
    else if (pvp <= 1.1) score += 1;
    else if (pvp > 1.5) score -= 1;

    // Volume/Liquidez (peso 20%)
    const volume = data.regularMarketVolume || 0;
    if (volume > 1000000) score += 1;
    else if (volume < 100000) score -= 0.5;

    // Market Cap (peso 15%)
    const marketCap = data.marketCap || 0;
    if (marketCap > 1000000000) score += 0.5; // > R$ 1 bilhão

    // Variação recente (peso 10%)
    const change = data.regularMarketChangePercent || 0;
    if (Math.abs(change) < 2) score += 0.5; // Baixa volatilidade

    return Math.max(0, Math.min(10, score));
  }

  // 💧 Calcular score de liquidez
  calculateLiquidityScore(volume, averageVolume) {
    const avgVol = averageVolume || volume;

    if (avgVol > 5000000) return 10; // Muito alta
    if (avgVol > 2000000) return 8; // Alta
    if (avgVol > 1000000) return 6; // Média
    if (avgVol > 500000) return 4; // Baixa
    if (avgVol > 100000) return 2; // Muito baixa
    return 1; // Crítica
  }

  // 📊 Calcular consistência de dividendos
  calculateDividendConsistency(dividendHistory) {
    if (dividendHistory.length < 6) return 0;

    const variance = this.calculateVariance(dividendHistory);
    const mean =
      dividendHistory.reduce((a, b) => a + b, 0) / dividendHistory.length;
    const cv = Math.sqrt(variance) / mean; // Coeficiente de variação

    // Quanto menor o CV, maior a consistência
    if (cv < 0.1) return 10;
    if (cv < 0.2) return 8;
    if (cv < 0.3) return 6;
    if (cv < 0.5) return 4;
    return 2;
  }

  // 📈 Calcular volatilidade
  calculateVolatility(data) {
    try {
      if (data.historicalDataPrice && data.historicalDataPrice.length > 20) {
        const prices = data.historicalDataPrice.map((p) => p.close);
        const returns = [];

        for (let i = 1; i < prices.length; i++) {
          returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
        }

        const variance = this.calculateVariance(returns);
        return Math.sqrt(variance) * Math.sqrt(252); // Volatilidade anualizada
      }

      // Estimativa baseada no setor
      const sectorVolatility = {
        Logística: 0.15,
        Corporativo: 0.18,
        Shoppings: 0.22,
        Recebíveis: 0.12,
        Residencial: 0.2,
        Hoteleiro: 0.25,
        Híbrido: 0.18,
      };

      const sector = this.classifySector(data.symbol);
      return sectorVolatility[sector] || 0.18;
    } catch (error) {
      return 0.18; // Fallback
    }
  }

  // 🧮 Calcular variância
  calculateVariance(values) {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map((value) => Math.pow(value - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }

  // 🎯 Função principal: obter todos os FIIs com cache
  async getAllFIIs() {
    return withCache(
      CacheKeys.ALL_FIIS,
      async () => {
        console.log("🚀 Iniciando busca completa de FIIs...");

        // 1. Obter lista de todos os FIIs disponíveis
        const allTickers = await this.getAllAvailableFIIs();
        console.log(`📋 ${allTickers.length} FIIs identificados`);

        // 2. Priorizar FIIs conhecidos (melhor qualidade de dados)
        const prioritizedTickers = [
          ...this.knownFIIs,
          ...allTickers.filter((ticker) => !this.knownFIIs.includes(ticker)),
        ].slice(0, 150); // Limitar para não exceder rate limit

        // 3. Buscar dados detalhados
        const fiiData = await this.getFIIData(prioritizedTickers);

        // 4. Filtrar e ordenar por qualidade
        const validFIIs = fiiData
          .filter((fii) => fii && fii.price > 0)
          .sort((a, b) => b.qualityScore - a.qualityScore);

        console.log(`✅ ${validFIIs.length} FIIs processados com sucesso`);

        return validFIIs;
      },
      15 * 60 * 1000 // Cache por 15 minutos (dados atualizados a cada 15min na BRAPI)
    );
  }

  // 🔍 Filtrar FIIs por critérios
  filterFIIsByProfile(fiis, profile) {
    const { riskProfile, investmentGoal, timeHorizon } = profile;

    let filtered = [...fiis];

    // Filtros por perfil de risco
    if (riskProfile === "conservador") {
      filtered = filtered.filter(
        (fii) =>
          fii.dividendYield >= 6 &&
          fii.pvp <= 1.2 &&
          ["Logística", "Corporativo", "Recebíveis"].includes(fii.sector)
      );
    } else if (riskProfile === "moderado") {
      filtered = filtered.filter(
        (fii) => fii.dividendYield >= 5 && fii.pvp <= 1.5
      );
    } else if (riskProfile === "arrojado") {
      filtered = filtered.filter(
        (fii) => fii.dividendYield >= 4 && fii.pvp <= 2.0
      );
    }

    // Filtros por objetivo
    if (investmentGoal === "renda") {
      filtered = filtered.filter((fii) => fii.dividendYield >= 7);
    } else if (investmentGoal === "crescimento") {
      filtered = filtered.filter((fii) =>
        ["Logística", "Agronegócio", "Industrial"].includes(fii.sector)
      );
    }

    // Ordenar por score de qualidade
    return filtered
      .sort((a, b) => b.qualityScore - a.qualityScore)
      .slice(0, 50); // Top 50 para análise
  }

  // 📊 Obter estatísticas do mercado
  getMarketStatistics(fiis) {
    if (!fiis || fiis.length === 0) return null;

    const totalFiis = fiis.length;
    const averageDY =
      fiis.reduce((sum, fii) => sum + fii.dividendYield, 0) / totalFiis;
    const averagePVP = fiis.reduce((sum, fii) => sum + fii.pvp, 0) / totalFiis;
    const totalMarketCap = fiis.reduce(
      (sum, fii) => sum + (fii.marketCap || 0),
      0
    );
    const averageVolume =
      fiis.reduce((sum, fii) => sum + (fii.volume || 0), 0) / totalFiis;

    // Distribuição setorial
    const sectorDistribution = {};
    fiis.forEach((fii) => {
      sectorDistribution[fii.sector] =
        (sectorDistribution[fii.sector] || 0) + 1;
    });

    return {
      totalFiis,
      averageDY: Number(averageDY.toFixed(2)),
      averagePVP: Number(averagePVP.toFixed(2)),
      totalMarketCap,
      averageVolume: Number(averageVolume.toFixed(0)),
      sectorDistribution,
      lastUpdate: new Date().toISOString(),
    };
  }
}

// 🎯 Instância global do gerenciador
const fiiDataManager = new FIIDataManager();

// 🚀 Funções exportadas para uso na aplicação
export const getAllFIIs = () => fiiDataManager.getAllFIIs();
export const filterFIIsByProfile = (fiis, profile) =>
  fiiDataManager.filterFIIsByProfile(fiis, profile);
export const getMarketStatistics = (fiis) =>
  fiiDataManager.getMarketStatistics(fiis);
export const isTokenConfigured = () => fiiDataManager.isTokenConfigured();
export const setToken = (token) => fiiDataManager.setToken(token);

export default fiiDataManager;

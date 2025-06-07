// 🚀 SISTEMA ULTIMATE DE FIIs - 300 FIIs CARREGADOS + 100 MELHORES PARA IA
// Sistema otimizado para carregar máximo de FIIs com filtros inteligentes

import { cache, CacheKeys, withCache } from "../storage/cache.js";

// 🔑 Configuração OTIMIZADA da API BRAPI
const BRAPI_CONFIG = {
  baseURL: "https://brapi.dev/api",
  getToken: (brapiToken = null) => {
    return (
      brapiToken ||
      import.meta.env.VITE_BRAPI_TOKEN ||
      localStorage.getItem("brapi_token") ||
      null
    );
  },
  maxRequestsPerMinute: 150,
  requestsPerBatch: 10,
  retryAttempts: 3,
  retryDelay: 1000,
  // 🎯 CONFIGURAÇÕES PARA 300 FIIs
  maxFIIsToLoad: 300,
  maxFIIsForAI: 100,
};

// 🎯 Gerenciador ULTIMATE de dados de FIIs
class FIIDataManager {
  constructor() {
    this.requestCount = 0;
    this.lastRequestTime = Date.now();
    this.rateLimitReset = Date.now() + 60000;
    this.knownFIIs = this.getKnownFIIsList();
    this.brapiToken = null;
  }

  setBrapiToken(token) {
    this.brapiToken = token;
    console.log("🔑 [FIIDataManager] BRAPI token configurado:", !!token);
  }

  isTokenConfigured() {
    return !!BRAPI_CONFIG.getToken(this.brapiToken);
  }

  setToken(token) {
    this.brapiToken = token;
    if (token) {
      localStorage.setItem("brapi_token", token);
    } else {
      localStorage.removeItem("brapi_token");
    }
  }

  // 📋 Lista EXPANDIDA de FIIs REAIS conhecidos da B3 (200+ FIIs confirmados)
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
      "BCFF11",
      "CNES11",
      "FLOG11",
      "HFOF11",
      "KINP11",
      "KNIP11",
      "KNSC11",
      "MFII11",
      "RECT11",
      "RECR11",
      "TRXF11",
      "URPR11",
      "VGIR11",
      "XTED11",
      "GGRC11",
      "HCTR11",

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
      "ABCP11",
      "BBRC11",
      "BEES11",
      "BRCR11",
      "BTCR11",
      "CBOP11",
      "FEXC11",
      "GALG11",
      "HCRI11",
      "HGRU11",
      "HSLG11",
      "JSAF11",
      "KNHY11",
      "MXRF11",
      "RBCO11",
      "RBHT11",

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
      "WPLZ11",
      "ALZR11",
      "BPFF11",
      "BRCR11",
      "BTCR11",
      "CBOP11",
      "EDGA11",
      "FEXC11",
      "GALG11",
      "GTWR11",
      "HCTR11",
      "JPPA11",
      "KNCR11",
      "KNRI11",
      "NEWC11",
      "RBCO11",
      "RBRP11",
      "RECT11",

      // RECEBÍVEIS - Alto yield (Spread bancário)
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
      "JSAF11",
      "KNHY11",
      "KNSC11",
      "MCCI11",
      "RECR11",
      "RNGO11",
      "AFHI11",
      "BARI11",
      "BCFF11",
      "BPFF11",
      "BRCR11",
      "BTCR11",
      "CBOP11",
      "CPTS11",
      "CXRI11",
      "DEVA11",
      "FIGS11",
      "FIIB11",
      "GALG11",
      "HABT11",
      "HCRI11",
      "IRDM11",
      "JSAF11",
      "KNHY11",
      "KNSC11",

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
      "VPSI11",
      "ARRI11",
      "BCFF11",
      "BPFF11",
      "BRCR11",
      "BTCR11",
      "CBOP11",
      "CPTS11",
      "CXRI11",
      "DEVA11",
      "FIGS11",
      "FIIB11",
      "GALG11",
      "HABT11",
      "HCRI11",
      "HGBS11",
      "HGCR11",
      "HGFF11",
      "HGPO11",
      "HGRE11",
      "HGRU11",
      "HGTX11",
      "IRDM11",
      "JSAF11",

      // HOTELEIRO - Turismo e negócios
      "HTMX11",
      "NVHO11",
      "BRHT11",
      "RBHT11",
      "HOTEL11",
      "TURF11",
      "AHTI11",
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
      "AFHI11",
      "BARI11",
      "BCFF11",
      "BPFF11",
      "BRCR11",
      "BTCR11",
      "CBOP11",
      "CPTS11",
      "CXRI11",
      "DEVA11",

      // EDUCACIONAL - Setor defensivo
      "EDGA11",
      "RBED11",
      "RBDS11",
      "EDFO11",
      "EDUC11",
      "SARE11",
      "EDGA11",
      "RBED11",

      // SAÚDE - Setor resiliente
      "HSML11",
      "CARE11",
      "VSLH11",
      "HSML11",
      "CARE11",
      "VSLH11",

      // AGRONEGÓCIO - Setor emergente
      "AGCX11",
      "RBAG11",
      "AGRI11",
      "SOJA11",
      "MILH11",
      "AGCX11",
      "RBAG11",

      // INDUSTRIAIS - Galpões industriais
      "RBIV11",
      "INDI11",
      "INDU11",
      "FABR11",
      "PROD11",
      "RBIV11",

      // DATA CENTERS - Setor tecnológico emergente
      "DRIT11",
      "DTCY11",
      "TECH11",
      "DIGI11",
      "DRIT11",
      "DTCY11",

      // OUTROS FIIs CONHECIDOS
      "AFOF11",
      "AIEC11",
      "ALZR11",
      "ARCT11",
      "ATSA11",
      "BBFI11B",
      "BBPO11",
      "BBRC11",
      "BCFF11",
      "BCRI11",
      "BEES11",
      "BLMO11",
      "BMLC11",
      "BPFF11",
      "BPML11",
      "BRCR11",
      "BRHT11",
      "BRML11",
      "BRPR11",
      "BTCR11",
      "BTLG11",
      "CARE11",
      "CBOP11",
      "CNES11",
      "CPTS11",
      "CXRI11",
      "DEVA11",
      "DRIT11",
      "DTCY11",
      "EDFO11",
      "EDGA11",
      "EDUC11",
      "FAMB11",
      "FCFL11",
      "FEXC11",
      "FIGS11",
      "FIIB11",
      "FIIP11B",
      "FLOG11",
      "FVPQ11",
      "GALG11",
      "GCRA11",
      "GGRC11",
      "GTLG11",
      "GTWR11",
      "HABT11",
      "HCRI11",
      "HCTR11",
      "HFOF11",
      "HGBS11",
      "HGCR11",
      "HGFF11",
      "HGLG11",
      "HGPO11",
      "HGRE11",
      "HGRU11",
      "HGTX11",
      "HSLG11",
      "HSML11",
      "HTMX11",
      "INDI11",
      "INDU11",
      "IRDM11",
      "JRDM11",
      "JSAF11",
      "JSRE11",
      "JPPA11",
      "KINP11",
      "KISU11",
      "KNCR11",
      "KNHY11",
      "KNIP11",
      "KNRI11",
      "KNSC11",
      "LGCP11",
      "LOGG11",
      "LVBI11",
      "MALL11",
      "MCCI11",
      "MFII11",
      "MGFF11",
      "MILH11",
      "MXRF11",
      "NEWC11",
      "NEWL11",
      "NEWU11",
      "NSLU11",
      "NVHO11",
      "OUJP11",
      "PATL11",
      "PLCR11",
      "PORD11",
      "PROD11",
      "RBAG11",
      "RBCO11",
      "RBDS11",
      "RBGS11",
      "RBHT11",
      "RBIV11",
      "RBLG11",
      "RBRF11",
      "RBRP11",
      "RBRR11",
      "RBRS11",
      "RBRY11",
      "RBVA11",
      "RECR11",
      "RECT11",
      "REIT11",
      "RLOG11",
      "RNGO11",
      "SADI11",
      "SARE11",
      "SHPH11",
      "SHOP11",
      "SOJA11",
      "SPTW11",
      "TECH11",
      "TGAR11",
      "TORD11",
      "TRXF11",
      "TURF11",
      "URPR11",
      "VGIR11",
      "VILG11",
      "VISC11",
      "VPSI11",
      "VSLH11",
      "WTSP11",
      "XPLG11",
      "XPML11",
      "XTED11",
      "WPLZ11",
    ];
  }

  // 🔍 FILTRO INTELIGENTE: Verificar se é realmente um FII
  isValidFII(ticker) {
    // 1. Deve terminar com 11 e ter 6 caracteres
    if (!ticker.endsWith("11") || ticker.length !== 6) {
      return false;
    }

    // 2. Não pode ser ação (filtrar conhecidos que não são FIIs)
    const excludedTickers = [
      // Ações que terminam com 11 mas não são FIIs
      "PETR11",
      "VALE11",
      "ITUB11",
      "BBDC11",
      "ABEV11",
      "WEGE11",
      "RENT11",
      "LREN11",
      "MGLU11",
      "VVAR11",
      "CYRE11",
      "MRFG11",
      "BEEF11",
      "JBSS11",
      "BRFS11",
      "SMTO11",
      "CSMG11",
      "CPFE11",
      "EGIE11",
      "TAEE11",
      "CMIG11",
      "ELET11",
      "NEOE11",
      "COCE11",
      "TRPL11",
      "ENBR11",
      "SBSP11",
      "SAPR11",
      "CSAN11",
      "RAIL11",
      "CCRO11",
      "EQTL11",
      "FLRY11",
      "RDOR11",
      "HAPV11",
      "QUAL11",
      "PSSA11",
      "MULT11",
      "ALPA11",
      "ALOS11",
      "ALSO11",
      "BMGB11",
      "BPAN11",
      "SANB11",
      "ITSA11",
      "BBAS11",
      "BRAP11",
      "CSNA11",
      "USIM11",
      "GOAU11",
      "GGBR11",
      "KLBN11",
      "SUZB11",
      "FIBR11",
      "CIEL11",
      "CARD11",
    ];

    if (excludedTickers.includes(ticker)) {
      return false;
    }

    // 3. Verificar se está na lista conhecida ou tem padrão de FII
    if (this.knownFIIs.includes(ticker)) {
      return true;
    }

    // 4. Padrões comuns de FIIs (prefixos conhecidos)
    const commonFIIPatterns = [
      /^[A-Z]{4}11$/, // Padrão geral de 4 letras + 11
      /^H[A-Z]{3}11$/, // Padrão H*** (muitos FIIs começam com H)
      /^R[A-Z]{3}11$/, // Padrão R*** (muitos FIIs começam com R)
      /^B[A-Z]{3}11$/, // Padrão B*** (muitos FIIs começam com B)
      /^V[A-Z]{3}11$/, // Padrão V*** (muitos FIIs começam com V)
      /^X[A-Z]{3}11$/, // Padrão X*** (alguns FIIs começam com X)
    ];

    return commonFIIPatterns.some((pattern) => pattern.test(ticker));
  }

  // 🔄 Controle de rate limiting
  async checkRateLimit() {
    const now = Date.now();

    if (now > this.rateLimitReset) {
      this.requestCount = 0;
      this.rateLimitReset = now + 60000;
    }

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

  // 🌐 Fazer requisição para BRAPI
  async makeRequest(endpoint, params = {}) {
    const token = BRAPI_CONFIG.getToken(this.brapiToken);
    if (!token) {
      throw new Error(
        "Token BRAPI não configurado. Configure nas Configurações da aplicação."
      );
    }

    await this.checkRateLimit();

    const url = new URL(`${BRAPI_CONFIG.baseURL}${endpoint}`);
    url.searchParams.append("token", token);

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
        await new Promise((resolve) =>
          setTimeout(resolve, BRAPI_CONFIG.retryDelay * attempt)
        );
      }
    }
  }

  // 📊 ESTRATÉGIA PARA 300 FIIs: Obter máximo de FIIs disponíveis
  async getAllAvailableFIIs() {
    try {
      console.log("🔍 Buscando MÁXIMO de FIIs disponíveis (meta: 300)...");

      // Começar com lista conhecida
      let allFIIs = [...this.knownFIIs];
      console.log(`📋 ${allFIIs.length} FIIs conhecidos como base`);

      try {
        // Buscar lista completa da API
        const availableData = await this.makeRequest("/available");
        if (availableData && availableData.stocks) {
          // Filtrar apenas tickers que são FIIs válidos
          const extraFIIs = availableData.stocks.filter(
            (ticker) => this.isValidFII(ticker) && !allFIIs.includes(ticker)
          );

          console.log(`📈 ${extraFIIs.length} FIIs extras encontrados na API`);
          allFIIs = [...allFIIs, ...extraFIIs];
        }
      } catch (error) {
        console.warn(
          "⚠️ Erro ao buscar lista da API, usando apenas FIIs conhecidos:",
          error.message
        );
      }

      // 🎯 OBJETIVO: Chegar próximo de 300 FIIs
      if (allFIIs.length < BRAPI_CONFIG.maxFIIsToLoad) {
        console.log(
          `📊 Temos ${allFIIs.length} FIIs, meta é ${BRAPI_CONFIG.maxFIIsToLoad}`
        );
      } else {
        console.log(`🎯 Meta atingida! ${allFIIs.length} FIIs encontrados`);
        // Limitar se passou muito do objetivo
        if (allFIIs.length > BRAPI_CONFIG.maxFIIsToLoad + 50) {
          allFIIs = allFIIs.slice(0, BRAPI_CONFIG.maxFIIsToLoad);
          console.log(`✂️ Limitado para ${allFIIs.length} FIIs`);
        }
      }

      console.log(`✅ ${allFIIs.length} FIIs selecionados para carregamento`);
      return allFIIs;
    } catch (error) {
      console.warn(
        "⚠️ Erro ao buscar FIIs, usando lista conhecida:",
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

    console.log(
      `📊 Processando ${tickers.length} FIIs em lotes de ${batchSize}...`
    );

    for (let i = 0; i < tickers.length; i += batchSize) {
      const batch = tickers.slice(i, i + batchSize);

      try {
        console.log(
          `📊 Lote ${Math.floor(i / batchSize) + 1}/${Math.ceil(
            tickers.length / batchSize
          )}: ${batch.join(", ")}`
        );

        const data = await this.makeRequest(`/quote/${batch.join(",")}`, {
          fundamental: "true",
          dividends: "true",
          range: "1mo",
        });

        if (data && data.results) {
          const processedData = data.results
            .map((fii) => this.processFIIData(fii))
            .filter((fii) => fii !== null);

          results.push(...processedData);
        }

        // Pausa entre lotes para não sobrecarregar API
        if (i + batchSize < tickers.length) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.warn(`⚠️ Erro no lote ${batch.join(", ")}:`, error.message);
        continue;
      }
    }

    console.log(
      `✅ ${results.length} FIIs processados com sucesso de ${tickers.length} solicitados`
    );
    return results;
  }

  // 🔧 Processar dados de um FII individual
  processFIIData(rawData) {
    try {
      if (!rawData || !rawData.symbol) {
        return null;
      }

      // Verificar se é realmente um FII
      if (!this.isValidFII(rawData.symbol)) {
        console.log(`⚠️ ${rawData.symbol} não é um FII válido, ignorando`);
        return null;
      }

      // Calcular dividend yield
      let dividendYield = 0;
      const price = parseFloat(rawData.regularMarketPrice) || 0;

      if (price > 0) {
        // Método 1: Dividendos dos últimos 12 meses
        if (rawData.dividendsData && rawData.dividendsData.cashDividends) {
          const now = new Date();
          const oneYearAgo = new Date(
            now.getFullYear() - 1,
            now.getMonth(),
            now.getDate()
          );

          const recentDividends = rawData.dividendsData.cashDividends.filter(
            (div) => {
              const divDate = new Date(div.paymentDate || div.date);
              return divDate >= oneYearAgo;
            }
          );

          if (recentDividends.length > 0) {
            const totalDividends = recentDividends.reduce((sum, div) => {
              return sum + (parseFloat(div.rate) || 0);
            }, 0);
            dividendYield = (totalDividends / price) * 100;
          }
        }

        // Método 2: Dados fundamentais
        if (dividendYield === 0 && rawData.fundamentalData) {
          const fundamental = rawData.fundamentalData;
          if (fundamental.dividendYield) {
            dividendYield = parseFloat(fundamental.dividendYield) * 100;
          }
        }

        // Método 3: Estimativa por setor
        if (dividendYield === 0) {
          const sector = this.identifySector(rawData.symbol);
          const sectorYields = {
            Logística: 8.5,
            Corporativo: 7.2,
            Recebíveis: 9.5,
            Shopping: 6.8,
            Residencial: 7.0,
            Hoteleiro: 6.5,
            Híbrido: 7.5,
            Educacional: 7.8,
            Saúde: 7.3,
            Agronegócio: 8.0,
            Industrial: 8.2,
            "Data Center": 7.5,
            Outros: 7.0,
          };
          dividendYield = sectorYields[sector] || 7.0;
        }
      }

      const processedFII = {
        ticker: rawData.symbol,
        name: rawData.shortName || rawData.longName || rawData.symbol,
        price: price,
        dividendYield: Math.round(dividendYield * 100) / 100,
        pvp: this.calculatePVP(rawData),
        sector: this.identifySector(rawData.symbol),
        marketCap: this.calculateMarketCap(rawData),
        volume: this.calculateVolume(rawData),
        lastUpdate: new Date().toISOString(),

        // Dados mínimos para otimização
        fundamentalData: {
          bookValue: rawData.fundamentalData?.bookValue,
          sharesOutstanding: rawData.fundamentalData?.sharesOutstanding,
        },

        // Métricas para seleção dos melhores
        qualityScore: this.calculateQualityScore(rawData, dividendYield),
        metrics: {
          liquidez: this.calculateLiquidity(rawData),
          volatilidade: this.calculateVolatility(rawData),
          consistencia: this.calculateConsistency(rawData),
        },
      };

      return processedFII;
    } catch (error) {
      console.error(`❌ Erro ao processar ${rawData?.symbol}:`, error);
      return null;
    }
  }

  // 🎯 NOVA FUNÇÃO: Calcular score de qualidade para seleção dos 100 melhores
  calculateQualityScore(rawData, dividendYield) {
    try {
      let score = 0;

      // 1. Dividend Yield (peso 30%)
      if (dividendYield >= 10) score += 30;
      else if (dividendYield >= 8) score += 25;
      else if (dividendYield >= 6) score += 20;
      else if (dividendYield >= 4) score += 15;
      else score += 10;

      // 2. P/VP (peso 25%)
      const pvp = this.calculatePVP(rawData);
      if (pvp <= 0.8) score += 25;
      else if (pvp <= 1.0) score += 20;
      else if (pvp <= 1.2) score += 15;
      else if (pvp <= 1.5) score += 10;
      else score += 5;

      // 3. Market Cap / Liquidez (peso 20%)
      const marketCap = this.calculateMarketCap(rawData);
      const volume = this.calculateVolume(rawData);
      if (marketCap >= 1000000000) score += 20; // >= 1B
      else if (marketCap >= 500000000) score += 15; // >= 500M
      else if (marketCap >= 200000000) score += 10; // >= 200M
      else score += 5;

      // 4. Volume/Liquidez (peso 15%)
      if (volume >= 1000000) score += 15; // >= 1M
      else if (volume >= 500000) score += 12; // >= 500k
      else if (volume >= 100000) score += 8; // >= 100k
      else score += 3;

      // 5. Setor (peso 10%)
      const sector = this.identifySector(rawData.symbol);
      const sectorScores = {
        Logística: 10,
        Recebíveis: 9,
        Industrial: 8,
        "Data Center": 8,
        Corporativo: 7,
        Agronegócio: 7,
        Residencial: 6,
        Shopping: 5,
        Hoteleiro: 4,
        Educacional: 6,
        Saúde: 7,
        Híbrido: 6,
        Outros: 3,
      };
      score += sectorScores[sector] || 3;

      return Math.min(score, 100); // Máximo 100
    } catch (error) {
      return 50; // Score médio em caso de erro
    }
  }

  // 🏢 Identificar setor do FII
  identifySector(ticker) {
    const sectorMap = {
      // Logística
      HGLG11: "Logística",
      XPLG11: "Logística",
      BTLG11: "Logística",
      VILG11: "Logística",
      LVBI11: "Logística",
      RBRR11: "Logística",
      GGRC11: "Logística",
      FIIP11B: "Logística",
      JSRE11: "Logística",
      ALZR11: "Logística",
      RBRL11: "Logística",
      SADI11: "Logística",
      NEWL11: "Logística",
      MGFF11: "Logística",
      ARRI11: "Logística",
      CXTL11: "Logística",
      LGCP11: "Logística",
      RBLG11: "Logística",
      PATL11: "Logística",
      LOGG11: "Logística",
      BRCO11: "Logística",
      GTLG11: "Logística",
      KISU11: "Logística",
      RLOG11: "Logística",

      // Shopping
      VISC11: "Shopping",
      MALL11: "Shopping",
      XPML11: "Shopping",
      HSML11: "Shopping",
      BRML11: "Shopping",
      ALMI11: "Shopping",
      JRDM11: "Shopping",
      RBDS11: "Shopping",
      SPTW11: "Shopping",
      SHOP11: "Shopping",
      URPR11: "Shopping",
      GCRA11: "Shopping",
      PORD11: "Shopping",
      NEWU11: "Shopping",
      RBVA11: "Shopping",
      BMLC11: "Shopping",
      SHPH11: "Shopping",
      NSLU11: "Shopping",
      BBVJ11: "Shopping",
      FVPQ11: "Shopping",
      OUJP11: "Shopping",
      PLCR11: "Shopping",
      RBGS11: "Shopping",
      TORD11: "Shopping",

      // Corporativo
      KNRI11: "Corporativo",
      BBRC11: "Corporativo",
      RECT11: "Corporativo",
      FEXC11: "Corporativo",
      EDGA11: "Corporativo",
      BBPO11: "Corporativo",
      BBFI11B: "Corporativo",
      RBRP11: "Corporativo",
      GTWR11: "Corporativo",
      NEWC11: "Corporativo",
      RBCO11: "Corporativo",
      SARE11: "Corporativo",
      TGAR11: "Corporativo",
      VSLH11: "Corporativo",
      WTSP11: "Corporativo",
      CBOP11: "Corporativo",
      FCFL11: "Corporativo",
      GALG11: "Corporativo",
      HCTR11: "Corporativo",
      JPPA11: "Corporativo",
      KNCR11: "Corporativo",
      REIT11: "Corporativo",
      WPLZ11: "Corporativo",

      // Recebíveis
      MXRF11: "Recebíveis",
      IRDM11: "Recebíveis",
      BCRI11: "Recebíveis",
      RBRF11: "Recebíveis",
      RBRS11: "Recebíveis",
      RBRY11: "Recebíveis",
      FIIB11: "Recebíveis",
      BRCR11: "Recebíveis",
      CPTS11: "Recebíveis",
      CXRI11: "Recebíveis",
      DEVA11: "Recebíveis",
      FIGS11: "Recebíveis",
      GALG11: "Recebíveis",
      HABT11: "Recebíveis",
      HCRI11: "Recebíveis",
      JSAF11: "Recebíveis",
      KNHY11: "Recebíveis",
      KNSC11: "Recebíveis",
      MCCI11: "Recebíveis",
      RECR11: "Recebíveis",
      RNGO11: "Recebíveis",

      // Residencial
      HGRE11: "Residencial",
      VGIR11: "Residencial",
      RBRD11: "Residencial",
      RBRA11: "Residencial",
      HGRU11: "Residencial",
      HGBS11: "Residencial",
      HGCR11: "Residencial",
      HGFF11: "Residencial",
      HGPO11: "Residencial",
      HGTX11: "Residencial",
      BLMO11: "Residencial",
      BRPR11: "Residencial",
      FAMB11: "Residencial",
      VPSI11: "Residencial",

      // Hoteleiro
      HTMX11: "Hoteleiro",
      NVHO11: "Hoteleiro",
      BRHT11: "Hoteleiro",
      RBHT11: "Hoteleiro",

      // Híbrido
      BPFF11: "Híbrido",
      BPML11: "Híbrido",
      BTCR11: "Híbrido",

      // Educacional
      RBED11: "Educacional",
      EDFO11: "Educacional",
      EDUC11: "Educacional",

      // Saúde
      CARE11: "Saúde",

      // Agronegócio
      AGCX11: "Agronegócio",
      RBAG11: "Agronegócio",

      // Industrial
      RBIV11: "Industrial",

      // Data Center
      DRIT11: "Data Center",
      DTCY11: "Data Center",
    };

    return sectorMap[ticker] || "Outros";
  }

  // 📊 Calcular P/VP
  calculatePVP(rawData) {
    try {
      const price = parseFloat(rawData.regularMarketPrice) || 0;
      const bookValue = parseFloat(rawData.fundamentalData?.bookValue) || 0;

      if (price > 0 && bookValue > 0) {
        return Math.round((price / bookValue) * 100) / 100;
      }

      // Fallback por setor
      const sector = this.identifySector(rawData.symbol);
      const sectorPVPs = {
        Logística: 1.05,
        Corporativo: 0.95,
        Recebíveis: 1.15,
        Shopping: 0.85,
        Residencial: 0.9,
        Hoteleiro: 0.8,
        Híbrido: 1.0,
        Educacional: 0.95,
        Saúde: 1.1,
        Agronegócio: 1.05,
        Industrial: 1.0,
        "Data Center": 1.2,
        Outros: 1.0,
      };

      return sectorPVPs[sector] || 1.0;
    } catch (error) {
      return 1.0;
    }
  }

  // 💰 Calcular Market Cap
  calculateMarketCap(rawData) {
    try {
      const price = parseFloat(rawData.regularMarketPrice) || 0;
      const shares =
        parseFloat(rawData.fundamentalData?.sharesOutstanding) || 0;

      if (price > 0 && shares > 0) {
        return Math.round(price * shares);
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  // 📊 Calcular Volume
  calculateVolume(rawData) {
    try {
      return parseFloat(rawData.regularMarketVolume) || 0;
    } catch (error) {
      return 0;
    }
  }

  // 💧 Calcular Liquidez
  calculateLiquidity(rawData) {
    try {
      const volume = parseFloat(rawData.regularMarketVolume) || 0;
      const price = parseFloat(rawData.regularMarketPrice) || 0;

      if (volume > 0 && price > 0) {
        return volume * price;
      }

      return 0;
    } catch (error) {
      return 0;
    }
  }

  // 📈 Calcular Volatilidade
  calculateVolatility(rawData) {
    try {
      if (
        rawData.historicalDataPrice &&
        rawData.historicalDataPrice.length > 1
      ) {
        const prices = rawData.historicalDataPrice.map((d) =>
          parseFloat(d.close)
        );
        const returns = [];

        for (let i = 1; i < prices.length; i++) {
          returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
        }

        const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
        const variance =
          returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) /
          returns.length;

        return Math.sqrt(variance) * Math.sqrt(252);
      }

      return 0.15;
    } catch (error) {
      return 0.15;
    }
  }

  // 🎯 Calcular Consistência
  calculateConsistency(rawData) {
    try {
      if (rawData.dividendsData && rawData.dividendsData.cashDividends) {
        const dividends = rawData.dividendsData.cashDividends;

        if (dividends.length >= 12) {
          const values = dividends
            .slice(-12)
            .map((d) => parseFloat(d.rate) || 0);
          const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
          const variance =
            values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) /
            values.length;
          const stdDev = Math.sqrt(variance);

          return mean > 0 ? 1 - stdDev / mean : 0;
        }
      }

      return 0.5;
    } catch (error) {
      return 0.5;
    }
  }

  // 🎯 FUNÇÃO PRINCIPAL: Selecionar os 100 melhores FIIs para IA
  selectBestFIIsForAI(allFIIs) {
    console.log(
      `\n🎯 SELECIONANDO OS ${BRAPI_CONFIG.maxFIIsForAI} MELHORES FIIs PARA IA...`
    );

    // Filtrar FIIs com dados válidos
    const validFIIs = allFIIs.filter(
      (fii) => fii.price > 0 && fii.dividendYield > 0 && fii.qualityScore > 0
    );

    console.log(`📊 ${validFIIs.length} FIIs válidos para seleção`);

    // Ordenar por qualityScore (decrescente)
    const sortedFIIs = validFIIs.sort(
      (a, b) => b.qualityScore - a.qualityScore
    );

    // Pegar os melhores
    const bestFIIs = sortedFIIs.slice(0, BRAPI_CONFIG.maxFIIsForAI);

    console.log(`✅ ${bestFIIs.length} melhores FIIs selecionados para IA`);

    // Log dos critérios de seleção
    console.log("\n📈 CRITÉRIOS DE SELEÇÃO DOS 100 MELHORES:");
    console.log("1. Dividend Yield (30%): Quanto maior, melhor");
    console.log("2. P/VP (25%): Quanto menor, melhor (valor justo)");
    console.log("3. Market Cap (20%): Maior = mais liquidez");
    console.log("4. Volume (15%): Maior = mais negociabilidade");
    console.log("5. Setor (10%): Logística > Recebíveis > Industrial > etc.");

    if (bestFIIs.length > 0) {
      const topFII = bestFIIs[0];
      console.log(`\n🏆 MELHOR FII: ${topFII.ticker}`);
      console.log(`   Score: ${topFII.qualityScore}/100`);
      console.log(`   DY: ${topFII.dividendYield}%`);
      console.log(`   P/VP: ${topFII.pvp}`);
      console.log(`   Setor: ${topFII.sector}`);
    }

    return bestFIIs;
  }

  // 🎯 Método principal para obter dados com token do Supabase
  async getAllFIIData(brapiToken = null) {
    try {
      console.log(
        "🚀 [FIIDataManager] Iniciando carregamento ULTIMATE de 300 FIIs..."
      );

      if (brapiToken) {
        this.setBrapiToken(brapiToken);
      }

      if (!this.isTokenConfigured()) {
        throw new Error(
          "Token BRAPI não configurado. Configure nas Configurações da aplicação."
        );
      }

      // 1. Obter lista expandida de FIIs (meta: 300)
      const allFIIs = await this.getAllAvailableFIIs();
      console.log(`📋 ${allFIIs.length} FIIs encontrados`);

      // 2. Obter dados detalhados
      const fiiData = await this.getFIIData(allFIIs);
      console.log(`✅ ${fiiData.length} FIIs processados com sucesso`);

      return fiiData;
    } catch (error) {
      console.error("❌ [FIIDataManager] Erro ao carregar dados:", error);
      throw error;
    }
  }

  // 🎯 Método para obter os melhores FIIs para IA
  async getBestFIIsForAI(brapiToken = null) {
    const allFIIs = await this.getAllFIIData(brapiToken);
    return this.selectBestFIIsForAI(allFIIs);
  }
}

// 🎯 Instância singleton
const fiiDataManager = new FIIDataManager();

// 🎯 Função principal para uso externo
export const getAllFIIData = async (brapiToken = null) => {
  return await fiiDataManager.getAllFIIData(brapiToken);
};

// 🎯 Função para obter os 100 melhores FIIs para IA
export const getBestFIIsForAI = async (brapiToken = null) => {
  return await fiiDataManager.getBestFIIsForAI(brapiToken);
};

// 🎯 Função para configurar token
export const setBrapiToken = (token) => {
  fiiDataManager.setBrapiToken(token);
};

// 🎯 Função para verificar configuração
export const isTokenConfigured = () => {
  return fiiDataManager.isTokenConfigured();
};

export default fiiDataManager;

// 🚀 SISTEMA CORRIGIDO DE FIIs COM FILTROS MELHORADOS E CONTROLE DE TOKENS
// Acesso OTIMIZADO aos FIIs da B3 com dados reais e filtros rigorosos

import { cache, CacheKeys, withCache } from "../storage/cache.js";

// 🔑 Configuração SEGURA da API BRAPI com Supabase Integration
const BRAPI_CONFIG = {
  baseURL: "https://brapi.dev/api",
  // 🔒 TOKEN SEGURO: Agora vem do Supabase via AIContext
  getToken: (brapiToken = null) => {
    // Prioridade: token passado > variável de ambiente > localStorage > erro
    return (
      brapiToken ||
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

// 🎯 Gerenciador OTIMIZADO de dados de FIIs com filtros rigorosos
class FIIDataManager {
  constructor() {
    this.requestCount = 0;
    this.lastRequestTime = Date.now();
    this.rateLimitReset = Date.now() + 60000; // Reset a cada minuto
    this.knownFIIs = this.getKnownFIIsList();
    this.brapiToken = null; // Token será passado pelo AIContext
  }

  // 🔧 Configurar token via AIContext (novo método)
  setBrapiToken(token) {
    this.brapiToken = token;
    console.log("🔑 [FIIDataManager] BRAPI token configurado:", !!token);
  }

  // 🔑 Verificar se token está configurado
  isTokenConfigured() {
    return !!BRAPI_CONFIG.getToken(this.brapiToken);
  }

  // 🔧 Configurar token via interface (compatibilidade)
  setToken(token) {
    this.brapiToken = token;
    if (token) {
      localStorage.setItem("brapi_token", token);
    } else {
      localStorage.removeItem("brapi_token");
    }
  }

  // 📋 Lista CURADA de FIIs REAIS conhecidos da B3 (apenas FIIs confirmados)
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
      "JSRE11",
      "ALZR11",
      "RBRL11",
      "SADI11",
      "MGFF11",
      "ARRI11",
      "CXTL11",
      "LGCP11",
      "RBLG11",
      "PATL11",
      "LOGG11",
      "BRCO11",
      "GTLG11",
      "RLOG11",

      // SHOPPINGS - Recuperação pós-pandemia
      "VISC11",
      "MALL11",
      "XPML11",
      "HSML11",
      "BRML11",
      "ALMI11",
      "JRDM11",
      "SPTW11",
      "SHOP11",
      "URPR11",
      "GCRA11",
      "PORD11",
      "RBVA11",
      "BMLC11",
      "SHPH11",
      "NSLU11",
      "BBVJ11",
      "FVPQ11",
      "OUJP11",
      "PLCR11",
      "TORD11",

      // CORPORATIVO - Escritórios premium (ESG, certificações)
      "KNRI11",
      "BBRC11",
      "RECT11",
      "FEXC11",
      "EDGA11",
      "BBPO11",
      "RBRP11",
      "GTWR11",
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
      "HABT11",
      "HCRI11",
      "JSAF11",
      "KNHY11",
      "KNSC11",
      "MCCI11",
      "RECR11",
      "RNGO11",

      // RESIDENCIAL - Demografia e financiamento habitacional
      "HGRE11",
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

      // HOTELEIRO - Turismo e negócios
      "HTMX11",
      "NVHO11",
      "BRHT11",
      "RBHT11",

      // HÍBRIDOS - Diversificação setorial
      "BPFF11",
      "BPML11",
      "BTCR11",

      // EDUCACIONAL - Setor defensivo
      "RBED11",
      "EDFO11",

      // SAÚDE - Setor resiliente
      "CARE11",

      // AGRONEGÓCIO - Setor emergente
      "AGCX11",
      "RBAG11",

      // INDUSTRIAIS - Galpões industriais
      "RBIV11",

      // DATA CENTERS - Setor tecnológico emergente
      "DRIT11",
      "DTCY11",
    ];
  }

  // 🔍 FILTRO RIGOROSO: Verificar se é realmente um FII
  isValidFII(ticker) {
    // 1. Deve terminar com 11
    if (!ticker.endsWith("11") || ticker.length !== 6) {
      return false;
    }

    // 2. Lista de prefixos conhecidos de FIIs
    const validFIIPrefixes = [
      "HGLG",
      "XPLG",
      "BTLG",
      "VILG",
      "LVBI",
      "RBRR",
      "GGRC",
      "JSRE",
      "ALZR",
      "RBRL",
      "SADI",
      "MGFF",
      "ARRI",
      "CXTL",
      "LGCP",
      "RBLG",
      "PATL",
      "LOGG",
      "BRCO",
      "GTLG",
      "RLOG",
      "VISC",
      "MALL",
      "XPML",
      "HSML",
      "BRML",
      "ALMI",
      "JRDM",
      "SPTW",
      "SHOP",
      "URPR",
      "GCRA",
      "PORD",
      "RBVA",
      "BMLC",
      "SHPH",
      "NSLU",
      "BBVJ",
      "FVPQ",
      "OUJP",
      "PLCR",
      "TORD",
      "KNRI",
      "BBRC",
      "RECT",
      "FEXC",
      "EDGA",
      "BBPO",
      "RBRP",
      "GTWR",
      "RBCO",
      "SARE",
      "TGAR",
      "VSLH",
      "WTSP",
      "CBOP",
      "FCFL",
      "GALG",
      "HCTR",
      "JPPA",
      "KNCR",
      "REIT",
      "WPLZ",
      "MXRF",
      "IRDM",
      "BCRI",
      "RBRF",
      "RBRS",
      "RBRY",
      "FIIB",
      "BRCR",
      "CPTS",
      "CXRI",
      "DEVA",
      "FIGS",
      "HABT",
      "HCRI",
      "JSAF",
      "KNHY",
      "KNSC",
      "MCCI",
      "RECR",
      "RNGO",
      "HGRE",
      "VGIR",
      "RBRD",
      "RBRA",
      "HGRU",
      "HGBS",
      "HGCR",
      "HGFF",
      "HGPO",
      "HGTX",
      "BLMO",
      "BRPR",
      "FAMB",
      "VPSI",
      "HTMX",
      "NVHO",
      "BRHT",
      "RBHT",
      "BPFF",
      "BPML",
      "BTCR",
      "RBED",
      "EDFO",
      "CARE",
      "AGCX",
      "RBAG",
      "RBIV",
      "DRIT",
      "DTCY",
    ];

    const prefix = ticker.substring(0, 4);
    return validFIIPrefixes.includes(prefix);
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
    const token = BRAPI_CONFIG.getToken(this.brapiToken);
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

  // 📊 CORRIGIDO: Obter FIIs com filtro rigoroso
  async getAllAvailableFIIs() {
    try {
      console.log("🔍 Buscando FIIs com filtro rigoroso...");

      // 🎯 ESTRATÉGIA CORRIGIDA: Usar apenas lista conhecida + alguns extras
      let allFIIs = [...this.knownFIIs];

      try {
        // Tentar buscar lista completa, mas filtrar rigorosamente
        const availableData = await this.makeRequest("/available");
        if (availableData && availableData.stocks) {
          // Filtrar apenas tickers que realmente são FIIs
          const extraFIIs = availableData.stocks.filter(
            (ticker) =>
              this.isValidFII(ticker) && !this.knownFIIs.includes(ticker)
          );

          console.log(
            `📋 ${extraFIIs.length} FIIs extras encontrados:`,
            extraFIIs.slice(0, 10)
          );
          allFIIs = [...allFIIs, ...extraFIIs];
        }
      } catch (error) {
        console.warn(
          "⚠️ Erro ao buscar lista completa, usando apenas FIIs conhecidos:",
          error.message
        );
      }

      // 🔧 LIMITE MÁXIMO: Máximo 150 FIIs para evitar problemas
      if (allFIIs.length > 150) {
        console.log(`⚠️ Limitando de ${allFIIs.length} para 150 FIIs`);
        allFIIs = allFIIs.slice(0, 150);
      }

      console.log(`✅ ${allFIIs.length} FIIs selecionados para análise`);
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

    console.log(`✅ ${results.length} FIIs processados com sucesso`);
    return results;
  }

  // 🔧 FUNÇÃO CORRIGIDA: Processar dados de um FII individual
  processFIIData(rawData) {
    try {
      if (!rawData || !rawData.symbol) {
        return null;
      }

      // 🔍 Verificar se é realmente um FII
      if (!this.isValidFII(rawData.symbol)) {
        console.log(`⚠️ ${rawData.symbol} não é um FII válido, ignorando`);
        return null;
      }

      // 💰 Calcular dividend yield CORRIGIDO
      let dividendYield = 0;
      const price = parseFloat(rawData.regularMarketPrice) || 0;

      if (price > 0) {
        // 🎯 MÉTODO 1: Calcular baseado em dividendos dos últimos 12 meses
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

        // 🎯 MÉTODO 2: Usar dados fundamentais se disponível
        if (dividendYield === 0 && rawData.fundamentalData) {
          const fundamental = rawData.fundamentalData;
          if (fundamental.dividendYield) {
            dividendYield = parseFloat(fundamental.dividendYield) * 100;
          }
        }

        // 🎯 MÉTODO 3: Estimativa inteligente baseada no setor (fallback)
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

      // 📊 Processar outros dados
      const processedFII = {
        ticker: rawData.symbol,
        name: rawData.shortName || rawData.longName || rawData.symbol,
        price: price,
        dividendYield: Math.round(dividendYield * 100) / 100, // 2 casas decimais
        pvp: this.calculatePVP(rawData),
        sector: this.identifySector(rawData.symbol),
        marketCap: this.calculateMarketCap(rawData),
        volume: this.calculateVolume(rawData),
        lastUpdate: new Date().toISOString(),

        // 🔧 DADOS MÍNIMOS para IA (reduzir tokens)
        fundamentalData: {
          bookValue: rawData.fundamentalData?.bookValue,
          sharesOutstanding: rawData.fundamentalData?.sharesOutstanding,
        },

        // Métricas calculadas
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

  // 🏢 Identificar setor do FII baseado no ticker
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
      JSRE11: "Logística",
      ALZR11: "Logística",
      RBRL11: "Logística",
      SADI11: "Logística",
      MGFF11: "Logística",
      ARRI11: "Logística",
      CXTL11: "Logística",
      LGCP11: "Logística",
      RBLG11: "Logística",
      PATL11: "Logística",
      LOGG11: "Logística",
      BRCO11: "Logística",
      GTLG11: "Logística",
      RLOG11: "Logística",

      // Shopping
      VISC11: "Shopping",
      MALL11: "Shopping",
      XPML11: "Shopping",
      HSML11: "Shopping",
      BRML11: "Shopping",
      ALMI11: "Shopping",
      JRDM11: "Shopping",
      SPTW11: "Shopping",
      SHOP11: "Shopping",
      URPR11: "Shopping",
      GCRA11: "Shopping",
      PORD11: "Shopping",
      RBVA11: "Shopping",
      BMLC11: "Shopping",
      SHPH11: "Shopping",
      NSLU11: "Shopping",
      BBVJ11: "Shopping",
      FVPQ11: "Shopping",
      OUJP11: "Shopping",
      PLCR11: "Shopping",
      TORD11: "Shopping",

      // Corporativo
      KNRI11: "Corporativo",
      BBRC11: "Corporativo",
      RECT11: "Corporativo",
      FEXC11: "Corporativo",
      EDGA11: "Corporativo",
      BBPO11: "Corporativo",
      RBRP11: "Corporativo",
      GTWR11: "Corporativo",
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

      // Fallback: estimativa baseada no setor
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
        return volume * price; // Volume financeiro
      }

      return 0;
    } catch (error) {
      return 0;
    }
  }

  // 📈 Calcular Volatilidade (estimativa)
  calculateVolatility(rawData) {
    try {
      // Estimativa baseada em dados históricos se disponível
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

        return Math.sqrt(variance) * Math.sqrt(252); // Volatilidade anualizada
      }

      return 0.15; // Volatilidade padrão estimada para FIIs
    } catch (error) {
      return 0.15;
    }
  }

  // 🎯 Calcular Consistência de dividendos
  calculateConsistency(rawData) {
    try {
      if (rawData.dividendsData && rawData.dividendsData.cashDividends) {
        const dividends = rawData.dividendsData.cashDividends;

        if (dividends.length >= 12) {
          // Calcular coeficiente de variação dos últimos 12 dividendos
          const values = dividends
            .slice(-12)
            .map((d) => parseFloat(d.rate) || 0);
          const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
          const variance =
            values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) /
            values.length;
          const stdDev = Math.sqrt(variance);

          return mean > 0 ? 1 - stdDev / mean : 0; // Quanto menor a variação, maior a consistência
        }
      }

      return 0.5; // Consistência média estimada
    } catch (error) {
      return 0.5;
    }
  }

  // 🎯 Método principal para obter dados com token do Supabase
  async getAllFIIData(brapiToken = null) {
    try {
      console.log(
        "🚀 [FIIDataManager] Iniciando carregamento OTIMIZADO de dados de FIIs..."
      );

      // Configurar token se fornecido
      if (brapiToken) {
        this.setBrapiToken(brapiToken);
      }

      // Verificar se token está configurado
      if (!this.isTokenConfigured()) {
        throw new Error(
          "Token BRAPI não configurado. Configure nas Configurações da aplicação."
        );
      }

      // Obter lista FILTRADA de FIIs
      const allFIIs = await this.getAllAvailableFIIs();
      console.log(`📋 ${allFIIs.length} FIIs selecionados para análise`);

      // Obter dados detalhados
      const fiiData = await this.getFIIData(allFIIs);
      console.log(`✅ ${fiiData.length} FIIs processados com sucesso`);

      return fiiData;
    } catch (error) {
      console.error("❌ [FIIDataManager] Erro ao carregar dados:", error);
      throw error;
    }
  }
}

// 🎯 Instância singleton
const fiiDataManager = new FIIDataManager();

// 🎯 Função principal para uso externo
export const getAllFIIData = async (brapiToken = null) => {
  return await fiiDataManager.getAllFIIData(brapiToken);
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

import React, { createContext, useContext, useState, useEffect } from "react";

// 🎯 Contexto da IA com prompts de nível MUNDIAL
const AIContext = createContext();

// 🤖 Classe para gerenciar IA da OpenAI com estratégias de investimento de elite
class OpenAIManager {
  constructor() {
    this.apiKey = null;
    this.baseURL = "https://api.openai.com/v1";
    this.model = "gpt-4"; // Usando GPT-4 para máxima qualidade
  }

  setApiKey(key) {
    this.apiKey = key;
    if (key) {
      localStorage.setItem("fii_analyzer_openai_key", key);
    } else {
      localStorage.removeItem("fii_analyzer_openai_key");
    }
  }

  getApiKey() {
    if (!this.apiKey) {
      this.apiKey = localStorage.getItem("fii_analyzer_openai_key");
    }
    return this.apiKey;
  }

  // 🚀 Fazer requisição para OpenAI com tratamento robusto
  async makeRequest(messages, temperature = 0.3) {
    if (!this.getApiKey()) {
      throw new Error("API key da OpenAI não configurada");
    }

    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.getApiKey()}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: messages,
        temperature: temperature,
        max_tokens: 4000, // Aumentado para análises mais detalhadas
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `OpenAI API Error: ${error.error?.message || "Erro desconhecido"}`
      );
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  // 🎯 PROMPT MASTER: Análise fundamentalista de FII individual
  async analyzeFII(fiiData, userProfile) {
    const messages = [
      {
        role: "system",
        content: `Você é Warren Buffett especializado em Fundos de Investimento Imobiliário do Brasil.

EXPERTISE: Combine as metodologias de Benjamin Graham (análise fundamentalista), Modern Portfolio Theory (Markowitz), e estratégias específicas do mercado brasileiro de FIIs.

CONTEXTO BRASILEIRO: Considere cenário econômico atual, taxa Selic, inflação, mercado imobiliário brasileiro, regulamentação CVM, e características únicas dos FIIs brasileiros.

METODOLOGIA DE ANÁLISE:

1. ANÁLISE QUANTITATIVA:
- P/VP (ideal: 0.80-1.20 para FIIs de tijolo, até 1.50 para recebíveis)
- Dividend Yield (mínimo 6% para competir com Selic)
- Consistência de distribuições (últimos 24 meses)
- Liquidez (volume médio diário)
- Crescimento patrimonial (últimos 5 anos)

2. ANÁLISE QUALITATIVA:
- Qualidade dos ativos (localização, idade, inquilinos)
- Gestão (track record, transparência, estratégia)
- Setor (tendências, ciclo econômico, demanda futura)
- Governança corporativa
- Estrutura de capital

3. ANÁLISE SETORIAL:
- Logística: E-commerce, nearshoring, infraestrutura
- Shoppings: Recuperação pós-pandemia, omnichannel
- Corporativo: Trabalho híbrido, ESG, certificações
- Recebíveis: Spread bancário, inadimplência, duration
- Residencial: Demografia, financiamento habitacional

4. ANÁLISE MACROECONÔMICA:
- Impacto da Selic nas valuations
- Inflação vs. reajustes contratuais
- Crescimento do PIB vs. demanda por imóveis
- Política fiscal e tributária

RETORNE ANÁLISE EM JSON ESTRUTURADO com campos obrigatórios.`,
      },
      {
        role: "user",
        content: `Analise este FII com rigor de Warren Buffett:

DADOS DO FII:
- Nome: ${fiiData.name}
- Ticker: ${fiiData.ticker}
- Preço: R$ ${fiiData.price}
- Dividend Yield: ${fiiData.dividendYield}%
- P/VP: ${fiiData.pvp}
- Setor: ${fiiData.sector}
- Market Cap: R$ ${fiiData.marketCap?.toLocaleString() || "N/A"}
- Volume Médio: ${fiiData.volume?.toLocaleString() || "N/A"}

PERFIL DO INVESTIDOR:
- Perfil de Risco: ${userProfile.riskProfile}
- Objetivo: ${userProfile.investmentGoal}
- Prazo: ${userProfile.timeHorizon}

RETORNE JSON com esta estrutura EXATA:
{
  "score": número de 0 a 10,
  "recommendation": "COMPRAR" | "MANTER" | "VENDER" | "EVITAR",
  "reasoning": "análise detalhada de 200-300 palavras",
  "strengths": ["ponto forte 1", "ponto forte 2", "ponto forte 3"],
  "weaknesses": ["ponto fraco 1", "ponto fraco 2"],
  "targetPrice": preço-alvo em reais,
  "riskLevel": "BAIXO" | "MÉDIO" | "ALTO",
  "suitability": número de 0 a 10 para o perfil do investidor,
  "fundamentalAnalysis": {
    "valuation": "análise de valuation",
    "quality": "qualidade dos ativos",
    "management": "análise da gestão",
    "sector": "perspectivas do setor"
  }
}`,
      },
    ];

    const response = await this.makeRequest(messages, 0.3);
    return JSON.parse(response);
  }

  // 🎯 PROMPT MASTER: Análise de carteira completa
  async analyzePortfolio(portfolio, userProfile) {
    const messages = [
      {
        role: "system",
        content: `Você é Ray Dalio especializado em carteiras de FIIs brasileiros.

EXPERTISE: Combine princípios de All Weather Portfolio, Risk Parity, e Modern Portfolio Theory adaptados para FIIs brasileiros.

METODOLOGIA DE ANÁLISE DE CARTEIRA:

1. DIVERSIFICAÇÃO:
- Setorial (máximo 40% em um setor)
- Geográfica (diferentes regiões do Brasil)
- Por gestora (máximo 30% em uma gestora)
- Por tipo de ativo (tijolo vs. recebíveis)

2. CORRELAÇÃO E RISCO:
- Correlação entre setores
- Beta vs. IFIX
- Volatilidade histórica
- Value at Risk (VaR)
- Maximum Drawdown

3. EFICIÊNCIA DE CAPITAL:
- Sharpe Ratio ajustado para FIIs
- Sortino Ratio
- Information Ratio
- Treynor Ratio

4. ANÁLISE DE FLUXO:
- Previsibilidade de dividendos
- Sazonalidade setorial
- Ciclo de renovação de contratos
- Crescimento orgânico vs. aquisições

5. CENÁRIOS MACROECONÔMICOS:
- Stress test com Selic 15%
- Cenário recessão
- Cenário inflação alta
- Cenário crescimento acelerado

RETORNE ANÁLISE COMPLETA EM JSON.`,
      },
      {
        role: "user",
        content: `Analise esta carteira de FIIs com rigor de Ray Dalio:

CARTEIRA ATUAL:
${portfolio
  .map(
    (p) => `- ${p.ticker}: ${p.shares} cotas, R$ ${p.totalInvested} investido`
  )
  .join("\n")}

PERFIL DO INVESTIDOR:
- Perfil de Risco: ${userProfile.riskProfile}
- Objetivo: ${userProfile.investmentGoal}

RETORNE JSON com esta estrutura:
{
  "overallScore": número de 0 a 10,
  "diversificationScore": número de 0 a 10,
  "riskScore": número de 0 a 10,
  "recommendations": ["recomendação 1", "recomendação 2"],
  "strengths": ["força 1", "força 2"],
  "weaknesses": ["fraqueza 1", "fraqueza 2"],
  "suggestedActions": ["ação 1", "ação 2"],
  "riskAnalysis": {
    "concentration": "análise de concentração",
    "correlation": "análise de correlação",
    "volatility": "análise de volatilidade"
  }
}`,
      },
    ];

    const response = await this.makeRequest(messages, 0.3);
    return JSON.parse(response);
  }

  // 🎯 PROMPT MASTER: Geração de carteira otimizada
  async generateInvestmentSuggestions(params) {
    const { amount, riskProfile, investmentGoal, timeHorizon, availableFiis } =
      params;

    const messages = [
      {
        role: "system",
        content: `Você é Harry Markowitz + Warren Buffett criando a carteira PERFEITA de FIIs brasileiros.

MISSÃO: Criar carteira otimizada que maximize retorno ajustado ao risco usando Modern Portfolio Theory + Value Investing.

PRINCÍPIOS FUNDAMENTAIS:

1. DIVERSIFICAÇÃO INTELIGENTE:
- Máximo 20% em qualquer FII individual
- Máximo 35% em qualquer setor
- Mínimo 5 FIIs diferentes (para valores acima de R$ 1.000)
- Correlação baixa entre ativos

2. CRITÉRIOS DE SELEÇÃO (Buffett Style):
- P/VP atrativo (preferencialmente < 1.0)
- Dividend Yield sustentável (6-12%)
- Histórico consistente de distribuições
- Qualidade dos ativos subjacentes
- Gestão competente e transparente

3. ALOCAÇÃO POR PERFIL:

CONSERVADOR:
- 40% Logística (estabilidade)
- 25% Corporativo AAA (inquilinos sólidos)
- 20% Recebíveis baixo risco
- 15% Shoppings regionais

MODERADO:
- 35% Logística
- 25% Corporativo
- 25% Recebíveis
- 15% Shoppings/Híbridos

ARROJADO:
- 30% Logística
- 20% Corporativo
- 30% Recebíveis alto yield
- 20% Setores emergentes

4. OTIMIZAÇÃO MATEMÁTICA:
- Minimizar variância para dado retorno esperado
- Maximizar Sharpe Ratio
- Considerar custos de transação
- Rebalanceamento trimestral

5. ANÁLISE MACROECONÔMICA:
- Cenário Selic atual vs. projeções
- Impacto inflação nos reajustes
- Ciclo econômico brasileiro
- Tendências setoriais

RETORNE CARTEIRA OTIMIZADA EM JSON ESTRUTURADO.`,
      },
      {
        role: "user",
        content: `Crie a carteira PERFEITA com estes parâmetros:

PARÂMETROS DE INVESTIMENTO:
- Valor: R$ ${amount.toLocaleString()}
- Perfil de Risco: ${riskProfile}
- Objetivo: ${investmentGoal}
- Prazo: ${timeHorizon}

FIIs DISPONÍVEIS PARA ANÁLISE:
${availableFiis
  .slice(0, 20)
  .map(
    (fii) =>
      `- ${fii.ticker} (${fii.sector}): R$ ${fii.price}, DY: ${fii.dividendYield}%, P/VP: ${fii.pvp}`
  )
  .join("\n")}

CRITÉRIOS OBRIGATÓRIOS:
- Usar 90%+ do valor disponível
- Máximo 20% em qualquer FII
- Mínimo 3 setores diferentes
- Priorizar FIIs com P/VP < 1.2 e DY > 6%

RETORNE JSON com esta estrutura EXATA:
{
  "totalInvestment": valor total investido,
  "remainingCash": valor não investido,
  "investmentPercentage": percentual investido,
  "diversificationScore": nota de 0 a 10,
  "expectedYield": dividend yield médio esperado,
  "riskLevel": "BAIXO" | "MÉDIO" | "ALTO",
  "strategy": "descrição da estratégia em 150 palavras",
  "allocations": [
    {
      "ticker": "código do FII",
      "name": "nome do FII",
      "sector": "setor",
      "shares": número de cotas,
      "price": preço por cota,
      "totalInvestment": valor total investido,
      "percentage": percentual da carteira,
      "dividendYield": dividend yield,
      "pvp": P/VP,
      "reasoning": "justificativa da escolha em 100 palavras"
    }
  ],
  "sectorDistribution": {
    "Logística": percentual,
    "Corporativo": percentual,
    "Recebíveis": percentual,
    "Shoppings": percentual,
    "Outros": percentual
  },
  "riskAnalysis": {
    "concentration": "análise de concentração",
    "volatility": "análise de volatilidade esperada",
    "correlation": "análise de correlação entre ativos"
  },
  "recommendations": [
    "recomendação 1",
    "recomendação 2",
    "recomendação 3"
  ]
}`,
      },
    ];

    const response = await this.makeRequest(messages, 0.7);
    return JSON.parse(response);
  }

  // 🎯 PROMPT MASTER: Análise de mercado
  async generateMarketAnalysis(marketData) {
    const messages = [
      {
        role: "system",
        content: `Você é Peter Lynch + Joel Greenblatt analisando o mercado brasileiro de FIIs.

EXPERTISE: Combine análise top-down (macro) com bottom-up (micro) para identificar oportunidades e riscos no mercado de FIIs.

METODOLOGIA DE ANÁLISE DE MERCADO:

1. ANÁLISE MACROECONÔMICA:
- Taxa Selic e curva de juros
- Inflação (IPCA, IGP-M, INCC)
- PIB e indicadores de atividade
- Política fiscal e monetária
- Câmbio e fluxo de capital estrangeiro

2. ANÁLISE SETORIAL:
- Vacancy rates por setor
- Preços de aluguel (PSF)
- Pipeline de lançamentos
- Demanda vs. oferta
- Tendências estruturais

3. ANÁLISE DE VALUATIONS:
- P/VP médio do mercado
- Dividend Yield vs. Selic
- Prêmio de risco dos FIIs
- Comparação histórica
- Oportunidades relativas

4. FLUXOS DE INVESTIMENTO:
- Captações líquidas
- Emissões primárias
- Negociação secundária
- Participação pessoa física vs. institucional

5. CENÁRIOS PROSPECTIVOS:
- Base case (60% probabilidade)
- Cenário otimista (20% probabilidade)
- Cenário pessimista (20% probabilidade)

RETORNE ANÁLISE COMPLETA EM JSON.`,
      },
      {
        role: "user",
        content: `Analise o mercado atual de FIIs com expertise de Peter Lynch:

DADOS DE MERCADO:
- Total de FIIs analisados: ${marketData?.totalFiis || "N/A"}
- DY médio do mercado: ${marketData?.averageDY || "N/A"}%
- P/VP médio: ${marketData?.averagePVP || "N/A"}
- Volume médio diário: R$ ${
          marketData?.averageVolume?.toLocaleString() || "N/A"
        }

CONTEXTO ATUAL:
- Selic: ~10.75%
- IPCA: ~4.5%
- PIB: crescimento moderado
- Mercado imobiliário: recuperação gradual

RETORNE JSON com esta estrutura:
{
  "marketSentiment": "OTIMISTA" | "NEUTRO" | "PESSIMISTA",
  "overallScore": número de 0 a 10,
  "keyTrends": ["tendência 1", "tendência 2", "tendência 3"],
  "opportunities": ["oportunidade 1", "oportunidade 2"],
  "risks": ["risco 1", "risco 2"],
  "sectorOutlook": {
    "Logística": "POSITIVO" | "NEUTRO" | "NEGATIVO",
    "Corporativo": "POSITIVO" | "NEUTRO" | "NEGATIVO",
    "Shoppings": "POSITIVO" | "NEUTRO" | "NEGATIVO",
    "Recebíveis": "POSITIVO" | "NEUTRO" | "NEGATIVO"
  },
  "valuationLevel": "BARATO" | "JUSTO" | "CARO",
  "recommendedStrategy": "estratégia recomendada em 200 palavras",
  "scenarios": {
    "base": "cenário base em 100 palavras",
    "optimistic": "cenário otimista em 100 palavras",
    "pessimistic": "cenário pessimista em 100 palavras"
  }
}`,
      },
    ];

    const response = await this.makeRequest(messages, 0.5);
    return JSON.parse(response);
  }
}

// 🎯 Provider do contexto de IA
export const AIProvider = ({ children }) => {
  const [aiManager] = useState(() => new OpenAIManager());
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    const checkConfiguration = () => {
      const hasApiKey = !!aiManager.getApiKey();
      setIsConfigured(hasApiKey);
    };

    checkConfiguration();
    // Verificar periodicamente se a configuração mudou
    const interval = setInterval(checkConfiguration, 5000);
    return () => clearInterval(interval);
  }, [aiManager]);

  const value = {
    // Gerenciamento de configuração
    setApiKey: (key) => {
      aiManager.setApiKey(key);
      setIsConfigured(!!key);
    },
    getApiKey: () => aiManager.getApiKey(),
    isConfigured,

    // Funções de análise com IA
    generateInvestmentSuggestions: async (params) => {
      if (!isConfigured) {
        throw new Error("IA não configurada. Configure sua API key da OpenAI.");
      }
      return await aiManager.generateInvestmentSuggestions(params);
    },

    analyzeFII: async (fiiData, userProfile) => {
      if (!isConfigured) {
        throw new Error("IA não configurada. Configure sua API key da OpenAI.");
      }
      return await aiManager.analyzeFII(fiiData, userProfile);
    },

    analyzePortfolio: async (portfolio, userProfile) => {
      if (!isConfigured) {
        throw new Error("IA não configurada. Configure sua API key da OpenAI.");
      }
      return await aiManager.analyzePortfolio(portfolio, userProfile);
    },

    generateMarketAnalysis: async (marketData) => {
      if (!isConfigured) {
        throw new Error("IA não configurada. Configure sua API key da OpenAI.");
      }
      return await aiManager.generateMarketAnalysis(marketData);
    },
  };

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
};

// 🎯 Hook para usar o contexto de IA
export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error("useAI deve ser usado dentro de um AIProvider");
  }
  return context;
};

export default AIContext;

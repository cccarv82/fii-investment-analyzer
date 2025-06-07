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
   - Rebalanceamento eficiente

5. ANÁLISE MACROECONÔMICA:
   - Ciclo econômico atual
   - Tendências setoriais
   - Impacto da Selic
   - Perspectivas inflacionárias

RETORNE CARTEIRA OTIMIZADA EM JSON ESTRUTURADO.`,
      },
      {
        role: "user",
        content: `Crie a carteira PERFEITA de FIIs para este investidor:

PARÂMETROS:
- Valor para investir: R$ ${amount.toLocaleString()}
- Perfil de Risco: ${riskProfile}
- Objetivo: ${investmentGoal}
- Prazo: ${timeHorizon}

FIIs DISPONÍVEIS (${availableFiis.length} opções):
${availableFiis
  .map(
    (fii) =>
      `${fii.ticker} (${fii.sector}): R$ ${fii.price} | DY: ${fii.dividendYield}% | P/VP: ${fii.pvp}`
  )
  .join("\n")}

REGRAS OBRIGATÓRIAS:
- Use NO MÍNIMO 5 FIIs diferentes
- Máximo 20% em qualquer FII individual
- Distribua entre pelo menos 3 setores
- Priorize FIIs com melhor relação risco/retorno
- Invista pelo menos 90% do valor disponível

RETORNE JSON com esta estrutura EXATA:
{
  "recommendations": [
    {
      "ticker": "código do FII",
      "allocation": porcentagem de 0 a 20,
      "shares": número de cotas,
      "investmentAmount": valor em reais,
      "score": nota de 0 a 10,
      "reasoning": "justificativa detalhada de 100-150 palavras",
      "strengths": ["força 1", "força 2"],
      "weaknesses": ["fraqueza 1", "fraqueza 2"]
    }
  ],
  "portfolioAnalysis": {
    "expectedYield": yield esperado anual em %,
    "riskLevel": "BAIXO" | "MÉDIO" | "ALTO",
    "diversificationScore": nota de 0 a 10,
    "sectorDistribution": {"setor": porcentagem},
    "totalInvestment": valor total investido,
    "remainingCash": valor não investido
  },
  "marketAnalysis": "análise do mercado atual de FIIs em 200-300 palavras",
  "investmentStrategy": "estratégia de investimento personalizada em 150-200 palavras"
}`,
      },
    ];

    const response = await this.makeRequest(messages, 0.4); // Mais criatividade para estratégias
    return JSON.parse(response);
  }

  // 🎯 PROMPT MASTER: Análise de mercado macro
  async generateMarketAnalysis() {
    const messages = [
      {
        role: "system",
        content: `Você é Luis Stuhlberger + Roberto Campos Neto analisando o mercado de FIIs brasileiro.

EXPERTISE: Combine análise macroeconômica, política monetária, e mercado imobiliário brasileiro.

ÁREAS DE ANÁLISE:
1. CENÁRIO MACROECONÔMICO:
   - Taxa Selic e curva de juros
   - Inflação (IPCA, IGP-M)
   - Crescimento do PIB
   - Política fiscal
   - Câmbio e fluxo de capital

2. MERCADO IMOBILIÁRIO:
   - Preços de imóveis comerciais
   - Taxa de vacância por setor
   - Lançamentos e estoque
   - Financiamento imobiliário
   - Regulamentação urbana

3. SETORES ESPECÍFICOS:
   - Logística: E-commerce, nearshoring
   - Shoppings: Recuperação, omnichannel
   - Corporativo: Trabalho híbrido, ESG
   - Recebíveis: Spread bancário, credit
   - Residencial: Demografia, Minha Casa Minha Vida

4. FLUXOS DE INVESTIMENTO:
   - Captações de FIIs
   - Performance vs. outros ativos
   - Apetite do investidor pessoa física
   - Investidores institucionais

5. PERSPECTIVAS:
   - Cenários para próximos 12 meses
   - Oportunidades e riscos
   - Setores mais promissores
   - Timing de investimento

RETORNE ANÁLISE COMPLETA E ACIONÁVEL.`,
      },
      {
        role: "user",
        content: `Forneça análise COMPLETA do mercado de FIIs brasileiro atual:

CONTEXTO: Dezembro 2024 - Analise cenário atual e perspectivas para 2025.

RETORNE JSON com esta estrutura:
{
  "marketOverview": "visão geral do mercado em 200-250 palavras",
  "macroeconomicFactors": {
    "interestRates": "análise da Selic e impacto",
    "inflation": "cenário inflacionário",
    "gdpGrowth": "crescimento econômico",
    "fiscalPolicy": "política fiscal"
  },
  "sectorAnalysis": {
    "logistics": "análise do setor logístico",
    "shopping": "análise de shopping centers",
    "corporate": "análise do setor corporativo",
    "receivables": "análise de recebíveis",
    "residential": "análise residencial"
  },
  "opportunities": ["oportunidade 1", "oportunidade 2", "oportunidade 3"],
  "risks": ["risco 1", "risco 2", "risco 3"],
  "outlook": "perspectivas para próximos 12 meses",
  "investmentThesis": "tese de investimento principal"
}`,
      },
    ];

    const response = await this.makeRequest(messages, 0.5);
    return JSON.parse(response);
  }
}

// 🎯 Provider do contexto
export const AIProvider = ({ children }) => {
  const [openAIManager] = useState(() => new OpenAIManager());
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    const apiKey = openAIManager.getApiKey();
    setIsConfigured(!!apiKey);
  }, [openAIManager]);

  const setApiKey = (key) => {
    openAIManager.setApiKey(key);
    setIsConfigured(!!key);
  };

  const generateInvestmentSuggestions = async (params) => {
    if (!isConfigured) {
      throw new Error("API key da OpenAI não configurada");
    }
    return await openAIManager.generateInvestmentSuggestions(params);
  };

  const analyzeFII = async (fiiData, userProfile) => {
    if (!isConfigured) {
      throw new Error("API key da OpenAI não configurada");
    }
    return await openAIManager.analyzeFII(fiiData, userProfile);
  };

  const analyzePortfolio = async (portfolio, userProfile) => {
    if (!isConfigured) {
      throw new Error("API key da OpenAI não configurada");
    }
    return await openAIManager.analyzePortfolio(portfolio, userProfile);
  };

  const generateMarketAnalysis = async () => {
    if (!isConfigured) {
      throw new Error("API key da OpenAI não configurada");
    }
    return await openAIManager.generateMarketAnalysis();
  };

  const value = {
    isConfigured,
    setApiKey,
    generateInvestmentSuggestions,
    analyzeFII,
    analyzePortfolio,
    generateMarketAnalysis,
  };

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error("useAI deve ser usado dentro de um AIProvider");
  }
  return context;
};

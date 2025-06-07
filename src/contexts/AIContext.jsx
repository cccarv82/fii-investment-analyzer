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

  // 🔧 PROMPT CORRIGIDO: Geração de carteira otimizada (GARANTIA DE JSON)
  async generateInvestmentSuggestions(params) {
    const { amount, riskProfile, investmentGoal, timeHorizon, availableFiis } =
      params;

    const messages = [
      {
        role: "system",
        content: `Você é um especialista em FIIs brasileiros. Sua ÚNICA tarefa é retornar um JSON válido.

REGRAS CRÍTICAS:
1. RETORNE APENAS JSON VÁLIDO - SEM TEXTO ADICIONAL
2. NÃO inclua explicações, desculpas ou comentários
3. NÃO use markdown ou formatação
4. SEMPRE retorne o JSON na estrutura exata solicitada

METODOLOGIA:
- Diversificação inteligente (máximo 25% por FII)
- Seleção baseada em DY, P/VP e qualidade
- Alocação por perfil de risco
- Uso de 90%+ do valor disponível

PERFIS DE ALOCAÇÃO:
CONSERVADOR: Logística 40%, Corporativo 30%, Recebíveis 20%, Outros 10%
MODERADO: Logística 35%, Corporativo 25%, Recebíveis 25%, Outros 15%
ARROJADO: Logística 30%, Corporativo 20%, Recebíveis 30%, Outros 20%`,
      },
      {
        role: "user",
        content: `Crie carteira para:

VALOR: R$ ${amount.toLocaleString()}
PERFIL: ${riskProfile}
OBJETIVO: ${investmentGoal}
PRAZO: ${timeHorizon}

FIIs DISPONÍVEIS:
${availableFiis
  .slice(0, 20) // Limitar para evitar prompt muito longo
  .map(
    (fii) =>
      `${fii.ticker}: R$ ${fii.price} | DY: ${fii.dividendYield}% | P/VP: ${fii.pvp} | ${fii.sector}`
  )
  .join("\n")}

RETORNE APENAS ESTE JSON (sem texto adicional):
{
  "suggestions": [
    {
      "ticker": "CÓDIGO",
      "name": "Nome do FII",
      "shares": número_de_cotas,
      "investmentAmount": valor_em_reais,
      "percentage": porcentagem_do_total,
      "reasoning": "justificativa_breve",
      "expectedYield": dividend_yield,
      "riskLevel": "BAIXO|MÉDIO|ALTO",
      "sector": "setor"
    }
  ],
  "totalInvested": valor_total_investido,
  "averageYield": dividend_yield_médio,
  "diversificationScore": nota_0_a_10,
  "strategy": "estratégia_utilizada",
  "portfolioAnalysis": {
    "strengths": ["força_1", "força_2"],
    "expectedReturn": retorno_esperado_anual
  }
}`,
      },
    ];

    const response = await this.makeRequest(messages, 0.1); // Temperatura baixa para consistência

    // 🔧 VALIDAÇÃO E LIMPEZA DO RESPONSE
    let cleanResponse = response.trim();

    // Remover possível markdown
    if (cleanResponse.startsWith("```json")) {
      cleanResponse = cleanResponse
        .replace(/```json\n?/, "")
        .replace(/\n?```$/, "");
    }
    if (cleanResponse.startsWith("```")) {
      cleanResponse = cleanResponse
        .replace(/```\n?/, "")
        .replace(/\n?```$/, "");
    }

    // Remover texto antes do JSON
    const jsonStart = cleanResponse.indexOf("{");
    if (jsonStart > 0) {
      cleanResponse = cleanResponse.substring(jsonStart);
    }

    // Remover texto após o JSON
    const jsonEnd = cleanResponse.lastIndexOf("}");
    if (jsonEnd > 0 && jsonEnd < cleanResponse.length - 1) {
      cleanResponse = cleanResponse.substring(0, jsonEnd + 1);
    }

    try {
      return JSON.parse(cleanResponse);
    } catch (error) {
      console.error("Erro ao fazer parse do JSON da IA:", error);
      console.error("Response original:", response);
      console.error("Response limpo:", cleanResponse);
      throw new Error("IA retornou resposta inválida. Tente novamente.");
    }
  }

  // 🎯 PROMPT MASTER: Análise de mercado
  async generateMarketAnalysis(marketData) {
    const messages = [
      {
        role: "system",
        content: `Você é um especialista em mercado de FIIs brasileiro com 20 anos de experiência.

EXPERTISE: Análise macro e setorial do mercado de FIIs, tendências, oportunidades e riscos.

METODOLOGIA:
1. Análise macroeconômica (Selic, inflação, PIB)
2. Análise setorial (logística, shoppings, corporativo, etc.)
3. Fluxo de investimentos
4. Valuations relativos
5. Oportunidades e riscos

RETORNE ANÁLISE COMPLETA EM JSON.`,
      },
      {
        role: "user",
        content: `Analise o mercado atual de FIIs brasileiro:

DADOS DE MERCADO:
${JSON.stringify(marketData, null, 2)}

RETORNE JSON com esta estrutura:
{
  "marketOverview": "visão geral do mercado",
  "trends": ["tendência 1", "tendência 2"],
  "opportunities": ["oportunidade 1", "oportunidade 2"],
  "risks": ["risco 1", "risco 2"],
  "sectorAnalysis": {
    "logistica": "análise do setor",
    "shoppings": "análise do setor",
    "corporativo": "análise do setor"
  },
  "recommendation": "recomendação geral"
}`,
      },
    ];

    const response = await this.makeRequest(messages, 0.5);
    return JSON.parse(response);
  }
}

// 🎯 Provider do contexto de IA
export function AIProvider({ children }) {
  const [aiManager] = useState(() => new OpenAIManager());
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    // Verificar se API key está configurada
    const apiKey = aiManager.getApiKey();
    setIsConfigured(!!apiKey);
  }, [aiManager]);

  // 🔧 Configurar API key
  const setApiKey = (key) => {
    aiManager.setApiKey(key);
    setIsConfigured(!!key);
  };

  // 🗑️ Remover API key
  const removeApiKey = () => {
    aiManager.setApiKey(null);
    setIsConfigured(false);
  };

  // 🔍 Obter API key (mascarada para exibição)
  const getApiKey = () => {
    return aiManager.getApiKey();
  };

  // 🤖 Gerar sugestões de investimento
  const generateInvestmentSuggestions = async (params) => {
    if (!isConfigured) {
      throw new Error("IA não configurada. Configure sua API key da OpenAI.");
    }
    return await aiManager.generateInvestmentSuggestions(params);
  };

  // 📊 Analisar FII individual
  const analyzeFII = async (fiiData, userProfile) => {
    if (!isConfigured) {
      throw new Error("IA não configurada. Configure sua API key da OpenAI.");
    }
    return await aiManager.analyzeFII(fiiData, userProfile);
  };

  // 📈 Analisar carteira
  const analyzePortfolio = async (portfolio, userProfile) => {
    if (!isConfigured) {
      throw new Error("IA não configurada. Configure sua API key da OpenAI.");
    }
    return await aiManager.analyzePortfolio(portfolio, userProfile);
  };

  // 📊 Gerar análise de mercado
  const generateMarketAnalysis = async (marketData) => {
    if (!isConfigured) {
      throw new Error("IA não configurada. Configure sua API key da OpenAI.");
    }
    return await aiManager.generateMarketAnalysis(marketData);
  };

  const value = {
    isConfigured,
    setApiKey,
    removeApiKey,
    getApiKey,
    generateInvestmentSuggestions,
    analyzeFII,
    analyzePortfolio,
    generateMarketAnalysis,
  };

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
}

// 🎯 Hook para usar o contexto de IA
export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error("useAI deve ser usado dentro de um AIProvider");
  }
  return context;
};

export default AIContext;

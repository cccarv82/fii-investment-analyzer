import React, { createContext, useContext, useState, useEffect } from "react";

// Contexto da IA
const AIContext = createContext();

// Classe para gerenciar IA da OpenAI
class OpenAIManager {
  constructor() {
    this.apiKey = null;
    this.baseURL = "https://api.openai.com/v1";
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

  async makeRequest(messages, temperature = 0.7) {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error("API key da OpenAI não configurada");
    }

    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: messages,
        temperature: temperature,
        max_tokens: 2000,
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

  async analyzeFII(fiiData, userProfile) {
    const messages = [
      {
        role: "system",
        content: `Você é um especialista em análise fundamentalista de FIIs (Fundos de Investimento Imobiliário) do Brasil. 
        Analise o FII fornecido considerando o perfil do investidor e retorne uma análise detalhada em JSON.`,
      },
      {
        role: "user",
        content: `Analise este FII:
        
        Dados do FII:
        - Ticker: ${fiiData.ticker}
        - Nome: ${fiiData.name}
        - Preço: R$ ${fiiData.price}
        - Dividend Yield: ${fiiData.dividendYield}%
        - P/VP: ${fiiData.pvp}
        - Setor: ${fiiData.sector}
        
        Perfil do Investidor:
        - Perfil de Risco: ${userProfile.riskProfile}
        - Objetivo: ${userProfile.investmentGoal}
        - Prazo: ${userProfile.timeHorizon}
        
        Retorne um JSON com:
        {
          "score": número de 0 a 10,
          "recommendation": "COMPRAR" | "MANTER" | "VENDER",
          "reasoning": "explicação detalhada",
          "strengths": ["ponto forte 1", "ponto forte 2"],
          "weaknesses": ["ponto fraco 1", "ponto fraco 2"],
          "targetPrice": preço alvo em reais,
          "riskLevel": "BAIXO" | "MÉDIO" | "ALTO"
        }`,
      },
    ];

    const response = await this.makeRequest(messages);
    return JSON.parse(response);
  }

  async analyzePortfolio(portfolio, userProfile) {
    const messages = [
      {
        role: "system",
        content: `Você é um especialista em análise de carteiras de FIIs. Analise a carteira fornecida e retorne insights em JSON.`,
      },
      {
        role: "user",
        content: `Analise esta carteira de FIIs:
        
        Carteira:
        ${portfolio
          .map(
            (p) =>
              `- ${p.ticker}: ${p.shares} cotas, R$ ${p.totalInvested} investido`
          )
          .join("\n")}
        
        Perfil do Investidor:
        - Perfil de Risco: ${userProfile.riskProfile}
        - Objetivo: ${userProfile.investmentGoal}
        
        Retorne um JSON com:
        {
          "overallScore": número de 0 a 10,
          "diversificationScore": número de 0 a 10,
          "riskScore": número de 0 a 10,
          "recommendations": ["recomendação 1", "recomendação 2"],
          "strengths": ["força 1", "força 2"],
          "weaknesses": ["fraqueza 1", "fraqueza 2"],
          "suggestedActions": ["ação 1", "ação 2"]
        }`,
      },
    ];

    const response = await this.makeRequest(messages);
    return JSON.parse(response);
  }

  async generateInvestmentSuggestions(params) {
    const { amount, riskProfile, investmentGoal, timeHorizon, availableFiis } =
      params;

    const messages = [
      {
        role: "system",
        content: `Você é um especialista em investimentos em FIIs. Analise os FIIs disponíveis e crie uma carteira otimizada baseada no perfil do investidor. Retorne APENAS um JSON válido.`,
      },
      {
        role: "user",
        content: `Crie uma carteira de FIIs para:
        
        Perfil do Investidor:
        - Valor para investir: R$ ${amount}
        - Perfil de Risco: ${riskProfile}
        - Objetivo: ${investmentGoal}
        - Prazo: ${timeHorizon}
        
        FIIs Disponíveis:
        ${availableFiis
          .map(
            (fii) =>
              `- ${fii.ticker} (${fii.name}): R$ ${fii.price}, DY: ${fii.dividendYield}%, P/VP: ${fii.pvp}, Setor: ${fii.sector}`
          )
          .join("\n")}
        
        Retorne um JSON com:
        {
          "recommendations": [
            {
              "ticker": "CÓDIGO",
              "reasoning": "motivo da escolha",
              "score": número de 0 a 10,
              "strengths": ["força 1", "força 2"],
              "weaknesses": ["fraqueza 1"],
              "allocation": percentual de 0 a 100
            }
          ],
          "marketAnalysis": "análise do mercado atual de FIIs"
        }`,
      },
    ];

    const response = await this.makeRequest(messages);
    return JSON.parse(response);
  }

  async getMarketAnalysis() {
    const messages = [
      {
        role: "system",
        content: `Você é um especialista em mercado de FIIs brasileiro. Forneça uma análise atual do mercado em JSON.`,
      },
      {
        role: "user",
        content: `Forneça uma análise atual do mercado de FIIs brasileiro.
        
        Retorne um JSON com:
        {
          "marketSentiment": "POSITIVO" | "NEUTRO" | "NEGATIVO",
          "keyTrends": ["tendência 1", "tendência 2"],
          "sectorOutlook": {
            "logistica": "análise do setor",
            "shoppings": "análise do setor",
            "corporativo": "análise do setor",
            "residencial": "análise do setor"
          },
          "opportunities": ["oportunidade 1", "oportunidade 2"],
          "risks": ["risco 1", "risco 2"],
          "outlook": "perspectiva geral"
        }`,
      },
    ];

    const response = await this.makeRequest(messages);
    return JSON.parse(response);
  }
}

// Instância global
const openAIManager = new OpenAIManager();

// Provider
export const AIProvider = ({ children }) => {
  const [apiKey, setApiKey] = useState("");
  const [isConfigured, setIsConfigured] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Verificar se API key está configurada
  useEffect(() => {
    const savedKey = openAIManager.getApiKey();
    if (savedKey) {
      setApiKey(savedKey);
      setIsConfigured(true);
    }
  }, []);

  // Configurar API key
  const configureApiKey = (key) => {
    try {
      openAIManager.setApiKey(key);
      setApiKey(key);
      setIsConfigured(!!key);
      setError(null);
      return true;
    } catch (error) {
      setError("Erro ao configurar API key");
      return false;
    }
  };

  // Remover API key
  const removeApiKey = () => {
    openAIManager.setApiKey(null);
    setApiKey("");
    setIsConfigured(false);
    setError(null);
  };

  // Analisar FII
  const analyzeFII = async (fiiData, userProfile) => {
    if (!isConfigured) {
      throw new Error("API key da OpenAI não configurada");
    }

    setLoading(true);
    setError(null);

    try {
      const analysis = await openAIManager.analyzeFII(fiiData, userProfile);
      setLoading(false);
      return analysis;
    } catch (error) {
      setLoading(false);
      setError(error.message);
      throw error;
    }
  };

  // Analisar carteira
  const analyzePortfolio = async (portfolio, userProfile) => {
    if (!isConfigured) {
      throw new Error("API key da OpenAI não configurada");
    }

    setLoading(true);
    setError(null);

    try {
      const analysis = await openAIManager.analyzePortfolio(
        portfolio,
        userProfile
      );
      setLoading(false);
      return analysis;
    } catch (error) {
      setLoading(false);
      setError(error.message);
      throw error;
    }
  };

  // Gerar sugestões de investimento
  const generateInvestmentSuggestions = async (params) => {
    if (!isConfigured) {
      throw new Error("API key da OpenAI não configurada");
    }

    setLoading(true);
    setError(null);

    try {
      const suggestions = await openAIManager.generateInvestmentSuggestions(
        params
      );
      setLoading(false);
      return suggestions;
    } catch (error) {
      setLoading(false);
      setError(error.message);
      throw error;
    }
  };

  // Análise de mercado
  const getMarketAnalysis = async () => {
    if (!isConfigured) {
      throw new Error("API key da OpenAI não configurada");
    }

    setLoading(true);
    setError(null);

    try {
      const analysis = await openAIManager.getMarketAnalysis();
      setLoading(false);
      return analysis;
    } catch (error) {
      setLoading(false);
      setError(error.message);
      throw error;
    }
  };

  // Limpar erro
  const clearError = () => {
    setError(null);
  };

  const value = {
    apiKey,
    isConfigured,
    loading,
    error,
    configureApiKey,
    removeApiKey,
    analyzeFII,
    analyzePortfolio,
    generateInvestmentSuggestions,
    getMarketAnalysis,
    clearError,
  };

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
};

// Hook para usar o contexto
export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error("useAI deve ser usado dentro de AIProvider");
  }
  return context;
};

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "../lib/supabase";

// 🎯 Contexto da IA com integração completa ao Supabase
const AIContext = createContext();

// 🤖 Classe para gerenciar IA da OpenAI com PROMPTS OTIMIZADOS
class OpenAIManager {
  constructor() {
    this.apiKey = null;
    this.baseURL = "https://api.openai.com/v1";
    this.model = "gpt-4";
  }

  setApiKey(key) {
    this.apiKey = key;
  }

  getApiKey() {
    return this.apiKey;
  }

  // 🚀 Fazer requisição para OpenAI com tratamento robusto
  async makeRequest(messages, temperature = 0.1) {
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
        max_tokens: 3000, // Reduzido de 4000 para 3000
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

  // 🎯 PROMPT OTIMIZADO: Análise fundamentalista de FII individual
  async analyzeFII(fiiData, userProfile) {
    const messages = [
      {
        role: "system",
        content: `Você é Warren Buffett especializado em FIIs brasileiros.

CONTEXTO BRASIL 2025:
- Selic: 10.75% | Inflação: 4.5% | PIB: +2.1%
- E-commerce boom | Trabalho híbrido | Nearshoring

METODOLOGIA:
1. QUANTITATIVA: DY>6%, P/VP<1.3, Liquidez>100k, ROE>5%
2. QUALITATIVA: Localização AAA, Gestão 5A, Contratos 5+ anos
3. MACRO: Selic vs DY, Inflação vs Reajustes, Ciclo econômico

RETORNE JSON ESTRUTURADO.`,
      },
      {
        role: "user",
        content: `Analise: ${fiiData.ticker} - R$${fiiData.price} - DY ${fiiData.dividendYield}% - P/VP ${fiiData.pvp} - ${fiiData.sector}

Perfil: ${userProfile.riskProfile} | ${userProfile.investmentGoal} | ${userProfile.timeHorizon}

JSON:
{
  "score": 0-10,
  "recommendation": "COMPRAR|MANTER|VENDER|EVITAR",
  "reasoning": "análise 200-300 palavras",
  "strengths": ["força1", "força2", "força3"],
  "weaknesses": ["fraco1", "fraco2"],
  "targetPrice": "preço-alvo 12m (máximo 20% acima do atual)",
  "riskLevel": "BAIXO|MÉDIO|ALTO",
  "suitability": 0-10
}`,
      },
    ];

    const response = await this.makeRequest(messages, 0.2);
    let cleanResponse = response.trim();

    if (cleanResponse.startsWith("```json")) {
      cleanResponse = cleanResponse
        .replace(/```json\s*/, "")
        .replace(/```\s*$/, "");
    }
    if (cleanResponse.startsWith("```")) {
      cleanResponse = cleanResponse
        .replace(/```\s*/, "")
        .replace(/```\s*$/, "");
    }

    return JSON.parse(cleanResponse);
  }

  // 🎯 PROMPT OTIMIZADO: Análise de carteira completa
  async analyzePortfolio(portfolio, userProfile) {
    const messages = [
      {
        role: "system",
        content: `Você é Ray Dalio especializado em carteiras FIIs brasileiros.

METODOLOGIA ALL WEATHER:
1. DIVERSIFICAÇÃO: Max 40% setor, 30% gestora, 70% tijolo
2. RISCO: Beta vs IFIX, VaR 95%, Sharpe Ratio
3. CORRELAÇÃO: Matriz setorial, Stress testing
4. FLUXO: Previsibilidade DY, Sustentabilidade yield

RETORNE JSON COMPLETO.`,
      },
      {
        role: "user",
        content: `Carteira: ${portfolio
          .map((p) => `${p.ticker}: ${p.shares} cotas, ${p.sector}`)
          .join(" | ")}

Perfil: ${userProfile.riskProfile} | ${userProfile.investmentGoal}

JSON:
{
  "overallScore": 0-10,
  "diversificationScore": 0-10,
  "riskScore": 0-10,
  "recommendations": ["rec1", "rec2"],
  "strengths": ["força1", "força2"],
  "weaknesses": ["fraco1", "fraco2"]
}`,
      },
    ];

    const response = await this.makeRequest(messages, 0.3);
    let cleanResponse = response.trim();

    if (cleanResponse.startsWith("```json")) {
      cleanResponse = cleanResponse
        .replace(/```json\s*/, "")
        .replace(/```\s*$/, "");
    }
    if (cleanResponse.startsWith("```")) {
      cleanResponse = cleanResponse
        .replace(/```\s*/, "")
        .replace(/```\s*$/, "");
    }

    return JSON.parse(cleanResponse);
  }

  // 🎯 PROMPT SUPREMO OTIMIZADO: Sugestões de investimento
  async generateInvestmentSuggestions(
    eligibleFIIs,
    userProfile,
    currentPortfolio = []
  ) {
    const messages = [
      {
        role: "system",
        content: `Você é Warren Buffett + Ray Dalio + Peter Lynch especialista em FIIs brasileiros.

EXPERTISE ELITE:
- Buffett: Value investing, análise fundamentalista
- Dalio: All Weather, diversificação inteligente
- Lynch: Growth at reasonable price, setores promissores

METODOLOGIA SUPREMA:
1. FILTROS QUANTITATIVOS:
- DY: Min 6% (competitivo vs Selic 10.75%)
- P/VP: Max 1.3 tijolo, 1.5 recebíveis
- Liquidez: >100k/dia, Consistência: 12+ meses
- ROE: DY/P/VP > 5%

2. ANÁLISE QUALITATIVA:
- Gestão: Track record 5+ anos, ESG
- Ativos: Localização AAA, <15 anos
- Inquilinos: Investment grade, 5+ anos
- Moat: Vantagem competitiva sustentável

3. CONTEXTO MACRO 2025:
- Selic 10.75%: FIIs com DY 6-10% + valorização podem competir
- Inflação 4.5%: Reajustes IPCA+ essenciais
- E-commerce: Logística last-mile premium
- Híbrido: Corporativo AAA > genérico

4. DIVERSIFICAÇÃO:
- Setorial: Max 35% um setor
- Geográfica: SP<60%, RJ<25%
- Gestora: Max 25% uma gestora
- Tipo: 60% tijolo, 40% recebíveis

5. MAGIC FORMULA FIIs:
- Ranking: DY/P/VP + Crescimento 24m
- Score: Média rankings (menor=melhor)

INSTRUÇÕES:
- SEMPRE 4 FIIs (20-30% cada)
- Justificar CADA escolha
- Considerar sinergia entre FIIs
- Foco total return (DY + valorização)

RETORNE JSON VÁLIDO.`,
      },
      {
        role: "user",
        content: `Analise ${eligibleFIIs.length} FIIs e escolha os 4 MELHORES:

TOP FIIs: ${eligibleFIIs
          .slice(0, 20)
          .map(
            (f) => `${f.ticker}(DY${f.dividendYield}%,P/VP${f.pvp},${f.sector})`
          )
          .join(" ")}

Carteira atual: ${
          currentPortfolio.length > 0
            ? currentPortfolio.map((p) => p.ticker).join(",")
            : "Nova"
        }

Perfil: ${userProfile.riskProfile} | ${userProfile.investmentGoal} | ${
          userProfile.timeHorizon
        } | R$${userProfile.investmentAmount?.toLocaleString()}

Macro: Selic 10.75%, Inflação 4.5%, PIB +2.1%

JSON (4 FIIs obrigatório):
{
  "suggestions": [
    {
      "ticker": "CÓDIGO11",
      "name": "Nome FII",
      "price": preço,
      "dividendYield": yield%,
      "pvp": pvp,
      "sector": "setor",
      "recommendedShares": cotas,
      "recommendedAmount": valor,
      "percentage": 20-30%,
      "score": 0-10,
      "reasoning": "análise 150-200 palavras Buffett+Dalio+Lynch+macro",
      "strengths": ["força1", "força2", "força3"],
      "risks": ["risco1", "risco2"],
      "targetPrice": "preço-alvo 12m (máximo 20% acima do atual)",
      "timeHorizon": "prazo"
    }
  ],
  "portfolioStrategy": {
    "overallApproach": "estratégia geral",
    "diversification": "análise diversificação",
    "expectedReturn": "calcule: (DY médio da carteira + valorização esperada 5-15%) com justificativa baseada nos FIIs selecionados"
  },
  "marketAnalysis": {
    "currentScenario": "cenário FIIs vs Selic",
    "opportunities": "oportunidades macro",
    "risks": "riscos momento"
  },
  "summary": {
    "totalInvestment": valor_total,
    "averageYield": yield_médio,
    "averagePVP": pvp_médio,
    "riskLevel": "BAIXO|MÉDIO|ALTO",
    "expectedTotalReturn": "retorno total anual"
  }
}`,
      },
    ];

    const response = await this.makeRequest(messages, 0.1);

    // 🔧 Limpeza robusta do JSON
    let cleanResponse = response.trim();

    if (cleanResponse.startsWith("```json")) {
      cleanResponse = cleanResponse
        .replace(/```json\s*/, "")
        .replace(/```\s*$/, "");
    }
    if (cleanResponse.startsWith("```")) {
      cleanResponse = cleanResponse
        .replace(/```\s*/, "")
        .replace(/```\s*$/, "");
    }

    const jsonStart = cleanResponse.indexOf("{");
    const jsonEnd = cleanResponse.lastIndexOf("}") + 1;
    if (jsonStart !== -1 && jsonEnd !== -1) {
      cleanResponse = cleanResponse.substring(jsonStart, jsonEnd);
    }

    try {
      return JSON.parse(cleanResponse);
    } catch (error) {
      console.error("Erro ao fazer parse do JSON:", error);
      console.error("Response original:", response);
      console.error("Response limpo:", cleanResponse);
      throw new Error("Resposta da IA não está em formato JSON válido");
    }
  }

  // 🎯 PROMPT OTIMIZADO CORRIGIDO: Análise de mercado geral
  async generateMarketAnalysis(userProfile) {
    const messages = [
      {
        role: "system",
        content: `Analista SUPREMO mercado FIIs brasileiro.

CONTEXTO 2025: Selic 10.75%, IPCA 4.5%, PIB +2.1%
SETORES: Logística (e-commerce), Corporativo (híbrido), Shopping (omnichannel), Recebíveis (spread)

RETORNE JSON SIMPLES.`,
      },
      {
        role: "user",
        content: `Analise mercado FIIs para perfil ${userProfile.riskProfile} | ${userProfile.investmentGoal}

JSON:
{
  "marketSentiment": "POSITIVO|NEUTRO|NEGATIVO",
  "outlook": "análise cenário atual em uma frase",
  "keyTrends": ["trend1", "trend2", "trend3", "trend4"],
  "sectorOutlook": {
    "Logística": "perspectiva setor",
    "Corporativo": "perspectiva setor",
    "Shoppings": "perspectiva setor",
    "Recebíveis": "perspectiva setor"
  },
  "opportunities": ["opp1", "opp2", "opp3"],
  "risks": ["risk1", "risk2", "risk3"]
}`,
      },
    ];

    const response = await this.makeRequest(messages, 0.2);
    let cleanResponse = response.trim();

    if (cleanResponse.startsWith("```json")) {
      cleanResponse = cleanResponse
        .replace(/```json\s*/, "")
        .replace(/```\s*$/, "");
    }
    if (cleanResponse.startsWith("```")) {
      cleanResponse = cleanResponse
        .replace(/```\s*/, "")
        .replace(/```\s*$/, "");
    }

    return JSON.parse(cleanResponse);
  }
}

// 🎯 Provider do contexto da IA
export const AIProvider = ({ children }) => {
  const { user } = useAuth();
  const [openAIManager] = useState(() => new OpenAIManager());
  const [isConfigured, setIsConfigured] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ CORREÇÃO CRÍTICA: Estado para armazenar BRAPI token
  const [brapiToken, setBrapiToken] = useState(null);

  // 🔧 Carregar configurações do Supabase
  useEffect(() => {
    if (user) {
      loadUserSettings();
    }
  }, [user]);

  const loadUserSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("user_settings")
        .select("openai_api_key, brapi_token")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data?.openai_api_key) {
        openAIManager.setApiKey(data.openai_api_key);
        setIsConfigured(true);
      }

      // ✅ CORREÇÃO CRÍTICA: Carregar BRAPI token
      if (data?.brapi_token) {
        setBrapiToken(data.brapi_token);
        console.log("✅ BRAPI token carregado do Supabase:", data.brapi_token);
      }
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
    }
  };

  // 🔧 Salvar API key no Supabase
  const setApiKey = async (key) => {
    try {
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      const { error } = await supabase.from("user_settings").upsert(
        {
          user_id: user.id,
          openai_api_key: key,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        }
      );

      if (error) throw error;

      openAIManager.setApiKey(key);
      setIsConfigured(!!key);
      console.log("✅ API key salva no Supabase");
    } catch (error) {
      console.error("❌ Erro ao salvar API key:", error);
      throw error;
    }
  };

  // 🔧 Remover API key do Supabase
  const removeApiKey = async () => {
    try {
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      const { error } = await supabase.from("user_settings").upsert(
        {
          user_id: user.id,
          openai_api_key: null,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        }
      );

      if (error) throw error;

      openAIManager.setApiKey(null);
      setIsConfigured(false);
      console.log("✅ API key removida do Supabase");
    } catch (error) {
      console.error("❌ Erro ao remover API key:", error);
      throw error;
    }
  };

  // ✅ CORREÇÃO CRÍTICA: Obter BRAPI token do estado
  const getBrapiToken = () => {
    console.log("🔍 getBrapiToken chamado, token atual:", brapiToken);
    return brapiToken;
  };

  const getApiKey = () => {
    return openAIManager.getApiKey();
  };

  const clearError = () => {
    setError(null);
  };

  // 🎯 Funções principais da IA
  const generateInvestmentSuggestions = async (
    eligibleFIIs,
    userProfile,
    currentPortfolio = []
  ) => {
    setLoading(true);
    setError(null);
    try {
      const result = await openAIManager.generateInvestmentSuggestions(
        eligibleFIIs,
        userProfile,
        currentPortfolio
      );
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const analyzeFII = async (fiiData, userProfile) => {
    setLoading(true);
    setError(null);
    try {
      const result = await openAIManager.analyzeFII(fiiData, userProfile);
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const analyzePortfolio = async (portfolio, userProfile) => {
    setLoading(true);
    setError(null);
    try {
      const result = await openAIManager.analyzePortfolio(
        portfolio,
        userProfile
      );
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const generateMarketAnalysis = async (userProfile) => {
    setLoading(true);
    setError(null);
    try {
      const result = await openAIManager.generateMarketAnalysis(userProfile);
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    isConfigured,
    loading,
    error,
    setApiKey,
    removeApiKey,
    getApiKey,
    getBrapiToken, // ✅ CORREÇÃO CRÍTICA: Função corrigida
    generateInvestmentSuggestions,
    analyzeFII,
    analyzePortfolio,
    generateMarketAnalysis,
    clearError,
  };

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error("useAI must be used within an AIProvider");
  }
  return context;
};

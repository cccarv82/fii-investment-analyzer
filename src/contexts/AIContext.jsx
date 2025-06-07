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
  "targetPrice": preço-alvo,
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
   - DY: Min 6% (superar Selic 10.75%)
   - P/VP: Max 1.3 tijolo, 1.5 recebíveis
   - Liquidez: >100k/dia, Consistência: 12+ meses
   - ROE: DY/P/VP > 5%

2. ANÁLISE QUALITATIVA:
   - Gestão: Track record 5+ anos, ESG
   - Ativos: Localização AAA, <15 anos
   - Inquilinos: Investment grade, 5+ anos
   - Moat: Vantagem competitiva sustentável

3. CONTEXTO MACRO 2025:
   - Selic 10.75%: FIIs devem DY>12% total return
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
      "targetPrice": preço-alvo,
      "timeHorizon": "prazo"
    }
  ],
  "portfolioStrategy": {
    "overallApproach": "estratégia geral",
    "diversification": "análise diversificação",
    "expectedReturn": "retorno anual esperado"
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

  // 🎯 PROMPT OTIMIZADO: Análise de mercado geral
  async generateMarketAnalysis(userProfile) {
    const messages = [
      {
        role: "system",
        content: `Analista SUPREMO mercado FIIs brasileiro.

CONTEXTO 2025: Selic 10.75%, IPCA 4.5%, PIB +2.1%
SETORES: Logística (e-commerce), Corporativo (híbrido), Shopping (omnichannel), Recebíveis (spread)

RETORNE JSON COMPLETO.`,
      },
      {
        role: "user",
        content: `Análise mercado FIIs para perfil ${userProfile.riskProfile} | ${userProfile.investmentGoal}

JSON:
{
  "marketOverview": {
    "currentScenario": "cenário atual",
    "keyTrends": ["trend1", "trend2"],
    "opportunities": ["opp1", "opp2"],
    "risks": ["risk1", "risk2"]
  },
  "outlook": {
    "next12Months": "perspectivas 12m",
    "expectedReturns": "retornos esperados"
  }
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
  const [userSettings, setUserSettings] = useState({
    openai_api_key: "",
    brapi_token: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  // 🔄 Carregar configurações do usuário do Supabase
  useEffect(() => {
    if (user) {
      loadUserSettings();
    } else {
      setIsLoading(false);
      setIsConfigured(false);
      setUserSettings({ openai_api_key: "", brapi_token: "" });
    }
  }, [user]);

  // 📥 Carregar configurações do Supabase
  const loadUserSettings = async () => {
    try {
      setIsLoading(true);
      console.log("🔄 [AIContext] Carregando configurações do usuário...");

      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        console.log("✅ [AIContext] Configurações carregadas:", {
          openai_configured: !!data.openai_api_key,
          brapi_configured: !!data.brapi_token,
        });

        setUserSettings({
          openai_api_key: data.openai_api_key || "",
          brapi_token: data.brapi_token || "",
        });

        if (data.openai_api_key) {
          openAIManager.setApiKey(data.openai_api_key);
          setIsConfigured(true);
        } else {
          setIsConfigured(false);
        }
      } else {
        console.log("📝 [AIContext] Nenhuma configuração encontrada");
        setUserSettings({ openai_api_key: "", brapi_token: "" });
        setIsConfigured(false);
      }
    } catch (err) {
      console.error("❌ [AIContext] Erro ao carregar configurações:", err);
      setUserSettings({ openai_api_key: "", brapi_token: "" });
      setIsConfigured(false);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔧 Funções para gerenciar API key
  const setApiKey = async (key) => {
    try {
      console.log("💾 [AIContext] Configurando API key...");

      const { data, error } = await supabase
        .from("user_settings")
        .upsert(
          {
            user_id: user.id,
            openai_api_key: key,
            brapi_token: userSettings.brapi_token,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        )
        .select()
        .single();

      if (error) throw error;

      openAIManager.setApiKey(key);
      setUserSettings((prev) => ({ ...prev, openai_api_key: key }));
      setIsConfigured(!!key);

      console.log("✅ [AIContext] API key configurada com sucesso");
    } catch (err) {
      console.error("❌ [AIContext] Erro ao configurar API key:", err);
      throw err;
    }
  };

  const removeApiKey = async () => {
    try {
      console.log("🗑️ [AIContext] Removendo API key...");

      const { data, error } = await supabase
        .from("user_settings")
        .upsert(
          {
            user_id: user.id,
            openai_api_key: "",
            brapi_token: userSettings.brapi_token,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        )
        .select()
        .single();

      if (error) throw error;

      openAIManager.setApiKey(null);
      setUserSettings((prev) => ({ ...prev, openai_api_key: "" }));
      setIsConfigured(false);

      console.log("✅ [AIContext] API key removida com sucesso");
    } catch (err) {
      console.error("❌ [AIContext] Erro ao remover API key:", err);
      throw err;
    }
  };

  const getApiKey = () => {
    return userSettings.openai_api_key;
  };

  const getBrapiToken = () => {
    return userSettings.brapi_token;
  };

  // 🤖 Funções da IA
  const analyzeFII = async (fiiData, userProfile) => {
    if (!isConfigured) {
      throw new Error(
        "OpenAI não configurada. Configure sua API key nas configurações."
      );
    }
    return await openAIManager.analyzeFII(fiiData, userProfile);
  };

  const analyzePortfolio = async (portfolio, userProfile) => {
    if (!isConfigured) {
      throw new Error(
        "OpenAI não configurada. Configure sua API key nas configurações."
      );
    }
    return await openAIManager.analyzePortfolio(portfolio, userProfile);
  };

  const generateInvestmentSuggestions = async (
    eligibleFIIs,
    userProfile,
    currentPortfolio = []
  ) => {
    if (!isConfigured) {
      throw new Error(
        "OpenAI não configurada. Configure sua API key nas configurações."
      );
    }
    return await openAIManager.generateInvestmentSuggestions(
      eligibleFIIs,
      userProfile,
      currentPortfolio
    );
  };

  const generateMarketAnalysis = async (userProfile) => {
    if (!isConfigured) {
      throw new Error(
        "OpenAI não configurada. Configure sua API key nas configurações."
      );
    }
    return await openAIManager.generateMarketAnalysis(userProfile);
  };

  const value = {
    isConfigured,
    isLoading,
    userSettings,
    setApiKey,
    removeApiKey,
    getApiKey,
    getBrapiToken,
    analyzeFII,
    analyzePortfolio,
    generateInvestmentSuggestions,
    generateMarketAnalysis,
    loadUserSettings,
  };

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error("useAI deve ser usado dentro de um AIProvider");
  }
  return context;
};

export default AIContext;

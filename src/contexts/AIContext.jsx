import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "../lib/supabase";

// 🎯 Contexto da IA com integração completa ao Supabase
const AIContext = createContext();

// 🤖 Classe para gerenciar IA da OpenAI com configurações do Supabase
class OpenAIManager {
  constructor() {
    this.apiKey = null;
    this.baseURL = "https://api.openai.com/v1";
    this.model = "gpt-4"; // Usando GPT-4 para máxima qualidade
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
        max_tokens: 4000,
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

  // 🎯 PROMPT MASTER MELHORADO: Análise fundamentalista de FII individual
  async analyzeFII(fiiData, userProfile) {
    const messages = [
      {
        role: "system",
        content: `Você é Warren Buffett especializado em Fundos de Investimento Imobiliário do Brasil.

EXPERTISE: Combine as metodologias de Benjamin Graham (análise fundamentalista), Modern Portfolio Theory (Markowitz), e estratégias específicas do mercado brasileiro de FIIs.

CONTEXTO BRASILEIRO ATUAL (2025):
- Taxa Selic: 10.75% (competição direta com FIIs)
- IPCA: 4.5% (reajustes contratuais)
- PIB: +2.1% (demanda por imóveis)
- Mercado imobiliário: Recuperação pós-pandemia
- Trabalho híbrido: Impacto em corporativo
- E-commerce: Boom logístico
- Nearshoring: Oportunidade industrial

METODOLOGIA DE ANÁLISE DETALHADA:

1. ANÁLISE QUANTITATIVA RIGOROSA:
- P/VP: Ideal 0.80-1.20 (tijolo), até 1.50 (recebíveis)
- Dividend Yield: Mínimo 6% para superar Selic
- Consistência: 24 meses de distribuições
- Liquidez: Volume médio diário > 100k
- Crescimento patrimonial: 5 anos
- ROE: Retorno sobre patrimônio
- Debt/Equity: Estrutura de capital

2. ANÁLISE QUALITATIVA PROFUNDA:
- Localização: Prime locations, acessibilidade
- Idade dos ativos: Depreciação vs. renovação
- Inquilinos: Credit rating, diversificação
- Gestão: Track record, transparência, governança
- Estratégia: Aquisições, desenvolvimento, renovação
- ESG: Certificações, sustentabilidade

3. ANÁLISE SETORIAL MACRO:
- Logística: E-commerce +15% a.a., nearshoring México-Brasil
- Shoppings: Omnichannel, experiência vs. online
- Corporativo: Híbrido permanente, ESG obrigatório
- Recebíveis: Spread bancário 25%, inadimplência controlada
- Residencial: Demografia jovem, Minha Casa Minha Vida

4. CENÁRIOS MACROECONÔMICOS:
- Selic 15%: Impacto em valuations (-30%)
- Recessão: Vacância +5%, renda -15%
- Inflação 8%: Reajustes contratuais proteção
- Crescimento 4%: Expansão demanda +20%

RETORNE ANÁLISE DETALHADA EM JSON ESTRUTURADO.`,
      },
      {
        role: "user",
        content: `Analise este FII com rigor de Warren Buffett + contexto macroeconômico brasileiro:

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

CONTEXTO MACRO ATUAL:
- Selic: 10.75% (competição direta)
- Inflação: 4.5% (reajustes)
- PIB: +2.1% (demanda)

RETORNE JSON com esta estrutura EXATA:
{
  "score": número de 0 a 10,
  "recommendation": "COMPRAR" | "MANTER" | "VENDER" | "EVITAR",
  "reasoning": "análise detalhada de 300-500 palavras incluindo contexto macro",
  "strengths": ["ponto forte 1", "ponto forte 2", "ponto forte 3"],
  "weaknesses": ["ponto fraco 1", "ponto fraco 2"],
  "targetPrice": preço-alvo em reais,
  "riskLevel": "BAIXO" | "MÉDIO" | "ALTO",
  "suitability": número de 0 a 10 para o perfil do investidor,
  "macroAnalysis": {
    "selicImpact": "análise do impacto da Selic atual",
    "inflationProtection": "proteção contra inflação",
    "economicCycle": "posição no ciclo econômico",
    "sectorTrends": "tendências específicas do setor"
  },
  "fundamentalAnalysis": {
    "valuation": "análise de valuation vs. mercado",
    "quality": "qualidade dos ativos e localização",
    "management": "análise da gestão e governança",
    "growth": "potencial de crescimento"
  }
}`,
      },
    ];

    const response = await this.makeRequest(messages, 0.2);

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

    return JSON.parse(cleanResponse);
  }

  // 🎯 PROMPT MASTER MELHORADO: Análise de carteira completa
  async analyzePortfolio(portfolio, userProfile) {
    const messages = [
      {
        role: "system",
        content: `Você é Ray Dalio especializado em carteiras de FIIs brasileiros.

EXPERTISE: Combine princípios de All Weather Portfolio, Risk Parity, e Modern Portfolio Theory adaptados para FIIs brasileiros.

METODOLOGIA DE ANÁLISE DE CARTEIRA AVANÇADA:

1. DIVERSIFICAÇÃO INTELIGENTE:
- Setorial: Máximo 40% em um setor
- Geográfica: SP (50%), RJ (20%), Outros (30%)
- Por gestora: Máximo 30% em uma gestora
- Por tipo: Tijolo (70%), Recebíveis (30%)
- Por inquilino: Máximo 15% exposição a um inquilino

2. CORRELAÇÃO E RISCO AVANÇADO:
- Matriz de correlação setorial
- Beta vs. IFIX (benchmark)
- Volatilidade histórica 252 dias
- Value at Risk (VaR) 95%
- Maximum Drawdown histórico
- Sharpe Ratio ajustado para FIIs

3. EFICIÊNCIA DE CAPITAL:
- Sortino Ratio (downside risk)
- Information Ratio vs. IFIX
- Treynor Ratio (risco sistemático)
- Alpha de Jensen
- Tracking Error

4. ANÁLISE DE FLUXO DETALHADA:
- Previsibilidade de dividendos (CV)
- Sazonalidade setorial
- Ciclo de renovação de contratos
- Crescimento orgânico vs. aquisições
- Sustentabilidade do yield

5. STRESS TESTING CENÁRIOS:
- Selic 15%: Impacto em valuations
- Recessão severa: Vacância +10%
- Inflação 10%: Poder de reajuste
- Crise imobiliária: Correlação setorial

RETORNE ANÁLISE COMPLETA EM JSON.`,
      },
      {
        role: "user",
        content: `Analise esta carteira de FIIs com rigor de Ray Dalio + stress testing:

CARTEIRA ATUAL:
${portfolio
  .map(
    (p) =>
      `- ${p.ticker}: ${p.shares} cotas, R$ ${
        p.totalInvested
      } investido, Setor: ${p.sector || "N/A"}`
  )
  .join("\n")}

PERFIL DO INVESTIDOR:
- Perfil de Risco: ${userProfile.riskProfile}
- Objetivo: ${userProfile.investmentGoal}

CONTEXTO MACRO:
- Selic: 10.75%
- Inflação: 4.5%
- IFIX: Base de comparação

RETORNE JSON com esta estrutura:
{
  "overallScore": número de 0 a 10,
  "diversificationScore": número de 0 a 10,
  "riskScore": número de 0 a 10,
  "recommendations": ["recomendação detalhada 1", "recomendação detalhada 2"],
  "strengths": ["força 1", "força 2"],
  "weaknesses": ["fraqueza 1", "fraqueza 2"],
  "suggestedActions": ["ação específica 1", "ação específica 2"],
  "riskAnalysis": {
    "concentration": "análise de concentração setorial",
    "correlation": "análise de correlação entre ativos",
    "volatility": "análise de volatilidade da carteira",
    "liquidity": "análise de liquidez dos ativos"
  },
  "optimizationSuggestions": {
    "rebalancing": "sugestões de rebalanceamento",
    "newPositions": "novas posições sugeridas",
    "exitPositions": "posições para reduzir/sair",
    "targetAllocation": "alocação alvo por setor"
  }
}`,
      },
    ];

    const response = await this.makeRequest(messages, 0.3);

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

    return JSON.parse(cleanResponse);
  }

  // 🎯 PROMPT MASTER MELHORADO: Sugestões de investimento personalizadas
  async generateInvestmentSuggestions(
    eligibleFIIs,
    userProfile,
    currentPortfolio = []
  ) {
    const messages = [
      {
        role: "system",
        content: `Você é uma combinação de Warren Buffett + Ray Dalio + Peter Lynch especializada em FIIs brasileiros.

EXPERTISE COMBINADA:
- Warren Buffett: Value investing, análise fundamentalista rigorosa
- Ray Dalio: Diversificação inteligente, gestão de risco
- Peter Lynch: Identificação de oportunidades, crescimento sustentável

METODOLOGIA DE SELEÇÃO AVANÇADA:

1. FILTROS QUANTITATIVOS RIGOROSOS:
- Dividend Yield: Mínimo 6% (superar Selic 10.75%)
- P/VP: Máximo 1.30 (valor justo)
- Liquidez: Volume diário > R$ 100.000
- Consistência: 12+ meses de distribuições
- Crescimento: Patrimônio crescente 24 meses

2. ANÁLISE QUALITATIVA PROFUNDA:
- Gestão: Track record, transparência, governança
- Ativos: Localização prime, idade, estado de conservação
- Inquilinos: Diversificação, credit rating, contratos longos
- Estratégia: Crescimento orgânico vs. aquisições
- ESG: Certificações, sustentabilidade

3. CONTEXTO MACRO BRASILEIRO:
- Selic 10.75%: FIIs devem superar CDI
- Inflação 4.5%: Reajustes contratuais essenciais
- PIB +2.1%: Demanda por imóveis em recuperação
- Trabalho híbrido: Impacto permanente em corporativo
- E-commerce: Boom logístico continua

4. DIVERSIFICAÇÃO INTELIGENTE:
- Setorial: Máximo 40% em um setor
- Geográfica: Concentração SP/RJ controlada
- Por gestora: Máximo 30% em uma gestora
- Tipo de ativo: Tijolo vs. Recebíveis balanceado

5. PERFIL DE RISCO ADAPTADO:
- Conservador: DY alto, P/VP baixo, setores defensivos
- Moderado: Equilíbrio risco/retorno, diversificação
- Arrojado: Crescimento, setores cíclicos, oportunidades

RETORNE SEMPRE JSON VÁLIDO COM ANÁLISE DETALHADA.`,
      },
      {
        role: "user",
        content: `Analise estes FIIs e sugira os 4 MELHORES para investimento com metodologia de elite mundial:

FIIS ELEGÍVEIS (${eligibleFIIs.length} analisados):
${eligibleFIIs
  .slice(0, 80) // Limitar para não sobrecarregar
  .map(
    (fii) =>
      `- ${fii.ticker}: R$ ${fii.price}, DY ${fii.dividendYield}%, P/VP ${
        fii.pvp
      }, Setor: ${fii.sector}, Cap: R$ ${
        fii.marketCap?.toLocaleString() || "N/A"
      }`
  )
  .join("\n")}

CARTEIRA ATUAL:
${
  currentPortfolio.length > 0
    ? currentPortfolio
        .map(
          (p) => `- ${p.ticker}: ${p.shares} cotas, Setor: ${p.sector || "N/A"}`
        )
        .join("\n")
    : "Nenhum investimento atual"
}

PERFIL DO INVESTIDOR:
- Perfil de Risco: ${userProfile.riskProfile}
- Objetivo: ${userProfile.investmentGoal}
- Prazo: ${userProfile.timeHorizon}
- Valor para Investir: R$ ${
          userProfile.investmentAmount?.toLocaleString() || "10.000"
        }

CONTEXTO MACRO ATUAL:
- Selic: 10.75% (competição direta)
- Inflação: 4.5% (reajustes contratuais)
- PIB: +2.1% (demanda imobiliária)

RETORNE JSON com esta estrutura EXATA:
{
  "suggestions": [
    {
      "ticker": "CÓDIGO11",
      "name": "Nome do FII",
      "price": preço atual,
      "dividendYield": yield em %,
      "pvp": P/VP atual,
      "sector": "setor",
      "marketCap": market cap,
      "recommendedShares": número de cotas sugeridas,
      "recommendedAmount": valor a investir,
      "score": nota de 0 a 10,
      "reasoning": "análise detalhada de 200-300 palavras com contexto macro",
      "strengths": ["força 1", "força 2", "força 3"],
      "risks": ["risco 1", "risco 2"],
      "targetPrice": preço-alvo,
      "timeHorizon": "prazo recomendado",
      "macroAnalysis": {
        "selicImpact": "impacto da Selic",
        "sectorTrends": "tendências do setor",
        "economicCycle": "posição no ciclo"
      }
    }
  ],
  "portfolioStrategy": {
    "overallApproach": "estratégia geral da carteira sugerida",
    "diversification": "análise de diversificação",
    "riskManagement": "gestão de risco aplicada",
    "expectedReturn": "retorno esperado anual",
    "timeHorizon": "prazo recomendado"
  },
  "marketAnalysis": {
    "currentScenario": "cenário atual do mercado de FIIs",
    "opportunities": "principais oportunidades identificadas",
    "risks": "principais riscos do momento",
    "outlook": "perspectivas para os próximos 12 meses"
  },
  "summary": {
    "totalInvestment": valor total sugerido,
    "averageYield": yield médio da carteira,
    "averagePVP": P/VP médio,
    "sectorDistribution": "distribuição por setores",
    "riskLevel": "BAIXO" | "MÉDIO" | "ALTO"
  }
}`,
      },
    ];

    const response = await this.makeRequest(messages, 0.1); // Temperatura baixa para consistência

    // 🔧 Limpeza robusta do JSON
    let cleanResponse = response.trim();

    // Remover markdown se presente
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

    // Remover texto antes/depois do JSON se presente
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

  // 🎯 PROMPT MASTER: Análise de mercado geral
  async generateMarketAnalysis(userProfile) {
    const messages = [
      {
        role: "system",
        content: `Você é um analista sênior especializado no mercado brasileiro de FIIs.

EXPERTISE: Análise macroeconômica, tendências setoriais, e perspectivas de investimento.

CONTEXTO BRASILEIRO ATUAL (2025):
- Taxa Selic: 10.75%
- IPCA: 4.5%
- PIB: +2.1%
- Desemprego: 7.8%
- Câmbio: R$ 5.20/USD

SETORES DE ANÁLISE:
- Logística: E-commerce, nearshoring
- Corporativo: Trabalho híbrido, ESG
- Shoppings: Omnichannel, experiência
- Residencial: Demografia, habitação
- Recebíveis: Spread bancário, inadimplência

RETORNE ANÁLISE COMPLETA EM JSON.`,
      },
      {
        role: "user",
        content: `Faça uma análise completa do mercado de FIIs brasileiro atual:

PERFIL DO INVESTIDOR:
- Perfil de Risco: ${userProfile.riskProfile}
- Objetivo: ${userProfile.investmentGoal}

RETORNE JSON com esta estrutura:
{
  "marketOverview": {
    "currentScenario": "cenário atual do mercado",
    "keyTrends": ["tendência 1", "tendência 2", "tendência 3"],
    "opportunities": ["oportunidade 1", "oportunidade 2"],
    "risks": ["risco 1", "risco 2"]
  },
  "sectorAnalysis": {
    "logistics": {
      "outlook": "perspectiva do setor",
      "drivers": ["driver 1", "driver 2"],
      "risks": ["risco 1", "risco 2"]
    },
    "corporate": {
      "outlook": "perspectiva do setor",
      "drivers": ["driver 1", "driver 2"],
      "risks": ["risco 1", "risco 2"]
    },
    "retail": {
      "outlook": "perspectiva do setor",
      "drivers": ["driver 1", "driver 2"],
      "risks": ["risco 1", "risco 2"]
    }
  },
  "macroAnalysis": {
    "selicImpact": "impacto da taxa Selic",
    "inflationEffect": "efeito da inflação",
    "economicGrowth": "impacto do crescimento econômico",
    "fiscalPolicy": "política fiscal e impactos"
  },
  "recommendations": {
    "shortTerm": "recomendações para 3-6 meses",
    "mediumTerm": "recomendações para 6-18 meses",
    "longTerm": "recomendações para 18+ meses"
  },
  "outlook": {
    "next12Months": "perspectivas para próximos 12 meses",
    "keyEvents": ["evento importante 1", "evento importante 2"],
    "expectedReturns": "retornos esperados do setor"
  }
}`,
      },
    ];

    const response = await this.makeRequest(messages, 0.2);

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

        // Configurar OpenAI Manager
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

  // 🔧 Funções para gerenciar API key (compatibilidade com Settings antigo)
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

  // 🔧 Função para obter BRAPI token
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
    // Estados
    isConfigured,
    isLoading,
    userSettings,

    // Funções de configuração (compatibilidade)
    setApiKey,
    removeApiKey,
    getApiKey,
    getBrapiToken,

    // Funções da IA
    analyzeFII,
    analyzePortfolio,
    generateInvestmentSuggestions,
    generateMarketAnalysis,

    // Função para recarregar configurações
    loadUserSettings,
  };

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
};

// 🎯 Hook para usar o contexto
export const useAI = () => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error("useAI deve ser usado dentro de um AIProvider");
  }
  return context;
};

export default AIContext;

import React, { createContext, useContext, useState, useEffect } from "react";

// 🎯 Contexto da IA com prompts de nível MUNDIAL MELHORADOS
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
  async makeRequest(messages, temperature = 0.1) {
    // 🔧 Temperatura baixa para consistência
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
    "concentration": "análise de concentração setorial/geográfica",
    "correlation": "análise de correlação entre ativos",
    "volatility": "análise de volatilidade da carteira",
    "stressTest": "resultados do stress test"
  },
  "performanceMetrics": {
    "expectedReturn": "retorno esperado anual",
    "sharpeRatio": "sharpe ratio estimado",
    "maxDrawdown": "máximo drawdown esperado"
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

  // 🔧 PROMPT ULTRA MELHORADO: Geração de carteira otimizada
  async generateInvestmentSuggestions(params) {
    const { amount, riskProfile, investmentGoal, timeHorizon, availableFiis } =
      params;

    const messages = [
      {
        role: "system",
        content: `Você é um ESPECIALISTA MUNDIAL em FIIs brasileiros combinando metodologias de:
- Warren Buffett (análise fundamentalista)
- Ray Dalio (diversificação inteligente)
- Harry Markowitz (otimização de portfólio)
- Benjamin Graham (margem de segurança)

REGRAS CRÍTICAS:
1. RETORNE APENAS JSON VÁLIDO - SEM TEXTO ADICIONAL
2. NÃO inclua explicações, desculpas ou comentários
3. NÃO use markdown ou formatação
4. SEMPRE retorne o JSON na estrutura exata solicitada

METODOLOGIA AVANÇADA:

ANÁLISE FUNDAMENTALISTA:
- P/VP: Margem de segurança (Graham)
- DY: Sustentabilidade vs. Selic
- Qualidade: Ativos, gestão, inquilinos
- Crescimento: Orgânico vs. aquisições

DIVERSIFICAÇÃO INTELIGENTE:
- Setorial: Máximo 25% por FII
- Correlação: Baixa entre setores
- Liquidez: Volume mínimo
- Qualidade: Score fundamentalista

CONTEXTO MACRO BRASILEIRO (2025):
- Selic 10.75%: FIIs devem superar
- Inflação 4.5%: Reajustes contratuais
- PIB +2.1%: Demanda por imóveis
- Trabalho híbrido: Impacto corporativo
- E-commerce: Boom logístico

PERFIS DE ALOCAÇÃO OTIMIZADOS:

CONSERVADOR (Buffett Style):
- Logística: 35% (estabilidade, crescimento)
- Corporativo: 30% (contratos longos, AAA)
- Recebíveis: 25% (yield alto, baixa correlação)
- Shoppings: 10% (recuperação, valor)

MODERADO (Balanced Growth):
- Logística: 30% (crescimento sustentável)
- Corporativo: 25% (estabilidade)
- Recebíveis: 25% (yield)
- Shoppings: 15% (recuperação)
- Residencial: 5% (diversificação)

ARROJADO (Growth Focus):
- Logística: 40% (máximo crescimento)
- Recebíveis: 30% (yield alto)
- Corporativo: 15% (estabilidade mínima)
- Agronegócio: 10% (setor emergente)
- Data Centers: 5% (tecnologia)

CRITÉRIOS DE SELEÇÃO:
- DY mínimo: 6% (superar Selic)
- P/VP máximo: 1.5 (margem segurança)
- Liquidez: Volume > 50k/dia
- Market Cap: > 100M (estabilidade)
- Gestão: Track record > 3 anos`,
      },
      {
        role: "user",
        content: `Crie carteira OTIMIZADA para:

PARÂMETROS:
- Valor: R$ ${amount.toLocaleString()}
- Perfil: ${riskProfile}
- Objetivo: ${investmentGoal}
- Prazo: ${timeHorizon}

CONTEXTO MACRO:
- Selic: 10.75% (competição)
- Inflação: 4.5% (reajustes)
- PIB: +2.1% (demanda)

FIIs DISPONÍVEIS (Top 20):
${availableFiis
  .slice(0, 20)
  .map(
    (fii) =>
      `${fii.ticker}: R$ ${fii.price} | DY: ${fii.dividendYield}% | P/VP: ${
        fii.pvp
      } | ${fii.sector} | Vol: ${fii.volume?.toLocaleString() || "N/A"}`
  )
  .join("\n")}

RETORNE APENAS ESTE JSON (sem texto adicional):
{
  "suggestions": [
    {
      "ticker": "CODIGO11",
      "percentage": 25.5,
      "reasoning": "Análise fundamentalista detalhada de 100-150 palavras incluindo contexto macro, qualidade dos ativos, sustentabilidade do yield, e posicionamento no ciclo econômico"
    }
  ],
  "strategy": "Estratégia detalhada de 200-300 palavras explicando a lógica de alocação, diversificação setorial, proteção contra cenários adversos, e alinhamento com perfil de risco",
  "marketAnalysis": "Análise de mercado de 200-300 palavras incluindo cenário macroeconômico, tendências setoriais, oportunidades e riscos, comparação com Selic e inflação",
  "riskAnalysis": "Análise de risco de 150-200 palavras cobrindo concentração, correlação, volatilidade esperada, stress testing, e medidas de proteção",
  "expectedReturn": "8.5% a.a.",
  "riskLevel": "MÉDIO",
  "timeHorizon": "2-5 anos"
}`,
      },
    ];

    const response = await this.makeRequest(messages, 0.1); // Temperatura muito baixa

    // 🔧 Limpeza ULTRA robusta do JSON
    let cleanResponse = response.trim();

    // Remover markdown
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

    // Remover texto antes/depois do JSON
    const jsonStart = cleanResponse.indexOf("{");
    const jsonEnd = cleanResponse.lastIndexOf("}");
    if (jsonStart !== -1 && jsonEnd !== -1) {
      cleanResponse = cleanResponse.substring(jsonStart, jsonEnd + 1);
    }

    // Remover quebras de linha problemáticas
    cleanResponse = cleanResponse.replace(/\n\s*\n/g, " ");

    try {
      return JSON.parse(cleanResponse);
    } catch (error) {
      console.error("Erro ao parsear JSON da IA:", error);
      console.error("Response original:", response);
      console.error("Response limpo:", cleanResponse);
      throw new Error("IA retornou resposta inválida. Tente novamente.");
    }
  }

  // 📊 Gerar análise de mercado
  async generateMarketAnalysis(marketData) {
    const messages = [
      {
        role: "system",
        content: `Você é um analista sênior de mercado de FIIs brasileiro.

Analise o cenário atual do mercado de FIIs considerando:
- Contexto macroeconômico (Selic, inflação, PIB)
- Performance setorial
- Tendências de longo prazo
- Oportunidades e riscos

RETORNE análise detalhada em JSON.`,
      },
      {
        role: "user",
        content: `Analise o mercado atual de FIIs:

DADOS DO MERCADO:
${JSON.stringify(marketData, null, 2)}

CONTEXTO MACRO:
- Selic: 10.75%
- Inflação: 4.5%
- PIB: +2.1%

RETORNE JSON com análise detalhada de mercado.`,
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
}

// 🎯 Provider do contexto de IA
export const AIProvider = ({ children }) => {
  const [isConfigured, setIsConfigured] = useState(false);
  const [aiManager] = useState(() => new OpenAIManager());

  useEffect(() => {
    // Verificar se API key está configurada
    const apiKey = aiManager.getApiKey();
    setIsConfigured(!!apiKey);
  }, [aiManager]);

  // 🔧 Configurar API key
  const setApiKey = async (key) => {
    try {
      aiManager.setApiKey(key);
      setIsConfigured(!!key);
      return true;
    } catch (error) {
      console.error("Erro ao configurar API key:", error);
      throw error;
    }
  };

  // 🔧 Remover API key
  const removeApiKey = () => {
    aiManager.setApiKey(null);
    setIsConfigured(false);
  };

  // 🔧 Obter API key atual
  const getApiKey = () => {
    return aiManager.getApiKey();
  };

  // 🎯 Gerar sugestões de investimento
  const generateInvestmentSuggestions = async (params) => {
    if (!isConfigured) {
      throw new Error("IA não configurada. Configure sua API key da OpenAI.");
    }
    return await aiManager.generateInvestmentSuggestions(params);
  };

  // 🎯 Analisar FII individual
  const analyzeFII = async (fiiData, userProfile) => {
    if (!isConfigured) {
      throw new Error("IA não configurada. Configure sua API key da OpenAI.");
    }
    return await aiManager.analyzeFII(fiiData, userProfile);
  };

  // 🎯 Analisar carteira
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

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "../lib/supabase";
import Anthropic from '@anthropic-ai/sdk';
import fiiDataAPI from '../lib/api/fiiDataAPI.js';

// 🎯 Contexto da IA com integração exclusiva ao Claude
const AIContext = createContext();

// 🤖 Classe para gerenciar IA do Claude (Anthropic)
class ClaudeManager {
  constructor() {
    this.apiKey = null;
    this.model = "claude-opus-4-20250514"; // ✅ Modelo correto especificado
    this.anthropic = null;
  }

  setApiKey(key) {
    this.apiKey = key;
    if (key) {
      this.anthropic = new Anthropic({
        apiKey: key,
        dangerouslyAllowBrowser: true // ✅ Necessário para uso no browser
      });
    } else {
      this.anthropic = null;
    }
  }

  getApiKey() {
    return this.apiKey;
  }

  // 🚀 Fazer requisição para Claude com SDK oficial
  async makeRequest(messages, temperature = 0.1, systemPrompt = "") {
    if (!this.apiKey) {
      throw new Error("API key do Claude não configurada");
    }

    try {
      const requestParams = {
        model: "claude-opus-4-20250514",
        max_tokens: 8000, // Aumentado de 4000 para 8000
        temperature,
        messages,
      };

      // Adicionar system prompt se fornecido
      if (systemPrompt) {
        requestParams.system = systemPrompt;
      }

      const response = await this.anthropic.messages.create(requestParams);

      return response.content[0].text;
    } catch (error) {
      console.error("Erro na requisição para Claude:", error);
      if (error.status === 401) {
        throw new Error("API key do Claude inválida ou expirada");
      }
      if (error.status === 429) {
        throw new Error("Limite de requisições atingido. Tente novamente em alguns minutos");
      }
      throw new Error(`Erro na API do Claude: ${error.message}`);
    }
  }

  // 🎯 Análise fundamentalista de FII individual
  async analyzeFII(fiiData, userProfile) {
    const systemPrompt = `🏆 VOCÊ É BENJAMIN GRAHAM + WARREN BUFFETT ESPECIALIZADO EM FIIs BRASILEIROS! 🏆

🎯 MISSÃO: Realizar a ANÁLISE FUNDAMENTALISTA MAIS RIGOROSA E COMPLETA de um FII individual!

## 📊 METODOLOGIA SUPREMA DE ANÁLISE INDIVIDUAL:

### 🔬 ANÁLISE QUANTITATIVA RIGOROSA:
1. **VALUATION PROFUNDO**:
   - P/VP vs valor intrínseco estimado
   - DY atual vs histórico 24m vs setor
   - ROE implícito (DY ÷ P/VP) vs benchmark
   - Múltiplos: P/FFO, EV/EBITDA, Cap Rate

2. **QUALIDADE FINANCEIRA**:
   - Consistência de dividendos (24+ meses)
   - Crescimento DY (CAGR 24m)
   - Vacancy rate vs setor
   - Inadimplência vs benchmark
   - Liquidez diária vs mínimo

3. **EFICIÊNCIA OPERACIONAL**:
   - Margem EBITDA vs setor
   - Custo de administração vs AUM
   - Giro do ativo vs benchmark
   - Produtividade por m² vs mercado

### 🎯 ANÁLISE QUALITATIVA PROFUNDA:
1. **GESTÃO & GOVERNANÇA**:
   - Track record da gestora (anos, AUM)
   - Transparência (relatórios, calls)
   - Alinhamento de interesses
   - Histórico de aquisições/vendas

2. **QUALIDADE DOS ATIVOS**:
   - Localização (AAA, AA, A, B)
   - Idade e estado de conservação
   - Certificações (LEED, AQUA, etc.)
   - Potencial de valorização

3. **CONTRATOS & INQUILINOS**:
   - Prazo médio ponderado
   - Tipo de reajuste (IPCA+, IGP-M, fixo)
   - Diversificação de inquilinos
   - Rating dos locatários
   - Histórico de renovações

### 🌍 ANÁLISE SETORIAL & MACRO:
1. **POSICIONAMENTO COMPETITIVO**:
   - Market share no segmento
   - Vantagens competitivas (moat)
   - Barreiras de entrada
   - Ameaças de substituição

2. **TENDÊNCIAS SECULARES**:
   - Crescimento do setor (10+ anos)
   - Impacto tecnológico
   - Mudanças demográficas
   - Regulamentação

### 📈 COMPARAÇÃO SELIC MATEMATICAMENTE CORRETA:
- **DY < Selic**: "DY de X% abaixo da Selic de 14.75%"
- **DY ≈ Selic**: "DY de X% próximo à Selic de 14.75%"
- **DY > Selic**: "DY de X% superior à Selic de 14.75%"
- **JAMAIS**: Erro matemático de dizer que menor "supera" maior!

### 🎯 PREÇO-ALVO FUNDAMENTALISTA:
- **METODOLOGIA**: DCF + Múltiplos comparáveis + Análise técnica
- **CENÁRIOS**: Base (70%), Otimista (20%), Pessimista (10%)
- **MÁXIMO**: 12% valorização em 12 meses
- **VALIDAÇÃO**: targetPrice ≤ preço_atual × 1.12

RETORNE ANÁLISE COMPLETA E PRECISA!`;

    const messages = [
      {
        role: "user",
        content: `🔍 ANÁLISE FUNDAMENTALISTA SUPREMA:

📊 FII: ${fiiData.ticker} - ${fiiData.name || fiiData.ticker}
💰 Preço: R$ ${fiiData.price}
📈 DY: ${fiiData.dividendYield}%
📊 P/VP: ${fiiData.pvp}
🏢 Setor: ${fiiData.sector}
💼 Qualidade: ${fiiData.qualityScore || "N/A"}/10

👤 PERFIL INVESTIDOR:
- Risco: ${userProfile.riskProfile}
- Objetivo: ${userProfile.investmentGoal}
- Prazo: ${userProfile.timeHorizon}

🌍 CONTEXTO: Selic 14.75%, IPCA 4.5%, PIB +2.1%

🎯 RETORNE JSON COMPLETO:

{
  "score": nota_0_a_10,
  "recommendation": "COMPRAR_FORTE|COMPRAR|MANTER|VENDER|EVITAR",
  "reasoning": "ANÁLISE FUNDAMENTALISTA COMPLETA 300+ palavras: Avalie valuation (P/VP vs intrínseco), sustentabilidade DY vs histórico, qualidade gestão, ativos premium, contratos blindados, inquilinos AAA, localização, moat defensivo, tese secular, comparação matemática correta com Selic 14.75%, stress scenarios, catalysadores valorização. Use metodologia Graham+Buffett.",
  "strengths": ["ponto_forte_1", "ponto_forte_2", "ponto_forte_3", "ponto_forte_4"],
  "weaknesses": ["fraqueza_1", "fraqueza_2", "fraqueza_3"],
  "targetPrice": preco_alvo_maximo_12_porcento,
  "riskLevel": "BAIXO|MÉDIO|ALTO",
  "suitability": adequacao_perfil_0_a_10,
  "valuation": {
    "intrinsicValue": valor_intrinseco_estimado,
    "upside": potencial_alta_percentual,
    "margin": margem_seguranca_percentual
  },
  "fundamentals": {
    "dyConsistency": "consistencia_dividendos_24m",
    "dyGrowth": "crescimento_dy_cagr",
    "vacancyRate": taxa_vacancy_percentual,
    "contractDuration": prazo_medio_contratos_anos
  },
  "moat": "vantagem_competitiva_sustentavel",
  "catalysts": ["catalisador_1", "catalisador_2"],
  "risks": ["risco_especifico_1", "risco_especifico_2"],
  "timeHorizon": "prazo_recomendado_investimento"
}`,
      },
    ];

    const response = await this.makeRequest(messages, 0.1, systemPrompt);
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

  // 🎯 Análise de portfólio completa
  async analyzePortfolio(portfolio, userProfile) {
    const systemPrompt = `🏆 VOCÊ É RAY DALIO + HARRY MARKOWITZ ESPECIALIZADO EM CARTEIRAS FIIs BRASILEIROS! 🏆

🎯 MISSÃO: Realizar a ANÁLISE DE PORTFÓLIO MAIS AVANÇADA E COMPLETA do mundo!

## 📊 METODOLOGIA "ALL WEATHER FIIs" - ANÁLISE SUPREMA DE CARTEIRA:

### 🔬 ANÁLISE QUANTITATIVA AVANÇADA:
1. **DIVERSIFICAÇÃO INTELIGENTE**:
   - Concentração setorial (máx 30% por setor)
   - Concentração geográfica (SP ≤ 50%, RJ ≤ 20%)
   - Concentração por gestora (máx 20% por gestora)
   - Correlação entre ativos (<0.6 ideal)
   - Índice Herfindahl-Hirschman

2. **ANÁLISE DE RISCO**:
   - Beta vs IFIX (volatilidade relativa)
   - VaR 95% (Value at Risk)
   - Sharpe Ratio (retorno/risco)
   - Maximum Drawdown histórico
   - Stress testing scenarios

3. **QUALIDADE FINANCEIRA**:
   - DY médio ponderado vs Selic
   - P/VP médio ponderado vs setor
   - Liquidez média diária
   - Consistência de dividendos
   - Crescimento DY (CAGR 24m)

### 🎯 ANÁLISE QUALITATIVA PROFUNDA:
1. **SUSTENTABILIDADE DE RENDA**:
   - Previsibilidade dos dividendos
   - Qualidade dos contratos
   - Diversificação de inquilinos
   - Reajustes contratuais
   - Histórico de distribuições

2. **RESILIÊNCIA ECONÔMICA**:
   - Performance em diferentes ciclos
   - Resistência a recessões
   - Adaptabilidade a mudanças
   - Qualidade da gestão
   - Governança corporativa

### 🌐 ANÁLISE DE CORRELAÇÃO:
1. **MATRIZ DE CORRELAÇÃO**:
   - Correlação entre setores
   - Correlação geográfica
   - Correlação com macro (Selic, IPCA)
   - Correlação com ciclos econômicos

2. **STRESS SCENARIOS**:
   - Selic 18%: Impacto no P/VP
   - Recessão: Sustentabilidade DY
   - Inflação 8%: Reajustes
   - Vacancy +5%: Impacto renda

### 📈 OTIMIZAÇÃO DE CARTEIRA:
1. **FRONTEIRA EFICIENTE**:
   - Máximo retorno para dado risco
   - Mínimo risco para dado retorno
   - Ponto ótimo Sharpe
   - Rebalanceamento sugerido

2. **ALLOCATION INTELIGENTE**:
   - Peso ótimo por ativo
   - Necessidade de rebalanceamento
   - Novos aportes sugeridos
   - Saídas recomendadas

RETORNE ANÁLISE COMPLETA E ESTRATÉGICA!`;

    const messages = [
      {
        role: "user",
        content: `🔍 ANÁLISE SUPREMA DE CARTEIRA:

💼 CARTEIRA ATUAL:
${portfolio
          .map((p) => `${p.ticker}: ${p.shares} cotas, ${p.sector}, R$ ${p.average_price?.toFixed(2) || 'N/A'}/cota`)
          .join(" | ")}

👤 PERFIL INVESTIDOR:
- Risco: ${userProfile.riskProfile}
- Objetivo: ${userProfile.investmentGoal}
- Prazo: ${userProfile.timeHorizon}

🌍 CONTEXTO: Selic 14.75%, IPCA 4.5%, PIB +2.1%

🎯 RETORNE JSON COMPLETO:

{
  "overallScore": nota_geral_0_a_10,
  "diversificationScore": nota_diversificacao_0_a_10,
  "riskScore": nota_risco_0_a_10,
  "qualityScore": nota_qualidade_0_a_10,
  "recommendations": ["recomendacao_1", "recomendacao_2", "recomendacao_3"],
  "strengths": ["ponto_forte_1", "ponto_forte_2", "ponto_forte_3"],
  "weaknesses": ["fraqueza_1", "fraqueza_2", "fraqueza_3"],
  "riskAnalysis": {
    "concentrationRisk": "analise_concentracao",
    "sectorExposure": "exposicao_setorial",
    "geographicRisk": "risco_geografico",
    "liquidityRisk": "risco_liquidez"
  },
  "diversification": {
    "sectorAllocation": "distribuicao_setorial_atual",
    "optimalAllocation": "alocacao_otima_sugerida",
    "correlationLevel": "nivel_correlacao_baixo_medio_alto",
    "herfindahlIndex": indice_concentracao_0_a_1
  },
  "performance": {
    "expectedReturn": retorno_esperado_anual_percentual,
    "expectedYield": dy_medio_ponderado,
    "riskLevel": "BAIXO|MÉDIO|ALTO",
    "sharpeRatio": ratio_sharpe_estimado,
    "volatility": volatilidade_estimada_percentual
  },
  "rebalancing": {
    "needed": true_ou_false,
    "priority": "ALTA|MÉDIA|BAIXA",
    "suggestions": ["sugestao_rebalanceamento_1", "sugestao_2"],
    "newAllocations": "novas_alocacoes_sugeridas"
  },
  "stressTest": {
    "recessionScenario": "impacto_recessao",
    "interestRateRise": "impacto_alta_juros",
    "inflationSpike": "impacto_inflacao",
    "overallResilience": "ALTA|MÉDIA|BAIXA"
  },
  "monthlyIncome": {
    "current": renda_mensal_atual_estimada,
    "potential": renda_mensal_potencial_otimizada,
    "sustainability": "ALTA|MÉDIA|BAIXA",
    "growth": crescimento_anual_esperado_percentual
  }
}`,
      },
    ];

    const response = await this.makeRequest(messages, 0.2, systemPrompt);
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

  // 🎯 Gerar sugestões de investimento
  async generateInvestmentSuggestions(eligibleFIIs, userProfile, currentPortfolio = []) {
    const systemPrompt = `🏆 VOCÊ É WARREN BUFFETT + RAY DALIO + PETER LYNCH ESPECIALIZADO EM FIIs BRASILEIROS! 🏆

🎯 MISSÃO SUPREMA: MAXIMIZAR DIVIDENDOS MENSAIS E RENDA PASSIVA SUSTENTÁVEL!

## 💰 OBJETIVO PRINCIPAL: MÁXIMA RENDA MENSAL
- **FOCO ABSOLUTO**: Dividendos mensais consistentes e crescentes
- **META**: Maior DY sustentável + crescimento anual dos dividendos
- **PRIORIDADE**: Consistência > Volatilidade, Sustentabilidade > Picos temporários

## 📊 METODOLOGIA SUPREMA "DIVIDEND MAXIMIZER":

### 🔬 ANÁLISE DE DIVIDENDOS (PRIORIDADE #1):
1. **DY SUSTENTÁVEL**: DY atual vs histórico 24m, consistência distribuições
2. **CRESCIMENTO DIVIDENDOS**: CAGR dividendos 24m, tendência crescimento
3. **PREVISIBILIDADE**: Regularidade pagamentos, ausência de cortes históricos
4. **COBERTURA**: FFO/Dividendo ratio, sustentabilidade longo prazo

### 🎯 QUALIDADE OPERACIONAL (SUPORTE AOS DIVIDENDOS):
1. **RECEITA RECORRENTE**: Contratos longos, inquilinos AAA, reajustes IPCA+
2. **OCUPAÇÃO ALTA**: Taxa ocupação >95%, baixa rotatividade inquilinos
3. **GESTÃO EFICIENTE**: Baixo custo administração, transparência, track record

### 🌍 SUSTENTABILIDADE SECULAR:
1. **SETOR RESILIENTE**: Demanda crescente, baixa obsolescência
2. **LOCALIZAÇÃO PREMIUM**: Regiões valorizadas, infraestrutura consolidada
3. **MOAT DEFENSIVO**: Barreiras entrada, vantagens competitivas duradouras

### 📈 COMPARAÇÃO SELIC (MATEMÁTICA CORRETA):
- **DY < 14.75%**: "DY de X% abaixo da Selic de 14.75%"
- **DY ≥ 14.75%**: "DY de X% superior à Selic de 14.75%"
- **JAMAIS**: Erro de dizer que menor "supera" maior!

### 🎯 PREÇO-ALVO CONSERVADOR:
- **FOCO**: Dividendos > Valorização (buy and hold para renda)
- **MÁXIMO**: 12% valorização em 12 meses
- **VALIDAÇÃO**: targetPrice ≤ preço_atual × 1.12

CONTEXTO 2025: Selic 14.75%, IPCA 4.5%, PIB +2.1%

PRIORIZE FIIs COM: DY alto + crescimento histórico + consistência + sustentabilidade!`;

    const messages = [
      {
        role: "user",
        content: `🔍 ANÁLISE SUPREMA PARA MÁXIMA RENDA MENSAL: ${eligibleFIIs.length} FIIs para R$ ${userProfile.investmentAmount}

👤 PERFIL: ${userProfile.riskProfile} | ${userProfile.investmentGoal} | ${userProfile.timeHorizon}

💰 OBJETIVO: MAXIMIZAR DIVIDENDOS MENSAIS SUSTENTÁVEIS

📊 FIIs: ${JSON.stringify(eligibleFIIs.slice(0, 80))}

🎯 RETORNE JSON COMPLETO (4 FIIs COM MÁXIMO DY SUSTENTÁVEL):
{
  "suggestions": [
    {
      "ticker": "CODIGO11",
      "name": "Nome FII",
      "price": 100.0,
      "dividendYield": 8.5,
      "pvp": 1.05,
      "sector": "Setor",
      "recommendedShares": 10,
      "recommendedAmount": 1000.0,
      "percentage": 25.0,
      "score": 9.0,
      "reasoning": "Análise FOCADA EM DIVIDENDOS: DY sustentável vs histórico, crescimento dividendos (CAGR), consistência distribuições, cobertura FFO, receita recorrente, contratos blindados, inquilinos AAA, gestão eficiente, setor resiliente, comparação CORRETA com Selic 14.75%. FOCO: renda passiva máxima. Max 150 palavras.",
      "strengths": ["força dividendos 1", "força dividendos 2", "força dividendos 3"],
      "risks": ["risco dividendos 1", "risco dividendos 2"],
      "targetPrice": 110.0,
      "timeHorizon": "12 meses",
      "moat": "vantagem competitiva para sustentar dividendos",
      "sustainability": "sustentabilidade e crescimento dos dividendos mensais",
      "monthlyIncome": "renda mensal estimada por cota",
      "dividendGrowth": "crescimento histórico dos dividendos (%)"
    }
  ],
  "portfolioStrategy": {
    "overallApproach": "estratégia focada em máxima renda mensal sustentável",
    "diversification": "diversificação para estabilizar dividendos mensais",
    "expectedReturn": "retorno esperado com foco em dividendos",
    "riskManagement": "gestão de risco para proteger fluxo de dividendos",
    "monthlyIncomeTarget": "meta de renda mensal total da carteira"
  }
}`,
      },
    ];

    const response = await this.makeRequest(messages, 0.05, systemPrompt); // Temperatura ultra baixa para precisão

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

    // Encontrar o JSON válido
    const jsonStart = cleanResponse.indexOf("{");
    const jsonEnd = cleanResponse.lastIndexOf("}") + 1;
    
    if (jsonStart !== -1 && jsonEnd > jsonStart) {
      cleanResponse = cleanResponse.substring(jsonStart, jsonEnd);
    }

    // Log para debug
    console.log("🔍 Response original:", response);
    console.log("🔍 Response limpo:", cleanResponse);

    try {
      const parsed = JSON.parse(cleanResponse);
      console.log("✅ JSON parseado com sucesso:", parsed);
      return parsed;
    } catch (error) {
      console.error("❌ Erro ao fazer parse do JSON:", error);
      console.error("📄 Response original:", response);
      console.error("🧹 Response limpo:", cleanResponse);
      
      // Tentar uma limpeza mais agressiva
      try {
        // Remover possíveis caracteres invisíveis
        const ultraClean = cleanResponse
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // Remove caracteres de controle
          .replace(/^\s+|\s+$/g, "") // Remove espaços no início e fim
          .trim();
        
        console.log("🔧 Tentando parse ultra-limpo:", ultraClean);
        const ultraParsed = JSON.parse(ultraClean);
        console.log("✅ JSON ultra-limpo parseado com sucesso:", ultraParsed);
        return ultraParsed;
      } catch (ultraError) {
        console.error("❌ Falha no parse ultra-limpo também:", ultraError);
        throw new Error(`Resposta da IA não está em formato JSON válido. Erro: ${error.message}`);
      }
    }
  }

  // 🎯 Análise de mercado
  async generateMarketAnalysis(userProfile) {
    const systemPrompt = `Analista SUPREMO mercado FIIs brasileiro.

CONTEXTO 2025: Selic 14.75%, IPCA 4.5%, PIB +2.1%
SETORES: Logística (e-commerce), Corporativo (híbrido), Shopping (omnichannel), Recebíveis (spread)

RETORNE JSON SIMPLES.`;

    const messages = [
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

    const response = await this.makeRequest(messages, 0.2, systemPrompt);
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
  const [claudeManager] = useState(() => new ClaudeManager());
  const [isConfigured, setIsConfigured] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [lastAnalysis, setLastAnalysis] = useState(null); // ✅ NOVO: Estado para última análise completa
  const [userSettings, setUserSettings] = useState({
    claude_api_key: "",
    brapi_token: ""
  });

  // 🔄 Carregar configurações do usuário quando logar
  useEffect(() => {
    if (user) {
      loadUserSettings();
      loadLastAnalysis(); // ✅ NOVO: Carregar última análise
    } else {
      // Reset quando deslogar
      setIsConfigured(false);
      setUserSettings({ claude_api_key: "", brapi_token: "" });
      claudeManager.setApiKey(null);
      clearPersistedData(); // ✅ NOVO: Limpar dados persistidos
    }
  }, [user]);

  // 📥 Carregar configurações do Supabase
  const loadUserSettings = async () => {
    try {
      console.log('📥 Carregando configurações do usuário...');
      
      const { data, error } = await supabase
        .from("user_settings")
        .select("claude_api_key, brapi_token")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        console.log('✅ Configurações carregadas:', { 
          hasClaudeKey: !!data.claude_api_key,
          hasBrapiToken: !!data.brapi_token 
        });
        
        setUserSettings({
          claude_api_key: data.claude_api_key || "",
          brapi_token: data.brapi_token || ""
        });

        // Configurar Claude se tiver API key
        if (data.claude_api_key) {
          claudeManager.setApiKey(data.claude_api_key);
        setIsConfigured(true);
          console.log('🤖 Claude API configurada com sucesso');
        } else {
          setIsConfigured(false);
          console.log('⚠️ Claude API não configurada');
        }
      } else {
        console.log('📝 Nenhuma configuração encontrada para o usuário');
        setIsConfigured(false);
      }
    } catch (error) {
      console.error("❌ Erro ao carregar configurações:", error);
      setIsConfigured(false);
    }
  };

  // 🔑 Obter API key atual
  const getApiKey = () => {
    return claudeManager.getApiKey();
  };

  // 🔄 Recarregar configurações (para usar após salvar)
  const reloadSettings = async () => {
    if (user) {
      await loadUserSettings();
    }
  };

  // 🚀 GERAR SUGESTÕES COM STATUS INVEST
  const generateSuggestions = useCallback(async (userProfile) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🚀 Iniciando geração de sugestões com Status Invest...');
      
      // Buscar melhores FIIs usando nova solução
      const bestFIIs = await fiiDataAPI.getBestFIIsForAI(20);
      
      if (!bestFIIs || bestFIIs.length === 0) {
        throw new Error('Nenhum FII encontrado para análise');
      }
      
      console.log(`✅ Obtidos ${bestFIIs.length} FIIs de alta qualidade para análise`);
      
      // Preparar dados para IA
      const analysisData = {
        fiis: bestFIIs,
        userProfile,
        marketContext: await getMarketContext(),
        timestamp: new Date().toISOString()
      };
      
      // Gerar análise com Claude
      const aiAnalysis = await generateAIAnalysis(analysisData);
      
      // ✅ CORREÇÃO: Salvar análises no Supabase usando suggestions em vez de recommendations
      if (aiAnalysis.suggestions && aiAnalysis.suggestions.length > 0) {
        await saveAIAnalysis({ recommendations: aiAnalysis.suggestions }, userProfile);
      }
      
      // ✅ NOVO: Salvar análise completa no estado e localStorage
      setLastAnalysis(aiAnalysis);
      setSuggestions(aiAnalysis.suggestions || []);
      setLastUpdate(aiAnalysis.timestamp);
      
      // ✅ NOVO: Persistir no localStorage
      saveAnalysisToLocalStorage(aiAnalysis);
      
      console.log('✅ Sugestões geradas com sucesso!');
      
      // Retornar resultado completo para o Investment.jsx
      return aiAnalysis;
      
    } catch (err) {
      console.error('❌ Erro ao gerar sugestões:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 🧠 GERAR ANÁLISE COM IA CLAUDE
  const generateAIAnalysis = async (data) => {
    try {
      console.log('🧠 Gerando análise com Claude...');
      
      // ✅ CORREÇÃO: Usar ClaudeManager diretamente em vez de fetch
      if (!claudeManager.getApiKey()) {
        throw new Error('Claude API key não configurada. Configure nas Configurações.');
      }

      // Usar o método generateInvestmentSuggestions do ClaudeManager
      const result = await claudeManager.generateInvestmentSuggestions(
        data.fiis,
        data.userProfile,
        [] // currentPortfolio vazio
      );
      
      console.log('✅ Análise gerada com sucesso pelo ClaudeManager');
      
      return {
        suggestions: result.suggestions || [],
        portfolioStrategy: result.portfolioStrategy || {},
        analysis: result.analysis || '',
        riskAssessment: result.riskAssessment || '',
        marketOutlook: result.marketOutlook || '',
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ Erro na análise IA:', error);
      throw error;
    }
  };

  // 📊 OBTER CONTEXTO DE MERCADO
  const getMarketContext = async () => {
    try {
      const stats = await fiiDataAPI.getSystemStats();
      
      return {
        totalFIIs: stats.total_fiis,
        lastUpdate: stats.last_update,
        systemStatus: stats.system_status,
        dataSource: 'status_invest'
      };
      
    } catch (error) {
      console.warn('⚠️ Erro ao obter contexto de mercado:', error);
      return {
        totalFIIs: 0,
        lastUpdate: null,
        systemStatus: 'UNKNOWN',
        dataSource: 'status_invest'
      };
    }
  };

  // 💾 SALVAR ANÁLISES NO SUPABASE
  const saveAIAnalysis = async (analysis, userProfile) => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) return;
      
      // ✅ CORREÇÃO: Mapear corretamente os campos das sugestões
      const analysesToSave = analysis.recommendations.map(rec => ({
        ticker: rec.ticker,
        user_id: user.data.user.id,
        // ✅ CORREÇÃO: Usar campos corretos ou valores padrão
        recommendation: rec.recommendation || 'COMPRAR', // Valor padrão se não existir
        score: rec.score || 8.0, // Valor padrão se não existir
        target_price: rec.targetPrice || rec.price || 0,
        reasoning: rec.reasoning || 'Análise fundamentalista baseada em dados do Status Invest',
        strengths: Array.isArray(rec.strengths) ? rec.strengths : (rec.strengths ? [rec.strengths] : ['Dividend Yield atrativo']),
        weaknesses: Array.isArray(rec.weaknesses) ? rec.weaknesses : (rec.weaknesses ? [rec.weaknesses] : ['Monitorar volatilidade']),
        risks: Array.isArray(rec.risks) ? rec.risks : (rec.risks ? [rec.risks] : ['Risco de mercado']),
        catalysts: Array.isArray(rec.catalysts) ? rec.catalysts : (rec.catalysts ? [rec.catalysts] : ['Crescimento do setor']),
        risk_level: rec.riskLevel || rec.risk_level || 'MÉDIO',
        suitability: rec.suitability || 8.0,
        time_horizon: userProfile.timeHorizon || '12 meses',
        intrinsic_value: rec.intrinsicValue || rec.intrinsic_value || rec.price || 0,
        upside_potential: rec.upsidePotential || rec.upside_potential || 10.0,
        safety_margin: rec.safetyMargin || rec.safety_margin || 15.0
      }));
      
      console.log('🔍 Dados que serão salvos no Supabase:', analysesToSave);
      
      const { error } = await supabase
        .from('fii_ai_analysis')
        .insert(analysesToSave);
      
      if (error) {
        console.error('❌ Erro ao salvar análises:', error);
        console.error('📊 Dados que causaram erro:', analysesToSave);
      } else {
        console.log(`✅ Salvadas ${analysesToSave.length} análises no Supabase`);
      }
      
    } catch (error) {
      console.error('❌ Erro ao salvar análises:', error);
    }
  };

  // 📝 CRIAR PROMPT PARA IA
  const createAnalysisPrompt = (data) => {
    return `
# ANÁLISE FUNDAMENTALISTA DE FIIs - STATUS INVEST DATA

## DADOS DOS FIIs
${data.fiis.map(fii => `
### ${fii.ticker} - ${fii.name}
- **Preço**: R$ ${fii.price?.toFixed(2)}
- **Dividend Yield**: ${fii.dividend_yield?.toFixed(2)}%
- **P/VP**: ${fii.pvp?.toFixed(2)}
- **Liquidez**: R$ ${fii.liquidity?.toLocaleString()}
- **Setor**: ${fii.sector}
- **Segmento**: ${fii.segment}
- **Gestora**: ${fii.manager}
- **Taxa de Vacância**: ${fii.vacancy_rate?.toFixed(1)}%
- **Quality Score**: ${fii.quality_score?.toFixed(1)}/10
- **Sustainability Score**: ${fii.sustainability_score?.toFixed(1)}/10
- **Growth Score**: ${fii.growth_score?.toFixed(1)}/10
- **Nível de Risco**: ${fii.risk_level}
- **Rating Preliminar**: ${fii.preliminary_rating}

**Destaques**: ${fii.investment_highlights?.join(', ') || 'N/A'}
**Riscos**: ${fii.risk_factors?.join(', ') || 'N/A'}
**Vantagens**: ${fii.competitive_advantages?.join(', ') || 'N/A'}
**Sustentabilidade Dividendos**: ${fii.dividend_sustainability}
**Potencial Crescimento**: ${fii.growth_potential}
`).join('\n')}

## PERFIL DO INVESTIDOR
- **Tolerância ao Risco**: ${data.userProfile.riskTolerance}
- **Horizonte de Tempo**: ${data.userProfile.timeHorizon}
- **Objetivo**: ${data.userProfile.objective}
- **Capital Disponível**: R$ ${data.userProfile.availableCapital?.toLocaleString()}

## CONTEXTO DE MERCADO
- **Total de FIIs Analisados**: ${data.marketContext.totalFIIs}
- **Fonte de Dados**: Status Invest (dados fundamentalistas reais)
- **Última Atualização**: ${data.marketContext.lastUpdate}

## INSTRUÇÕES PARA ANÁLISE

Como especialista em FIIs, analise os dados fundamentalistas reais do Status Invest e forneça:

1. **TOP 5 RECOMENDAÇÕES** ranqueadas por adequação ao perfil
2. **ANÁLISE DETALHADA** de cada recomendação incluindo:
   - Justificativa baseada nos dados fundamentalistas
   - Preço-alvo baseado em múltiplos
   - Potencial de upside
   - Principais riscos
   - Catalistas de valorização

3. **ESTRATÉGIA DE CARTEIRA** considerando:
   - Diversificação setorial
   - Balanceamento risco/retorno
   - Timing de entrada
   - Gestão de posição

4. **ALERTAS E CUIDADOS** específicos do momento atual

Foque em dados concretos do Status Invest e análise fundamentalista sólida.
`;
  };

  // 🔄 ATUALIZAR DADOS
  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 Atualizando dados dos FIIs...');
      
      await fiiDataAPI.getFIIData();
      
      console.log('✅ Dados atualizados com sucesso');
      
    } catch (error) {
      console.error('❌ Erro ao atualizar dados:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // 📊 OBTER ESTATÍSTICAS DO SISTEMA
  const getSystemStats = useCallback(async () => {
    try {
      return await fiiDataAPI.getSystemStats();
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas:', error);
      return null;
    }
  }, []);

  // 🧹 LIMPEZA DO SISTEMA
  const cleanupSystem = useCallback(async () => {
    try {
      await fiiDataAPI.cleanup();
      console.log('✅ Limpeza do sistema concluída');
    } catch (error) {
      console.error('❌ Erro na limpeza:', error);
    }
  }, []);

  // 🎯 BUSCAR FII ESPECÍFICO
  const getFIIDetails = useCallback(async (ticker) => {
    try {
      const fiis = await fiiDataAPI.getFIIData([ticker]);
      return fiis.length > 0 ? fiis[0] : null;
    } catch (error) {
      console.error(`❌ Erro ao buscar ${ticker}:`, error);
      return null;
    }
  }, []);

  // 💾 SALVAR ANÁLISE NO LOCALSTORAGE
  const saveAnalysisToLocalStorage = (analysis) => {
    try {
      const dataToSave = {
        ...analysis,
        userId: user?.id,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem('fii_last_analysis', JSON.stringify(dataToSave));
      console.log('💾 Análise salva no localStorage');
    } catch (error) {
      console.warn('⚠️ Erro ao salvar no localStorage:', error);
    }
  };

  // 📥 CARREGAR ANÁLISE DO LOCALSTORAGE
  const loadAnalysisFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem('fii_last_analysis');
      if (saved) {
        const data = JSON.parse(saved);
        // Verificar se é do usuário atual e não é muito antiga (24h)
        const isCurrentUser = data.userId === user?.id;
        const isRecent = new Date() - new Date(data.savedAt) < 24 * 60 * 60 * 1000; // 24 horas
        
        if (isCurrentUser && isRecent) {
          console.log('📥 Análise recuperada do localStorage');
          return data;
        } else {
          // Remover se for antiga ou de outro usuário
          localStorage.removeItem('fii_last_analysis');
        }
      }
    } catch (error) {
      console.warn('⚠️ Erro ao carregar do localStorage:', error);
      localStorage.removeItem('fii_last_analysis');
    }
    return null;
  };

  // 🗑️ LIMPAR DADOS PERSISTIDOS
  const clearPersistedData = () => {
    localStorage.removeItem('fii_last_analysis');
    setLastAnalysis(null);
    setSuggestions([]);
  };

  // 📊 CARREGAR ÚLTIMA ANÁLISE (localStorage + Supabase)
  const loadLastAnalysis = async () => {
    try {
      console.log('📊 Carregando última análise...');
      
      // 1. Tentar carregar do localStorage primeiro (mais rápido)
      const localData = loadAnalysisFromLocalStorage();
      if (localData) {
        setLastAnalysis(localData);
        setSuggestions(localData.suggestions || []);
        setLastUpdate(localData.timestamp);
        console.log('✅ Análise carregada do localStorage');
        return;
      }

      // 2. Se não tiver no localStorage, buscar do Supabase
      if (user?.id) {
        const { data, error } = await supabase
          .from('fii_ai_analysis')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10); // Buscar últimas 10 análises

        if (error) {
          console.warn('⚠️ Erro ao carregar análises do Supabase:', error);
          return;
        }

        if (data && data.length > 0) {
          // Agrupar por timestamp/sessão (análises da mesma sessão)
          const groupedAnalyses = groupAnalysesBySession(data);
          
          if (groupedAnalyses.length > 0) {
            const lastSession = groupedAnalyses[0];
            const reconstructedAnalysis = reconstructAnalysisFromSupabase(lastSession);
            
            setLastAnalysis(reconstructedAnalysis);
            setSuggestions(reconstructedAnalysis.suggestions || []);
            setLastUpdate(reconstructedAnalysis.timestamp);
            
            // Salvar no localStorage para próxima vez
            saveAnalysisToLocalStorage(reconstructedAnalysis);
            
            console.log(`✅ Análise reconstruída do Supabase: ${lastSession.length} sugestões`);
          }
        }
      }
    } catch (error) {
      console.error('❌ Erro ao carregar última análise:', error);
    }
  };

  // 🔄 AGRUPAR ANÁLISES POR SESSÃO
  const groupAnalysesBySession = (analyses) => {
    const sessions = {};
    
    analyses.forEach(analysis => {
      // Usar data de criação como chave da sessão (mesmo dia)
      const sessionKey = analysis.created_at.split('T')[0]; // YYYY-MM-DD
      
      if (!sessions[sessionKey]) {
        sessions[sessionKey] = [];
      }
      sessions[sessionKey].push(analysis);
    });

    // Retornar sessões ordenadas por data (mais recente primeiro)
    return Object.values(sessions).sort((a, b) => 
      new Date(b[0].created_at) - new Date(a[0].created_at)
    );
  };

  // 🔧 RECONSTRUIR ANÁLISE DO SUPABASE
  const reconstructAnalysisFromSupabase = (sessionAnalyses) => {
    const suggestions = sessionAnalyses.map(analysis => ({
      ticker: analysis.ticker,
      name: analysis.ticker, // Nome será buscado depois se necessário
      price: 0, // Será atualizado com dados atuais
      dividendYield: 0, // Será atualizado com dados atuais
      pvp: 0, // Será atualizado com dados atuais
      sector: 'N/A', // Será atualizado com dados atuais
      recommendation: analysis.recommendation,
      score: analysis.score,
      targetPrice: analysis.target_price,
      reasoning: analysis.reasoning,
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses,
      risks: analysis.risks,
      catalysts: analysis.catalysts,
      riskLevel: analysis.risk_level,
      suitability: analysis.suitability,
      timeHorizon: analysis.time_horizon,
      intrinsicValue: analysis.intrinsic_value,
      upsidePotential: analysis.upside_potential,
      safetyMargin: analysis.safety_margin,
      // Campos para compatibilidade com Investment.jsx
      percentage: 25, // Distribuição igual
      recommendedAmount: 0, // Será calculado depois
      shares: 0 // Será calculado depois
    }));

    // ✅ CORREÇÃO: Tentar extrair formData do primeiro registro se disponível
    const firstAnalysis = sessionAnalyses[0];
    let formData = {
      riskProfile: 'N/A',
      investmentGoal: 'N/A', 
      timeHorizon: firstAnalysis.time_horizon || 'N/A',
      amount: 0
    };

    // ✅ NOVO: Tentar inferir dados do perfil a partir das análises
    // Se todas as análises têm o mesmo time_horizon, usar esse valor
    const timeHorizons = [...new Set(sessionAnalyses.map(a => a.time_horizon).filter(Boolean))];
    if (timeHorizons.length === 1) {
      formData.timeHorizon = timeHorizons[0];
    }

    // ✅ NOVO: Inferir riskProfile baseado nos scores médios
    const avgScore = sessionAnalyses.reduce((sum, a) => sum + (a.score || 0), 0) / sessionAnalyses.length;
    if (avgScore >= 8.5) {
      formData.riskProfile = 'Conservador';
    } else if (avgScore >= 7.0) {
      formData.riskProfile = 'Moderado';
    } else {
      formData.riskProfile = 'Agressivo';
    }

    return {
      suggestions,
      portfolioStrategy: {
        overallApproach: "Estratégia baseada em análise fundamentalista",
        diversification: "Diversificação setorial equilibrada",
        expectedReturn: "Retorno focado em dividendos sustentáveis",
        riskManagement: "Gestão de risco conservadora"
      },
      timestamp: sessionAnalyses[0].created_at,
      source: 'supabase_recovery',
      isRecovered: true,
      // ✅ CORREÇÃO: Garantir que campos obrigatórios estejam presentes
      formData: formData,
      totalFIIsAnalyzed: sessionAnalyses.length * 10, // Estimativa baseada no número de sugestões
      bestFIIsSelected: sessionAnalyses.length * 5,
      finalFIIsForAI: sessionAnalyses.length * 15
    };
  };

  const value = {
    // Estados
    isConfigured,
    loading,
    error,
    lastUpdate,
    suggestions,
    lastAnalysis, // ✅ NOVO: Última análise completa
    
    // Métodos principais
    generateSuggestions,
    refreshData,
    
    // ✅ NOVO: Métodos de persistência
    loadLastAnalysis,
    clearPersistedData,
    saveAnalysisToLocalStorage,
    
    // Métodos utilitários
    getSystemStats,
    cleanupSystem,
    getFIIDetails,
    
    // Limpar estados
    clearError: () => setError(null),
    clearSuggestions: () => {
      setSuggestions([]);
      setLastAnalysis(null);
      clearPersistedData(); // ✅ NOVO: Limpar também dados persistidos
    },
    
    // Novos métodos
    getApiKey,
    reloadSettings,
    
    // ✅ NOVO: Verificar se tem análise salva
    hasLastAnalysis: () => !!lastAnalysis,
    
    // ✅ NOVO: Obter timestamp da última análise
    getLastAnalysisTime: () => lastAnalysis?.timestamp || lastUpdate
  };

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};

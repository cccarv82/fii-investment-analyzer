import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "../lib/supabase";
import Anthropic from '@anthropic-ai/sdk';
import { testBRAPIData } from '../lib/api/test_brapi_data';
import { debugDY } from '../lib/api/debug_dy_browser';
import { testBRAPIRangeOptions } from '../lib/api/test_brapi_range';
import { testHybridMethod } from '../lib/api/test_hybrid_method';

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

  // ✅ Estado para armazenar BRAPI token
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
        .select("claude_api_key, brapi_token")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      // Configurar Claude se disponível
      if (data?.claude_api_key) {
        claudeManager.setApiKey(data.claude_api_key);
        setIsConfigured(true);
      }

      // Carregar BRAPI token
      if (data?.brapi_token) {
        setBrapiToken(data.brapi_token);
        console.log("✅ BRAPI token carregado do Supabase:", data.brapi_token);
      }

    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
    }
  };

  // 🔧 Salvar API key do Claude no Supabase
  const setApiKey = async (key) => {
    try {
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      const { error } = await supabase.from("user_settings").upsert(
        {
          user_id: user.id,
          claude_api_key: key,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        }
      );

      if (error) throw error;

      claudeManager.setApiKey(key);
      setIsConfigured(!!key);
      
      console.log("✅ API key do Claude salva no Supabase");
    } catch (error) {
      console.error("❌ Erro ao salvar API key do Claude:", error);
      throw error;
    }
  };

  // 🗑️ Remover API key do Claude
  const removeApiKey = async () => {
    try {
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      const { error } = await supabase.from("user_settings").upsert(
        {
          user_id: user.id,
          claude_api_key: null,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        }
      );

      if (error) throw error;

      claudeManager.setApiKey(null);
      setIsConfigured(false);
      
      console.log("✅ API key do Claude removida");
    } catch (error) {
      console.error("❌ Erro ao remover API key do Claude:", error);
      throw error;
    }
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
      const result = await claudeManager.generateInvestmentSuggestions(
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
      const result = await claudeManager.analyzeFII(fiiData, userProfile);
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
      const result = await claudeManager.analyzePortfolio(
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
      const result = await claudeManager.generateMarketAnalysis(userProfile);
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  // 🔍 Função de teste para debuggar dados BRAPI
  const testBRAPIDataDebug = async (tickers = ["MXRF11", "CPTS11", "RBRF11"]) => {
    if (!brapiToken) {
      console.error("❌ Token BRAPI não configurado!");
      return;
    }
    
    console.log("🔍 Iniciando teste de dados BRAPI...");
    await testBRAPIData(brapiToken, tickers);
  };

  // 🔍 Função de debug específica para DY
  const debugDYData = async () => {
    if (!brapiToken) {
      console.error("❌ Token BRAPI não configurado!");
      return;
    }
    
    console.log("🔍 Iniciando debug de DY...");
    return await debugDY(brapiToken);
  };

  // 🔍 Função de teste para diferentes ranges de dividendos na BRAPI
  const testBRAPIRange = async () => {
    console.log("🔍 Iniciando teste de ranges BRAPI...");
    return await testBRAPIRangeOptions();
  };

  // 🚀 Função de teste para o método híbrido inteligente
  const testHybridMethodDebug = async () => {
    console.log("🚀 Iniciando teste do método híbrido...");
    return await testHybridMethod();
  };

  // Obter BRAPI token do estado
  const getBrapiToken = () => {
    console.log("🔍 getBrapiToken chamado, token atual:", brapiToken);
    return brapiToken;
  };

  const getApiKey = () => {
    return claudeManager.getApiKey();
  };

  const value = {
    // Estados
    isConfigured,
    loading,
    error,
    
    // Funções Claude
    setApiKey,
    removeApiKey,
    getApiKey,
    
    // Funções BRAPI
    getBrapiToken,
    
    // Funções de análise
    generateInvestmentSuggestions,
    analyzeFII,
    analyzePortfolio,
    generateMarketAnalysis,
    
    // Utilitários
    clearError,
    testBRAPIDataDebug,
    debugDYData,
    testBRAPIRange,
    testHybridMethodDebug,
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

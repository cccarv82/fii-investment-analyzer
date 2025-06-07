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

  // 🎯 PROMPT REVOLUCIONÁRIO: Análise fundamentalista de FII individual
  async analyzeFII(fiiData, userProfile) {
    const messages = [
      {
        role: "system",
        content: `🏆 VOCÊ É BENJAMIN GRAHAM + WARREN BUFFETT ESPECIALIZADO EM FIIs BRASILEIROS! 🏆

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

RETORNE ANÁLISE COMPLETA E PRECISA!`,
      },
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

    const response = await this.makeRequest(messages, 0.1);
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

  // 🎯 PROMPT REVOLUCIONÁRIO: Análise de carteira completa
  async analyzePortfolio(portfolio, userProfile) {
    const messages = [
      {
        role: "system",
        content: `🏆 VOCÊ É RAY DALIO + HARRY MARKOWITZ ESPECIALIZADO EM CARTEIRAS FIIs BRASILEIROS! 🏆

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

RETORNE ANÁLISE COMPLETA E ESTRATÉGICA!`,
      },
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

  // 🎯 PROMPT SUPREMO REVOLUCIONÁRIO: Sugestões de investimento
  async generateInvestmentSuggestions(
    eligibleFIIs,
    userProfile,
    currentPortfolio = []
  ) {
    const messages = [
      {
        role: "system",
        content: `🏆 VOCÊ É O MAIOR ANALISTA FUNDAMENTALISTA DE FIIs DO MUNDO! 🏆

Você combina a genialidade de:
• Warren Buffett (Value Investing + Moats)
• Benjamin Graham (Análise Fundamentalista Rigorosa)
• Peter Lynch (Growth at Reasonable Price)
• Ray Dalio (All Weather Portfolio)
• Howard Marks (Análise de Risco)
• Luiz Barsi (Dividendos Sustentáveis)

🎯 MISSÃO: Criar a MELHOR carteira de FIIs para RENDA PASSIVA MENSAL MÁXIMA e SUSTENTÁVEL!

## 📊 METODOLOGIA "PICA DAS GALÁXIAS SUPREMA" - ANÁLISE FUNDAMENTALISTA REVOLUCIONÁRIA

### 🌍 CONTEXTO MACROECONÔMICO 2025:
- Selic: 14.75% (referência de risco)
- IPCA: 4.5% (meta de retorno real)
- PIB: +2.1% (crescimento moderado)
- Cenário: Oportunidades em logística premium, corporativos AAA, recebíveis IPCA+
- Meta Suprema: Retorno real ≥ 8% a.a. (DY + Valorização)

### 🔬 FILTROS QUANTITATIVOS RIGOROSOS (Graham/Buffett):
1. **DY SUSTENTÁVEL**: ≥ 6% E histórico 24m estável (±2%)
2. **VALUATION ATRATIVO**: P/VP ≤ 1.2 (tijolo), ≤ 1.4 (papel)
3. **LIQUIDEZ PREMIUM**: ≥ R$ 200k/dia (média 30d)
4. **CONSISTÊNCIA**: 24+ meses pagando dividendos SEM cortes
5. **EFICIÊNCIA**: ROE implícito (DY ÷ P/VP) ≥ 6%
6. **CRESCIMENTO**: CAGR DY 24m ≥ IPCA
7. **QUALIDADE**: Vacancy ≤ 10%, Inadimplência ≤ 3%

### 🎯 ANÁLISE QUALITATIVA PROFUNDA (Lynch/Marks):
1. **GESTÃO EXCEPCIONAL**: Track record 7+ anos, AUM ≥ R$ 1bi
2. **ATIVOS PREMIUM**: Localização AAA, idade ≤ 15 anos
3. **CONTRATOS BLINDADOS**: Prazo médio ≥ 7 anos, reajuste IPCA+
4. **INQUILINOS AAA**: Diversificação ≥ 5 inquilinos, nenhum >30%
5. **MOAT DEFENSIVO**: Barreira de entrada, localização única
6. **TESE SUSTENTÁVEL**: Tendência secular favorável 10+ anos
7. **GOVERNANÇA**: Transparência, relatórios mensais, auditoria Big4

### 🌐 DIVERSIFICAÇÃO INTELIGENTE (Dalio All Weather):
- **SETORIAL**: Máx 30% por setor, mín 3 setores diferentes
- **GEOGRÁFICA**: SP ≤ 50%, RJ ≤ 20%, outros ≥ 30%
- **GESTORA**: Máx 20% por gestora, preferência top 10
- **TIPOLOGIA**: 50-70% tijolo, 30-50% papel (conforme perfil)
- **CORRELAÇÃO**: Baixa correlação entre ativos (<0.6)

### 💰 PREÇOS-ALVO FUNDAMENTALISTAS RIGOROSOS:
- **MÁXIMO ABSOLUTO**: 12% valorização em 12 meses
- **METODOLOGIA**: DCF + Múltiplos + Análise técnica
- **VALIDAÇÃO OBRIGATÓRIA**: targetPrice ≤ preço_atual × 1.12
- **CONSERVADORISMO**: Sempre usar cenário base, nunca otimista
- **FORMATO**: Número decimal puro (ex: 12.50)

### 📈 COMPARAÇÕES SELIC MATEMATICAMENTE CORRETAS:
- **Se DY < Selic**: "DY de X% abaixo da Selic de 14.75%, compensado por valorização e qualidade"
- **Se DY ≈ Selic**: "DY de X% próximo à Selic de 14.75%, competitivo com renda fixa"
- **Se DY > Selic**: "DY de X% superior à Selic de 14.75%, muito atrativo"
- **JAMAIS**: Dizer que DY menor "supera" Selic maior (erro matemático grave!)

### 🎯 ESTRATÉGIAS POR PERFIL:
**CONSERVADOR**: 70% tijolo AAA, DY ≥ 7%, P/VP ≤ 1.1, contratos 10+ anos
**MODERADO**: 60% tijolo, 40% papel, DY ≥ 6.5%, crescimento sustentável
**AGRESSIVO**: 40% tijolo, 60% papel, DY ≥ 6%, potencial valorização

### 🔍 ANÁLISE DE STRESS SCENARIOS:
- Selic 18%: Impacto no P/VP e demanda
- Recessão: Sustentabilidade dos dividendos
- Inflação 8%: Reajustes contratuais
- Vacancy +5%: Impacto no DY

### ⚡ REGRAS FUNDAMENTAIS INVIOLÁVEIS:
1. SEMPRE 4 FIIs (diversificação ótima)
2. NUNCA inventar dados (só usar fornecidos)
3. ANÁLISE fundamentalista de 200+ palavras por FII
4. JUSTIFICAR cada escolha com dados concretos
5. PRIORIZAR sustentabilidade sobre yield alto
6. CONSIDERAR sinergia entre FIIs escolhidos
7. FOCAR em RENDA PASSIVA MENSAL crescente

RETORNE JSON PERFEITO E COMPLETO!`,
      },
      {
        role: "user",
        content: `🚀 ANÁLISE SUPREMA: Selecione os 4 MELHORES FIIs para RENDA PASSIVA MÁXIMA!

📊 UNIVERSO DISPONÍVEL (${eligibleFIIs.length} FIIs):
${eligibleFIIs
          .slice(0, 25)
          .map(
            (f) => `${f.ticker}(R$${f.price},DY${f.dividendYield}%,P/VP${f.pvp},${f.sector})`
          )
          .join(" | ")}

💼 CARTEIRA ATUAL: ${
          currentPortfolio.length > 0
            ? currentPortfolio.map((p) => `${p.ticker}(${p.shares} cotas)`).join(", ")
            : "NOVA CARTEIRA"
        }

👤 PERFIL INVESTIDOR:
- Risco: ${userProfile.riskProfile}
- Objetivo: ${userProfile.investmentGoal}
- Prazo: ${userProfile.timeHorizon}
- Capital: R$ ${userProfile.investmentAmount?.toLocaleString()}

🌍 CENÁRIO MACRO:
- Selic: 14.75% | IPCA: 4.5% | PIB: +2.1%
- Tendências: E-commerce, trabalho híbrido, nearshoring

🎯 RETORNE JSON COMPLETO (OBRIGATÓRIO 4 FIIs):

{
  "suggestions": [
    {
      "ticker": "CÓDIGO11",
      "name": "Nome Completo do FII",
      "price": preço_atual_exato,
      "dividendYield": yield_percentual,
      "pvp": preco_valor_patrimonial,
      "sector": "setor_especifico",
      "recommendedShares": quantidade_cotas,
      "recommendedAmount": valor_investimento,
      "percentage": percentual_carteira,
      "score": nota_0_a_10,
      "reasoning": "ANÁLISE FUNDAMENTALISTA COMPLETA 200+ palavras: Tese de investimento, qualidade da gestão, ativos, contratos, inquilinos, localização, sustentabilidade DY, potencial valorização, comparação com Selic, riscos e oportunidades. Use dados concretos e metodologia Buffett+Graham+Lynch.",
      "strengths": ["ponto_forte_1", "ponto_forte_2", "ponto_forte_3"],
      "risks": ["risco_1", "risco_2"],
      "targetPrice": preco_alvo_maximo_12_porcento,
      "timeHorizon": "prazo_realizacao",
      "moat": "vantagem_competitiva_defensiva",
      "sustainability": "analise_sustentabilidade_dividendos"
    }
  ],
  "portfolioStrategy": {
    "overallApproach": "Estratégia geral da carteira baseada em diversificação inteligente e sustentabilidade de renda",
    "diversification": "Análise detalhada da diversificação setorial, geográfica e de gestoras",
    "expectedReturn": "Cálculo: (DY médio ponderado + valorização esperada conservadora) com justificativa fundamentalista",
    "riskManagement": "Estratégias de mitigação de riscos e stress scenarios",
    "rebalancing": "Critérios para rebalanceamento futuro"
  },
  "marketAnalysis": {
    "currentScenario": "Análise do cenário atual FIIs vs Selic vs Inflação",
    "opportunities": "Principais oportunidades macro e setoriais",
    "risks": "Principais riscos e como mitigar",
    "outlook": "Perspectivas 12-24 meses"
  },
  "summary": {
    "totalInvestment": valor_total_exato,
    "averageYield": yield_medio_ponderado,
    "averagePVP": pvp_medio_ponderado,
    "riskLevel": "BAIXO|MÉDIO|ALTO",
    "expectedTotalReturn": "retorno_total_anual_conservador",
    "monthlyIncome": "renda_passiva_mensal_estimada",
    "paybackPeriod": "prazo_retorno_investimento"
  }
}`,
      },
    ];

    const response = await this.makeRequest(messages, 0.05); // Temperatura ultra baixa para precisão

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

CONTEXTO 2025: Selic 14.75%, IPCA 4.5%, PIB +2.1%
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

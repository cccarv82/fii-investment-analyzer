// Serviço de análise fundamentalista com IA
class FundamentalAnalysisAI {
  constructor() {
    this.apiKey = null; // Será configurado pelo usuário
    this.baseURL = 'https://api.openai.com/v1/chat/completions';
    this.model = 'gpt-3.5-turbo';
  }

  // Configurar API key
  setApiKey(apiKey) {
    this.apiKey = apiKey;
    localStorage.setItem('fii_analyzer_openai_key', apiKey);
  }

  // Obter API key salva
  getApiKey() {
    if (!this.apiKey) {
      this.apiKey = localStorage.getItem('fii_analyzer_openai_key');
    }
    return this.apiKey;
  }

  // Prompt para análise fundamentalista de FII
  createAnalysisPrompt(fiiData, userProfile) {
    return `
Você é um especialista em análise fundamentalista de Fundos de Investimento Imobiliário (FIIs) da B3.

DADOS DO FII:
- Ticker: ${fiiData.ticker}
- Nome: ${fiiData.name || 'N/A'}
- Preço atual: R$ ${fiiData.price}
- Dividend Yield: ${fiiData.dividendYield}%
- P/VP: ${fiiData.pvp}
- Setor: ${fiiData.sector || 'N/A'}
- Patrimônio Líquido: ${fiiData.netWorth || 'N/A'}
- Vacância: ${fiiData.vacancy || 'N/A'}%

PERFIL DO INVESTIDOR:
- Perfil de risco: ${userProfile.riskProfile}
- Objetivo: ${userProfile.investmentGoal}
- Prazo: ${userProfile.timeHorizon}
- Valor disponível: R$ ${userProfile.amount}

INSTRUÇÕES:
1. Faça uma análise fundamentalista completa do FII
2. Avalie os indicadores financeiros (DY, P/VP, vacância, etc.)
3. Considere o setor e momento de mercado
4. Analise a adequação ao perfil do investidor
5. Forneça uma recomendação clara (COMPRA, NEUTRO, VENDA)
6. Justifique sua recomendação com base nos fundamentos

FORMATO DA RESPOSTA (JSON):
{
  "recommendation": "COMPRA|NEUTRO|VENDA",
  "score": 1-10,
  "analysis": {
    "strengths": ["ponto forte 1", "ponto forte 2"],
    "weaknesses": ["ponto fraco 1", "ponto fraco 2"],
    "fundamentals": "análise dos indicadores fundamentalistas",
    "sectorAnalysis": "análise do setor",
    "riskAssessment": "avaliação de riscos"
  },
  "reasoning": "justificativa detalhada da recomendação",
  "targetAllocation": 5-25,
  "priceTarget": "preço-alvo estimado",
  "timeHorizon": "prazo recomendado"
}

Responda APENAS com o JSON válido, sem texto adicional.
`;
  }

  // Prompt para análise de carteira
  createPortfolioAnalysisPrompt(portfolio, userProfile) {
    const portfolioSummary = portfolio.map(p => 
      `${p.ticker}: ${p.percentage}% (R$ ${p.totalInvested})`
    ).join(', ');

    return `
Você é um especialista em análise de carteiras de FIIs.

CARTEIRA ATUAL:
${portfolioSummary}

PERFIL DO INVESTIDOR:
- Perfil de risco: ${userProfile.riskProfile}
- Objetivo: ${userProfile.investmentGoal}
- Prazo: ${userProfile.timeHorizon}

INSTRUÇÕES:
1. Analise a diversificação da carteira
2. Avalie o equilíbrio entre setores
3. Identifique riscos de concentração
4. Sugira melhorias na alocação
5. Recomende FIIs para complementar a carteira

FORMATO DA RESPOSTA (JSON):
{
  "diversificationScore": 1-10,
  "sectorBalance": "análise do equilíbrio setorial",
  "concentrationRisks": ["risco 1", "risco 2"],
  "recommendations": [
    {
      "action": "ADICIONAR|REDUZIR|MANTER",
      "ticker": "TICKER11",
      "reasoning": "justificativa"
    }
  ],
  "overallAssessment": "avaliação geral da carteira",
  "suggestedChanges": "mudanças sugeridas"
}

Responda APENAS com o JSON válido, sem texto adicional.
`;
  }

  // Chamar API da OpenAI
  async callOpenAI(prompt) {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('API key da OpenAI não configurada');
    }

    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'Você é um especialista em análise fundamentalista de FIIs da B3. Sempre responda em português brasileiro com análises precisas e baseadas em dados.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Erro na API da OpenAI');
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('Resposta vazia da API');
      }

      // Tentar parsear JSON
      try {
        return JSON.parse(content);
      } catch (parseError) {
        // Se não conseguir parsear, retornar resposta em texto
        return { rawResponse: content };
      }
    } catch (error) {
      console.error('Erro na chamada da OpenAI:', error);
      throw error;
    }
  }

  // Analisar FII individual
  async analyzeFII(fiiData, userProfile) {
    const prompt = this.createAnalysisPrompt(fiiData, userProfile);
    return await this.callOpenAI(prompt);
  }

  // Analisar carteira
  async analyzePortfolio(portfolio, userProfile) {
    const prompt = this.createPortfolioAnalysisPrompt(portfolio, userProfile);
    return await this.callOpenAI(prompt);
  }

  // Gerar sugestões de investimento
  async generateInvestmentSuggestions(userProfile, availableFIIs) {
    // Analisar cada FII disponível
    const analyses = [];
    
    for (const fii of availableFIIs.slice(0, 10)) { // Limitar a 10 FIIs para não exceder limites
      try {
        const analysis = await this.analyzeFII(fii, userProfile);
        analyses.push({
          ...fii,
          aiAnalysis: analysis
        });
        
        // Delay para evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Erro ao analisar ${fii.ticker}:`, error);
      }
    }

    // Filtrar e ordenar por recomendação
    const recommendations = analyses
      .filter(a => a.aiAnalysis.recommendation === 'COMPRA')
      .sort((a, b) => (b.aiAnalysis.score || 0) - (a.aiAnalysis.score || 0))
      .slice(0, 6); // Top 6 recomendações

    return this.createPortfolioAllocation(recommendations, userProfile);
  }

  // Criar alocação de carteira
  createPortfolioAllocation(recommendations, userProfile) {
    const totalAmount = userProfile.amount;
    let remainingAmount = totalAmount;
    const allocation = [];

    // Distribuir valor baseado no score e perfil de risco
    recommendations.forEach((fii, index) => {
      const baseAllocation = fii.aiAnalysis.targetAllocation || (20 - index * 2);
      let percentage = Math.min(baseAllocation, remainingAmount / totalAmount * 100);
      
      // Ajustar baseado no perfil de risco
      if (userProfile.riskProfile === 'conservador') {
        percentage = Math.min(percentage, 15); // Máximo 15% por FII
      } else if (userProfile.riskProfile === 'arrojado') {
        percentage = Math.min(percentage, 30); // Máximo 30% por FII
      } else {
        percentage = Math.min(percentage, 25); // Máximo 25% por FII
      }

      const recommendedAmount = (totalAmount * percentage) / 100;
      const shares = Math.floor(recommendedAmount / fii.price);
      const investmentAmount = shares * fii.price;

      if (shares > 0) {
        allocation.push({
          ticker: fii.ticker,
          name: fii.name,
          price: fii.price,
          dividendYield: fii.dividendYield,
          pvp: fii.pvp,
          sector: fii.sector,
          percentage: percentage,
          recommendedAmount: recommendedAmount,
          shares: shares,
          investmentAmount: investmentAmount,
          reasoning: fii.aiAnalysis.reasoning,
          strengths: fii.aiAnalysis.analysis?.strengths || [],
          weaknesses: fii.aiAnalysis.analysis?.weaknesses || [],
          score: fii.aiAnalysis.score
        });

        remainingAmount -= investmentAmount;
      }
    });

    return {
      allocation,
      summary: {
        totalAmount: totalAmount,
        totalInvestment: allocation.reduce((sum, item) => sum + item.investmentAmount, 0),
        remainingAmount: remainingAmount,
        expectedYield: allocation.reduce((sum, item) => 
          sum + (item.investmentAmount * item.dividendYield / 100), 0
        ),
        diversificationScore: Math.min(allocation.length * 15, 100),
        aiPowered: true
      }
    };
  }

  // Análise de mercado geral
  async getMarketAnalysis() {
    const prompt = `
Faça uma análise geral do mercado de FIIs brasileiro atual.

INSTRUÇÕES:
1. Analise o momento atual do mercado de FIIs
2. Identifique tendências e oportunidades
3. Avalie os setores mais promissores
4. Forneça perspectivas para os próximos meses

FORMATO DA RESPOSTA (JSON):
{
  "marketSentiment": "POSITIVO|NEUTRO|NEGATIVO",
  "keyTrends": ["tendência 1", "tendência 2"],
  "sectorOutlook": {
    "logistica": "perspectiva",
    "shoppings": "perspectiva",
    "corporativo": "perspectiva",
    "residencial": "perspectiva"
  },
  "opportunities": ["oportunidade 1", "oportunidade 2"],
  "risks": ["risco 1", "risco 2"],
  "outlook": "perspectiva geral para os próximos meses"
}

Responda APENAS com o JSON válido, sem texto adicional.
`;

    return await this.callOpenAI(prompt);
  }
}

// Instância global
export const fundamentalAnalysisAI = new FundamentalAnalysisAI();


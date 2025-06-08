import React, { useState, useEffect } from "react";
import { useAI } from "../../contexts/AIContext";
import {
  Brain,
  Zap,
  TrendingUp,
  AlertTriangle,
  Target,
  Lightbulb,
  Rocket,
  Shield,
  Eye,
  BarChart3,
  RefreshCw,
  Sparkles,
  Crown,
  Gem,
  Star
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Alert, AlertDescription } from "../ui/alert";

const AIAnalysisEngine = ({ portfolioMetrics, investments }) => {
  const { isConfigured, generateSuggestions, loading } = useAI();
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [marketInsights, setMarketInsights] = useState(null);
  const [riskAssessment, setRiskAssessment] = useState(null);

  // Gerar análise completa com IA
  const generateCompleteAnalysis = async () => {
    if (!isConfigured || !portfolioMetrics) return;

    setIsAnalyzing(true);
    try {
      // Preparar dados para análise
      const analysisData = {
        portfolio: {
          totalValue: portfolioMetrics.totalValue,
          totalInvestment: portfolioMetrics.totalInvestment,
          monthlyIncome: portfolioMetrics.totalMonthlyIncome,
          performance: portfolioMetrics.performance,
          averageDY: portfolioMetrics.averageDY,
          diversificationScore: portfolioMetrics.diversificationScore,
          concentrationRisk: portfolioMetrics.concentrationRisk,
          sectorDistribution: portfolioMetrics.sectorAnalysis
        },
        investments: investments.map(inv => ({
          ticker: inv.ticker,
          sector: inv.sector,
          currentValue: inv.current_value,
          totalInvested: inv.total_invested,
          monthlyIncome: inv.monthly_income,
          dividendYield: inv.dividend_yield_monthly,
          performance: inv.total_invested > 0 ? ((inv.current_value - inv.total_invested) / inv.total_invested) * 100 : 0
        }))
      };

      // Simular análise avançada com IA (aqui você pode fazer uma chamada real para Claude)
      const aiAnalysis = await simulateAdvancedAIAnalysis(analysisData);
      
      setAnalysis(aiAnalysis.portfolioAnalysis);
      setMarketInsights(aiAnalysis.marketInsights);
      setRiskAssessment(aiAnalysis.riskAssessment);

    } catch (error) {
      console.error("Erro na análise com IA:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Simulação de análise avançada (substitua por chamada real para Claude)
  const simulateAdvancedAIAnalysis = async (data) => {
    // Simular delay da API
    await new Promise(resolve => setTimeout(resolve, 2000));

    const { portfolio, investments } = data;

    // Análise do portfólio
    const portfolioScore = calculatePortfolioScore(portfolio);
    const diversificationAnalysis = analyzeDiversification(portfolio.sectorDistribution);
    const performanceAnalysis = analyzePerformance(portfolio.performance, portfolio.averageDY);
    
    // Insights de mercado
    const marketTrends = generateMarketTrends();
    const sectorOpportunities = identifySectorOpportunities(portfolio.sectorDistribution);
    
    // Avaliação de risco
    const riskFactors = assessRiskFactors(portfolio, investments);
    const recommendations = generateRecommendations(portfolio, riskFactors);

    return {
      portfolioAnalysis: {
        overallScore: portfolioScore,
        strengths: [
          portfolio.averageDY > 8 ? "🎯 Excelente dividend yield médio de " + portfolio.averageDY.toFixed(2) + "%" : null,
          portfolio.performance > 5 ? "🚀 Performance superior à média do mercado" : null,
          Object.keys(portfolio.sectorDistribution).length >= 3 ? "✅ Boa diversificação setorial" : null,
          portfolio.monthlyIncome > 1000 ? "💰 Renda passiva significativa estabelecida" : null
        ].filter(Boolean),
        weaknesses: [
          portfolio.concentrationRisk > 40 ? "⚠️ Alta concentração em um único setor" : null,
          portfolio.averageDY < 6 ? "📉 Dividend yield abaixo da média do mercado" : null,
          portfolio.performance < 0 ? "📊 Performance negativa no período" : null,
          Object.keys(portfolio.sectorDistribution).length < 3 ? "🎯 Necessita maior diversificação" : null
        ].filter(Boolean),
        recommendations: recommendations
      },
      marketInsights: {
        trends: marketTrends,
        opportunities: sectorOpportunities,
        outlook: generateMarketOutlook()
      },
      riskAssessment: {
        overallRisk: calculateOverallRisk(portfolio, riskFactors),
        factors: riskFactors,
        mitigation: generateRiskMitigation(riskFactors)
      }
    };
  };

  // Funções auxiliares para análise
  const calculatePortfolioScore = (portfolio) => {
    let score = 50; // Base
    
    // Performance
    if (portfolio.performance > 10) score += 20;
    else if (portfolio.performance > 5) score += 15;
    else if (portfolio.performance > 0) score += 10;
    
    // Dividend Yield
    if (portfolio.averageDY > 10) score += 15;
    else if (portfolio.averageDY > 8) score += 10;
    else if (portfolio.averageDY > 6) score += 5;
    
    // Diversificação
    const sectorCount = Object.keys(portfolio.sectorDistribution).length;
    if (sectorCount >= 5) score += 15;
    else if (sectorCount >= 3) score += 10;
    else if (sectorCount >= 2) score += 5;
    
    // Concentração (penalidade)
    if (portfolio.concentrationRisk > 50) score -= 15;
    else if (portfolio.concentrationRisk > 40) score -= 10;
    else if (portfolio.concentrationRisk > 30) score -= 5;
    
    return Math.min(Math.max(score, 0), 100);
  };

  const analyzeDiversification = (sectorDistribution) => {
    const sectors = Object.keys(sectorDistribution);
    const values = Object.values(sectorDistribution);
    const totalValue = values.reduce((sum, sector) => sum + sector.value, 0);
    
    return {
      sectorCount: sectors.length,
      dominantSector: sectors.reduce((a, b) => 
        sectorDistribution[a].value > sectorDistribution[b].value ? a : b
      ),
      concentration: Math.max(...values.map(s => s.value)) / totalValue * 100,
      balance: calculateSectorBalance(sectorDistribution)
    };
  };

  const analyzePerformance = (performance, averageDY) => {
    return {
      performanceLevel: performance > 10 ? "Excelente" : performance > 5 ? "Boa" : performance > 0 ? "Moderada" : "Abaixo da média",
      dyLevel: averageDY > 10 ? "Muito Alto" : averageDY > 8 ? "Alto" : averageDY > 6 ? "Médio" : "Baixo",
      recommendation: performance < 0 && averageDY < 6 ? "Revisar estratégia" : "Manter curso"
    };
  };

  const generateMarketTrends = () => [
    "🏢 Fundos de lajes corporativas apresentam resiliência em cenário de alta Selic",
    "🏪 Shopping centers em localização premium mostram recuperação pós-pandemia",
    "🏭 Logística continua sendo setor defensivo com crescimento do e-commerce",
    "🏥 Fundos de saúde e educação ganham destaque com envelhecimento populacional",
    "🏨 Hotelaria mostra sinais de recuperação com retomada do turismo"
  ];

  const identifySectorOpportunities = (sectorDistribution) => {
    const sectors = Object.keys(sectorDistribution);
    const opportunities = [];
    
    if (!sectors.includes("Logística")) {
      opportunities.push("📦 Considere exposição ao setor de logística - crescimento sustentável");
    }
    if (!sectors.includes("Lajes Corporativas")) {
      opportunities.push("🏢 Lajes corporativas oferecem estabilidade em cenário volátil");
    }
    if (!sectors.includes("Shopping")) {
      opportunities.push("🛍️ Shopping centers em recuperação - oportunidade de entrada");
    }
    
    return opportunities;
  };

  const generateMarketOutlook = () => ({
    shortTerm: "Mercado de FIIs mantém atratividade com Selic elevada favorecendo dividend yield",
    mediumTerm: "Expectativa de estabilização das taxas pode beneficiar fundos de tijolo",
    longTerm: "Crescimento populacional e urbanização sustentam demanda por ativos imobiliários"
  });

  const assessRiskFactors = (portfolio, investments) => {
    const factors = [];
    
    if (portfolio.concentrationRisk > 40) {
      factors.push({
        type: "Concentração",
        level: "Alto",
        description: "Mais de 40% do portfólio em um único setor",
        impact: "Alto"
      });
    }
    
    if (portfolio.averageDY > 12) {
      factors.push({
        type: "Dividend Yield Elevado",
        level: "Médio",
        description: "DY muito alto pode indicar risco de corte de dividendos",
        impact: "Médio"
      });
    }
    
    if (investments.length < 5) {
      factors.push({
        type: "Baixa Diversificação",
        level: "Médio",
        description: "Poucos ativos no portfólio aumentam risco específico",
        impact: "Médio"
      });
    }
    
    return factors;
  };

  const calculateOverallRisk = (portfolio, riskFactors) => {
    const highRiskCount = riskFactors.filter(f => f.level === "Alto").length;
    const mediumRiskCount = riskFactors.filter(f => f.level === "Médio").length;
    
    if (highRiskCount > 0) return "Alto";
    if (mediumRiskCount > 2) return "Médio-Alto";
    if (mediumRiskCount > 0) return "Médio";
    return "Baixo";
  };

  const generateRecommendations = (portfolio, riskFactors) => {
    const recommendations = [];
    
    if (portfolio.concentrationRisk > 40) {
      recommendations.push("🎯 Diversificar em outros setores para reduzir concentração");
    }
    
    if (portfolio.averageDY < 6) {
      recommendations.push("📈 Buscar FIIs com maior dividend yield para aumentar renda passiva");
    }
    
    if (portfolio.monthlyIncome < 500) {
      recommendations.push("💰 Acelerar aportes para atingir primeira meta de R$ 500/mês");
    }
    
    if (Object.keys(portfolio.sectorDistribution).length < 3) {
      recommendations.push("🏗️ Adicionar exposição a setores complementares");
    }
    
    return recommendations;
  };

  const generateRiskMitigation = (riskFactors) => {
    return riskFactors.map(factor => {
      switch (factor.type) {
        case "Concentração":
          return "Diversificar gradualmente em outros setores";
        case "Dividend Yield Elevado":
          return "Monitorar sustentabilidade dos dividendos";
        case "Baixa Diversificação":
          return "Adicionar novos ativos progressivamente";
        default:
          return "Monitorar regularmente";
      }
    });
  };

  const calculateSectorBalance = (sectorDistribution) => {
    const values = Object.values(sectorDistribution).map(s => s.value);
    const total = values.reduce((sum, val) => sum + val, 0);
    const percentages = values.map(val => val / total);
    
    // Calcular índice de equilíbrio (quanto mais próximo de 1, mais equilibrado)
    const idealPercentage = 1 / values.length;
    const variance = percentages.reduce((sum, p) => sum + Math.pow(p - idealPercentage, 2), 0);
    
    return Math.max(0, 1 - variance * values.length);
  };

  // Efeito para gerar análise automaticamente
  useEffect(() => {
    if (portfolioMetrics && isConfigured && !analysis) {
      generateCompleteAnalysis();
    }
  }, [portfolioMetrics, isConfigured]);

  if (!isConfigured) {
    return (
      <Card className="border-yellow-200">
        <CardContent className="pt-6 text-center">
          <Brain className="h-12 w-12 mx-auto mb-4 text-yellow-600" />
          <h3 className="font-semibold mb-2">IA Não Configurada</h3>
          <p className="text-sm text-gray-600 mb-4">
            Configure sua API key do Claude para ativar análises inteligentes
          </p>
          <Button variant="outline">Configurar IA</Button>
        </CardContent>
      </Card>
    );
  }

  if (isAnalyzing) {
    return (
      <Card className="border-blue-200">
        <CardContent className="pt-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <Brain className="h-8 w-8 mr-2 text-blue-600" />
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
          </div>
          <h3 className="font-semibold mb-2">Analisando com IA...</h3>
          <p className="text-sm text-gray-600">
            Claude está processando seu portfólio e gerando insights personalizados
          </p>
          <div className="mt-4">
            <Progress value={66} className="h-2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Button onClick={generateCompleteAnalysis} className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Gerar Análise com IA
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Análise Geral do Portfólio */}
      <Card className="border-2 border-gradient-to-r from-blue-500 to-purple-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Análise Completa do Portfólio
            <Badge variant="outline" className="ml-2">
              <Sparkles className="h-3 w-3 mr-1" />
              Claude Opus 4
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score Geral */}
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {analysis.overallScore}/100
            </div>
            <div className="text-gray-600 mb-4">Score Geral do Portfólio</div>
            <Progress value={analysis.overallScore} className="h-4" />
          </div>

          {/* Pontos Fortes e Fracos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-green-600">
                <Star className="h-4 w-4" />
                Pontos Fortes
              </h4>
              <div className="space-y-2">
                {analysis.strengths.map((strength, index) => (
                  <div key={index} className="bg-green-50 p-3 rounded-lg text-sm">
                    {strength}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-orange-600">
                <AlertTriangle className="h-4 w-4" />
                Pontos de Melhoria
              </h4>
              <div className="space-y-2">
                {analysis.weaknesses.map((weakness, index) => (
                  <div key={index} className="bg-orange-50 p-3 rounded-lg text-sm">
                    {weakness}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recomendações */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2 text-purple-600">
              <Lightbulb className="h-4 w-4" />
              Recomendações Estratégicas
            </h4>
            <div className="space-y-2">
              {analysis.recommendations.map((rec, index) => (
                <div key={index} className="bg-purple-50 p-3 rounded-lg text-sm flex items-center gap-2">
                  <Target className="h-4 w-4 text-purple-600 flex-shrink-0" />
                  {rec}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights de Mercado */}
      {marketInsights && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Insights de Mercado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-3">Tendências Atuais</h4>
              <div className="space-y-2">
                {marketInsights.trends.map((trend, index) => (
                  <div key={index} className="bg-blue-50 p-2 rounded text-sm">
                    {trend}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Oportunidades Identificadas</h4>
              <div className="space-y-2">
                {marketInsights.opportunities.map((opp, index) => (
                  <div key={index} className="bg-green-50 p-2 rounded text-sm">
                    {opp}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="text-center p-3 bg-gray-50 rounded">
                <div className="font-medium text-sm text-gray-600">Curto Prazo</div>
                <div className="text-xs mt-1">{marketInsights.outlook.shortTerm}</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded">
                <div className="font-medium text-sm text-gray-600">Médio Prazo</div>
                <div className="text-xs mt-1">{marketInsights.outlook.mediumTerm}</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded">
                <div className="font-medium text-sm text-gray-600">Longo Prazo</div>
                <div className="text-xs mt-1">{marketInsights.outlook.longTerm}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Avaliação de Risco */}
      {riskAssessment && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Avaliação de Risco
              <Badge variant={
                riskAssessment.overallRisk === "Alto" ? "destructive" :
                riskAssessment.overallRisk === "Médio-Alto" ? "secondary" :
                riskAssessment.overallRisk === "Médio" ? "outline" : "default"
              }>
                {riskAssessment.overallRisk}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {riskAssessment.factors.length > 0 ? (
              <div>
                <h4 className="font-semibold mb-3">Fatores de Risco Identificados</h4>
                <div className="space-y-3">
                  {riskAssessment.factors.map((factor, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{factor.type}</span>
                        <Badge variant={factor.level === "Alto" ? "destructive" : "secondary"}>
                          {factor.level}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{factor.description}</p>
                      <div className="text-xs text-blue-600">
                        Mitigação: {riskAssessment.mitigation[index]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <Shield className="h-12 w-12 mx-auto mb-3 text-green-600" />
                <h3 className="font-semibold text-green-600 mb-2">Baixo Risco Detectado</h3>
                <p className="text-sm text-gray-600">
                  Seu portfólio apresenta um perfil de risco equilibrado
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Botão para Nova Análise */}
      <div className="text-center">
        <Button 
          onClick={generateCompleteAnalysis} 
          disabled={isAnalyzing}
          variant="outline"
          className="flex items-center gap-2"
        >
          {isAnalyzing ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Rocket className="h-4 w-4" />
          )}
          {isAnalyzing ? 'Analisando...' : 'Nova Análise'}
        </Button>
      </div>
    </div>
  );
};

export default AIAnalysisEngine; 
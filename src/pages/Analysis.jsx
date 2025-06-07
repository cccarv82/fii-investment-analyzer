import React, { useState, useEffect } from "react";
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  Target,
  BarChart3,
  Lightbulb,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";

import { useAI } from "../contexts/AIContext";
import { usePortfolio } from "../contexts/PortfolioContext";

const Analysis = () => {
  // ✅ CORREÇÃO: Usar nomes corretos das funções do AIContext
  const {
    isConfigured,
    loading,
    error,
    generateMarketAnalysis, // ✅ Nome correto
    analyzePortfolio,
    clearError,
  } = useAI();

  const { positions, totalInvested, performance, diversification } =
    usePortfolio();

  const [marketAnalysis, setMarketAnalysis] = useState(null);
  const [portfolioAnalysis, setPortfolioAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  // 📊 Carregar análise de mercado
  const loadMarketAnalysis = async () => {
    setAnalysisLoading(true);
    try {
      console.log("🔄 Carregando análise de mercado...");

      // ✅ CORREÇÃO: Usar função correta e passar dados mock se necessário
      const mockMarketData = {
        selic: 10.75,
        inflation: 4.5,
        gdp: 2.1,
        ifix: 2800,
        sectors: ["Logística", "Corporativo", "Shoppings", "Recebíveis"],
      };

      const analysis = await generateMarketAnalysis(mockMarketData);
      setMarketAnalysis(analysis);
      console.log("✅ Análise de mercado carregada:", analysis);
    } catch (error) {
      console.error("❌ Erro ao carregar análise de mercado:", error);

      // ✅ Fallback com dados simulados
      setMarketAnalysis({
        marketSentiment: "NEUTRO",
        outlook:
          "Mercado de FIIs em momento de consolidação com Selic elevada impactando valuations, mas fundamentos setoriais permanecem sólidos.",
        keyTrends: [
          "Selic em 10,75% criando competição direta com FIIs",
          "Setor logístico beneficiado pelo e-commerce",
          "Trabalho híbrido impactando FIIs corporativos",
          "Inflação controlada favorece reajustes contratuais",
        ],
        sectorOutlook: {
          Logística:
            "Perspectiva positiva com crescimento do e-commerce e nearshoring",
          Corporativo: "Cautela devido ao trabalho híbrido permanente",
          Shoppings: "Recuperação gradual com foco em experiência",
          Recebíveis: "Atrativo com spreads bancários elevados",
        },
        opportunities: [
          "FIIs logísticos em regiões de crescimento do e-commerce",
          "Recebíveis com spreads atrativos vs. Selic",
          "Corporativos com certificação ESG",
        ],
        risks: [
          "Selic elevada reduzindo atratividade relativa",
          "Possível recessão impactando ocupação",
          "Inflação descontrolada afetando custos",
        ],
      });
    } finally {
      setAnalysisLoading(false);
    }
  };

  // 📈 Carregar análise de carteira
  const loadPortfolioAnalysis = async () => {
    if (!positions || positions.length === 0) {
      console.log("ℹ️ Nenhuma posição na carteira para analisar");
      return;
    }

    setAnalysisLoading(true);
    try {
      console.log("🔄 Carregando análise de carteira...");

      const userProfile = {
        riskProfile: "moderado",
        investmentGoal: "equilibrado",
        timeHorizon: "médio prazo",
      };

      const analysis = await analyzePortfolio(positions, userProfile);
      setPortfolioAnalysis(analysis);
      console.log("✅ Análise de carteira carregada:", analysis);
    } catch (error) {
      console.error("❌ Erro ao carregar análise de carteira:", error);

      // ✅ Fallback com dados simulados
      setPortfolioAnalysis({
        overallScore: 7.5,
        diversificationScore: 6.8,
        riskScore: 7.2,
        recommendations: [
          "Considere aumentar exposição ao setor logístico",
          "Diversifique geograficamente além de São Paulo",
          "Monitore concentração em poucos FIIs",
        ],
        strengths: [
          "Boa diversificação setorial",
          "Dividend yield médio atrativo",
          "Gestoras de qualidade",
        ],
        weaknesses: [
          "Concentração geográfica em SP",
          "Exposição limitada a recebíveis",
          "Poucos FIIs na carteira",
        ],
        suggestedActions: [
          "Adicionar FII logístico de qualidade",
          "Considerar FII de recebíveis",
          "Rebalancear posições concentradas",
        ],
      });
    } finally {
      setAnalysisLoading(false);
    }
  };

  // 🔄 Carregar análises na inicialização
  useEffect(() => {
    console.log("🚀 Iniciando carregamento de análises...");
    loadMarketAnalysis();

    if (positions && positions.length > 0) {
      loadPortfolioAnalysis();
    }
  }, [positions?.length]); // ✅ Dependência segura

  // 🎨 Funções auxiliares para UI
  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case "POSITIVO":
        return "text-green-600 bg-green-100 dark:bg-green-900";
      case "NEGATIVO":
        return "text-red-600 bg-red-100 dark:bg-red-900";
      default:
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900";
    }
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case "POSITIVO":
        return <TrendingUp className="h-4 w-4" />;
      case "NEGATIVO":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Análises</h1>
          <p className="text-muted-foreground">
            Análises fundamentalistas e insights de mercado
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={loadMarketAnalysis}
            disabled={analysisLoading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${
                analysisLoading ? "animate-spin" : ""
              }`}
            />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Status da IA */}
      {!isConfigured && (
        <Alert>
          <Brain className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>
                Análises com IA não configuradas. Usando dados simulados para
                demonstração.
              </span>
              <Button variant="outline" size="sm" asChild>
                <a href="/settings">Configurar IA</a>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Erro */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            {error}
            <Button variant="ghost" size="sm" onClick={clearError}>
              Fechar
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs defaultValue="market">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="market">Análise de Mercado</TabsTrigger>
          <TabsTrigger value="portfolio">Análise de Carteira</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Análise de Mercado */}
        <TabsContent value="market" className="space-y-4">
          {marketAnalysis ? (
            <>
              {/* Sentimento do Mercado */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Sentimento do Mercado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 mb-4">
                    <Badge
                      className={getSentimentColor(
                        marketAnalysis.marketSentiment
                      )}
                    >
                      {getSentimentIcon(marketAnalysis.marketSentiment)}
                      <span className="ml-1">
                        {marketAnalysis.marketSentiment}
                      </span>
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">
                    {marketAnalysis.outlook}
                  </p>
                </CardContent>
              </Card>

              {/* Tendências Principais */}
              <Card>
                <CardHeader>
                  <CardTitle>Principais Tendências</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {marketAnalysis.keyTrends?.map((trend, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 border rounded-lg"
                      >
                        <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                        <p className="text-sm">{trend}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Perspectivas Setoriais */}
              <Card>
                <CardHeader>
                  <CardTitle>Perspectivas por Setor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {Object.entries(marketAnalysis.sectorOutlook || {}).map(
                      ([sector, outlook]) => (
                        <div key={sector} className="p-4 border rounded-lg">
                          <h4 className="font-medium capitalize mb-2">
                            {sector}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {outlook}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Oportunidades e Riscos */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-600">
                      <Target className="h-5 w-5" />
                      Oportunidades
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {marketAnalysis.opportunities?.map(
                        (opportunity, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-600 mt-2"></div>
                            <p className="text-sm">{opportunity}</p>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                      <AlertTriangle className="h-5 w-5" />
                      Riscos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {marketAnalysis.risks?.map((risk, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-600 mt-2"></div>
                          <p className="text-sm">{risk}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-muted-foreground">
                    Carregando análise de mercado...
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Análise de Carteira */}
        <TabsContent value="portfolio" className="space-y-4">
          {positions && positions.length > 0 ? (
            portfolioAnalysis ? (
              <>
                {/* Scores Gerais */}
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Score Geral
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {portfolioAnalysis.overallScore}/10
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Diversificação
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {portfolioAnalysis.diversificationScore}/10
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Risco
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {portfolioAnalysis.riskScore}/10
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recomendações */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5" />
                      Recomendações
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {portfolioAnalysis.recommendations?.map((rec, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-3 border rounded-lg"
                        >
                          <Lightbulb className="h-5 w-5 text-yellow-600 mt-0.5" />
                          <p className="text-sm">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Pontos Fortes e Fracos */}
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-600">
                        <Target className="h-5 w-5" />
                        Pontos Fortes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {portfolioAnalysis.strengths?.map((strength, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-600 mt-2"></div>
                            <p className="text-sm">{strength}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="h-5 w-5" />
                        Pontos Fracos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {portfolioAnalysis.weaknesses?.map(
                          (weakness, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <div className="w-2 h-2 rounded-full bg-red-600 mt-2"></div>
                              <p className="text-sm">{weakness}</p>
                            </div>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Ações Sugeridas */}
                <Card>
                  <CardHeader>
                    <CardTitle>Ações Sugeridas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {portfolioAnalysis.suggestedActions?.map(
                        (action, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-3 border rounded-lg"
                          >
                            <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                            <p className="text-sm">{action}</p>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-muted-foreground">
                      Analisando sua carteira...
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="text-lg font-medium">
                      Nenhuma posição encontrada
                    </h3>
                    <p className="text-muted-foreground">
                      Adicione FIIs à sua carteira para ver análises detalhadas
                    </p>
                  </div>
                  <Button asChild>
                    <a href="/portfolio">Gerenciar Carteira</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Insights */}
        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Insights Inteligentes
              </CardTitle>
              <CardDescription>
                Análises avançadas e recomendações personalizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">💡 Dica do Momento</h4>
                  <p className="text-sm text-muted-foreground">
                    Com a Selic em 10,75%, FIIs precisam oferecer yield superior
                    a 11% para serem atrativos. Considere FIIs de recebíveis que
                    se beneficiam do spread bancário elevado.
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">📊 Análise Macro</h4>
                  <p className="text-sm text-muted-foreground">
                    O setor logístico continua beneficiado pelo crescimento do
                    e-commerce (+15% a.a.) e tendências de nearshoring. FIIs
                    logísticos em regiões estratégicas apresentam potencial de
                    valorização.
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">⚠️ Atenção</h4>
                  <p className="text-sm text-muted-foreground">
                    FIIs corporativos enfrentam desafios estruturais com o
                    trabalho híbrido permanente. Prefira fundos com contratos
                    longos e inquilinos de alta qualidade.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analysis;

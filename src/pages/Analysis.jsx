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
      const mockUserProfile = {
        riskProfile: "moderado",
        investmentGoal: "equilibrado",
        timeHorizon: "médio prazo",
      };

      const analysis = await generateMarketAnalysis(mockUserProfile);
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

  // ✅ FUNÇÃO AUXILIAR PARA RENDERIZAR DADOS SEGUROS
  const renderSafeContent = (content) => {
    if (typeof content === "string") {
      return content;
    }
    if (typeof content === "object" && content !== null) {
      return JSON.stringify(content);
    }
    return String(content || "");
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
                    {renderSafeContent(marketAnalysis.outlook)}
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
                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                      >
                        <TrendingUp className="h-4 w-4 mt-0.5 text-blue-500" />
                        <span className="text-sm">
                          {renderSafeContent(trend)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Perspectivas Setoriais */}
              <Card>
                <CardHeader>
                  <CardTitle>Perspectivas Setoriais</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {marketAnalysis.sectorOutlook &&
                      Object.entries(marketAnalysis.sectorOutlook).map(
                        ([sector, outlook]) => (
                          <div
                            key={sector}
                            className="p-4 rounded-lg border bg-card"
                          >
                            <h4 className="font-semibold mb-2">{sector}</h4>
                            <p className="text-sm text-muted-foreground">
                              {renderSafeContent(outlook)}
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
                          <div
                            key={index}
                            className="flex items-start gap-2 text-sm"
                          >
                            <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                            <span>{renderSafeContent(opportunity)}</span>
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
                        <div
                          key={index}
                          className="flex items-start gap-2 text-sm"
                        >
                          <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                          <span>{renderSafeContent(risk)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {analysisLoading
                      ? "Carregando análise de mercado..."
                      : "Clique em 'Atualizar' para carregar a análise"}
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
                {/* Scores da Carteira */}
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
                        Gestão de Risco
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
                    <CardTitle>Recomendações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {portfolioAnalysis.recommendations?.map((rec, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-2 text-sm"
                        >
                          <Lightbulb className="h-4 w-4 mt-0.5 text-yellow-500" />
                          <span>{renderSafeContent(rec)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Pontos Fortes e Fracos */}
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-green-600">
                        Pontos Fortes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {portfolioAnalysis.strengths?.map((strength, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-2 text-sm"
                          >
                            <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                            <span>{renderSafeContent(strength)}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-orange-600">
                        Pontos de Atenção
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {portfolioAnalysis.weaknesses?.map(
                          (weakness, index) => (
                            <div
                              key={index}
                              className="flex items-start gap-2 text-sm"
                            >
                              <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                              <span>{renderSafeContent(weakness)}</span>
                            </div>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      {analysisLoading
                        ? "Analisando sua carteira..."
                        : "Clique em 'Atualizar' para analisar sua carteira"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Você ainda não possui FIIs em sua carteira
                  </p>
                  <Button asChild>
                    <a href="/portfolio">Adicionar FIIs</a>
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
                <Lightbulb className="h-5 w-5" />
                Insights Personalizados
              </CardTitle>
              <CardDescription>
                Análises e recomendações baseadas no seu perfil e carteira
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    💡 Dica de Diversificação
                  </h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Com a Selic em 10,75%, considere FIIs com dividend yield
                    acima de 12% para superar a renda fixa. Foque em setores
                    defensivos como logística e recebíveis.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                    📈 Oportunidade de Mercado
                  </h4>
                  <p className="text-sm text-green-800 dark:text-green-200">
                    FIIs logísticos estão se beneficiando do crescimento do
                    e-commerce. Considere aumentar exposição a este setor para
                    capturar o crescimento estrutural.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                  <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                    ⚠️ Atenção ao Risco
                  </h4>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    FIIs corporativos podem enfrentar desafios com o trabalho
                    híbrido permanente. Monitore ocupação e reajustes
                    contratuais.
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

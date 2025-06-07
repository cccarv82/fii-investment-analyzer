import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  BarChart3,
  Lightbulb,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useAI } from '../contexts/AIContext';
import { usePortfolio } from '../contexts/PortfolioContext';

const Analysis = () => {
  const { 
    isConfigured, 
    loading, 
    error, 
    getMarketAnalysis, 
    analyzePortfolio,
    clearError 
  } = useAI();
  
  const { 
    positions, 
    totalInvested, 
    performance, 
    diversification 
  } = usePortfolio();

  const [marketAnalysis, setMarketAnalysis] = useState(null);
  const [portfolioAnalysis, setPortfolioAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  // Carregar análise de mercado
  const loadMarketAnalysis = async () => {
    setAnalysisLoading(true);
    try {
      const analysis = await getMarketAnalysis();
      setMarketAnalysis(analysis);
    } catch (error) {
      console.error('Erro ao carregar análise de mercado:', error);
    } finally {
      setAnalysisLoading(false);
    }
  };

  // Carregar análise de carteira
  const loadPortfolioAnalysis = async () => {
    if (positions.length === 0) return;
    
    setAnalysisLoading(true);
    try {
      const userProfile = {
        riskProfile: 'moderado',
        investmentGoal: 'equilibrado',
        timeHorizon: 'médio prazo'
      };
      
      const analysis = await analyzePortfolio(positions, userProfile);
      setPortfolioAnalysis(analysis);
    } catch (error) {
      console.error('Erro ao carregar análise de carteira:', error);
    } finally {
      setAnalysisLoading(false);
    }
  };

  // Carregar análises na inicialização
  useEffect(() => {
    loadMarketAnalysis();
    if (positions.length > 0) {
      loadPortfolioAnalysis();
    }
  }, [positions.length]);

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'POSITIVO': return 'text-green-600 bg-green-100 dark:bg-green-900';
      case 'NEGATIVO': return 'text-red-600 bg-red-100 dark:bg-red-900';
      default: return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900';
    }
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'POSITIVO': return <TrendingUp className="h-4 w-4" />;
      case 'NEGATIVO': return <AlertTriangle className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
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
            <RefreshCw className={`mr-2 h-4 w-4 ${analysisLoading ? 'animate-spin' : ''}`} />
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
                Análises com IA não configuradas. Usando dados simulados para demonstração.
              </span>
              <Button variant="outline" size="sm" asChild>
                <a href="#settings">Configurar IA</a>
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
                    <Badge className={getSentimentColor(marketAnalysis.marketSentiment)}>
                      {getSentimentIcon(marketAnalysis.marketSentiment)}
                      <span className="ml-1">{marketAnalysis.marketSentiment}</span>
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
                      <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
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
                    {Object.entries(marketAnalysis.sectorOutlook || {}).map(([sector, outlook]) => (
                      <div key={sector} className="p-4 border rounded-lg">
                        <h4 className="font-medium capitalize mb-2">{sector}</h4>
                        <p className="text-sm text-muted-foreground">{outlook}</p>
                      </div>
                    ))}
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
                      {marketAnalysis.opportunities?.map((opportunity, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-600 mt-2"></div>
                          <p className="text-sm">{opportunity}</p>
                        </div>
                      ))}
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
              <CardContent className="flex items-center justify-center h-64">
                {analysisLoading ? (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Carregando análise de mercado...</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Clique em "Atualizar" para carregar a análise</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Análise de Carteira */}
        <TabsContent value="portfolio" className="space-y-4">
          {positions.length > 0 ? (
            portfolioAnalysis ? (
              <>
                {/* Score de Diversificação */}
                <Card>
                  <CardHeader>
                    <CardTitle>Score de Diversificação</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="text-3xl font-bold text-primary">
                        {portfolioAnalysis.diversificationScore || diversification}/10
                      </div>
                      <div className="flex-1">
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${(portfolioAnalysis.diversificationScore || diversification) * 10}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {portfolioAnalysis.overallAssessment || 'Carteira com boa diversificação'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recomendações */}
                {portfolioAnalysis.recommendations && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Recomendações para sua Carteira</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {portfolioAnalysis.recommendations.map((rec, index) => (
                          <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                            <div className={`w-2 h-2 rounded-full mt-2 ${
                              rec.action === 'ADICIONAR' ? 'bg-green-600' :
                              rec.action === 'REDUZIR' ? 'bg-red-600' : 'bg-blue-600'
                            }`}></div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{rec.action}</span>
                                <Badge variant="outline">{rec.ticker}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{rec.reasoning}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Riscos de Concentração */}
                {portfolioAnalysis.concentrationRisks && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-orange-600">
                        <AlertTriangle className="h-5 w-5" />
                        Riscos de Concentração
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {portfolioAnalysis.concentrationRisks.map((risk, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-orange-600 mt-2"></div>
                            <p className="text-sm">{risk}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center h-64">
                  {analysisLoading ? (
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Analisando sua carteira...</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Análise de Carteira</h3>
                      <p className="text-muted-foreground mb-4">
                        Obtenha insights detalhados sobre sua carteira de FIIs
                      </p>
                      <Button onClick={loadPortfolioAnalysis}>
                        <Brain className="mr-2 h-4 w-4" />
                        Analisar Carteira
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64">
                <BarChart3 className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Carteira Vazia</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Adicione investimentos à sua carteira para ver análises detalhadas
                </p>
                <Button variant="outline" asChild>
                  <a href="#portfolio">Ir para Carteira</a>
                </Button>
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
                Insights e Dicas
              </CardTitle>
              <CardDescription>
                Conhecimentos úteis sobre investimento em FIIs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Diversificação Setorial</h4>
                  <p className="text-sm text-muted-foreground">
                    Mantenha sua carteira diversificada entre diferentes setores para reduzir riscos específicos.
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Análise de Indicadores</h4>
                  <p className="text-sm text-muted-foreground">
                    Observe P/VP, dividend yield e taxa de vacância para avaliar a qualidade dos FIIs.
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Reinvestimento de Dividendos</h4>
                  <p className="text-sm text-muted-foreground">
                    Considere reinvestir os dividendos recebidos para acelerar o crescimento da carteira.
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Acompanhamento Regular</h4>
                  <p className="text-sm text-muted-foreground">
                    Revise sua carteira periodicamente e ajuste conforme mudanças no mercado.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Links Úteis */}
          <Card>
            <CardHeader>
              <CardTitle>Recursos Externos</CardTitle>
              <CardDescription>
                Links úteis para pesquisa e análise de FIIs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="https://www.b3.com.br/pt_br/produtos-e-servicos/negociacao/renda-variavel/fundos-de-investimento/fii/" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Portal de FIIs da B3
                  </a>
                </Button>
                
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="https://dados.cvm.gov.br/" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Dados Abertos CVM
                  </a>
                </Button>
                
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="https://www.anbima.com.br/" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    ANBIMA
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analysis;


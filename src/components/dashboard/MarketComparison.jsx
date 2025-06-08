import React, { useState, useEffect, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Target,
  Award,
  Activity,
  Zap,
  Eye,
  RefreshCw,
  Crown,
  Star,
  Shield
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";

const MarketComparison = ({ portfolioMetrics, investments }) => {
  const [marketData, setMarketData] = useState(null);
  const [benchmarkComparison, setBenchmarkComparison] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Simular dados de mercado (em produção, viria de uma API)
  const generateMarketData = () => {
    return {
      ifix: {
        name: "IFIX",
        performance: 8.5,
        dividendYield: 8.2,
        volatility: 15.3,
        sharpeRatio: 0.45
      },
      fiis: {
        averagePerformance: 6.8,
        averageDY: 8.8,
        topPerformers: [
          { ticker: "HGLG11", performance: 18.5, dy: 9.2 },
          { ticker: "XPML11", performance: 16.3, dy: 8.7 },
          { ticker: "BTLG11", performance: 14.8, dy: 9.5 },
          { ticker: "VILG11", performance: 13.2, dy: 8.9 },
          { ticker: "KNRI11", performance: 12.7, dy: 9.1 }
        ],
        sectorPerformance: {
          "Lajes Corporativas": { performance: 9.2, dy: 8.5 },
          "Shopping": { performance: 4.3, dy: 9.2 },
          "Logística": { performance: 12.1, dy: 8.1 },
          "Residencial": { performance: 6.7, dy: 8.9 },
          "Híbrido": { performance: 8.8, dy: 8.7 }
        }
      },
      selic: 11.75,
      cdi: 11.65,
      ipca: 4.62
    };
  };

  // Calcular comparação com benchmarks
  const calculateBenchmarkComparison = (portfolio, market) => {
    if (!portfolio) return null;

    const portfolioPerformance = portfolio.performance;
    const portfolioDY = portfolio.averageDY;
    
    return {
      vsIFIX: {
        performance: portfolioPerformance - market.ifix.performance,
        dividendYield: portfolioDY - market.ifix.dividendYield,
        status: portfolioPerformance > market.ifix.performance ? "superior" : "inferior"
      },
      vsMarket: {
        performance: portfolioPerformance - market.fiis.averagePerformance,
        dividendYield: portfolioDY - market.fiis.averageDY,
        status: portfolioPerformance > market.fiis.averagePerformance ? "superior" : "inferior"
      },
      vsSelic: {
        realReturn: portfolioDY - market.selic,
        status: portfolioDY > market.selic ? "superior" : "inferior"
      },
      riskAdjusted: {
        sharpeRatio: calculateSharpeRatio(portfolioPerformance, portfolioDY, market.selic),
        classification: classifyRiskReturn(portfolioPerformance, portfolioDY)
      }
    };
  };

  const calculateSharpeRatio = (performance, dy, riskFreeRate) => {
    // Simplificado: (retorno - taxa livre de risco) / volatilidade estimada
    const excessReturn = dy - riskFreeRate;
    const estimatedVolatility = 15; // Estimativa baseada no mercado de FIIs
    return excessReturn / estimatedVolatility;
  };

  const classifyRiskReturn = (performance, dy) => {
    if (dy > 10 && performance > 10) return "Alto Retorno / Alto Risco";
    if (dy > 8 && performance > 5) return "Retorno Moderado / Risco Moderado";
    if (dy > 6 && performance > 0) return "Retorno Conservador / Baixo Risco";
    return "Retorno Baixo / Risco Variável";
  };

  // Dados para gráfico radar
  const radarData = useMemo(() => {
    if (!portfolioMetrics || !marketData) return null;

    return [
      {
        subject: 'Performance',
        portfolio: Math.max(0, Math.min(100, (portfolioMetrics.performance + 20) * 2.5)),
        market: Math.max(0, Math.min(100, (marketData.fiis.averagePerformance + 20) * 2.5)),
        ifix: Math.max(0, Math.min(100, (marketData.ifix.performance + 20) * 2.5))
      },
      {
        subject: 'Dividend Yield',
        portfolio: Math.max(0, Math.min(100, portfolioMetrics.averageDY * 8)),
        market: Math.max(0, Math.min(100, marketData.fiis.averageDY * 8)),
        ifix: Math.max(0, Math.min(100, marketData.ifix.dividendYield * 8))
      },
      {
        subject: 'Diversificação',
        portfolio: portfolioMetrics.diversificationScore,
        market: 70, // Estimativa para mercado
        ifix: 85 // IFIX é bem diversificado
      },
      {
        subject: 'Qualidade',
        portfolio: Math.max(0, 100 - portfolioMetrics.concentrationRisk),
        market: 75,
        ifix: 80
      }
    ];
  }, [portfolioMetrics, marketData]);

  // Carregar dados de mercado
  useEffect(() => {
    setIsLoading(true);
    // Simular carregamento
    setTimeout(() => {
      const market = generateMarketData();
      setMarketData(market);
      
      if (portfolioMetrics) {
        const comparison = calculateBenchmarkComparison(portfolioMetrics, market);
        setBenchmarkComparison(comparison);
      }
      
      setIsLoading(false);
    }, 1000);
  }, [portfolioMetrics]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg font-medium">Carregando dados de mercado...</p>
        </CardContent>
      </Card>
    );
  }

  if (!marketData || !benchmarkComparison) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Dados de mercado não disponíveis</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-gradient-to-r from-green-500 to-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Comparação com Mercado
            <Badge variant="outline">Benchmarks</Badge>
          </CardTitle>
          <CardDescription>
            Compare seu portfólio com os principais índices e médias do mercado
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Cards de Comparação */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* vs IFIX */}
        <Card className={`border-2 ${benchmarkComparison.vsIFIX.status === 'superior' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Crown className="h-5 w-5" />
              vs IFIX
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Performance</span>
                <div className="flex items-center gap-1">
                  {benchmarkComparison.vsIFIX.performance >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`font-bold ${benchmarkComparison.vsIFIX.performance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {benchmarkComparison.vsIFIX.performance > 0 ? '+' : ''}{benchmarkComparison.vsIFIX.performance.toFixed(1)}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Dividend Yield</span>
                <div className="flex items-center gap-1">
                  {benchmarkComparison.vsIFIX.dividendYield >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`font-bold ${benchmarkComparison.vsIFIX.dividendYield >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {benchmarkComparison.vsIFIX.dividendYield > 0 ? '+' : ''}{benchmarkComparison.vsIFIX.dividendYield.toFixed(1)}%
                  </span>
                </div>
              </div>

              <Badge variant={benchmarkComparison.vsIFIX.status === 'superior' ? 'default' : 'secondary'} className="w-full justify-center">
                {benchmarkComparison.vsIFIX.status === 'superior' ? '🏆 Superior' : '📊 Inferior'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* vs Mercado */}
        <Card className={`border-2 ${benchmarkComparison.vsMarket.status === 'superior' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              vs Mercado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Performance</span>
                <div className="flex items-center gap-1">
                  {benchmarkComparison.vsMarket.performance >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`font-bold ${benchmarkComparison.vsMarket.performance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {benchmarkComparison.vsMarket.performance > 0 ? '+' : ''}{benchmarkComparison.vsMarket.performance.toFixed(1)}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Dividend Yield</span>
                <div className="flex items-center gap-1">
                  {benchmarkComparison.vsMarket.dividendYield >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`font-bold ${benchmarkComparison.vsMarket.dividendYield >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {benchmarkComparison.vsMarket.dividendYield > 0 ? '+' : ''}{benchmarkComparison.vsMarket.dividendYield.toFixed(1)}%
                  </span>
                </div>
              </div>

              <Badge variant={benchmarkComparison.vsMarket.status === 'superior' ? 'default' : 'secondary'} className="w-full justify-center">
                {benchmarkComparison.vsMarket.status === 'superior' ? '🚀 Acima da Média' : '📈 Abaixo da Média'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* vs Selic */}
        <Card className={`border-2 ${benchmarkComparison.vsSelic.status === 'superior' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5" />
              vs Selic
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-2xl font-bold mb-1">
                  {marketData.selic}%
                </div>
                <div className="text-sm text-gray-600">Taxa Selic</div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Seu DY</span>
                <span className="font-bold">{portfolioMetrics.averageDY.toFixed(2)}%</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Diferença</span>
                <div className="flex items-center gap-1">
                  {benchmarkComparison.vsSelic.realReturn >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`font-bold ${benchmarkComparison.vsSelic.realReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {benchmarkComparison.vsSelic.realReturn > 0 ? '+' : ''}{benchmarkComparison.vsSelic.realReturn.toFixed(1)}%
                  </span>
                </div>
              </div>

              <Badge variant={benchmarkComparison.vsSelic.status === 'superior' ? 'default' : 'secondary'} className="w-full justify-center">
                {benchmarkComparison.vsSelic.status === 'superior' ? '💰 Rentável' : '⚠️ Abaixo Selic'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico Radar */}
      {radarData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Análise Multidimensional
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar
                  name="Seu Portfólio"
                  dataKey="portfolio"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Radar
                  name="Mercado"
                  dataKey="market"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Radar
                  name="IFIX"
                  dataKey="ifix"
                  stroke="#ffc658"
                  fill="#ffc658"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Top Performers do Mercado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Top Performers do Mercado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {marketData.fiis.topPerformers.map((fii, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{index + 1}º</Badge>
                  <span className="font-medium">{fii.ticker}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Performance</div>
                    <div className="font-bold text-green-600">{fii.performance.toFixed(1)}%</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">DY</div>
                    <div className="font-bold text-blue-600">{fii.dy.toFixed(1)}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance por Setor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Performance por Setor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(marketData.fiis.sectorPerformance).map(([sector, data]) => (
              <div key={sector} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{sector}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm">
                      Performance: <span className="font-bold text-green-600">{data.performance.toFixed(1)}%</span>
                    </span>
                    <span className="text-sm">
                      DY: <span className="font-bold text-blue-600">{data.dy.toFixed(1)}%</span>
                    </span>
                  </div>
                </div>
                <Progress value={(data.performance + 10) * 5} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Análise de Risco-Retorno */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Análise de Risco-Retorno
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-2">Índice Sharpe</h3>
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {benchmarkComparison.riskAdjusted.sharpeRatio.toFixed(2)}
              </div>
              <p className="text-sm text-gray-600">
                Retorno ajustado ao risco
              </p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <h3 className="font-semibold mb-2">Classificação</h3>
              <Badge variant="outline" className="mb-2">
                {benchmarkComparison.riskAdjusted.classification}
              </Badge>
              <p className="text-sm text-gray-600">
                Perfil de risco-retorno
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketComparison; 
import React, { useState, useEffect, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Globe,
  Crown,
  Activity,
  Zap,
  AlertTriangle,
  Target,
  Calendar,
  Clock,
  Building,
  Factory,
  Home,
  ShoppingCart,
  Fuel,
  Briefcase,
  PieChart,
  LineChart
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart
} from "recharts";

const EconomicIndicators = ({ portfolioMetrics, investments, marketData }) => {
  const [indicators, setIndicators] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("12m");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Categorias de indicadores
  const categories = {
    all: "Todos",
    monetary: "Política Monetária",
    inflation: "Inflação",
    employment: "Emprego",
    gdp: "PIB e Crescimento",
    external: "Setor Externo",
    fiscal: "Política Fiscal"
  };

  // Gerar dados dos indicadores econômicos
  useEffect(() => {
    const generateIndicators = () => {
      setIsLoading(true);

      // Simular delay de carregamento
      setTimeout(() => {
        const periods = {
          "3m": 3,
          "6m": 6,
          "12m": 12,
          "24m": 24
        };

        const months = periods[selectedPeriod];
        const now = new Date();

        // Gerar dados históricos
        const historicalData = [];
        for (let i = months; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          
          historicalData.push({
            date: date.toISOString(),
            month: date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
            selic: 11.75 + (Math.random() - 0.5) * 2,
            ipca: 4.2 + (Math.random() - 0.5) * 1.5,
            igpm: 3.8 + (Math.random() - 0.5) * 2,
            unemployment: 8.5 + (Math.random() - 0.5) * 1,
            gdp: 2.1 + (Math.random() - 0.5) * 1.5,
            exchangeRate: 5.20 + (Math.random() - 0.5) * 0.5,
            commodities: 100 + (Math.random() - 0.5) * 20,
            industrialProduction: 102 + (Math.random() - 0.5) * 10,
            retailSales: 105 + (Math.random() - 0.5) * 8,
            consumerConfidence: 95 + (Math.random() - 0.5) * 15
          });
        }

        // Indicadores principais
        const mainIndicators = {
          selic: {
            name: "Taxa Selic",
            current: 11.75,
            previous: 11.25,
            target: 11.50,
            category: "monetary",
            unit: "%",
            trend: "stable",
            impact: "high",
            nextMeeting: "2024-02-15",
            description: "Taxa básica de juros da economia brasileira"
          },
          ipca: {
            name: "IPCA (Inflação)",
            current: 4.2,
            previous: 4.5,
            target: 3.0,
            category: "inflation",
            unit: "%",
            trend: "down",
            impact: "high",
            nextRelease: "2024-02-08",
            description: "Índice Nacional de Preços ao Consumidor Amplo"
          },
          igpm: {
            name: "IGP-M",
            current: 3.8,
            previous: 4.1,
            target: 3.5,
            category: "inflation",
            unit: "%",
            trend: "down",
            impact: "medium",
            nextRelease: "2024-02-01",
            description: "Índice Geral de Preços do Mercado"
          },
          unemployment: {
            name: "Taxa de Desemprego",
            current: 8.5,
            previous: 8.8,
            target: 8.0,
            category: "employment",
            unit: "%",
            trend: "down",
            impact: "medium",
            nextRelease: "2024-02-20",
            description: "Taxa de desocupação da população"
          },
          gdp: {
            name: "PIB (Crescimento)",
            current: 2.1,
            previous: 1.8,
            target: 2.5,
            category: "gdp",
            unit: "%",
            trend: "up",
            impact: "high",
            nextRelease: "2024-03-01",
            description: "Produto Interno Bruto - crescimento anual"
          },
          exchangeRate: {
            name: "Câmbio USD/BRL",
            current: 5.20,
            previous: 5.35,
            target: 5.00,
            category: "external",
            unit: "R$",
            trend: "down",
            impact: "medium",
            nextRelease: "Tempo real",
            description: "Taxa de câmbio Dólar/Real"
          },
          commodities: {
            name: "Índice de Commodities",
            current: 105.2,
            previous: 108.5,
            target: 100.0,
            category: "external",
            unit: "pts",
            trend: "down",
            impact: "medium",
            nextRelease: "Diário",
            description: "Índice de preços de commodities"
          },
          industrialProduction: {
            name: "Produção Industrial",
            current: 102.5,
            previous: 101.8,
            target: 105.0,
            category: "gdp",
            unit: "índice",
            trend: "up",
            impact: "medium",
            nextRelease: "2024-02-10",
            description: "Índice de produção industrial"
          }
        };

        // Análise setorial
        const sectoralAnalysis = {
          realEstate: {
            name: "Setor Imobiliário",
            score: 72,
            trend: "up",
            factors: [
              { name: "Taxa de Juros", impact: -15, description: "Juros altos pressionam financiamentos" },
              { name: "Inflação", impact: -8, description: "Inflação afeta custos de construção" },
              { name: "Emprego", impact: 12, description: "Melhora no emprego favorece demanda" },
              { name: "Renda", impact: 8, description: "Crescimento da renda impulsiona setor" }
            ]
          },
          logistics: {
            name: "Logística",
            score: 78,
            trend: "up",
            factors: [
              { name: "E-commerce", impact: 20, description: "Crescimento do comércio eletrônico" },
              { name: "PIB", impact: 15, description: "Crescimento econômico favorece logística" },
              { name: "Combustível", impact: -5, description: "Preços de combustível estáveis" },
              { name: "Infraestrutura", impact: 10, description: "Investimentos em infraestrutura" }
            ]
          },
          retail: {
            name: "Varejo/Shopping",
            score: 65,
            trend: "stable",
            factors: [
              { name: "Confiança do Consumidor", impact: 8, description: "Confiança em recuperação" },
              { name: "Desemprego", impact: -12, description: "Desemprego ainda elevado" },
              { name: "Crédito", impact: -8, description: "Crédito mais caro" },
              { name: "Renda", impact: 10, description: "Renda real em recuperação" }
            ]
          }
        };

        // Impacto nos FIIs
        const fiiImpact = {
          papelCredito: {
            name: "FIIs de Papel/Crédito",
            score: 45,
            trend: "down",
            mainFactors: ["Taxa Selic", "Spread de Crédito", "Inadimplência"],
            recommendation: "Cautela - juros altos pressionam o setor"
          },
          lajesCorporativas: {
            name: "Lajes Corporativas",
            score: 68,
            trend: "up",
            mainFactors: ["Ocupação", "Preços de Aluguel", "Demanda Corporativa"],
            recommendation: "Positivo - recuperação do mercado corporativo"
          },
          logistica: {
            name: "Logística",
            score: 82,
            trend: "up",
            mainFactors: ["E-commerce", "PIB", "Infraestrutura"],
            recommendation: "Muito positivo - setor aquecido"
          },
          shopping: {
            name: "Shopping Centers",
            score: 62,
            trend: "stable",
            mainFactors: ["Consumo", "Confiança", "Emprego"],
            recommendation: "Neutro - recuperação gradual"
          }
        };

        // Alertas econômicos
        const economicAlerts = [
          {
            type: "warning",
            title: "Selic Mantida em Patamar Alto",
            description: "Taxa básica de juros permanece elevada, impactando FIIs de papel",
            impact: "FIIs de Papel",
            severity: "medium",
            timeframe: "Próximos 6 meses"
          },
          {
            type: "positive",
            title: "Inflação em Desaceleração",
            description: "IPCA mostra tendência de queda, favorecendo investimentos",
            impact: "Mercado Geral",
            severity: "low",
            timeframe: "Curto prazo"
          },
          {
            type: "info",
            title: "PIB em Recuperação",
            description: "Crescimento econômico favorece setores cíclicos",
            impact: "Logística e Lajes",
            severity: "low",
            timeframe: "Médio prazo"
          }
        ];

        setIndicators({
          main: mainIndicators,
          historical: historicalData,
          sectoral: sectoralAnalysis,
          fiiImpact,
          alerts: economicAlerts,
          lastUpdate: new Date()
        });

        setIsLoading(false);
      }, 1500);
    };

    generateIndicators();
  }, [selectedPeriod]);

  // Filtrar indicadores por categoria
  const filteredIndicators = useMemo(() => {
    if (!indicators || selectedCategory === "all") return indicators?.main;
    
    return Object.fromEntries(
      Object.entries(indicators.main).filter(([key, indicator]) => 
        indicator.category === selectedCategory
      )
    );
  }, [indicators, selectedCategory]);

  // Obter cor da tendência
  const getTrendColor = (trend) => {
    switch (trend) {
      case "up": return "text-green-600";
      case "down": return "text-red-600";
      case "stable": return "text-gray-600";
      default: return "text-gray-600";
    }
  };

  // Obter ícone da tendência
  const getTrendIcon = (trend) => {
    switch (trend) {
      case "up": return <TrendingUp className="h-4 w-4" />;
      case "down": return <TrendingDown className="h-4 w-4" />;
      case "stable": return <Target className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  // Obter cor do impacto
  const getImpactColor = (impact) => {
    switch (impact) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Globe className="h-12 w-12 mx-auto mb-4 text-blue-600 animate-pulse" />
          <p className="text-gray-600">Carregando indicadores econômicos...</p>
          <Progress value={65} className="w-64 mx-auto mt-4" />
        </CardContent>
      </Card>
    );
  }

  if (!indicators) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Erro ao carregar indicadores econômicos</p>
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
            <Globe className="h-6 w-6" />
            Economic Indicators Dashboard
            <Crown className="h-5 w-5 text-green-600" />
            <Badge variant="outline" className="border-green-500 text-green-700">
              <Activity className="h-3 w-3 mr-1" />
              Tempo Real
            </Badge>
          </CardTitle>
          <CardDescription>
            Análise macroeconômica completa com impacto nos FIIs
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Controles */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Período */}
            <div>
              <label className="text-sm font-medium mb-3 block flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Período de Análise
              </label>
              <div className="flex gap-2">
                {Object.entries({
                  "3m": "3 meses",
                  "6m": "6 meses", 
                  "12m": "12 meses",
                  "24m": "24 meses"
                }).map(([key, label]) => (
                  <Button
                    key={key}
                    variant={selectedPeriod === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedPeriod(key)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Categoria */}
            <div>
              <label className="text-sm font-medium mb-3 block flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Categoria
              </label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(categories).map(([key, label]) => (
                  <Button
                    key={key}
                    variant={selectedCategory === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(key)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Indicadores Principais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Indicadores Principais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(filteredIndicators || {}).map(([key, indicator]) => (
              <div key={key} className="p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{indicator.name}</span>
                  <Badge className={getImpactColor(indicator.impact)}>
                    {indicator.impact}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      {indicator.current.toFixed(indicator.unit === "R$" ? 2 : 1)}
                      <span className="text-sm font-normal ml-1">{indicator.unit}</span>
                    </span>
                    <div className={`flex items-center gap-1 ${getTrendColor(indicator.trend)}`}>
                      {getTrendIcon(indicator.trend)}
                      <span className="text-sm font-medium">
                        {((indicator.current - indicator.previous) / indicator.previous * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-600 space-y-1">
                    <div>Anterior: {indicator.previous.toFixed(1)}{indicator.unit}</div>
                    <div>Meta: {indicator.target.toFixed(1)}{indicator.unit}</div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {indicator.nextRelease}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gráficos Históricos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            Evolução Histórica
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={indicators.historical}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip 
                formatter={(value, name) => [`${value.toFixed(2)}%`, name]}
              />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="selic" 
                stroke="#8884d8" 
                strokeWidth={2}
                name="Selic (%)"
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="ipca" 
                stroke="#82ca9d" 
                strokeWidth={2}
                name="IPCA (%)"
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="gdp" 
                stroke="#ffc658" 
                strokeWidth={2}
                name="PIB (%)"
              />
              <Bar 
                yAxisId="right"
                dataKey="unemployment" 
                fill="#ff7300" 
                opacity={0.6}
                name="Desemprego (%)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Análise Setorial */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Factory className="h-5 w-5" />
            Análise Setorial
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(indicators.sectoral).map(([key, sector]) => (
              <div key={key} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold">{sector.name}</h4>
                    <Badge variant="outline" className={getTrendColor(sector.trend)}>
                      {getTrendIcon(sector.trend)}
                      {sector.trend}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{sector.score}</div>
                    <div className="text-sm text-gray-600">Score</div>
                  </div>
                </div>

                <div className="space-y-3">
                  {sector.factors.map((factor, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{factor.name}</div>
                        <div className="text-xs text-gray-600">{factor.description}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${
                          factor.impact > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {factor.impact > 0 ? '+' : ''}{factor.impact}
                        </span>
                        <Progress 
                          value={Math.abs(factor.impact) * 2} 
                          className="h-2 w-16"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Impacto nos FIIs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Impacto nos FIIs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(indicators.fiiImpact).map(([key, fii]) => (
              <div key={key} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">{fii.name}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold">{fii.score}</span>
                    <div className={getTrendColor(fii.trend)}>
                      {getTrendIcon(fii.trend)}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="text-sm text-gray-600">Principais Fatores:</div>
                  <div className="flex flex-wrap gap-1">
                    {fii.mainFactors.map((factor, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {factor}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="text-sm p-2 bg-white rounded border-l-4 border-blue-500">
                  <strong>Recomendação:</strong> {fii.recommendation}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alertas Econômicos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Alertas Econômicos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {indicators.alerts.map((alert, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  alert.type === "warning" ? 'border-yellow-500 bg-yellow-50' :
                  alert.type === "positive" ? 'border-green-500 bg-green-50' :
                  'border-blue-500 bg-blue-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {alert.type === "warning" ? <AlertTriangle className="h-4 w-4 text-yellow-600" /> :
                       alert.type === "positive" ? <TrendingUp className="h-4 w-4 text-green-600" /> :
                       <Target className="h-4 w-4 text-blue-600" />}
                      <span className="font-semibold">{alert.title}</span>
                      <Badge variant="outline">{alert.severity}</Badge>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{alert.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <span>Impacto: {alert.impact}</span>
                      <span>Prazo: {alert.timeframe}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resumo Executivo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Resumo Executivo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-green-600">Cenário Positivo</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  Inflação em desaceleração
                </li>
                <li className="flex items-center gap-2">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  PIB em recuperação
                </li>
                <li className="flex items-center gap-2">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  Setor de logística aquecido
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-yellow-600">Pontos de Atenção</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3 text-yellow-600" />
                  Taxa Selic ainda elevada
                </li>
                <li className="flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3 text-yellow-600" />
                  Desemprego acima da meta
                </li>
                <li className="flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3 text-yellow-600" />
                  Recuperação do varejo lenta
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-red-600">Riscos</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <TrendingDown className="h-3 w-3 text-red-600" />
                  Pressão nos FIIs de papel
                </li>
                <li className="flex items-center gap-2">
                  <TrendingDown className="h-3 w-3 text-red-600" />
                  Volatilidade cambial
                </li>
                <li className="flex items-center gap-2">
                  <TrendingDown className="h-3 w-3 text-red-600" />
                  Incertezas externas
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 text-blue-800 mb-2">
              <Target className="h-4 w-4" />
              <span className="font-medium">Recomendação Geral</span>
            </div>
            <p className="text-sm text-blue-700">
              Cenário misto com oportunidades seletivas. Favorecer FIIs de logística e lajes corporativas. 
              Cautela com FIIs de papel devido aos juros altos. Monitorar evolução da inflação e política monetária.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EconomicIndicators; 
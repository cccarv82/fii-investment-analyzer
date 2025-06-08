import React, { useState, useEffect, useMemo } from "react";
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Calendar,
  Target,
  Award,
  AlertTriangle,
  Zap,
  BarChart3,
  Activity,
  Briefcase,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Sparkles,
  Building2,
  Percent,
  Clock,
  Star,
  Brain,
  Trophy,
  Rocket,
  Calculator,
  Shield,
  Flame,
  Gem,
  Crown,
  Grid3X3,
  Bell,
  Globe,
  FileText,
  TrendingDown as TrendingDownIcon
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import {
  formatCurrency,
  formatPercentage,
  formatDate,
} from "../lib/utils/formatters";
import { usePortfolio } from "../contexts/PortfolioContext";
import { useAI } from "../contexts/AIContext";
import AIAnalysisEngine from "../components/dashboard/AIAnalysisEngine";
import InvestmentSimulator from "../components/dashboard/InvestmentSimulator";
import MarketComparison from "../components/dashboard/MarketComparison";
import TopPerformers from "../components/dashboard/TopPerformers";
import {
  PieChart as RechartsPieChart,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  Area,
  AreaChart,
  Pie
} from "recharts";
import {
  Alert,
  AlertDescription
} from "../components/ui/alert";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import FutureProjections from '../components/dashboard/FutureProjections';
import PerformanceAnalytics from '../components/dashboard/PerformanceAnalytics';
import SectorHeatmap from '../components/dashboard/SectorHeatmap';
import SmartAlerts from '../components/dashboard/SmartAlerts';
import EconomicIndicators from '../components/dashboard/EconomicIndicators';
import ProfessionalReports from '../components/dashboard/ProfessionalReports';

const Dashboard = () => {
  const {
    currentPortfolio,
    loading,
    error,
    getPortfolioStats,
    refreshCurrentPortfolioPrices,
  } = usePortfolio();

  const {
    isConfigured: aiConfigured,
    generateSuggestions,
    loading: aiLoading
  } = useAI();

  const [refreshingPrices, setRefreshingPrices] = useState(false);
  const [insights, setInsights] = useState([]);

  // Estados para funcionalidades épicas
  const [activeTab, setActiveTab] = useState("overview");
  const [smartAlerts, setSmartAlerts] = useState([]);
  const [marketComparison, setMarketComparison] = useState(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  // 🚀 CORREÇÃO: Memoizar stats para evitar loop infinito
  const stats = useMemo(() => {
    return getPortfolioStats(currentPortfolio);
  }, [currentPortfolio, getPortfolioStats]);
  
  // Dados derivados para análises avançadas
  const portfolioData = useMemo(() => {
    return currentPortfolio?.investments?.filter(inv => inv.is_active) || [];
  }, [currentPortfolio?.investments]);
  
  // 🚀 ANÁLISES AVANÇADAS
  const advancedAnalytics = React.useMemo(() => {
    if (!portfolioData.length) return null;

    // Análise por setor
    const sectorAnalysis = portfolioData.reduce((acc, inv) => {
      const sector = inv.sector || 'Outros';
      const value = inv.current_value || inv.total_invested || 0;
      
      if (!acc[sector]) {
        acc[sector] = { value: 0, count: 0, investments: [] };
      }
      
      acc[sector].value += value;
      acc[sector].count += 1;
      acc[sector].investments.push(inv);
      
      return acc;
    }, {});

    // Top performers
    const performers = portfolioData
      .map(inv => {
        const invested = inv.total_invested || 0;
        const current = inv.current_value || invested;
        const performance = invested > 0 ? ((current - invested) / invested) * 100 : 0;
        
        return {
          ...inv,
          performance,
          gain: current - invested,
        };
      })
      .sort((a, b) => b.performance - a.performance);

    // Análise de dividend yield
    const dyAnalysis = portfolioData
      .filter(inv => inv.dividend_yield > 0)
      .map(inv => ({
        ticker: inv.ticker,
        dy: inv.dividend_yield,
        monthlyIncome: (inv.current_value || inv.total_invested || 0) * (inv.dividend_yield / 100) / 12,
      }))
      .sort((a, b) => b.dy - a.dy);

    // Concentração da carteira
    const totalValue = stats.currentValue || 0;
    const concentration = portfolioData
      .map(inv => {
        const value = inv.current_value || inv.total_invested || 0;
        return {
          ticker: inv.ticker,
          percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
          value,
        };
      })
      .sort((a, b) => b.percentage - a.percentage);

    return {
      sectorAnalysis,
      topPerformers: performers.slice(0, 3),
      worstPerformers: performers.slice(-3).reverse(),
      dyAnalysis: dyAnalysis.slice(0, 5),
      concentration: concentration.slice(0, 5),
      diversification: {
        sectors: Object.keys(sectorAnalysis).length,
        investments: portfolioData.length,
        maxConcentration: concentration[0]?.percentage || 0,
      },
    };
  }, [portfolioData, stats]);

  // 🧠 INSIGHTS INTELIGENTES
  useEffect(() => {
    if (!advancedAnalytics) return;

    const newInsights = [];
    const { diversification, concentration, topPerformers, worstPerformers, dyAnalysis } = advancedAnalytics;

    // Insight de concentração
    if (diversification.maxConcentration > 40) {
      newInsights.push({
        type: 'warning',
        icon: AlertTriangle,
        title: 'Alta Concentração',
        message: `${concentration[0]?.ticker} representa ${diversification.maxConcentration.toFixed(1)}% da carteira. Considere diversificar.`,
      });
    }

    // Insight de diversificação
    if (diversification.sectors < 3) {
      newInsights.push({
        type: 'info',
        icon: Target,
        title: 'Oportunidade de Diversificação',
        message: `Carteira concentrada em ${diversification.sectors} setor(es). Considere diversificar em outros segmentos.`,
      });
    }

    // Insight de performance
    if (topPerformers[0]?.performance > 10) {
      newInsights.push({
        type: 'success',
        icon: TrendingUp,
        title: 'Excelente Performance',
        message: `${topPerformers[0].ticker} está com +${topPerformers[0].performance.toFixed(1)}% de valorização!`,
      });
    }

    // Insight de dividend yield
    if (dyAnalysis[0]?.dy > 10) {
      newInsights.push({
        type: 'success',
        icon: DollarSign,
        title: 'Alto Dividend Yield',
        message: `${dyAnalysis[0].ticker} oferece ${dyAnalysis[0].dy.toFixed(1)}% de DY anual.`,
      });
    }

    // Insight de renda mensal
    const monthlyTarget = 1000; // Meta de R$ 1000/mês
    if (stats.monthlyIncome > 0 && stats.monthlyIncome < monthlyTarget) {
      const needed = monthlyTarget - stats.monthlyIncome;
      newInsights.push({
        type: 'info',
        icon: Target,
        title: 'Meta de Renda Mensal',
        message: `Faltam ${formatCurrency(needed)} para atingir R$ 1.000/mês de renda passiva.`,
      });
    }

    setInsights(newInsights.slice(0, 4)); // Máximo 4 insights
  }, [advancedAnalytics, stats.monthlyIncome]);

  // 🔄 Atualizar preços
  const handleRefreshPrices = async () => {
    setRefreshingPrices(true);
    try {
      await refreshCurrentPortfolioPrices();
    } catch (error) {
      console.error("Erro ao atualizar preços:", error);
    } finally {
      setRefreshingPrices(false);
    }
  };

  // Cálculos avançados do portfólio
  const portfolioMetrics = useMemo(() => {
    if (!portfolioData.length) return null;

    const totalValue = portfolioData.reduce((sum, inv) => sum + (inv.current_value || 0), 0);
    const totalInvestment = portfolioData.reduce((sum, inv) => sum + (inv.total_invested || 0), 0);
    const totalMonthlyIncome = portfolioData.reduce((sum, inv) => sum + (inv.monthly_income || 0), 0);
    
    const performance = totalInvestment > 0 ? ((totalValue - totalInvestment) / totalInvestment) * 100 : 0;
    const averageDY = totalValue > 0 ? (totalMonthlyIncome * 12 / totalValue) * 100 : 0;

    // Análise por setor
    const sectorAnalysis = portfolioData.reduce((acc, inv) => {
      const sector = inv.sector || 'Outros';
      if (!acc[sector]) {
        acc[sector] = { value: 0, count: 0, income: 0 };
      }
      acc[sector].value += inv.current_value || 0;
      acc[sector].count += 1;
      acc[sector].income += inv.monthly_income || 0;
      return acc;
    }, {});

    // Top performers
    const topPerformers = portfolioData
      .map(inv => ({
        ...inv,
        performance: inv.total_invested > 0 ? ((inv.current_value - inv.total_invested) / inv.total_invested) * 100 : 0
      }))
      .sort((a, b) => b.performance - a.performance)
      .slice(0, 5);

    // Maiores dividend yields
    const topDividendYields = portfolioData
      .filter(inv => inv.dividend_yield_monthly > 0)
      .sort((a, b) => b.dividend_yield_monthly - a.dividend_yield_monthly)
      .slice(0, 5);

    return {
      totalValue,
      totalInvestment,
      totalMonthlyIncome,
      performance,
      averageDY,
      sectorAnalysis,
      topPerformers,
      topDividendYields,
      diversificationScore: Object.keys(sectorAnalysis).length * 20, // Score simples
      concentrationRisk: Math.max(...Object.values(sectorAnalysis).map(s => s.value)) / totalValue * 100
    };
  }, [portfolioData]);

  // Dados para gráficos
  const chartData = useMemo(() => {
    if (!portfolioMetrics) return null;

    // Dados do gráfico de setores
    const sectorChartData = Object.entries(portfolioMetrics.sectorAnalysis).map(([sector, data]) => ({
      name: sector,
      value: data.value,
      percentage: (data.value / portfolioMetrics.totalValue * 100).toFixed(1)
    }));

    // Dados do gráfico de performance
    const performanceData = portfolioMetrics.topPerformers.map(inv => ({
      name: inv.ticker,
      performance: inv.performance,
      value: inv.current_value
    }));

    // Dados de dividend yield
    const dyData = portfolioMetrics.topDividendYields.map(inv => ({
      name: inv.ticker,
      dy: inv.dividend_yield_monthly,
      income: inv.monthly_income
    }));

    return {
      sectorChartData,
      performanceData,
      dyData
    };
  }, [portfolioMetrics]);

  // Cores para gráficos
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0', '#ffb347'];

  // Gerar insights com IA
  const generateAIInsights = async () => {
    if (!aiConfigured || !portfolioMetrics) return;

    setIsGeneratingInsights(true);
    try {
      // Simular análise com IA (você pode implementar uma chamada real para Claude aqui)
      const insights = {
        overallScore: Math.round(portfolioMetrics.diversificationScore + (portfolioMetrics.performance > 0 ? 20 : 0)),
        recommendations: [
          portfolioMetrics.concentrationRisk > 40 ? "⚠️ Alta concentração detectada - considere diversificar" : "✅ Boa diversificação setorial",
          portfolioMetrics.averageDY > 8 ? "🎯 Excelente dividend yield médio" : "📈 Considere FIIs com maior DY",
          portfolioMetrics.performance > 5 ? "🚀 Performance acima da média" : "📊 Performance dentro do esperado"
        ],
        opportunities: [
          "🏢 Fundos de lajes corporativas estão em alta",
          "🏪 Shopping centers com boa localização apresentam oportunidades",
          "🏭 Logística continua sendo um setor defensivo"
        ],
        risks: [
          portfolioMetrics.concentrationRisk > 50 ? "🔴 Risco de concentração elevado" : null,
          portfolioMetrics.averageDY < 6 ? "🟡 Dividend yield abaixo da média do mercado" : null
        ].filter(Boolean)
      };

      setSmartAlerts(insights.risks.map(risk => ({
        type: risk ? "warning" : "success",
        title: risk ? "Risco Identificado" : "Risco Eliminado",
        message: risk,
        action: risk ? "Avaliar" : "Manter estratégia",
        icon: risk ? AlertTriangle : TrendingUp
      })));

    } catch (error) {
      console.error("Erro ao gerar insights:", error);
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  // Gerar alertas inteligentes
  useEffect(() => {
    if (portfolioMetrics) {
      const alerts = [];
      
      if (portfolioMetrics.concentrationRisk > 40) {
        alerts.push({
          type: "warning",
          title: "Concentração de Risco",
          message: `${portfolioMetrics.concentrationRisk.toFixed(1)}% do portfólio em um único setor`,
          action: "Diversificar",
          icon: AlertTriangle
        });
      }
      
      if (portfolioMetrics.totalMonthlyIncome >= 500 && portfolioMetrics.totalMonthlyIncome < 1000) {
        alerts.push({
          type: "success",
          title: "Meta Atingida! 🎉",
          message: "Você atingiu R$ 500/mês! Próxima meta: R$ 1.000/mês",
          action: "Acelerar aportes",
          icon: Trophy
        });
      }
      
      if (portfolioMetrics.performance > 15) {
        alerts.push({
          type: "success",
          title: "Performance Excepcional",
          message: `Seu portfólio está ${portfolioMetrics.performance.toFixed(1)}% valorizado!`,
          action: "Manter estratégia",
          icon: TrendingUp
        });
      }
      
      if (portfolioMetrics.averageDY > 10) {
        alerts.push({
          type: "info",
          title: "Alto Dividend Yield",
          message: `DY médio de ${portfolioMetrics.averageDY.toFixed(1)}% - monitore sustentabilidade`,
          action: "Acompanhar",
          icon: Eye
        });
      }
      
      setSmartAlerts(alerts);
    }
  }, [
    portfolioMetrics?.concentrationRisk,
    portfolioMetrics?.totalMonthlyIncome,
    portfolioMetrics?.performance,
    portfolioMetrics?.averageDY
  ]);

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Carregando seus investimentos...</p>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Estado de erro
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-red-600">Erro ao carregar dados: {error}</p>
        </div>
      </div>
    );
  }

  // Estado vazio (primeira vez usando)
  const isEmpty = !currentPortfolio || !portfolioData.length;

  if (isEmpty) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Bem-vindo ao FII Investment Analyzer</p>
        </div>

        {/* Cards zerados */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Investido</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(0)}</div>
              <p className="text-xs text-muted-foreground">Capital aplicado em FIIs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Atual</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(0)}</div>
              <p className="text-xs text-muted-foreground">Comece adicionando investimentos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Renda Mensal</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(0)}</div>
              <p className="text-xs text-muted-foreground">Estimativa baseada no DY</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Diversificação</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">FIIs na carteira</p>
            </CardContent>
          </Card>
        </div>

        {/* Mensagem de boas-vindas */}
        <Card className="border-dashed border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              Comece sua jornada de investimentos em FIIs
            </CardTitle>
            <CardDescription>
              Adicione seus primeiros investimentos para ver análises detalhadas e insights inteligentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex flex-col items-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                  <Target className="h-8 w-8 text-blue-600 mb-2" />
                  <h3 className="font-medium text-sm">Sugestões IA</h3>
                  <p className="text-xs text-muted-foreground text-center">Receba recomendações personalizadas</p>
                </div>
                <div className="flex flex-col items-center p-4 rounded-lg bg-green-50 dark:bg-green-950/20">
                  <Briefcase className="h-8 w-8 text-green-600 mb-2" />
                  <h3 className="font-medium text-sm">Gestão de Carteira</h3>
                  <p className="text-xs text-muted-foreground text-center">Acompanhe seus investimentos</p>
                </div>
                <div className="flex flex-col items-center p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                  <BarChart3 className="h-8 w-8 text-purple-600 mb-2" />
                  <h3 className="font-medium text-sm">Análises Avançadas</h3>
                  <p className="text-xs text-muted-foreground text-center">Insights e métricas detalhadas</p>
                </div>
              </div>
              <p className="text-muted-foreground mb-4">
                Vá para <strong>"Investir"</strong> para receber sugestões personalizadas ou 
                acesse <strong>"Carteira"</strong> para adicionar seus investimentos atuais.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 🎯 DASHBOARD PRINCIPAL COM DADOS
  return (
    <div className="space-y-6">
      {/* Header Épico */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white p-6 rounded-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
      <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Crown className="h-8 w-8" />
                Dashboard Épico
                <Sparkles className="h-6 w-6 animate-pulse" />
              </h1>
              <p className="text-blue-100 mt-2 flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Análises inteligentes • Insights com IA • Projeções futuras • Comparação com mercado
                {aiConfigured && (
                  <Badge variant="outline" className="border-white/30 text-white">
                    Claude Opus 4 Ativo
                  </Badge>
                )}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">R$ {stats.monthlyIncome?.toFixed(2) || '0,00'}</div>
              <div className="text-blue-100">Renda Mensal</div>
              <div className="text-sm text-blue-200 mt-1">
                {portfolioMetrics && `DY: ${portfolioMetrics.averageDY.toFixed(2)}% a.a.`}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alertas Inteligentes */}
      {smartAlerts.length > 0 && (
        <div className="space-y-3">
          {smartAlerts.map((alert, index) => {
            const IconComponent = alert.icon;
            return (
              <Alert 
                key={index} 
                variant={alert.type === "warning" ? "destructive" : alert.type === "success" ? "default" : "default"}
                className={`border-l-4 ${
                  alert.type === "warning" ? "border-l-orange-500 bg-orange-50" :
                  alert.type === "success" ? "border-l-green-500 bg-green-50" :
                  "border-l-blue-500 bg-blue-50"
                }`}
              >
                <IconComponent className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <div>
                    <strong>{alert.title}:</strong> {alert.message}
                  </div>
                  <Badge variant="outline" className="ml-4">{alert.action}</Badge>
                </AlertDescription>
              </Alert>
            );
          })}
        </div>
      )}

      {/* Cards Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Valor Investido */}
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Valor Investido</p>
                <p className="text-2xl font-bold text-blue-900">
                  R$ {stats.totalInvested?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {portfolioData?.length || 0} FIIs
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        {/* Valor Atual */}
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Valor Atual</p>
                <p className="text-2xl font-bold text-green-900">
                  R$ {stats.currentValue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                </p>
                {portfolioMetrics && (
                  <div className="flex items-center gap-1 mt-1">
                    {portfolioMetrics.performance >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDownIcon className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`text-sm font-medium ${portfolioMetrics.performance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {portfolioMetrics.performance.toFixed(2)}%
                    </span>
                  </div>
                )}
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        {/* Renda Mensal */}
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Renda Mensal</p>
                <p className="text-2xl font-bold text-purple-900">
                  R$ {stats.monthlyIncome?.toFixed(2) || '0,00'}
                </p>
                {portfolioMetrics && (
                  <p className="text-sm text-purple-600 mt-1">
                    DY: {portfolioMetrics.averageDY.toFixed(2)}% a.a.
                  </p>
                )}
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        {/* Score de Diversificação */}
        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Diversificação</p>
                <p className="text-2xl font-bold text-orange-900">
                  {portfolioMetrics?.diversificationScore || 0}/100
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Shield className="h-4 w-4 text-orange-600" />
                  <span className="text-sm text-orange-600">
                    {Object.keys(portfolioMetrics?.sectorAnalysis || {}).length} setores
                  </span>
                </div>
              </div>
              <PieChart className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border">
        <div className="border-b">
          <nav className="flex space-x-8 px-6 overflow-x-auto">
            {[
              { id: 'overview', name: 'Visão Geral', icon: BarChart3 },
              { id: 'ai-analysis', name: 'Análise IA', icon: Brain },
              { id: 'simulator', name: 'Simulador', icon: Calculator },
              { id: 'market', name: 'Mercado', icon: TrendingUp },
              { id: 'economic', name: 'Indicadores', icon: Globe },
              { id: 'heatmap', name: 'Heatmap', icon: Grid3X3 },
              { id: 'alerts', name: 'Alertas', icon: Bell },
              { id: 'projections', name: 'Projeções', icon: TrendingUp },
              { id: 'performance', name: 'Performance', icon: Award },
              { id: 'reports', name: 'Relatórios', icon: FileText }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-3 border-b-2 font-medium text-sm flex items-center gap-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Gráficos e Análises */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gráfico de Setores */}
                {chartData?.sectorChartData && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PieChart className="h-5 w-5" />
                        Distribuição por Setores
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <RechartsPieChart>
                          <Pie
                            data={chartData.sectorChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percentage }) => `${name}: ${percentage}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {chartData.sectorChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Valor']} />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

                {/* Placeholder para manter o grid */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Resumo da Carteira
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total de FIIs</span>
                        <span className="font-bold">{portfolioData?.length || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Setores</span>
                        <span className="font-bold">{Object.keys(portfolioMetrics?.sectorAnalysis || {}).length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Performance Média</span>
                        <span className={`font-bold ${portfolioMetrics?.performance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {portfolioMetrics?.performance?.toFixed(1) || '0'}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">DY Médio</span>
                        <span className="font-bold text-purple-600">
                          {portfolioMetrics?.averageDY?.toFixed(1) || '0'}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Top Performers Épico - Largura Total */}
              <TopPerformers 
                portfolioData={portfolioData} 
                portfolioMetrics={portfolioMetrics} 
              />

              {/* Metas de Renda Passiva */}
              <Card>
          <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Metas de Renda Passiva
                    <Flame className="h-5 w-5 text-orange-500" />
                  </CardTitle>
          </CardHeader>
          <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { target: 500, label: "Primeira Meta", color: "blue", icon: Star },
                      { target: 1000, label: "Independência Básica", color: "green", icon: Shield },
                      { target: 2000, label: "Conforto Financeiro", color: "purple", icon: Crown },
                      { target: 5000, label: "Liberdade Total", color: "orange", icon: Gem }
                    ].map((goal, index) => {
                      const progress = Math.min((stats.monthlyIncome / goal.target) * 100, 100);
                      const isCompleted = stats.monthlyIncome >= goal.target;
                      const IconComponent = goal.icon;
                      
                      return (
                        <div key={index} className={`p-4 rounded-lg border-2 transition-all hover:shadow-lg ${
                          isCompleted ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                        }`}>
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <span className="font-medium">{goal.label}</span>
                              {isCompleted && <IconComponent className="h-5 w-5 text-green-600" />}
                            </div>
                            <div className="text-2xl font-bold mb-2">R$ {goal.target}</div>
                            <Progress value={progress} className="h-2 mb-2" />
                            <div className="text-sm text-gray-600">
                              {progress.toFixed(1)}% concluído
                            </div>
                            {isCompleted && (
                              <Badge variant="outline" className="mt-2 border-green-500 text-green-700">
                                ✅ Atingida!
                              </Badge>
                            )}
                    </div>
                    </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'ai-analysis' && <AIAnalysisEngine portfolioMetrics={portfolioMetrics} investments={portfolioData} />}
          {activeTab === 'simulator' && <InvestmentSimulator currentPortfolio={currentPortfolio} />}
          {activeTab === 'market' && <MarketComparison portfolioMetrics={portfolioMetrics} investments={portfolioData} />}
          {activeTab === 'economic' && <EconomicIndicators />}
          {activeTab === 'heatmap' && <SectorHeatmap />}
          {activeTab === 'alerts' && <SmartAlerts />}
          {activeTab === 'projections' && <FutureProjections />}
          {activeTab === 'performance' && <PerformanceAnalytics />}
          {activeTab === 'reports' && <ProfessionalReports />}
        </div>
            </div>

      {/* Botão de Refresh */}
      <div className="text-center">
        <Button 
          onClick={handleRefreshPrices} 
          variant="outline" 
          className="flex items-center gap-2 hover:bg-blue-50"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar Dados
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;

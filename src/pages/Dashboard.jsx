import React, { useState, useEffect } from "react";
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

const Dashboard = () => {
  const {
    currentPortfolio,
    loading,
    error,
    getPortfolioStats,
    refreshCurrentPortfolioPrices,
  } = usePortfolio();

  const [refreshingPrices, setRefreshingPrices] = useState(false);
  const [insights, setInsights] = useState([]);

  // Calcular estatísticas da carteira
  const stats = getPortfolioStats(currentPortfolio);
  
  // Dados derivados para análises avançadas
  const portfolioData = currentPortfolio?.investments?.filter(inv => inv.is_active) || [];
  
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
  }, [advancedAnalytics, stats]);

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

  // Estado de carregamento
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <LayoutDashboard className="h-8 w-8" />
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Visão completa dos seus investimentos em FIIs
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefreshPrices}
          disabled={refreshingPrices}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshingPrices ? "animate-spin" : ""}`} />
          {refreshingPrices ? "Atualizando..." : "Atualizar Preços"}
        </Button>
      </div>

      {/* Cards Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Investido</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalInvested)}</div>
            <p className="text-xs text-muted-foreground">
              Capital aplicado em {portfolioData.length} FII{portfolioData.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Atual</CardTitle>
            {stats.returnPercentage >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.currentValue)}</div>
            <p className={`text-xs flex items-center gap-1 ${
              stats.returnPercentage >= 0 ? "text-green-600" : "text-red-600"
            }`}>
              {stats.returnPercentage >= 0 ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {stats.returnPercentage >= 0 ? "+" : ""}{formatPercentage(stats.returnPercentage)} 
              ({formatCurrency(stats.totalReturn)})
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Renda Mensal</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.monthlyIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              DY médio: {formatPercentage(stats.averageDY)} ao ano
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Diversificação</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{advancedAnalytics?.diversification.sectors || 0}</div>
            <p className="text-xs text-muted-foreground">
              Setores • {portfolioData.length} FIIs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Insights Inteligentes */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Insights Inteligentes
            </CardTitle>
            <CardDescription>
              Análises automáticas da sua carteira
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {insights.map((insight, index) => {
                const Icon = insight.icon;
                const colorClass = {
                  success: "text-green-600 bg-green-50 dark:bg-green-950/20",
                  warning: "text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20",
                  info: "text-blue-600 bg-blue-50 dark:bg-blue-950/20",
                  error: "text-red-600 bg-red-50 dark:bg-red-950/20",
                }[insight.type];

                return (
                  <div key={index} className={`p-3 rounded-lg ${colorClass}`}>
                    <div className="flex items-start gap-3">
                      <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-sm">{insight.title}</h4>
                        <p className="text-xs opacity-80 mt-1">{insight.message}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Análises Detalhadas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Top Performers */}
        {advancedAnalytics?.topPerformers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-green-600" />
                Melhores Performances
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {advancedAnalytics.topPerformers.map((performer, index) => (
                  <div key={performer.ticker} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium text-sm">{performer.ticker}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(performer.gain)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">
                        +{formatPercentage(performer.performance)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Análise por Setor */}
        {advancedAnalytics?.sectorAnalysis && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                Distribuição por Setor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(advancedAnalytics.sectorAnalysis)
                  .sort(([,a], [,b]) => b.value - a.value)
                  .slice(0, 4)
                  .map(([sector, data]) => {
                    const percentage = stats.currentValue > 0 ? (data.value / stats.currentValue) * 100 : 0;
                    return (
                      <div key={sector}>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium">{sector}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatPercentage(percentage)}
                          </p>
                        </div>
                        <Progress value={percentage} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {data.count} FII{data.count !== 1 ? 's' : ''} • {formatCurrency(data.value)}
                        </p>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Maiores Dividend Yields */}
        {advancedAnalytics?.dyAnalysis.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="h-5 w-5 text-purple-600" />
                Maiores Dividend Yields
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {advancedAnalytics.dyAnalysis.slice(0, 4).map((item, index) => (
                  <div key={item.ticker} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium text-sm">{item.ticker}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(item.monthlyIncome)}/mês
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-purple-600">
                        {formatPercentage(item.dy)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Concentração da Carteira */}
      {advancedAnalytics?.concentration.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-indigo-600" />
              Concentração da Carteira
            </CardTitle>
            <CardDescription>
              Distribuição do valor investido por FII
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {advancedAnalytics.concentration.map((item, index) => (
                <div key={item.ticker}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                      <p className="font-medium">{item.ticker}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatPercentage(item.percentage)}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(item.value)}
                      </p>
                    </div>
                  </div>
                  <Progress value={item.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Meta de Renda Passiva */}
      <Card className="border-dashed border-2 border-green-200 bg-green-50/50 dark:bg-green-950/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
            <Target className="h-5 w-5" />
            Meta de Renda Passiva
          </CardTitle>
          <CardDescription>
            Acompanhe seu progresso rumo à independência financeira
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[500, 1000, 2000, 5000].map((target) => {
              const progress = stats.monthlyIncome > 0 ? Math.min((stats.monthlyIncome / target) * 100, 100) : 0;
              const isAchieved = stats.monthlyIncome >= target;
              
              return (
                <div key={target}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {isAchieved ? (
                        <Star className="h-4 w-4 text-yellow-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      )}
                      <p className="font-medium">
                        Meta: {formatCurrency(target)}/mês
                      </p>
                    </div>
                    <p className={`text-sm ${isAchieved ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {formatPercentage(progress)}
                    </p>
                  </div>
                  <Progress 
                    value={progress} 
                    className={`h-2 ${isAchieved ? 'bg-green-100' : ''}`}
                  />
                  {!isAchieved && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Faltam {formatCurrency(target - stats.monthlyIncome)} para atingir esta meta
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;

import React from "react";
import {
  LayoutDashboard,
  TrendingUp,
  DollarSign,
  PieChart,
  Calendar,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  formatCurrency,
  formatPercentage,
  formatDate,
} from "../lib/utils/formatters";
import { usePortfolio } from "../contexts/PortfolioContext";

const Dashboard = () => {
  // Usar dados reais do contexto da carteira
  const {
    totalInvested,
    currentValue,
    totalDividends,
    monthlyYield,
    performance,
    positions,
    recentDividends,
    loading,
    error,
  } = usePortfolio();

  // Calcular maiores posições a partir dos dados reais
  const topAssets = positions
    .sort((a, b) => b.totalInvested - a.totalInvested)
    .slice(0, 3)
    .map((position) => ({
      ticker: position.ticker,
      value: position.totalInvested,
      percentage:
        totalInvested > 0 ? (position.totalInvested / totalInvested) * 100 : 0,
    }));

  // Calcular performance
  const calculatedPerformance =
    totalInvested > 0
      ? ((currentValue - totalInvested) / totalInvested) * 100
      : 0;

  const performanceColor =
    calculatedPerformance >= 0 ? "text-green-600" : "text-red-600";

  // Estado de carregamento
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Carregando seus investimentos...
          </p>
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
  const isEmpty = totalInvested === 0 && positions.length === 0;

  if (isEmpty) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vindo ao FII Investment Analyzer
          </p>
        </div>

        {/* Cards zerados */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Valor Investido
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(0)}</div>
              <p className="text-xs text-muted-foreground">
                Capital aplicado em FIIs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Atual</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(0)}</div>
              <p className="text-xs text-muted-foreground">
                Comece adicionando investimentos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Dividendos Recebidos
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(0)}</div>
              <p className="text-xs text-muted-foreground">Total acumulado</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Renda Mensal
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(0)}</div>
              <p className="text-xs text-muted-foreground">
                Média dos últimos 3 meses
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Mensagem de boas-vindas */}
        <Card>
          <CardHeader>
            <CardTitle>Comece sua jornada de investimentos em FIIs</CardTitle>
            <CardDescription>
              Adicione seus primeiros investimentos para ver análises detalhadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <PieChart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                Nenhum investimento encontrado
              </h3>
              <p className="text-muted-foreground mb-4">
                Vá para a seção "Investir" para receber sugestões personalizadas
                ou acesse "Carteira" para adicionar seus investimentos atuais.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Dashboard com dados reais
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral dos seus investimentos em FIIs
        </p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Valor Investido
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalInvested)}
            </div>
            <p className="text-xs text-muted-foreground">
              Capital aplicado em FIIs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Atual</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(currentValue)}
            </div>
            <p className={`text-xs ${performanceColor}`}>
              {calculatedPerformance >= 0 ? "+" : ""}
              {formatPercentage(calculatedPerformance)} desde o início
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Dividendos Recebidos
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalDividends)}
            </div>
            <p className="text-xs text-muted-foreground">Total acumulado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Renda Mensal</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(monthlyYield)}
            </div>
            <p className="text-xs text-muted-foreground">
              Média dos últimos 3 meses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos e Detalhes */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Maiores Posições */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Maiores Posições</CardTitle>
            <CardDescription>
              Seus principais investimentos em FIIs
            </CardDescription>
          </CardHeader>
          <CardContent>
            {topAssets.length > 0 ? (
              <div className="space-y-4">
                {topAssets.map((asset, index) => (
                  <div key={asset.ticker} className="flex items-center">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                      <span className="text-sm font-medium text-primary">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium leading-none">
                          {asset.ticker}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatPercentage(asset.percentage)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(asset.value)}
                        </p>
                        <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{
                              width: `${Math.min(asset.percentage, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <PieChart className="h-8 w-8 mx-auto mb-2" />
                <p>Nenhuma posição encontrada</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dividendos Recentes */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Dividendos Recentes</CardTitle>
            <CardDescription>Últimos proventos recebidos</CardDescription>
          </CardHeader>
          <CardContent>
            {recentDividends && recentDividends.length > 0 ? (
              <div className="space-y-4">
                {recentDividends.slice(0, 5).map((dividend, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-9 h-9 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mr-4">
                      <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium leading-none">
                          {dividend.ticker}
                        </p>
                        <p className="text-sm font-medium text-green-600">
                          {formatCurrency(dividend.amount)}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(dividend.date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2" />
                <p>Nenhum dividendo registrado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Resumo de Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Resumo de Performance
          </CardTitle>
          <CardDescription>
            Análise geral da sua carteira de FIIs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Rentabilidade Total</h4>
              <div className="text-2xl font-bold">
                {formatCurrency(currentValue - totalInvested + totalDividends)}
              </div>
              <p className="text-xs text-muted-foreground">
                Valorização + Dividendos
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Yield on Cost</h4>
              <div className="text-2xl font-bold text-green-600">
                {totalInvested > 0
                  ? formatPercentage((totalDividends / totalInvested) * 100)
                  : "0,00%"}
              </div>
              <p className="text-xs text-muted-foreground">
                Dividendos / Valor Investido
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Diversificação</h4>
              <div className="text-2xl font-bold">{positions.length}</div>
              <p className="text-xs text-muted-foreground">FIIs na carteira</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;

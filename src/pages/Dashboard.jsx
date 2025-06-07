import React from 'react';
import { LayoutDashboard, TrendingUp, DollarSign, PieChart, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { formatCurrency, formatPercentage, formatDate } from '../lib/utils/formatters';

const Dashboard = ({ portfolioData, marketData }) => {
  // Dados mock para demonstração
  const mockData = {
    totalInvested: 50000,
    currentValue: 52500,
    totalDividends: 2100,
    monthlyYield: 350,
    performance: 5.0,
    topAssets: [
      { ticker: 'HGLG11', value: 15000, percentage: 28.6 },
      { ticker: 'XPML11', value: 12000, percentage: 22.9 },
      { ticker: 'VISC11', value: 10000, percentage: 19.0 }
    ],
    recentDividends: [
      { ticker: 'HGLG11', value: 120, date: '2025-01-15' },
      { ticker: 'XPML11', value: 95, date: '2025-01-10' },
      { ticker: 'VISC11', value: 85, date: '2025-01-08' }
    ]
  };

  const data = portfolioData || mockData;

  const performanceColor = data.performance >= 0 ? 'text-green-600' : 'text-red-600';
  const performanceIcon = data.performance >= 0 ? TrendingUp : TrendingUp;

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
            <div className="text-2xl font-bold">{formatCurrency(data.totalInvested)}</div>
            <p className="text-xs text-muted-foreground">
              Capital aplicado em FIIs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Valor Atual
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.currentValue)}</div>
            <p className={`text-xs ${performanceColor}`}>
              {data.performance >= 0 ? '+' : ''}{formatPercentage(data.performance)} desde o início
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
            <div className="text-2xl font-bold">{formatCurrency(data.totalDividends)}</div>
            <p className="text-xs text-muted-foreground">
              Total acumulado
            </p>
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
            <div className="text-2xl font-bold">{formatCurrency(data.monthlyYield)}</div>
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
            <div className="space-y-4">
              {data.topAssets.map((asset, index) => (
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
                          style={{ width: `${asset.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Dividendos Recentes */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Dividendos Recentes</CardTitle>
            <CardDescription>
              Últimos proventos recebidos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentDividends.map((dividend, index) => (
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
                        {formatCurrency(dividend.value)}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(dividend.date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
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
                {formatCurrency(data.currentValue - data.totalInvested + data.totalDividends)}
              </div>
              <p className="text-xs text-muted-foreground">
                Valorização + Dividendos
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Yield on Cost</h4>
              <div className="text-2xl font-bold text-green-600">
                {formatPercentage((data.totalDividends / data.totalInvested) * 100)}
              </div>
              <p className="text-xs text-muted-foreground">
                Dividendos / Valor Investido
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Diversificação</h4>
              <div className="text-2xl font-bold">
                {data.topAssets.length}
              </div>
              <p className="text-xs text-muted-foreground">
                FIIs na carteira
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;


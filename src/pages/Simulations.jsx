import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  BarChart3,
  Download,
  RefreshCw,
  Target,
  PieChart
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  PatrimonyProjectionChart, 
  DividendEvolutionChart,
  PerformanceChart,
  SectorDistributionChart 
} from '../components/charts/Charts';
import { investmentSimulator } from '../lib/analysis/simulator';
import { usePortfolio } from '../contexts/PortfolioContext';
import { formatCurrency, formatPercentage } from '../lib/utils/formatters';

const Simulations = () => {
  const { positions, totalInvested, currentValue, totalDividends } = usePortfolio();

  // Estados para simulação de aportes
  const [monthlyContribution, setMonthlyContribution] = useState('1000');
  const [simulationYears, setSimulationYears] = useState('10');
  const [projectionData, setProjectionData] = useState([]);
  const [dividendEvolution, setDividendEvolution] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [sectorData, setSectorData] = useState([]);

  // Estados para métricas avançadas
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  const [loading, setLoading] = useState(false);

  // Carregar dados iniciais
  useEffect(() => {
    loadSimulationData();
  }, [positions, monthlyContribution, simulationYears]);

  // Carregar dados de simulação
  const loadSimulationData = () => {
    setLoading(true);

    try {
      // Projeção de patrimônio
      const projections = investmentSimulator.projectPatrimony(
        totalInvested || 50000,
        parseFloat(monthlyContribution) || 1000,
        parseInt(simulationYears) || 10
      );
      setProjectionData(projections);

      // Evolução de dividendos
      const dividends = investmentSimulator.simulateDividendEvolution(
        positions.length > 0 ? positions : [
          { totalInvested: 15000, dividendYield: 7.8 },
          { totalInvested: 12000, dividendYield: 8.2 },
          { totalInvested: 10000, dividendYield: 7.5 }
        ]
      );
      setDividendEvolution(dividends);

      // Dados de performance por FII
      const performance = positions.length > 0 ? positions.map(position => ({
        ticker: position.ticker,
        investedValue: position.totalInvested,
        performance: Math.random() * 20 - 5 // Performance simulada entre -5% e +15%
      })) : [
        { ticker: 'HGLG11', investedValue: 15000, performance: 8.5 },
        { ticker: 'XPML11', investedValue: 12000, performance: 12.3 },
        { ticker: 'VISC11', investedValue: 10000, performance: -2.1 }
      ];
      setPerformanceData(performance);

      // Distribuição setorial
      const sectors = {};
      const totalValue = positions.length > 0 ? 
        positions.reduce((sum, p) => sum + p.totalInvested, 0) : 37000;

      if (positions.length > 0) {
        positions.forEach(position => {
          const sector = position.sector || 'Outros';
          if (!sectors[sector]) {
            sectors[sector] = 0;
          }
          sectors[sector] += position.totalInvested;
        });
      } else {
        // Dados simulados
        sectors['Logística'] = 27000;
        sectors['Shoppings'] = 10000;
      }

      const sectorArray = Object.entries(sectors).map(([name, value]) => ({
        name,
        value,
        percentage: (value / totalValue) * 100
      }));
      setSectorData(sectorArray);

      // Métricas de performance
      const metrics = investmentSimulator.calculatePerformanceMetrics(
        positions.length > 0 ? positions : [],
        totalInvested || 50000,
        currentValue || 52500,
        totalDividends || 2100
      );
      setPerformanceMetrics(metrics);

    } catch (error) {
      console.error('Erro ao carregar simulações:', error);
    } finally {
      setLoading(false);
    }
  };

  // Atualizar simulação
  const updateSimulation = () => {
    loadSimulationData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Simulações</h1>
          <p className="text-muted-foreground">
            Projeções e análises avançadas da sua carteira
          </p>
        </div>
        
        <Button onClick={updateSimulation} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="projections">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="projections">Projeções</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="distribution">Distribuição</TabsTrigger>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
        </TabsList>

        {/* Projeções de Patrimônio */}
        <TabsContent value="projections" className="space-y-4">
          {/* Configurações da Simulação */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Configurações da Simulação
              </CardTitle>
              <CardDescription>
                Ajuste os parâmetros para personalizar as projeções
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="monthly-contribution">Aporte Mensal</Label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      R$
                    </span>
                    <Input
                      id="monthly-contribution"
                      type="number"
                      placeholder="1.000"
                      className="pl-8"
                      value={monthlyContribution}
                      onChange={(e) => setMonthlyContribution(e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="simulation-years">Período (Anos)</Label>
                  <Select
                    value={simulationYears}
                    onValueChange={setSimulationYears}
                  >
                    <SelectTrigger id="simulation-years" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 anos</SelectItem>
                      <SelectItem value="10">10 anos</SelectItem>
                      <SelectItem value="15">15 anos</SelectItem>
                      <SelectItem value="20">20 anos</SelectItem>
                      <SelectItem value="25">25 anos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-end">
                  <Button onClick={updateSimulation} className="w-full">
                    <Calculator className="mr-2 h-4 w-4" />
                    Simular
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gráfico de Projeção */}
          <Card>
            <CardHeader>
              <CardTitle>Projeção de Patrimônio</CardTitle>
              <CardDescription>
                Evolução estimada do patrimônio em diferentes cenários
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PatrimonyProjectionChart data={projectionData} />
            </CardContent>
          </Card>

          {/* Resumo das Projeções */}
          {projectionData.length > 0 && (
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-orange-600">
                    Cenário Conservador (5% a.a.)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(projectionData[projectionData.length - 1]?.conservative || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Em {simulationYears} anos
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-blue-600">
                    Cenário Moderado (8% a.a.)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(projectionData[projectionData.length - 1]?.moderate || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Em {simulationYears} anos
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-green-600">
                    Cenário Otimista (12% a.a.)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(projectionData[projectionData.length - 1]?.optimistic || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Em {simulationYears} anos
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Evolução de Dividendos */}
          <Card>
            <CardHeader>
              <CardTitle>Evolução de Dividendos</CardTitle>
              <CardDescription>
                Projeção dos dividendos mensais e acumulados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DividendEvolutionChart data={dividendEvolution} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance por FII */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance por FII</CardTitle>
              <CardDescription>
                Comparação de performance entre os FIIs da carteira
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PerformanceChart data={performanceData} />
            </CardContent>
          </Card>

          {/* Ranking de Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Ranking de Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {performanceData
                  .sort((a, b) => b.performance - a.performance)
                  .map((fii, index) => (
                    <div key={fii.ticker} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          index === 0 ? 'bg-yellow-100 text-yellow-800' :
                          index === 1 ? 'bg-gray-100 text-gray-800' :
                          index === 2 ? 'bg-orange-100 text-orange-800' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{fii.ticker}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(fii.investedValue)}
                          </p>
                        </div>
                      </div>
                      <div className={`text-right ${
                        fii.performance >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <p className="font-medium">
                          {fii.performance >= 0 ? '+' : ''}{fii.performance.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Distribuição da Carteira */}
        <TabsContent value="distribution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição Setorial</CardTitle>
              <CardDescription>
                Alocação da carteira por setor de atuação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SectorDistributionChart data={sectorData} />
            </CardContent>
          </Card>

          {/* Detalhes da Distribuição */}
          <Card>
            <CardHeader>
              <CardTitle>Detalhes da Distribuição</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sectorData.map((sector, index) => (
                  <div key={sector.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: ['#8884d8', '#82ca9d', '#ffc658', '#ff7300'][index] }}
                      ></div>
                      <span className="font-medium">{sector.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(sector.value)}</p>
                      <p className="text-sm text-muted-foreground">
                        {sector.percentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Métricas Avançadas */}
        <TabsContent value="metrics" className="space-y-4">
          {performanceMetrics && (
            <>
              {/* Métricas de Risco e Retorno */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Retorno Total</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {formatPercentage(performanceMetrics.totalReturnPercentage)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(performanceMetrics.totalReturn)}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Sharpe Ratio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {performanceMetrics.sharpeRatio.toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Retorno ajustado ao risco
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Volatilidade</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">
                      {formatPercentage(performanceMetrics.volatility * 100)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Risco da carteira
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Beta</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {performanceMetrics.beta.toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Sensibilidade ao mercado
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Análise de Risco */}
              <Card>
                <CardHeader>
                  <CardTitle>Análise de Risco</CardTitle>
                  <CardDescription>
                    Métricas de risco da carteira
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Max Drawdown Estimado</span>
                        <span className="text-sm font-medium text-red-600">
                          {formatPercentage(performanceMetrics.maxDrawdown * 100)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Alpha</span>
                        <span className={`text-sm font-medium ${
                          performanceMetrics.alpha >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {performanceMetrics.alpha >= 0 ? '+' : ''}{formatPercentage(performanceMetrics.alpha * 100)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Retorno Anualizado</span>
                        <span className="text-sm font-medium text-green-600">
                          {formatPercentage(performanceMetrics.annualizedReturn * 100)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Interpretação</h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>• Sharpe Ratio &gt; 1.0 indica boa relação risco-retorno</p>
                        <p>• Beta &gt; 1.0 indica maior volatilidade que o mercado</p>
                        <p>• Alpha positivo indica performance superior ao benchmark</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Simulations;


import React, { useState } from 'react';
import { 
  Briefcase, 
  Plus, 
  Download, 
  Upload, 
  Trash2, 
  TrendingUp, 
  DollarSign,
  Calendar,
  PieChart,
  AlertCircle,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { usePortfolio } from '../contexts/PortfolioContext';
import { formatCurrency, formatPercentage, formatDate } from '../lib/utils/formatters';

const Portfolio = () => {
  const {
    loading,
    error,
    totalInvested,
    currentValue,
    totalDividends,
    monthlyYield,
    performance,
    yieldOnCost,
    diversification,
    positions,
    recentDividends,
    addInvestment,
    addDividend,
    exportData,
    importData,
    clearAllData,
    clearError
  } = usePortfolio();

  const [showAddInvestment, setShowAddInvestment] = useState(false);
  const [showAddDividend, setShowAddDividend] = useState(false);
  const [investmentForm, setInvestmentForm] = useState({
    ticker: '',
    name: '',
    shares: '',
    price: '',
    sector: ''
  });
  const [dividendForm, setDividendForm] = useState({
    ticker: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Adicionar investimento
  const handleAddInvestment = async (e) => {
    e.preventDefault();
    
    try {
      await addInvestment({
        ticker: investmentForm.ticker.toUpperCase(),
        name: investmentForm.name,
        shares: parseInt(investmentForm.shares),
        price: parseFloat(investmentForm.price),
        sector: investmentForm.sector
      });

      setInvestmentForm({
        ticker: '',
        name: '',
        shares: '',
        price: '',
        sector: ''
      });
      setShowAddInvestment(false);
    } catch (error) {
      console.error('Erro ao adicionar investimento:', error);
    }
  };

  // Adicionar dividendo
  const handleAddDividend = async (e) => {
    e.preventDefault();
    
    try {
      await addDividend({
        ticker: dividendForm.ticker.toUpperCase(),
        amount: parseFloat(dividendForm.amount),
        date: dividendForm.date
      });

      setDividendForm({
        ticker: '',
        amount: '',
        date: new Date().toISOString().split('T')[0]
      });
      setShowAddDividend(false);
    } catch (error) {
      console.error('Erro ao adicionar dividendo:', error);
    }
  };

  // Importar arquivo
  const handleImportFile = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        await importData(file);
      } catch (error) {
        console.error('Erro ao importar arquivo:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Carteira</h1>
          <p className="text-muted-foreground">Carregando dados da carteira...</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Carteira</h1>
          <p className="text-muted-foreground">
            Gerencie seus investimentos em FIIs
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowAddDividend(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Dividendo
          </Button>
          <Button onClick={() => setShowAddInvestment(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Investimento
          </Button>
        </div>
      </div>

      {/* Erro */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            {error}
            <Button variant="ghost" size="sm" onClick={clearError}>
              Fechar
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Resumo da Carteira */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Valor Investido
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalInvested)}</div>
            <p className="text-xs text-muted-foreground">
              Capital aplicado
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
            <div className="text-2xl font-bold">{formatCurrency(currentValue)}</div>
            <p className={`text-xs ${performance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {performance >= 0 ? '+' : ''}{formatPercentage(performance)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Dividendos
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalDividends)}</div>
            <p className="text-xs text-muted-foreground">
              Total recebido
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
            <div className="text-2xl font-bold">{formatCurrency(monthlyYield)}</div>
            <p className="text-xs text-muted-foreground">
              Média últimos 3 meses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="positions">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="positions">Posições</TabsTrigger>
          <TabsTrigger value="dividends">Dividendos</TabsTrigger>
          <TabsTrigger value="analytics">Análises</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        {/* Posições */}
        <TabsContent value="positions" className="space-y-4">
          {positions.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Posições na Carteira</CardTitle>
                <CardDescription>
                  Seus investimentos em FIIs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {positions.map((position, index) => (
                    <div key={position.ticker} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium">{position.ticker}</h4>
                          <p className="text-sm text-muted-foreground">{position.name}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(position.totalInvested)}</div>
                        <div className="text-sm text-muted-foreground">
                          {position.totalShares} cotas
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64">
                <Briefcase className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Carteira Vazia</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Você ainda não possui investimentos em FIIs.
                </p>
                <Button onClick={() => setShowAddInvestment(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Primeiro Investimento
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Dividendos */}
        <TabsContent value="dividends" className="space-y-4">
          {recentDividends.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Dividendos</CardTitle>
                <CardDescription>
                  Proventos recebidos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentDividends.map((dividend, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                          <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <h4 className="font-medium">{dividend.ticker}</h4>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(dividend.date)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-medium text-green-600">
                          {formatCurrency(dividend.amount)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64">
                <DollarSign className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum Dividendo</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Você ainda não registrou dividendos.
                </p>
                <Button onClick={() => setShowAddDividend(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Dividendo
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Análises */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Métricas de Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Yield on Cost</span>
                  <span className="font-medium text-green-600">
                    {formatPercentage(yieldOnCost)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Diversificação</span>
                  <span className="font-medium">{diversification} FIIs</span>
                </div>
                <div className="flex justify-between">
                  <span>Performance Total</span>
                  <span className={`font-medium ${performance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercentage(performance)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Setor</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-32">
                <div className="text-center text-muted-foreground">
                  <PieChart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Gráfico em desenvolvimento</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Configurações */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Dados</CardTitle>
              <CardDescription>
                Exportar, importar ou limpar dados da carteira
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button variant="outline" onClick={exportData}>
                  <Download className="mr-2 h-4 w-4" />
                  Exportar Dados
                </Button>
                
                <div>
                  <Input
                    type="file"
                    accept=".json"
                    onChange={handleImportFile}
                    className="hidden"
                    id="import-file"
                  />
                  <Button variant="outline" asChild>
                    <Label htmlFor="import-file" className="cursor-pointer">
                      <Upload className="mr-2 h-4 w-4" />
                      Importar Dados
                    </Label>
                  </Button>
                </div>
                
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    if (confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
                      clearAllData();
                    }
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Limpar Dados
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal Adicionar Investimento */}
      {showAddInvestment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Adicionar Investimento</CardTitle>
              <CardDescription>
                Registre uma nova compra de FII
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddInvestment} className="space-y-4">
                <div>
                  <Label htmlFor="ticker">Ticker</Label>
                  <Input
                    id="ticker"
                    value={investmentForm.ticker}
                    onChange={(e) => setInvestmentForm(prev => ({ 
                      ...prev, 
                      ticker: e.target.value.toUpperCase() 
                    }))}
                    placeholder="HGLG11"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="name">Nome (opcional)</Label>
                  <Input
                    id="name"
                    value={investmentForm.name}
                    onChange={(e) => setInvestmentForm(prev => ({ 
                      ...prev, 
                      name: e.target.value 
                    }))}
                    placeholder="CSHG Logística FII"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="shares">Cotas</Label>
                    <Input
                      id="shares"
                      type="number"
                      value={investmentForm.shares}
                      onChange={(e) => setInvestmentForm(prev => ({ 
                        ...prev, 
                        shares: e.target.value 
                      }))}
                      placeholder="10"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="price">Preço</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={investmentForm.price}
                      onChange={(e) => setInvestmentForm(prev => ({ 
                        ...prev, 
                        price: e.target.value 
                      }))}
                      placeholder="172.50"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="sector">Setor (opcional)</Label>
                  <Input
                    id="sector"
                    value={investmentForm.sector}
                    onChange={(e) => setInvestmentForm(prev => ({ 
                      ...prev, 
                      sector: e.target.value 
                    }))}
                    placeholder="Logística"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    Adicionar
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowAddInvestment(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal Adicionar Dividendo */}
      {showAddDividend && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Adicionar Dividendo</CardTitle>
              <CardDescription>
                Registre um dividendo recebido
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddDividend} className="space-y-4">
                <div>
                  <Label htmlFor="dividend-ticker">Ticker</Label>
                  <Input
                    id="dividend-ticker"
                    value={dividendForm.ticker}
                    onChange={(e) => setDividendForm(prev => ({ 
                      ...prev, 
                      ticker: e.target.value.toUpperCase() 
                    }))}
                    placeholder="HGLG11"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="dividend-amount">Valor</Label>
                  <Input
                    id="dividend-amount"
                    type="number"
                    step="0.01"
                    value={dividendForm.amount}
                    onChange={(e) => setDividendForm(prev => ({ 
                      ...prev, 
                      amount: e.target.value 
                    }))}
                    placeholder="120.00"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="dividend-date">Data</Label>
                  <Input
                    id="dividend-date"
                    type="date"
                    value={dividendForm.date}
                    onChange={(e) => setDividendForm(prev => ({ 
                      ...prev, 
                      date: e.target.value 
                    }))}
                    required
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    Adicionar
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowAddDividend(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Portfolio;


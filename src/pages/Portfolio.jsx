import React, { useState } from "react";
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
  FileText,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { usePortfolio } from "../contexts/PortfolioContext";
import {
  formatCurrency,
  formatPercentage,
  formatDate,
} from "../lib/utils/formatters";

const Portfolio = () => {
  const {
    loading,
    error,
    portfolios,
    currentPortfolio,
    addInvestment,
    addDividend,
    exportData,
    importData,
    clearAllData,
    clearError,
  } = usePortfolio();

  const [showAddInvestment, setShowAddInvestment] = useState(false);
  const [showAddDividend, setShowAddDividend] = useState(false);
  const [investmentForm, setInvestmentForm] = useState({
    ticker: "",
    name: "",
    shares: "",
    price: "",
    sector: "",
  });
  const [dividendForm, setDividendForm] = useState({
    ticker: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
  });

  // ✅ CORREÇÃO: Calcular estatísticas da carteira atual
  const getPortfolioStats = () => {
    if (!currentPortfolio || !currentPortfolio.investments) {
      return {
        totalInvested: 0,
        currentValue: 0,
        totalDividends: 0,
        monthlyYield: 0,
        performance: 0,
        positions: [],
      };
    }

    const activeInvestments = currentPortfolio.investments.filter(
      (inv) => inv.is_active
    );

    const totalInvested = activeInvestments.reduce(
      (sum, inv) => sum + (inv.total_invested || 0),
      0
    );
    const currentValue = activeInvestments.reduce(
      (sum, inv) => sum + (inv.current_value || inv.total_invested || 0),
      0
    );
    const totalReturn = currentValue - totalInvested;
    const performance =
      totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

    const averageDY =
      activeInvestments.length > 0
        ? activeInvestments.reduce(
            (sum, inv) => sum + (inv.dividend_yield || 0),
            0
          ) / activeInvestments.length
        : 0;

    const monthlyYield = (currentValue * averageDY) / 100 / 12;

    // ✅ CORREÇÃO: Transformar investments em positions
    const positions = activeInvestments.map((inv) => ({
      ticker: inv.ticker,
      name: inv.name || inv.ticker,
      sector: inv.sector || "N/A",
      totalShares: inv.shares || 0,
      averagePrice: inv.average_price || 0,
      currentPrice: inv.current_price || inv.average_price || 0,
      totalInvested: inv.total_invested || 0,
      currentValue: inv.current_value || inv.total_invested || 0,
      dividendYield: inv.dividend_yield || 0,
      pvp: inv.pvp || 0,
      performance:
        inv.total_invested > 0
          ? (((inv.current_value || inv.total_invested) - inv.total_invested) /
              inv.total_invested) *
            100
          : 0,
    }));

    return {
      totalInvested,
      currentValue,
      totalDividends: 0, // TODO: Implementar cálculo de dividendos
      monthlyYield,
      performance,
      positions,
    };
  };

  const stats = getPortfolioStats();

  // Adicionar investimento
  const handleAddInvestment = async (e) => {
    e.preventDefault();
    try {
      await addInvestment({
        ticker: investmentForm.ticker.toUpperCase(),
        name: investmentForm.name,
        shares: parseInt(investmentForm.shares),
        price: parseFloat(investmentForm.price),
        sector: investmentForm.sector,
      });
      setInvestmentForm({
        ticker: "",
        name: "",
        shares: "",
        price: "",
        sector: "",
      });
      setShowAddInvestment(false);
    } catch (error) {
      console.error("Erro ao adicionar investimento:", error);
    }
  };

  // Adicionar dividendo
  const handleAddDividend = async (e) => {
    e.preventDefault();
    try {
      await addDividend({
        ticker: dividendForm.ticker.toUpperCase(),
        amount: parseFloat(dividendForm.amount),
        date: dividendForm.date,
      });
      setDividendForm({
        ticker: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
      });
      setShowAddDividend(false);
    } catch (error) {
      console.error("Erro ao adicionar dividendo:", error);
    }
  };

  // Importar arquivo
  const handleImportFile = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        await importData(file);
      } catch (error) {
        console.error("Erro ao importar arquivo:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Carteira</h1>
          <p className="text-muted-foreground">
            Carregando dados da carteira...
          </p>
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
          <Button variant="outline" onClick={() => setShowAddDividend(true)}>
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
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalInvested)}
            </div>
            <p className="text-xs text-muted-foreground">Capital aplicado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Atual</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.currentValue)}
            </div>
            <p
              className={`text-xs ${
                stats.performance >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {stats.performance >= 0 ? "+" : ""}
              {formatPercentage(stats.performance)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dividendos</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalDividends)}
            </div>
            <p className="text-xs text-muted-foreground">Total recebido</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Renda Mensal</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.monthlyYield)}
            </div>
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
          {stats.positions.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Posições na Carteira</CardTitle>
                <CardDescription>Seus investimentos em FIIs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.positions.map((position, index) => (
                    <div
                      key={position.ticker}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium">{position.ticker}</h4>
                          <p className="text-sm text-muted-foreground">
                            {position.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {position.sector}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {formatCurrency(position.totalInvested)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {position.totalShares} cotas
                        </div>
                        <div
                          className={`text-xs ${
                            position.performance >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {position.performance >= 0 ? "+" : ""}
                          {formatPercentage(position.performance)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
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
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Dividendos</CardTitle>
              <CardDescription>
                Dividendos recebidos dos seus FIIs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Nenhum dividendo registrado ainda.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Análises */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análises da Carteira</CardTitle>
              <CardDescription>
                Insights sobre sua carteira de FIIs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <PieChart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Análises disponíveis em breve.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações da Carteira</CardTitle>
              <CardDescription>
                Gerencie suas configurações e dados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button variant="outline" onClick={exportData}>
                  <Download className="mr-2 h-4 w-4" />
                  Exportar Dados
                </Button>
                <div>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportFile}
                    className="hidden"
                    id="import-file"
                  />
                  <Button variant="outline" asChild>
                    <label htmlFor="import-file" className="cursor-pointer">
                      <Upload className="mr-2 h-4 w-4" />
                      Importar Dados
                    </label>
                  </Button>
                </div>
                <Button variant="destructive" onClick={clearAllData}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Limpar Tudo
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal Adicionar Investimento */}
      {showAddInvestment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Adicionar Investimento</CardTitle>
              <CardDescription>
                Registre um novo FII na sua carteira
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddInvestment} className="space-y-4">
                <div>
                  <Label htmlFor="ticker">Ticker</Label>
                  <Input
                    id="ticker"
                    value={investmentForm.ticker}
                    onChange={(e) =>
                      setInvestmentForm((prev) => ({
                        ...prev,
                        ticker: e.target.value,
                      }))
                    }
                    placeholder="Ex: MXRF11"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={investmentForm.name}
                    onChange={(e) =>
                      setInvestmentForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Ex: Maxi Renda FII"
                  />
                </div>
                <div>
                  <Label htmlFor="shares">Quantidade de Cotas</Label>
                  <Input
                    id="shares"
                    type="number"
                    value={investmentForm.shares}
                    onChange={(e) =>
                      setInvestmentForm((prev) => ({
                        ...prev,
                        shares: e.target.value,
                      }))
                    }
                    placeholder="Ex: 100"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price">Preço Médio</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={investmentForm.price}
                    onChange={(e) =>
                      setInvestmentForm((prev) => ({
                        ...prev,
                        price: e.target.value,
                      }))
                    }
                    placeholder="Ex: 10.50"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="sector">Setor</Label>
                  <Input
                    id="sector"
                    value={investmentForm.sector}
                    onChange={(e) =>
                      setInvestmentForm((prev) => ({
                        ...prev,
                        sector: e.target.value,
                      }))
                    }
                    placeholder="Ex: Logística"
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
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Registrar Dividendo</CardTitle>
              <CardDescription>Registre um dividendo recebido</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddDividend} className="space-y-4">
                <div>
                  <Label htmlFor="dividend-ticker">Ticker</Label>
                  <Input
                    id="dividend-ticker"
                    value={dividendForm.ticker}
                    onChange={(e) =>
                      setDividendForm((prev) => ({
                        ...prev,
                        ticker: e.target.value,
                      }))
                    }
                    placeholder="Ex: MXRF11"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Valor</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={dividendForm.amount}
                    onChange={(e) =>
                      setDividendForm((prev) => ({
                        ...prev,
                        amount: e.target.value,
                      }))
                    }
                    placeholder="Ex: 0.85"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="date">Data</Label>
                  <Input
                    id="date"
                    type="date"
                    value={dividendForm.date}
                    onChange={(e) =>
                      setDividendForm((prev) => ({
                        ...prev,
                        date: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    Registrar
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

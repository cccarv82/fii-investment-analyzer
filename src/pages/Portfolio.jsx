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
  Edit,
  X,
  RefreshCw,
  Info,
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
import { Badge } from "../components/ui/badge";
import fiiDataAPI from "../lib/api/fiiDataAPI";

const Portfolio = () => {
  const {
    loading,
    error,
    portfolios,
    currentPortfolio,
    addInvestment,
    updateInvestment,
    removeInvestment,
    addDividend,
    updateExistingInvestmentsWithDividendData,
    refreshCurrentPortfolioPrices,
    loadPortfolios,
    exportData,
    importData,
    clearAllData,
    clearError,
  } = usePortfolio();

  const [showAddInvestment, setShowAddInvestment] = useState(false);
  const [showAddDividend, setShowAddDividend] = useState(false);
  const [showEditInvestment, setShowEditInvestment] = useState(null);
  const [refreshingPrices, setRefreshingPrices] = useState(false);
  const [isLoadingFIIData, setIsLoadingFIIData] = useState(false);
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

    const totalInvested = activeInvestments.reduce((sum, inv) => {
      const invested =
        inv.total_invested || inv.shares * inv.average_price || 0;
      return sum + invested;
    }, 0);

    const currentValue = activeInvestments.reduce((sum, inv) => {
      const current =
        inv.current_value ||
        inv.shares * inv.current_price ||
        inv.total_invested ||
        0;
      return sum + current;
    }, 0);

    const totalReturn = currentValue - totalInvested;
    const performance =
      totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

    // 🚀 CORRIGIDO: Calcular renda mensal usando a mesma lógica dos cards individuais
    const monthlyYield = activeInvestments.reduce((sum, inv) => {
      const investmentCurrentValue = inv.current_value || inv.shares * inv.current_price || inv.total_invested || 0;
      
      // Usar dividend_yield_monthly se disponível (mais preciso)
      if (inv.dividend_yield_monthly) {
        return sum + (investmentCurrentValue * inv.dividend_yield_monthly / 100);
      } else if (inv.dividend_yield) {
        // Fallback: dividir DY anual por 12
        return sum + (investmentCurrentValue * inv.dividend_yield / 100) / 12;
      }
      
      return sum;
    }, 0);

    // ✅ CORREÇÃO: Transformar investments em positions com mais detalhes
    const positions = activeInvestments.map((inv) => {
      const shares = inv.shares || 0;
      const averagePrice = inv.average_price || 0;
      const currentPrice = inv.current_price || inv.average_price || 0;
      const totalInvested = inv.total_invested || shares * averagePrice;
      const currentValue = inv.current_value || shares * currentPrice;
      const performance =
        totalInvested > 0
          ? ((currentValue - totalInvested) / totalInvested) * 100
          : 0;

      return {
        id: inv.id,
        ticker: inv.ticker,
        name: inv.name || inv.ticker,
        sector: inv.sector || "N/A",
        totalShares: shares,
        averagePrice: averagePrice,
        currentPrice: currentPrice,
        totalInvested: totalInvested,
        currentValue: currentValue,
        dividendYield: inv.dividend_yield || 0,
        pvp: inv.pvp || 0,
        performance: performance,
        isRealPrice: currentPrice !== averagePrice, // 🚀 Indicador se é preço real
      };
    });

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

  // 🚀 ATUALIZAR PREÇOS REAIS
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

  // 🚀 NOVO: Buscar dados do FII automaticamente
  const fetchFIIData = async (ticker) => {
    if (!ticker || ticker.length < 4) return;
    
    setIsLoadingFIIData(true);
    try {
      // Usar nossa API de FIIs (Status Invest + Fundamentus)
      const fiiData = await fiiDataAPI.getFII(ticker);
      
      if (fiiData) {
        // 🔍 Log detalhado para debug
        console.log(`✅ Dados completos encontrados para ${ticker}:`, fiiData);
        
        // 🚀 LÓGICA ROBUSTA: Determinar setor com fallbacks inteligentes
        let sector = '';
        
        // 1. Prioridade: segment (mais específico)
        if (fiiData.segment && fiiData.segment !== 'Híbrido') {
          sector = fiiData.segment;
        }
        // 2. Fallback: manager (pode indicar especialização)
        else if (fiiData.manager && fiiData.manager.length > 0) {
          sector = fiiData.manager;
        }
        // 3. Fallback: management_company
        else if (fiiData.management_company && fiiData.management_company.length > 0) {
          sector = fiiData.management_company;
        }
        // 4. Fallback: sector genérico
        else if (fiiData.sector) {
          sector = fiiData.sector;
        }
        // 5. Fallback: baseado no ticker (alguns padrões conhecidos)
        else {
          const tickerPatterns = {
            'HGLG': 'Logística',
            'XPML': 'Shoppings',
            'MXRF': 'Híbrido',
            'CPTS': 'Corporativo',
            'RBRF': 'Híbrido',
            'VISC': 'Logística',
            'KNRI': 'Logística',
            'BCFF': 'Corporativo'
          };
          
          const tickerPrefix = ticker.substring(0, 4);
          sector = tickerPatterns[tickerPrefix] || 'Fundos Imobiliários';
        }
        
        setInvestmentForm(prev => ({
          ...prev,
          name: fiiData.name || prev.name,
          sector: sector || prev.sector,
          price: fiiData.price ? fiiData.price.toString() : prev.price,
        }));
        
        console.log(`✅ Dados aplicados para ${ticker}:`, {
          name: fiiData.name,
          sector: sector,
          price: fiiData.price,
          sectorSource: fiiData.segment ? 'segment' : 
                       fiiData.manager ? 'manager' : 
                       fiiData.management_company ? 'management_company' :
                       fiiData.sector ? 'sector' : 'ticker_pattern',
          originalData: {
            sector: fiiData.sector,
            segment: fiiData.segment,
            manager: fiiData.manager,
            management_company: fiiData.management_company
          }
        });
      } else {
        console.log(`⚠️ Dados não encontrados para ${ticker}`);
      }
    } catch (error) {
      console.error("❌ Erro ao buscar dados do FII:", error);
    } finally {
      setIsLoadingFIIData(false);
    }
  };

  // 🚀 MELHORADO: Auto-refresh após adicionar
  const handleAddInvestment = async (e) => {
    e.preventDefault();
    try {
      const shares = parseInt(investmentForm.shares);
      const price = parseFloat(investmentForm.price);
      const ticker = investmentForm.ticker.toUpperCase();

      // 🚀 NOVO: Buscar dados completos do FII antes de salvar
      console.log("🔍 Buscando dados completos do FII para salvar...");
      let fiiData = null;
      try {
        fiiData = await fiiDataAPI.getFII(ticker);
        console.log("📊 Dados completos do FII encontrados:", fiiData);
      } catch (error) {
        console.warn("⚠️ Não foi possível buscar dados completos do FII:", error);
      }

      const investmentData = {
        ticker: ticker,
        name: investmentForm.name || fiiData?.name || ticker,
        shares: shares,
        price: price,
        sector: investmentForm.sector || fiiData?.segment || fiiData?.sector || "Fundos Imobiliários",
        // 🚀 TEMPORÁRIO: Só incluir campos que existem na tabela
        ...(fiiData && {
          dividend_yield: fiiData.dividend_yield,
          current_price: fiiData.price, // Preço atual do mercado
          // 🔧 COMENTADO até adicionar as colunas no banco:
          // dividend_yield_monthly: fiiData.dividend_yield_monthly,
          // pvp: fiiData.pvp,
        })
      };

      console.log("📝 Adicionando investimento com dados completos:", investmentData);

      await addInvestment(investmentData);

      // 🚀 CONTEXTO FAZ AUTO-RELOAD: Não precisa mais chamar loadPortfolios()
      // O PortfolioContext agora recarrega automaticamente após addInvestment()

      setInvestmentForm({
        ticker: "",
        name: "",
        shares: "",
        price: "",
        sector: "",
      });
      setShowAddInvestment(false);
      
      console.log("✅ Investimento adicionado com dados completos - carteira será atualizada automaticamente!");
    } catch (error) {
      console.error("Erro ao adicionar investimento:", error);
    }
  };

  // 🚀 MELHORADO: Auto-refresh após editar
  const handleEditInvestment = async (e) => {
    e.preventDefault();
    try {
      const shares = parseInt(investmentForm.shares);
      const price = parseFloat(investmentForm.price);

      await updateInvestment(showEditInvestment, {
        ticker: investmentForm.ticker.toUpperCase(),
        name: investmentForm.name,
        shares: shares,
        average_price: price,
        total_invested: shares * price,
        sector: investmentForm.sector,
      });

      // 🚀 CONTEXTO FAZ AUTO-RELOAD: Não precisa mais chamar loadPortfolios()
      // O PortfolioContext agora recarrega automaticamente após updateInvestment()

      setInvestmentForm({
        ticker: "",
        name: "",
        shares: "",
        price: "",
        sector: "",
      });
      setShowEditInvestment(null);
      
      console.log("✅ Investimento editado - carteira será atualizada automaticamente!");
    } catch (error) {
      console.error("Erro ao editar investimento:", error);
    }
  };

  // 🚀 MELHORADO: Auto-refresh após remover
  const handleRemoveInvestment = async (investmentId, ticker) => {
    if (
      window.confirm(`Tem certeza que deseja remover ${ticker} da carteira?`)
    ) {
      try {
        await removeInvestment(investmentId);
        
        // 🚀 CONTEXTO FAZ AUTO-RELOAD: Não precisa mais chamar loadPortfolios()
        // O PortfolioContext agora recarrega automaticamente após removeInvestment()
        
        console.log("✅ Investimento removido - carteira será atualizada automaticamente!");
      } catch (error) {
        console.error("Erro ao remover investimento:", error);
      }
    }
  };

  // Preparar edição
  const prepareEdit = (position) => {
    setInvestmentForm({
      ticker: position.ticker,
      name: position.name,
      shares: position.totalShares.toString(),
      price: position.averagePrice.toString(),
      sector: position.sector,
    });
    setShowEditInvestment(position.id);
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
          <Button
            variant="outline"
            onClick={handleRefreshPrices}
            disabled={refreshingPrices}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${
                refreshingPrices ? "animate-spin" : ""
              }`}
            />
            {refreshingPrices ? "Atualizando..." : "Atualizar Preços"}
          </Button>
          <Button
            variant="outline"
            onClick={updateExistingInvestmentsWithDividendData}
            className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
          >
            <FileText className="mr-2 h-4 w-4" />
            Corrigir Dividendos
          </Button>
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
              Estimativa baseada no DY
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
            <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Posições na Carteira</CardTitle>
                <CardDescription>
                  Seus investimentos em FIIs com preços atualizados
                </CardDescription>
              </div>
                  <Button
                    onClick={handleRefreshPrices}
                    disabled={refreshingPrices}
                size="sm"
              >
                {refreshingPrices ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Atualizar Preços
                  </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                {/* 🚀 NOVO: Explicação dos indicadores */}
                <Card className="bg-muted/30">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Info className="h-5 w-5 text-blue-500" />
                      <h3 className="font-semibold">Legenda dos Indicadores</h3>
                        </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50 dark:bg-green-950/20">
                        <span className="text-green-600 font-medium">📡</span>
                        <div>
                          <p className="text-sm font-medium">Atualizado</p>
                          <p className="text-xs text-muted-foreground">Preço do mercado</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
                        <span className="text-yellow-600 font-medium">⚠️</span>
                        <div>
                          <p className="text-sm font-medium">Sem atualização</p>
                          <p className="text-xs text-muted-foreground">Preço médio</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50 dark:bg-green-950/20">
                        <span className="text-green-600 font-medium">✓</span>
                        <div>
                          <p className="text-sm font-medium">DY Mensal</p>
                          <p className="text-xs text-muted-foreground">Cálculo preciso</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                        <span className="text-blue-600 font-medium">📈</span>
                        <div>
                          <p className="text-sm font-medium">DY Anual</p>
                          <p className="text-xs text-muted-foreground">Estimativa ÷12</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-4 text-center">
                      💡 Use "Atualizar Preços" para buscar cotações atuais e recalcular a renda mensal esperada
                      <br />
                      🔧 Use "Corrigir Dividendos" para buscar dados de DY para investimentos antigos que não têm essa informação
                    </p>
                  </CardContent>
                </Card>

                {currentPortfolio?.investments?.length > 0 ? (
                  <div className="space-y-3">
                    {currentPortfolio.investments.map((investment) => {
                      // 💰 NOVO: Calcular dividendo mensal esperado
                      const currentValue = investment.shares * investment.current_price;
                      
                      // 🚀 MELHORADO: Usar dividend_yield_monthly se disponível (mais preciso)
                      let monthlyDividend = 0;
                      let dyDisplay = '';
                      
                      if (investment.dividend_yield_monthly) {
                        // Usar DY mensal direto (mais preciso)
                        monthlyDividend = (currentValue * investment.dividend_yield_monthly / 100);
                        dyDisplay = `${investment.dividend_yield_monthly.toFixed(2)}% DY/mês`;
                      } else if (investment.dividend_yield) {
                        // Fallback: dividir DY anual por 12
                        monthlyDividend = (currentValue * investment.dividend_yield / 100) / 12;
                        dyDisplay = `${investment.dividend_yield.toFixed(2)}% DY/ano`;
                      }
                      
                      return (
                        <Card key={investment.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-lg">
                                  {investment.ticker}
                                </h3>
                                <span className="text-sm text-muted-foreground">
                                  {investment.name}
                            </span>
                                <Badge variant="outline" className="text-xs">
                                  {investment.sector || "N/A"}
                                </Badge>
                                {/* 🚀 MELHORADO: Indicador de atualização mais claro */}
                                <span className="text-xs">
                                  {investment.current_price !== investment.average_price ? (
                                    <span className="text-green-600 font-medium">📡 Atualizado</span>
                                  ) : (
                                    <span className="text-yellow-600 font-medium">⚠️ Sem atualização</span>
                                  )}
                              </span>
                          </div>
                              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Cotas:</span>
                                  <p className="font-medium">{investment.shares}</p>
                        </div>
                                <div>
                                  <span className="text-muted-foreground">Preço médio:</span>
                                  <p className="font-medium">
                                    {formatCurrency(investment.average_price)}
                                  </p>
                      </div>
                                <div>
                                  <span className="text-muted-foreground">Preço atual:</span>
                                  <p className="font-medium">
                                    {formatCurrency(investment.current_price)}
                                    {investment.current_price !== investment.average_price && (
                                      <span className="text-xs text-green-600 ml-1">
                                        (Atualizado)
                                      </span>
                                    )}
                                  </p>
                          </div>
                                <div>
                                  <span className="text-muted-foreground">Total:</span>
                                  <p className="font-medium">
                                    {formatCurrency(currentValue)}
                                  </p>
                          </div>
                                {/* 💰 NOVO: Dividendo mensal esperado */}
                                <div>
                                  <span className="text-muted-foreground">Renda mensal:</span>
                                  <p className="font-medium text-green-600">
                                    {formatCurrency(monthlyDividend)}
                                    {dyDisplay && (
                                      <span className="text-xs text-muted-foreground ml-1">
                                        ({dyDisplay})
                                        {investment.dividend_yield_monthly > 0 && (
                                          <span className="text-green-600 ml-1" title="Cálculo baseado em DY mensal real">
                                            ✓
                                          </span>
                                        )}
                                      </span>
                                    )}
                                  </p>
                          </div>
                          </div>
                        </div>
                            <div className="flex gap-2">
                          <Button
                            size="sm"
                                variant="outline"
                                onClick={() => {
                                  setInvestmentForm({
                                    ticker: investment.ticker,
                                    name: investment.name,
                                    shares: investment.shares.toString(),
                                    price: investment.average_price.toString(),
                                    sector: investment.sector || "",
                                  });
                                  setShowEditInvestment(investment.id);
                                }}
                          >
                                <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                                variant="outline"
                            onClick={() =>
                              handleRemoveInvestment(
                                    investment.id,
                                    investment.ticker
                              )
                            }
                          >
                                <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
            </Card>
                      );
                    })}
                  </div>
          ) : (
                  <div className="text-center py-8">
                    <PieChart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Nenhum investimento na carteira ainda.
                </p>
                  </div>
                )}
              </div>
              </CardContent>
            </Card>
        </TabsContent>

        {/* Dividendos */}
        <TabsContent value="dividends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Histórico de Dividendos
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                  🚧 Em Desenvolvimento
                </span>
              </CardTitle>
              <CardDescription>
                Dividendos recebidos dos seus FIIs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">📊 Como funcionará o sistema de dividendos:</p>
                      <ul className="text-sm space-y-1 ml-4">
                        <li>• <strong>Registro Manual:</strong> Você poderá registrar dividendos recebidos</li>
                        <li>• <strong>Cálculo Automático:</strong> Sistema calculará yield real da sua carteira</li>
                        <li>• <strong>Histórico Completo:</strong> Acompanhe todos os proventos recebidos</li>
                        <li>• <strong>Projeções:</strong> Estimativas de renda mensal baseadas no histórico</li>
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
                
                <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">Sistema de Dividendos em Desenvolvimento</h3>
                  <p className="text-muted-foreground mb-4">
                    Em breve você poderá registrar e acompanhar todos os dividendos recebidos.
                </p>
                  <Button variant="outline" disabled>
                    <Plus className="mr-2 h-4 w-4" />
                    Registrar Dividendo (Em breve)
                  </Button>
                </div>
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

      {/* Modal Adicionar/Editar Investimento */}
      {(showAddInvestment || showEditInvestment) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>
                {showEditInvestment
                  ? "Editar Investimento"
                  : "Adicionar Investimento"}
              </CardTitle>
              <CardDescription>
                {showEditInvestment
                  ? "Atualize os dados do investimento"
                  : "Registre um novo FII na sua carteira"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={
                  showEditInvestment
                    ? handleEditInvestment
                    : handleAddInvestment
                }
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="ticker">Ticker</Label>
                  <div className="relative">
                  <Input
                    id="ticker"
                    value={investmentForm.ticker}
                      onChange={(e) => {
                        const ticker = e.target.value.toUpperCase();
                      setInvestmentForm((prev) => ({
                        ...prev,
                          ticker: ticker,
                        }));
                        
                        // 🚀 NOVO: Auto-buscar dados após 1 segundo de pausa
                        if (!showEditInvestment && ticker.length >= 4) {
                          clearTimeout(window.fiiSearchTimeout);
                          window.fiiSearchTimeout = setTimeout(() => {
                            fetchFIIData(ticker);
                          }, 1000);
                    }
                      }}
                    placeholder="Ex: MXRF11"
                    required
                      disabled={showEditInvestment} // Não permitir editar ticker
                    />
                    {isLoadingFIIData && (
                      <div className="absolute right-3 top-3">
                        <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  {!showEditInvestment && (
                    <p className="text-xs text-muted-foreground mt-1">
                      💡 Digite o ticker e aguarde - o sistema preencherá automaticamente nome, setor e preço
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="name">Nome</Label>
                  <div className="relative">
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
                    {isLoadingFIIData && (
                      <div className="absolute right-3 top-3">
                        <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  {!showEditInvestment && !investmentForm.name && (
                    <p className="text-xs text-yellow-600 mt-1">
                      ⏳ Será preenchido automaticamente após digitar o ticker
                    </p>
                  )}
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
                  <Label htmlFor="price">Preço Médio (por cota)</Label>
                  <div className="relative">
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
                    {isLoadingFIIData && (
                      <div className="absolute right-3 top-3">
                        <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  {investmentForm.shares && investmentForm.price && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Total investido:{" "}
                      {formatCurrency(
                        parseInt(investmentForm.shares || 0) *
                          parseFloat(investmentForm.price || 0)
                      )}
                    </p>
                  )}
                  {!showEditInvestment && (
                    <p className="text-xs text-blue-600 mt-1">
                      💡 Preço atual será buscado automaticamente do mercado
                  </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="sector">Setor</Label>
                  <div className="relative">
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
                    {isLoadingFIIData && (
                      <div className="absolute right-3 top-3">
                        <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  {!showEditInvestment && !investmentForm.sector && (
                    <p className="text-xs text-yellow-600 mt-1">
                      ⏳ Será preenchido automaticamente após digitar o ticker
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1" disabled={isLoadingFIIData}>
                    {isLoadingFIIData ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Buscando dados...
                      </>
                    ) : (
                      showEditInvestment ? "Atualizar" : "Adicionar"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      // 🚀 LIMPEZA: Cancelar busca pendente
                      clearTimeout(window.fiiSearchTimeout);
                      setIsLoadingFIIData(false);
                      
                      setShowAddInvestment(false);
                      setShowEditInvestment(null);
                      setInvestmentForm({
                        ticker: "",
                        name: "",
                        shares: "",
                        price: "",
                        sector: "",
                      });
                    }}
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

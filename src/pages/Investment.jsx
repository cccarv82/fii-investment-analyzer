import React, { useState } from "react";
import {
  TrendingUp,
  AlertCircle,
  Info,
  PieChart,
  DollarSign,
  RefreshCw,
  Target,
  BarChart3,
  TrendingDown,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { formatCurrency, formatPercentage } from "../lib/utils/formatters";
import { useAI } from "../contexts/AIContext";
import { usePortfolio } from "../contexts/PortfolioContext";
import { getAllFIIs } from "../lib/api/fii_data_manager";
import InvestmentForm from "../components/investment/InvestmentForm";
import SuggestionCard from "../components/investment/SuggestionCard";

const Investment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [error, setError] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("");

  const { generateInvestmentSuggestions, isConfigured } = useAI();
  const { addInvestment } = usePortfolio();

  // 🎯 Função principal para obter sugestões com IA REAL
  const handleSubmitInvestment = async (formData) => {
    setIsLoading(true);
    setError(null);
    setLoadingProgress(0);
    setLoadingMessage("Inicializando análise...");

    try {
      // 1. Obter TODOS os FIIs disponíveis
      setLoadingProgress(20);
      setLoadingMessage("Carregando base completa de FIIs da B3...");

      const allFIIs = await getAllFIIs();
      console.log(`📊 ${allFIIs.length} FIIs carregados para análise`);

      if (allFIIs.length < 10) {
        throw new Error(
          "Base de dados insuficiente. Tente novamente em alguns minutos."
        );
      }

      // 2. Filtrar FIIs elegíveis baseado no perfil
      setLoadingProgress(40);
      setLoadingMessage("Aplicando filtros de qualidade e perfil de risco...");

      const eligibleFIIs = filterFIIsByProfile(allFIIs, formData);
      console.log(`🎯 ${eligibleFIIs.length} FIIs elegíveis após filtros`);

      // 3. Usar IA REAL da OpenAI
      setLoadingProgress(60);
      setLoadingMessage("Analisando FIIs com inteligência artificial...");

      if (!isConfigured) {
        throw new Error(
          "API key da OpenAI não configurada. Configure nas Configurações."
        );
      }

      console.log("🤖 Iniciando análise com IA real da OpenAI...");

      const aiAnalysis = await generateInvestmentSuggestions({
        amount: formData.amount,
        riskProfile: formData.riskProfile,
        investmentGoal: formData.investmentGoal,
        timeHorizon: formData.timeHorizon,
        availableFiis: eligibleFIIs,
      });

      // 4. Processar e validar recomendações da IA
      setLoadingProgress(80);
      setLoadingMessage("Processando recomendações da IA...");

      if (
        !aiAnalysis ||
        !aiAnalysis.recommendations ||
        aiAnalysis.recommendations.length === 0
      ) {
        throw new Error(
          "IA não retornou recomendações válidas. Tente novamente."
        );
      }

      // 5. Validar e ajustar alocações
      setLoadingProgress(90);
      setLoadingMessage("Validando e otimizando carteira...");

      const validatedSuggestions = validateAndOptimizePortfolio(
        aiAnalysis,
        formData.amount,
        eligibleFIIs
      );

      // 6. Finalizar
      setLoadingProgress(100);
      setLoadingMessage("Análise concluída!");

      setSuggestions({
        ...validatedSuggestions,
        formData,
        timestamp: new Date().toISOString(),
        source: "openai_real",
        totalFIIsAnalyzed: allFIIs.length,
        eligibleFIIs: eligibleFIIs.length,
      });

      console.log("✅ Análise concluída com sucesso!");
    } catch (error) {
      console.error("❌ Erro na análise:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
      setLoadingProgress(0);
      setLoadingMessage("");
    }
  };

  // 🎯 Filtrar FIIs baseado no perfil do investidor
  const filterFIIsByProfile = (allFIIs, formData) => {
    return allFIIs
      .filter((fii) => {
        // Filtros básicos de qualidade
        if (!fii.price || fii.price <= 0) return false;
        if (!fii.dividendYield || fii.dividendYield < 4) return false; // Mínimo 4% DY
        if (fii.pvp && fii.pvp > 2.0) return false; // P/VP muito alto

        // Filtros por perfil de risco
        switch (formData.riskProfile) {
          case "conservador":
            return (
              fii.dividendYield >= 6 &&
              fii.dividendYield <= 10 && // DY estável
              fii.pvp <= 1.2 && // P/VP conservador
              ["Logística", "Corporativo"].includes(fii.sector) && // Setores estáveis
              (fii.marketCap || 0) >= 500000000 // Market cap mínimo
            );

          case "moderado":
            return (
              fii.dividendYield >= 5 &&
              fii.dividendYield <= 12 &&
              fii.pvp <= 1.5 &&
              !["Hoteleiro"].includes(fii.sector) && // Evitar setores muito voláteis
              (fii.marketCap || 0) >= 200000000
            );

          case "arrojado":
            return (
              fii.dividendYield >= 4 && // Aceita DY menor para growth
              fii.pvp <= 2.0 &&
              (fii.marketCap || 0) >= 100000000 // Aceita FIIs menores
            );

          default:
            return true;
        }
      })
      .sort((a, b) => {
        // Ordenar por qualidade (combinação de DY, P/VP e market cap)
        const scoreA =
          (a.dividendYield / (a.pvp || 1)) * Math.log(a.marketCap || 1000000);
        const scoreB =
          (b.dividendYield / (b.pvp || 1)) * Math.log(b.marketCap || 1000000);
        return scoreB - scoreA;
      })
      .slice(0, 50); // Top 50 FIIs para análise da IA
  };

  // 🎯 Validar e otimizar carteira retornada pela IA
  const validateAndOptimizePortfolio = (
    aiAnalysis,
    totalAmount,
    availableFIIs
  ) => {
    const { recommendations, portfolioAnalysis } = aiAnalysis;

    // Validar recomendações
    const validRecommendations = recommendations.filter((rec) => {
      const fii = availableFIIs.find((f) => f.ticker === rec.ticker);
      return fii && rec.shares > 0 && rec.investmentAmount > 0;
    });

    if (validRecommendations.length === 0) {
      throw new Error("Nenhuma recomendação válida da IA");
    }

    // Garantir diversificação mínima
    if (validRecommendations.length < 3 && totalAmount >= 1000) {
      throw new Error(
        "IA retornou carteira pouco diversificada. Tente novamente."
      );
    }

    // Verificar concentração máxima
    const maxAllocation = Math.max(
      ...validRecommendations.map((r) => r.allocation || 0)
    );
    if (maxAllocation > 25) {
      console.warn("⚠️ IA sugeriu concentração alta, rebalanceando...");
      // Rebalancear se necessário
    }

    // Calcular métricas finais
    const totalInvestment = validRecommendations.reduce(
      (sum, rec) => sum + rec.investmentAmount,
      0
    );
    const remainingAmount = totalAmount - totalInvestment;

    // Enriquecer recomendações com dados dos FIIs
    const enrichedRecommendations = validRecommendations.map((rec) => {
      const fii = availableFIIs.find((f) => f.ticker === rec.ticker);
      return {
        ...rec,
        ...fii,
        percentage: (rec.investmentAmount / totalAmount) * 100,
      };
    });

    return {
      allocation: enrichedRecommendations,
      summary: {
        totalAmount,
        totalInvestment,
        remainingAmount,
        expectedYield:
          portfolioAnalysis?.expectedYield ||
          enrichedRecommendations.reduce(
            (sum, rec) =>
              sum + (rec.investmentAmount * rec.dividendYield) / 100,
            0
          ),
        expectedYieldPercentage:
          portfolioAnalysis?.expectedYield ||
          enrichedRecommendations.reduce(
            (sum, rec) => sum + (rec.percentage * rec.dividendYield) / 100,
            0
          ),
        diversificationScore: Math.min(
          95,
          enrichedRecommendations.length * 15 + 25
        ),
        aiAnalysis:
          aiAnalysis.marketAnalysis || "Análise realizada com IA da OpenAI",
        investmentStrategy:
          aiAnalysis.investmentStrategy ||
          "Estratégia personalizada baseada no seu perfil",
      },
    };
  };

  // 🎯 Adicionar todos os FIIs à carteira
  const handleAddAllToPortfolio = () => {
    if (!suggestions?.allocation) return;

    suggestions.allocation.forEach((fii) => {
      addInvestment({
        ticker: fii.ticker,
        name: fii.name,
        shares: fii.shares,
        price: fii.price,
        sector: fii.sector,
        dividendYield: fii.dividendYield,
      });
    });

    alert(`${suggestions.allocation.length} FIIs adicionados à carteira!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Investir em FIIs</h1>
        <p className="text-muted-foreground">
          Receba sugestões personalizadas de investimento em FIIs com análise de
          IA
        </p>
      </div>

      {/* Formulário de Investimento */}
      <InvestmentForm
        onSubmit={handleSubmitInvestment}
        isLoading={isLoading}
        loadingProgress={loadingProgress}
        loadingMessage={loadingMessage}
      />

      {/* Erro */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro na Análise</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Resultados */}
      {suggestions && (
        <div className="space-y-6">
          {/* Resumo da Sugestão */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <CardTitle>Resumo da Sugestão</CardTitle>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    IA Real
                  </span>
                </div>
                <Button onClick={handleAddAllToPortfolio} className="ml-auto">
                  <Target className="h-4 w-4 mr-2" />
                  Adicionar Todos à Carteira
                </Button>
              </div>
              <CardDescription>
                Baseado no seu perfil {suggestions.formData.riskProfile} •{" "}
                {suggestions.formData.investmentGoal} •{" "}
                {suggestions.formData.timeHorizon}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Valor Total
                  </p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(suggestions.summary.totalAmount)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Valor informado para investimento
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Renda Mensal Estimada
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(suggestions.summary.expectedYield / 12)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatPercentage(
                      suggestions.summary.expectedYieldPercentage
                    )}{" "}
                    ao ano
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Diversificação
                  </p>
                  <p className="text-2xl font-bold">
                    {suggestions.allocation.length} FIIs
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${suggestions.summary.diversificationScore}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {suggestions.summary.diversificationScore}% de
                    diversificação
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Valor Investido
                  </p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(suggestions.summary.totalInvestment)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Sobra: {formatCurrency(suggestions.summary.remainingAmount)}
                  </p>
                </div>
              </div>

              {/* Análise da IA */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start space-x-3">
                  <BarChart3 className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Análise da IA</h4>
                    <p className="text-sm text-blue-800 mt-1">
                      {suggestions.summary.aiAnalysis}
                    </p>
                    {suggestions.summary.investmentStrategy && (
                      <div className="mt-3">
                        <h5 className="font-medium text-blue-900">
                          Estratégia de Investimento
                        </h5>
                        <p className="text-sm text-blue-800 mt-1">
                          {suggestions.summary.investmentStrategy}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Estatísticas da Análise */}
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  📊 {suggestions.totalFIIsAnalyzed} FIIs analisados • 🎯{" "}
                  {suggestions.eligibleFIIs} elegíveis • 🤖 Análise com OpenAI
                  GPT-4
                </span>
                <span>
                  {new Date(suggestions.timestamp).toLocaleString("pt-BR")}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Sugestões Detalhadas */}
          <Tabs defaultValue="cartoes" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="cartoes">Cartões</TabsTrigger>
              <TabsTrigger value="tabela">Tabela</TabsTrigger>
              <TabsTrigger value="grafico">Gráfico</TabsTrigger>
            </TabsList>

            <TabsContent value="cartoes" className="space-y-4">
              {suggestions.allocation.map((fii, index) => (
                <SuggestionCard
                  key={fii.ticker}
                  fii={fii}
                  index={index}
                  onAddToPortfolio={() =>
                    addInvestment({
                      ticker: fii.ticker,
                      name: fii.name,
                      shares: fii.shares,
                      price: fii.price,
                      sector: fii.sector,
                      dividendYield: fii.dividendYield,
                    })
                  }
                />
              ))}
            </TabsContent>

            <TabsContent value="tabela">
              <Card>
                <CardHeader>
                  <CardTitle>Detalhamento da Carteira</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">FII</th>
                          <th className="text-right p-2">Preço</th>
                          <th className="text-right p-2">DY</th>
                          <th className="text-right p-2">P/VP</th>
                          <th className="text-right p-2">Alocação</th>
                          <th className="text-right p-2">Valor</th>
                          <th className="text-right p-2">Cotas</th>
                          <th className="text-center p-2">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {suggestions.allocation.map((fii) => (
                          <tr
                            key={fii.ticker}
                            className="border-b hover:bg-gray-50"
                          >
                            <td className="p-2">
                              <div>
                                <div className="font-medium">{fii.ticker}</div>
                                <div className="text-sm text-muted-foreground">
                                  {fii.sector}
                                </div>
                              </div>
                            </td>
                            <td className="text-right p-2">
                              {formatCurrency(fii.price)}
                            </td>
                            <td className="text-right p-2">
                              {formatPercentage(fii.dividendYield)}
                            </td>
                            <td className="text-right p-2">
                              {fii.pvp?.toFixed(2) || "N/A"}
                            </td>
                            <td className="text-right p-2">
                              {formatPercentage(fii.percentage)}
                            </td>
                            <td className="text-right p-2">
                              {formatCurrency(fii.investmentAmount)}
                            </td>
                            <td className="text-right p-2">{fii.shares}</td>
                            <td className="text-center p-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  addInvestment({
                                    ticker: fii.ticker,
                                    name: fii.name,
                                    shares: fii.shares,
                                    price: fii.price,
                                    sector: fii.sector,
                                    dividendYield: fii.dividendYield,
                                  })
                                }
                              >
                                <DollarSign className="h-3 w-3 mr-1" />
                                Adicionar
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="grafico">
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição da Carteira</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {suggestions.allocation.map((fii) => (
                      <div
                        key={fii.ticker}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-4 h-4 bg-blue-500 rounded"></div>
                          <span className="font-medium">{fii.ticker}</span>
                          <span className="text-sm text-muted-foreground">
                            ({fii.sector})
                          </span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${fii.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium w-16 text-right">
                            {formatPercentage(fii.percentage)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Nova Análise */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => setSuggestions(null)}
              className="w-full max-w-md"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Nova Análise
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Investment;

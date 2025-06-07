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

      // 2. Filtrar FIIs elegíveis baseado no perfil (CORRIGIDO)
      setLoadingProgress(40);
      setLoadingMessage("Aplicando filtros de qualidade e perfil de risco...");

      const eligibleFIIs = filterFIIsByProfile(allFIIs, formData);
      console.log(`🎯 ${eligibleFIIs.length} FIIs elegíveis após filtros`);

      // 🔧 CORREÇÃO: Se poucos FIIs elegíveis, relaxar filtros
      let finalEligibleFIIs = eligibleFIIs;
      if (eligibleFIIs.length < 10) {
        console.log("⚠️ Poucos FIIs elegíveis, relaxando filtros...");
        finalEligibleFIIs = relaxFilters(allFIIs, formData);
        console.log(`🎯 ${finalEligibleFIIs.length} FIIs após relaxar filtros`);
      }

      if (finalEligibleFIIs.length === 0) {
        throw new Error(
          "Nenhum FII encontrado com os critérios especificados. Tente ajustar seu perfil de risco."
        );
      }

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
        availableFiis: finalEligibleFIIs,
      });

      // 4. Processar e validar recomendações da IA
      setLoadingProgress(80);
      setLoadingMessage("Processando recomendações da IA...");

      if (
        !aiAnalysis ||
        !aiAnalysis.suggestions ||
        aiAnalysis.suggestions.length === 0
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
        finalEligibleFIIs
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
        eligibleFIIs: finalEligibleFIIs.length,
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

  // 🔧 FILTROS CORRIGIDOS - Menos restritivos
  const filterFIIsByProfile = (allFIIs, formData) => {
    return allFIIs
      .filter((fii) => {
        // Filtros básicos de qualidade (mais flexíveis)
        if (!fii.price || fii.price <= 0) return false;
        if (!fii.dividendYield || fii.dividendYield < 3) return false; // Reduzido de 4% para 3%
        if (fii.pvp && fii.pvp > 2.5) return false; // Aumentado de 2.0 para 2.5

        // Filtros por perfil de risco (CORRIGIDOS)
        switch (formData.riskProfile) {
          case "conservador":
            return (
              fii.dividendYield >= 5 && // Reduzido de 6% para 5%
              fii.dividendYield <= 12 && // Aumentado de 10% para 12%
              fii.pvp <= 1.5 && // Aumentado de 1.2 para 1.5
              // 🔧 CORREÇÃO: Mais setores permitidos
              ["Logística", "Corporativo", "Recebíveis", "Híbrido"].includes(
                fii.sector
              ) &&
              (fii.marketCap || 0) >= 100000000 // Reduzido de 500M para 100M
            );

          case "moderado":
            return (
              fii.dividendYield >= 4 && // Reduzido de 5% para 4%
              fii.dividendYield <= 15 && // Aumentado de 12% para 15%
              fii.pvp <= 2.0 && // Aumentado de 1.5 para 2.0
              // 🔧 CORREÇÃO: Apenas exclui setores muito voláteis
              !["Hoteleiro"].includes(fii.sector) &&
              (fii.marketCap || 0) >= 50000000 // Reduzido de 200M para 50M
            );

          case "arrojado":
            return (
              fii.dividendYield >= 3 && // Reduzido de 4% para 3%
              fii.pvp <= 2.5 && // Aumentado de 2.0 para 2.5
              (fii.marketCap || 0) >= 20000000 // Reduzido de 100M para 20M
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
      .slice(0, 80); // Aumentado de 50 para 80 FIIs
  };

  // 🔧 NOVA FUNÇÃO: Relaxar filtros quando poucos FIIs elegíveis
  const relaxFilters = (allFIIs, formData) => {
    return allFIIs
      .filter((fii) => {
        // Filtros mínimos apenas
        if (!fii.price || fii.price <= 0) return false;
        if (!fii.dividendYield || fii.dividendYield < 2) return false; // Muito flexível
        if (fii.pvp && fii.pvp > 3.0) return false; // Muito flexível

        // Filtros muito relaxados por perfil
        switch (formData.riskProfile) {
          case "conservador":
            return (
              fii.dividendYield >= 4 &&
              fii.pvp <= 2.0 &&
              (fii.marketCap || 0) >= 50000000
            );

          case "moderado":
            return (
              fii.dividendYield >= 3 &&
              fii.pvp <= 2.5 &&
              (fii.marketCap || 0) >= 20000000
            );

          case "arrojado":
            return (
              fii.dividendYield >= 2 &&
              fii.pvp <= 3.0 &&
              (fii.marketCap || 0) >= 10000000
            );

          default:
            return true;
        }
      })
      .sort((a, b) => {
        const scoreA =
          (a.dividendYield / (a.pvp || 1)) * Math.log(a.marketCap || 1000000);
        const scoreB =
          (b.dividendYield / (b.pvp || 1)) * Math.log(b.marketCap || 1000000);
        return scoreB - scoreA;
      })
      .slice(0, 50);
  };

  // 🎯 Validar e otimizar carteira retornada pela IA
  const validateAndOptimizePortfolio = (
    aiAnalysis,
    totalAmount,
    availableFIIs
  ) => {
    const { suggestions, portfolioAnalysis } = aiAnalysis;

    // Validar recomendações
    const validRecommendations = suggestions.filter((rec) => {
      const fii = availableFIIs.find((f) => f.ticker === rec.ticker);
      return fii && rec.shares > 0 && rec.investmentAmount > 0;
    });

    if (validRecommendations.length === 0) {
      throw new Error("Nenhuma recomendação válida da IA");
    }

    // 🔧 CORREÇÃO: Diversificação mais flexível
    if (validRecommendations.length < 2 && totalAmount >= 2000) {
      throw new Error(
        "IA retornou carteira pouco diversificada. Tente novamente."
      );
    }

    // Verificar concentração máxima (mais flexível)
    const maxAllocation = Math.max(
      ...validRecommendations.map((r) => r.percentage || 0)
    );
    if (maxAllocation > 40) {
      // Aumentado de 25% para 40%
      console.warn(
        "⚠️ IA sugeriu concentração alta, mas aceitável para o valor investido"
      );
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
          portfolioAnalysis?.expectedReturn ||
          enrichedRecommendations.reduce(
            (sum, rec) =>
              sum + (rec.investmentAmount * rec.dividendYield) / 100,
            0
          ),
        expectedYieldPercentage:
          portfolioAnalysis?.averageYield ||
          enrichedRecommendations.reduce(
            (sum, rec) => sum + (rec.percentage * rec.dividendYield) / 100,
            0
          ),
        diversificationScore: Math.min(
          95,
          enrichedRecommendations.length * 15 + 25
        ),
        aiAnalysis: aiAnalysis.strategy || "Análise realizada com IA da OpenAI",
        investmentStrategy:
          aiAnalysis.portfolioAnalysis?.strengths?.join(", ") ||
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
          {/* Resumo da Análise */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Análise Concluída
              </CardTitle>
              <CardDescription>
                Sugestões personalizadas baseadas em{" "}
                {suggestions.totalFIIsAnalyzed} FIIs analisados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {suggestions.totalFIIsAnalyzed}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    FIIs Analisados
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {suggestions.eligibleFIIs}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    FIIs Elegíveis
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {suggestions.allocation.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    FIIs Sugeridos
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {formatPercentage(
                      suggestions.summary.expectedYieldPercentage
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">DY Médio</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs de Resultados */}
          <Tabs defaultValue="suggestions" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="suggestions">Sugestões</TabsTrigger>
              <TabsTrigger value="analysis">Análise</TabsTrigger>
              <TabsTrigger value="summary">Resumo</TabsTrigger>
            </TabsList>

            {/* Sugestões */}
            <TabsContent value="suggestions" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Carteira Sugerida</h3>
                <Button
                  onClick={handleAddAllToPortfolio}
                  className="flex items-center gap-2"
                >
                  <PieChart className="h-4 w-4" />
                  Adicionar Todos à Carteira
                </Button>
              </div>

              <div className="grid gap-4">
                {suggestions.allocation.map((fii, index) => (
                  <SuggestionCard
                    key={fii.ticker}
                    suggestion={fii}
                    index={index}
                    onAddToPortfolio={() => {
                      addInvestment({
                        ticker: fii.ticker,
                        name: fii.name,
                        shares: fii.shares,
                        price: fii.price,
                        sector: fii.sector,
                        dividendYield: fii.dividendYield,
                      });
                    }}
                  />
                ))}
              </div>
            </TabsContent>

            {/* Análise */}
            <TabsContent value="analysis" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Análise da Estratégia
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">
                        Estratégia de Investimento
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {suggestions.summary.investmentStrategy}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Análise de Mercado</h4>
                      <p className="text-sm text-muted-foreground">
                        {suggestions.summary.aiAnalysis}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Resumo */}
            <TabsContent value="summary" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Resumo Financeiro
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Valor Total:</span>
                      <span className="font-medium">
                        {formatCurrency(suggestions.summary.totalAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Valor Investido:</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(suggestions.summary.totalInvestment)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Valor Restante:</span>
                      <span className="font-medium">
                        {formatCurrency(suggestions.summary.remainingAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Rendimento Esperado/Ano:</span>
                      <span className="font-medium text-blue-600">
                        {formatCurrency(suggestions.summary.expectedYield)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Métricas de Qualidade
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Diversificação:</span>
                      <span className="font-medium">
                        {suggestions.summary.diversificationScore}/100
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">DY Médio:</span>
                      <span className="font-medium">
                        {formatPercentage(
                          suggestions.summary.expectedYieldPercentage
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Número de FIIs:</span>
                      <span className="font-medium">
                        {suggestions.allocation.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Fonte:</span>
                      <span className="font-medium text-green-600">
                        IA Real
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Informações sobre IA */}
      {!isConfigured && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Configure a IA para Análises Reais</AlertTitle>
          <AlertDescription>
            Para receber análises fundamentalistas reais, configure sua API key
            da OpenAI nas Configurações.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default Investment;

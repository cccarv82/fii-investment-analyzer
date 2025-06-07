// 🔧 VERSÃO CORRIGIDA DO INVESTMENT.JSX COM DEBUG DETALHADO

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

  // 🔍 FUNÇÃO DE DEBUG DETALHADO
  const debugFIIData = (fiis, step) => {
    console.log(`\n🔍 DEBUG ${step}:`);
    console.log(`Total de FIIs: ${fiis.length}`);

    if (fiis.length > 0) {
      const sample = fiis[0];
      console.log("Estrutura do primeiro FII:", {
        ticker: sample.ticker,
        price: sample.price,
        dividendYield: sample.dividendYield,
        pvp: sample.pvp,
        sector: sample.sector,
        marketCap: sample.marketCap,
        allKeys: Object.keys(sample),
      });

      // Estatísticas rápidas
      const withPrice = fiis.filter((f) => f.price && f.price > 0).length;
      const withDY = fiis.filter(
        (f) => f.dividendYield && f.dividendYield > 0
      ).length;
      const withPVP = fiis.filter((f) => f.pvp && f.pvp > 0).length;
      const withSector = fiis.filter((f) => f.sector).length;

      console.log(
        `Estatísticas: price=${withPrice}, DY=${withDY}, PVP=${withPVP}, sector=${withSector}`
      );
    }
  };

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
      debugFIIData(allFIIs, "DADOS ORIGINAIS");

      if (allFIIs.length < 10) {
        throw new Error(
          "Base de dados insuficiente. Tente novamente em alguns minutos."
        );
      }

      // 2. Filtrar FIIs elegíveis baseado no perfil (COM DEBUG)
      setLoadingProgress(40);
      setLoadingMessage("Aplicando filtros de qualidade e perfil de risco...");

      const eligibleFIIs = filterFIIsByProfileWithDebug(allFIIs, formData);
      console.log(`🎯 ${eligibleFIIs.length} FIIs elegíveis após filtros`);
      debugFIIData(eligibleFIIs, "APÓS FILTROS PRINCIPAIS");

      // 🔧 CORREÇÃO: Se poucos FIIs elegíveis, relaxar filtros
      let finalEligibleFIIs = eligibleFIIs;
      if (eligibleFIIs.length < 10) {
        console.log("⚠️ Poucos FIIs elegíveis, relaxando filtros...");
        finalEligibleFIIs = relaxFiltersWithDebug(allFIIs, formData);
        console.log(`🎯 ${finalEligibleFIIs.length} FIIs após relaxar filtros`);
        debugFIIData(finalEligibleFIIs, "APÓS RELAXAR FILTROS");
      }

      if (finalEligibleFIIs.length === 0) {
        // 🚨 DEBUG CRÍTICO: Por que ZERO FIIs?
        console.log("🚨 ZERO FIIs ELEGÍVEIS - INVESTIGANDO...");

        // Testar cada filtro individualmente
        const testResults = testFiltersIndividually(allFIIs, formData);
        console.log("Resultados dos testes individuais:", testResults);

        throw new Error(`Nenhum FII encontrado com os critérios especificados. 
        Debug: ${JSON.stringify(testResults, null, 2)}`);
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

  // 🔍 FUNÇÃO PARA TESTAR FILTROS INDIVIDUALMENTE
  const testFiltersIndividually = (allFIIs, formData) => {
    const results = {};

    // Teste 1: Preço válido
    const withValidPrice = allFIIs.filter((fii) => fii.price && fii.price > 0);
    results.validPrice = `${withValidPrice.length}/${allFIIs.length}`;

    // Teste 2: DY mínimo
    const withMinDY = allFIIs.filter(
      (fii) => fii.dividendYield && fii.dividendYield >= 3
    );
    results.minDY = `${withMinDY.length}/${allFIIs.length}`;

    // Teste 3: P/VP máximo
    const withMaxPVP = allFIIs.filter((fii) => !fii.pvp || fii.pvp <= 2.5);
    results.maxPVP = `${withMaxPVP.length}/${allFIIs.length}`;

    // Teste 4: Combinação básica
    const basicCombo = allFIIs.filter(
      (fii) =>
        fii.price &&
        fii.price > 0 &&
        fii.dividendYield &&
        fii.dividendYield >= 3 &&
        (!fii.pvp || fii.pvp <= 2.5)
    );
    results.basicCombo = `${basicCombo.length}/${allFIIs.length}`;

    // Teste 5: Setores disponíveis
    const sectors = [
      ...new Set(allFIIs.map((fii) => fii.sector).filter(Boolean)),
    ];
    results.availableSectors = sectors;

    // Teste 6: Market cap ranges
    const marketCaps = allFIIs.filter(
      (fii) => fii.marketCap && fii.marketCap > 0
    );
    if (marketCaps.length > 0) {
      const caps = marketCaps.map((fii) => fii.marketCap);
      results.marketCapRange = {
        min: Math.min(...caps),
        max: Math.max(...caps),
        count: marketCaps.length,
      };
    }

    return results;
  };

  // 🔧 FILTROS COM DEBUG DETALHADO
  const filterFIIsByProfileWithDebug = (allFIIs, formData) => {
    console.log(`\n🔍 INICIANDO FILTROS PARA PERFIL: ${formData.riskProfile}`);

    let step = 1;
    let currentFIIs = [...allFIIs];

    // Filtro 1: Preço válido
    currentFIIs = currentFIIs.filter((fii) => {
      const valid = fii.price && fii.price > 0;
      if (!valid)
        console.log(
          `❌ Filtro ${step} - ${fii.ticker}: preço inválido (${fii.price})`
        );
      return valid;
    });
    console.log(
      `✅ Filtro ${step++} (preço válido): ${currentFIIs.length} restantes`
    );

    // Filtro 2: DY mínimo
    currentFIIs = currentFIIs.filter((fii) => {
      const valid = fii.dividendYield && fii.dividendYield >= 3;
      if (!valid)
        console.log(
          `❌ Filtro ${step} - ${fii.ticker}: DY baixo (${fii.dividendYield}%)`
        );
      return valid;
    });
    console.log(
      `✅ Filtro ${step++} (DY >= 3%): ${currentFIIs.length} restantes`
    );

    // Filtro 3: P/VP máximo
    currentFIIs = currentFIIs.filter((fii) => {
      const valid = !fii.pvp || fii.pvp <= 2.5;
      if (!valid)
        console.log(
          `❌ Filtro ${step} - ${fii.ticker}: P/VP alto (${fii.pvp})`
        );
      return valid;
    });
    console.log(
      `✅ Filtro ${step++} (P/VP <= 2.5): ${currentFIIs.length} restantes`
    );

    // Filtros por perfil de risco
    currentFIIs = currentFIIs.filter((fii) => {
      switch (formData.riskProfile) {
        case "conservador":
          const conservadorOK =
            fii.dividendYield >= 5 &&
            fii.dividendYield <= 12 &&
            (!fii.pvp || fii.pvp <= 1.5) &&
            ["Logística", "Corporativo", "Recebíveis", "Híbrido"].includes(
              fii.sector
            ) &&
            (fii.marketCap || 0) >= 100000000;
          if (!conservadorOK) {
            console.log(
              `❌ Perfil conservador - ${fii.ticker}: DY=${fii.dividendYield}%, P/VP=${fii.pvp}, setor=${fii.sector}, cap=${fii.marketCap}`
            );
          }
          return conservadorOK;

        case "moderado":
          const moderadoOK =
            fii.dividendYield >= 4 &&
            fii.dividendYield <= 15 &&
            (!fii.pvp || fii.pvp <= 2.0) &&
            !["Hoteleiro"].includes(fii.sector) &&
            (fii.marketCap || 0) >= 50000000;
          if (!moderadoOK) {
            console.log(
              `❌ Perfil moderado - ${fii.ticker}: DY=${fii.dividendYield}%, P/VP=${fii.pvp}, setor=${fii.sector}, cap=${fii.marketCap}`
            );
          }
          return moderadoOK;

        case "arrojado":
          const arrojadoOK =
            fii.dividendYield >= 3 &&
            (!fii.pvp || fii.pvp <= 2.5) &&
            (fii.marketCap || 0) >= 20000000;
          if (!arrojadoOK) {
            console.log(
              `❌ Perfil arrojado - ${fii.ticker}: DY=${fii.dividendYield}%, P/VP=${fii.pvp}, cap=${fii.marketCap}`
            );
          }
          return arrojadoOK;

        default:
          return true;
      }
    });
    console.log(
      `✅ Filtro ${step++} (perfil ${formData.riskProfile}): ${
        currentFIIs.length
      } restantes`
    );

    // Ordenar e limitar
    const sorted = currentFIIs
      .sort((a, b) => {
        const scoreA =
          (a.dividendYield / (a.pvp || 1)) * Math.log(a.marketCap || 1000000);
        const scoreB =
          (b.dividendYield / (b.pvp || 1)) * Math.log(b.marketCap || 1000000);
        return scoreB - scoreA;
      })
      .slice(0, 80);

    console.log(`✅ Final (top 80): ${sorted.length} FIIs selecionados`);

    if (sorted.length > 0) {
      console.log("Top 5 selecionados:");
      sorted.slice(0, 5).forEach((fii, i) => {
        console.log(
          `${i + 1}. ${fii.ticker}: R$ ${fii.price} | DY: ${
            fii.dividendYield
          }% | P/VP: ${fii.pvp} | ${fii.sector}`
        );
      });
    }

    return sorted;
  };

  // 🔧 FILTROS RELAXADOS COM DEBUG
  const relaxFiltersWithDebug = (allFIIs, formData) => {
    console.log(`\n🔍 RELAXANDO FILTROS PARA PERFIL: ${formData.riskProfile}`);

    let step = 1;
    let currentFIIs = [...allFIIs];

    // Filtros mínimos apenas
    currentFIIs = currentFIIs.filter((fii) => {
      const valid = fii.price && fii.price > 0;
      if (!valid)
        console.log(`❌ Relaxado ${step} - ${fii.ticker}: preço inválido`);
      return valid;
    });
    console.log(
      `✅ Relaxado ${step++} (preço válido): ${currentFIIs.length} restantes`
    );

    currentFIIs = currentFIIs.filter((fii) => {
      const valid = fii.dividendYield && fii.dividendYield >= 2;
      if (!valid)
        console.log(
          `❌ Relaxado ${step} - ${fii.ticker}: DY muito baixo (${fii.dividendYield}%)`
        );
      return valid;
    });
    console.log(
      `✅ Relaxado ${step++} (DY >= 2%): ${currentFIIs.length} restantes`
    );

    currentFIIs = currentFIIs.filter((fii) => {
      const valid = !fii.pvp || fii.pvp <= 3.0;
      if (!valid)
        console.log(
          `❌ Relaxado ${step} - ${fii.ticker}: P/VP muito alto (${fii.pvp})`
        );
      return valid;
    });
    console.log(
      `✅ Relaxado ${step++} (P/VP <= 3.0): ${currentFIIs.length} restantes`
    );

    // Filtros muito relaxados por perfil
    currentFIIs = currentFIIs.filter((fii) => {
      switch (formData.riskProfile) {
        case "conservador":
          const conservadorOK =
            fii.dividendYield >= 4 &&
            (!fii.pvp || fii.pvp <= 2.0) &&
            (fii.marketCap || 0) >= 50000000;
          if (!conservadorOK) {
            console.log(
              `❌ Relaxado conservador - ${fii.ticker}: falhou critérios relaxados`
            );
          }
          return conservadorOK;

        case "moderado":
          const moderadoOK =
            fii.dividendYield >= 3 &&
            (!fii.pvp || fii.pvp <= 2.5) &&
            (fii.marketCap || 0) >= 20000000;
          if (!moderadoOK) {
            console.log(
              `❌ Relaxado moderado - ${fii.ticker}: falhou critérios relaxados`
            );
          }
          return moderadoOK;

        case "arrojado":
          const arrojadoOK =
            fii.dividendYield >= 2 &&
            (!fii.pvp || fii.pvp <= 3.0) &&
            (fii.marketCap || 0) >= 10000000;
          if (!arrojadoOK) {
            console.log(
              `❌ Relaxado arrojado - ${fii.ticker}: falhou critérios relaxados`
            );
          }
          return arrojadoOK;

        default:
          return true;
      }
    });
    console.log(
      `✅ Relaxado ${step++} (perfil relaxado): ${currentFIIs.length} restantes`
    );

    const sorted = currentFIIs
      .sort((a, b) => {
        const scoreA =
          (a.dividendYield / (a.pvp || 1)) * Math.log(a.marketCap || 1000000);
        const scoreB =
          (b.dividendYield / (b.pvp || 1)) * Math.log(b.marketCap || 1000000);
        return scoreB - scoreA;
      })
      .slice(0, 50);

    console.log(`✅ Final relaxado: ${sorted.length} FIIs selecionados`);

    return sorted;
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

    // Diversificação mais flexível
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
          <AlertDescription className="whitespace-pre-wrap">
            {error}
          </AlertDescription>
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

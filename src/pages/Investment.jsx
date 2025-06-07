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
import { getAllFIIData, getBestFIIsForAI } from "../lib/api/fii_data_manager";
import InvestmentForm from "../components/investment/InvestmentForm";
import { SuggestionsList } from "../components/investment/SuggestionCard";

const Investment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [error, setError] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [activeTab, setActiveTab] = useState("analysis");

  const { generateInvestmentSuggestions, isConfigured, getBrapiToken } =
    useAI();
  const { addInvestment, positions } = usePortfolio();

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
        qualityScore: sample.qualityScore,
        allKeys: Object.keys(sample),
      });

      // Estatísticas rápidas
      const withPrice = fiis.filter((f) => f.price && f.price > 0).length;
      const withDY = fiis.filter(
        (f) => f.dividendYield && f.dividendYield > 0
      ).length;
      const withPVP = fiis.filter((f) => f.pvp && f.pvp > 0).length;
      const withSector = fiis.filter((f) => f.sector).length;
      const withScore = fiis.filter(
        (f) => f.qualityScore && f.qualityScore > 0
      ).length;

      console.log(
        `Estatísticas: price=${withPrice}, DY=${withDY}, PVP=${withPVP}, sector=${withSector}, score=${withScore}`
      );

      // Top 5 por score
      const topByScore = fiis
        .filter((f) => f.qualityScore)
        .sort((a, b) => b.qualityScore - a.qualityScore)
        .slice(0, 5);

      console.log("Top 5 por Quality Score:");
      topByScore.forEach((fii, i) => {
        console.log(
          `${i + 1}. ${fii.ticker}: Score ${fii.qualityScore}, DY ${
            fii.dividendYield
          }%, P/VP ${fii.pvp}`
        );
      });
    }
  };

  // 🎯 Função principal ULTIMATE para obter sugestões com IA SUPREMA
  const handleSubmitInvestment = async (formData) => {
    setIsLoading(true);
    setError(null);
    setLoadingProgress(0);
    setLoadingMessage("Inicializando análise ULTIMATE...");

    try {
      // 🔧 CORREÇÃO: Verificar configurações antes de começar
      if (!isConfigured) {
        throw new Error(
          "OpenAI API key não configurada. Configure nas Configurações."
        );
      }

      const brapiToken = getBrapiToken();
      if (!brapiToken) {
        throw new Error(
          "BRAPI token não configurado. Configure nas Configurações."
        );
      }

      // 1. 🚀 CARREGAR 300 FIIs (meta ultimate)
      setLoadingProgress(15);
      setLoadingMessage("Carregando 300 FIIs da B3 (meta ultimate)...");

      console.log(
        "🔑 [Investment] Usando BRAPI token do Supabase:",
        !!brapiToken
      );
      const allFIIs = await getAllFIIData(brapiToken);
      console.log(`📊 ${allFIIs.length} FIIs carregados para análise`);
      debugFIIData(allFIIs, "DADOS ORIGINAIS - 300 FIIs");

      // 🔧 VALIDAÇÃO: Verificar se temos FIIs suficientes
      if (allFIIs.length < 50) {
        throw new Error(
          `Apenas ${allFIIs.length} FIIs carregados. Verifique sua configuração BRAPI ou tente novamente.`
        );
      }

      // 2. 🎯 SELECIONAR OS 100 MELHORES PARA IA (algoritmo inteligente)
      setLoadingProgress(30);
      setLoadingMessage(
        "Selecionando os 100 melhores FIIs com algoritmo inteligente..."
      );

      const bestFIIs = await getBestFIIsForAI(brapiToken);
      console.log(`🏆 ${bestFIIs.length} melhores FIIs selecionados para IA`);
      debugFIIData(bestFIIs, "100 MELHORES PARA IA");

      if (bestFIIs.length < 20) {
        throw new Error(
          `Apenas ${bestFIIs.length} FIIs de qualidade encontrados. Tente novamente mais tarde.`
        );
      }

      // 3. 🔧 FILTRAR POR PERFIL DO USUÁRIO (dos 100 melhores) - FILTROS FLEXIBILIZADOS
      setLoadingProgress(45);
      setLoadingMessage("Aplicando filtros personalizados do seu perfil...");

      const profileFilteredFIIs = filterFIIsByProfileFlexible(
        bestFIIs,
        formData
      );
      console.log(
        `🎯 ${profileFilteredFIIs.length} FIIs após filtros de perfil`
      );
      debugFIIData(profileFilteredFIIs, "APÓS FILTROS DE PERFIL");

      // 🔧 GARANTIR MÍNIMO PARA IA
      let finalFIIsForAI = profileFilteredFIIs;
      if (profileFilteredFIIs.length < 30) {
        console.log("⚠️ Poucos FIIs após filtros, usando os 80 melhores");
        finalFIIsForAI = bestFIIs.slice(0, 80);
      }

      // 4. 🤖 USAR IA SUPREMA (PROMPT PICA DAS GALÁXIAS)
      setLoadingProgress(60);
      setLoadingMessage(
        "Analisando com IA SUPREMA (Warren Buffett + Ray Dalio + Peter Lynch)..."
      );

      console.log("🤖 Iniciando análise com IA SUPREMA...");
      const userProfile = {
        riskProfile: formData.riskProfile,
        investmentGoal: formData.investmentGoal,
        timeHorizon: formData.timeHorizon,
        investmentAmount: formData.amount,
      };

      // 🔧 DADOS OTIMIZADOS: Enviar apenas dados essenciais para IA
      const optimizedFIIs = finalFIIsForAI.slice(0, 100).map((fii) => ({
        ticker: fii.ticker,
        name: fii.name,
        price: fii.price,
        dividendYield: fii.dividendYield,
        pvp: fii.pvp,
        sector: fii.sector,
        marketCap: fii.marketCap,
        qualityScore: fii.qualityScore,
      }));

      console.log(
        `🎯 Enviando ${optimizedFIIs.length} FIIs otimizados para IA`
      );
      const aiAnalysis = await generateInvestmentSuggestions(
        optimizedFIIs,
        userProfile,
        positions || []
      );

      // 5. 🔧 PROCESSAR E VALIDAR RECOMENDAÇÕES DA IA
      setLoadingProgress(80);
      setLoadingMessage("Processando recomendações da IA SUPREMA...");

      if (
        !aiAnalysis ||
        !aiAnalysis.suggestions ||
        aiAnalysis.suggestions.length === 0
      ) {
        throw new Error(
          "IA não retornou recomendações válidas. Tente novamente."
        );
      }

      console.log(`✅ IA retornou ${aiAnalysis.suggestions.length} sugestões`);

      // 6. 🔧 VALIDAR E CALCULAR ALOCAÇÕES CORRETAS
      setLoadingProgress(90);
      setLoadingMessage("Validando e calculando alocações...");

      const validatedSuggestions = validateAndCalculateAllocations(
        aiAnalysis,
        formData.amount,
        allFIIs
      );

      // 7. ✅ FINALIZAR E MUDAR PARA ABA RESULTADOS
      setLoadingProgress(100);
      setLoadingMessage("Análise concluída com sucesso!");

      setSuggestions({
        ...validatedSuggestions,
        formData,
        timestamp: new Date().toISOString(),
        source: "ai_suprema",
        totalFIIsAnalyzed: allFIIs.length,
        bestFIIsSelected: bestFIIs.length,
        finalFIIsForAI: finalFIIsForAI.length,
      });

      // 🎯 AUTO-SWITCH PARA ABA RESULTADOS
      setTimeout(() => {
        setActiveTab("results");
      }, 1000);

      console.log("✅ Análise ULTIMATE concluída com sucesso!");
    } catch (error) {
      console.error("❌ Erro na análise:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
      setLoadingProgress(0);
      setLoadingMessage("");
    }
  };

  // 🔧 FILTROS FLEXIBILIZADOS POR PERFIL DO USUÁRIO
  const filterFIIsByProfileFlexible = (bestFIIs, formData) => {
    console.log(
      `\n🎯 APLICANDO FILTROS FLEXÍVEIS PARA PERFIL: ${formData.riskProfile}`
    );
    console.log(`📋 OBJETIVO: ${formData.investmentGoal}`);
    console.log(`⏰ PRAZO: ${formData.timeHorizon}`);

    let filtered = [...bestFIIs];

    // 1. Filtros por PERFIL DE RISCO (FLEXIBILIZADOS)
    if (formData.riskProfile === "conservador") {
      filtered = filtered.filter((fii) => {
        return (
          fii.dividendYield >= 5 && // DY reduzido de 7% para 5%
          fii.pvp <= 1.3 && // P/VP aumentado de 1.1 para 1.3
          [
            "Logística",
            "Corporativo",
            "Recebíveis",
            "Shopping",
            "Industrial",
          ].includes(fii.sector) && // Mais setores
          (fii.marketCap || 0) >= 200000000 // Market cap reduzido de 300M para 200M
        );
      });
    } else if (formData.riskProfile === "moderado") {
      filtered = filtered.filter((fii) => {
        return (
          fii.dividendYield >= 4 && // DY reduzido de 5% para 4%
          fii.pvp <= 1.5 && // P/VP aumentado de 1.4 para 1.5
          (fii.marketCap || 0) >= 100000000 // Market cap reduzido de 150M para 100M
        );
      });
    } else if (formData.riskProfile === "arrojado") {
      filtered = filtered.filter((fii) => {
        return (
          fii.dividendYield >= 3 && // DY reduzido de 4% para 3%
          fii.pvp <= 2.0 && // P/VP aumentado de 1.8 para 2.0
          (fii.marketCap || 0) >= 50000000 // Market cap reduzido de 50M para 50M
        );
      });
    }

    console.log(
      `✅ Após filtros de risco (${formData.riskProfile}): ${filtered.length} FIIs`
    );

    // 2. Filtros por OBJETIVO (FLEXIBILIZADOS)
    if (formData.investmentGoal === "renda") {
      filtered = filtered.filter((fii) => fii.dividendYield >= 4); // Reduzido de 7% para 4%
    } else if (formData.investmentGoal === "crescimento") {
      filtered = filtered.filter((fii) =>
        [
          "Logística",
          "Agronegócio",
          "Industrial",
          "Data Center",
          "Educacional",
        ].includes(fii.sector)
      );
    }

    console.log(
      `✅ Após filtros de objetivo (${formData.investmentGoal}): ${filtered.length} FIIs`
    );

    // 3. Filtros por PRAZO (FLEXIBILIZADOS)
    if (formData.timeHorizon === "curto") {
      filtered = filtered.filter(
        (fii) =>
          fii.dividendYield >= 4 && // Reduzido de 8% para 4%
          ["Recebíveis", "Logística", "Corporativo"].includes(fii.sector)
      );
    } else if (formData.timeHorizon === "medio") {
      // Sem filtros adicionais para médio prazo
    } else if (formData.timeHorizon === "longo") {
      // Sem filtros adicionais para longo prazo
    }

    console.log(
      `✅ Após filtros de prazo (${formData.timeHorizon}): ${filtered.length} FIIs`
    );

    return filtered;
  };

  // 🔧 VALIDAR E CALCULAR ALOCAÇÕES CORRETAS
  const validateAndCalculateAllocations = (
    aiAnalysis,
    totalAmount,
    allFIIs
  ) => {
    console.log("\n💰 CALCULANDO ALOCAÇÕES PARA R$", totalAmount);

    const suggestions = aiAnalysis.suggestions.map((suggestion) => {
      // Encontrar dados atualizados do FII
      const fiiData = allFIIs.find((f) => f.ticker === suggestion.ticker);
      const currentPrice = fiiData?.price || suggestion.price;

      console.log(`💎 ${suggestion.ticker}:`);
      console.log(`   Preço: R$ ${currentPrice}`);
      console.log(`   Percentage planejado: ${suggestion.percentage}%`);

      // Calcular valores baseados na porcentagem
      const plannedAmount = (totalAmount * suggestion.percentage) / 100;
      const shares = Math.floor(plannedAmount / currentPrice);
      const actualAmount = shares * currentPrice;
      const actualPercentage = (actualAmount / totalAmount) * 100;

      console.log(`   Valor planejado: R$ ${plannedAmount.toFixed(2)}`);
      console.log(`   Cotas: ${shares}`);
      console.log(`   Valor real: R$ ${actualAmount.toFixed(2)}`);
      console.log(`   Percentage real: ${actualPercentage.toFixed(1)}%`);

      return {
        ...suggestion,
        price: currentPrice,
        recommendedShares: shares,
        recommendedAmount: actualAmount,
        percentage: actualPercentage,
      };
    });

    // Calcular resumo
    const totalInvested = suggestions.reduce(
      (sum, s) => sum + s.recommendedAmount,
      0
    );
    const averageYield =
      suggestions.reduce((sum, s) => sum + s.dividendYield, 0) /
      suggestions.length;
    const averagePVP =
      suggestions.reduce((sum, s) => sum + s.pvp, 0) / suggestions.length;

    console.log("\n📊 RESUMO FINAL:");
    console.log(`   Total investido: R$ ${totalInvested.toFixed(2)}`);
    console.log(`   DY médio: ${averageYield.toFixed(1)}%`);
    console.log(`   P/VP médio: ${averagePVP.toFixed(2)}`);

    return {
      ...aiAnalysis,
      suggestions,
      summary: {
        ...aiAnalysis.summary,
        totalInvestment: totalInvested,
        averageYield: averageYield,
        averagePVP: averagePVP,
      },
    };
  };

  const handleAddToPortfolio = async (suggestion) => {
    try {
      await addInvestment({
        ticker: suggestion.ticker,
        shares: suggestion.recommendedShares,
        averagePrice: suggestion.price,
        totalInvested: suggestion.recommendedAmount,
        sector: suggestion.sector,
        purchaseDate: new Date().toISOString().split("T")[0],
      });

      // Feedback visual ou notificação aqui
      console.log(`✅ ${suggestion.ticker} adicionado à carteira`);
    } catch (error) {
      console.error("❌ Erro ao adicionar à carteira:", error);
      setError("Erro ao adicionar investimento à carteira");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Análise de Investimentos
          </h1>
          <p className="text-muted-foreground">
            Descubra os melhores FIIs para seu perfil com análise
            fundamentalista por IA
          </p>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="analysis">Nova Análise</TabsTrigger>
          <TabsTrigger value="results">Resultados</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Configuração da Análise
              </CardTitle>
              <CardDescription>
                Configure seus parâmetros para receber recomendações
                personalizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InvestmentForm
                onSubmit={handleSubmitInvestment}
                isLoading={isLoading}
                loadingProgress={loadingProgress}
                loadingMessage={loadingMessage}
              />
            </CardContent>
          </Card>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro na Análise</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {suggestions ? (
            <div className="space-y-6">
              {/* Resumo da Análise */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          FIIs Analisados
                        </p>
                        <p className="text-2xl font-bold">
                          {suggestions.totalFIIsAnalyzed || 0}
                        </p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          FIIs Elegíveis
                        </p>
                        <p className="text-2xl font-bold text-green-600">
                          {suggestions.finalFIIsForAI || 0}
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Top FIIs IA
                        </p>
                        <p className="text-2xl font-bold text-purple-600">
                          {suggestions.suggestions?.length || 0}
                        </p>
                      </div>
                      <Target className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          DY Médio
                        </p>
                        <p className="text-2xl font-bold text-orange-600">
                          {formatPercentage(
                            suggestions.summary?.averageYield || 0
                          )}
                        </p>
                      </div>
                      <DollarSign className="h-8 w-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Carteira Sugerida */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Carteira Sugerida
                  </CardTitle>
                  <CardDescription>
                    Recomendações personalizadas baseadas em análise
                    fundamentalista por IA
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SuggestionsList
                    suggestions={suggestions.suggestions || []}
                    onAddToPortfolio={handleAddToPortfolio}
                  />
                </CardContent>
              </Card>

              {/* Análise de Mercado */}
              {suggestions.marketAnalysis && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Análise de Mercado
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Cenário Atual</h4>
                      <p className="text-sm text-muted-foreground">
                        {suggestions.marketAnalysis.currentScenario}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Oportunidades</h4>
                      <p className="text-sm text-muted-foreground">
                        {suggestions.marketAnalysis.opportunities}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Riscos</h4>
                      <p className="text-sm text-muted-foreground">
                        {suggestions.marketAnalysis.risks}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Nenhuma análise realizada
                </h3>
                <p className="text-muted-foreground mb-4">
                  Execute uma nova análise para ver as recomendações
                  personalizadas
                </p>
                <Button onClick={() => setActiveTab("analysis")}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Nova Análise
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Investment;

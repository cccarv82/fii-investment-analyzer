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
import { getAllFIIData, getBestFIIsForAI } from "../lib/api/fii_data_manager"; // 🔧 CORREÇÃO: Usar função para 100 melhores
import InvestmentForm from "../components/investment/InvestmentForm";
import { SuggestionsList } from "../components/investment/SuggestionCard";

const Investment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [error, setError] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [activeTab, setActiveTab] = useState("analysis"); // 🔧 NOVO: Controle de aba

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

      // 3. 🔧 FILTRAR POR PERFIL DO USUÁRIO (dos 100 melhores)
      setLoadingProgress(45);
      setLoadingMessage("Aplicando filtros personalizados do seu perfil...");

      const profileFilteredFIIs = filterFIIsByProfileUltimate(
        bestFIIs,
        formData
      );
      console.log(
        `🎯 ${profileFilteredFIIs.length} FIIs após filtros de perfil`
      );
      debugFIIData(profileFilteredFIIs, "APÓS FILTROS DE PERFIL");

      // 🔧 GARANTIR MÍNIMO PARA IA
      let finalFIIsForAI = profileFilteredFIIs;
      if (profileFilteredFIIs.length < 20) {
        console.log("⚠️ Poucos FIIs após filtros, usando os 50 melhores");
        finalFIIsForAI = bestFIIs.slice(0, 50);
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
        // Remover dados desnecessários para economizar tokens
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

  // 🔧 FILTROS ULTIMATE POR PERFIL DO USUÁRIO
  const filterFIIsByProfileUltimate = (bestFIIs, formData) => {
    console.log(
      `\n🎯 APLICANDO FILTROS ULTIMATE PARA PERFIL: ${formData.riskProfile}`
    );
    console.log(`📋 OBJETIVO: ${formData.investmentGoal}`);
    console.log(`⏰ PRAZO: ${formData.timeHorizon}`);

    let filtered = [...bestFIIs];

    // 1. Filtros por PERFIL DE RISCO
    if (formData.riskProfile === "conservador") {
      filtered = filtered.filter((fii) => {
        return (
          fii.dividendYield >= 7 && // DY alto para conservador
          fii.pvp <= 1.1 && // P/VP baixo
          ["Logística", "Corporativo", "Recebíveis"].includes(fii.sector) && // Setores seguros
          (fii.marketCap || 0) >= 300000000 // Market cap mínimo
        );
      });
    } else if (formData.riskProfile === "moderado") {
      filtered = filtered.filter((fii) => {
        return (
          fii.dividendYield >= 5 && // DY moderado
          fii.pvp <= 1.4 && // P/VP moderado
          (fii.marketCap || 0) >= 150000000 // Market cap moderado
        );
      });
    } else if (formData.riskProfile === "arrojado") {
      filtered = filtered.filter((fii) => {
        return (
          fii.dividendYield >= 4 && // DY flexível
          fii.pvp <= 1.8 && // P/VP flexível
          (fii.marketCap || 0) >= 50000000 // Market cap menor
        );
      });
    }

    console.log(
      `✅ Após filtros de risco (${formData.riskProfile}): ${filtered.length} FIIs`
    );

    // 2. Filtros por OBJETIVO
    if (formData.investmentGoal === "renda") {
      filtered = filtered.filter((fii) => fii.dividendYield >= 7); // Foco em alta renda
    } else if (formData.investmentGoal === "crescimento") {
      filtered = filtered.filter((fii) =>
        ["Logística", "Agronegócio", "Industrial", "Data Center"].includes(
          fii.sector
        )
      );
    }

    console.log(
      `✅ Após filtros de objetivo (${formData.investmentGoal}): ${filtered.length} FIIs`
    );

    // 3. Filtros por PRAZO
    if (formData.timeHorizon === "curto") {
      filtered = filtered.filter(
        (fii) =>
          (fii.volume || 0) >= 100000 && // Volume mínimo
          ["Logística", "Corporativo", "Recebíveis"].includes(fii.sector)
      );
    } else if (formData.timeHorizon === "longo") {
      filtered = filtered.filter((fii) =>
        ["Logística", "Agronegócio", "Industrial", "Residencial"].includes(
          fii.sector
        )
      );
    }

    console.log(
      `✅ Após filtros de prazo (${formData.timeHorizon}): ${filtered.length} FIIs`
    );

    return filtered;
  };

  // 🔧 VALIDAR E CALCULAR ALOCAÇÕES CORRETAS (corrigir NaN%)
  const validateAndCalculateAllocations = (
    aiAnalysis,
    totalAmount,
    availableFIIs
  ) => {
    try {
      if (!aiAnalysis.suggestions || aiAnalysis.suggestions.length === 0) {
        throw new Error("Nenhuma sugestão válida da IA");
      }

      console.log(
        `\n💰 CALCULANDO ALOCAÇÕES PARA R$ ${totalAmount.toLocaleString()}`
      );

      // Validar cada sugestão e calcular valores corretos
      const validatedSuggestions = aiAnalysis.suggestions
        .map((suggestion, index) => {
          // Encontrar FII correspondente nos dados disponíveis
          const fiiData = availableFIIs.find(
            (fii) => fii.ticker === suggestion.ticker
          );

          if (!fiiData) {
            console.warn(
              `⚠️ FII ${suggestion.ticker} não encontrado nos dados disponíveis`
            );
            return null;
          }

          // 🔧 CALCULAR VALORES CORRETOS
          const price = fiiData.price || suggestion.price || 0;

          // Se a IA não forneceu percentage, calcular baseado em divisão igual
          let percentage = suggestion.percentage;
          if (!percentage || isNaN(percentage)) {
            percentage = 100 / aiAnalysis.suggestions.length; // Divisão igual
            console.log(
              `📊 Calculando percentage para ${suggestion.ticker}: ${percentage}%`
            );
          }

          const recommendedAmount = (totalAmount * percentage) / 100;
          const shares = Math.floor(recommendedAmount / price);
          const actualAmount = shares * price;
          const actualPercentage = (actualAmount / totalAmount) * 100;

          console.log(`💎 ${suggestion.ticker}:`);
          console.log(`   Preço: R$ ${price}`);
          console.log(`   Percentage planejado: ${percentage}%`);
          console.log(
            `   Valor planejado: R$ ${recommendedAmount.toLocaleString()}`
          );
          console.log(`   Cotas: ${shares}`);
          console.log(`   Valor real: R$ ${actualAmount.toLocaleString()}`);
          console.log(`   Percentage real: ${actualPercentage.toFixed(1)}%`);

          return {
            ...suggestion,
            price: price,
            shares: shares,
            recommendedAmount: actualAmount,
            percentage: Math.round(actualPercentage * 100) / 100, // 🔧 CORRIGIR NaN%
            // Manter dados originais do FII
            dividendYield: fiiData.dividendYield,
            pvp: fiiData.pvp,
            sector: fiiData.sector,
            marketCap: fiiData.marketCap,
            qualityScore: fiiData.qualityScore,
          };
        })
        .filter((suggestion) => suggestion !== null);

      // 🔧 RECALCULAR SUMMARY CORRETAMENTE
      const totalInvestment = validatedSuggestions.reduce(
        (sum, s) => sum + s.recommendedAmount,
        0
      );
      const averageYield =
        validatedSuggestions.reduce((sum, s) => sum + s.dividendYield, 0) /
        validatedSuggestions.length;
      const averagePVP =
        validatedSuggestions.reduce((sum, s) => sum + s.pvp, 0) /
        validatedSuggestions.length;

      console.log(`\n📊 RESUMO FINAL:`);
      console.log(`   Total investido: R$ ${totalInvestment.toLocaleString()}`);
      console.log(`   DY médio: ${averageYield.toFixed(1)}%`);
      console.log(`   P/VP médio: ${averagePVP.toFixed(2)}`);

      return {
        ...aiAnalysis,
        suggestions: validatedSuggestions,
        summary: {
          ...aiAnalysis.summary,
          totalInvestment: totalInvestment,
          averageYield: averageYield,
          averagePVP: averagePVP,
        },
      };
    } catch (error) {
      console.error("❌ Erro ao validar carteira:", error);
      throw new Error("Erro ao processar recomendações da IA");
    }
  };

  // 🎯 Adicionar investimento à carteira
  const handleAddToPortfolio = async (suggestion) => {
    try {
      await addInvestment({
        ticker: suggestion.ticker,
        name: suggestion.name,
        shares: suggestion.shares || suggestion.recommendedShares,
        price: suggestion.price,
        sector: suggestion.sector,
        dividendYield: suggestion.dividendYield,
        pvp: suggestion.pvp,
        date: new Date().toISOString(),
      });

      console.log(`✅ ${suggestion.ticker} adicionado à carteira`);
    } catch (error) {
      console.error(`❌ Erro ao adicionar ${suggestion.ticker}:`, error);
      setError(`Erro ao adicionar ${suggestion.ticker} à carteira`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Análise de Investimentos
        </h1>
        <p className="text-muted-foreground">
          Descubra os melhores FIIs para seu perfil com análise fundamentalista
          por IA SUPREMA
        </p>
      </div>

      {/* Status da Configuração */}
      {!isConfigured && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Configuração Necessária</AlertTitle>
          <AlertDescription>
            Configure sua API key da OpenAI nas Configurações para usar a
            análise com IA.
          </AlertDescription>
        </Alert>
      )}

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="analysis">Nova Análise</TabsTrigger>
          <TabsTrigger value="results">Resultados</TabsTrigger>
        </TabsList>

        {/* Nova Análise */}
        <TabsContent value="analysis">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Configurar Análise ULTIMATE de Investimento
              </CardTitle>
              <CardDescription>
                Configure seus parâmetros para receber sugestões personalizadas
                de FIIs com IA SUPREMA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InvestmentForm
                onSubmit={handleSubmitInvestment}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resultados */}
        <TabsContent value="results">
          {/* Loading */}
          {isLoading && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
                    <span className="font-medium">
                      Analisando investimentos com IA SUPREMA...
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{loadingMessage}</span>
                      <span>{loadingProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${loadingProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro na Análise</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Resultados */}
          {suggestions && !isLoading && (
            <div className="space-y-6">
              {/* Resumo da Análise ULTIMATE */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Resumo da Análise ULTIMATE
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {suggestions.totalFIIsAnalyzed}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        FIIs Carregados
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {suggestions.bestFIIsSelected}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Melhores Selecionados
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {suggestions.finalFIIsForAI}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Enviados para IA
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {suggestions.suggestions?.length || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Sugestões Finais
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {suggestions.summary?.averageYield?.toFixed(1) || "N/A"}
                        %
                      </div>
                      <div className="text-sm text-muted-foreground">
                        DY Médio
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lista de Sugestões */}
              <SuggestionsList
                suggestions={suggestions.suggestions || []}
                onAddToPortfolio={handleAddToPortfolio}
              />

              {/* Análise de Mercado */}
              {suggestions.marketAnalysis && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5" />
                      Análise de Mercado SUPREMA
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Cenário Atual</h4>
                        <p className="text-sm text-muted-foreground">
                          {suggestions.marketAnalysis.currentScenario}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Perspectivas</h4>
                        <p className="text-sm text-muted-foreground">
                          {suggestions.marketAnalysis.outlook}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Estratégia da Carteira */}
              {suggestions.portfolioStrategy && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Estratégia da Carteira
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Abordagem Geral</h4>
                        <p className="text-sm text-muted-foreground">
                          {suggestions.portfolioStrategy.overallApproach}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Gestão de Risco</h4>
                        <p className="text-sm text-muted-foreground">
                          {suggestions.portfolioStrategy.riskManagement}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Retorno Esperado</h4>
                        <p className="text-sm text-muted-foreground">
                          {suggestions.portfolioStrategy.expectedReturn}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Estado Vazio */}
          {!suggestions && !isLoading && !error && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="font-medium">Nenhuma análise realizada</h3>
                    <p className="text-sm text-muted-foreground">
                      Configure uma nova análise para ver sugestões de
                      investimento com IA SUPREMA
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Investment;

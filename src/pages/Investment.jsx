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
import { getAllFIIData } from "../lib/api/fii_data_manager"; // 🔧 CORREÇÃO: Usar função integrada
import InvestmentForm from "../components/investment/InvestmentForm";
import { SuggestionsList } from "../components/investment/SuggestionCard";

const Investment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [error, setError] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("");

  const { generateInvestmentSuggestions, isConfigured, getBrapiToken } =
    useAI(); // 🔧 CORREÇÃO: Adicionar getBrapiToken
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

      // 1. Obter TODOS os FIIs disponíveis com token do Supabase
      setLoadingProgress(20);
      setLoadingMessage("Carregando base otimizada de FIIs da B3...");

      console.log(
        "🔑 [Investment] Usando BRAPI token do Supabase:",
        !!brapiToken
      );
      const allFIIs = await getAllFIIData(brapiToken); // 🔧 CORREÇÃO: Passar token do Supabase

      console.log(`📊 ${allFIIs.length} FIIs carregados para análise`);
      debugFIIData(allFIIs, "DADOS ORIGINAIS");

      // 🔧 VALIDAÇÃO: Verificar se temos FIIs suficientes
      if (allFIIs.length < 10) {
        throw new Error(
          `Apenas ${allFIIs.length} FIIs carregados. Verifique sua configuração BRAPI ou tente novamente.`
        );
      }

      // 🔧 LIMITE SEGURO: Se muitos FIIs, avisar mas continuar
      if (allFIIs.length > 200) {
        console.warn(
          `⚠️ ${allFIIs.length} FIIs carregados - isso pode ser muitos. Aplicando filtros rigorosos.`
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
        throw new Error(
          "Nenhum FII encontrado com os critérios especificados. Tente ajustar seu perfil de risco."
        );
      }

      // 3. 🔧 OTIMIZAÇÃO CRÍTICA: Limitar FIIs para IA (máximo 20)
      setLoadingProgress(60);
      setLoadingMessage("Selecionando melhores FIIs para análise IA...");

      // Ordenar por qualidade e pegar os melhores
      const topFIIs = finalEligibleFIIs
        .sort((a, b) => {
          // Critério de qualidade: DY alto + P/VP baixo + Market Cap alto
          const scoreA =
            (a.dividendYield || 0) -
            (a.pvp || 1) +
            Math.log10((a.marketCap || 100000000) / 100000000);
          const scoreB =
            (b.dividendYield || 0) -
            (b.pvp || 1) +
            Math.log10((b.marketCap || 100000000) / 100000000);
          return scoreB - scoreA;
        })
        .slice(0, 20); // 🔧 LIMITE CRÍTICO: Máximo 20 FIIs para IA

      console.log(`🎯 ${topFIIs.length} melhores FIIs selecionados para IA`);

      // 4. Usar IA REAL da OpenAI com dados otimizados
      setLoadingProgress(70);
      setLoadingMessage("Analisando FIIs com inteligência artificial...");

      console.log("🤖 Iniciando análise com IA real da OpenAI...");

      // 🔧 CORREÇÃO: Usar formato correto para IA
      const userProfile = {
        riskProfile: formData.riskProfile,
        investmentGoal: formData.investmentGoal,
        timeHorizon: formData.timeHorizon,
        investmentAmount: formData.amount,
      };

      // 🔧 DADOS OTIMIZADOS: Enviar apenas dados essenciais para IA
      const optimizedFIIs = topFIIs.map((fii) => ({
        ticker: fii.ticker,
        name: fii.name,
        price: fii.price,
        dividendYield: fii.dividendYield,
        pvp: fii.pvp,
        sector: fii.sector,
        marketCap: fii.marketCap,
        // Remover dados desnecessários para economizar tokens
      }));

      const aiAnalysis = await generateInvestmentSuggestions(
        optimizedFIIs, // 🔧 DADOS OTIMIZADOS
        userProfile,
        positions || [] // Carteira atual
      );

      // 5. Processar e validar recomendações da IA
      setLoadingProgress(85);
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

      // 6. Validar e ajustar alocações
      setLoadingProgress(95);
      setLoadingMessage("Validando e otimizando carteira...");

      const validatedSuggestions = validateAndOptimizePortfolio(
        aiAnalysis,
        formData.amount,
        finalEligibleFIIs
      );

      // 7. Finalizar
      setLoadingProgress(100);
      setLoadingMessage("Análise concluída!");

      setSuggestions({
        ...validatedSuggestions,
        formData,
        timestamp: new Date().toISOString(),
        source: "openai_real",
        totalFIIsAnalyzed: allFIIs.length,
        eligibleFIIs: finalEligibleFIIs.length,
        topFIIsForAI: topFIIs.length,
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

  // 🔧 FILTROS MELHORADOS COM CONFIGURAÇÕES REAIS
  const filterFIIsByProfileWithDebug = (allFIIs, formData) => {
    console.log(`\n🔍 APLICANDO FILTROS PARA PERFIL: ${formData.riskProfile}`);
    console.log(`📋 OBJETIVO: ${formData.investmentGoal}`);
    console.log(`⏰ PRAZO: ${formData.timeHorizon}`);

    let filtered = [...allFIIs];

    // 1. Filtros básicos de qualidade
    filtered = filtered.filter((fii) => {
      return (
        fii.price &&
        fii.price > 0 &&
        fii.dividendYield &&
        fii.dividendYield > 0 &&
        fii.sector
      );
    });
    console.log(`✅ Após filtros básicos: ${filtered.length} FIIs`);

    // 2. Filtros por PERFIL DE RISCO (USANDO CONFIGURAÇÕES REAIS)
    if (formData.riskProfile === "conservador") {
      filtered = filtered.filter((fii) => {
        return (
          fii.dividendYield >= 6 && // DY mínimo mais alto
          (!fii.pvp || fii.pvp <= 1.2) && // P/VP conservador
          ["Logística", "Corporativo", "Recebíveis"].includes(fii.sector) && // Setores seguros
          (!fii.marketCap || fii.marketCap >= 500000000) // Market cap mínimo
        );
      });
    } else if (formData.riskProfile === "moderado") {
      filtered = filtered.filter((fii) => {
        return (
          fii.dividendYield >= 4 && // DY moderado
          (!fii.pvp || fii.pvp <= 1.5) && // P/VP moderado
          (!fii.marketCap || fii.marketCap >= 100000000) // Market cap moderado
        );
      });
    } else if (formData.riskProfile === "arrojado") {
      filtered = filtered.filter((fii) => {
        return (
          fii.dividendYield >= 3 && // DY mais flexível
          (!fii.pvp || fii.pvp <= 2.0) && // P/VP mais flexível
          (!fii.marketCap || fii.marketCap >= 50000000) // Market cap menor
        );
      });
    }

    console.log(
      `✅ Após filtros de risco (${formData.riskProfile}): ${filtered.length} FIIs`
    );

    // 3. Filtros por OBJETIVO DE INVESTIMENTO
    if (formData.investmentGoal === "renda") {
      filtered = filtered.filter((fii) => fii.dividendYield >= 6); // Foco em alta renda
    } else if (formData.investmentGoal === "crescimento") {
      filtered = filtered.filter((fii) =>
        ["Logística", "Agronegócio", "Industrial", "Data Center"].includes(
          fii.sector
        )
      ); // Setores de crescimento
    }
    // "equilibrado" não aplica filtros adicionais

    console.log(
      `✅ Após filtros de objetivo (${formData.investmentGoal}): ${filtered.length} FIIs`
    );

    // 4. Filtros por PRAZO
    if (formData.timeHorizon === "curto") {
      // Prazo curto: priorizar liquidez e estabilidade
      filtered = filtered.filter(
        (fii) =>
          (!fii.volume || fii.volume >= 100000) && // Volume mínimo
          ["Logística", "Corporativo", "Recebíveis"].includes(fii.sector)
      );
    } else if (formData.timeHorizon === "longo") {
      // Prazo longo: pode aceitar mais volatilidade
      filtered = filtered.filter((fii) =>
        ["Logística", "Agronegócio", "Industrial", "Residencial"].includes(
          fii.sector
        )
      );
    }
    // "medio" não aplica filtros adicionais

    console.log(
      `✅ Após filtros de prazo (${formData.timeHorizon}): ${filtered.length} FIIs`
    );

    return filtered;
  };

  // 🔧 FUNÇÃO PARA RELAXAR FILTROS QUANDO POUCOS FIIs
  const relaxFiltersWithDebug = (allFIIs, formData) => {
    console.log("\n🔧 RELAXANDO FILTROS...");

    let filtered = [...allFIIs];

    // Filtros básicos apenas
    filtered = filtered.filter((fii) => {
      return (
        fii.price &&
        fii.price > 0 &&
        fii.dividendYield &&
        fii.dividendYield > 0 &&
        fii.sector
      );
    });

    // Filtros relaxados por perfil
    if (formData.riskProfile === "conservador") {
      filtered = filtered.filter((fii) => {
        return fii.dividendYield >= 4 && (!fii.pvp || fii.pvp <= 1.5); // Mais flexível
      });
    } else if (formData.riskProfile === "moderado") {
      filtered = filtered.filter((fii) => {
        return fii.dividendYield >= 3 && (!fii.pvp || fii.pvp <= 2.0); // Mais flexível
      });
    } else if (formData.riskProfile === "arrojado") {
      filtered = filtered.filter((fii) => {
        return fii.dividendYield >= 2; // Muito flexível
      });
    }

    console.log(`✅ Filtros relaxados: ${filtered.length} FIIs`);
    return filtered;
  };

  // 🔧 Validar e otimizar carteira sugerida
  const validateAndOptimizePortfolio = (
    aiAnalysis,
    totalAmount,
    availableFIIs
  ) => {
    try {
      // Validar se sugestões existem
      if (!aiAnalysis.suggestions || aiAnalysis.suggestions.length === 0) {
        throw new Error("Nenhuma sugestão válida da IA");
      }

      // Validar cada sugestão
      const validatedSuggestions = aiAnalysis.suggestions
        .map((suggestion) => {
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

          // Calcular valores se não fornecidos pela IA
          const price = fiiData.price || suggestion.price || 0;
          const recommendedAmount =
            suggestion.recommendedAmount ||
            totalAmount / aiAnalysis.suggestions.length;
          const shares = Math.floor(recommendedAmount / price);
          const actualAmount = shares * price;

          return {
            ...suggestion,
            price: price,
            shares: shares,
            recommendedAmount: actualAmount,
            // Manter dados originais do FII
            dividendYield: fiiData.dividendYield,
            pvp: fiiData.pvp,
            sector: fiiData.sector,
            marketCap: fiiData.marketCap,
          };
        })
        .filter((suggestion) => suggestion !== null);

      return {
        ...aiAnalysis,
        suggestions: validatedSuggestions,
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
          por IA
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

      <Tabs defaultValue="analysis" className="space-y-4">
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
                Configurar Análise de Investimento
              </CardTitle>
              <CardDescription>
                Configure seus parâmetros para receber sugestões personalizadas
                de FIIs
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
                      Analisando investimentos...
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
              {/* Resumo da Análise */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Resumo da Análise
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {suggestions.totalFIIsAnalyzed}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        FIIs Analisados
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {suggestions.eligibleFIIs}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        FIIs Elegíveis
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {suggestions.topFIIsForAI ||
                          suggestions.suggestions?.length ||
                          0}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Top FIIs IA
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
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
                      Análise de Mercado
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
                      investimento
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

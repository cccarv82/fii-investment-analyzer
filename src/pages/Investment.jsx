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
import { SuggestionsList } from "../components/investment/SuggestionCard"; // 🔧 CORREÇÃO: Usar SuggestionsList

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
          fii.dividendYield >= 5 && // DY moderado
          (!fii.pvp || fii.pvp <= 1.5) && // P/VP moderado
          (!fii.marketCap || fii.marketCap >= 200000000) // Market cap moderado
        );
      });
    } else if (formData.riskProfile === "arrojado") {
      filtered = filtered.filter((fii) => {
        return (
          fii.dividendYield >= 4 && // DY mais flexível
          (!fii.pvp || fii.pvp <= 2.0) && // P/VP mais flexível
          (!fii.marketCap || fii.marketCap >= 100000000) // Market cap menor
        );
      });
    }
    console.log(
      `✅ Após filtros de risco (${formData.riskProfile}): ${filtered.length} FIIs`
    );

    // 3. Filtros por OBJETIVO DE INVESTIMENTO (USANDO CONFIGURAÇÕES REAIS)
    if (formData.investmentGoal === "renda") {
      filtered = filtered.filter((fii) => fii.dividendYield >= 7); // Foco em alta renda
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

    // 4. Filtros por PRAZO (USANDO CONFIGURAÇÕES REAIS)
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

    // 5. Ordenar por qualidade (DY + P/VP + Market Cap)
    filtered.sort((a, b) => {
      const scoreA =
        (a.dividendYield || 0) * 10 +
        (2 - (a.pvp || 2)) * 5 +
        (a.marketCap || 0) / 1000000000;
      const scoreB =
        (b.dividendYield || 0) * 10 +
        (2 - (b.pvp || 2)) * 5 +
        (b.marketCap || 0) / 1000000000;
      return scoreB - scoreA;
    });

    return filtered.slice(0, 80); // Top 80 para análise da IA
  };

  // 🔧 RELAXAR FILTROS SE POUCOS FIIs
  const relaxFiltersWithDebug = (allFIIs, formData) => {
    console.log("🔄 RELAXANDO FILTROS...");

    let filtered = allFIIs.filter((fii) => {
      return (
        fii.price &&
        fii.price > 0 &&
        fii.dividendYield &&
        fii.dividendYield >= 3 && // DY mínimo relaxado
        (!fii.pvp || fii.pvp <= 2.5) && // P/VP relaxado
        fii.sector
      );
    });

    // Ordenar por qualidade
    filtered.sort((a, b) => {
      const scoreA = (a.dividendYield || 0) * 10 + (3 - (a.pvp || 3)) * 3;
      const scoreB = (b.dividendYield || 0) * 10 + (3 - (b.pvp || 3)) * 3;
      return scoreB - scoreA;
    });

    return filtered.slice(0, 50);
  };

  // 🔧 VALIDAR E OTIMIZAR CARTEIRA
  const validateAndOptimizePortfolio = (
    aiAnalysis,
    totalAmount,
    availableFIIs
  ) => {
    const suggestions = aiAnalysis.suggestions || [];

    // Validar se FIIs existem na base
    const validSuggestions = suggestions.filter((suggestion) => {
      const fiiExists = availableFIIs.find(
        (fii) => fii.ticker === suggestion.ticker
      );
      if (!fiiExists) {
        console.warn(`⚠️ FII ${suggestion.ticker} não encontrado na base`);
        return false;
      }
      return true;
    });

    // Calcular valores corretos
    const processedSuggestions = validSuggestions.map((suggestion) => {
      const fiiData = availableFIIs.find(
        (fii) => fii.ticker === suggestion.ticker
      );
      const shares = Math.floor(
        (totalAmount * (suggestion.percentage / 100)) / fiiData.price
      );
      const investmentAmount = shares * fiiData.price;

      return {
        ...suggestion,
        ...fiiData, // Dados atualizados do FII
        shares,
        investmentAmount,
        recommendedAmount: investmentAmount,
      };
    });

    return {
      ...aiAnalysis,
      suggestions: processedSuggestions,
    };
  };

  // 🔧 ADICIONAR À CARTEIRA
  const handleAddToPortfolio = async (suggestion) => {
    try {
      await addInvestment({
        ticker: suggestion.ticker,
        name: suggestion.name,
        shares: suggestion.shares,
        price: suggestion.price,
        sector: suggestion.sector,
        dividendYield: suggestion.dividendYield,
        pvp: suggestion.pvp,
      });

      console.log(`✅ ${suggestion.ticker} adicionado à carteira`);
    } catch (error) {
      console.error("❌ Erro ao adicionar à carteira:", error);
      setError(
        `Erro ao adicionar ${suggestion.ticker} à carteira: ${error.message}`
      );
    }
  };

  // 🔧 VER DETALHES
  const handleViewDetails = (ticker) => {
    console.log(`🔍 Visualizar detalhes de ${ticker}`);
    // TODO: Implementar modal de detalhes
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Análise de Investimentos</h1>
          <p className="text-muted-foreground">
            Receba sugestões personalizadas de FIIs baseadas em IA
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium">
            {isConfigured ? "IA Configurada" : "Configure a IA"}
          </span>
        </div>
      </div>

      {!isConfigured && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Configuração Necessária</AlertTitle>
          <AlertDescription>
            Configure sua API key da OpenAI nas Configurações para usar a
            análise com IA.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="form" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="form">Planejamento</TabsTrigger>
          <TabsTrigger value="suggestions" disabled={!suggestions}>
            Sugestões
          </TabsTrigger>
          <TabsTrigger value="analysis" disabled={!suggestions}>
            Análise
          </TabsTrigger>
        </TabsList>

        <TabsContent value="form" className="space-y-6">
          <InvestmentForm
            onSubmit={handleSubmitInvestment}
            isLoading={isLoading}
            loadingProgress={loadingProgress}
            loadingMessage={loadingMessage}
          />

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro na Análise</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-6">
          {suggestions && (
            <>
              {/* Resumo da Análise */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
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
                        {suggestions.suggestions?.length || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        FIIs Sugeridos
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {suggestions.suggestions?.reduce(
                          (acc, s) => acc + (s.dividendYield || 0),
                          0
                        ) / (suggestions.suggestions?.length || 1) || 0}
                        %
                      </div>
                      <div className="text-sm text-muted-foreground">
                        DY Médio
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 🔧 CORREÇÃO: Usar SuggestionsList com toggle */}
              <SuggestionsList
                suggestions={suggestions.suggestions || []}
                onAddToPortfolio={handleAddToPortfolio}
                onViewDetails={handleViewDetails}
                isLoading={isLoading}
              />
            </>
          )}
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          {suggestions && (
            <>
              {/* Análise da Estratégia */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Análise da Estratégia
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">
                      Estratégia de Investimento
                    </h4>
                    <p className="text-muted-foreground">
                      {suggestions.strategy ||
                        "Diversificação inteligente baseada em análise fundamentalista e perfil de risco"}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Análise de Mercado</h4>
                    <p className="text-muted-foreground">
                      {suggestions.marketAnalysis ||
                        "Diversificação inteligente com foco em renda e qualidade dos ativos"}
                    </p>
                  </div>

                  {suggestions.riskAnalysis && (
                    <div>
                      <h4 className="font-semibold mb-2">Análise de Risco</h4>
                      <p className="text-muted-foreground">
                        {suggestions.riskAnalysis}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Distribuição Setorial */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Distribuição Setorial
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {suggestions.suggestions &&
                      Object.entries(
                        suggestions.suggestions.reduce((acc, s) => {
                          acc[s.sector] =
                            (acc[s.sector] || 0) + (s.percentage || 0);
                          return acc;
                        }, {})
                      ).map(([sector, percentage]) => (
                        <div
                          key={sector}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm font-medium">{sector}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground w-12 text-right">
                              {percentage.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      ))}
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

export default Investment;

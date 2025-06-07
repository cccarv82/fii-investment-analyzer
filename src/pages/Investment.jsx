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

      // 🔍 DEBUG DETALHADO DOS FILTROS
      if (step === "APÓS FILTROS DE PERFIL" && fiis.length === 0) {
        console.log("\n🚨 INVESTIGANDO POR QUE 0 FIIs PASSARAM:");
        console.log("Vamos testar alguns FIIs manualmente...");

        // Pegar alguns FIIs dos 100 melhores para testar
        const testFIIs = [
          {
            ticker: "MXRF11",
            dividendYield: 9.5,
            pvp: 1.15,
            sector: "Recebíveis",
            marketCap: 500000000,
          },
          {
            ticker: "SARE11",
            dividendYield: 7.2,
            pvp: 0.95,
            sector: "Recebíveis",
            marketCap: 300000000,
          },
          {
            ticker: "KNSC11",
            dividendYield: 9.5,
            pvp: 1.15,
            sector: "Recebíveis",
            marketCap: 200000000,
          },
        ];

        testFIIs.forEach((fii) => {
          console.log(`\n🧪 TESTE ${fii.ticker}:`);
          console.log(
            ` DY: ${fii.dividendYield}% (≥3? ${fii.dividendYield >= 3})`
          );
          console.log(` P/VP: ${fii.pvp} (≤2.0? ${fii.pvp <= 2.0})`);
          console.log(
            ` Market Cap: ${fii.marketCap} (≥50M? ${
              (fii.marketCap || 0) >= 50000000
            })`
          );
          console.log(` Setor: ${fii.sector}`);
        });
      }
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

      // 3. 🔧 PULAR FILTROS DE PERFIL - USAR DIRETO OS 100 MELHORES
      setLoadingProgress(45);
      setLoadingMessage(
        "Usando os 100 melhores FIIs diretamente (sem filtros restritivos)..."
      );

      console.log(
        "🎯 PULANDO FILTROS DE PERFIL - usando os 100 melhores diretamente"
      );

      const finalFIIsForAI = bestFIIs.slice(0, 60); // Usar 60 melhores para IA
      console.log(
        `🎯 ${finalFIIsForAI.length} FIIs selecionados para IA (sem filtros restritivos)`
      );
      debugFIIData(finalFIIsForAI, "FINAL PARA IA (SEM FILTROS)");

      // 4. 🤖 USAR IA SUPREMA (PROMPT OTIMIZADO)
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

      // 🔧 DADOS OTIMIZADOS: Enviar apenas dados essenciais para IA (REDUZIDO)
      const optimizedFIIs = finalFIIsForAI.slice(0, 40).map((fii) => ({
        // Reduzido de 60 para 40
        ticker: fii.ticker,
        name: fii.name,
        price: fii.price,
        dividendYield: fii.dividendYield,
        pvp: fii.pvp,
        sector: fii.sector,
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

  // 🔧 VALIDAR E CALCULAR ALOCAÇÕES CORRETAS
  const validateAndCalculateAllocations = (
    aiAnalysis,
    totalAmount,
    allFIIs
  ) => {
    const suggestions = aiAnalysis.suggestions || [];

    // Garantir que temos pelo menos 1 sugestão
    if (suggestions.length === 0) {
      throw new Error("IA não retornou nenhuma sugestão válida");
    }

    // Calcular alocação igual para todas as sugestões
    const equalPercentage = 100 / suggestions.length;

    const validatedSuggestions = suggestions.map((suggestion, index) => {
      // Buscar dados completos do FII
      const fullFIIData = allFIIs.find(
        (fii) => fii.ticker === suggestion.ticker
      );

      // Usar dados da IA ou fallback para dados completos
      const price = suggestion.price || fullFIIData?.price || 0;
      const percentage = suggestion.percentage || equalPercentage;
      const recommendedAmount = (totalAmount * percentage) / 100;
      const shares = price > 0 ? Math.floor(recommendedAmount / price) : 0;

      return {
        ...suggestion,
        price: price,
        percentage: percentage,
        recommendedAmount: recommendedAmount,
        shares: shares,
        // Garantir que todos os campos necessários existem
        dividendYield:
          suggestion.dividendYield || fullFIIData?.dividendYield || 0,
        pvp: suggestion.pvp || fullFIIData?.pvp || 0,
        sector: suggestion.sector || fullFIIData?.sector || "N/A",
        name: suggestion.name || fullFIIData?.name || suggestion.ticker,
      };
    });

    return {
      ...aiAnalysis,
      suggestions: validatedSuggestions,
    };
  };

  // ✅ CORREÇÃO CRÍTICA: Função para adicionar à carteira com validação de preço
  const handleAddToPortfolio = async (suggestion) => {
    try {
      console.log("🔄 Adicionando à carteira:", suggestion);

      // ✅ VALIDAÇÃO CRÍTICA: Garantir que average_price seja sempre > 0
      const price = suggestion.price || 0;
      const shares = suggestion.shares || 0;

      if (price <= 0) {
        throw new Error(
          `Preço inválido para ${suggestion.ticker}: R$ ${price}`
        );
      }

      if (shares <= 0) {
        throw new Error(
          `Quantidade de cotas inválida para ${suggestion.ticker}: ${shares}`
        );
      }

      const investmentData = {
        ticker: suggestion.ticker,
        name: suggestion.name || suggestion.ticker,
        sector: suggestion.sector || "N/A",
        shares: shares,
        // ✅ CORREÇÃO CRÍTICA: Garantir que average_price seja sempre > 0
        average_price: Math.max(price, 0.01), // Mínimo de R$ 0,01
        current_price: Math.max(price, 0.01), // Mínimo de R$ 0,01
        dividend_yield: suggestion.dividendYield || 0,
        pvp: suggestion.pvp || 0,
      };

      console.log("📊 Dados validados para inserção:", investmentData);

      await addInvestment(investmentData);
      console.log("✅ Investimento adicionado com sucesso!");
    } catch (error) {
      console.error("❌ Erro ao adicionar à carteira:", error);
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium">IA Suprema Ativa</span>
        </div>
      </div>

      {/* Status da IA */}
      {!isConfigured && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Configuração Necessária</AlertTitle>
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>
                Configure sua API key da OpenAI para usar análises com IA.
              </span>
              <Button variant="outline" size="sm" asChild>
                <a href="/settings">Configurar</a>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Erro */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro na Análise</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="analysis">Nova Análise</TabsTrigger>
          <TabsTrigger value="results" disabled={!suggestions}>
            Resultados
          </TabsTrigger>
        </TabsList>

        {/* Nova Análise */}
        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Configurar Análise
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

          {/* Informações sobre a IA */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Como Funciona a Análise
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-primary">
                      1
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium">Coleta de Dados</h4>
                    <p className="text-sm text-muted-foreground">
                      Analisamos 300+ FIIs da B3 com dados em tempo real
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-primary">
                      2
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium">Seleção Inteligente</h4>
                    <p className="text-sm text-muted-foreground">
                      Algoritmo seleciona os 100 melhores por qualidade
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-primary">
                      3
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium">Análise com IA</h4>
                    <p className="text-sm text-muted-foreground">
                      IA combina estratégias de Warren Buffett, Ray Dalio e
                      Peter Lynch
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-primary">
                      4
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium">Recomendações</h4>
                    <p className="text-sm text-muted-foreground">
                      4 FIIs personalizados para seu perfil e objetivos
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resultados */}
        <TabsContent value="results" className="space-y-4">
          {suggestions ? (
            <>
              {/* Resumo da Análise */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Resumo da Análise
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {suggestions.suggestions?.length || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        FIIs Recomendados
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {suggestions.totalFIIsAnalyzed || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        FIIs Analisados
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {suggestions.summary?.averageYield
                          ? formatPercentage(suggestions.summary.averageYield)
                          : "N/A"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        DY Médio
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {suggestions.summary?.riskLevel || "N/A"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Nível de Risco
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lista de Sugestões */}
              <SuggestionsList
                suggestions={suggestions.suggestions || []}
                onAddToPortfolio={handleAddToPortfolio}
                isLoading={isLoading}
              />

              {/* Análise de Mercado */}
              {suggestions.marketAnalysis && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
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
                        <h4 className="font-medium mb-2">Oportunidades</h4>
                        <p className="text-sm text-muted-foreground">
                          {suggestions.marketAnalysis.opportunities}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Riscos</h4>
                        <p className="text-sm text-muted-foreground">
                          {suggestions.marketAnalysis.risks}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Estratégia de Portfolio */}
              {suggestions.portfolioStrategy && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Estratégia de Portfolio
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
                        <h4 className="font-medium mb-2">Diversificação</h4>
                        <p className="text-sm text-muted-foreground">
                          {suggestions.portfolioStrategy.diversification}
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

              {/* Ações */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("analysis")}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Nova Análise
                </Button>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Nenhuma análise realizada ainda. Vá para "Nova Análise" para
                    começar.
                  </p>
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

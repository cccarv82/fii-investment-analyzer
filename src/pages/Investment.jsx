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
import CacheControl from "../components/common/CacheControl";

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

  // ✅ CORREÇÃO 1: Função para calcular valor total real
  const calculateRealTotal = () => {
    if (!suggestions?.suggestions) return 0;

    return suggestions.suggestions.reduce((total, suggestion) => {
      const shares = suggestion.shares || 0;
      const price = suggestion.price || 0;
      return total + shares * price;
    }, 0);
  };

  // ✅ CORREÇÃO 4: Função para calcular retorno esperado realista
  const calculateExpectedReturn = () => {
    if (!suggestions?.suggestions || suggestions.suggestions.length === 0) {
      return {
        dividendYield: 0,
        appreciation: 7,
        total: 7,
        breakdown: "Aguardando análise...",
      };
    }

    // DY médio da carteira
    const avgDY =
      suggestions.suggestions.reduce((sum, fii) => {
        return sum + (fii.dividendYield || 0);
      }, 0) / suggestions.suggestions.length;

    // Valorização esperada conservadora (5-10%)
    const expectedAppreciation = 7; // 7% ao ano

    // Retorno total
    const totalReturn = avgDY + expectedAppreciation;

    return {
      dividendYield: avgDY,
      appreciation: expectedAppreciation,
      total: totalReturn,
      breakdown: `DY ${avgDY.toFixed(
        1
      )}% + Valorização ${expectedAppreciation}% = ${totalReturn.toFixed(1)}%`,
    };
  };

  // 🔍 FUNÇÃO DE DEBUG DETALHADO
  const debugFIIData = (fiis, step) => {
    console.log(`\\n🔍 DEBUG ${step}:`);
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
        console.log("\\n🚨 INVESTIGANDO POR QUE 0 FIIs PASSARAM:");
        console.log("Vamos testar alguns FIIs manualmente...");

        // ❌ REMOVIDO: Dados de teste hardcoded que causavam o problema
        // Os dados de teste foram removidos para evitar confusão
        console.log(
          "✅ Dados de teste removidos - usando apenas dados reais da BRAPI"
        );
      }
    }
  };

  // 🎯 Função principal ULTIMATE para obter sugestões com IA SUPREMA
  const handleSubmitInvestment = async (formData, forceRefresh = false) => {
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

      const allFIIs = await getAllFIIData(brapiToken, forceRefresh);
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

      const bestFIIs = await getBestFIIsForAI(brapiToken, forceRefresh);
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

  // 🔧 VALIDAR E CALCULAR ALOCAÇÕES CORRETAS - VERSÃO CORRIGIDA
  const validateAndCalculateAllocations = (
    aiAnalysis,
    totalAmount,
    allFIIs
  ) => {
    console.log("🔧 [validateAndCalculateAllocations] Iniciando validação...");
    console.log("📊 Sugestões recebidas da IA:", aiAnalysis.suggestions);
    
    const suggestions = aiAnalysis.suggestions || [];

    // Garantir que temos pelo menos 1 sugestão
    if (suggestions.length === 0) {
      throw new Error("IA não retornou nenhuma sugestão válida");
    }

    // Calcular alocação igual para todas as sugestões
    const equalPercentage = 100 / suggestions.length;

    const validatedSuggestions = suggestions.map((suggestion, index) => {
      console.log(`\n🔍 [${suggestion.ticker}] VALIDAÇÃO INICIADA:`);
      console.log(`   IA Price: ${suggestion.price}`);
      console.log(`   IA TargetPrice: ${suggestion.targetPrice}`);
      
      // Buscar dados completos do FII
      const fullFIIData = allFIIs.find(
        (fii) => fii.ticker === suggestion.ticker
      );

      // ✅ CORREÇÃO CRÍTICA: Priorizar SEMPRE dados reais da BRAPI
      const price = fullFIIData?.price || suggestion.price || 0;
      const percentage = suggestion.percentage || equalPercentage;
      const recommendedAmount = (totalAmount * percentage) / 100;
      const shares = price > 0 ? Math.floor(recommendedAmount / price) : 0;

      console.log(`   BRAPI Price: ${fullFIIData?.price}`);
      console.log(`   Final Price: ${price}`);

      // ✅ VALIDAÇÃO SUPER AGRESSIVA: Corrigir targetPrice irreal
      let targetPrice = suggestion.targetPrice;
      
      // Log do valor original
      console.log(`   TargetPrice Original: ${targetPrice} (tipo: ${typeof targetPrice})`);
      
      // Converter string para número se necessário
      if (typeof targetPrice === 'string') {
        // Remover símbolos de moeda e espaços
        const cleanString = targetPrice.replace(/[R$\s,]/g, '').replace(',', '.');
        const match = cleanString.match(/[\d.]+/);
        if (match) {
          targetPrice = parseFloat(match[0]);
          console.log(`   TargetPrice convertido de string: ${targetPrice}`);
        } else {
          targetPrice = null;
          console.log(`   TargetPrice string inválida, definindo como null`);
        }
      }
      
      // VALIDAÇÃO OBRIGATÓRIA: Máximo 12% de valorização (alinhado com prompts revolucionários)
      if (targetPrice && price > 0) {
        const maxRealisticTarget = price * 1.12; // Máximo 12% de valorização (mais conservador)
        const currentIncrease = ((targetPrice - price) / price) * 100;
        
        console.log(`   Aumento atual: ${currentIncrease.toFixed(1)}%`);
        console.log(`   Máximo permitido: 12%`);
        console.log(`   Target máximo: R$ ${maxRealisticTarget.toFixed(2)}`);
        
        if (targetPrice > maxRealisticTarget) {
          console.warn(
            `🚨 [${suggestion.ticker}] TargetPrice IRREAL detectado: R$ ${targetPrice.toFixed(2)} (${currentIncrease.toFixed(1)}% acima do atual R$ ${price.toFixed(2)}). FORÇANDO correção para máximo 12%...`
          );
          targetPrice = maxRealisticTarget;
        }
        
        console.log(
          `✅ [${suggestion.ticker}] TargetPrice FINAL: R$ ${targetPrice.toFixed(2)} (${((targetPrice - price) / price * 100).toFixed(1)}% acima do atual R$ ${price.toFixed(2)})`
        );
      } else if (price > 0) {
        // Se não tem targetPrice válido, calcular um conservador (8% de valorização)
        targetPrice = price * 1.08;
        console.log(
          `🔧 [${suggestion.ticker}] TargetPrice calculado conservadoramente: R$ ${targetPrice.toFixed(2)} (8% acima do atual)`
        );
      } else {
        // Preço inválido
        targetPrice = 0;
        console.error(`❌ [${suggestion.ticker}] Preço inválido: ${price}`);
      }

      console.log(
        `🔧 [${suggestion.ticker}] RESUMO FINAL:`
      );
      console.log(`   Preço: R$ ${price.toFixed(2)} (BRAPI: ${fullFIIData?.price}, IA: ${suggestion.price})`);
      console.log(`   TargetPrice: R$ ${targetPrice.toFixed(2)}`);
      console.log(`   Valorização: ${price > 0 ? ((targetPrice - price) / price * 100).toFixed(1) : 0}%`);

      // ✅ NOVA CORREÇÃO: Validar e corrigir análise fundamentalista (reasoning)
      let correctedReasoning = suggestion.reasoning || '';
      const currentDY = fullFIIData?.dividendYield || suggestion.dividendYield || 0;
      const selicRate = 14.75;
      
      console.log(`🔍 [${suggestion.ticker}] Validando análise fundamentalista:`);
      console.log(`   DY atual: ${currentDY.toFixed(2)}%`);
      console.log(`   Selic atual: ${selicRate}%`);
      console.log(`   DY vs Selic: ${currentDY > selicRate ? 'SUPERIOR' : currentDY < selicRate ? 'INFERIOR' : 'IGUAL'}`);
      
      // Detectar e corrigir análises incorretas sobre DY vs Selic
      if (correctedReasoning) {
        // Padrões incorretos a serem corrigidos
        const incorrectPatterns = [
          /DY superior à Selic de [\d,.]+ quando/gi,
          /DY de [\d,.]+ supera a Selic/gi,
          /DY acima da Selic de [\d,.]+/gi,
          /DY superior à Selic/gi
        ];
        
        // Verificar se há padrões incorretos E se o DY é realmente inferior à Selic
        const hasIncorrectPattern = incorrectPatterns.some(pattern => pattern.test(correctedReasoning));
        
        if (hasIncorrectPattern && currentDY < selicRate) {
          console.warn(`🚨 [${suggestion.ticker}] ANÁLISE INCORRETA detectada! DY ${currentDY.toFixed(2)}% não é superior à Selic ${selicRate}%`);
          
          // Corrigir o texto da análise
          if (currentDY < selicRate) {
            // DY inferior à Selic
            correctedReasoning = correctedReasoning.replace(
              /DY superior à Selic de [\d,.]+%[^.]*\./gi,
              `DY de ${currentDY.toFixed(1)}% está abaixo da Selic de ${selicRate}%, mas é compensado pelo potencial de valorização e qualidade dos ativos.`
            );
            correctedReasoning = correctedReasoning.replace(
              /DY de [\d,.]+ supera a Selic[^.]*\./gi,
              `DY de ${currentDY.toFixed(1)}% está abaixo da Selic de ${selicRate}%, porém oferece potencial de valorização.`
            );
            correctedReasoning = correctedReasoning.replace(
              /DY acima da Selic de [\d,.]+%/gi,
              `DY de ${currentDY.toFixed(1)}% abaixo da Selic de ${selicRate}%`
            );
            correctedReasoning = correctedReasoning.replace(
              /DY superior à Selic/gi,
              `DY abaixo da Selic`
            );
          }
          
          console.log(`✅ [${suggestion.ticker}] Análise fundamentalista CORRIGIDA`);
        } else if (currentDY >= selicRate) {
          // DY realmente superior - garantir que está correto
          console.log(`✅ [${suggestion.ticker}] Análise fundamentalista CORRETA - DY realmente superior à Selic`);
        }
      }

      return {
        ...suggestion,
        price: price, // ✅ Agora usa preço real da BRAPI
        targetPrice: targetPrice, // ✅ Agora validado e realista
        reasoning: correctedReasoning, // ✅ NOVO: Análise fundamentalista corrigida
        percentage: percentage,
        recommendedAmount: recommendedAmount,
        shares: shares,
        // Garantir que todos os campos necessários existem
        dividendYield:
          fullFIIData?.dividendYield || suggestion.dividendYield || 0,
        pvp: fullFIIData?.pvp || suggestion.pvp || 0,
        sector: fullFIIData?.sector || suggestion.sector || "N/A",
        name: fullFIIData?.name || suggestion.name || suggestion.ticker,
      };
    });

    console.log("\n✅ VALIDAÇÃO COMPLETA - RESUMO:");
    validatedSuggestions.forEach(s => {
      console.log(`${s.ticker}: R$ ${s.price?.toFixed(2)} → R$ ${s.targetPrice?.toFixed(2)} (${s.price > 0 ? ((s.targetPrice - s.price) / s.price * 100).toFixed(1) : 0}%)`);
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
            Descubra os melhores FIIs para seu perfil com IA avançada
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="analysis">Nova Análise</TabsTrigger>
          <TabsTrigger value="results">Resultados</TabsTrigger>
        </TabsList>

        {/* Nova Análise */}
        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Configurar Análise
              </CardTitle>
              <CardDescription>
                Configure seus parâmetros para receber sugestões personalizadas
                de investimento em FIIs
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

          {/* Controle de Cache */}
          <CacheControl 
            onRefresh={(forceRefresh) => {
              // Usar os últimos parâmetros de análise se disponíveis
              if (suggestions?.formData) {
                handleSubmitInvestment(suggestions.formData, forceRefresh);
              }
            }}
            isLoading={isLoading}
          />

          {/* Erro */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro na Análise</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* Resultados */}
        <TabsContent value="results" className="space-y-6">
          {suggestions ? (
            <>
              {/* Resumo da Análise */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Resumo da Análise
                  </CardTitle>
                  <CardDescription>
                    Análise realizada em{" "}
                    {new Date(suggestions.timestamp).toLocaleString("pt-BR")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {suggestions.suggestions?.length || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        FIIs Recomendados
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(calculateRealTotal())}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Valor Total Real
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {suggestions.totalFIIsAnalyzed || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        FIIs Analisados
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {suggestions.formData?.riskProfile || "N/A"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Perfil de Risco
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

              {/* Controle de Cache - TAMBÉM NA ABA RESULTADOS */}
              <CacheControl 
                onRefresh={(forceRefresh) => {
                  // Usar os últimos parâmetros de análise se disponíveis
                  if (suggestions?.formData) {
                    handleSubmitInvestment(suggestions.formData, forceRefresh);
                  }
                }}
                isLoading={isLoading}
              />

              {/* Estratégia de Portfólio */}
              {suggestions.portfolioStrategy && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Estratégia de Portfólio
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Alocação</h4>
                        <p className="text-sm text-muted-foreground">
                          {suggestions.portfolioStrategy.allocation}
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
                        <div className="space-y-2">
                          <p className="text-lg font-semibold text-primary">
                            {calculateExpectedReturn().total.toFixed(1)}% ao ano
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {calculateExpectedReturn().breakdown}
                          </p>
                          <div className="text-xs text-muted-foreground">
                            <p>
                              • Dividend Yield médio:{" "}
                              {calculateExpectedReturn().dividendYield.toFixed(
                                1
                              )}
                              %
                            </p>
                            <p>
                              • Valorização esperada:{" "}
                              {calculateExpectedReturn().appreciation}%
                            </p>
                            <p>
                              • Estimativa conservadora baseada na carteira
                              selecionada
                            </p>
                          </div>
                        </div>
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
            <>
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

              {/* Controle de Cache - TAMBÉM QUANDO NÃO HÁ RESULTADOS */}
              <CacheControl 
                onRefresh={(forceRefresh) => {
                  // Ir para aba de análise se não há dados
                  setActiveTab("analysis");
                }}
                isLoading={isLoading}
              />
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Investment;

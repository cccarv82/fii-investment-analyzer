import React, { useState, useEffect } from "react";
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
import fiiDataAPI from "../lib/api/fiiDataAPI";
import InvestmentForm from "../components/investment/InvestmentForm";
import { SuggestionsList } from "../components/investment/SuggestionCard";
import CacheControl from "../components/common/CacheControl";
import { useNavigate } from "react-router-dom";

const Investment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [error, setError] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [activeTab, setActiveTab] = useState("analysis");
  const [isNewAnalysisInProgress, setIsNewAnalysisInProgress] = useState(false);

  const { 
    generateSuggestions, 
    isConfigured, 
    lastAnalysis, 
    hasLastAnalysis, 
    getLastAnalysisTime,
    loadLastAnalysis 
  } = useAI();
  const { addInvestment, positions } = usePortfolio();
  const navigate = useNavigate();

  const loadPreviousAnalysis = () => {
    if (hasLastAnalysis() && lastAnalysis) {
      console.log('📥 Carregando análise anterior manualmente...');
      
      const enrichedAnalysis = {
        ...lastAnalysis,
        totalFIIsAnalyzed: lastAnalysis.totalFIIsAnalyzed || 0,
        formData: lastAnalysis.formData || {
          riskProfile: 'N/A',
          investmentGoal: 'N/A',
          timeHorizon: 'N/A',
          amount: 0
        },
        suggestions: (lastAnalysis.suggestions || []).map(suggestion => ({
          ...suggestion,
          price: suggestion.price || 0,
          shares: suggestion.recommendedShares || suggestion.shares || 0,
          recommendedAmount: suggestion.recommendedAmount || 0,
          percentage: suggestion.percentage || 0
        }))
      };
      
      setSuggestions(enrichedAnalysis);
      setActiveTab("results");
      console.log(`✅ Análise anterior carregada: ${enrichedAnalysis.suggestions?.length || 0} sugestões`);
    }
  };

  const calculateRealTotal = () => {
    if (!suggestions?.suggestions || !Array.isArray(suggestions.suggestions)) {
      console.log('�� calculateRealTotal: Sem sugestões válidas');
      return 0;
    }

    const total = suggestions.suggestions.reduce((total, suggestion) => {
      const shares = Number(suggestion.recommendedShares || suggestion.shares) || 0;
      const price = Number(suggestion.price) || 0;
      const amount = shares * price;
      
      console.log(`🔍 ${suggestion.ticker}: ${shares} cotas × R$ ${price.toFixed(2)} = R$ ${amount.toFixed(2)}`);
      return total + amount;
    }, 0);

    console.log(`🔍 calculateRealTotal: Total = R$ ${total.toFixed(2)}`);
    return total;
  };

  const calculateExpectedReturn = () => {
    if (!suggestions?.suggestions || !Array.isArray(suggestions.suggestions) || suggestions.suggestions.length === 0) {
      return {
        dividendYield: 0,
        appreciation: 7,
        total: 7,
        breakdown: "Aguardando análise...",
      };
    }

    const validSuggestions = suggestions.suggestions.filter(fii => 
      fii.dividendYield && !isNaN(fii.dividendYield) && fii.dividendYield > 0
    );

    if (validSuggestions.length === 0) {
      return {
        dividendYield: 0,
        appreciation: 7,
        total: 7,
        breakdown: "DY não disponível para cálculo",
      };
    }

    const avgDY = validSuggestions.reduce((sum, fii) => {
      return sum + (Number(fii.dividendYield) || 0);
    }, 0) / validSuggestions.length;

    const expectedAppreciation = 7;

    const totalReturn = avgDY + expectedAppreciation;

    return {
      dividendYield: avgDY,
      appreciation: expectedAppreciation,
      total: totalReturn,
      breakdown: `DY ${avgDY.toFixed(1)}% + Valorização ${expectedAppreciation}% = ${totalReturn.toFixed(1)}%`,
    };
  };

  const getSummaryData = () => {
    const data = {
      fiisRecomendados: suggestions?.suggestions?.length || 0,
      valorTotalReal: calculateRealTotal(),
      fiisAnalisados: suggestions?.totalFIIsAnalyzed || 0,
      perfilRisco: suggestions?.formData?.riskProfile || "N/A"
    };

    console.log('🔍 getSummaryData:', data);
    return data;
  };

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

      const withPrice = fiis.filter((f) => f.price && f.price > 0).length;
      const withDY = fiis.filter(
        (f) => f.dividendYield && f.dividendYield > 0
      ).length;
      const withPVP = fiis.filter((f) => f.pvp && f.pvp > 0).length;
      const withSector = fiis.filter((f) => f.sector).length;

      console.log(
        `Estatísticas: price=${withPrice}, DY=${withDY}, PVP=${withPVP}, sector=${withSector}`
      );

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

      if (step === "APÓS FILTROS DE PERFIL" && fiis.length === 0) {
        console.log("\\n🚨 INVESTIGANDO POR QUE 0 FIIs PASSARAM:");
        console.log("Vamos testar alguns FIIs manualmente...");

        console.log(
          "✅ Dados de teste removidos - usando apenas dados reais do Status Invest"
        );
      }
    }
  };

  const handleSubmitInvestment = async (formData, forceRefresh = false) => {
    setIsLoading(true);
    setIsNewAnalysisInProgress(true);
    setError(null);
    setLoadingProgress(0);
    setLoadingMessage("Inicializando análise ULTIMATE...");

    try {
      if (!isConfigured) {
        throw new Error(
          "Claude API key não configurada. Configure nas Configurações."
        );
      }

      setLoadingProgress(15);
      setLoadingMessage("Carregando FIIs do Status Invest...");

      console.log("🔑 [Investment] Usando dados do Status Invest");

      const allFIIs = await fiiDataAPI.getFIIData();
      console.log(`📊 ${allFIIs.length} FIIs carregados para análise`);
      debugFIIData(allFIIs, "DADOS ORIGINAIS - STATUS INVEST");

      if (allFIIs.length < 10) {
        throw new Error(
          `Apenas ${allFIIs.length} FIIs carregados. Tente novamente mais tarde.`
        );
      }

      setLoadingProgress(30);
      setLoadingMessage(
        "Selecionando os melhores FIIs com algoritmo inteligente..."
      );

      const bestFIIs = await fiiDataAPI.getBestFIIsForAI(60);
      console.log(`🏆 ${bestFIIs.length} melhores FIIs selecionados para IA`);
      debugFIIData(bestFIIs, "MELHORES PARA IA");

      if (bestFIIs.length < 10) {
        throw new Error(
          `Apenas ${bestFIIs.length} FIIs de qualidade encontrados. Tente novamente mais tarde.`
        );
      }

      setLoadingProgress(45);
      setLoadingMessage(
        "Usando os melhores FIIs diretamente..."
      );

      console.log(
        "🎯 Usando os melhores FIIs diretamente"
      );

      const finalFIIsForAI = bestFIIs.slice(0, 60);
      console.log(
        `🎯 ${finalFIIsForAI.length} FIIs selecionados para IA`
      );
      debugFIIData(finalFIIsForAI, "FINAL PARA IA");

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

      const optimizedFIIs = finalFIIsForAI.slice(0, 80).map((fii) => ({
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

      const aiAnalysis = await generateSuggestions(userProfile);

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

      setLoadingProgress(90);
      setLoadingMessage("Validando e calculando alocações...");

      const validatedSuggestions = validateAndCalculateAllocations(
        aiAnalysis,
        formData.amount,
        allFIIs
      );

      setLoadingProgress(100);
      setLoadingMessage("Análise concluída com sucesso!");

      const finalSuggestions = {
        ...validatedSuggestions,
        formData,
        timestamp: new Date().toISOString(),
        source: "ai_suprema",
        totalFIIsAnalyzed: allFIIs.length,
        bestFIIsSelected: bestFIIs.length,
        finalFIIsForAI: finalFIIsForAI.length,
        isRecovered: false
      };

      setSuggestions(finalSuggestions);

      setTimeout(() => {
        setActiveTab("results");
        setIsNewAnalysisInProgress(false);
      }, 1000);

      console.log("✅ Análise ULTIMATE concluída com sucesso!");
    } catch (error) {
      console.error("❌ Erro na análise:", error);
      setError(error.message);
      setIsNewAnalysisInProgress(false);
    } finally {
      setIsLoading(false);
      setLoadingProgress(0);
      setLoadingMessage("");
    }
  };

  const validateAndCalculateAllocations = (
    aiAnalysis,
    totalAmount,
    allFIIs
  ) => {
    console.log("🔧 [validateAndCalculateAllocations] Iniciando validação...");
    console.log("📊 Sugestões recebidas da IA:", aiAnalysis.suggestions);
    
    const suggestions = aiAnalysis.suggestions || [];

    if (suggestions.length === 0) {
      throw new Error("IA não retornou nenhuma sugestão válida");
    }

    const equalPercentage = 100 / suggestions.length;

    const validatedSuggestions = suggestions.map((suggestion, index) => {
      console.log(`\n🔍 [${suggestion.ticker}] VALIDAÇÃO INICIADA:`);
      console.log(`   IA Price: ${suggestion.price}`);
      console.log(`   IA TargetPrice: ${suggestion.targetPrice}`);
      
      const fullFIIData = allFIIs.find(
        (fii) => fii.ticker === suggestion.ticker
      );

      const price = fullFIIData?.price || suggestion.price || 0;
      const percentage = suggestion.percentage || equalPercentage;
      const recommendedAmount = (totalAmount * percentage) / 100;
      const shares = price > 0 ? Math.floor(recommendedAmount / price) : 0;

      console.log(`   Status Invest Price: ${fullFIIData?.price}`);
      console.log(`   Final Price: ${price}`);
      console.log(`   Percentage: ${percentage}%`);
      console.log(`   Total Amount: R$ ${totalAmount}`);
      console.log(`   Recommended Amount: R$ ${recommendedAmount.toFixed(2)}`);
      console.log(`   Calculated Shares: ${shares}`);

      // ✅ CORREÇÃO CRÍTICA: Garantir que shares nunca seja 0 se há valor para investir
      let finalShares = shares;
      if (finalShares === 0 && recommendedAmount > 0 && price > 0) {
        finalShares = Math.max(1, Math.floor(recommendedAmount / price));
        console.warn(`🔧 [${suggestion.ticker}] CORREÇÃO: Shares era 0, forçando para ${finalShares}`);
      }

      // ✅ VALIDAÇÃO ADICIONAL: Se ainda for 0, usar valor mínimo
      if (finalShares === 0 && price > 0) {
        finalShares = 1;
        console.warn(`🔧 [${suggestion.ticker}] FALLBACK: Definindo shares mínimo = 1`);
      }

      let targetPrice = suggestion.targetPrice;
      
      console.log(`   TargetPrice Original: ${targetPrice} (tipo: ${typeof targetPrice})`);
      
      if (typeof targetPrice === 'string') {
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
      
      if (targetPrice && price > 0) {
        const maxRealisticTarget = price * 1.12;
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
        targetPrice = price * 1.08;
        console.log(
          `🔧 [${suggestion.ticker}] TargetPrice calculado conservadoramente: R$ ${targetPrice.toFixed(2)} (8% acima do atual)`
        );
      } else {
        targetPrice = 0;
        console.error(`❌ [${suggestion.ticker}] Preço inválido: ${price}`);
      }

      console.log(
        `🔧 [${suggestion.ticker}] RESUMO FINAL:`
      );
      console.log(`   Preço: R$ ${price.toFixed(2)} (Status Invest: ${fullFIIData?.price}, IA: ${suggestion.price})`);
      console.log(`   TargetPrice: R$ ${targetPrice.toFixed(2)}`);
      console.log(`   Valorização: ${price > 0 ? ((targetPrice - price) / price * 100).toFixed(1) : 0}%`);

      let correctedReasoning = suggestion.reasoning || '';
      const currentDY = fullFIIData?.dividendYield || suggestion.dividendYield || 0;
      const selicRate = 14.75;
      
      console.log(`🔍 [${suggestion.ticker}] Validando análise fundamentalista:`);
      console.log(`   DY atual: ${currentDY.toFixed(2)}%`);
      console.log(`   Selic atual: ${selicRate}%`);
      console.log(`   DY vs Selic: ${currentDY > selicRate ? 'SUPERIOR' : currentDY < selicRate ? 'INFERIOR' : 'IGUAL'}`);
      
      if (correctedReasoning) {
        const incorrectPatterns = [
          /DY superior à Selic de [\d,.]+ quando/gi,
          /DY de [\d,.]+ supera a Selic/gi,
          /DY acima da Selic de [\d,.]+/gi,
          /DY superior à Selic/gi
        ];
        
        const hasIncorrectPattern = incorrectPatterns.some(pattern => pattern.test(correctedReasoning));
        
        if (hasIncorrectPattern && currentDY < selicRate) {
          console.warn(`🚨 [${suggestion.ticker}] ANÁLISE INCORRETA detectada! DY ${currentDY.toFixed(2)}% não é superior à Selic ${selicRate}%`);
          
          if (currentDY < selicRate) {
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
          console.log(`✅ [${suggestion.ticker}] Análise fundamentalista CORRETA - DY realmente superior à Selic`);
        }
      }

      return {
        ...suggestion,
        price: price,
        targetPrice: targetPrice,
        reasoning: correctedReasoning,
        percentage: percentage,
        recommendedAmount: recommendedAmount,
        shares: finalShares,
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

  const handleAddToPortfolio = async (suggestion) => {
    try {
      const price = suggestion.price || 0;
      const shares = suggestion.recommendedShares || suggestion.shares || 0;

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
        average_price: Math.max(price, 0.01),
        current_price: Math.max(price, 0.01),
        dividend_yield: suggestion.dividendYield || 0,
        pvp: suggestion.pvp || 0,
      };

      await addInvestment(investmentData);
      
      // Mostrar mensagem de sucesso e redirecionar para carteira
      if (window.confirm(`✅ ${suggestion.ticker} foi adicionado à sua carteira com sucesso! Deseja ver sua carteira agora?`)) {
        navigate("/portfolio");
      }
      
    } catch (error) {
      console.error("❌ Erro ao adicionar à carteira:", error);
      alert(`❌ Erro ao adicionar ${suggestion.ticker} à carteira: ${error.message}`);
      throw error;
    }
  };

  const isIncompleteRecoveredAnalysis = (analysis) => {
    if (!analysis || !analysis.isRecovered) return false;
    
    const hasFormData = analysis.formData && analysis.formData.riskProfile !== 'N/A';
    const hasTotalAnalyzed = analysis.totalFIIsAnalyzed && analysis.totalFIIsAnalyzed > 0;
    const hasValidSuggestions = analysis.suggestions && analysis.suggestions.length > 0 && 
      analysis.suggestions.some(s => s.price > 0 && (s.recommendedShares > 0 || s.shares > 0));
    
    return !hasFormData || !hasTotalAnalyzed || !hasValidSuggestions;
  };

  return (
    <div className="space-y-6">
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="analysis">
            Nova Análise
            {hasLastAnalysis() && !suggestions && (
              <span className="ml-1 w-2 h-2 bg-blue-500 rounded-full"></span>
            )}
          </TabsTrigger>
          <TabsTrigger value="results">
            Resultados
            {suggestions && (
              <span className="ml-1 w-2 h-2 bg-green-500 rounded-full"></span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="space-y-6">
          {hasLastAnalysis() && !suggestions && (
            <Card className="border-border bg-card shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-foreground">
                  <div className="p-2 bg-muted rounded-lg">
                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold">Análise Anterior Disponível</div>
                    <div className="text-sm font-normal text-muted-foreground mt-1">
                      Realizada em{" "}
                      <span className="font-medium text-foreground">
                        {getLastAnalysisTime() ? 
                          new Date(getLastAnalysisTime()).toLocaleString("pt-BR") : 
                          "data não disponível"
                        }
                      </span>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    size="sm" 
                    className="transition-all duration-200"
                    onClick={loadPreviousAnalysis}
                  >
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Ver Análise Anterior
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="transition-all duration-200"
                    onClick={() => {
                      if (lastAnalysis?.formData) {
                        handleSubmitInvestment(lastAnalysis.formData, true);
                      }
                    }}
                    disabled={isLoading}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Atualizar com Dados Atuais
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

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

          <CacheControl 
            onRefresh={(forceRefresh) => {
              if (suggestions?.formData) {
                handleSubmitInvestment(suggestions.formData, forceRefresh);
              }
            }}
            isLoading={isLoading}
          />

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro na Análise</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {suggestions ? (
            <>
              {isIncompleteRecoveredAnalysis(suggestions) && (
                <Card className="border-yellow-200/20 bg-card shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-3 text-foreground">
                      <div className="p-2 bg-yellow-500/10 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                      </div>
                      <div>
                        <div className="text-lg font-semibold">Análise Recuperada Incompleta</div>
                        <div className="text-sm font-normal text-muted-foreground mt-1">
                          Alguns dados podem estar desatualizados
                        </div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-muted-foreground mb-3">
                      Esta análise foi recuperada do histórico, mas alguns dados podem estar incompletos.
                      Recomendamos fazer uma nova análise para obter informações atualizadas.
                    </p>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="transition-all duration-200"
                      onClick={() => setActiveTab("analysis")}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Fazer Nova Análise
                    </Button>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Resumo da Análise
                    {suggestions?.isRecovered && (
                      <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        📥 Recuperada
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription className="space-y-1">
                    <div>
                      Análise realizada em{" "}
                      {new Date(suggestions.timestamp).toLocaleString("pt-BR")}
                    </div>
                    {suggestions?.isRecovered && (
                      <div className="text-sm text-blue-600">
                        {(() => {
                          const analysisAge = Math.round((new Date() - new Date(suggestions.timestamp)) / (1000 * 60 * 60));
                          return analysisAge < 1 
                            ? "📥 Recuperada do cache (menos de 1h)" 
                            : analysisAge < 24 
                              ? `📥 Recuperada do cache (${analysisAge}h atrás)`
                              : "📊 Recuperada do histórico (Supabase)";
                        })()}
                      </div>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {getSummaryData().fiisRecomendados}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        FIIs Recomendados
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(getSummaryData().valorTotalReal)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Valor Total Real
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {getSummaryData().fiisAnalisados}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        FIIs Analisados
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {getSummaryData().perfilRisco}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Perfil de Risco
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <SuggestionsList
                suggestions={suggestions.suggestions || []}
                onAddToPortfolio={handleAddToPortfolio}
              />

              <CacheControl 
                onRefresh={(forceRefresh) => {
                  if (suggestions?.formData) {
                    handleSubmitInvestment(suggestions.formData, forceRefresh);
                  }
                }}
                isLoading={isLoading}
              />

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

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("analysis")}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Nova Análise
                </Button>
                
                {suggestions?.formData && (
                  <Button
                    variant="default"
                    onClick={() => handleSubmitInvestment(suggestions.formData, true)}
                    disabled={isLoading}
                  >
                    <TrendingUp className="mr-2 h-4 w-4" />
                    {isLoading ? "Atualizando..." : "Atualizar Análise"}
                  </Button>
                )}
              </div>
            </>
          ) : (
            <>
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center space-y-4">
                    <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    
                    {hasLastAnalysis() ? (
                      <div className="space-y-2">
                        <p className="text-lg font-medium">
                          📊 Análise anterior disponível
                        </p>
                        <p className="text-muted-foreground">
                          Última análise realizada em{" "}
                          {getLastAnalysisTime() ? 
                            new Date(getLastAnalysisTime()).toLocaleString("pt-BR") : 
                            "data não disponível"
                          }
                        </p>
                        <Button 
                          onClick={loadPreviousAnalysis}
                          className="mt-4"
                        >
                          <TrendingUp className="mr-2 h-4 w-4" />
                          Ver Última Análise
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-lg font-medium">
                          🚀 Pronto para começar?
                        </p>
                        <p className="text-muted-foreground">
                          Nenhuma análise realizada ainda. Vá para "Nova Análise" para
                          começar sua jornada de investimentos em FIIs.
                        </p>
                        <Button 
                          onClick={() => setActiveTab("analysis")}
                          className="mt-4"
                        >
                          <BarChart3 className="mr-2 h-4 w-4" />
                          Fazer Primeira Análise
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <CacheControl 
                onRefresh={(forceRefresh) => {
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

import React, { useState } from "react";
import {
  TrendingUp,
  AlertCircle,
  Info,
  PieChart,
  DollarSign,
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
import InvestmentForm from "../components/investment/InvestmentForm";
import SuggestionCard from "../components/investment/SuggestionCard";

const Investment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [error, setError] = useState(null);

  const { generateInvestmentSuggestions, isConfigured } = useAI();
  const { addInvestment } = usePortfolio();

  // Base de dados de FIIs para análise
  const fiiDatabase = [
    {
      ticker: "HGLG11",
      name: "CSHG Logística FII",
      price: 172.5,
      dividendYield: 7.8,
      pvp: 0.95,
      sector: "Logística",
      description: "Fundo especializado em galpões logísticos",
    },
    {
      ticker: "XPLG11",
      name: "XP Log FII",
      price: 105.2,
      dividendYield: 8.2,
      pvp: 0.88,
      sector: "Logística",
      description: "Fundo de investimento em ativos logísticos",
    },
    {
      ticker: "VISC11",
      name: "Vinci Shopping Centers FII",
      price: 112.3,
      dividendYield: 7.5,
      pvp: 0.92,
      sector: "Shoppings",
      description: "Fundo especializado em shopping centers",
    },
    {
      ticker: "KNRI11",
      name: "Kinea Renda Imobiliária FII",
      price: 142.8,
      dividendYield: 6.8,
      pvp: 0.97,
      sector: "Corporativo",
      description: "Fundo diversificado em imóveis corporativos",
    },
    {
      ticker: "KNCR11",
      name: "Kinea Rendimentos Imobiliários FII",
      price: 98.5,
      dividendYield: 9.2,
      pvp: 1.02,
      sector: "Recebíveis",
      description: "Fundo de recebíveis imobiliários",
    },
    {
      ticker: "MXRF11",
      name: "Maxi Renda FII",
      price: 10.2,
      dividendYield: 10.5,
      pvp: 1.05,
      sector: "Recebíveis",
      description: "Fundo de recebíveis imobiliários",
    },
    {
      ticker: "BTLG11",
      name: "BTG Pactual Logística FII",
      price: 98.75,
      dividendYield: 8.5,
      pvp: 0.89,
      sector: "Logística",
      description: "Fundo especializado em ativos logísticos",
    },
    {
      ticker: "IRDM11",
      name: "Iridium Recebíveis Imobiliários FII",
      price: 95.4,
      dividendYield: 9.8,
      pvp: 0.96,
      sector: "Recebíveis",
      description: "Fundo de recebíveis imobiliários",
    },
  ];

  // Função para calcular alocação otimizada
  const calculateOptimalAllocation = (amount, selectedFiis, riskProfile) => {
    const allocation = [];
    let remainingAmount = amount;

    // Definir pesos baseados no perfil de risco
    const riskWeights = {
      conservador: {
        logistica: 0.4,
        corporativo: 0.3,
        recebiveis: 0.2,
        shoppings: 0.1,
      },
      moderado: {
        logistica: 0.35,
        corporativo: 0.25,
        recebiveis: 0.25,
        shoppings: 0.15,
      },
      arrojado: {
        logistica: 0.3,
        corporativo: 0.2,
        recebiveis: 0.3,
        shoppings: 0.2,
      },
    };

    const weights = riskWeights[riskProfile] || riskWeights.moderado;

    // Agrupar FIIs por setor
    const sectorGroups = {};
    selectedFiis.forEach((fii) => {
      const sectorKey = fii.sector.toLowerCase();
      if (!sectorGroups[sectorKey]) {
        sectorGroups[sectorKey] = [];
      }
      sectorGroups[sectorKey].push(fii);
    });

    // Calcular alocação por setor
    Object.entries(weights).forEach(([sector, weight]) => {
      if (sectorGroups[sector] && remainingAmount > 0) {
        const sectorAmount = amount * weight;
        const sectorFiis = sectorGroups[sector];

        // Distribuir valor entre FIIs do setor
        sectorFiis.forEach((fii, index) => {
          if (remainingAmount > 0) {
            const fiiWeight = 1 / sectorFiis.length;
            const targetAmount = sectorAmount * fiiWeight;

            // Calcular número de cotas (sem truncar)
            const shares = Math.floor(targetAmount / fii.price);
            const investmentAmount = shares * fii.price;

            if (shares > 0 && investmentAmount <= remainingAmount) {
              allocation.push({
                ...fii,
                shares,
                investmentAmount,
                percentage: (investmentAmount / amount) * 100,
                recommendedAmount: targetAmount,
              });

              remainingAmount -= investmentAmount;
            }
          }
        });
      }
    });

    // Se ainda sobrar dinheiro, alocar no FII com melhor custo-benefício
    if (remainingAmount > 50) {
      // Mínimo para comprar mais cotas
      const bestFii = selectedFiis
        .filter((fii) => fii.price <= remainingAmount)
        .sort(
          (a, b) => b.dividendYield / b.price - a.dividendYield / a.price
        )[0];

      if (bestFii) {
        const additionalShares = Math.floor(remainingAmount / bestFii.price);
        const additionalAmount = additionalShares * bestFii.price;

        // Verificar se já existe na alocação
        const existingIndex = allocation.findIndex(
          (item) => item.ticker === bestFii.ticker
        );
        if (existingIndex >= 0) {
          allocation[existingIndex].shares += additionalShares;
          allocation[existingIndex].investmentAmount += additionalAmount;
          allocation[existingIndex].percentage =
            (allocation[existingIndex].investmentAmount / amount) * 100;
        } else {
          allocation.push({
            ...bestFii,
            shares: additionalShares,
            investmentAmount: additionalAmount,
            percentage: (additionalAmount / amount) * 100,
            recommendedAmount: additionalAmount,
          });
        }

        remainingAmount -= additionalAmount;
      }
    }

    return { allocation, remainingAmount };
  };

  // Função principal para obter sugestões
  const handleSubmitInvestment = async (formData) => {
    setIsLoading(true);
    setError(null);

    try {
      let finalSuggestions;

      if (isConfigured) {
        // Usar IA real da OpenAI
        console.log("🤖 Usando IA real da OpenAI...");

        const aiAnalysis = await generateInvestmentSuggestions({
          amount: formData.amount,
          riskProfile: formData.riskProfile,
          investmentGoal: formData.investmentGoal,
          timeHorizon: formData.timeHorizon,
          availableFiis: fiiDatabase,
        });

        if (aiAnalysis && aiAnalysis.recommendations) {
          // Processar recomendações da IA
          const selectedFiis = aiAnalysis.recommendations
            .map((rec) => {
              const fii = fiiDatabase.find((f) => f.ticker === rec.ticker);
              return fii
                ? { ...fii, aiScore: rec.score, aiReasoning: rec.reasoning }
                : null;
            })
            .filter(Boolean);

          const { allocation, remainingAmount } = calculateOptimalAllocation(
            formData.amount,
            selectedFiis.slice(0, 6), // Máximo 6 FIIs
            formData.riskProfile
          );

          // Adicionar análises da IA
          allocation.forEach((item) => {
            const aiRec = aiAnalysis.recommendations.find(
              (r) => r.ticker === item.ticker
            );
            if (aiRec) {
              item.reasoning = aiRec.reasoning;
              item.strengths = aiRec.strengths || [];
              item.weaknesses = aiRec.weaknesses || [];
              item.aiScore = aiRec.score;
            }
          });

          finalSuggestions = {
            allocation,
            summary: {
              totalAmount: formData.amount,
              totalInvestment: formData.amount - remainingAmount,
              remainingAmount,
              expectedYield: allocation.reduce(
                (sum, item) =>
                  sum + (item.investmentAmount * item.dividendYield) / 100,
                0
              ),
              expectedYieldPercentage:
                allocation.length > 0
                  ? (allocation.reduce(
                      (sum, item) =>
                        sum +
                        (item.investmentAmount * item.dividendYield) / 100,
                      0
                    ) /
                      allocation.reduce(
                        (sum, item) => sum + item.investmentAmount,
                        0
                      )) *
                    100
                  : 0,
              diversificationScore: Math.min(95, allocation.length * 15 + 25),
              aiAnalysis:
                aiAnalysis.marketAnalysis || "Análise realizada com IA",
            },
            formData,
            timestamp: new Date().toISOString(),
            source: "openai",
          };
        } else {
          throw new Error("IA não retornou recomendações válidas");
        }
      } else {
        // Fallback: análise algorítmica sem IA
        console.log("📊 Usando análise algorítmica (IA não configurada)...");

        // Selecionar melhores FIIs baseado no perfil
        let selectedFiis = [...fiiDatabase];

        // Filtrar baseado no perfil de risco
        if (formData.riskProfile === "conservador") {
          selectedFiis = selectedFiis.filter(
            (fii) => fii.pvp <= 1.0 && fii.dividendYield >= 6.0
          );
        } else if (formData.riskProfile === "arrojado") {
          selectedFiis = selectedFiis.sort(
            (a, b) => b.dividendYield - a.dividendYield
          );
        }

        // Ordenar por atratividade (DY/P/VP)
        selectedFiis = selectedFiis
          .sort((a, b) => b.dividendYield / b.pvp - a.dividendYield / a.pvp)
          .slice(0, 6);

        const { allocation, remainingAmount } = calculateOptimalAllocation(
          formData.amount,
          selectedFiis,
          formData.riskProfile
        );

        // Adicionar análises algorítmicas
        allocation.forEach((item) => {
          item.reasoning = `Selecionado por ${
            item.pvp < 1
              ? "negociar abaixo do valor patrimonial"
              : "alto dividend yield"
          } e boa liquidez.`;
          item.strengths = [
            `Dividend yield de ${item.dividendYield}%`,
            item.pvp < 1 ? "P/VP abaixo de 1,00" : "Boa rentabilidade",
            "Setor com fundamentos sólidos",
          ];
          item.weaknesses = item.pvp > 1 ? ["P/VP acima de 1,00"] : [];
        });

        finalSuggestions = {
          allocation,
          summary: {
            totalAmount: formData.amount,
            totalInvestment: formData.amount - remainingAmount,
            remainingAmount,
            expectedYield: allocation.reduce(
              (sum, item) =>
                sum + (item.investmentAmount * item.dividendYield) / 100,
              0
            ),
            expectedYieldPercentage:
              allocation.length > 0
                ? (allocation.reduce(
                    (sum, item) =>
                      sum + (item.investmentAmount * item.dividendYield) / 100,
                    0
                  ) /
                    allocation.reduce(
                      (sum, item) => sum + item.investmentAmount,
                      0
                    )) *
                  100
                : 0,
            diversificationScore: Math.min(90, allocation.length * 15 + 20),
            aiAnalysis:
              "Análise realizada com algoritmos fundamentalistas (IA não configurada)",
          },
          formData,
          timestamp: new Date().toISOString(),
          source: "algorithmic",
        };
      }

      setSuggestions(finalSuggestions);
    } catch (err) {
      console.error("Erro ao gerar sugestões:", err);
      setError(`Erro ao processar sugestões: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToPortfolio = async (suggestion) => {
    try {
      await addInvestment({
        ticker: suggestion.ticker,
        name: suggestion.name,
        shares: suggestion.shares,
        price: suggestion.price,
        totalValue: suggestion.investmentAmount,
        date: new Date().toISOString(),
        type: "buy",
      });

      alert(
        `${suggestion.shares} cotas de ${suggestion.ticker} adicionadas à carteira!`
      );
    } catch (error) {
      console.error("Erro ao adicionar à carteira:", error);
      alert("Erro ao adicionar à carteira. Tente novamente.");
    }
  };

  const handleViewDetails = (ticker) => {
    const fii = fiiDatabase.find((f) => f.ticker === ticker);
    if (fii) {
      alert(
        `${ticker} - ${fii.name}\nSetor: ${fii.sector}\nPreço: ${formatCurrency(
          fii.price
        )}\nDY: ${fii.dividendYield}%\nP/VP: ${fii.pvp}`
      );
    }
  };

  const handleNewAnalysis = () => {
    setSuggestions(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Investir em FIIs</h1>
        <p className="text-muted-foreground">
          Receba sugestões personalizadas de investimento em FIIs
          {isConfigured ? " com análise de IA" : " com análise algorítmica"}
        </p>
      </div>

      {/* Aviso sobre IA */}
      {!isConfigured && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>IA não configurada</AlertTitle>
          <AlertDescription>
            Configure sua API key da OpenAI nas Configurações para receber
            análises mais avançadas com IA. Por enquanto, usaremos análise
            algorítmica fundamentalista.
          </AlertDescription>
        </Alert>
      )}

      {/* Erro */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Formulário ou Resultados */}
      {!suggestions ? (
        <InvestmentForm
          onSubmit={handleSubmitInvestment}
          isLoading={isLoading}
        />
      ) : (
        <div className="space-y-6">
          {/* Resumo das Sugestões */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Resumo da Sugestão
                {suggestions.source === "openai" && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    IA
                  </span>
                )}
              </CardTitle>
              <CardDescription>
                Baseado no seu perfil {suggestions.formData.riskProfile} •{" "}
                {suggestions.formData.investmentGoal} •{" "}
                {suggestions.formData.timeHorizon} prazo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Valor Total</h4>
                  <div className="text-2xl font-bold">
                    {formatCurrency(suggestions.summary.totalAmount)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Valor informado para investimento
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Renda Mensal Estimada</h4>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(suggestions.summary.expectedYield / 12)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatPercentage(
                      suggestions.summary.expectedYieldPercentage
                    )}{" "}
                    ao ano
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Diversificação</h4>
                  <div className="text-2xl font-bold">
                    {suggestions.allocation.length} FIIs
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{
                          width: `${suggestions.summary.diversificationScore}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs">
                      {suggestions.summary.diversificationScore}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Valor investido:</strong>{" "}
                    {formatCurrency(suggestions.summary.totalInvestment)} (
                    {formatPercentage(
                      (suggestions.summary.totalInvestment /
                        suggestions.summary.totalAmount) *
                        100
                    )}
                    )
                    <br />
                    <strong>Valor não investido:</strong>{" "}
                    {formatCurrency(suggestions.summary.remainingAmount)} (
                    {formatPercentage(
                      (suggestions.summary.remainingAmount /
                        suggestions.summary.totalAmount) *
                        100
                    )}
                    )
                  </AlertDescription>
                </Alert>

                {suggestions.summary.aiAnalysis && (
                  <Alert>
                    <TrendingUp className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Análise:</strong> {suggestions.summary.aiAnalysis}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tabs para diferentes visualizações */}
          <Tabs defaultValue="cards">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="cards">Cartões</TabsTrigger>
              <TabsTrigger value="table">Tabela</TabsTrigger>
              <TabsTrigger value="chart">Gráfico</TabsTrigger>
            </TabsList>

            {/* Visualização em Cartões */}
            <TabsContent value="cards" className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {suggestions.allocation.map((suggestion) => (
                  <SuggestionCard
                    key={suggestion.ticker}
                    suggestion={suggestion}
                    onAddToPortfolio={handleAddToPortfolio}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            </TabsContent>

            {/* Visualização em Tabela */}
            <TabsContent value="table">
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="px-4 py-3 text-left text-sm font-medium">
                            FII
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-medium">
                            Preço
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-medium">
                            DY
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-medium">
                            P/VP
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-medium">
                            Alocação
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-medium">
                            Valor
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-medium">
                            Cotas
                          </th>
                          <th className="px-4 py-3 text-center text-sm font-medium">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {suggestions.allocation.map((suggestion) => (
                          <tr key={suggestion.ticker} className="border-b">
                            <td className="px-4 py-3 text-sm font-medium">
                              {suggestion.ticker}
                              <div className="text-xs text-muted-foreground">
                                {suggestion.sector}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right text-sm">
                              {formatCurrency(suggestion.price)}
                            </td>
                            <td className="px-4 py-3 text-right text-sm">
                              {formatPercentage(suggestion.dividendYield)}
                            </td>
                            <td className="px-4 py-3 text-right text-sm">
                              {suggestion.pvp.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-right text-sm">
                              {formatPercentage(suggestion.percentage)}
                            </td>
                            <td className="px-4 py-3 text-right text-sm">
                              {formatCurrency(suggestion.investmentAmount)}
                            </td>
                            <td className="px-4 py-3 text-right text-sm">
                              {suggestion.shares}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex justify-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleAddToPortfolio(suggestion)
                                  }
                                >
                                  <DollarSign className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleViewDetails(suggestion.ticker)
                                  }
                                >
                                  <Info className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Visualização em Gráfico */}
            <TabsContent value="chart">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Distribuição da Carteira
                  </CardTitle>
                  <CardDescription>
                    Alocação sugerida por FII e por setor
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <PieChart className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Gráfico de distribuição da carteira</p>
                    <p className="text-sm">(Implementação futura)</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              className="flex-1"
              onClick={handleNewAnalysis}
              variant="outline"
            >
              Nova Análise
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                // Adicionar todos à carteira
                suggestions.allocation.forEach((suggestion) => {
                  handleAddToPortfolio(suggestion);
                });
              }}
            >
              Adicionar Todos à Carteira
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Investment;

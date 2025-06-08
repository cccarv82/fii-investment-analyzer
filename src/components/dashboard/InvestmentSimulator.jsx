import React, { useState, useEffect, useMemo } from "react";
import { useAI } from "../../contexts/AIContext";
import {
  Calculator,
  TrendingUp,
  Target,
  Zap,
  Brain,
  Rocket,
  DollarSign,
  Calendar,
  BarChart3,
  PieChart,
  Sparkles,
  RefreshCw,
  Play,
  Crown,
  Gem,
  Star,
  Trophy
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Slider } from "../ui/slider";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from "recharts";

const InvestmentSimulator = ({ currentPortfolio }) => {
  const { isConfigured, generateSuggestions } = useAI();
  
  // Estados do simulador
  const [simulationParams, setSimulationParams] = useState({
    monthlyAmount: 1000,
    timeHorizon: 60, // meses
    targetIncome: 2000,
    expectedYield: 8.5, // % anual
    inflationRate: 4.0, // % anual
    reinvestDividends: true,
    riskProfile: "moderado" // conservador, moderado, agressivo
  });

  const [simulationResults, setSimulationResults] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState(null);
  const [scenarioAnalysis, setScenarioAnalysis] = useState(null);

  // 🚀 CORREÇÃO: Mover funções para antes do useMemo
  // Gerar cenários de simulação
  const generateScenarios = (params, portfolio) => {
    const scenarios = [];
    const yields = [
      { name: "Pessimista", yield: params.expectedYield - 2, probability: 20 },
      { name: "Realista", yield: params.expectedYield, probability: 60 },
      { name: "Otimista", yield: params.expectedYield + 2, probability: 20 }
    ];

    yields.forEach(scenario => {
      const modifiedParams = { ...params, expectedYield: scenario.yield };
      const result = calculateScenario(modifiedParams, portfolio);
      scenarios.push({
        ...scenario,
        ...result
      });
    });

    return scenarios;
  };

  const calculateScenario = (params, portfolio) => {
    const currentValue = portfolio?.totalValue || 0;
    const totalInvestment = params.monthlyAmount * params.timeHorizon + currentValue;
    const finalValue = totalInvestment * Math.pow(1 + params.expectedYield / 100 / 12, params.timeHorizon);
    const monthlyIncome = (finalValue * params.expectedYield / 100) / 12;

    return {
      totalInvestment,
      finalValue,
      monthlyIncome,
      timeToTarget: monthlyIncome >= params.targetIncome ? 
        params.timeHorizon : 
        Math.ceil((params.targetIncome * 12 * 100) / (params.expectedYield * params.monthlyAmount))
    };
  };

  // Cálculos avançados da simulação
  const advancedSimulation = useMemo(() => {
    if (!simulationParams.monthlyAmount || !simulationParams.timeHorizon) return null;

    const {
      monthlyAmount,
      timeHorizon,
      targetIncome,
      expectedYield,
      inflationRate,
      reinvestDividends
    } = simulationParams;

    // Valores iniciais do portfólio atual
    const currentValue = currentPortfolio?.totalValue || 0;
    const currentMonthlyIncome = currentPortfolio?.monthlyIncome || 0;

    // Simulação mês a mês
    const monthlyData = [];
    let totalInvested = currentValue;
    let portfolioValue = currentValue;
    let monthlyIncome = currentMonthlyIncome;

    for (let month = 1; month <= timeHorizon; month++) {
      // Aporte mensal
      totalInvested += monthlyAmount;
      portfolioValue += monthlyAmount;

      // Rendimento mensal do portfólio
      const monthlyReturn = (expectedYield / 100) / 12;
      portfolioValue *= (1 + monthlyReturn);

      // Dividendos mensais
      monthlyIncome = (portfolioValue * expectedYield / 100) / 12;

      // Reinvestimento de dividendos (se habilitado)
      if (reinvestDividends) {
        portfolioValue += monthlyIncome;
        totalInvested += monthlyIncome;
      }

      // Ajuste pela inflação
      const realValue = portfolioValue / Math.pow(1 + inflationRate / 100 / 12, month);
      const realIncome = monthlyIncome / Math.pow(1 + inflationRate / 100 / 12, month);

      monthlyData.push({
        month,
        year: Math.floor(month / 12) + 1,
        totalInvested,
        portfolioValue,
        monthlyIncome,
        realValue,
        realIncome,
        cumulativeReturn: ((portfolioValue - totalInvested) / totalInvested) * 100
      });
    }

    // Análise final
    const finalData = monthlyData[monthlyData.length - 1];
    const timeToTarget = monthlyData.findIndex(data => data.monthlyIncome >= targetIncome);
    
    // Cenários (otimista, realista, pessimista)
    const scenarios = generateScenarios(simulationParams, currentPortfolio);

    return {
      monthlyData,
      finalResults: {
        totalInvested: finalData.totalInvested,
        finalValue: finalData.portfolioValue,
        finalMonthlyIncome: finalData.monthlyIncome,
        totalReturn: finalData.cumulativeReturn,
        realFinalValue: finalData.realValue,
        realMonthlyIncome: finalData.realIncome,
        timeToTarget: timeToTarget > 0 ? timeToTarget : null,
        targetAchieved: finalData.monthlyIncome >= targetIncome
      },
      scenarios
    };
  }, [simulationParams, currentPortfolio]);

  // Executar simulação com IA
  const runAISimulation = async () => {
    setIsSimulating(true);
    try {
      // Gerar recomendações com IA baseadas na simulação
      const aiAnalysis = await generateAIRecommendations();
      setAiRecommendations(aiAnalysis);
      
      // Definir resultados da simulação
      setSimulationResults(advancedSimulation);
      setScenarioAnalysis(advancedSimulation?.scenarios);

    } catch (error) {
      console.error("Erro na simulação com IA:", error);
    } finally {
      setIsSimulating(false);
    }
  };

  // Gerar recomendações com IA
  const generateAIRecommendations = async () => {
    // Simular análise com IA (substitua por chamada real para Claude)
    await new Promise(resolve => setTimeout(resolve, 1500));

    const { monthlyAmount, timeHorizon, targetIncome, expectedYield } = simulationParams;
    const currentIncome = currentPortfolio?.monthlyIncome || 0;
    const gap = targetIncome - currentIncome;

    return {
      strategy: determineOptimalStrategy(simulationParams, currentPortfolio),
      recommendations: [
        monthlyAmount < 500 ? "💡 Considere aumentar aportes mensais para acelerar objetivos" : "✅ Aportes mensais adequados para o perfil",
        expectedYield < 8 ? "📈 Busque FIIs com maior dividend yield para otimizar retornos" : "🎯 Expectativa de yield realista para o mercado atual",
        timeHorizon > 120 ? "⏰ Prazo muito longo - considere metas intermediárias" : "📅 Horizonte temporal adequado",
        gap > currentIncome * 3 ? "🚀 Meta ambiciosa - considere estratégia agressiva" : "🎯 Meta atingível com disciplina"
      ],
      optimizations: [
        "🔄 Reinvestir dividendos acelera crescimento exponencial",
        "📊 Diversificar em setores defensivos reduz volatilidade",
        "💰 Aportes extras em quedas maximizam oportunidades",
        "📈 Revisar estratégia a cada 6 meses para ajustes"
      ],
      riskFactors: [
        expectedYield > 10 ? "⚠️ Expectativa de yield muito alta pode ser irrealista" : null,
        monthlyAmount > 5000 ? "💸 Aportes altos exigem disciplina e planejamento" : null,
        timeHorizon < 24 ? "⏱️ Prazo curto pode não permitir composição adequada" : null
      ].filter(Boolean)
    };
  };

  const determineOptimalStrategy = (params, portfolio) => {
    const { monthlyAmount, targetIncome, expectedYield } = params;
    const currentIncome = portfolio?.monthlyIncome || 0;
    const gap = targetIncome - currentIncome;

    if (gap <= currentIncome) {
      return {
        type: "Conservadora",
        description: "Manter aportes regulares e focar em FIIs de alta qualidade",
        color: "green"
      };
    } else if (gap <= currentIncome * 2) {
      return {
        type: "Moderada",
        description: "Aumentar aportes gradualmente e diversificar setores",
        color: "blue"
      };
    } else {
      return {
        type: "Agressiva",
        description: "Aportes altos e foco em FIIs de alto dividend yield",
        color: "purple"
      };
    }
  };

  // Dados para gráficos
  const chartData = useMemo(() => {
    if (!advancedSimulation) return null;

    // Dados de evolução temporal (anual)
    const yearlyData = [];
    for (let year = 1; year <= Math.ceil(simulationParams.timeHorizon / 12); year++) {
      const monthIndex = year * 12 - 1;
      if (monthIndex < advancedSimulation.monthlyData.length) {
        const data = advancedSimulation.monthlyData[monthIndex];
        yearlyData.push({
          year,
          valor: data.portfolioValue,
          investido: data.totalInvested,
          renda: data.monthlyIncome,
          rendaReal: data.realIncome
        });
      }
    }

    return { yearlyData };
  }, [advancedSimulation, simulationParams.timeHorizon]);

  return (
    <div className="space-y-6">
      {/* Header do Simulador */}
      <Card className="border-2 border-gradient-to-r from-purple-500 to-pink-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-6 w-6" />
            Simulador de Aportes Épico
            <Gem className="h-5 w-5 text-purple-600" />
            <Badge variant="outline" className="ml-2">
              <Brain className="h-3 w-3 mr-1" />
              IA Integrada
            </Badge>
          </CardTitle>
          <CardDescription>
            Projete sua independência financeira com precisão matemática e insights de IA
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Parâmetros da Simulação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Parâmetros da Simulação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="monthlyAmount">Aporte Mensal (R$)</Label>
              <Input
                id="monthlyAmount"
                type="number"
                value={simulationParams.monthlyAmount}
                onChange={(e) => setSimulationParams({
                  ...simulationParams,
                  monthlyAmount: Number(e.target.value)
                })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="timeHorizon">Prazo (meses)</Label>
              <Input
                id="timeHorizon"
                type="number"
                value={simulationParams.timeHorizon}
                onChange={(e) => setSimulationParams({
                  ...simulationParams,
                  timeHorizon: Number(e.target.value)
                })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="targetIncome">Meta de Renda (R$/mês)</Label>
              <Input
                id="targetIncome"
                type="number"
                value={simulationParams.targetIncome}
                onChange={(e) => setSimulationParams({
                  ...simulationParams,
                  targetIncome: Number(e.target.value)
                })}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Dividend Yield Esperado: {simulationParams.expectedYield}% a.a.</Label>
              <Slider
                value={[simulationParams.expectedYield]}
                onValueChange={(value) => setSimulationParams({
                  ...simulationParams,
                  expectedYield: value[0]
                })}
                max={15}
                min={5}
                step={0.5}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Inflação Esperada: {simulationParams.inflationRate}% a.a.</Label>
              <Slider
                value={[simulationParams.inflationRate]}
                onValueChange={(value) => setSimulationParams({
                  ...simulationParams,
                  inflationRate: value[0]
                })}
                max={10}
                min={2}
                step={0.5}
                className="mt-2"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={simulationParams.reinvestDividends}
                onChange={(e) => setSimulationParams({
                  ...simulationParams,
                  reinvestDividends: e.target.checked
                })}
              />
              <span className="text-sm">Reinvestir dividendos automaticamente</span>
            </label>
          </div>

          <Button 
            onClick={runAISimulation} 
            disabled={isSimulating}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white"
            size="lg"
          >
            {isSimulating ? (
              <>
                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                Simulando com IA...
              </>
            ) : (
              <>
                <Rocket className="h-5 w-5 mr-2" />
                Simular com IA
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Resultados da Simulação */}
      {simulationResults && (
        <div className="space-y-6">
          {/* Resumo dos Resultados */}
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Resultados da Simulação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-white rounded-lg border">
                  <DollarSign className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold text-blue-600">
                    R$ {simulationResults.finalResults.totalInvested.toLocaleString('pt-BR')}
                  </div>
                  <div className="text-sm text-gray-600">Total Investido</div>
                </div>

                <div className="text-center p-4 bg-white rounded-lg border">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold text-green-600">
                    R$ {simulationResults.finalResults.finalValue.toLocaleString('pt-BR')}
                  </div>
                  <div className="text-sm text-gray-600">Valor Final</div>
                </div>

                <div className="text-center p-4 bg-white rounded-lg border">
                  <Target className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <div className="text-2xl font-bold text-purple-600">
                    R$ {simulationResults.finalResults.finalMonthlyIncome.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Renda Mensal</div>
                </div>

                <div className="text-center p-4 bg-white rounded-lg border">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                  <div className="text-2xl font-bold text-orange-600">
                    {simulationResults.finalResults.totalReturn.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Retorno Total</div>
                </div>
              </div>

              {simulationResults.finalResults.targetAchieved ? (
                <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded-lg text-center">
                  <Star className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <div className="font-bold text-green-800">🎯 Meta Atingida!</div>
                  <div className="text-sm text-green-700">
                    Você atingirá sua meta de R$ {simulationParams.targetIncome}/mês em {simulationResults.finalResults.timeToTarget} meses
                  </div>
                </div>
              ) : (
                <div className="mt-4 p-4 bg-yellow-100 border border-yellow-300 rounded-lg text-center">
                  <div className="font-bold text-yellow-800">📈 Ajuste Necessário</div>
                  <div className="text-sm text-yellow-700">
                    Para atingir sua meta, considere aumentar aportes ou prazo
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gráfico de Evolução */}
          {chartData && (
            <Card>
              <CardHeader>
                <CardTitle>Evolução do Patrimônio</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={chartData.yearlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        `R$ ${value.toLocaleString('pt-BR')}`,
                        name === 'valor' ? 'Valor do Portfólio' :
                        name === 'investido' ? 'Total Investido' :
                        name === 'renda' ? 'Renda Mensal' : 'Renda Real'
                      ]}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="investido" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="valor" stackId="2" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                    <Line type="monotone" dataKey="renda" stroke="#ff7300" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Análise de Cenários */}
          {scenarioAnalysis && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Análise de Cenários
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {scenarioAnalysis.map((scenario, index) => (
                    <div key={index} className={`p-4 rounded-lg border-2 ${
                      scenario.name === 'Pessimista' ? 'border-red-200 bg-red-50' :
                      scenario.name === 'Realista' ? 'border-blue-200 bg-blue-50' :
                      'border-green-200 bg-green-50'
                    }`}>
                      <div className="text-center">
                        <h3 className="font-bold mb-2">{scenario.name}</h3>
                        <div className="text-sm text-gray-600 mb-3">
                          Yield: {scenario.yield}% | Prob: {scenario.probability}%
                        </div>
                        <div className="space-y-2">
                          <div>
                            <div className="text-lg font-bold">
                              R$ {scenario.finalValue.toLocaleString('pt-BR')}
                            </div>
                            <div className="text-xs text-gray-600">Valor Final</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold">
                              R$ {scenario.monthlyIncome.toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-600">Renda Mensal</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Recomendações da IA */}
      {aiRecommendations && (
        <Card className="border-2 border-gradient-to-r from-blue-500 to-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Recomendações Inteligentes
              <Badge variant="outline">Claude Opus 4</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Estratégia Recomendada */}
            <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
              <Crown className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <h3 className="font-bold text-lg mb-2">Estratégia Recomendada</h3>
              <Badge variant="outline" className={`mb-2 ${
                aiRecommendations.strategy.color === 'green' ? 'border-green-500 text-green-700' :
                aiRecommendations.strategy.color === 'blue' ? 'border-blue-500 text-blue-700' :
                'border-purple-500 text-purple-700'
              }`}>
                {aiRecommendations.strategy.type}
              </Badge>
              <p className="text-sm text-gray-700">{aiRecommendations.strategy.description}</p>
            </div>

            {/* Recomendações */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Recomendações Personalizadas
              </h4>
              <div className="space-y-2">
                {aiRecommendations.recommendations.map((rec, index) => (
                  <div key={index} className="bg-blue-50 p-3 rounded-lg text-sm">
                    {rec}
                  </div>
                ))}
              </div>
            </div>

            {/* Otimizações */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Otimizações Sugeridas
              </h4>
              <div className="space-y-2">
                {aiRecommendations.optimizations.map((opt, index) => (
                  <div key={index} className="bg-green-50 p-3 rounded-lg text-sm">
                    {opt}
                  </div>
                ))}
              </div>
            </div>

            {/* Fatores de Risco */}
            {aiRecommendations.riskFactors.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2 text-orange-600">
                  <AlertTriangle className="h-4 w-4" />
                  Fatores de Atenção
                </h4>
                <div className="space-y-2">
                  {aiRecommendations.riskFactors.map((risk, index) => (
                    <div key={index} className="bg-orange-50 p-3 rounded-lg text-sm">
                      {risk}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InvestmentSimulator; 
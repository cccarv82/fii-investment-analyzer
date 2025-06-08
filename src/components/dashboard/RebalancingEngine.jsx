import React, { useState, useMemo } from "react";
import {
  Scale,
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  Zap,
  Crown,
  Star,
  Shield,
  BarChart3,
  PieChart,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  DollarSign,
  Calculator,
  Lightbulb,
  CheckCircle,
  XCircle
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { Slider } from "../ui/slider";

const RebalancingEngine = ({ portfolioMetrics, investments, marketData }) => {
  const [rebalanceMode, setRebalanceMode] = useState("automatic"); // automatic, manual, custom
  const [targetAllocation, setTargetAllocation] = useState("balanced"); // balanced, aggressive, conservative
  const [additionalInvestment, setAdditionalInvestment] = useState([1000]);
  const [selectedStrategy, setSelectedStrategy] = useState(null);

  // Estratégias de alocação
  const allocationStrategies = {
    balanced: {
      name: "Balanceada",
      description: "Distribuição equilibrada entre setores",
      maxSectorWeight: 25,
      maxFiiWeight: 15,
      minDiversification: 70,
      riskLevel: "Médio"
    },
    conservative: {
      name: "Conservadora",
      description: "Foco em setores defensivos e baixo risco",
      maxSectorWeight: 30,
      maxFiiWeight: 20,
      minDiversification: 80,
      riskLevel: "Baixo"
    },
    aggressive: {
      name: "Agressiva",
      description: "Concentração em setores de alto crescimento",
      maxSectorWeight: 40,
      maxFiiWeight: 25,
      minDiversification: 60,
      riskLevel: "Alto"
    }
  };

  // Calcular alocação atual vs ideal
  const rebalanceAnalysis = useMemo(() => {
    if (!portfolioMetrics || !investments) return null;

    const strategy = allocationStrategies[targetAllocation];
    const totalValue = portfolioMetrics.totalValue;
    
    // Análise por setor
    const sectorAnalysis = {};
    const fiiAnalysis = {};
    
    // Alocação atual por setor
    const currentSectorAllocation = portfolioMetrics.sectorAnalysis || {};
    
    // Definir alocação ideal por setor
    const idealSectorAllocation = {
      "Lajes Corporativas": 20,
      "Shopping": 15,
      "Logística": 20,
      "Residencial": 15,
      "Híbrido": 15,
      "Papel": 5,
      "Agro": 5,
      "Educação": 5
    };

    // Ajustar alocação ideal baseada na estratégia
    Object.keys(idealSectorAllocation).forEach(sector => {
      const baseWeight = idealSectorAllocation[sector];
      let adjustedWeight = baseWeight;

      if (targetAllocation === "conservative") {
        // Aumentar setores defensivos
        if (["Lajes Corporativas", "Educação", "Residencial"].includes(sector)) {
          adjustedWeight = Math.min(strategy.maxSectorWeight, baseWeight * 1.3);
        } else if (["Papel", "Agro"].includes(sector)) {
          adjustedWeight = baseWeight * 0.5;
        }
      } else if (targetAllocation === "aggressive") {
        // Aumentar setores de crescimento
        if (["Logística", "Shopping", "Papel"].includes(sector)) {
          adjustedWeight = Math.min(strategy.maxSectorWeight, baseWeight * 1.5);
        } else if (["Educação", "Residencial"].includes(sector)) {
          adjustedWeight = baseWeight * 0.8;
        }
      }

      idealSectorAllocation[sector] = adjustedWeight;
    });

    // Normalizar para 100%
    const totalIdeal = Object.values(idealSectorAllocation).reduce((sum, weight) => sum + weight, 0);
    Object.keys(idealSectorAllocation).forEach(sector => {
      idealSectorAllocation[sector] = (idealSectorAllocation[sector] / totalIdeal) * 100;
    });

    // Calcular diferenças por setor
    Object.keys(idealSectorAllocation).forEach(sector => {
      const currentWeight = currentSectorAllocation[sector] 
        ? (currentSectorAllocation[sector].value / totalValue) * 100 
        : 0;
      const idealWeight = idealSectorAllocation[sector];
      const difference = currentWeight - idealWeight;
      
      sectorAnalysis[sector] = {
        current: currentWeight,
        ideal: idealWeight,
        difference,
        action: Math.abs(difference) > 2 ? (difference > 0 ? "Reduzir" : "Aumentar") : "Manter",
        priority: Math.abs(difference) > 5 ? "Alta" : Math.abs(difference) > 2 ? "Média" : "Baixa"
      };
    });

    // Análise por FII individual
    investments.forEach(fii => {
      const currentWeight = (fii.current_value / totalValue) * 100;
      const isOverweight = currentWeight > strategy.maxFiiWeight;
      const isUnderweight = currentWeight < 5; // Peso mínimo de 5%
      
      fiiAnalysis[fii.ticker] = {
        current: currentWeight,
        maxRecommended: strategy.maxFiiWeight,
        isOverweight,
        isUnderweight,
        action: isOverweight ? "Reduzir" : isUnderweight ? "Aumentar" : "Manter",
        priority: isOverweight || isUnderweight ? "Média" : "Baixa"
      };
    });

    return {
      strategy,
      sectorAnalysis,
      fiiAnalysis,
      idealSectorAllocation
    };
  }, [portfolioMetrics, investments, targetAllocation]);

  // Gerar sugestões de rebalanceamento
  const rebalanceSuggestions = useMemo(() => {
    if (!rebalanceAnalysis || !portfolioMetrics) return [];

    const suggestions = [];
    const totalValue = portfolioMetrics.totalValue + additionalInvestment[0];

    // Sugestões por setor
    Object.entries(rebalanceAnalysis.sectorAnalysis).forEach(([sector, analysis]) => {
      if (analysis.priority !== "Baixa") {
        const currentValue = (analysis.current / 100) * portfolioMetrics.totalValue;
        const idealValue = (analysis.ideal / 100) * totalValue;
        const difference = idealValue - currentValue;

        suggestions.push({
          type: "sector",
          sector,
          action: analysis.action,
          priority: analysis.priority,
          currentWeight: analysis.current,
          idealWeight: analysis.ideal,
          difference: Math.abs(difference),
          amount: Math.abs(difference),
          description: `${analysis.action} exposição em ${sector}`,
          impact: Math.abs(analysis.difference)
        });
      }
    });

    // Sugestões por FII
    Object.entries(rebalanceAnalysis.fiiAnalysis).forEach(([ticker, analysis]) => {
      if (analysis.priority !== "Baixa") {
        const fii = investments.find(f => f.ticker === ticker);
        const currentValue = fii.current_value;
        const idealValue = (analysis.maxRecommended / 100) * totalValue;
        const difference = analysis.isOverweight 
          ? currentValue - idealValue 
          : idealValue - currentValue;

        suggestions.push({
          type: "fii",
          ticker,
          action: analysis.action,
          priority: analysis.priority,
          currentWeight: analysis.current,
          idealWeight: analysis.maxRecommended,
          difference: Math.abs(difference),
          amount: Math.abs(difference),
          description: `${analysis.action} posição em ${ticker}`,
          impact: Math.abs(analysis.current - analysis.maxRecommended)
        });
      }
    });

    // Ordenar por prioridade e impacto
    return suggestions.sort((a, b) => {
      const priorityOrder = { "Alta": 3, "Média": 2, "Baixa": 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return b.impact - a.impact;
    });
  }, [rebalanceAnalysis, portfolioMetrics, investments, additionalInvestment]);

  // Calcular plano de rebalanceamento
  const rebalancePlan = useMemo(() => {
    if (!rebalanceSuggestions.length) return null;

    const plan = {
      totalAdjustment: additionalInvestment[0],
      actions: [],
      expectedImpact: {
        diversificationImprovement: 0,
        riskReduction: 0,
        expectedReturn: 0
      }
    };

    // Gerar ações específicas
    rebalanceSuggestions.slice(0, 5).forEach(suggestion => {
      if (suggestion.action === "Aumentar") {
        plan.actions.push({
          type: "buy",
          target: suggestion.ticker || `Setor ${suggestion.sector}`,
          amount: Math.min(suggestion.amount, additionalInvestment[0] * 0.3),
          reason: suggestion.description,
          priority: suggestion.priority
        });
      } else if (suggestion.action === "Reduzir") {
        plan.actions.push({
          type: "sell",
          target: suggestion.ticker || `Setor ${suggestion.sector}`,
          amount: suggestion.amount * 0.5, // Redução parcial
          reason: suggestion.description,
          priority: suggestion.priority
        });
      }
    });

    // Calcular impacto esperado
    plan.expectedImpact.diversificationImprovement = Math.min(15, rebalanceSuggestions.length * 3);
    plan.expectedImpact.riskReduction = Math.min(10, rebalanceSuggestions.filter(s => s.priority === "Alta").length * 2);
    plan.expectedImpact.expectedReturn = 0.5; // Melhoria esperada de 0.5%

    return plan;
  }, [rebalanceSuggestions, additionalInvestment]);

  if (!rebalanceAnalysis) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Scale className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Dados insuficientes para análise de rebalanceamento</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-gradient-to-r from-green-500 to-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-6 w-6" />
            Engine de Rebalanceamento Inteligente
            <Crown className="h-5 w-5 text-green-600" />
          </CardTitle>
          <CardDescription>
            Análise automática e sugestões de rebalanceamento com IA
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Configurações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Configurações de Rebalanceamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Estratégia de Alocação */}
            <div>
              <label className="text-sm font-medium mb-3 block">Estratégia de Alocação</label>
              <div className="space-y-2">
                {Object.entries(allocationStrategies).map(([key, strategy]) => (
                  <div
                    key={key}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      targetAllocation === key 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setTargetAllocation(key)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{strategy.name}</div>
                        <div className="text-sm text-gray-600">{strategy.description}</div>
                      </div>
                      <Badge variant={
                        strategy.riskLevel === "Alto" ? "destructive" :
                        strategy.riskLevel === "Médio" ? "default" : "secondary"
                      }>
                        {strategy.riskLevel}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Valor Adicional */}
            <div>
              <label className="text-sm font-medium mb-3 block">
                Valor Adicional para Investimento: R$ {additionalInvestment[0].toLocaleString('pt-BR')}
              </label>
              <Slider
                value={additionalInvestment}
                onValueChange={setAdditionalInvestment}
                max={10000}
                min={0}
                step={100}
                className="mb-4"
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>R$ 0</span>
                <span>R$ 10.000</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Análise Atual vs Ideal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Alocação Atual vs Ideal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(rebalanceAnalysis.sectorAnalysis).map(([sector, analysis]) => (
              <div key={sector} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{sector}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      analysis.priority === "Alta" ? "destructive" :
                      analysis.priority === "Média" ? "default" : "secondary"
                    }>
                      {analysis.action}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      {analysis.current.toFixed(1)}% → {analysis.ideal.toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Atual</div>
                    <Progress value={analysis.current} className="h-2" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Ideal</div>
                    <Progress value={analysis.ideal} className="h-2 bg-blue-100" />
                  </div>
                </div>

                {Math.abs(analysis.difference) > 2 && (
                  <div className={`text-xs p-2 rounded ${
                    analysis.difference > 0 
                      ? 'bg-red-50 text-red-700' 
                      : 'bg-green-50 text-green-700'
                  }`}>
                    {analysis.difference > 0 ? '↓' : '↑'} 
                    {Math.abs(analysis.difference).toFixed(1)}% de diferença
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sugestões de Rebalanceamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Sugestões Inteligentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {rebalanceSuggestions.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
              <h3 className="text-lg font-semibold text-green-600 mb-2">
                Portfólio Bem Balanceado! ✅
              </h3>
              <p className="text-gray-600">
                Sua alocação está próxima do ideal. Nenhum rebalanceamento necessário.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {rebalanceSuggestions.slice(0, 5).map((suggestion, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    suggestion.priority === "Alta" ? 'border-red-500 bg-red-50' :
                    suggestion.priority === "Média" ? 'border-yellow-500 bg-yellow-50' :
                    'border-blue-500 bg-blue-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {suggestion.action === "Aumentar" ? (
                          <ArrowUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <ArrowDown className="h-4 w-4 text-red-600" />
                        )}
                        <span className="font-medium">{suggestion.description}</span>
                        <Badge variant={
                          suggestion.priority === "Alta" ? "destructive" :
                          suggestion.priority === "Média" ? "default" : "secondary"
                        }>
                          {suggestion.priority}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        Peso atual: {suggestion.currentWeight.toFixed(1)}% → 
                        Ideal: {suggestion.idealWeight.toFixed(1)}%
                      </div>
                      
                      <div className="text-sm font-medium">
                        Valor sugerido: R$ {suggestion.amount.toLocaleString('pt-BR')}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        {suggestion.impact.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-600">Impacto</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plano de Rebalanceamento */}
      {rebalancePlan && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Plano de Execução
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Ações */}
              <div>
                <h4 className="font-semibold mb-3">Ações Recomendadas</h4>
                <div className="space-y-3">
                  {rebalancePlan.actions.map((action, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`p-2 rounded-full ${
                        action.type === "buy" ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {action.type === "buy" ? (
                          <ArrowUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <ArrowDown className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">
                          {action.type === "buy" ? "Comprar" : "Vender"} {action.target}
                        </div>
                        <div className="text-sm text-gray-600">
                          R$ {action.amount.toLocaleString('pt-BR')}
                        </div>
                      </div>
                      <Badge variant={
                        action.priority === "Alta" ? "destructive" :
                        action.priority === "Média" ? "default" : "secondary"
                      }>
                        {action.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Impacto Esperado */}
              <div>
                <h4 className="font-semibold mb-3">Impacto Esperado</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Melhoria na Diversificação</span>
                    </div>
                    <span className="font-bold text-green-600">
                      +{rebalancePlan.expectedImpact.diversificationImprovement}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">Redução de Risco</span>
                    </div>
                    <span className="font-bold text-blue-600">
                      -{rebalancePlan.expectedImpact.riskReduction}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-purple-600" />
                      <span className="text-sm">Melhoria no Retorno</span>
                    </div>
                    <span className="font-bold text-purple-600">
                      +{rebalancePlan.expectedImpact.expectedReturn}%
                    </span>
                  </div>
                </div>

                <Button className="w-full mt-4" size="lg">
                  <Zap className="h-4 w-4 mr-2" />
                  Executar Rebalanceamento
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insights Avançados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Insights Avançados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">🎯 Estratégia Atual</h4>
              <p className="text-sm text-gray-700 mb-2">
                {rebalanceAnalysis.strategy.description}
              </p>
              <div className="text-xs text-gray-600">
                • Peso máximo por setor: {rebalanceAnalysis.strategy.maxSectorWeight}%<br/>
                • Peso máximo por FII: {rebalanceAnalysis.strategy.maxFiiWeight}%<br/>
                • Diversificação mínima: {rebalanceAnalysis.strategy.minDiversification}%
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">📊 Score de Balanceamento</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Alocação Setorial</span>
                  <span className="font-bold">
                    {Math.max(0, 100 - Object.values(rebalanceAnalysis.sectorAnalysis)
                      .reduce((sum, s) => sum + Math.abs(s.difference), 0)).toFixed(0)}%
                  </span>
                </div>
                <Progress 
                  value={Math.max(0, 100 - Object.values(rebalanceAnalysis.sectorAnalysis)
                    .reduce((sum, s) => sum + Math.abs(s.difference), 0))} 
                  className="h-2" 
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RebalancingEngine; 
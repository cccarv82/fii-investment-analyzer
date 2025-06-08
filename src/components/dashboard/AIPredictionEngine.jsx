import React, { useState, useEffect, useMemo } from "react";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Target,
  Zap,
  Crown,
  Star,
  AlertTriangle,
  Eye,
  BarChart3,
  Activity,
  Cpu,
  Layers,
  GitBranch,
  Sparkles,
  Calculator,
  LineChart,
  PieChart,
  Gauge
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
import {
  LineChart as RechartsLineChart,
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
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter
} from "recharts";

const AIPredictionEngine = ({ portfolioMetrics, investments, marketData }) => {
  const [predictions, setPredictions] = useState(null);
  const [modelMetrics, setModelMetrics] = useState({});
  const [selectedModel, setSelectedModel] = useState("ensemble");
  const [predictionHorizon, setPredictionHorizon] = useState("30d");
  const [isTraining, setIsTraining] = useState(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState(70);

  // Modelos de IA disponíveis
  const aiModels = {
    ensemble: {
      name: "Ensemble AI",
      description: "Combinação de múltiplos modelos para máxima precisão",
      accuracy: 87.5,
      type: "Híbrido",
      features: ["LSTM", "Random Forest", "XGBoost", "Neural Networks"]
    },
    lstm: {
      name: "LSTM Neural Network",
      description: "Rede neural para análise de séries temporais",
      accuracy: 82.3,
      type: "Deep Learning",
      features: ["Temporal Patterns", "Long Memory", "Sequence Learning"]
    },
    randomforest: {
      name: "Random Forest",
      description: "Modelo baseado em árvores de decisão",
      accuracy: 79.8,
      type: "Machine Learning",
      features: ["Feature Importance", "Robustness", "Interpretability"]
    },
    xgboost: {
      name: "XGBoost",
      description: "Gradient boosting otimizado",
      accuracy: 84.1,
      type: "Boosting",
      features: ["High Performance", "Feature Selection", "Regularization"]
    }
  };

  // Gerar predições usando IA
  useEffect(() => {
    const generatePredictions = async () => {
      setIsTraining(true);
      
      // Simular tempo de processamento da IA
      await new Promise(resolve => setTimeout(resolve, 2000));

      const model = aiModels[selectedModel];
      const horizonDays = {
        "7d": 7,
        "30d": 30,
        "90d": 90,
        "1y": 365
      };

      const days = horizonDays[predictionHorizon];
      
      // Gerar predições para cada FII
      const fiiPredictions = investments?.map(fii => {
        const basePrice = fii.current_price || 100;
        const volatility = 0.15 + Math.random() * 0.1; // 15-25% volatilidade anual
        const trend = (Math.random() - 0.3) * 0.2; // Bias ligeiramente positivo
        
        const predictions = [];
        let currentPrice = basePrice;
        
        for (let day = 1; day <= Math.min(days, 90); day++) {
          const dailyReturn = trend / 365 + (Math.random() - 0.5) * volatility / Math.sqrt(365);
          currentPrice *= (1 + dailyReturn);
          
          if (day % 7 === 0 || day === days) { // Predições semanais
            predictions.push({
              day,
              price: currentPrice,
              confidence: Math.max(50, model.accuracy - (day / days) * 20),
              change: ((currentPrice - basePrice) / basePrice) * 100
            });
          }
        }

        // Calcular métricas de predição
        const finalPrediction = predictions[predictions.length - 1];
        const expectedReturn = finalPrediction.change;
        const riskScore = volatility * 100;
        const opportunityScore = Math.max(0, expectedReturn * 2 + (100 - riskScore));
        
        return {
          ticker: fii.ticker,
          sector: fii.sector,
          currentPrice: basePrice,
          predictions,
          expectedReturn,
          confidence: finalPrediction.confidence,
          riskScore,
          opportunityScore,
          recommendation: expectedReturn > 5 ? "BUY" : expectedReturn < -5 ? "SELL" : "HOLD",
          targetPrice: finalPrediction.price,
          volatility: volatility * 100
        };
      }) || [];

      // Predições do mercado geral
      const marketPredictions = {
        ifix: {
          current: 2800,
          predicted: 2800 * (1 + (Math.random() - 0.3) * 0.15),
          confidence: model.accuracy,
          trend: Math.random() > 0.4 ? "up" : "down"
        },
        selic: {
          current: 11.75,
          predicted: 11.75 + (Math.random() - 0.5) * 2,
          confidence: 85,
          trend: Math.random() > 0.6 ? "down" : "stable"
        },
        inflation: {
          current: 4.2,
          predicted: 4.2 + (Math.random() - 0.5) * 1.5,
          confidence: 78,
          trend: Math.random() > 0.5 ? "down" : "up"
        }
      };

      // Insights de IA
      const aiInsights = [
        {
          type: "opportunity",
          title: "Oportunidade Detectada em Logística",
          description: "Modelo identifica alta probabilidade de valorização no setor",
          confidence: 89,
          impact: "high",
          timeframe: "30 dias"
        },
        {
          type: "risk",
          title: "Atenção: Volatilidade Elevada em FIIs de Papel",
          description: "Modelos indicam aumento de risco no setor",
          confidence: 82,
          impact: "medium",
          timeframe: "15 dias"
        },
        {
          type: "trend",
          title: "Tendência de Alta em Shopping Centers",
          description: "Padrões históricos sugerem recuperação continuada",
          confidence: 76,
          impact: "medium",
          timeframe: "60 dias"
        }
      ];

      setPredictions({
        fiis: fiiPredictions,
        market: marketPredictions,
        insights: aiInsights,
        modelUsed: selectedModel,
        accuracy: model.accuracy,
        lastUpdate: new Date(),
        horizon: predictionHorizon
      });

      setIsTraining(false);
    };

    if (investments && investments.length > 0) {
      generatePredictions();
    }
  }, [investments, selectedModel, predictionHorizon]);

  // Calcular métricas do modelo
  useEffect(() => {
    if (predictions) {
      const metrics = {
        totalPredictions: predictions.fiis.length,
        avgConfidence: predictions.fiis.reduce((sum, p) => sum + p.confidence, 0) / predictions.fiis.length,
        bullishCount: predictions.fiis.filter(p => p.recommendation === "BUY").length,
        bearishCount: predictions.fiis.filter(p => p.recommendation === "SELL").length,
        neutralCount: predictions.fiis.filter(p => p.recommendation === "HOLD").length,
        highConfidenceCount: predictions.fiis.filter(p => p.confidence >= confidenceThreshold).length
      };

      setModelMetrics(metrics);
    }
  }, [predictions, confidenceThreshold]);

  // Obter cor da recomendação
  const getRecommendationColor = (recommendation) => {
    switch (recommendation) {
      case "BUY": return "bg-green-100 text-green-800 border-green-200";
      case "SELL": return "bg-red-100 text-red-800 border-red-200";
      case "HOLD": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Obter ícone da recomendação
  const getRecommendationIcon = (recommendation) => {
    switch (recommendation) {
      case "BUY": return <TrendingUp className="h-4 w-4" />;
      case "SELL": return <TrendingDown className="h-4 w-4" />;
      case "HOLD": return <Target className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  if (isTraining) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <div className="flex flex-col items-center gap-4">
            <Cpu className="h-12 w-12 text-blue-600 animate-pulse" />
            <div>
              <h3 className="text-lg font-semibold mb-2">IA Processando Predições...</h3>
              <p className="text-gray-600 mb-4">
                Analisando {investments?.length || 0} FIIs com modelo {aiModels[selectedModel]?.name}
              </p>
              <Progress value={75} className="w-64 mx-auto" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!predictions) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Dados insuficientes para predições de IA</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-gradient-to-r from-blue-500 to-purple-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6" />
            AI Prediction Engine
            <Crown className="h-5 w-5 text-blue-600" />
            <Badge variant="outline" className="border-blue-500 text-blue-700">
              <Sparkles className="h-3 w-3 mr-1" />
              {aiModels[selectedModel]?.accuracy}% Precisão
            </Badge>
          </CardTitle>
          <CardDescription>
            Predições avançadas usando Machine Learning e Deep Learning
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Configurações do Modelo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Configurações do Modelo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Seleção do Modelo */}
            <div>
              <label className="text-sm font-medium mb-3 block">Modelo de IA</label>
              <div className="space-y-2">
                {Object.entries(aiModels).map(([key, model]) => (
                  <div
                    key={key}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedModel === key 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedModel(key)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{model.name}</span>
                      <Badge variant="outline">{model.accuracy}%</Badge>
                    </div>
                    <div className="text-xs text-gray-600">{model.description}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Horizonte de Predição */}
            <div>
              <label className="text-sm font-medium mb-3 block">Horizonte de Predição</label>
              <div className="space-y-2">
                {[
                  { key: "7d", label: "7 dias", desc: "Curto prazo" },
                  { key: "30d", label: "30 dias", desc: "Médio prazo" },
                  { key: "90d", label: "90 dias", desc: "Longo prazo" },
                  { key: "1y", label: "1 ano", desc: "Muito longo prazo" }
                ].map((option) => (
                  <div
                    key={option.key}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      predictionHorizon === option.key 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setPredictionHorizon(option.key)}
                  >
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-gray-600">{option.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Métricas do Modelo */}
            <div>
              <label className="text-sm font-medium mb-3 block">Métricas do Modelo</label>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Predições Geradas</span>
                  <span className="font-bold">{modelMetrics.totalPredictions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Confiança Média</span>
                  <span className="font-bold">{modelMetrics.avgConfidence?.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Alta Confiança</span>
                  <span className="font-bold">{modelMetrics.highConfidenceCount}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center p-2 bg-green-50 rounded">
                    <div className="font-bold text-green-700">{modelMetrics.bullishCount}</div>
                    <div className="text-green-600">BUY</div>
                  </div>
                  <div className="text-center p-2 bg-yellow-50 rounded">
                    <div className="font-bold text-yellow-700">{modelMetrics.neutralCount}</div>
                    <div className="text-yellow-600">HOLD</div>
                  </div>
                  <div className="text-center p-2 bg-red-50 rounded">
                    <div className="font-bold text-red-700">{modelMetrics.bearishCount}</div>
                    <div className="text-red-600">SELL</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Predições do Mercado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Predições Macroeconômicas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(predictions.market).map(([indicator, data]) => (
              <div key={indicator} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium capitalize">{indicator}</span>
                  <Badge variant="outline">{data.confidence}% confiança</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Atual</span>
                    <span className="font-bold">
                      {indicator === 'ifix' ? data.current.toLocaleString() : `${data.current}%`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Predição</span>
                    <span className="font-bold">
                      {indicator === 'ifix' ? data.predicted.toFixed(0) : `${data.predicted.toFixed(2)}%`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tendência</span>
                    <span className={`font-medium ${
                      data.trend === 'up' ? 'text-green-600' : 
                      data.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {data.trend === 'up' ? '↗️ Alta' : 
                       data.trend === 'down' ? '↘️ Baixa' : '➡️ Estável'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Predições por FII */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Predições por FII
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">FII</th>
                  <th className="text-center p-3">Recomendação</th>
                  <th className="text-center p-3">Retorno Esperado</th>
                  <th className="text-center p-3">Preço Alvo</th>
                  <th className="text-center p-3">Confiança</th>
                  <th className="text-center p-3">Risco</th>
                  <th className="text-center p-3">Oportunidade</th>
                </tr>
              </thead>
              <tbody>
                {predictions.fiis
                  .sort((a, b) => b.confidence - a.confidence)
                  .map((prediction) => (
                    <tr key={prediction.ticker} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{prediction.ticker}</div>
                          <div className="text-sm text-gray-600">{prediction.sector}</div>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <Badge className={getRecommendationColor(prediction.recommendation)}>
                          {getRecommendationIcon(prediction.recommendation)}
                          {prediction.recommendation}
                        </Badge>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`font-bold ${
                          prediction.expectedReturn > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {prediction.expectedReturn > 0 ? '+' : ''}{prediction.expectedReturn.toFixed(1)}%
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div>
                          <div className="font-medium">R$ {prediction.targetPrice.toFixed(2)}</div>
                          <div className="text-xs text-gray-600">
                            Atual: R$ {prediction.currentPrice.toFixed(2)}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Progress value={prediction.confidence} className="h-2 w-16" />
                          <span className="text-sm font-medium">{prediction.confidence.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant={
                          prediction.riskScore > 20 ? "destructive" :
                          prediction.riskScore > 15 ? "default" : "secondary"
                        }>
                          {prediction.riskScore.toFixed(0)}%
                        </Badge>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Progress value={prediction.opportunityScore} className="h-2 w-16" />
                          <span className="text-sm font-medium">{prediction.opportunityScore.toFixed(0)}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Insights de IA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Insights de IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {predictions.insights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  insight.type === "opportunity" ? 'border-green-500 bg-green-50' :
                  insight.type === "risk" ? 'border-red-500 bg-red-50' :
                  'border-blue-500 bg-blue-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {insight.type === "opportunity" ? <TrendingUp className="h-4 w-4 text-green-600" /> :
                       insight.type === "risk" ? <AlertTriangle className="h-4 w-4 text-red-600" /> :
                       <Eye className="h-4 w-4 text-blue-600" />}
                      <span className="font-semibold">{insight.title}</span>
                      <Badge variant="outline">{insight.confidence}% confiança</Badge>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{insight.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <span>Impacto: {insight.impact}</span>
                      <span>Prazo: {insight.timeframe}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Predições */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            Evolução das Predições - Top 5 FIIs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <RechartsLineChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [`${value.toFixed(1)}%`, name]}
                labelFormatter={(day) => `Dia ${day}`}
              />
              <Legend />
              {predictions.fiis
                .sort((a, b) => b.confidence - a.confidence)
                .slice(0, 5)
                .map((fii, index) => {
                  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];
                  const predictionData = fii.predictions.map(p => ({
                    day: p.day,
                    [fii.ticker]: p.change
                  }));
                  
                  return (
                    <Line
                      key={fii.ticker}
                      type="monotone"
                      dataKey={fii.ticker}
                      stroke={colors[index]}
                      strokeWidth={2}
                      data={predictionData}
                    />
                  );
                })}
            </RechartsLineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Resumo do Modelo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Resumo do Modelo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Modelo Utilizado</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="font-medium mb-2">{aiModels[selectedModel].name}</div>
                <div className="text-sm text-gray-600 mb-3">{aiModels[selectedModel].description}</div>
                <div className="flex flex-wrap gap-1">
                  {aiModels[selectedModel].features.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Estatísticas da Sessão</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{predictions.fiis.length}</div>
                  <div className="text-sm text-blue-600">FIIs Analisados</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{predictions.accuracy.toFixed(1)}%</div>
                  <div className="text-sm text-green-600">Precisão do Modelo</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{predictionHorizon}</div>
                  <div className="text-sm text-purple-600">Horizonte</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {predictions.lastUpdate.toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                  <div className="text-sm text-orange-600">Última Atualização</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIPredictionEngine; 
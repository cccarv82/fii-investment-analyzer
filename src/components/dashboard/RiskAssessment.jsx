import React, { useState, useMemo, useContext } from 'react';
import { PortfolioContext } from '../../contexts/PortfolioContext';
import { AIContext } from '../../contexts/AIContext';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, ScatterChart, Scatter } from 'recharts';
import { Shield, AlertTriangle, TrendingDown, Activity, Target, Zap, Brain, Eye, Settings } from 'lucide-react';

const RiskAssessment = () => {
  const { portfolio, totalValue, monthlyIncome } = useContext(PortfolioContext);
  const { analyzePortfolio } = useContext(AIContext);
  
  const [selectedRiskMetric, setSelectedRiskMetric] = useState('var');
  const [stressTestScenario, setStressTestScenario] = useState('market_crash');
  const [timeHorizon, setTimeHorizon] = useState(12);
  const [confidenceLevel, setConfidenceLevel] = useState(95);

  // Cálculo de métricas de risco
  const riskMetrics = useMemo(() => {
    if (!portfolio || portfolio.length === 0) return null;

    // Simulação de dados históricos (em produção, viria da API)
    const generateReturns = (volatility, periods = 252) => {
      return Array.from({ length: periods }, () => 
        (Math.random() - 0.5) * 2 * volatility / 100
      );
    };

    const portfolioMetrics = portfolio.map(investment => {
      const volatility = 15 + Math.random() * 20; // 15-35%
      const returns = generateReturns(volatility);
      const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
      
      // VaR (Value at Risk)
      const sortedReturns = [...returns].sort((a, b) => a - b);
      const varIndex = Math.floor((100 - confidenceLevel) / 100 * returns.length);
      const var95 = sortedReturns[varIndex];
      
      // CVaR (Conditional Value at Risk)
      const cvar95 = sortedReturns.slice(0, varIndex).reduce((a, b) => a + b, 0) / varIndex;
      
      // Maximum Drawdown
      let peak = 0;
      let maxDrawdown = 0;
      let cumulativeReturn = 1;
      
      returns.forEach(ret => {
        cumulativeReturn *= (1 + ret);
        if (cumulativeReturn > peak) peak = cumulativeReturn;
        const drawdown = (peak - cumulativeReturn) / peak;
        if (drawdown > maxDrawdown) maxDrawdown = drawdown;
      });
      
      // Sharpe Ratio (assumindo taxa livre de risco de 10.75%)
      const riskFreeRate = 0.1075 / 252; // Taxa Selic diária
      const excessReturns = returns.map(r => r - riskFreeRate);
      const avgExcessReturn = excessReturns.reduce((a, b) => a + b, 0) / excessReturns.length;
      const volatilityDaily = Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length);
      const sharpeRatio = avgExcessReturn / volatilityDaily * Math.sqrt(252);
      
      // Beta (correlação com mercado)
      const beta = 0.7 + Math.random() * 0.8; // 0.7 - 1.5
      
      return {
        ...investment,
        volatility: volatility,
        var95: var95 * investment.current_value,
        cvar95: cvar95 * investment.current_value,
        maxDrawdown: maxDrawdown,
        sharpeRatio: sharpeRatio,
        beta: beta,
        returns: returns
      };
    });

    // Métricas do portfólio
    const totalWeight = portfolio.reduce((sum, inv) => sum + inv.current_value, 0);
    const portfolioVolatility = Math.sqrt(
      portfolioMetrics.reduce((sum, inv) => {
        const weight = inv.current_value / totalWeight;
        return sum + Math.pow(weight * inv.volatility, 2);
      }, 0)
    );

    const portfolioVar = portfolioMetrics.reduce((sum, inv) => {
      const weight = inv.current_value / totalWeight;
      return sum + weight * inv.var95;
    }, 0);

    const portfolioCVar = portfolioMetrics.reduce((sum, inv) => {
      const weight = inv.current_value / totalWeight;
      return sum + weight * inv.cvar95;
    }, 0);

    const portfolioBeta = portfolioMetrics.reduce((sum, inv) => {
      const weight = inv.current_value / totalWeight;
      return sum + weight * inv.beta;
    }, 0);

    const portfolioSharpe = portfolioMetrics.reduce((sum, inv) => {
      const weight = inv.current_value / totalWeight;
      return sum + weight * inv.sharpeRatio;
    }, 0);

    return {
      individual: portfolioMetrics,
      portfolio: {
        volatility: portfolioVolatility,
        var95: portfolioVar,
        cvar95: portfolioCVar,
        beta: portfolioBeta,
        sharpeRatio: portfolioSharpe
      }
    };
  }, [portfolio, confidenceLevel]);

  // Stress Testing
  const stressTests = useMemo(() => {
    if (!riskMetrics) return [];

    const scenarios = {
      market_crash: { name: 'Crash do Mercado', impact: -0.30, probability: 0.05 },
      interest_spike: { name: 'Alta de Juros', impact: -0.20, probability: 0.15 },
      recession: { name: 'Recessão', impact: -0.25, probability: 0.10 },
      inflation_surge: { name: 'Inflação Alta', impact: -0.15, probability: 0.20 },
      sector_crisis: { name: 'Crise Setorial', impact: -0.35, probability: 0.08 }
    };

    return Object.entries(scenarios).map(([key, scenario]) => {
      const portfolioImpact = totalValue * scenario.impact;
      const incomeImpact = monthlyIncome * scenario.impact * 0.5; // Renda menos volátil
      
      return {
        id: key,
        name: scenario.name,
        probability: scenario.probability,
        portfolioImpact: portfolioImpact,
        incomeImpact: incomeImpact,
        severity: Math.abs(scenario.impact),
        expectedLoss: portfolioImpact * scenario.probability
      };
    });
  }, [riskMetrics, totalValue, monthlyIncome]);

  // Risk Score
  const riskScore = useMemo(() => {
    if (!riskMetrics) return 0;

    const volatilityScore = Math.min(riskMetrics.portfolio.volatility / 30 * 100, 100);
    const concentrationScore = portfolio.length < 5 ? 80 : Math.max(20, 80 - portfolio.length * 5);
    const betaScore = Math.abs(riskMetrics.portfolio.beta - 1) * 50;
    const sharpeScore = Math.max(0, 50 - riskMetrics.portfolio.sharpeRatio * 25);

    return Math.round((volatilityScore + concentrationScore + betaScore + sharpeScore) / 4);
  }, [riskMetrics, portfolio]);

  // Risk Level
  const getRiskLevel = (score) => {
    if (score < 30) return { level: 'Baixo', color: 'green', description: 'Portfólio conservador' };
    if (score < 50) return { level: 'Moderado', color: 'yellow', description: 'Risco equilibrado' };
    if (score < 70) return { level: 'Alto', color: 'orange', description: 'Portfólio agressivo' };
    return { level: 'Muito Alto', color: 'red', description: 'Risco elevado' };
  };

  const riskLevel = getRiskLevel(riskScore);

  // Radar Chart Data
  const radarData = useMemo(() => {
    if (!riskMetrics) return [];

    return [
      {
        metric: 'Volatilidade',
        value: Math.min(riskMetrics.portfolio.volatility / 30 * 100, 100),
        fullMark: 100
      },
      {
        metric: 'Concentração',
        value: portfolio.length < 5 ? 80 : Math.max(20, 80 - portfolio.length * 5),
        fullMark: 100
      },
      {
        metric: 'Beta',
        value: Math.abs(riskMetrics.portfolio.beta - 1) * 50,
        fullMark: 100
      },
      {
        metric: 'Liquidez',
        value: 30 + Math.random() * 40, // Simulado
        fullMark: 100
      },
      {
        metric: 'Correlação',
        value: 40 + Math.random() * 30, // Simulado
        fullMark: 100
      },
      {
        metric: 'Drawdown',
        value: riskMetrics.individual.reduce((max, inv) => Math.max(max, inv.maxDrawdown * 100), 0),
        fullMark: 100
      }
    ];
  }, [riskMetrics, portfolio]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercent = (value) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  if (!riskMetrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Carregando análise de risco...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-8 h-8" />
          <h2 className="text-2xl font-bold">Análise de Risco</h2>
        </div>
        <p className="text-red-100">
          Avaliação completa dos riscos do seu portfólio com métricas avançadas e stress testing
        </p>
      </div>

      {/* Risk Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`bg-gradient-to-br from-${riskLevel.color}-50 to-${riskLevel.color}-100 rounded-lg p-6 border border-${riskLevel.color}-200`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`font-semibold text-${riskLevel.color}-800`}>Score de Risco</h3>
            <Shield className={`w-5 h-5 text-${riskLevel.color}-600`} />
          </div>
          <div className={`text-3xl font-bold text-${riskLevel.color}-700 mb-1`}>
            {riskScore}
          </div>
          <div className={`text-sm text-${riskLevel.color}-600`}>
            {riskLevel.level} - {riskLevel.description}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-blue-800">VaR (95%)</h3>
            <TrendingDown className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-700">
            {formatCurrency(Math.abs(riskMetrics.portfolio.var95))}
          </div>
          <div className="text-sm text-blue-600">
            Perda máxima esperada
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-purple-800">Volatilidade</h3>
            <Activity className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-700">
            {riskMetrics.portfolio.volatility.toFixed(1)}%
          </div>
          <div className="text-sm text-purple-600">
            Variação anual esperada
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-green-800">Sharpe Ratio</h3>
            <Target className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-700">
            {riskMetrics.portfolio.sharpeRatio.toFixed(2)}
          </div>
          <div className="text-sm text-green-600">
            Retorno ajustado ao risco
          </div>
        </div>
      </div>

      {/* Risk Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Eye className="w-4 h-4 inline mr-1" />
            Métrica de Risco
          </label>
          <select
            value={selectedRiskMetric}
            onChange={(e) => setSelectedRiskMetric(e.target.value)}
            className="w-full p-2 border rounded-lg"
          >
            <option value="var">Value at Risk</option>
            <option value="cvar">Conditional VaR</option>
            <option value="volatility">Volatilidade</option>
            <option value="drawdown">Max Drawdown</option>
          </select>
        </div>

        <div className="bg-white rounded-lg p-4 border">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Settings className="w-4 h-4 inline mr-1" />
            Nível de Confiança
          </label>
          <input
            type="range"
            min="90"
            max="99"
            value={confidenceLevel}
            onChange={(e) => setConfidenceLevel(Number(e.target.value))}
            className="w-full"
          />
          <div className="text-center text-lg font-bold text-blue-600 mt-1">
            {confidenceLevel}%
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <AlertTriangle className="w-4 h-4 inline mr-1" />
            Stress Test
          </label>
          <select
            value={stressTestScenario}
            onChange={(e) => setStressTestScenario(e.target.value)}
            className="w-full p-2 border rounded-lg"
          >
            <option value="market_crash">Crash do Mercado</option>
            <option value="interest_spike">Alta de Juros</option>
            <option value="recession">Recessão</option>
            <option value="inflation_surge">Inflação Alta</option>
            <option value="sector_crisis">Crise Setorial</option>
          </select>
        </div>

        <div className="bg-white rounded-lg p-4 border">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Brain className="w-4 h-4 inline mr-1" />
            Horizonte Temporal
          </label>
          <input
            type="range"
            min="1"
            max="36"
            value={timeHorizon}
            onChange={(e) => setTimeHorizon(Number(e.target.value))}
            className="w-full"
          />
          <div className="text-center text-lg font-bold text-purple-600 mt-1">
            {timeHorizon} meses
          </div>
        </div>
      </div>

      {/* Risk Radar Chart */}
      <div className="bg-white rounded-lg p-6 border">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-500" />
          Perfil de Risco Multidimensional
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="metric" />
            <PolarRadiusAxis angle={90} domain={[0, 100]} />
            <Radar
              name="Risco"
              dataKey="value"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Stress Testing Results */}
      <div className="bg-white rounded-lg p-6 border">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          Stress Testing - Cenários Adversos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stressTests.map((test, index) => (
            <div key={index} className={`p-4 rounded-lg border-2 ${
              test.severity > 0.25 
                ? 'border-red-200 bg-red-50' 
                : test.severity > 0.15 
                ? 'border-orange-200 bg-orange-50'
                : 'border-yellow-200 bg-yellow-50'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-800">{test.name}</h4>
                <AlertTriangle className={`w-4 h-4 ${
                  test.severity > 0.25 ? 'text-red-600' : 
                  test.severity > 0.15 ? 'text-orange-600' : 'text-yellow-600'
                }`} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Probabilidade:</span>
                  <span className="text-sm font-medium">{formatPercent(test.probability)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Impacto Portfólio:</span>
                  <span className="text-sm font-medium text-red-600">
                    {formatCurrency(test.portfolioImpact)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Impacto Renda:</span>
                  <span className="text-sm font-medium text-red-600">
                    {formatCurrency(test.incomeImpact)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Perda Esperada:</span>
                  <span className="text-sm font-medium text-orange-600">
                    {formatCurrency(test.expectedLoss)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Individual Risk Analysis */}
      <div className="bg-white rounded-lg p-6 border">
        <h3 className="text-lg font-semibold mb-4">Análise Individual de Risco</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">FII</th>
                <th className="text-right p-2">Volatilidade</th>
                <th className="text-right p-2">VaR (95%)</th>
                <th className="text-right p-2">Max Drawdown</th>
                <th className="text-right p-2">Sharpe Ratio</th>
                <th className="text-right p-2">Beta</th>
                <th className="text-center p-2">Risco</th>
              </tr>
            </thead>
            <tbody>
              {riskMetrics.individual.map((investment, index) => {
                const individualRisk = investment.volatility > 25 ? 'Alto' : 
                                     investment.volatility > 15 ? 'Médio' : 'Baixo';
                const riskColor = individualRisk === 'Alto' ? 'text-red-600' :
                                individualRisk === 'Médio' ? 'text-yellow-600' : 'text-green-600';
                
                return (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{investment.ticker}</td>
                    <td className="p-2 text-right">{investment.volatility.toFixed(1)}%</td>
                    <td className="p-2 text-right text-red-600">
                      {formatCurrency(Math.abs(investment.var95))}
                    </td>
                    <td className="p-2 text-right">{formatPercent(investment.maxDrawdown)}</td>
                    <td className="p-2 text-right">{investment.sharpeRatio.toFixed(2)}</td>
                    <td className="p-2 text-right">{investment.beta.toFixed(2)}</td>
                    <td className={`p-2 text-center font-medium ${riskColor}`}>
                      {individualRisk}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Risk Recommendations */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-blue-500" />
          Recomendações de Gestão de Risco
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-medium text-gray-800">Ações Imediatas:</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              {riskScore > 70 && (
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  Reduzir concentração em ativos de alto risco
                </li>
              )}
              {portfolio.length < 8 && (
                <li className="flex items-start gap-2">
                  <Target className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  Diversificar portfólio com mais FIIs
                </li>
              )}
              {riskMetrics.portfolio.sharpeRatio < 0.5 && (
                <li className="flex items-start gap-2">
                  <TrendingDown className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  Revisar ativos com baixo retorno ajustado ao risco
                </li>
              )}
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium text-gray-800">Estratégias de Longo Prazo:</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                Implementar stop-loss em 15% do patrimônio
              </li>
              <li className="flex items-start gap-2">
                <Activity className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                Monitorar correlações entre ativos mensalmente
              </li>
              <li className="flex items-start gap-2">
                <Eye className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                Revisar exposição setorial trimestralmente
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskAssessment; 
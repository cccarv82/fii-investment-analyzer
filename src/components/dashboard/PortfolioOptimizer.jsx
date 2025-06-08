import React, { useState, useMemo, useContext } from 'react';
import { PortfolioContext } from '../../contexts/PortfolioContext';
import { AIContext } from '../../contexts/AIContext';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Zap, Target, Brain, Settings, TrendingUp, Shield, Award, Calculator, Lightbulb, Star, Crown, Gem } from 'lucide-react';

const PortfolioOptimizer = () => {
  const { portfolio, totalValue, monthlyIncome } = useContext(PortfolioContext);
  const { analyzePortfolio } = useContext(AIContext);
  
  const [optimizationGoal, setOptimizationGoal] = useState('sharpe');
  const [riskTolerance, setRiskTolerance] = useState(50);
  const [targetReturn, setTargetReturn] = useState(12);
  const [constraints, setConstraints] = useState({
    maxSinglePosition: 20,
    minDiversification: 8,
    maxSectorConcentration: 30,
    includeNewAssets: true
  });
  const [showEfficientFrontier, setShowEfficientFrontier] = useState(false);

  // Simulação de dados de mercado para otimização
  const marketData = useMemo(() => {
    const fiis = [
      'HGLG11', 'XPML11', 'MXRF11', 'BCFF11', 'KNRI11', 'HGRE11', 'GGRC11', 'VILG11',
      'XPLG11', 'KNCR11', 'HGRU11', 'BTLG11', 'RBRR11', 'XPCI11', 'HGCR11', 'MALL11',
      'BRCO11', 'JSRE11', 'URPR11', 'IRDM11', 'ALZR11', 'RBVA11', 'TGAR11', 'VGIR11'
    ];
    
    return fiis.map(ticker => ({
      ticker,
      expectedReturn: 8 + Math.random() * 8, // 8-16%
      volatility: 12 + Math.random() * 15, // 12-27%
      dividendYield: 6 + Math.random() * 6, // 6-12%
      sector: ['Logístico', 'Shoppings', 'Lajes Corporativas', 'Híbrido', 'Residencial'][Math.floor(Math.random() * 5)],
      liquidity: 50 + Math.random() * 50, // 50-100
      fundamentalScore: 60 + Math.random() * 40, // 60-100
      currentPrice: 80 + Math.random() * 40, // R$ 80-120
      marketCap: 1000 + Math.random() * 5000 // R$ 1-6 bilhões
    }));
  }, []);

  // Algoritmo de otimização (Markowitz simplificado)
  const optimizePortfolio = useMemo(() => {
    if (!portfolio || !marketData.length) return null;

    const availableAssets = marketData.filter(asset => {
      if (!constraints.includeNewAssets) {
        return portfolio.some(p => p.ticker === asset.ticker);
      }
      return true;
    });

    // Função objetivo baseada no goal
    const calculateObjective = (weights, assets) => {
      const portfolioReturn = weights.reduce((sum, w, i) => sum + w * assets[i].expectedReturn, 0);
      const portfolioRisk = Math.sqrt(
        weights.reduce((sum, w, i) => sum + Math.pow(w * assets[i].volatility, 2), 0)
      );
      const portfolioDY = weights.reduce((sum, w, i) => sum + w * assets[i].dividendYield, 0);
      
      switch (optimizationGoal) {
        case 'sharpe':
          return (portfolioReturn - 10.75) / portfolioRisk; // Sharpe ratio
        case 'return':
          return portfolioReturn;
        case 'risk':
          return -portfolioRisk;
        case 'dividend':
          return portfolioDY;
        case 'balanced':
          return (portfolioReturn * 0.4) + (portfolioDY * 0.3) - (portfolioRisk * 0.3);
        default:
          return portfolioReturn / portfolioRisk;
      }
    };

    // Otimização simples (em produção usaria algoritmos mais sofisticados)
    let bestWeights = null;
    let bestObjective = -Infinity;
    
    // Monte Carlo para encontrar alocação ótima
    for (let iteration = 0; iteration < 10000; iteration++) {
      const weights = Array(availableAssets.length).fill(0).map(() => Math.random());
      const sum = weights.reduce((a, b) => a + b, 0);
      const normalizedWeights = weights.map(w => w / sum);
      
      // Aplicar constraints
      const maxWeight = constraints.maxSinglePosition / 100;
      const validWeights = normalizedWeights.map(w => Math.min(w, maxWeight));
      const validSum = validWeights.reduce((a, b) => a + b, 0);
      const finalWeights = validWeights.map(w => w / validSum);
      
      // Verificar diversificação mínima
      const significantPositions = finalWeights.filter(w => w > 0.01).length;
      if (significantPositions < constraints.minDiversification) continue;
      
      // Verificar concentração setorial
      const sectorWeights = {};
      finalWeights.forEach((w, i) => {
        const sector = availableAssets[i].sector;
        sectorWeights[sector] = (sectorWeights[sector] || 0) + w;
      });
      
      const maxSectorWeight = Math.max(...Object.values(sectorWeights));
      if (maxSectorWeight > constraints.maxSectorConcentration / 100) continue;
      
      const objective = calculateObjective(finalWeights, availableAssets);
      
      if (objective > bestObjective) {
        bestObjective = objective;
        bestWeights = finalWeights;
      }
    }

    if (!bestWeights) return null;

    // Calcular métricas da carteira otimizada
    const optimizedReturn = bestWeights.reduce((sum, w, i) => sum + w * availableAssets[i].expectedReturn, 0);
    const optimizedRisk = Math.sqrt(
      bestWeights.reduce((sum, w, i) => sum + Math.pow(w * availableAssets[i].volatility, 2), 0)
    );
    const optimizedDY = bestWeights.reduce((sum, w, i) => sum + w * availableAssets[i].dividendYield, 0);
    const optimizedSharpe = (optimizedReturn - 10.75) / optimizedRisk;

    // Criar recomendações de alocação
    const recommendations = availableAssets
      .map((asset, i) => ({
        ...asset,
        recommendedWeight: bestWeights[i],
        recommendedValue: (totalValue || 0) * bestWeights[i],
        currentWeight: portfolio.find(p => p.ticker === asset.ticker)?.current_value / (totalValue || 1) || 0
      }))
      .filter(rec => rec.recommendedWeight > 0.01)
      .sort((a, b) => b.recommendedWeight - a.recommendedWeight);

    return {
      recommendations,
      metrics: {
        expectedReturn: optimizedReturn,
        expectedRisk: optimizedRisk,
        expectedDY: optimizedDY,
        sharpeRatio: optimizedSharpe,
        objective: bestObjective
      },
      changes: recommendations.map(rec => ({
        ticker: rec.ticker,
        action: rec.currentWeight === 0 ? 'BUY' : 
                rec.recommendedWeight > rec.currentWeight ? 'INCREASE' : 
                rec.recommendedWeight < rec.currentWeight ? 'DECREASE' : 'HOLD',
        currentValue: rec.currentWeight * (totalValue || 0),
        targetValue: rec.recommendedValue,
        difference: rec.recommendedValue - (rec.currentWeight * (totalValue || 0))
      }))
    };
  }, [portfolio, marketData, optimizationGoal, constraints, totalValue]);

  // Fronteira Eficiente
  const efficientFrontier = useMemo(() => {
    if (!showEfficientFrontier || !marketData.length) return [];
    
    const frontierPoints = [];
    
    for (let targetRisk = 10; targetRisk <= 30; targetRisk += 2) {
      // Simulação simplificada da fronteira eficiente
      const expectedReturn = 6 + (targetRisk - 10) * 0.4 + Math.random() * 2;
      frontierPoints.push({
        risk: targetRisk,
        return: expectedReturn,
        sharpe: (expectedReturn - 10.75) / targetRisk
      });
    }
    
    return frontierPoints.sort((a, b) => a.risk - b.risk);
  }, [showEfficientFrontier, marketData]);

  // Análise de cenários
  const scenarioAnalysis = useMemo(() => {
    if (!optimizePortfolio) return null;
    
    const scenarios = [
      { name: 'Otimista', returnMultiplier: 1.3, riskMultiplier: 0.8 },
      { name: 'Base', returnMultiplier: 1.0, riskMultiplier: 1.0 },
      { name: 'Pessimista', returnMultiplier: 0.7, riskMultiplier: 1.4 },
      { name: 'Crise', returnMultiplier: 0.3, riskMultiplier: 2.0 }
    ];
    
    return scenarios.map(scenario => ({
      ...scenario,
      expectedReturn: optimizePortfolio.metrics.expectedReturn * scenario.returnMultiplier,
      expectedRisk: optimizePortfolio.metrics.expectedRisk * scenario.riskMultiplier,
      expectedValue: (totalValue || 0) * (1 + (optimizePortfolio.metrics.expectedReturn * scenario.returnMultiplier / 100)),
      probability: scenario.name === 'Base' ? 0.4 : scenario.name === 'Otimista' ? 0.25 : scenario.name === 'Pessimista' ? 0.25 : 0.1
    }));
  }, [optimizePortfolio, totalValue]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercent = (value) => {
    return `${value.toFixed(2)}%`;
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'BUY': return 'text-green-600 bg-green-50 border-green-200';
      case 'INCREASE': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'DECREASE': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'HOLD': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff', '#00ffff', '#ff0000'];

  if (!optimizePortfolio) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Carregando otimizador de portfólio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Zap className="w-8 h-8" />
          <h2 className="text-2xl font-bold">Portfolio Optimizer</h2>
        </div>
        <p className="text-purple-100">
          Otimização avançada de portfólio com algoritmos de Markowitz e análise de fronteira eficiente
        </p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Target className="w-4 h-4 inline mr-1" />
            Objetivo de Otimização
          </label>
          <select
            value={optimizationGoal}
            onChange={(e) => setOptimizationGoal(e.target.value)}
            className="w-full p-2 border rounded-lg"
          >
            <option value="sharpe">Maximizar Sharpe Ratio</option>
            <option value="return">Maximizar Retorno</option>
            <option value="risk">Minimizar Risco</option>
            <option value="dividend">Maximizar Dividendos</option>
            <option value="balanced">Estratégia Balanceada</option>
          </select>
        </div>

        <div className="bg-white rounded-lg p-4 border">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Shield className="w-4 h-4 inline mr-1" />
            Tolerância ao Risco
          </label>
          <input
            type="range"
            min="10"
            max="90"
            value={riskTolerance}
            onChange={(e) => setRiskTolerance(Number(e.target.value))}
            className="w-full"
          />
          <div className="text-center text-lg font-bold text-purple-600 mt-1">
            {riskTolerance}%
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <TrendingUp className="w-4 h-4 inline mr-1" />
            Meta de Retorno
          </label>
          <input
            type="range"
            min="6"
            max="20"
            value={targetReturn}
            onChange={(e) => setTargetReturn(Number(e.target.value))}
            className="w-full"
          />
          <div className="text-center text-lg font-bold text-green-600 mt-1">
            {targetReturn}% a.a.
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Settings className="w-4 h-4 inline mr-1" />
            Fronteira Eficiente
          </label>
          <button
            onClick={() => setShowEfficientFrontier(!showEfficientFrontier)}
            className={`w-full p-2 rounded-lg text-sm ${
              showEfficientFrontier 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {showEfficientFrontier ? 'Ativo' : 'Inativo'}
          </button>
        </div>
      </div>

      {/* Optimization Results */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-green-800">Retorno Esperado</h3>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-700">
            {formatPercent(optimizePortfolio.metrics.expectedReturn)}
          </div>
          <div className="text-sm text-green-600">
            Anualizado
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-blue-800">Risco Esperado</h3>
            <Shield className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-700">
            {formatPercent(optimizePortfolio.metrics.expectedRisk)}
          </div>
          <div className="text-sm text-blue-600">
            Volatilidade
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-purple-800">Sharpe Ratio</h3>
            <Award className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-700">
            {optimizePortfolio.metrics.sharpeRatio.toFixed(2)}
          </div>
          <div className="text-sm text-purple-600">
            Risco-retorno
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-6 border border-yellow-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-yellow-800">Dividend Yield</h3>
            <Gem className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-yellow-700">
            {formatPercent(optimizePortfolio.metrics.expectedDY)}
          </div>
          <div className="text-sm text-yellow-600">
            Anual esperado
          </div>
        </div>
      </div>

      {/* Efficient Frontier */}
      {showEfficientFrontier && efficientFrontier.length > 0 && (
        <div className="bg-white rounded-lg p-6 border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Fronteira Eficiente
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart data={efficientFrontier}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="risk" name="Risco (%)" />
              <YAxis dataKey="return" name="Retorno (%)" />
              <Tooltip 
                formatter={(value, name) => [
                  `${value.toFixed(2)}%`, 
                  name === 'return' ? 'Retorno' : 'Risco'
                ]}
              />
              <Scatter 
                dataKey="return" 
                fill="#8884d8" 
                name="Fronteira Eficiente"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recommended Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            Alocação Recomendada
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={optimizePortfolio.recommendations.slice(0, 8)}
                dataKey="recommendedWeight"
                nameKey="ticker"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ticker, recommendedWeight}) => 
                  `${ticker} (${(recommendedWeight * 100).toFixed(1)}%)`
                }
              >
                {optimizePortfolio.recommendations.slice(0, 8).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${(value * 100).toFixed(2)}%`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg p-6 border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-500" />
            Ações Recomendadas
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {optimizePortfolio.changes
              .filter(change => change.action !== 'HOLD')
              .slice(0, 10)
              .map((change, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium border ${getActionColor(change.action)}`}>
                    {change.action}
                  </span>
                  <span className="font-medium">{change.ticker}</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {formatCurrency(Math.abs(change.difference))}
                  </div>
                  <div className="text-sm text-gray-500">
                    {change.action === 'BUY' ? 'Comprar' : 
                     change.action === 'INCREASE' ? 'Aumentar' : 'Reduzir'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scenario Analysis */}
      {scenarioAnalysis && (
        <div className="bg-white rounded-lg p-6 border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            Análise de Cenários
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {scenarioAnalysis.map((scenario, index) => (
              <div key={index} className={`p-4 rounded-lg border-2 ${
                scenario.name === 'Otimista' ? 'border-green-200 bg-green-50' :
                scenario.name === 'Base' ? 'border-blue-200 bg-blue-50' :
                scenario.name === 'Pessimista' ? 'border-orange-200 bg-orange-50' :
                'border-red-200 bg-red-50'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-800">{scenario.name}</h4>
                  {scenario.name === 'Otimista' && <Crown className="w-4 h-4 text-green-600" />}
                  {scenario.name === 'Base' && <Star className="w-4 h-4 text-blue-600" />}
                  {scenario.name === 'Pessimista' && <Shield className="w-4 h-4 text-orange-600" />}
                  {scenario.name === 'Crise' && <AlertTriangle className="w-4 h-4 text-red-600" />}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Probabilidade:</span>
                    <span className="font-medium">{(scenario.probability * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Retorno:</span>
                    <span className="font-medium">{formatPercent(scenario.expectedReturn)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Risco:</span>
                    <span className="font-medium">{formatPercent(scenario.expectedRisk)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Valor Final:</span>
                    <span className="font-medium">{formatCurrency(scenario.expectedValue)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Constraints Settings */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-500" />
          Configurações de Otimização
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Máx. Posição Individual (%)
            </label>
            <input
              type="number"
              min="5"
              max="50"
              value={constraints.maxSinglePosition}
              onChange={(e) => setConstraints(prev => ({
                ...prev,
                maxSinglePosition: Number(e.target.value)
              }))}
              className="w-full p-2 border rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mín. Diversificação (FIIs)
            </label>
            <input
              type="number"
              min="3"
              max="20"
              value={constraints.minDiversification}
              onChange={(e) => setConstraints(prev => ({
                ...prev,
                minDiversification: Number(e.target.value)
              }))}
              className="w-full p-2 border rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Máx. Concentração Setorial (%)
            </label>
            <input
              type="number"
              min="15"
              max="60"
              value={constraints.maxSectorConcentration}
              onChange={(e) => setConstraints(prev => ({
                ...prev,
                maxSectorConcentration: Number(e.target.value)
              }))}
              className="w-full p-2 border rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Incluir Novos Ativos
            </label>
            <button
              onClick={() => setConstraints(prev => ({
                ...prev,
                includeNewAssets: !prev.includeNewAssets
              }))}
              className={`w-full p-2 rounded-lg text-sm ${
                constraints.includeNewAssets 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {constraints.includeNewAssets ? 'Sim' : 'Não'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioOptimizer; 
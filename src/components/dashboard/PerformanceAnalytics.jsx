import React, { useState, useMemo, useContext } from 'react';
import { PortfolioContext } from '../../contexts/PortfolioContext';
import { AIContext } from '../../contexts/AIContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar, ComposedChart, ScatterChart, Scatter } from 'recharts';
import { TrendingUp, Award, BarChart3, Target, Calendar, Zap, Brain, Star, Trophy, Activity } from 'lucide-react';

const PerformanceAnalytics = () => {
  const { portfolio, totalValue, monthlyIncome } = useContext(PortfolioContext);
  const { analyzePortfolio } = useContext(AIContext);
  
  const [timeFrame, setTimeFrame] = useState('1Y');
  const [benchmark, setBenchmark] = useState('IFIX');
  const [analysisType, setAnalysisType] = useState('returns');
  const [showAttribution, setShowAttribution] = useState(false);

  // Geração de dados históricos simulados
  const generatePerformanceData = useMemo(() => {
    const periods = timeFrame === '1M' ? 30 : timeFrame === '3M' ? 90 : timeFrame === '6M' ? 180 : 365;
    const data = [];
    
    let portfolioValue = 100;
    let ifixValue = 100;
    let selicValue = 100;
    let ibovValue = 100;
    
    const portfolioVolatility = 0.15;
    const ifixVolatility = 0.12;
    const selicRate = 0.1075 / 365; // Taxa Selic diária
    const ibovVolatility = 0.25;
    
    for (let i = 0; i <= periods; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (periods - i));
      
      if (i > 0) {
        // Portfolio performance
        const portfolioReturn = (Math.random() - 0.5) * 2 * portfolioVolatility / Math.sqrt(365) + 0.08 / 365;
        portfolioValue *= (1 + portfolioReturn);
        
        // IFIX performance
        const ifixReturn = (Math.random() - 0.5) * 2 * ifixVolatility / Math.sqrt(365) + 0.06 / 365;
        ifixValue *= (1 + ifixReturn);
        
        // Selic (risk-free rate)
        selicValue *= (1 + selicRate);
        
        // Ibovespa
        const ibovReturn = (Math.random() - 0.5) * 2 * ibovVolatility / Math.sqrt(365) + 0.10 / 365;
        ibovValue *= (1 + ibovReturn);
      }
      
      data.push({
        date: date.toISOString().split('T')[0],
        portfolio: portfolioValue,
        ifix: ifixValue,
        selic: selicValue,
        ibov: ibovValue,
        portfolioReturn: ((portfolioValue - 100) / 100) * 100,
        ifixReturn: ((ifixValue - 100) / 100) * 100,
        selicReturn: ((selicValue - 100) / 100) * 100,
        ibovReturn: ((ibovValue - 100) / 100) * 100
      });
    }
    
    return data;
  }, [timeFrame]);

  // Métricas de performance
  const performanceMetrics = useMemo(() => {
    if (!generatePerformanceData.length) return null;
    
    const latest = generatePerformanceData[generatePerformanceData.length - 1];
    const initial = generatePerformanceData[0];
    
    const portfolioReturn = (latest.portfolio - initial.portfolio) / initial.portfolio;
    const benchmarkReturn = (latest.ifix - initial.ifix) / initial.ifix;
    const riskFreeReturn = (latest.selic - initial.selic) / initial.selic;
    
    // Cálculo de volatilidade
    const portfolioReturns = generatePerformanceData.slice(1).map((d, i) => 
      (d.portfolio - generatePerformanceData[i].portfolio) / generatePerformanceData[i].portfolio
    );
    
    const portfolioVolatility = Math.sqrt(
      portfolioReturns.reduce((sum, r) => {
        const mean = portfolioReturns.reduce((a, b) => a + b, 0) / portfolioReturns.length;
        return sum + Math.pow(r - mean, 2);
      }, 0) / portfolioReturns.length
    ) * Math.sqrt(252); // Anualizada
    
    // Sharpe Ratio
    const sharpeRatio = (portfolioReturn - riskFreeReturn) / portfolioVolatility;
    
    // Information Ratio
    const excessReturns = portfolioReturns.map((r, i) => {
      const benchmarkReturns = generatePerformanceData.slice(1).map((d, j) => 
        (d.ifix - generatePerformanceData[j].ifix) / generatePerformanceData[j].ifix
      );
      return r - benchmarkReturns[i];
    });
    
    const trackingError = Math.sqrt(
      excessReturns.reduce((sum, r) => {
        const mean = excessReturns.reduce((a, b) => a + b, 0) / excessReturns.length;
        return sum + Math.pow(r - mean, 2);
      }, 0) / excessReturns.length
    ) * Math.sqrt(252);
    
    const informationRatio = (portfolioReturn - benchmarkReturn) / trackingError;
    
    // Alpha e Beta
    const benchmarkReturns = generatePerformanceData.slice(1).map((d, i) => 
      (d.ifix - generatePerformanceData[i].ifix) / generatePerformanceData[i].ifix
    );
    
    const covariance = portfolioReturns.reduce((sum, r, i) => {
      const portfolioMean = portfolioReturns.reduce((a, b) => a + b, 0) / portfolioReturns.length;
      const benchmarkMean = benchmarkReturns.reduce((a, b) => a + b, 0) / benchmarkReturns.length;
      return sum + (r - portfolioMean) * (benchmarkReturns[i] - benchmarkMean);
    }, 0) / portfolioReturns.length;
    
    const benchmarkVariance = benchmarkReturns.reduce((sum, r) => {
      const mean = benchmarkReturns.reduce((a, b) => a + b, 0) / benchmarkReturns.length;
      return sum + Math.pow(r - mean, 2);
    }, 0) / benchmarkReturns.length;
    
    const beta = covariance / benchmarkVariance;
    const alpha = portfolioReturn - (riskFreeReturn + beta * (benchmarkReturn - riskFreeReturn));
    
    // Maximum Drawdown
    let peak = initial.portfolio;
    let maxDrawdown = 0;
    
    generatePerformanceData.forEach(d => {
      if (d.portfolio > peak) peak = d.portfolio;
      const drawdown = (peak - d.portfolio) / peak;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    });
    
    return {
      totalReturn: portfolioReturn,
      benchmarkReturn: benchmarkReturn,
      excessReturn: portfolioReturn - benchmarkReturn,
      volatility: portfolioVolatility,
      sharpeRatio: sharpeRatio,
      informationRatio: informationRatio,
      alpha: alpha,
      beta: beta,
      maxDrawdown: maxDrawdown,
      trackingError: trackingError
    };
  }, [generatePerformanceData]);

  // Attribution Analysis
  const attributionAnalysis = useMemo(() => {
    if (!portfolio || !showAttribution) return null;
    
    const sectors = {};
    let totalValue = 0;
    
    portfolio.forEach(investment => {
      const sector = investment.sector || 'Outros';
      if (!sectors[sector]) {
        sectors[sector] = {
          name: sector,
          weight: 0,
          return: 0,
          contribution: 0,
          count: 0
        };
      }
      
      sectors[sector].weight += investment.current_value;
      sectors[sector].return += (Math.random() - 0.3) * 0.2; // Simulado
      sectors[sector].count += 1;
      totalValue += investment.current_value;
    });
    
    // Normalizar pesos e calcular contribuições
    Object.values(sectors).forEach(sector => {
      sector.weight = (sector.weight / totalValue) * 100;
      sector.return = sector.return / sector.count;
      sector.contribution = (sector.weight / 100) * sector.return;
    });
    
    return Object.values(sectors).sort((a, b) => b.contribution - a.contribution);
  }, [portfolio, showAttribution]);

  // Performance Rankings
  const performanceRankings = useMemo(() => {
    if (!portfolio) return [];
    
    return portfolio.map(investment => {
      const performance = (Math.random() - 0.3) * 0.3; // -30% a +30%
      const dividend_yield = investment.dividend_yield_monthly * 12 || 0;
      const score = performance * 0.7 + (dividend_yield / 100) * 0.3;
      
      return {
        ...investment,
        performance: performance,
        score: score,
        rank: 0 // Será calculado após ordenação
      };
    }).sort((a, b) => b.score - a.score).map((investment, index) => ({
      ...investment,
      rank: index + 1
    }));
  }, [portfolio]);

  const formatPercent = (value) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${(value * 100).toFixed(2)}%`;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getPerformanceColor = (value) => {
    return value >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getPerformanceIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-4 h-4 text-yellow-500" />;
    if (rank === 2) return <Award className="w-4 h-4 text-gray-400" />;
    if (rank === 3) return <Star className="w-4 h-4 text-orange-500" />;
    return <span className="w-4 h-4 flex items-center justify-center text-xs font-bold text-gray-500">#{rank}</span>;
  };

  if (!performanceMetrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Carregando análise de performance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="w-8 h-8" />
          <h2 className="text-2xl font-bold">Performance Analytics</h2>
        </div>
        <p className="text-blue-100">
          Análise completa de performance com benchmarking e métricas avançadas
        </p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Período
          </label>
          <select
            value={timeFrame}
            onChange={(e) => setTimeFrame(e.target.value)}
            className="w-full p-2 border rounded-lg"
          >
            <option value="1M">1 Mês</option>
            <option value="3M">3 Meses</option>
            <option value="6M">6 Meses</option>
            <option value="1Y">1 Ano</option>
          </select>
        </div>

        <div className="bg-white rounded-lg p-4 border">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Target className="w-4 h-4 inline mr-1" />
            Benchmark
          </label>
          <select
            value={benchmark}
            onChange={(e) => setBenchmark(e.target.value)}
            className="w-full p-2 border rounded-lg"
          >
            <option value="IFIX">IFIX</option>
            <option value="SELIC">Selic</option>
            <option value="IBOV">Ibovespa</option>
          </select>
        </div>

        <div className="bg-white rounded-lg p-4 border">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Activity className="w-4 h-4 inline mr-1" />
            Análise
          </label>
          <select
            value={analysisType}
            onChange={(e) => setAnalysisType(e.target.value)}
            className="w-full p-2 border rounded-lg"
          >
            <option value="returns">Retornos</option>
            <option value="risk">Risco</option>
            <option value="ratios">Índices</option>
          </select>
        </div>

        <div className="bg-white rounded-lg p-4 border">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Brain className="w-4 h-4 inline mr-1" />
            Attribution
          </label>
          <button
            onClick={() => setShowAttribution(!showAttribution)}
            className={`w-full p-2 rounded-lg text-sm ${
              showAttribution 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {showAttribution ? 'Ativo' : 'Inativo'}
          </button>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-green-800">Retorno Total</h3>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div className={`text-2xl font-bold ${getPerformanceColor(performanceMetrics.totalReturn)}`}>
            {formatPercent(performanceMetrics.totalReturn)}
          </div>
          <div className="text-sm text-green-600">
            vs {benchmark}: {formatPercent(performanceMetrics.excessReturn)}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-blue-800">Sharpe Ratio</h3>
            <Award className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-700">
            {performanceMetrics.sharpeRatio.toFixed(2)}
          </div>
          <div className="text-sm text-blue-600">
            Retorno ajustado ao risco
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-purple-800">Alpha</h3>
            <Star className="w-5 h-5 text-purple-600" />
          </div>
          <div className={`text-2xl font-bold ${getPerformanceColor(performanceMetrics.alpha)}`}>
            {formatPercent(performanceMetrics.alpha)}
          </div>
          <div className="text-sm text-purple-600">
            Beta: {performanceMetrics.beta.toFixed(2)}
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-orange-800">Max Drawdown</h3>
            <Activity className="w-5 h-5 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-700">
            {formatPercent(-performanceMetrics.maxDrawdown)}
          </div>
          <div className="text-sm text-orange-600">
            Maior perda acumulada
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-white rounded-lg p-6 border">
        <h3 className="text-lg font-semibold mb-4">Evolução Comparativa</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={generatePerformanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={(value) => `${value.toFixed(0)}%`} />
            <Tooltip 
              formatter={(value, name) => [`${value.toFixed(2)}%`, name]}
              labelFormatter={(date) => new Date(date).toLocaleDateString('pt-BR')}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="portfolioReturn" 
              stroke="#8884d8" 
              strokeWidth={3}
              name="Portfólio"
            />
            <Line 
              type="monotone" 
              dataKey="ifixReturn" 
              stroke="#82ca9d" 
              strokeWidth={2}
              name="IFIX"
            />
            <Line 
              type="monotone" 
              dataKey="selicReturn" 
              stroke="#ffc658" 
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Selic"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Attribution Analysis */}
      {showAttribution && attributionAnalysis && (
        <div className="bg-white rounded-lg p-6 border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Análise de Atribuição por Setor
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={attributionAnalysis}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `${(value * 100).toFixed(1)}%`} />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'contribution' ? `${(value * 100).toFixed(2)}%` : `${value.toFixed(1)}%`,
                  name === 'contribution' ? 'Contribuição' : name === 'weight' ? 'Peso' : 'Retorno'
                ]}
              />
              <Legend />
              <Bar dataKey="weight" fill="#8884d8" name="Peso (%)" />
              <Bar dataKey="contribution" fill="#82ca9d" name="Contribuição (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Performance Rankings */}
      <div className="bg-white rounded-lg p-6 border">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Ranking de Performance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {performanceRankings.slice(0, 9).map((investment, index) => (
            <div key={index} className={`p-4 rounded-lg border-2 ${
              investment.rank <= 3 
                ? 'border-yellow-200 bg-yellow-50' 
                : investment.rank <= 6
                ? 'border-green-200 bg-green-50'
                : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getPerformanceIcon(investment.rank)}
                  <h4 className="font-semibold text-gray-800">{investment.ticker}</h4>
                </div>
                <div className={`text-sm font-medium ${getPerformanceColor(investment.performance)}`}>
                  {formatPercent(investment.performance)}
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Valor:</span>
                  <span className="font-medium">{formatCurrency(investment.current_value)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">DY Anual:</span>
                  <span className="font-medium">{((investment.dividend_yield_monthly || 0) * 12).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Score:</span>
                  <span className="font-medium">{(investment.score * 100).toFixed(1)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Advanced Metrics Table */}
      <div className="bg-white rounded-lg p-6 border">
        <h3 className="text-lg font-semibold mb-4">Métricas Avançadas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-800">Métricas de Retorno</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Retorno Anualizado:</span>
                <span className={`font-medium ${getPerformanceColor(performanceMetrics.totalReturn)}`}>
                  {formatPercent(performanceMetrics.totalReturn)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Excess Return:</span>
                <span className={`font-medium ${getPerformanceColor(performanceMetrics.excessReturn)}`}>
                  {formatPercent(performanceMetrics.excessReturn)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Alpha:</span>
                <span className={`font-medium ${getPerformanceColor(performanceMetrics.alpha)}`}>
                  {formatPercent(performanceMetrics.alpha)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-gray-800">Métricas de Risco</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Volatilidade:</span>
                <span className="font-medium">{formatPercent(performanceMetrics.volatility)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tracking Error:</span>
                <span className="font-medium">{formatPercent(performanceMetrics.trackingError)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Information Ratio:</span>
                <span className="font-medium">{performanceMetrics.informationRatio.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceAnalytics; 
import React, { useState, useMemo, useContext } from 'react';
import { PortfolioContext } from '../../contexts/PortfolioContext';
import { AIContext } from '../../contexts/AIContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { TrendingUp, Target, Calculator, Brain, Zap, DollarSign, Calendar, PieChart } from 'lucide-react';

const FutureProjections = () => {
  const { portfolio, totalValue, monthlyIncome } = useContext(PortfolioContext);
  const { analyzePortfolio } = useContext(AIContext);
  
  const [projectionYears, setProjectionYears] = useState(10);
  const [monthlyContribution, setMonthlyContribution] = useState(500);
  const [reinvestmentRate, setReinvestmentRate] = useState(80);
  const [inflationRate, setInflationRate] = useState(4.5);
  const [selectedScenario, setSelectedScenario] = useState('realistic');
  const [showMonteCarlo, setShowMonteCarlo] = useState(false);

  // Cenários de crescimento
  const scenarios = {
    pessimistic: { growth: 6, volatility: 15, dividendGrowth: 2 },
    realistic: { growth: 10, volatility: 12, dividendGrowth: 5 },
    optimistic: { growth: 15, volatility: 18, dividendGrowth: 8 }
  };

  // Cálculo das projeções
  const projections = useMemo(() => {
    const scenario = scenarios[selectedScenario];
    const data = [];
    
    let currentValue = totalValue || 0;
    let currentMonthlyIncome = monthlyIncome || 0;
    let totalContributed = currentValue;
    
    for (let year = 0; year <= projectionYears; year++) {
      if (year > 0) {
        // Crescimento do valor
        currentValue = currentValue * (1 + scenario.growth / 100) + (monthlyContribution * 12);
        
        // Crescimento da renda mensal
        currentMonthlyIncome = currentMonthlyIncome * (1 + scenario.dividendGrowth / 100);
        
        // Reinvestimento
        const reinvestedAmount = (currentMonthlyIncome * 12 * reinvestmentRate / 100);
        currentValue += reinvestedAmount;
        
        // Total contribuído
        totalContributed += monthlyContribution * 12;
      }
      
      // Valor real (ajustado pela inflação)
      const realValue = currentValue / Math.pow(1 + inflationRate / 100, year);
      const realMonthlyIncome = currentMonthlyIncome / Math.pow(1 + inflationRate / 100, year);
      
      data.push({
        year: year,
        nominalValue: currentValue,
        realValue: realValue,
        monthlyIncome: currentMonthlyIncome,
        realMonthlyIncome: realMonthlyIncome,
        totalContributed: totalContributed,
        gains: currentValue - totalContributed,
        annualIncome: currentMonthlyIncome * 12
      });
    }
    
    return data;
  }, [projectionYears, monthlyContribution, reinvestmentRate, inflationRate, selectedScenario, totalValue, monthlyIncome]);

  // Simulação Monte Carlo
  const monteCarloSimulation = useMemo(() => {
    if (!showMonteCarlo) return [];
    
    const simulations = 1000;
    const results = [];
    const scenario = scenarios[selectedScenario];
    
    for (let sim = 0; sim < simulations; sim++) {
      let value = totalValue || 0;
      
      for (let year = 1; year <= projectionYears; year++) {
        // Variação aleatória baseada na volatilidade
        const randomReturn = (Math.random() - 0.5) * 2 * scenario.volatility / 100;
        const yearReturn = scenario.growth / 100 + randomReturn;
        
        value = value * (1 + yearReturn) + (monthlyContribution * 12);
      }
      
      results.push(value);
    }
    
    results.sort((a, b) => a - b);
    
    return {
      p10: results[Math.floor(simulations * 0.1)],
      p25: results[Math.floor(simulations * 0.25)],
      p50: results[Math.floor(simulations * 0.5)],
      p75: results[Math.floor(simulations * 0.75)],
      p90: results[Math.floor(simulations * 0.9)],
      average: results.reduce((a, b) => a + b, 0) / simulations
    };
  }, [showMonteCarlo, projectionYears, monthlyContribution, selectedScenario, totalValue]);

  // Metas de independência financeira
  const independenceGoals = [
    { name: 'Liberdade Básica', amount: 2000, description: 'Cobrir gastos básicos' },
    { name: 'Conforto', amount: 5000, description: 'Vida confortável' },
    { name: 'Luxo', amount: 10000, description: 'Estilo de vida premium' },
    { name: 'Ultra Rico', amount: 20000, description: 'Independência total' }
  ];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const finalProjection = projections[projections.length - 1];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-8 h-8" />
          <h2 className="text-2xl font-bold">Projeções Futuras</h2>
        </div>
        <p className="text-purple-100">
          Visualize o futuro do seu patrimônio com análises avançadas e simulações inteligentes
        </p>
      </div>

      {/* Controles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Anos de Projeção
          </label>
          <input
            type="range"
            min="5"
            max="30"
            value={projectionYears}
            onChange={(e) => setProjectionYears(Number(e.target.value))}
            className="w-full"
          />
          <div className="text-center text-lg font-bold text-blue-600 mt-1">
            {projectionYears} anos
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <DollarSign className="w-4 h-4 inline mr-1" />
            Aporte Mensal
          </label>
          <input
            type="range"
            min="100"
            max="5000"
            step="100"
            value={monthlyContribution}
            onChange={(e) => setMonthlyContribution(Number(e.target.value))}
            className="w-full"
          />
          <div className="text-center text-lg font-bold text-green-600 mt-1">
            {formatCurrency(monthlyContribution)}
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <PieChart className="w-4 h-4 inline mr-1" />
            Reinvestimento
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={reinvestmentRate}
            onChange={(e) => setReinvestmentRate(Number(e.target.value))}
            className="w-full"
          />
          <div className="text-center text-lg font-bold text-purple-600 mt-1">
            {reinvestmentRate}%
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Brain className="w-4 h-4 inline mr-1" />
            Cenário
          </label>
          <select
            value={selectedScenario}
            onChange={(e) => setSelectedScenario(e.target.value)}
            className="w-full p-2 border rounded-lg"
          >
            <option value="pessimistic">Pessimista</option>
            <option value="realistic">Realista</option>
            <option value="optimistic">Otimista</option>
          </select>
        </div>
      </div>

      {/* Resumo da Projeção */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-green-800">Patrimônio Final</h3>
            <Target className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-700">
            {formatCurrency(finalProjection?.nominalValue || 0)}
          </div>
          <div className="text-sm text-green-600 mt-1">
            Real: {formatCurrency(finalProjection?.realValue || 0)}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-blue-800">Renda Mensal</h3>
            <DollarSign className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-700">
            {formatCurrency(finalProjection?.monthlyIncome || 0)}
          </div>
          <div className="text-sm text-blue-600 mt-1">
            Real: {formatCurrency(finalProjection?.realMonthlyIncome || 0)}
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-purple-800">Ganhos Totais</h3>
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-700">
            {formatCurrency(finalProjection?.gains || 0)}
          </div>
          <div className="text-sm text-purple-600 mt-1">
            ROI: {finalProjection ? ((finalProjection.gains / finalProjection.totalContributed) * 100).toFixed(1) : 0}%
          </div>
        </div>
      </div>

      {/* Gráfico de Evolução */}
      <div className="bg-white rounded-lg p-6 border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Evolução do Patrimônio</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setShowMonteCarlo(!showMonteCarlo)}
              className={`px-3 py-1 rounded-lg text-sm ${
                showMonteCarlo 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Monte Carlo
            </button>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={projections}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis tickFormatter={(value) => formatCurrency(value)} />
            <Tooltip 
              formatter={(value, name) => [formatCurrency(value), name]}
              labelFormatter={(year) => `Ano ${year}`}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="nominalValue" 
              stackId="1"
              stroke="#8884d8" 
              fill="#8884d8" 
              fillOpacity={0.6}
              name="Valor Nominal"
            />
            <Area 
              type="monotone" 
              dataKey="totalContributed" 
              stackId="2"
              stroke="#82ca9d" 
              fill="#82ca9d" 
              fillOpacity={0.6}
              name="Total Investido"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Monte Carlo Results */}
      {showMonteCarlo && monteCarloSimulation && (
        <div className="bg-white rounded-lg p-6 border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Simulação Monte Carlo - Probabilidades
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-sm text-red-600 font-medium">10% Chance</div>
              <div className="text-lg font-bold text-red-700">
                {formatCurrency(monteCarloSimulation.p10)}
              </div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-sm text-orange-600 font-medium">25% Chance</div>
              <div className="text-lg font-bold text-orange-700">
                {formatCurrency(monteCarloSimulation.p25)}
              </div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-sm text-yellow-600 font-medium">50% Chance</div>
              <div className="text-lg font-bold text-yellow-700">
                {formatCurrency(monteCarloSimulation.p50)}
              </div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-sm text-green-600 font-medium">75% Chance</div>
              <div className="text-lg font-bold text-green-700">
                {formatCurrency(monteCarloSimulation.p75)}
              </div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-600 font-medium">90% Chance</div>
              <div className="text-lg font-bold text-blue-700">
                {formatCurrency(monteCarloSimulation.p90)}
              </div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-sm text-purple-600 font-medium">Média</div>
              <div className="text-lg font-bold text-purple-700">
                {formatCurrency(monteCarloSimulation.average)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Metas de Independência Financeira */}
      <div className="bg-white rounded-lg p-6 border">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-green-500" />
          Metas de Independência Financeira
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {independenceGoals.map((goal, index) => {
            const yearsToGoal = projections.findIndex(p => p.monthlyIncome >= goal.amount);
            const achieved = yearsToGoal !== -1;
            
            return (
              <div key={index} className={`p-4 rounded-lg border-2 ${
                achieved 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-800">{goal.name}</h4>
                  {achieved && <Target className="w-4 h-4 text-green-600" />}
                </div>
                <div className="text-lg font-bold text-gray-700 mb-1">
                  {formatCurrency(goal.amount)}/mês
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  {goal.description}
                </div>
                {achieved ? (
                  <div className="text-sm font-medium text-green-600">
                    ✓ Alcançado em {yearsToGoal} anos
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    Não alcançado em {projectionYears} anos
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Gráfico de Renda Mensal */}
      <div className="bg-white rounded-lg p-6 border">
        <h3 className="text-lg font-semibold mb-4">Evolução da Renda Mensal</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={projections}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis tickFormatter={(value) => formatCurrency(value)} />
            <Tooltip 
              formatter={(value, name) => [formatCurrency(value), name]}
              labelFormatter={(year) => `Ano ${year}`}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="monthlyIncome" 
              stroke="#8884d8" 
              strokeWidth={3}
              name="Renda Nominal"
            />
            <Line 
              type="monotone" 
              dataKey="realMonthlyIncome" 
              stroke="#82ca9d" 
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Renda Real"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FutureProjections; 
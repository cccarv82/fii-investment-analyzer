import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Cores para os gráficos
const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', 
  '#ff00ff', '#00ffff', '#ff0000', '#0000ff', '#ffff00'
];

// Componente de gráfico de pizza para distribuição setorial
export const SectorDistributionChart = ({ data }) => {
  const renderLabel = (entry) => {
    return `${entry.name}: ${entry.percentage.toFixed(1)}%`;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderLabel}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Valor']} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

// Componente de gráfico de barras para performance dos FIIs
export const PerformanceChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="ticker" />
        <YAxis />
        <Tooltip 
          formatter={(value, name) => [
            name === 'performance' ? `${value.toFixed(2)}%` : `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            name === 'performance' ? 'Performance' : 'Valor Investido'
          ]}
        />
        <Legend />
        <Bar dataKey="investedValue" fill="#8884d8" name="Valor Investido" />
        <Bar dataKey="performance" fill="#82ca9d" name="Performance %" />
      </BarChart>
    </ResponsiveContainer>
  );
};

// Componente de gráfico de linha para evolução dos dividendos
export const DividendEvolutionChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip 
          formatter={(value) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Dividendos']}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="dividends" 
          stroke="#8884d8" 
          strokeWidth={2}
          name="Dividendos Mensais"
        />
        <Line 
          type="monotone" 
          dataKey="accumulated" 
          stroke="#82ca9d" 
          strokeWidth={2}
          name="Acumulado"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

// Componente de gráfico de área para projeção de patrimônio
export const PatrimonyProjectionChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" />
        <YAxis />
        <Tooltip 
          formatter={(value, name) => [
            `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            name === 'conservative' ? 'Cenário Conservador' :
            name === 'moderate' ? 'Cenário Moderado' : 'Cenário Otimista'
          ]}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="conservative" 
          stroke="#ff7300" 
          strokeWidth={2}
          name="Conservador (5% a.a.)"
        />
        <Line 
          type="monotone" 
          dataKey="moderate" 
          stroke="#8884d8" 
          strokeWidth={2}
          name="Moderado (8% a.a.)"
        />
        <Line 
          type="monotone" 
          dataKey="optimistic" 
          stroke="#82ca9d" 
          strokeWidth={2}
          name="Otimista (12% a.a.)"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

// Componente de gráfico de barras para comparação de yield
export const YieldComparisonChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="ticker" />
        <YAxis />
        <Tooltip 
          formatter={(value) => [`${value.toFixed(2)}%`, 'Dividend Yield']}
        />
        <Legend />
        <Bar dataKey="dividendYield" fill="#82ca9d" name="Dividend Yield %" />
      </BarChart>
    </ResponsiveContainer>
  );
};

// Componente de gráfico de pizza para alocação da carteira
export const PortfolioAllocationChart = ({ data }) => {
  const renderLabel = (entry) => {
    return `${entry.ticker}: ${entry.percentage.toFixed(1)}%`;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderLabel}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Valor']} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};


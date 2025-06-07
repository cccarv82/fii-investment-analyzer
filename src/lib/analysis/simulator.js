import { formatCurrency } from '../utils/formatters.js';

// Simulador de aportes e projeções
export class InvestmentSimulator {
  constructor() {
    this.scenarios = {
      conservative: 0.05, // 5% ao ano
      moderate: 0.08,     // 8% ao ano
      optimistic: 0.12    // 12% ao ano
    };
  }

  // Simular aportes mensais
  simulateMonthlyContributions(initialAmount, monthlyContribution, months, annualReturn = 0.08) {
    const monthlyReturn = annualReturn / 12;
    let currentValue = initialAmount;
    const evolution = [];

    for (let month = 0; month <= months; month++) {
      if (month > 0) {
        // Aplicar rendimento
        currentValue *= (1 + monthlyReturn);
        // Adicionar aporte mensal
        currentValue += monthlyContribution;
      }

      evolution.push({
        month: month,
        value: currentValue,
        totalContributed: initialAmount + (monthlyContribution * month),
        totalReturn: currentValue - (initialAmount + (monthlyContribution * month))
      });
    }

    return evolution;
  }

  // Projetar patrimônio em diferentes cenários
  projectPatrimony(initialAmount, monthlyContribution, years = 10) {
    const months = years * 12;
    const projections = [];

    for (let year = 0; year <= years; year++) {
      const monthsElapsed = year * 12;
      
      const conservative = this.calculateFutureValue(
        initialAmount, 
        monthlyContribution, 
        monthsElapsed, 
        this.scenarios.conservative
      );
      
      const moderate = this.calculateFutureValue(
        initialAmount, 
        monthlyContribution, 
        monthsElapsed, 
        this.scenarios.moderate
      );
      
      const optimistic = this.calculateFutureValue(
        initialAmount, 
        monthlyContribution, 
        monthsElapsed, 
        this.scenarios.optimistic
      );

      projections.push({
        year: year,
        conservative: conservative,
        moderate: moderate,
        optimistic: optimistic
      });
    }

    return projections;
  }

  // Calcular valor futuro com aportes mensais
  calculateFutureValue(initialAmount, monthlyContribution, months, annualReturn) {
    const monthlyReturn = annualReturn / 12;
    let futureValue = initialAmount;

    for (let month = 0; month < months; month++) {
      futureValue *= (1 + monthlyReturn);
      futureValue += monthlyContribution;
    }

    return futureValue;
  }

  // Simular evolução de dividendos
  simulateDividendEvolution(portfolio, months = 12) {
    const evolution = [];
    let accumulatedDividends = 0;

    for (let month = 1; month <= months; month++) {
      // Calcular dividendos mensais baseado no yield da carteira
      const monthlyDividends = portfolio.reduce((total, position) => {
        const monthlyYield = (position.dividendYield || 6) / 100 / 12;
        return total + (position.totalInvested * monthlyYield);
      }, 0);

      accumulatedDividends += monthlyDividends;

      evolution.push({
        month: `${month.toString().padStart(2, '0')}/2025`,
        dividends: monthlyDividends,
        accumulated: accumulatedDividends
      });
    }

    return evolution;
  }

  // Calcular métricas de performance
  calculatePerformanceMetrics(portfolio, totalInvested, currentValue, totalDividends) {
    const totalReturn = (currentValue - totalInvested) + totalDividends;
    const totalReturnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;
    const annualizedReturn = this.calculateAnnualizedReturn(totalReturnPercentage, 1); // Assumindo 1 ano
    const sharpeRatio = this.calculateSharpeRatio(annualizedReturn, 0.1); // Risk-free rate 10%
    const volatility = this.estimateVolatility(portfolio);

    return {
      totalReturn,
      totalReturnPercentage,
      annualizedReturn,
      sharpeRatio,
      volatility,
      maxDrawdown: this.estimateMaxDrawdown(portfolio),
      beta: this.estimateBeta(portfolio),
      alpha: this.estimateAlpha(annualizedReturn, 0.08) // Benchmark 8%
    };
  }

  // Calcular retorno anualizado
  calculateAnnualizedReturn(totalReturn, years) {
    return Math.pow(1 + (totalReturn / 100), 1 / years) - 1;
  }

  // Calcular Sharpe Ratio
  calculateSharpeRatio(portfolioReturn, riskFreeRate) {
    const excessReturn = portfolioReturn - riskFreeRate;
    const volatility = 0.15; // Estimativa de volatilidade para FIIs
    return excessReturn / volatility;
  }

  // Estimar volatilidade da carteira
  estimateVolatility(portfolio) {
    // Volatilidade estimada baseada no setor
    const sectorVolatility = {
      'Logística': 0.12,
      'Shoppings': 0.18,
      'Lajes Corporativas': 0.15,
      'Híbrido': 0.14,
      'Recebíveis': 0.10,
      'Residencial': 0.16
    };

    const weightedVolatility = portfolio.reduce((total, position) => {
      const weight = position.percentage / 100;
      const volatility = sectorVolatility[position.sector] || 0.15;
      return total + (weight * volatility);
    }, 0);

    return weightedVolatility;
  }

  // Estimar máximo drawdown
  estimateMaxDrawdown(portfolio) {
    // Estimativa baseada na diversificação
    const diversificationScore = Math.min(portfolio.length * 15, 100);
    const baseDrawdown = 0.25; // 25% base
    const diversificationBonus = (diversificationScore / 100) * 0.1;
    return Math.max(baseDrawdown - diversificationBonus, 0.10);
  }

  // Estimar Beta da carteira
  estimateBeta(portfolio) {
    // Beta estimado baseado no setor
    const sectorBeta = {
      'Logística': 1.2,
      'Shoppings': 1.1,
      'Lajes Corporativas': 0.9,
      'Híbrido': 1.0,
      'Recebíveis': 0.7,
      'Residencial': 1.1
    };

    const weightedBeta = portfolio.reduce((total, position) => {
      const weight = position.percentage / 100;
      const beta = sectorBeta[position.sector] || 1.0;
      return total + (weight * beta);
    }, 0);

    return weightedBeta;
  }

  // Estimar Alpha
  estimateAlpha(portfolioReturn, benchmarkReturn) {
    return portfolioReturn - benchmarkReturn;
  }

  // Simular rebalanceamento da carteira
  simulateRebalancing(portfolio, targetAllocations) {
    const totalValue = portfolio.reduce((sum, position) => sum + position.totalInvested, 0);
    const rebalancedPortfolio = [];
    const transactions = [];

    targetAllocations.forEach(target => {
      const currentPosition = portfolio.find(p => p.ticker === target.ticker);
      const targetValue = totalValue * (target.percentage / 100);
      const currentValue = currentPosition ? currentPosition.totalInvested : 0;
      const difference = targetValue - currentValue;

      if (Math.abs(difference) > 100) { // Só rebalancear se diferença > R$ 100
        transactions.push({
          ticker: target.ticker,
          action: difference > 0 ? 'COMPRAR' : 'VENDER',
          amount: Math.abs(difference),
          currentAllocation: currentValue / totalValue * 100,
          targetAllocation: target.percentage,
          difference: difference
        });
      }

      rebalancedPortfolio.push({
        ticker: target.ticker,
        currentValue: currentValue,
        targetValue: targetValue,
        newValue: targetValue,
        currentPercentage: currentValue / totalValue * 100,
        targetPercentage: target.percentage
      });
    });

    return {
      rebalancedPortfolio,
      transactions,
      totalTransactionCost: transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)
    };
  }

  // Calcular eficiência fiscal
  calculateTaxEfficiency(portfolio, holdingPeriod) {
    // FIIs são isentos de IR para pessoa física em dividendos
    // Ganho de capital tem alíquota de 20%
    const taxRate = 0.20;
    
    const taxEfficiency = portfolio.map(position => {
      const capitalGain = position.currentValue - position.totalInvested;
      const taxOnGain = capitalGain > 0 ? capitalGain * taxRate : 0;
      const netGain = capitalGain - taxOnGain;
      
      return {
        ticker: position.ticker,
        capitalGain,
        taxOnGain,
        netGain,
        taxEfficiency: capitalGain > 0 ? (netGain / capitalGain) * 100 : 100
      };
    });

    return taxEfficiency;
  }
}

// Instância global
export const investmentSimulator = new InvestmentSimulator();


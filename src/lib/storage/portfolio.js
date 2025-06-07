import { localStorage, indexedDB } from './database.js';
import { formatCurrency } from '../utils/formatters.js';

// Gerenciador de carteira de investimentos
class PortfolioManager {
  constructor() {
    this.portfolio = [];
    this.dividends = [];
    this.contributions = [];
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    
    try {
      await indexedDB.init();
      await this.loadData();
      this.initialized = true;
    } catch (error) {
      console.error('Erro ao inicializar PortfolioManager:', error);
    }
  }

  async loadData() {
    try {
      this.portfolio = await indexedDB.getAll('portfolio') || [];
      this.dividends = await indexedDB.getAll('dividends') || [];
      this.contributions = await indexedDB.getAll('contributions') || [];
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  }

  // Adicionar investimento à carteira
  async addInvestment(investment) {
    if (!this.initialized) await this.init();

    const portfolioItem = {
      ticker: investment.ticker,
      name: investment.name || investment.ticker,
      shares: investment.shares,
      price: investment.price,
      totalValue: investment.shares * investment.price,
      date: new Date().toISOString(),
      sector: investment.sector || 'N/A',
      type: 'buy'
    };

    try {
      const id = await indexedDB.add('portfolio', portfolioItem);
      portfolioItem.id = id;
      this.portfolio.push(portfolioItem);

      // Registrar aporte
      await this.addContribution(portfolioItem.totalValue, 'investment', investment.ticker);

      return portfolioItem;
    } catch (error) {
      console.error('Erro ao adicionar investimento:', error);
      throw error;
    }
  }

  // Adicionar aporte
  async addContribution(amount, type = 'deposit', ticker = null) {
    if (!this.initialized) await this.init();

    const contribution = {
      amount,
      type, // 'deposit', 'investment', 'dividend'
      ticker,
      date: new Date().toISOString(),
      description: type === 'investment' ? `Compra de ${ticker}` : 
                  type === 'dividend' ? `Dividendo de ${ticker}` : 'Aporte'
    };

    try {
      const id = await indexedDB.add('contributions', contribution);
      contribution.id = id;
      this.contributions.push(contribution);
      return contribution;
    } catch (error) {
      console.error('Erro ao adicionar aporte:', error);
      throw error;
    }
  }

  // Adicionar dividendo
  async addDividend(dividend) {
    if (!this.initialized) await this.init();

    const dividendItem = {
      ticker: dividend.ticker,
      amount: dividend.amount,
      date: dividend.date || new Date().toISOString(),
      type: dividend.type || 'dividend',
      description: dividend.description || `Dividendo ${dividend.ticker}`
    };

    try {
      const id = await indexedDB.add('dividends', dividendItem);
      dividendItem.id = id;
      this.dividends.push(dividendItem);

      // Registrar como aporte
      await this.addContribution(dividend.amount, 'dividend', dividend.ticker);

      return dividendItem;
    } catch (error) {
      console.error('Erro ao adicionar dividendo:', error);
      throw error;
    }
  }

  // Obter posições consolidadas
  getConsolidatedPositions() {
    const positions = {};

    this.portfolio.forEach(item => {
      if (!positions[item.ticker]) {
        positions[item.ticker] = {
          ticker: item.ticker,
          name: item.name,
          sector: item.sector,
          totalShares: 0,
          totalInvested: 0,
          averagePrice: 0,
          currentValue: 0,
          transactions: []
        };
      }

      const position = positions[item.ticker];
      
      if (item.type === 'buy') {
        position.totalShares += item.shares;
        position.totalInvested += item.totalValue;
        position.transactions.push(item);
      } else if (item.type === 'sell') {
        position.totalShares -= item.shares;
        position.totalInvested -= item.totalValue;
        position.transactions.push(item);
      }
    });

    // Calcular preço médio
    Object.values(positions).forEach(position => {
      if (position.totalShares > 0) {
        position.averagePrice = position.totalInvested / position.totalShares;
      }
    });

    return Object.values(positions).filter(p => p.totalShares > 0);
  }

  // Obter dividendos por ticker
  getDividendsByTicker(ticker) {
    return this.dividends.filter(d => d.ticker === ticker);
  }

  // Obter total de dividendos
  getTotalDividends(ticker = null) {
    const dividends = ticker ? 
      this.dividends.filter(d => d.ticker === ticker) : 
      this.dividends;
    
    return dividends.reduce((total, d) => total + d.amount, 0);
  }

  // Obter total investido
  getTotalInvested() {
    return this.contributions
      .filter(c => c.type === 'investment')
      .reduce((total, c) => total + c.amount, 0);
  }

  // Obter valor atual da carteira (simulado)
  getCurrentValue() {
    const positions = this.getConsolidatedPositions();
    // Simular valorização de 5%
    return positions.reduce((total, p) => total + (p.totalInvested * 1.05), 0);
  }

  // Obter rendimento mensal médio
  getMonthlyYield() {
    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    
    const recentDividends = this.dividends.filter(d => 
      new Date(d.date) >= threeMonthsAgo
    );

    const totalDividends = recentDividends.reduce((total, d) => total + d.amount, 0);
    return totalDividends / 3; // Média mensal
  }

  // Obter estatísticas da carteira
  getPortfolioStats() {
    const positions = this.getConsolidatedPositions();
    const totalInvested = this.getTotalInvested();
    const currentValue = this.getCurrentValue();
    const totalDividends = this.getTotalDividends();
    const monthlyYield = this.getMonthlyYield();

    return {
      totalInvested,
      currentValue,
      totalDividends,
      monthlyYield,
      performance: totalInvested > 0 ? ((currentValue - totalInvested) / totalInvested) * 100 : 0,
      yieldOnCost: totalInvested > 0 ? (totalDividends / totalInvested) * 100 : 0,
      diversification: positions.length,
      positions: positions.slice(0, 5), // Top 5 posições
      recentDividends: this.dividends
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5)
    };
  }

  // Exportar dados
  async exportData() {
    if (!this.initialized) await this.init();

    return {
      portfolio: this.portfolio,
      dividends: this.dividends,
      contributions: this.contributions,
      exportDate: new Date().toISOString()
    };
  }

  // Importar dados
  async importData(data) {
    if (!this.initialized) await this.init();

    try {
      // Limpar dados existentes
      await this.clearAllData();

      // Importar novos dados
      for (const item of data.portfolio || []) {
        await indexedDB.add('portfolio', item);
      }

      for (const item of data.dividends || []) {
        await indexedDB.add('dividends', item);
      }

      for (const item of data.contributions || []) {
        await indexedDB.add('contributions', item);
      }

      // Recarregar dados
      await this.loadData();

      return true;
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      throw error;
    }
  }

  // Limpar todos os dados
  async clearAllData() {
    if (!this.initialized) await this.init();

    try {
      // Limpar IndexedDB
      const portfolioItems = await indexedDB.getAll('portfolio');
      for (const item of portfolioItems) {
        await indexedDB.delete('portfolio', item.id);
      }

      const dividendItems = await indexedDB.getAll('dividends');
      for (const item of dividendItems) {
        await indexedDB.delete('dividends', item.id);
      }

      const contributionItems = await indexedDB.getAll('contributions');
      for (const item of contributionItems) {
        await indexedDB.delete('contributions', item.id);
      }

      // Limpar arrays locais
      this.portfolio = [];
      this.dividends = [];
      this.contributions = [];

      return true;
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
      throw error;
    }
  }
}

// Instância global
export const portfolioManager = new PortfolioManager();


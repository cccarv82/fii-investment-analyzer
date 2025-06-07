// Gerenciador de carteira de investimentos com IndexedDB nativo
class PortfolioManager {
  constructor() {
    this.portfolio = [];
    this.dividends = [];
    this.contributions = [];
    this.initialized = false;
    this.db = null;
    this.dbName = "FIIPortfolioDB";
    this.dbVersion = 1;
  }

  async init() {
    if (this.initialized) return;

    try {
      await this.initIndexedDB();
      await this.loadData();
      this.initialized = true;
      console.log("PortfolioManager inicializado com sucesso");
    } catch (error) {
      console.error("Erro ao inicializar PortfolioManager:", error);
      throw error;
    }
  }

  async initIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        reject(new Error("Erro ao abrir IndexedDB"));
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Criar object stores
        if (!db.objectStoreNames.contains("portfolio")) {
          const portfolioStore = db.createObjectStore("portfolio", {
            keyPath: "id",
            autoIncrement: true,
          });
          portfolioStore.createIndex("ticker", "ticker", { unique: false });
          portfolioStore.createIndex("date", "date", { unique: false });
        }

        if (!db.objectStoreNames.contains("dividends")) {
          const dividendsStore = db.createObjectStore("dividends", {
            keyPath: "id",
            autoIncrement: true,
          });
          dividendsStore.createIndex("ticker", "ticker", { unique: false });
          dividendsStore.createIndex("date", "date", { unique: false });
        }

        if (!db.objectStoreNames.contains("contributions")) {
          const contributionsStore = db.createObjectStore("contributions", {
            keyPath: "id",
            autoIncrement: true,
          });
          contributionsStore.createIndex("type", "type", { unique: false });
          contributionsStore.createIndex("date", "date", { unique: false });
        }
      };
    });
  }

  async loadData() {
    try {
      this.portfolio = await this.getAllFromStore("portfolio");
      this.dividends = await this.getAllFromStore("dividends");
      this.contributions = await this.getAllFromStore("contributions");
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      this.portfolio = [];
      this.dividends = [];
      this.contributions = [];
    }
  }

  async getAllFromStore(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(new Error(`Erro ao buscar dados de ${storeName}`));
      };
    });
  }

  async addToStore(storeName, data) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.add(data);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(new Error(`Erro ao adicionar dados em ${storeName}`));
      };
    });
  }

  async deleteFromStore(storeName, id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error(`Erro ao deletar dados de ${storeName}`));
      };
    });
  }

  async clearStore(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error(`Erro ao limpar ${storeName}`));
      };
    });
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
      sector: investment.sector || "N/A",
      type: "buy",
    };

    try {
      const id = await this.addToStore("portfolio", portfolioItem);
      portfolioItem.id = id;
      this.portfolio.push(portfolioItem);

      // Registrar aporte
      await this.addContribution(
        portfolioItem.totalValue,
        "investment",
        investment.ticker
      );

      return portfolioItem;
    } catch (error) {
      console.error("Erro ao adicionar investimento:", error);
      throw error;
    }
  }

  // Adicionar aporte
  async addContribution(amount, type = "deposit", ticker = null) {
    if (!this.initialized) await this.init();

    const contribution = {
      amount,
      type, // 'deposit', 'investment', 'dividend'
      ticker,
      date: new Date().toISOString(),
      description:
        type === "investment"
          ? `Compra de ${ticker}`
          : type === "dividend"
          ? `Dividendo de ${ticker}`
          : "Aporte",
    };

    try {
      const id = await this.addToStore("contributions", contribution);
      contribution.id = id;
      this.contributions.push(contribution);
      return contribution;
    } catch (error) {
      console.error("Erro ao adicionar aporte:", error);
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
      type: dividend.type || "dividend",
      description: dividend.description || `Dividendo ${dividend.ticker}`,
    };

    try {
      const id = await this.addToStore("dividends", dividendItem);
      dividendItem.id = id;
      this.dividends.push(dividendItem);

      // Registrar como aporte
      await this.addContribution(dividend.amount, "dividend", dividend.ticker);

      return dividendItem;
    } catch (error) {
      console.error("Erro ao adicionar dividendo:", error);
      throw error;
    }
  }

  // Obter posições consolidadas
  getConsolidatedPositions() {
    const positions = {};

    this.portfolio.forEach((item) => {
      if (!positions[item.ticker]) {
        positions[item.ticker] = {
          ticker: item.ticker,
          name: item.name,
          sector: item.sector,
          totalShares: 0,
          totalInvested: 0,
          averagePrice: 0,
          currentValue: 0,
          transactions: [],
        };
      }

      const position = positions[item.ticker];

      if (item.type === "buy") {
        position.totalShares += item.shares;
        position.totalInvested += item.totalValue;
        position.transactions.push(item);
      } else if (item.type === "sell") {
        position.totalShares -= item.shares;
        position.totalInvested -= item.totalValue;
        position.transactions.push(item);
      }
    });

    // Calcular preço médio
    Object.values(positions).forEach((position) => {
      if (position.totalShares > 0) {
        position.averagePrice = position.totalInvested / position.totalShares;
        // Simular valor atual (5% de valorização)
        position.currentValue = position.totalInvested * 1.05;
      }
    });

    return Object.values(positions).filter((p) => p.totalShares > 0);
  }

  // Obter dividendos por ticker
  getDividendsByTicker(ticker) {
    return this.dividends.filter((d) => d.ticker === ticker);
  }

  // Obter total de dividendos
  getTotalDividends(ticker = null) {
    const dividends = ticker
      ? this.dividends.filter((d) => d.ticker === ticker)
      : this.dividends;

    return dividends.reduce((total, d) => total + d.amount, 0);
  }

  // Obter total investido
  getTotalInvested() {
    return this.contributions
      .filter((c) => c.type === "investment")
      .reduce((total, c) => total + c.amount, 0);
  }

  // Obter valor atual da carteira
  getCurrentValue() {
    const positions = this.getConsolidatedPositions();
    return positions.reduce((total, p) => total + p.currentValue, 0);
  }

  // Obter rendimento mensal médio
  getMonthlyYield() {
    const now = new Date();
    const threeMonthsAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 3,
      now.getDate()
    );

    const recentDividends = this.dividends.filter(
      (d) => new Date(d.date) >= threeMonthsAgo
    );

    const totalDividends = recentDividends.reduce(
      (total, d) => total + d.amount,
      0
    );
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
      performance:
        totalInvested > 0
          ? ((currentValue - totalInvested) / totalInvested) * 100
          : 0,
      yieldOnCost:
        totalInvested > 0 ? (totalDividends / totalInvested) * 100 : 0,
      diversification: positions.length,
      positions: positions.slice(0, 5), // Top 5 posições
      recentDividends: this.dividends
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5),
    };
  }

  // Exportar dados
  async exportData() {
    if (!this.initialized) await this.init();

    return {
      portfolio: this.portfolio,
      dividends: this.dividends,
      contributions: this.contributions,
      exportDate: new Date().toISOString(),
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
        delete item.id; // Remove ID para auto-increment
        await this.addToStore("portfolio", item);
      }

      for (const item of data.dividends || []) {
        delete item.id;
        await this.addToStore("dividends", item);
      }

      for (const item of data.contributions || []) {
        delete item.id;
        await this.addToStore("contributions", item);
      }

      // Recarregar dados
      await this.loadData();

      return true;
    } catch (error) {
      console.error("Erro ao importar dados:", error);
      throw error;
    }
  }

  // Limpar todos os dados
  async clearAllData() {
    if (!this.initialized) await this.init();

    try {
      await this.clearStore("portfolio");
      await this.clearStore("dividends");
      await this.clearStore("contributions");

      // Limpar arrays locais
      this.portfolio = [];
      this.dividends = [];
      this.contributions = [];

      return true;
    } catch (error) {
      console.error("Erro ao limpar dados:", error);
      throw error;
    }
  }
}

// Instância global
export const portfolioManager = new PortfolioManager();

// Utilitários de formatação
export const formatCurrency = (value) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

export const formatPercentage = (value) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
};

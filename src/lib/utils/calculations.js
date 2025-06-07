// Cálculos financeiros para análise de FIIs

// Cálculo de Dividend Yield
export const calculateDividendYield = (dividendPerShare, pricePerShare) => {
  if (pricePerShare <= 0) return 0;
  return (dividendPerShare / pricePerShare) * 100;
};

// Cálculo de P/VP (Preço sobre Valor Patrimonial)
export const calculatePVP = (marketPrice, bookValuePerShare) => {
  if (bookValuePerShare <= 0) return 0;
  return marketPrice / bookValuePerShare;
};

// Cálculo de FFO Yield (Funds From Operations)
export const calculateFFOYield = (ffoPerShare, pricePerShare) => {
  if (pricePerShare <= 0) return 0;
  return (ffoPerShare / pricePerShare) * 100;
};

// Cálculo de Cap Rate (Taxa de Capitalização)
export const calculateCapRate = (netOperatingIncome, propertyValue) => {
  if (propertyValue <= 0) return 0;
  return (netOperatingIncome / propertyValue) * 100;
};

// Cálculo de Liquidez Média Diária
export const calculateAverageLiquidity = (volumes, days = 30) => {
  if (!volumes || volumes.length === 0) return 0;
  const recentVolumes = volumes.slice(-days);
  return recentVolumes.reduce((sum, vol) => sum + vol, 0) / recentVolumes.length;
};

// Cálculo de Performance da Carteira
export const calculatePortfolioPerformance = (assets) => {
  let totalInvested = 0;
  let totalCurrent = 0;
  let totalDividends = 0;

  assets.forEach(asset => {
    const invested = asset.quantity * asset.averagePrice;
    const current = asset.quantity * asset.currentPrice;
    
    totalInvested += invested;
    totalCurrent += current;
    totalDividends += asset.dividendsReceived || 0;
  });

  const capitalGain = totalCurrent - totalInvested;
  const totalReturn = capitalGain + totalDividends;
  const returnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

  return {
    totalInvested,
    totalCurrent,
    totalDividends,
    capitalGain,
    totalReturn,
    returnPercentage,
    dividendYield: totalInvested > 0 ? (totalDividends / totalInvested) * 100 : 0
  };
};

// Cálculo de Diversificação por Setor
export const calculateSectorDiversification = (assets, fiisData) => {
  const sectorAllocation = {};
  let totalValue = 0;

  assets.forEach(asset => {
    const fiiData = fiisData.find(fii => fii.ticker === asset.ticker);
    if (fiiData) {
      const value = asset.quantity * asset.currentPrice;
      const sector = fiiData.sector || 'Outros';
      
      sectorAllocation[sector] = (sectorAllocation[sector] || 0) + value;
      totalValue += value;
    }
  });

  // Converter para percentuais
  Object.keys(sectorAllocation).forEach(sector => {
    sectorAllocation[sector] = totalValue > 0 ? 
      (sectorAllocation[sector] / totalValue) * 100 : 0;
  });

  return sectorAllocation;
};

// Cálculo de Score de Concentração (Índice Herfindahl-Hirschman)
export const calculateConcentrationScore = (assets) => {
  const totalValue = assets.reduce((sum, asset) => 
    sum + (asset.quantity * asset.currentPrice), 0);

  if (totalValue === 0) return 0;

  const hhi = assets.reduce((sum, asset) => {
    const weight = (asset.quantity * asset.currentPrice) / totalValue;
    return sum + (weight * weight);
  }, 0);

  // Converter para escala 0-100 (0 = máxima diversificação, 100 = máxima concentração)
  return hhi * 100;
};

// Cálculo de Risco da Carteira (Volatilidade)
export const calculatePortfolioRisk = (assets, historicalData, days = 252) => {
  if (!historicalData || assets.length === 0) return 0;

  const weights = {};
  const totalValue = assets.reduce((sum, asset) => 
    sum + (asset.quantity * asset.currentPrice), 0);

  // Calcular pesos dos ativos
  assets.forEach(asset => {
    weights[asset.ticker] = totalValue > 0 ? 
      (asset.quantity * asset.currentPrice) / totalValue : 0;
  });

  // Calcular retornos diários
  const returns = {};
  Object.keys(weights).forEach(ticker => {
    const prices = historicalData[ticker] || [];
    if (prices.length > 1) {
      returns[ticker] = prices.slice(1).map((price, i) => 
        Math.log(price / prices[i]));
    }
  });

  // Calcular volatilidade da carteira (simplificado)
  const portfolioReturns = [];
  const minLength = Math.min(...Object.values(returns).map(r => r.length));

  for (let i = 0; i < minLength; i++) {
    let portfolioReturn = 0;
    Object.keys(weights).forEach(ticker => {
      if (returns[ticker] && returns[ticker][i] !== undefined) {
        portfolioReturn += weights[ticker] * returns[ticker][i];
      }
    });
    portfolioReturns.push(portfolioReturn);
  }

  if (portfolioReturns.length === 0) return 0;

  // Calcular desvio padrão anualizado
  const mean = portfolioReturns.reduce((sum, ret) => sum + ret, 0) / portfolioReturns.length;
  const variance = portfolioReturns.reduce((sum, ret) => 
    sum + Math.pow(ret - mean, 2), 0) / portfolioReturns.length;
  
  return Math.sqrt(variance * days) * 100; // Volatilidade anualizada em %
};

// Cálculo de Sharpe Ratio
export const calculateSharpeRatio = (portfolioReturn, riskFreeRate, portfolioVolatility) => {
  if (portfolioVolatility === 0) return 0;
  return (portfolioReturn - riskFreeRate) / portfolioVolatility;
};

// Cálculo de Rebalanceamento Sugerido
export const calculateRebalancing = (currentAssets, targetAllocations, totalValue) => {
  const suggestions = [];

  Object.keys(targetAllocations).forEach(ticker => {
    const targetValue = totalValue * (targetAllocations[ticker] / 100);
    const currentAsset = currentAssets.find(asset => asset.ticker === ticker);
    const currentValue = currentAsset ? 
      currentAsset.quantity * currentAsset.currentPrice : 0;
    
    const difference = targetValue - currentValue;
    const action = difference > 0 ? 'comprar' : difference < 0 ? 'vender' : 'manter';
    
    if (Math.abs(difference) > totalValue * 0.01) { // Só sugerir se diferença > 1%
      suggestions.push({
        ticker,
        action,
        amount: Math.abs(difference),
        currentAllocation: totalValue > 0 ? (currentValue / totalValue) * 100 : 0,
        targetAllocation: targetAllocations[ticker],
        priority: Math.abs(difference) / totalValue // Prioridade baseada na diferença
      });
    }
  });

  return suggestions.sort((a, b) => b.priority - a.priority);
};

// Cálculo de Projeção de Dividendos
export const calculateDividendProjection = (assets, fiisData, months = 12) => {
  let monthlyProjection = 0;

  assets.forEach(asset => {
    const fiiData = fiisData.find(fii => fii.ticker === asset.ticker);
    if (fiiData && fiiData.dividendYield) {
      const currentValue = asset.quantity * asset.currentPrice;
      const annualDividends = currentValue * (fiiData.dividendYield / 100);
      monthlyProjection += annualDividends / 12;
    }
  });

  return {
    monthly: monthlyProjection,
    annual: monthlyProjection * 12,
    projected: monthlyProjection * months
  };
};

// Cálculo de Score de Qualidade do FII
export const calculateQualityScore = (fiiData) => {
  let score = 0;
  let factors = 0;

  // Dividend Yield (peso 25%)
  if (fiiData.dividendYield !== undefined) {
    if (fiiData.dividendYield >= 8) score += 25;
    else if (fiiData.dividendYield >= 6) score += 20;
    else if (fiiData.dividendYield >= 4) score += 15;
    else score += 10;
    factors++;
  }

  // P/VP (peso 20%)
  if (fiiData.pvp !== undefined) {
    if (fiiData.pvp <= 0.8) score += 20;
    else if (fiiData.pvp <= 1.0) score += 15;
    else if (fiiData.pvp <= 1.2) score += 10;
    else score += 5;
    factors++;
  }

  // Liquidez (peso 20%)
  if (fiiData.liquidez !== undefined) {
    if (fiiData.liquidez >= 1000000) score += 20;
    else if (fiiData.liquidez >= 500000) score += 15;
    else if (fiiData.liquidez >= 100000) score += 10;
    else score += 5;
    factors++;
  }

  // Patrimônio (peso 15%)
  if (fiiData.patrimonio !== undefined) {
    if (fiiData.patrimonio >= 1000000000) score += 15; // > 1B
    else if (fiiData.patrimonio >= 500000000) score += 12; // > 500M
    else if (fiiData.patrimonio >= 100000000) score += 8; // > 100M
    else score += 5;
    factors++;
  }

  // Vacância (peso 10%) - se disponível
  if (fiiData.vacancyRate !== undefined) {
    if (fiiData.vacancyRate <= 5) score += 10;
    else if (fiiData.vacancyRate <= 10) score += 7;
    else if (fiiData.vacancyRate <= 15) score += 5;
    else score += 2;
    factors++;
  }

  // Crescimento de dividendos (peso 10%) - se disponível
  if (fiiData.dividendGrowth !== undefined) {
    if (fiiData.dividendGrowth >= 10) score += 10;
    else if (fiiData.dividendGrowth >= 5) score += 7;
    else if (fiiData.dividendGrowth >= 0) score += 5;
    else score += 2;
    factors++;
  }

  return factors > 0 ? score / factors : 0;
};


import React, { createContext, useContext, useState, useEffect } from "react";
import { supabaseStorage } from "../lib/storage/supabaseStorage";
import { useAuth } from "./AuthContext";
import { useAI } from "./AIContext";

// 🎯 Contexto do Portfolio integrado com Supabase + BRAPI
const PortfolioContext = createContext();

// 🔔 Sistema de notificações simples (sem toast)
const showNotification = (message, type = "info") => {
  const notification = document.createElement("div");
  notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white max-w-sm transition-all duration-300 ${
    type === "success"
      ? "bg-green-600"
      : type === "error"
      ? "bg-red-600"
      : type === "warning"
      ? "bg-yellow-600"
      : "bg-blue-600"
  }`;
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.style.opacity = "0";
    notification.style.transform = "translateY(-20px)";
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 4000);
};

// 🚀 FUNÇÃO PARA BUSCAR PREÇOS REAIS DA BRAPI
const fetchRealPrices = async (tickers, brapiToken) => {
  try {
    if (!brapiToken) {
      console.warn("⚠️ BRAPI token não disponível para buscar preços reais");
      return {};
    }

    console.log("🔄 Buscando preços reais da BRAPI para:", tickers);

    const tickersString = tickers.join(",");
    const url = `https://brapi.dev/api/quote/${tickersString}?token=${brapiToken}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Erro na BRAPI: ${response.status}`);
    }

    const data = await response.json();
    console.log("📊 Dados da BRAPI recebidos:", data);

    const prices = {};
    if (data.results && Array.isArray(data.results)) {
      data.results.forEach((stock) => {
        if (stock.symbol && stock.regularMarketPrice) {
          prices[stock.symbol] = stock.regularMarketPrice;
          console.log(`💰 ${stock.symbol}: R$ ${stock.regularMarketPrice}`);
        }
      });
    }

    return prices;
  } catch (error) {
    console.error("❌ Erro ao buscar preços da BRAPI:", error);
    return {};
  }
};

export const PortfolioProvider = ({ children }) => {
  const [portfolios, setPortfolios] = useState([]);
  const [currentPortfolio, setCurrentPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, isUserAuthorized } = useAuth();
  const { getBrapiToken } = useAI();

  // 🔄 Carregar dados quando usuário fizer login
  useEffect(() => {
    if (isUserAuthorized() && user) {
      supabaseStorage.setUserId(user.id);
      loadPortfolios();
    } else {
      setPortfolios([]);
      setCurrentPortfolio(null);
      setLoading(false);
    }
  }, [user, isUserAuthorized]);

  // 📊 Carregar todas as carteiras
  const loadPortfolios = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("🔄 Carregando carteiras do Supabase...");

      const data = await supabaseStorage.getPortfolios();
      console.log("📊 Carteiras carregadas:", data);

      setPortfolios(data || []);

      if (data && data.length > 0 && !currentPortfolio) {
        const portfolioWithRealPrices = await updatePortfolioWithRealPrices(
          data[0]
        );
        setCurrentPortfolio(portfolioWithRealPrices);
        console.log(
          "✅ Carteira padrão selecionada com preços reais:",
          portfolioWithRealPrices
        );
      } else if (!data || data.length === 0) {
        console.log("📝 Nenhuma carteira encontrada - estado vazio");
        setCurrentPortfolio(null);
      }
    } catch (error) {
      console.error("❌ Erro ao carregar carteiras:", error);
      setError(error.message);
      showNotification("Erro ao carregar carteiras", "error");
      setPortfolios([]);
      setCurrentPortfolio(null);
    } finally {
      setLoading(false);
      console.log("✅ Loading finalizado");
    }
  };

  // 🚀 ATUALIZAR CARTEIRA COM PREÇOS REAIS
  const updatePortfolioWithRealPrices = async (portfolio) => {
    try {
      if (!portfolio.investments || portfolio.investments.length === 0) {
        return portfolio;
      }

      const brapiToken = getBrapiToken();
      if (!brapiToken) {
        console.warn("⚠️ BRAPI token não disponível - usando preços salvos");
        return portfolio;
      }

      const tickers = portfolio.investments
        .filter((inv) => inv.is_active)
        .map((inv) => inv.ticker);

      if (tickers.length === 0) {
        return portfolio;
      }

      console.log("🔄 Atualizando preços reais para:", tickers);
      const realPrices = await fetchRealPrices(tickers, brapiToken);

      // Atualizar investments com preços reais
      const updatedInvestments = portfolio.investments.map((investment) => {
        const realPrice = realPrices[investment.ticker];
        if (realPrice && realPrice > 0) {
          const newCurrentValue = investment.shares * realPrice;
          console.log(
            `📈 ${investment.ticker}: ${investment.shares} cotas × R$ ${realPrice} = R$ ${newCurrentValue}`
          );

          return {
            ...investment,
            current_price: realPrice,
            current_value: newCurrentValue,
          };
        }
        return investment;
      });

      return {
        ...portfolio,
        investments: updatedInvestments,
      };
    } catch (error) {
      console.error("❌ Erro ao atualizar preços reais:", error);
      return portfolio;
    }
  };

  // 🔄 Atualizar preços da carteira atual
  const refreshCurrentPortfolioPrices = async () => {
    if (!currentPortfolio) return;

    try {
      console.log("🔄 Atualizando preços da carteira atual...");
      const updatedPortfolio = await updatePortfolioWithRealPrices(
        currentPortfolio
      );
      setCurrentPortfolio(updatedPortfolio);
      showNotification("Preços atualizados!", "success");
    } catch (error) {
      console.error("❌ Erro ao atualizar preços:", error);
      showNotification("Erro ao atualizar preços", "error");
    }
  };

  // 🆕 Criar nova carteira
  const createPortfolio = async (portfolioData) => {
    try {
      console.log("🆕 Criando nova carteira:", portfolioData);
      const newPortfolio = await supabaseStorage.createPortfolio(portfolioData);
      setPortfolios((prev) => [newPortfolio, ...prev]);
      setCurrentPortfolio(newPortfolio);
      showNotification("Carteira criada com sucesso!", "success");
      console.log("✅ Carteira criada:", newPortfolio);
      return newPortfolio;
    } catch (error) {
      console.error("❌ Erro ao criar carteira:", error);
      showNotification("Erro ao criar carteira", "error");
      throw error;
    }
  };

  // ✏️ Atualizar carteira
  const updatePortfolio = async (portfolioId, updates) => {
    try {
      const updatedPortfolio = await supabaseStorage.updatePortfolio(
        portfolioId,
        updates
      );
      setPortfolios((prev) =>
        prev.map((p) => (p.id === portfolioId ? updatedPortfolio : p))
      );
      if (currentPortfolio?.id === portfolioId) {
        setCurrentPortfolio(updatedPortfolio);
      }
      showNotification("Carteira atualizada!", "success");
      return updatedPortfolio;
    } catch (error) {
      console.error("Erro ao atualizar carteira:", error);
      showNotification("Erro ao atualizar carteira", "error");
      throw error;
    }
  };

  // 🗑️ Deletar carteira
  const deletePortfolio = async (portfolioId) => {
    try {
      await supabaseStorage.deletePortfolio(portfolioId);
      setPortfolios((prev) => prev.filter((p) => p.id !== portfolioId));
      if (currentPortfolio?.id === portfolioId) {
        const remaining = portfolios.filter((p) => p.id !== portfolioId);
        setCurrentPortfolio(remaining.length > 0 ? remaining[0] : null);
      }
      showNotification("Carteira removida!", "success");
    } catch (error) {
      console.error("Erro ao deletar carteira:", error);
      showNotification("Erro ao deletar carteira", "error");
      throw error;
    }
  };

  // 💰 Adicionar investimento
  const addInvestment = async (investmentData) => {
    try {
      if (!currentPortfolio) {
        console.log("🆕 Criando carteira padrão para primeiro investimento");
        const defaultPortfolio = await createPortfolio({
          name: "Minha Carteira",
          description: "Carteira principal",
        });
        await supabaseStorage.addInvestment(
          defaultPortfolio.id,
          investmentData
        );
      } else {
        await supabaseStorage.addInvestment(
          currentPortfolio.id,
          investmentData
        );
      }

      // Recarregar carteiras para atualizar totais
      await loadPortfolios();
      showNotification(
        `${investmentData.ticker} adicionado à carteira!`,
        "success"
      );
    } catch (error) {
      console.error("Erro ao adicionar investimento:", error);
      showNotification("Erro ao adicionar investimento", "error");
      throw error;
    }
  };

  // ✏️ Atualizar investimento
  const updateInvestment = async (investmentId, updates) => {
    try {
      await supabaseStorage.updateInvestment(investmentId, updates);
      await loadPortfolios();
      showNotification("Investimento atualizado!", "success");
    } catch (error) {
      console.error("Erro ao atualizar investimento:", error);
      showNotification("Erro ao atualizar investimento", "error");
      throw error;
    }
  };

  // 🗑️ Remover investimento
  const removeInvestment = async (investmentId) => {
    try {
      await supabaseStorage.removeInvestment(investmentId);
      await loadPortfolios();
      showNotification("Investimento removido!", "success");
    } catch (error) {
      console.error("Erro ao remover investimento:", error);
      showNotification("Erro ao remover investimento", "error");
      throw error;
    }
  };

  // 💎 Adicionar dividendo
  const addDividend = async (investmentId, dividendData) => {
    try {
      await supabaseStorage.addDividend(investmentId, dividendData);
      showNotification("Dividendo registrado!", "success");
    } catch (error) {
      console.error("Erro ao adicionar dividendo:", error);
      showNotification("Erro ao registrar dividendo", "error");
      throw error;
    }
  };

  // 📊 Obter dividendos
  const getDividends = async (investmentId) => {
    try {
      return await supabaseStorage.getDividends(investmentId);
    } catch (error) {
      console.error("Erro ao obter dividendos:", error);
      return [];
    }
  };

  // 📈 Obter todos os dividendos do usuário
  const getAllDividends = async () => {
    try {
      return await supabaseStorage.getAllDividends();
    } catch (error) {
      console.error("Erro ao obter todos os dividendos:", error);
      return [];
    }
  };

  // 🔄 Selecionar carteira atual
  const selectPortfolio = async (portfolio) => {
    const portfolioWithRealPrices = await updatePortfolioWithRealPrices(
      portfolio
    );
    setCurrentPortfolio(portfolioWithRealPrices);
  };

  // 📊 Calcular estatísticas da carteira
  const getPortfolioStats = (portfolio = currentPortfolio) => {
    if (!portfolio || !portfolio.investments) {
      return {
        totalInvested: 0,
        currentValue: 0,
        totalReturn: 0,
        returnPercentage: 0,
        totalInvestments: 0,
        averageDY: 0,
        monthlyIncome: 0,
      };
    }

    const activeInvestments = portfolio.investments.filter(
      (inv) => inv.is_active
    );
    const totalInvested = activeInvestments.reduce(
      (sum, inv) => sum + (inv.total_invested || 0),
      0
    );
    const currentValue = activeInvestments.reduce(
      (sum, inv) => sum + (inv.current_value || inv.total_invested || 0),
      0
    );
    const totalReturn = currentValue - totalInvested;
    const returnPercentage =
      totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;
    const averageDY =
      activeInvestments.length > 0
        ? activeInvestments.reduce(
            (sum, inv) => sum + (inv.dividend_yield || 0),
            0
          ) / activeInvestments.length
        : 0;
    const monthlyIncome = (currentValue * averageDY) / 100 / 12;

    return {
      totalInvested,
      currentValue,
      totalReturn,
      returnPercentage,
      totalInvestments: activeInvestments.length,
      averageDY,
      monthlyIncome,
    };
  };

  // 📤 Exportar dados
  const exportData = async () => {
    try {
      const data = {
        portfolios,
        currentPortfolio,
        exportDate: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `portfolio-backup-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showNotification("Dados exportados com sucesso!", "success");
    } catch (error) {
      console.error("Erro ao exportar dados:", error);
      showNotification("Erro ao exportar dados", "error");
    }
  };

  // 📥 Importar dados
  const importData = async (file) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      // TODO: Implementar importação
      showNotification("Importação em desenvolvimento", "warning");
    } catch (error) {
      console.error("Erro ao importar dados:", error);
      showNotification("Erro ao importar dados", "error");
    }
  };

  // 🗑️ Limpar todos os dados
  const clearAllData = async () => {
    if (
      window.confirm(
        "Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita."
      )
    ) {
      try {
        // TODO: Implementar limpeza completa
        showNotification("Limpeza em desenvolvimento", "warning");
      } catch (error) {
        console.error("Erro ao limpar dados:", error);
        showNotification("Erro ao limpar dados", "error");
      }
    }
  };

  // 🧹 Limpar erro
  const clearError = () => {
    setError(null);
  };

  const value = {
    // Estados
    portfolios,
    currentPortfolio,
    loading,
    error,

    // Ações de carteira
    createPortfolio,
    updatePortfolio,
    deletePortfolio,
    selectPortfolio,
    loadPortfolios,

    // Ações de investimento
    addInvestment,
    updateInvestment,
    removeInvestment,

    // Ações de dividendo
    addDividend,
    getDividends,
    getAllDividends,

    // Utilitários
    getPortfolioStats,
    refreshCurrentPortfolioPrices, // 🚀 NOVA FUNÇÃO
    exportData,
    importData,
    clearAllData,
    clearError,
  };

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error("usePortfolio must be used within a PortfolioProvider");
  }
  return context;
};

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabaseStorage } from "../lib/storage/supabaseStorage";
import { useAuth } from "./AuthContext";

// 🎯 Contexto do Portfolio integrado com Supabase
const PortfolioContext = createContext();

// 🔔 Sistema de notificações simples (sem toast)
const showNotification = (message, type = "info") => {
  // Criar elemento de notificação
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

  // Adicionar ao DOM
  document.body.appendChild(notification);

  // Remover após 4 segundos
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

export const PortfolioProvider = ({ children }) => {
  const [portfolios, setPortfolios] = useState([]);
  const [currentPortfolio, setCurrentPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user, isUserAuthorized } = useAuth();

  // 🔄 Carregar dados quando usuário fizer login
  useEffect(() => {
    if (isUserAuthorized() && user) {
      supabaseStorage.setUserId(user.id);
      loadPortfolios();
    } else {
      // Limpar dados quando usuário fizer logout
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

      // Definir carteira padrão se não houver uma selecionada
      if (data && data.length > 0 && !currentPortfolio) {
        setCurrentPortfolio(data[0]);
        console.log("✅ Carteira padrão selecionada:", data[0]);
      } else if (!data || data.length === 0) {
        console.log("📝 Nenhuma carteira encontrada - estado vazio");
        setCurrentPortfolio(null);
      }
    } catch (error) {
      console.error("❌ Erro ao carregar carteiras:", error);
      setError(error.message);
      showNotification("Erro ao carregar carteiras", "error");

      // ✅ CORREÇÃO: Mesmo com erro, parar o loading
      setPortfolios([]);
      setCurrentPortfolio(null);
    } finally {
      // ✅ CORREÇÃO: Sempre parar o loading
      setLoading(false);
      console.log("✅ Loading finalizado");
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
        // Criar carteira padrão se não existir
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
      await loadPortfolios(); // Recarregar para atualizar totais
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
      await loadPortfolios(); // Recarregar para atualizar totais
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
  const selectPortfolio = (portfolio) => {
    setCurrentPortfolio(portfolio);
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

  // 📊 Obter distribuição setorial
  const getSectorDistribution = (portfolio = currentPortfolio) => {
    if (!portfolio || !portfolio.investments) return [];

    const activeInvestments = portfolio.investments.filter(
      (inv) => inv.is_active
    );
    const sectorMap = {};

    activeInvestments.forEach((inv) => {
      const sector = inv.sector || "Outros";
      const value = inv.current_value || inv.total_invested || 0;

      if (sectorMap[sector]) {
        sectorMap[sector] += value;
      } else {
        sectorMap[sector] = value;
      }
    });

    const totalValue = Object.values(sectorMap).reduce(
      (sum, value) => sum + value,
      0
    );

    return Object.entries(sectorMap).map(([sector, value]) => ({
      sector,
      value,
      percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
    }));
  };

  // ✅ CORREÇÃO: Valores computados para o Dashboard
  const stats = getPortfolioStats(currentPortfolio);
  const positions = currentPortfolio?.investments || [];
  const recentDividends = []; // TODO: Implementar dividendos recentes

  // 🎯 Valores do contexto
  const value = {
    // Estados
    portfolios,
    currentPortfolio,
    loading,
    error,

    // ✅ CORREÇÃO: Valores para o Dashboard
    totalInvested: stats.totalInvested,
    currentValue: stats.currentValue,
    totalDividends: 0, // TODO: Calcular dividendos totais
    monthlyYield: stats.monthlyIncome,
    performance: stats.returnPercentage,
    positions,
    recentDividends,

    // Funções de carteira
    loadPortfolios,
    createPortfolio,
    updatePortfolio,
    deletePortfolio,
    selectPortfolio,

    // Funções de investimento
    addInvestment,
    updateInvestment,
    removeInvestment,

    // Funções de dividendo
    addDividend,
    getDividends,
    getAllDividends,

    // Funções de cálculo
    getPortfolioStats,
    getSectorDistribution,
  };

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
};

// 🎯 Hook para usar o contexto
export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error("usePortfolio must be used within a PortfolioProvider");
  }
  return context;
};

export default PortfolioContext;

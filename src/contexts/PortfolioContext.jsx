import React, { createContext, useContext, useState, useEffect } from "react";
import { supabaseStorage } from "../lib/storage/supabaseStorage";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

// 🎯 Contexto do Portfolio integrado com Supabase
const PortfolioContext = createContext();

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

      const data = await supabaseStorage.getPortfolios();
      setPortfolios(data);

      // Definir carteira padrão se não houver uma selecionada
      if (data.length > 0 && !currentPortfolio) {
        setCurrentPortfolio(data[0]);
      }
    } catch (error) {
      console.error("Erro ao carregar carteiras:", error);
      setError(error.message);
      toast.error("Erro ao carregar carteiras");
    } finally {
      setLoading(false);
    }
  };

  // 🆕 Criar nova carteira
  const createPortfolio = async (portfolioData) => {
    try {
      const newPortfolio = await supabaseStorage.createPortfolio(portfolioData);

      setPortfolios((prev) => [newPortfolio, ...prev]);
      setCurrentPortfolio(newPortfolio);

      toast.success("Carteira criada com sucesso!");
      return newPortfolio;
    } catch (error) {
      console.error("Erro ao criar carteira:", error);
      toast.error("Erro ao criar carteira");
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

      toast.success("Carteira atualizada!");
      return updatedPortfolio;
    } catch (error) {
      console.error("Erro ao atualizar carteira:", error);
      toast.error("Erro ao atualizar carteira");
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

      toast.success("Carteira removida!");
    } catch (error) {
      console.error("Erro ao deletar carteira:", error);
      toast.error("Erro ao deletar carteira");
      throw error;
    }
  };

  // 💰 Adicionar investimento
  const addInvestment = async (investmentData) => {
    try {
      if (!currentPortfolio) {
        // Criar carteira padrão se não existir
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

      toast.success(`${investmentData.ticker} adicionado à carteira!`);
    } catch (error) {
      console.error("Erro ao adicionar investimento:", error);
      toast.error("Erro ao adicionar investimento");
      throw error;
    }
  };

  // ✏️ Atualizar investimento
  const updateInvestment = async (investmentId, updates) => {
    try {
      await supabaseStorage.updateInvestment(investmentId, updates);
      await loadPortfolios(); // Recarregar para atualizar totais

      toast.success("Investimento atualizado!");
    } catch (error) {
      console.error("Erro ao atualizar investimento:", error);
      toast.error("Erro ao atualizar investimento");
      throw error;
    }
  };

  // 🗑️ Remover investimento
  const removeInvestment = async (investmentId) => {
    try {
      await supabaseStorage.removeInvestment(investmentId);
      await loadPortfolios(); // Recarregar para atualizar totais

      toast.success("Investimento removido!");
    } catch (error) {
      console.error("Erro ao remover investimento:", error);
      toast.error("Erro ao remover investimento");
      throw error;
    }
  };

  // 💎 Adicionar dividendo
  const addDividend = async (investmentId, dividendData) => {
    try {
      await supabaseStorage.addDividend(investmentId, dividendData);
      toast.success("Dividendo registrado!");
    } catch (error) {
      console.error("Erro ao adicionar dividendo:", error);
      toast.error("Erro ao registrar dividendo");
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

  // 📊 Obter top investimentos
  const getTopInvestments = (portfolio = currentPortfolio, limit = 5) => {
    if (!portfolio || !portfolio.investments) return [];

    return portfolio.investments
      .filter((inv) => inv.is_active)
      .sort(
        (a, b) =>
          (b.current_value || b.total_invested || 0) -
          (a.current_value || a.total_invested || 0)
      )
      .slice(0, limit);
  };

  // 🔄 Atualizar preços (função para implementação futura)
  const updatePrices = async () => {
    try {
      // TODO: Implementar atualização de preços via API
      toast.success("Preços atualizados!");
    } catch (error) {
      console.error("Erro ao atualizar preços:", error);
      toast.error("Erro ao atualizar preços");
    }
  };

  // 📤 Exportar dados
  const exportData = () => {
    try {
      const dataToExport = {
        portfolios,
        exportDate: new Date().toISOString(),
        version: "1.0",
      };

      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `fii-portfolio-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Dados exportados!");
    } catch (error) {
      console.error("Erro ao exportar dados:", error);
      toast.error("Erro ao exportar dados");
    }
  };

  const value = {
    // Estado
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

    // Estatísticas e análises
    getPortfolioStats,
    getSectorDistribution,
    getTopInvestments,

    // Utilitários
    updatePrices,
    exportData,
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
  if (!context) {
    throw new Error(
      "usePortfolio deve ser usado dentro de um PortfolioProvider"
    );
  }
  return context;
};

export default PortfolioContext;

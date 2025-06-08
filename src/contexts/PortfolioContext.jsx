import React, { createContext, useContext, useState, useEffect } from "react";
import { supabaseStorage } from "../lib/storage/supabaseStorage";
import { useAuth } from "./AuthContext";
import fiiDataAPI from "../lib/api/fiiDataAPI";

// 🎯 Contexto do Portfolio integrado com Supabase + Sistema Próprio (Status Invest + Fundamentus)
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

// 🚀 FUNÇÃO PARA BUSCAR PREÇOS ATUALIZADOS DO SISTEMA PRÓPRIO
const fetchUpdatedPrices = async (tickers) => {
  try {
    console.log("🔄 Buscando preços atualizados do Status Invest para:", tickers);

    // Buscar dados atualizados do nosso sistema
    const fiiData = await fiiDataAPI.getFIIData(tickers);
    console.log("📊 Dados do Status Invest recebidos:", fiiData);

    const prices = {};
    fiiData.forEach((fii) => {
      if (fii.ticker && fii.price) {
        prices[fii.ticker] = fii.price;
        console.log(`💰 ${fii.ticker}: R$ ${fii.price}`);
        }
      });

    return prices;
  } catch (error) {
    console.error("❌ Erro ao buscar preços do Status Invest:", error);
    return {};
  }
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
      setPortfolios(data || []);

      // 🚀 CORREÇÃO: Sempre atualizar currentPortfolio se há dados
      if (data && data.length > 0) {
        // Se já temos uma carteira atual, recarregar ela especificamente
        if (currentPortfolio) {
          const updatedCurrentPortfolio = data.find(p => p.id === currentPortfolio.id);
          if (updatedCurrentPortfolio) {
            const portfolioWithUpdatedPrices = await updatePortfolioWithCurrentPrices(
              updatedCurrentPortfolio
        );
            setCurrentPortfolio(portfolioWithUpdatedPrices);
            console.log("✅ Carteira atual recarregada com preços atualizados:", portfolioWithUpdatedPrices);
          } else {
            // Se a carteira atual não existe mais, selecionar a primeira
            const portfolioWithUpdatedPrices = await updatePortfolioWithCurrentPrices(data[0]);
            setCurrentPortfolio(portfolioWithUpdatedPrices);
            console.log("✅ Nova carteira padrão selecionada:", portfolioWithUpdatedPrices);
          }
        } else {
          // Se não há carteira atual, selecionar a primeira
          const portfolioWithUpdatedPrices = await updatePortfolioWithCurrentPrices(data[0]);
          setCurrentPortfolio(portfolioWithUpdatedPrices);
          console.log("✅ Carteira padrão selecionada:", portfolioWithUpdatedPrices);
        }
      } else {
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
    }
  };

  // 🚀 ATUALIZAR CARTEIRA COM PREÇOS ATUAIS DO STATUS INVEST
  const updatePortfolioWithCurrentPrices = async (portfolio) => {
    try {
      if (!portfolio.investments || portfolio.investments.length === 0) {
        return portfolio;
      }

      const tickers = portfolio.investments
        .filter((inv) => inv.is_active)
        .map((inv) => inv.ticker);

      if (tickers.length === 0) {
        return portfolio;
      }

      console.log("🔄 Atualizando preços do Status Invest para:", tickers);
      const updatedPrices = await fetchUpdatedPrices(tickers);

      // Atualizar investments com preços atuais
      const updatedInvestments = portfolio.investments.map((investment) => {
        const currentPrice = updatedPrices[investment.ticker];
        if (currentPrice && currentPrice > 0) {
          const newCurrentValue = investment.shares * currentPrice;
          console.log(
            `📈 ${investment.ticker}: ${investment.shares} cotas × R$ ${currentPrice} = R$ ${newCurrentValue}`
          );

          return {
            ...investment,
            current_price: currentPrice,
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
      console.error("❌ Erro ao atualizar preços:", error);
      return portfolio;
    }
  };

  // 🔄 Recarregar carteira atual (para uso após operações CRUD)
  const reloadCurrentPortfolio = async () => {
    if (!currentPortfolio) return;
    
    try {
      console.log("🔄 Recarregando carteira atual após operação...");
      
      // Buscar dados atualizados da carteira atual
      const portfolios = await supabaseStorage.getPortfolios();
      const updatedPortfolio = portfolios.find(p => p.id === currentPortfolio.id);
      
      if (updatedPortfolio) {
        const portfolioWithUpdatedPrices = await updatePortfolioWithCurrentPrices(updatedPortfolio);
        setCurrentPortfolio(portfolioWithUpdatedPrices);
        setPortfolios(portfolios); // Atualizar lista também
        console.log("✅ Carteira atual recarregada com sucesso!");
      }
    } catch (error) {
      console.error("❌ Erro ao recarregar carteira atual:", error);
    }
  };

  // 🔄 Atualizar preços da carteira atual
  const refreshCurrentPortfolioPrices = async () => {
    if (!currentPortfolio) return;

    try {
      console.log("🔄 Atualizando preços da carteira atual...");
      const updatedPortfolio = await updatePortfolioWithCurrentPrices(
        currentPortfolio
      );
      setCurrentPortfolio(updatedPortfolio);
      showNotification("Preços atualizados!", "success");
    } catch (error) {
      console.error("❌ Erro ao atualizar preços:", error);
      showNotification("Erro ao atualizar preços", "error");
    }
  };

  // 🚀 NOVO: Atualizar investimentos existentes com dados de dividend_yield
  const updateExistingInvestmentsWithDividendData = async () => {
    if (!currentPortfolio || !currentPortfolio.investments) return;

    try {
      console.log("🔄 Atualizando investimentos existentes com dados de dividendo...");
      showNotification("Atualizando dados de dividendos...", "info");

      const investmentsToUpdate = currentPortfolio.investments.filter(
        inv => inv.is_active && (!inv.dividend_yield || inv.dividend_yield === 0)
      );

      if (investmentsToUpdate.length === 0) {
        showNotification("Todos os investimentos já têm dados de dividendo!", "success");
        return;
      }

      console.log(`📊 Encontrados ${investmentsToUpdate.length} investimentos para atualizar:`, 
        investmentsToUpdate.map(inv => inv.ticker));

      // Buscar dados para cada investimento
      for (const investment of investmentsToUpdate) {
        try {
          console.log(`🔍 Buscando dados para ${investment.ticker}...`);
          const fiiData = await fiiDataAPI.getFII(investment.ticker);
          
          if (fiiData && fiiData.dividend_yield) {
            // 🚀 TEMPORÁRIO: Só atualizar campos que existem na tabela
            const updateData = {
              dividend_yield: fiiData.dividend_yield,
              current_price: fiiData.price,
              // 🔧 COMENTADO até adicionar as colunas no banco:
              // dividend_yield_monthly: fiiData.dividend_yield_monthly,
              // pvp: fiiData.pvp,
            };

            console.log(`✅ Atualizando ${investment.ticker} com:`, updateData);
            await supabaseStorage.updateInvestment(investment.id, updateData);
          } else {
            console.warn(`⚠️ Dados de dividendo não encontrados para ${investment.ticker}`);
          }
        } catch (error) {
          console.error(`❌ Erro ao atualizar ${investment.ticker}:`, error);
        }
      }

      // Recarregar carteira após atualizações
      await reloadCurrentPortfolio();
      showNotification("Dados de dividendos atualizados!", "success");
      
    } catch (error) {
      console.error("❌ Erro ao atualizar dados de dividendos:", error);
      showNotification("Erro ao atualizar dados de dividendos", "error");
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
      console.log("🚀 [PortfolioContext] Iniciando adição de investimento:", investmentData);
      
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

      console.log("✅ [PortfolioContext] Investimento adicionado com sucesso");
      showNotification(
        `${investmentData.ticker} adicionado à carteira!`,
        "success"
      );
      
      // 🚀 AUTO-RELOAD: Recarregar carteira atual automaticamente
      await reloadCurrentPortfolio();
      
    } catch (error) {
      console.error("❌ Erro ao adicionar investimento:", error);
      showNotification("Erro ao adicionar investimento", "error");
      throw error;
    }
  };

  // ✏️ Atualizar investimento
  const updateInvestment = async (investmentId, updates) => {
    try {
      console.log("🚀 [PortfolioContext] Iniciando atualização de investimento:", investmentId, updates);
      
      await supabaseStorage.updateInvestment(investmentId, updates);
      
      console.log("✅ [PortfolioContext] Investimento atualizado com sucesso");
      showNotification("Investimento atualizado!", "success");
      
      // 🚀 AUTO-RELOAD: Recarregar carteira atual automaticamente
      await reloadCurrentPortfolio();
      
    } catch (error) {
      console.error("Erro ao atualizar investimento:", error);
      showNotification("Erro ao atualizar investimento", "error");
      throw error;
    }
  };

  // 🗑️ Remover investimento
  const removeInvestment = async (investmentId) => {
    try {
      console.log("🚀 [PortfolioContext] Iniciando remoção de investimento:", investmentId);
      
      await supabaseStorage.removeInvestment(investmentId);
      
      console.log("✅ [PortfolioContext] Investimento removido com sucesso");
      showNotification("Investimento removido!", "success");
      
      // 🚀 AUTO-RELOAD: Recarregar carteira atual automaticamente
      await reloadCurrentPortfolio();
      
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
    const portfolioWithUpdatedPrices = await updatePortfolioWithCurrentPrices(
      portfolio
    );
    setCurrentPortfolio(portfolioWithUpdatedPrices);
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
    refreshCurrentPortfolioPrices,
    updateExistingInvestmentsWithDividendData,
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

// ✅ EXPORTAR O CONTEXTO PARA USO DIRETO
export { PortfolioContext };

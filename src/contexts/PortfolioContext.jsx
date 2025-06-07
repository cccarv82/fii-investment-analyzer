import React, { createContext, useContext, useReducer, useEffect } from "react";
import { portfolioManager } from "../lib/storage/portfolio.js";

// Contexto da carteira
const PortfolioContext = createContext();

// Actions
const PORTFOLIO_ACTIONS = {
  SET_LOADING: "SET_LOADING",
  SET_PORTFOLIO_DATA: "SET_PORTFOLIO_DATA",
  ADD_INVESTMENT: "ADD_INVESTMENT",
  ADD_DIVIDEND: "ADD_DIVIDEND",
  SET_ERROR: "SET_ERROR",
  CLEAR_ERROR: "CLEAR_ERROR",
};

// Reducer
const portfolioReducer = (state, action) => {
  switch (action.type) {
    case PORTFOLIO_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };

    case PORTFOLIO_ACTIONS.SET_PORTFOLIO_DATA:
      return {
        ...state,
        ...action.payload,
        loading: false,
        error: null,
      };

    case PORTFOLIO_ACTIONS.ADD_INVESTMENT:
      return {
        ...state,
        positions: [...state.positions, action.payload],
        totalInvested: state.totalInvested + action.payload.totalValue,
      };

    case PORTFOLIO_ACTIONS.ADD_DIVIDEND:
      return {
        ...state,
        recentDividends: [action.payload, ...state.recentDividends.slice(0, 4)],
        totalDividends: state.totalDividends + action.payload.amount,
      };

    case PORTFOLIO_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };

    case PORTFOLIO_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };

    default:
      return state;
  }
};

// Estado inicial - ZERADO (sem dados mock)
const initialState = {
  loading: false,
  error: null,
  totalInvested: 0,
  currentValue: 0,
  totalDividends: 0,
  monthlyYield: 0,
  performance: 0,
  yieldOnCost: 0,
  diversification: 0,
  positions: [],
  recentDividends: [],
  topAssets: [],
};

// Provider
export const PortfolioProvider = ({ children }) => {
  const [state, dispatch] = useReducer(portfolioReducer, initialState);

  // Carregar dados da carteira
  const loadPortfolioData = async () => {
    try {
      dispatch({ type: PORTFOLIO_ACTIONS.SET_LOADING, payload: true });

      await portfolioManager.init();
      const stats = portfolioManager.getPortfolioStats();

      // Se não há dados salvos, usar estado inicial zerado
      const portfolioData =
        stats && Object.keys(stats).length > 0 ? stats : initialState;

      dispatch({
        type: PORTFOLIO_ACTIONS.SET_PORTFOLIO_DATA,
        payload: portfolioData,
      });
    } catch (error) {
      console.error("Erro ao carregar dados da carteira:", error);
      // Em caso de erro, usar estado inicial zerado
      dispatch({
        type: PORTFOLIO_ACTIONS.SET_PORTFOLIO_DATA,
        payload: initialState,
      });
    }
  };

  // Adicionar investimento
  const addInvestment = async (investment) => {
    try {
      dispatch({ type: PORTFOLIO_ACTIONS.SET_LOADING, payload: true });

      const portfolioItem = await portfolioManager.addInvestment(investment);

      dispatch({
        type: PORTFOLIO_ACTIONS.ADD_INVESTMENT,
        payload: portfolioItem,
      });

      // Recarregar dados para atualizar estatísticas
      await loadPortfolioData();

      return portfolioItem;
    } catch (error) {
      console.error("Erro ao adicionar investimento:", error);
      dispatch({
        type: PORTFOLIO_ACTIONS.SET_ERROR,
        payload: "Erro ao adicionar investimento",
      });
      throw error;
    }
  };

  // Adicionar dividendo
  const addDividend = async (dividend) => {
    try {
      const dividendItem = await portfolioManager.addDividend(dividend);

      dispatch({
        type: PORTFOLIO_ACTIONS.ADD_DIVIDEND,
        payload: dividendItem,
      });

      // Recarregar dados para atualizar estatísticas
      await loadPortfolioData();

      return dividendItem;
    } catch (error) {
      console.error("Erro ao adicionar dividendo:", error);
      dispatch({
        type: PORTFOLIO_ACTIONS.SET_ERROR,
        payload: "Erro ao adicionar dividendo",
      });
      throw error;
    }
  };

  // Exportar dados
  const exportData = async () => {
    try {
      const data = await portfolioManager.exportData();

      // Criar arquivo para download
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `fii-carteira-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error("Erro ao exportar dados:", error);
      dispatch({
        type: PORTFOLIO_ACTIONS.SET_ERROR,
        payload: "Erro ao exportar dados",
      });
      throw error;
    }
  };

  // Importar dados
  const importData = async (file) => {
    try {
      dispatch({ type: PORTFOLIO_ACTIONS.SET_LOADING, payload: true });

      const text = await file.text();
      const data = JSON.parse(text);

      await portfolioManager.importData(data);
      await loadPortfolioData();

      return true;
    } catch (error) {
      console.error("Erro ao importar dados:", error);
      dispatch({
        type: PORTFOLIO_ACTIONS.SET_ERROR,
        payload: "Erro ao importar dados. Verifique o formato do arquivo.",
      });
      throw error;
    }
  };

  // Limpar dados
  const clearAllData = async () => {
    try {
      dispatch({ type: PORTFOLIO_ACTIONS.SET_LOADING, payload: true });

      await portfolioManager.clearAllData();

      dispatch({
        type: PORTFOLIO_ACTIONS.SET_PORTFOLIO_DATA,
        payload: initialState,
      });

      return true;
    } catch (error) {
      console.error("Erro ao limpar dados:", error);
      dispatch({
        type: PORTFOLIO_ACTIONS.SET_ERROR,
        payload: "Erro ao limpar dados",
      });
      throw error;
    }
  };

  // Limpar erro
  const clearError = () => {
    dispatch({ type: PORTFOLIO_ACTIONS.CLEAR_ERROR });
  };

  // Carregar dados na inicialização
  useEffect(() => {
    loadPortfolioData();
  }, []);

  const value = {
    ...state,
    loadPortfolioData,
    addInvestment,
    addDividend,
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

// Hook para usar o contexto
export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error("usePortfolio deve ser usado dentro de PortfolioProvider");
  }
  return context;
};

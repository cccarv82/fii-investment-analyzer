import React, { createContext, useContext, useState, useEffect } from 'react';
import { fundamentalAnalysisAI } from '../lib/ai/analysis.js';

// Contexto da IA
const AIContext = createContext();

// Provider
export const AIProvider = ({ children }) => {
  const [apiKey, setApiKey] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Verificar se API key está configurada
  useEffect(() => {
    const savedKey = fundamentalAnalysisAI.getApiKey();
    if (savedKey) {
      setApiKey(savedKey);
      setIsConfigured(true);
    }
  }, []);

  // Configurar API key
  const configureApiKey = (key) => {
    try {
      fundamentalAnalysisAI.setApiKey(key);
      setApiKey(key);
      setIsConfigured(true);
      setError(null);
      return true;
    } catch (error) {
      setError('Erro ao configurar API key');
      return false;
    }
  };

  // Remover API key
  const removeApiKey = () => {
    localStorage.removeItem('fii_analyzer_openai_key');
    fundamentalAnalysisAI.setApiKey(null);
    setApiKey('');
    setIsConfigured(false);
    setError(null);
  };

  // Analisar FII
  const analyzeFII = async (fiiData, userProfile) => {
    if (!isConfigured) {
      throw new Error('API key da OpenAI não configurada');
    }

    setLoading(true);
    setError(null);

    try {
      const analysis = await fundamentalAnalysisAI.analyzeFII(fiiData, userProfile);
      setLoading(false);
      return analysis;
    } catch (error) {
      setLoading(false);
      setError(error.message);
      throw error;
    }
  };

  // Analisar carteira
  const analyzePortfolio = async (portfolio, userProfile) => {
    if (!isConfigured) {
      throw new Error('API key da OpenAI não configurada');
    }

    setLoading(true);
    setError(null);

    try {
      const analysis = await fundamentalAnalysisAI.analyzePortfolio(portfolio, userProfile);
      setLoading(false);
      return analysis;
    } catch (error) {
      setLoading(false);
      setError(error.message);
      throw error;
    }
  };

  // Gerar sugestões de investimento
  const generateSuggestions = async (userProfile, availableFIIs) => {
    if (!isConfigured) {
      // Retornar sugestões mock se IA não estiver configurada
      return generateMockSuggestions(userProfile);
    }

    setLoading(true);
    setError(null);

    try {
      const suggestions = await fundamentalAnalysisAI.generateInvestmentSuggestions(
        userProfile, 
        availableFIIs
      );
      setLoading(false);
      return suggestions;
    } catch (error) {
      setLoading(false);
      setError(error.message);
      
      // Fallback para sugestões mock em caso de erro
      console.warn('Erro na IA, usando sugestões mock:', error);
      return generateMockSuggestions(userProfile);
    }
  };

  // Análise de mercado
  const getMarketAnalysis = async () => {
    if (!isConfigured) {
      return generateMockMarketAnalysis();
    }

    setLoading(true);
    setError(null);

    try {
      const analysis = await fundamentalAnalysisAI.getMarketAnalysis();
      setLoading(false);
      return analysis;
    } catch (error) {
      setLoading(false);
      setError(error.message);
      
      // Fallback para análise mock
      return generateMockMarketAnalysis();
    }
  };

  // Limpar erro
  const clearError = () => {
    setError(null);
  };

  const value = {
    apiKey,
    isConfigured,
    loading,
    error,
    configureApiKey,
    removeApiKey,
    analyzeFII,
    analyzePortfolio,
    generateSuggestions,
    getMarketAnalysis,
    clearError
  };

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  );
};

// Hook para usar o contexto
export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI deve ser usado dentro de AIProvider');
  }
  return context;
};

// Função para gerar sugestões mock (fallback)
const generateMockSuggestions = (userProfile) => {
  const mockFIIs = [
    {
      ticker: 'HGLG11',
      name: 'CSHG Logística FII',
      price: 172.50,
      dividendYield: 7.8,
      pvp: 0.95,
      sector: 'Logística',
      percentage: 25,
      recommendedAmount: userProfile.amount * 0.25,
      shares: Math.floor((userProfile.amount * 0.25) / 172.50),
      investmentAmount: Math.floor((userProfile.amount * 0.25) / 172.50) * 172.50,
      reasoning: 'Excelente fundamento com baixo P/VP e alto dividend yield. Setor de logística em crescimento.',
      strengths: ['Alto dividend yield de 7.8%', 'Negociado abaixo do valor patrimonial', 'Setor em expansão'],
      weaknesses: ['Dependência do e-commerce'],
      score: 8.5
    },
    {
      ticker: 'XPLG11',
      name: 'XP Log FII',
      price: 105.20,
      dividendYield: 8.2,
      pvp: 0.88,
      sector: 'Logística',
      percentage: 20,
      recommendedAmount: userProfile.amount * 0.20,
      shares: Math.floor((userProfile.amount * 0.20) / 105.20),
      investmentAmount: Math.floor((userProfile.amount * 0.20) / 105.20) * 105.20,
      reasoning: 'Forte posicionamento no setor logístico com boa gestão e ativos de qualidade.',
      strengths: ['Excelente dividend yield', 'Gestão reconhecida', 'Ativos bem localizados'],
      weaknesses: ['Concentração geográfica'],
      score: 8.2
    },
    {
      ticker: 'VISC11',
      name: 'Vinci Shopping Centers FII',
      price: 112.30,
      dividendYield: 7.5,
      pvp: 0.92,
      sector: 'Shoppings',
      percentage: 15,
      recommendedAmount: userProfile.amount * 0.15,
      shares: Math.floor((userProfile.amount * 0.15) / 112.30),
      investmentAmount: Math.floor((userProfile.amount * 0.15) / 112.30) * 112.30,
      reasoning: 'Shopping centers de qualidade com boa ocupação e gestão eficiente.',
      strengths: ['Shoppings bem localizados', 'Boa taxa de ocupação', 'Gestão experiente'],
      weaknesses: ['Setor com desafios estruturais', 'Impacto do e-commerce'],
      score: 7.8
    }
  ];

  const totalInvestment = mockFIIs.reduce((sum, fii) => sum + fii.investmentAmount, 0);
  const expectedYield = mockFIIs.reduce((sum, fii) => 
    sum + (fii.investmentAmount * fii.dividendYield / 100), 0
  );

  return {
    allocation: mockFIIs,
    summary: {
      totalAmount: userProfile.amount,
      totalInvestment: totalInvestment,
      remainingAmount: userProfile.amount - totalInvestment,
      expectedYield: expectedYield,
      expectedYieldPercentage: (expectedYield / totalInvestment) * 100,
      diversificationScore: 75,
      aiPowered: false
    },
    timestamp: new Date().toISOString()
  };
};

// Função para gerar análise de mercado mock
const generateMockMarketAnalysis = () => {
  return {
    marketSentiment: 'NEUTRO',
    keyTrends: [
      'Crescimento do setor logístico impulsionado pelo e-commerce',
      'Recuperação gradual do setor de shoppings',
      'Busca por yield em cenário de juros altos'
    ],
    sectorOutlook: {
      logistica: 'Positivo - Crescimento sustentado com expansão do e-commerce',
      shoppings: 'Neutro - Recuperação lenta mas consistente',
      corporativo: 'Positivo - Demanda por escritórios de qualidade',
      residencial: 'Neutro - Mercado estável com oportunidades pontuais'
    },
    opportunities: [
      'FIIs de logística com ativos bem localizados',
      'Fundos com desconto ao valor patrimonial',
      'Oportunidades em recebíveis imobiliários'
    ],
    risks: [
      'Volatilidade das taxas de juros',
      'Mudanças no comportamento do consumidor',
      'Concentração setorial ou geográfica'
    ],
    outlook: 'Mercado de FIIs mantém atratividade com dividend yields competitivos. Diversificação setorial recomendada.'
  };
};


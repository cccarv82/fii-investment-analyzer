import { z } from 'zod';

// Schema para validação de FII
export const FIISchema = z.object({
  ticker: z.string()
    .min(6, 'Ticker deve ter pelo menos 6 caracteres')
    .max(6, 'Ticker deve ter no máximo 6 caracteres')
    .regex(/^[A-Z]{4}11$/, 'Ticker deve seguir o padrão XXXX11'),
  name: z.string().min(1, 'Nome é obrigatório'),
  cnpj: z.string()
    .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'CNPJ deve estar no formato XX.XXX.XXX/XXXX-XX'),
  sector: z.string().min(1, 'Setor é obrigatório'),
  currentPrice: z.number().positive('Preço deve ser positivo'),
  dividendYield: z.number().min(0, 'Dividend yield não pode ser negativo'),
  pvp: z.number().positive('P/VP deve ser positivo'),
  liquidez: z.number().min(0, 'Liquidez não pode ser negativa'),
  patrimonio: z.number().positive('Patrimônio deve ser positivo')
});

// Schema para validação de investimento
export const InvestmentSchema = z.object({
  amount: z.number()
    .min(100, 'Valor mínimo de investimento é R$ 100')
    .max(1000000, 'Valor máximo de investimento é R$ 1.000.000'),
  riskProfile: z.enum(['conservador', 'moderado', 'arrojado'], {
    errorMap: () => ({ message: 'Perfil de risco deve ser conservador, moderado ou arrojado' })
  }),
  investmentGoal: z.enum(['renda', 'crescimento', 'equilibrado'], {
    errorMap: () => ({ message: 'Objetivo deve ser renda, crescimento ou equilibrado' })
  }),
  timeHorizon: z.enum(['curto', 'medio', 'longo'], {
    errorMap: () => ({ message: 'Prazo deve ser curto, médio ou longo' })
  })
});

// Schema para validação de ativo na carteira
export const PortfolioAssetSchema = z.object({
  ticker: z.string().regex(/^[A-Z]{4}11$/, 'Ticker inválido'),
  quantity: z.number().int().positive('Quantidade deve ser um número inteiro positivo'),
  averagePrice: z.number().positive('Preço médio deve ser positivo'),
  purchaseDate: z.string().datetime('Data de compra inválida')
});

// Schema para validação de carteira
export const PortfolioSchema = z.object({
  name: z.string().min(1, 'Nome da carteira é obrigatório').max(50, 'Nome muito longo'),
  description: z.string().max(200, 'Descrição muito longa').optional(),
  assets: z.array(PortfolioAssetSchema).max(50, 'Máximo de 50 ativos por carteira'),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

// Schema para configurações do usuário
export const UserSettingsSchema = z.object({
  currency: z.enum(['BRL', 'USD', 'EUR']).default('BRL'),
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  notifications: z.object({
    email: z.boolean().default(false),
    push: z.boolean().default(true),
    dividends: z.boolean().default(true),
    priceAlerts: z.boolean().default(false)
  }).default({}),
  privacy: z.object({
    shareData: z.boolean().default(false),
    analytics: z.boolean().default(true)
  }).default({})
});

// Schema para análise de IA
export const AIAnalysisSchema = z.object({
  ticker: z.string().regex(/^[A-Z]{4}11$/),
  score: z.number().min(0).max(10),
  recommendation: z.enum(['comprar', 'manter', 'vender']),
  reasoning: z.string().min(10, 'Justificativa muito curta'),
  confidence: z.number().min(0).max(1),
  riskLevel: z.enum(['baixo', 'medio', 'alto']),
  expectedReturn: z.number(),
  timeframe: z.string(),
  createdAt: z.string().datetime()
});

// Funções de validação personalizadas
export const validateInvestmentAmount = (amount) => {
  try {
    InvestmentSchema.pick({ amount: true }).parse({ amount });
    return { isValid: true, error: null };
  } catch (error) {
    return { isValid: false, error: error.errors[0].message };
  }
};

export const validateTicker = (ticker) => {
  try {
    FIISchema.pick({ ticker: true }).parse({ ticker: ticker.toUpperCase() });
    return { isValid: true, error: null };
  } catch (error) {
    return { isValid: false, error: error.errors[0].message };
  }
};

export const validatePortfolioAsset = (asset) => {
  try {
    PortfolioAssetSchema.parse(asset);
    return { isValid: true, error: null };
  } catch (error) {
    return { isValid: false, error: error.errors[0].message };
  }
};

export const validateEmail = (email) => {
  const emailSchema = z.string().email('Email inválido');
  try {
    emailSchema.parse(email);
    return { isValid: true, error: null };
  } catch (error) {
    return { isValid: false, error: error.errors[0].message };
  }
};

// Sanitização de dados
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>\"']/g, '') // Remove caracteres perigosos
    .substring(0, 1000); // Limita tamanho
};

export const sanitizeTicker = (ticker) => {
  return ticker
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 6);
};

export const sanitizeNumber = (value, min = 0, max = Infinity) => {
  const num = parseFloat(value);
  if (isNaN(num)) return min;
  return Math.max(min, Math.min(max, num));
};


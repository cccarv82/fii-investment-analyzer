// 🔧 CONFIGURAÇÃO DO SUPABASE
import { createClient } from "@supabase/supabase-js";

// 🔑 Configurações do Supabase
const supabaseUrl = "https://nnridtfztfnepzwrubzn.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ucmlkdGZ6dGZuZXB6d3J1YnpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNjQ0NjgsImV4cCI6MjA2NDg0MDQ2OH0.JeKmRXY23UrIfKUdaGedFgyXffjp315yYC0ee4X_v9M";

// 🚀 Criar cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// 🔐 Configurações de autenticação
export const authConfig = {
  // Email permitido (apenas o seu)
  allowedEmail: "cccarv82@gmail.com",

  // Configurações de sessão
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 horas

  // Configurações de segurança
  requireEmailVerification: false, // Para simplificar
  enableMFA: false, // Para simplificar
};

// 🛡️ Função para verificar se usuário é autorizado
export const isAuthorizedUser = (email) => {
  return email === authConfig.allowedEmail;
};

// 📊 Configurações de banco de dados
export const dbConfig = {
  // Configurações de cache
  cacheTimeout: 5 * 60 * 1000, // 5 minutos

  // Configurações de sincronização
  autoSync: true,
  syncInterval: 30 * 60 * 1000, // 30 minutos

  // Configurações de backup
  autoBackup: true,
  backupInterval: 24 * 60 * 60 * 1000, // 24 horas
};

// 🔧 Utilitários para Supabase
export const supabaseUtils = {
  // Verificar conexão
  async checkConnection() {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("count")
        .limit(1);
      return !error;
    } catch (error) {
      console.error("Erro ao verificar conexão Supabase:", error);
      return false;
    }
  },

  // Obter usuário atual
  async getCurrentUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) {
      console.error("Erro ao obter usuário:", error);
      return null;
    }
    return user;
  },

  // Verificar se usuário está autenticado e autorizado
  async isUserAuthorized() {
    const user = await this.getCurrentUser();
    if (!user) return false;
    return isAuthorizedUser(user.email);
  },

  // Fazer logout
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Erro ao fazer logout:", error);
      throw error;
    }
  },

  // Obter perfil do usuário
  async getUserProfile(userId) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Erro ao obter perfil:", error);
      return null;
    }

    return data;
  },

  // Criar ou atualizar perfil
  async upsertProfile(profile) {
    const { data, error } = await supabase
      .from("profiles")
      .upsert(profile)
      .select()
      .single();

    if (error) {
      console.error("Erro ao salvar perfil:", error);
      throw error;
    }

    return data;
  },

  // Criptografar dados sensíveis
  async encryptSensitiveData(data) {
    // Para implementação futura com criptografia
    return data;
  },

  // Descriptografar dados sensíveis
  async decryptSensitiveData(encryptedData) {
    // Para implementação futura com criptografia
    return encryptedData;
  },
};

// 🎯 Configurações específicas do FII Analyzer
export const fiiAnalyzerConfig = {
  // Configurações de dados
  maxPortfolios: 10,
  maxInvestmentsPerPortfolio: 50,
  maxDividendHistory: 1000,

  // Configurações de IA
  maxAIAnalysesPerDay: 100,
  aiAnalysisRetention: 30, // dias

  // Configurações de cache
  priceDataCacheTime: 15 * 60 * 1000, // 15 minutos
  fiiDataCacheTime: 60 * 60 * 1000, // 1 hora

  // Configurações de notificações
  enableNotifications: true,
  notificationRetention: 90, // dias
};

export default supabase;

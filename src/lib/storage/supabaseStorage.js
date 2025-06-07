import { supabase } from "../supabase";

// 🗄️ SISTEMA DE PERSISTÊNCIA COM SUPABASE
class SupabaseStorage {
  constructor() {
    this.userId = null;
  }

  // 🔐 Definir ID do usuário atual
  setUserId(userId) {
    this.userId = userId;
  }

  // 📊 OPERAÇÕES DE CARTEIRA

  // Obter todas as carteiras do usuário
  async getPortfolios() {
    try {
      const { data, error } = await supabase
        .from("portfolios")
        .select(
          `
          *,
          investments (
            *,
            dividends (*)
          )
        `
        )
        .eq("user_id", this.userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Calcular valores atuais para cada carteira
      return data.map((portfolio) => ({
        ...portfolio,
        investments: portfolio.investments || [],
        stats: this.calculatePortfolioStats(portfolio.investments || []),
      }));
    } catch (error) {
      console.error("Erro ao obter carteiras:", error);
      throw error;
    }
  }

  // Criar nova carteira
  async createPortfolio(portfolioData) {
    try {
      const { data, error } = await supabase
        .from("portfolios")
        .insert([
          {
            user_id: this.userId,
            name: portfolioData.name,
            description: portfolioData.description || "",
            target_amount: portfolioData.target_amount || 0,
            risk_profile: portfolioData.risk_profile || "moderado",
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      return {
        ...data,
        investments: [],
        stats: this.calculatePortfolioStats([]),
      };
    } catch (error) {
      console.error("Erro ao criar carteira:", error);
      throw error;
    }
  }

  // Atualizar carteira
  async updatePortfolio(portfolioId, updates) {
    try {
      const { data, error } = await supabase
        .from("portfolios")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", portfolioId)
        .eq("user_id", this.userId)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("Erro ao atualizar carteira:", error);
      throw error;
    }
  }

  // Deletar carteira
  async deletePortfolio(portfolioId) {
    try {
      const { error } = await supabase
        .from("portfolios")
        .delete()
        .eq("id", portfolioId)
        .eq("user_id", this.userId);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error("Erro ao deletar carteira:", error);
      throw error;
    }
  }

  // 💰 OPERAÇÕES DE INVESTIMENTO

  // ✅ CORREÇÃO: Adicionar investimento com campo correto
  async addInvestment(portfolioId, investmentData) {
    try {
      const { data, error } = await supabase
        .from("investments")
        .insert([
          {
            portfolio_id: portfolioId,
            ticker: investmentData.ticker,
            name: investmentData.name || investmentData.ticker,
            sector: investmentData.sector || "Outros",
            shares: investmentData.shares || 0,
            average_price:
              investmentData.average_price || investmentData.price || 0,
            total_invested:
              (investmentData.shares || 0) *
              (investmentData.average_price || investmentData.price || 0),
            current_price:
              investmentData.current_price || investmentData.price || 0,
            current_value:
              (investmentData.shares || 0) *
              (investmentData.current_price || investmentData.price || 0),
            dividend_yield: investmentData.dividend_yield || 0,
            // ✅ CORREÇÃO CRÍTICA: Usar 'pvp' em vez de 'pvp_ratio'
            pvp: investmentData.pvp || investmentData.pvp_ratio || 0,
            is_active: true,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("Erro ao adicionar investimento:", error);
      throw error;
    }
  }

  // Atualizar investimento
  async updateInvestment(investmentId, updates) {
    try {
      const { data, error } = await supabase
        .from("investments")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", investmentId)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("Erro ao atualizar investimento:", error);
      throw error;
    }
  }

  // Remover investimento
  async removeInvestment(investmentId) {
    try {
      const { error } = await supabase
        .from("investments")
        .delete()
        .eq("id", investmentId);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error("Erro ao remover investimento:", error);
      throw error;
    }
  }

  // 💎 OPERAÇÕES DE DIVIDENDOS

  // Adicionar dividendo
  async addDividend(investmentId, dividendData) {
    try {
      const { data, error } = await supabase
        .from("dividends")
        .insert([
          {
            investment_id: investmentId,
            amount: dividendData.amount,
            payment_date: dividendData.payment_date,
            ex_dividend_date:
              dividendData.ex_dividend_date || dividendData.payment_date,
            type: dividendData.type || "dividend",
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("Erro ao adicionar dividendo:", error);
      throw error;
    }
  }

  // Obter dividendos de um investimento
  async getDividends(investmentId) {
    try {
      const { data, error } = await supabase
        .from("dividends")
        .select("*")
        .eq("investment_id", investmentId)
        .order("payment_date", { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Erro ao obter dividendos:", error);
      return [];
    }
  }

  // Obter todos os dividendos do usuário
  async getAllDividends() {
    try {
      const { data, error } = await supabase
        .from("dividends")
        .select(
          `
          *,
          investments!inner (
            ticker,
            name,
            portfolios!inner (
              user_id
            )
          )
        `
        )
        .eq("investments.portfolios.user_id", this.userId)
        .order("payment_date", { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Erro ao obter todos os dividendos:", error);
      return [];
    }
  }

  // 🧮 CÁLCULOS E ESTATÍSTICAS

  // Calcular estatísticas da carteira
  calculatePortfolioStats(investments) {
    if (!investments || investments.length === 0) {
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

    const activeInvestments = investments.filter((inv) => inv.is_active);

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
  }

  // 🔄 SINCRONIZAÇÃO E BACKUP

  // Fazer backup dos dados
  async backupData() {
    try {
      const portfolios = await this.getPortfolios();
      const dividends = await this.getAllDividends();

      return {
        portfolios,
        dividends,
        backup_date: new Date().toISOString(),
        user_id: this.userId,
      };
    } catch (error) {
      console.error("Erro ao fazer backup:", error);
      throw error;
    }
  }

  // Restaurar dados do backup
  async restoreData(backupData) {
    try {
      // Esta função seria implementada para restaurar dados
      // Por segurança, não implementada automaticamente
      console.log("Função de restore disponível:", backupData);
      throw new Error(
        "Função de restore deve ser implementada manualmente por segurança"
      );
    } catch (error) {
      console.error("Erro ao restaurar dados:", error);
      throw error;
    }
  }
}

// 🎯 Instância singleton
export const supabaseStorage = new SupabaseStorage();
export default supabaseStorage;

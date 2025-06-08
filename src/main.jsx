import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import fiiDataAPI from './lib/api/fiiDataAPI.js'

// 🚀 FII DATA API - ACESSO GLOBAL PARA DESENVOLVIMENTO
window.fiiDataAPI = fiiDataAPI;

// 🎯 FUNÇÕES GLOBAIS PARA DESENVOLVIMENTO E DEBUG
window.statusInvestDebug = {
  // Buscar dados de FIIs específicos
  async getFIIData(tickers = ['MXRF11', 'CPTS11', 'RBRF11']) {
    try {
      const data = await fiiDataAPI.getFIIData(tickers);
      console.table(data);
      return data;
    } catch (error) {
      console.error('❌ Erro:', error);
      return null;
    }
  },

  // Buscar melhores FIIs para IA
  async getBestFIIs(limit = 10) {
    try {
      const data = await fiiDataAPI.getBestFIIs(limit);
      console.table(data.map(fii => ({
        ticker: fii.ticker,
        name: fii.name,
        dy: `${fii.dividend_yield?.toFixed(2)}%`,
        pvp: fii.pvp?.toFixed(2),
        ffo_yield: `${fii.ffo_yield?.toFixed(2)}%`,
        p_ffo: fii.p_ffo?.toFixed(2),
        quality: fii.quality_score?.toFixed(1),
        rating: fii.preliminary_rating
      })));
      return data;
    } catch (error) {
      console.error('❌ Erro:', error);
      return null;
    }
  },

  // Atualizar dados forçadamente
  async refreshData() {
    try {
      const data = await fiiDataAPI.refreshData();
      console.log(`✅ ${data.updated_count} FIIs atualizados com sucesso!`);
      return data;
    } catch (error) {
      console.error('❌ Erro:', error);
      return null;
    }
  },

  // Obter estatísticas do sistema
  async getStats() {
    try {
      const stats = await fiiDataAPI.getStats();
      console.log('📈 Estatísticas:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Erro:', error);
      return null;
    }
  },

  // Limpar cache
  clearCache() {
    fiiDataAPI.clearCache();
  },

  // Buscar FII específico com detalhes completos
  async getFIIDetails(ticker) {
    console.log(`🔍 Buscando detalhes de ${ticker}...`);
    try {
      const fii = await fiiDataAPI.getFIIDetails(ticker);
      if (fii) {
        console.log(`📊 ${ticker} - ${fii.name}`);
        console.log(`💰 Preço: R$ ${fii.price?.toFixed(2)}`);
        console.log(`📈 DY: ${fii.dividend_yield?.toFixed(2)}%`);
        console.log(`📊 P/VP: ${fii.pvp?.toFixed(2)}`);
        console.log(`⭐ Quality Score: ${fii.quality_score?.toFixed(1)}/10`);
        console.log(`🌱 Sustainability: ${fii.sustainability_score?.toFixed(1)}/10`);
        console.log(`📈 Growth: ${fii.growth_score?.toFixed(1)}/10`);
        console.log(`🎯 Rating: ${fii.preliminary_rating}`);
        console.log(`⚠️ Risco: ${fii.risk_level}`);
        console.log(`💡 Tese: ${fii.investment_thesis}`);
        
        if (fii.investment_highlights?.length > 0) {
          console.log(`✨ Destaques:`, fii.investment_highlights);
        }
        
        if (fii.risk_factors?.length > 0) {
          console.log(`⚠️ Riscos:`, fii.risk_factors);
        }
      } else {
        console.log(`❌ FII ${ticker} não encontrado`);
      }
      return fii;
    } catch (error) {
      console.error('❌ Erro:', error);
      return null;
    }
  },

  // Comparar FIIs
  async compareFIIs(tickers) {
    console.log(`🔍 Comparando FIIs: ${tickers.join(' vs ')}`);
    try {
      const fiis = await fiiDataAPI.getFIIData(tickers);
      
      const comparison = fiis.map(fii => ({
        ticker: fii.ticker,
        name: fii.name,
        price: `R$ ${fii.price?.toFixed(2)}`,
        dy: `${fii.dividend_yield?.toFixed(2)}%`,
        pvp: fii.pvp?.toFixed(2),
        liquidity: fii.liquidity_category,
        quality: `${fii.quality_score?.toFixed(1)}/10`,
        sustainability: `${fii.sustainability_score?.toFixed(1)}/10`,
        growth: `${fii.growth_score?.toFixed(1)}/10`,
        rating: fii.preliminary_rating,
        risk: fii.risk_level,
        sector: fii.sector,
        segment: fii.segment
      }));
      
      console.table(comparison);
      return comparison;
    } catch (error) {
      console.error('❌ Erro:', error);
      return null;
    }
  }
};

// 🎯 COMANDOS RÁPIDOS PARA CONSOLE
console.log(`
🚀 STATUS INVEST MASTER SOLUTION CARREGADA!

📋 COMANDOS DISPONÍVEIS:

🔍 BUSCAR DADOS:
   statusInvestDebug.getFIIData(['MXRF11', 'CPTS11'])
   statusInvestDebug.getFIIDetails('MXRF11')
   statusInvestDebug.getBestFIIs(10)

🔄 ATUALIZAR:
   statusInvestDebug.refreshData()

📊 ESTATÍSTICAS:
   statusInvestDebug.getStats()

🧹 MANUTENÇÃO:
   statusInvestDebug.clearCache()

🆚 COMPARAR:
   statusInvestDebug.compareFIIs(['MXRF11', 'CPTS11', 'RBRF11'])

💡 ACESSO DIRETO:
   window.fiiDataAPI

🎯 EXEMPLO RÁPIDO:
   statusInvestDebug.getBestFIIs(5)
`);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

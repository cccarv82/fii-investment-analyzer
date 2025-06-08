// 🚀 SERVIDOR API - SISTEMA HÍBRIDO FII
// Servidor Express para conectar frontend ao sistema híbrido

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Importar o sistema híbrido
import fiiDataManager from '../src/lib/data/fiiDataManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// 🔧 Middlewares
app.use(cors());
app.use(express.json());

// 📊 Logging middleware
app.use((req, res, next) => {
  console.log(`🌐 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// 🎯 ROTAS DA API FII

/**
 * 🔍 BUSCAR DADOS DE FIIs ESPECÍFICOS
 */
app.post('/api/fii-data/get-data', async (req, res) => {
  try {
    const { tickers } = req.body;
    
    if (!tickers || !Array.isArray(tickers)) {
      return res.status(400).json({ 
        error: 'Tickers deve ser um array' 
      });
    }

    console.log(`🔍 Buscando dados de FIIs: ${tickers.join(', ')}`);
    
    const data = await fiiDataManager.getFIIData(tickers);
    
    console.log(`✅ Retornando ${data.length} FIIs`);
    res.json(data);

  } catch (error) {
    console.error('❌ Erro ao buscar dados FII:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

/**
 * 🌐 BUSCAR TODOS OS FIIs DISPONÍVEIS
 */
app.get('/api/fii-data/all-fiis', async (req, res) => {
  try {
    console.log('🌐 Buscando todos os FIIs...');
    
    const data = await fiiDataManager.getFIIData();
    
    console.log(`✅ Retornando ${data.length} FIIs`);
    res.json(data);

  } catch (error) {
    console.error('❌ Erro ao buscar todos os FIIs:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

/**
 * 🎯 BUSCAR MELHORES FIIs PARA IA
 */
app.post('/api/fii-data/best-fiis', async (req, res) => {
  try {
    const { limit = 10, filters = {} } = req.body;
    
    console.log(`🎯 Buscando top ${limit} FIIs para IA...`);
    
    const data = await fiiDataManager.getBestFIIsForAI(limit, filters);
    
    console.log(`✅ Retornando ${data.length} melhores FIIs`);
    res.json(data);

  } catch (error) {
    console.error('❌ Erro ao buscar melhores FIIs:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

/**
 * 🔄 ATUALIZAR DADOS FORÇADAMENTE
 */
app.post('/api/fii-data/refresh', async (req, res) => {
  try {
    const { tickers = null } = req.body;
    
    console.log('🔄 Forçando atualização de dados...');
    
    // Limpar cache primeiro
    await fiiDataManager.clearCache();
    
    // Buscar dados atualizados
    const data = await fiiDataManager.getFIIData(tickers);
    
    const result = {
      success: true,
      updated_count: data.length,
      timestamp: new Date().toISOString(),
      message: `${data.length} FIIs atualizados com sucesso`
    };
    
    console.log(`✅ ${result.updated_count} FIIs atualizados`);
    res.json(result);

  } catch (error) {
    console.error('❌ Erro ao atualizar dados:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

/**
 * 📊 OBTER ESTATÍSTICAS DO SISTEMA
 */
app.get('/api/fii-data/stats', async (req, res) => {
  try {
    console.log('📊 Obtendo estatísticas do sistema...');
    
    const stats = await fiiDataManager.getSystemStats();
    
    console.log('📈 Estatísticas obtidas:', stats);
    res.json(stats);

  } catch (error) {
    console.error('❌ Erro ao obter estatísticas:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

/**
 * 📈 ANÁLISE FUNDAMENTALISTA
 */
app.get('/api/fii-data/analysis/:ticker', async (req, res) => {
  try {
    const { ticker } = req.params;
    
    console.log(`📈 Obtendo análise fundamentalista de ${ticker}...`);
    
    // Buscar dados do FII
    const fiis = await fiiDataManager.getFIIData([ticker]);
    
    if (fiis.length === 0) {
      return res.status(404).json({ 
        error: 'FII não encontrado',
        ticker 
      });
    }
    
    const fii = fiis[0];
    
    // Análise básica (pode ser expandida)
    const analysis = {
      ticker: fii.ticker,
      name: fii.name,
      current_price: fii.price,
      dividend_yield: fii.dividend_yield,
      pvp: fii.pvp,
      quality_score: fii.quality_score,
      sustainability_score: fii.sustainability_score,
      growth_score: fii.growth_score,
      risk_level: fii.risk_level,
      preliminary_rating: fii.preliminary_rating,
      investment_thesis: fii.investment_thesis,
      investment_highlights: fii.investment_highlights,
      risk_factors: fii.risk_factors,
      competitive_advantages: fii.competitive_advantages,
      dividend_sustainability: fii.dividend_sustainability,
      growth_potential: fii.growth_potential,
      analysis_timestamp: new Date().toISOString()
    };
    
    console.log(`✅ Análise de ${ticker} obtida`);
    res.json(analysis);

  } catch (error) {
    console.error('❌ Erro ao obter análise:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

/**
 * 🧹 LIMPEZA DO SISTEMA
 */
app.post('/api/fii-data/cleanup', async (req, res) => {
  try {
    console.log('🧹 Executando limpeza do sistema...');
    
    await fiiDataManager.cleanup();
    
    const result = {
      success: true,
      message: 'Limpeza do sistema concluída',
      timestamp: new Date().toISOString()
    };
    
    console.log('✅ Limpeza concluída');
    res.json(result);

  } catch (error) {
    console.error('❌ Erro na limpeza do sistema:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

/**
 * 🏥 HEALTH CHECK
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'FII Investment API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

/**
 * 📋 LISTAR TODAS AS ROTAS DISPONÍVEIS
 */
app.get('/api', (req, res) => {
  res.json({
    service: 'FII Investment API',
    version: '1.0.0',
    endpoints: {
      'POST /api/fii-data/get-data': 'Buscar dados de FIIs específicos',
      'GET /api/fii-data/all-fiis': 'Buscar todos os FIIs disponíveis',
      'POST /api/fii-data/best-fiis': 'Buscar melhores FIIs para IA',
      'POST /api/fii-data/refresh': 'Atualizar dados forçadamente',
      'GET /api/fii-data/stats': 'Obter estatísticas do sistema',
      'GET /api/fii-data/analysis/:ticker': 'Análise fundamentalista',
      'POST /api/fii-data/cleanup': 'Limpeza do sistema',
      'GET /api/health': 'Health check'
    },
    documentation: 'Sistema Híbrido FII - Status Invest + Fundamentus',
    timestamp: new Date().toISOString()
  });
});

// 🚫 Middleware de erro global
app.use((error, req, res, next) => {
  console.error('💥 Erro não tratado:', error);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: error.message,
    timestamp: new Date().toISOString()
  });
});

// 🚫 Rota 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.originalUrl,
    available_endpoints: '/api',
    timestamp: new Date().toISOString()
  });
});

// 🚀 Iniciar servidor
app.listen(PORT, () => {
  console.log(`
🚀 SERVIDOR API FII INICIADO!

📡 Porta: ${PORT}
🌐 URL: http://localhost:${PORT}
📋 Endpoints: http://localhost:${PORT}/api
🏥 Health: http://localhost:${PORT}/api/health

🎯 Sistema Híbrido: Status Invest + Fundamentus
✅ Pronto para receber requisições!

⚡ Para testar:
   curl http://localhost:${PORT}/api/health
   curl http://localhost:${PORT}/api
`);
});

// 🛡️ Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Recebido SIGTERM, encerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Recebido SIGINT, encerrando servidor...');
  process.exit(0);
}); 
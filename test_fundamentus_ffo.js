// 🧪 TESTE DE EXTRAÇÃO FFO - FUNDAMENTUS
// Validação da extração de dados FFO do site Fundamentus

import fundamentusScraper from './src/lib/data/fundamentusScraper.js';

/**
 * 🎯 TESTE PRINCIPAL: Validar extração FFO do Fundamentus
 */
async function testFundamentusFFO() {
  console.log('🚀 INICIANDO TESTE DE EXTRAÇÃO FFO - FUNDAMENTUS\n');
  
  // Lista de FIIs para teste
  const testTickers = ['MXRF11', 'HGLG11', 'XPML11', 'VISC11'];
  
  console.log(`📊 Testando ${testTickers.length} FIIs: ${testTickers.join(', ')}\n`);
  
  const results = [];
  const errors = [];
  
  // Testar cada FII individualmente
  for (const ticker of testTickers) {
    try {
      console.log(`\n🔍 TESTANDO ${ticker}:`);
      console.log('='.repeat(50));
      
      const data = await fundamentusScraper.getFIIData(ticker);
      
      // Validar dados extraídos
      const validation = validateFFOData(data, ticker);
      
      results.push({
        ticker,
        data,
        validation,
        success: validation.isValid
      });
      
      // Exibir resultados
      displayResults(ticker, data, validation);
      
      // Delay entre requests
      if (ticker !== testTickers[testTickers.length - 1]) {
        console.log('\n⏳ Aguardando 3 segundos...');
        await delay(3000);
      }
      
    } catch (error) {
      console.error(`❌ ERRO ao testar ${ticker}:`, error.message);
      errors.push({ ticker, error: error.message });
    }
  }
  
  // Relatório final
  console.log('\n' + '='.repeat(80));
  console.log('📊 RELATÓRIO FINAL - TESTE FFO FUNDAMENTUS');
  console.log('='.repeat(80));
  
  displayFinalReport(results, errors, testTickers.length);
}

/**
 * ✅ VALIDAÇÃO DOS DADOS FFO
 */
function validateFFOData(data, ticker) {
  const validation = {
    isValid: true,
    errors: [],
    warnings: [],
    scores: {
      basic_data: 0,
      ffo_data: 0,
      financial_data: 0,
      total: 0
    }
  };
  
  // Validar dados básicos
  const basicFields = ['ticker', 'price', 'market_cap', 'shares_outstanding'];
  let basicScore = 0;
  
  basicFields.forEach(field => {
    if (data[field] !== null && data[field] !== undefined) {
      basicScore++;
    } else {
      validation.warnings.push(`Campo básico ausente: ${field}`);
    }
  });
  
  validation.scores.basic_data = (basicScore / basicFields.length) * 100;
  
  // Validar dados FFO (CRÍTICOS)
  const ffoFields = ['ffo_yield', 'ffo_per_share', 'ffo_12m', 'p_ffo'];
  let ffoScore = 0;
  
  ffoFields.forEach(field => {
    if (data[field] !== null && data[field] !== undefined) {
      ffoScore++;
    } else {
      validation.errors.push(`Campo FFO ausente: ${field}`);
    }
  });
  
  validation.scores.ffo_data = (ffoScore / ffoFields.length) * 100;
  
  // Validar dados financeiros complementares
  const financialFields = ['dividend_yield', 'pvp', 'revenue_12m', 'distributed_income_12m'];
  let financialScore = 0;
  
  financialFields.forEach(field => {
    if (data[field] !== null && data[field] !== undefined) {
      financialScore++;
    } else {
      validation.warnings.push(`Campo financeiro ausente: ${field}`);
    }
  });
  
  validation.scores.financial_data = (financialScore / financialFields.length) * 100;
  
  // Score total
  validation.scores.total = (
    validation.scores.basic_data * 0.3 +
    validation.scores.ffo_data * 0.5 +
    validation.scores.financial_data * 0.2
  );
  
  // Determinar se é válido (pelo menos 50% dos dados FFO)
  validation.isValid = validation.scores.ffo_data >= 50;
  
  return validation;
}

/**
 * 📊 EXIBIR RESULTADOS DE UM FII
 */
function displayResults(ticker, data, validation) {
  console.log(`\n✅ DADOS EXTRAÍDOS PARA ${ticker}:`);
  
  // Dados básicos
  console.log('\n📋 DADOS BÁSICOS:');
  console.log(`  • Ticker: ${data.ticker || 'N/A'}`);
  console.log(`  • Nome: ${data.name || 'N/A'}`);
  console.log(`  • Preço: R$ ${data.price || 'N/A'}`);
  console.log(`  • Market Cap: R$ ${data.market_cap?.toLocaleString() || 'N/A'}`);
  console.log(`  • Cotas: ${data.shares_outstanding?.toLocaleString() || 'N/A'}`);
  
  // Dados FFO (PRINCIPAIS)
  console.log('\n💰 DADOS FFO (PRINCIPAIS):');
  console.log(`  • FFO Yield: ${data.ffo_yield ? data.ffo_yield + '%' : '❌ N/A'}`);
  console.log(`  • FFO/Cota: ${data.ffo_per_share ? 'R$ ' + data.ffo_per_share : '❌ N/A'}`);
  console.log(`  • FFO 12M: ${data.ffo_12m ? 'R$ ' + data.ffo_12m.toLocaleString() : '❌ N/A'}`);
  console.log(`  • FFO 3M: ${data.ffo_3m ? 'R$ ' + data.ffo_3m.toLocaleString() : '❌ N/A'}`);
  console.log(`  • P/FFO: ${data.p_ffo || '❌ N/A'}`);
  
  // Dados financeiros complementares
  console.log('\n📊 DADOS FINANCEIROS:');
  console.log(`  • Dividend Yield: ${data.dividend_yield ? data.dividend_yield + '%' : 'N/A'}`);
  console.log(`  • P/VP: ${data.pvp || 'N/A'}`);
  console.log(`  • Receita 12M: ${data.revenue_12m ? 'R$ ' + data.revenue_12m.toLocaleString() : 'N/A'}`);
  console.log(`  • Renda Dist. 12M: ${data.distributed_income_12m ? 'R$ ' + data.distributed_income_12m.toLocaleString() : 'N/A'}`);
  
  // Dados patrimoniais
  console.log('\n🏛️ DADOS PATRIMONIAIS:');
  console.log(`  • Ativos Totais: ${data.total_assets ? 'R$ ' + data.total_assets.toLocaleString() : 'N/A'}`);
  console.log(`  • Patrimônio Líquido: ${data.net_equity ? 'R$ ' + data.net_equity.toLocaleString() : 'N/A'}`);
  console.log(`  • VP/Cota: ${data.equity_per_share ? 'R$ ' + data.equity_per_share : 'N/A'}`);
  
  // Scores de validação
  console.log('\n📊 SCORES DE QUALIDADE:');
  console.log(`  • Dados Básicos: ${validation.scores.basic_data.toFixed(1)}%`);
  console.log(`  • Dados FFO: ${validation.scores.ffo_data.toFixed(1)}% ${validation.scores.ffo_data >= 50 ? '✅' : '❌'}`);
  console.log(`  • Dados Financeiros: ${validation.scores.financial_data.toFixed(1)}%`);
  console.log(`  • SCORE TOTAL: ${validation.scores.total.toFixed(1)}% ${validation.isValid ? '✅' : '❌'}`);
  
  // Erros e avisos
  if (validation.errors.length > 0) {
    console.log('\n❌ ERROS:');
    validation.errors.forEach(error => console.log(`  • ${error}`));
  }
  
  if (validation.warnings.length > 0) {
    console.log('\n⚠️ AVISOS:');
    validation.warnings.forEach(warning => console.log(`  • ${warning}`));
  }
}

/**
 * 📊 RELATÓRIO FINAL
 */
function displayFinalReport(results, errors, totalTickers) {
  const successCount = results.filter(r => r.success).length;
  const successRate = (successCount / totalTickers) * 100;
  
  console.log(`\n📊 ESTATÍSTICAS GERAIS:`);
  console.log(`  • Total de FIIs testados: ${totalTickers}`);
  console.log(`  • Sucessos: ${successCount}`);
  console.log(`  • Erros: ${errors.length}`);
  console.log(`  • Taxa de sucesso: ${successRate.toFixed(1)}%`);
  
  // Análise por campo FFO
  console.log(`\n💰 ANÁLISE DOS CAMPOS FFO:`);
  
  const ffoFields = ['ffo_yield', 'ffo_per_share', 'ffo_12m', 'ffo_3m', 'p_ffo'];
  
  ffoFields.forEach(field => {
    const available = results.filter(r => r.data[field] !== null && r.data[field] !== undefined).length;
    const rate = (available / results.length) * 100;
    console.log(`  • ${field}: ${available}/${results.length} (${rate.toFixed(1)}%) ${rate >= 50 ? '✅' : '❌'}`);
  });
  
  // Comparação com Status Invest
  console.log(`\n🔄 COMPARAÇÃO COM STATUS INVEST:`);
  console.log(`  • Status Invest FFO: 0% ❌`);
  console.log(`  • Fundamentus FFO: ${successRate.toFixed(1)}% ${successRate >= 50 ? '✅' : '❌'}`);
  console.log(`  • Melhoria: +${successRate.toFixed(1)} pontos percentuais`);
  
  // Recomendações
  console.log(`\n💡 RECOMENDAÇÕES:`);
  
  if (successRate >= 75) {
    console.log(`  ✅ EXCELENTE: Implementar Fundamentus como fonte principal para FFO`);
    console.log(`  ✅ Usar Status Invest para dados básicos + Fundamentus para FFO`);
  } else if (successRate >= 50) {
    console.log(`  ⚠️ BOM: Implementar Fundamentus como fonte complementar para FFO`);
    console.log(`  ⚠️ Continuar investigando melhorias na extração`);
  } else {
    console.log(`  ❌ INSUFICIENTE: Investigar problemas na extração`);
    console.log(`  ❌ Considerar outras fontes para FFO`);
  }
  
  // Próximos passos
  console.log(`\n🚀 PRÓXIMOS PASSOS:`);
  console.log(`  1. ${successRate >= 50 ? '✅' : '🔄'} Implementar sistema híbrido (Status Invest + Fundamentus)`);
  console.log(`  2. 🔄 Criar cache para otimizar performance`);
  console.log(`  3. 🔄 Implementar fallback entre fontes`);
  console.log(`  4. 🔄 Adicionar validação cruzada de dados`);
  
  // Dados detalhados por FII
  if (results.length > 0) {
    console.log(`\n📋 DETALHES POR FII:`);
    results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      const score = result.validation.scores.total.toFixed(1);
      console.log(`  • ${result.ticker}: ${status} ${score}% (FFO: ${result.validation.scores.ffo_data.toFixed(1)}%)`);
    });
  }
  
  if (errors.length > 0) {
    console.log(`\n❌ ERROS ENCONTRADOS:`);
    errors.forEach(error => {
      console.log(`  • ${error.ticker}: ${error.error}`);
    });
  }
}

/**
 * 🛠️ UTILITÁRIO: DELAY
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 🚀 EXECUTAR TESTE
testFundamentusFFO().catch(error => {
  console.error('❌ ERRO CRÍTICO no teste:', error);
  process.exit(1);
}); 
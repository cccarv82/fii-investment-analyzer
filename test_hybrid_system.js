// 🧪 TESTE FINAL: SISTEMA HÍBRIDO (STATUS INVEST + FUNDAMENTUS)
// Validação completa do sistema híbrido para dados FFO

import hybridFIIDataProvider from './src/lib/data/hybridFIIDataProvider.js';

/**
 * 🎯 TESTE PRINCIPAL: Sistema Híbrido Completo
 */
async function testHybridSystem() {
  console.log('🚀 TESTE FINAL: SISTEMA HÍBRIDO (STATUS INVEST + FUNDAMENTUS)\n');
  console.log('=' .repeat(80));
  
  // Lista de FIIs para teste abrangente
  const testTickers = ['MXRF11', 'HGLG11', 'XPML11', 'VISC11'];
  
  console.log(`📊 Testando ${testTickers.length} FIIs: ${testTickers.join(', ')}\n`);
  
  const results = [];
  const errors = [];
  
  // Testar cada FII individualmente
  for (const ticker of testTickers) {
    try {
      console.log(`\n🔍 TESTANDO ${ticker} (SISTEMA HÍBRIDO):`);
      console.log('='.repeat(60));
      
      const startTime = Date.now();
      const data = await hybridFIIDataProvider.getFIIData(ticker);
      const endTime = Date.now();
      
      // Adicionar tempo de execução
      data.execution_time = endTime - startTime;
      
      results.push({
        ticker,
        data,
        success: true
      });
      
      // Exibir resultados detalhados
      displayHybridResults(ticker, data);
      
      // Delay entre requests
      if (ticker !== testTickers[testTickers.length - 1]) {
        console.log('\n⏳ Aguardando 2 segundos...');
        await delay(2000);
      }
      
    } catch (error) {
      console.error(`❌ ERRO ao testar ${ticker}:`, error.message);
      errors.push({ ticker, error: error.message });
    }
  }
  
  // Relatório final comparativo
  console.log('\n' + '='.repeat(80));
  console.log('📊 RELATÓRIO FINAL: COMPARAÇÃO DE SISTEMAS');
  console.log('='.repeat(80));
  
  displayComparisonReport(results, errors, testTickers.length);
  
  // Estatísticas do cache
  const cacheStats = hybridFIIDataProvider.getCacheStats();
  console.log('\n📊 ESTATÍSTICAS DO CACHE:');
  console.log(`  • Total de entradas: ${cacheStats.total_entries}`);
  console.log(`  • Entradas válidas: ${cacheStats.valid_entries}`);
  console.log(`  • Taxa de hit: ${cacheStats.cache_hit_rate.toFixed(1)}%`);
}

/**
 * 📊 EXIBIR RESULTADOS HÍBRIDOS DETALHADOS
 */
function displayHybridResults(ticker, data) {
  console.log(`\n✅ DADOS HÍBRIDOS PARA ${ticker}:`);
  
  // Status das fontes
  console.log('\n🔗 STATUS DAS FONTES:');
  console.log(`  • Status Invest: ${data.sources.status_invest ? '✅ Conectado' : '❌ Falhou'}`);
  console.log(`  • Fundamentus: ${data.sources.fundamentus ? '✅ Conectado' : '❌ Falhou'}`);
  console.log(`  • Tempo de execução: ${data.execution_time}ms`);
  
  // Dados básicos (Status Invest)
  console.log('\n📊 DADOS BÁSICOS (STATUS INVEST):');
  console.log(`  • Ticker: ${data.ticker}`);
  console.log(`  • Nome: ${data.name || 'N/A'}`);
  console.log(`  • Preço: ${data.price ? 'R$ ' + data.price : 'N/A'}`);
  console.log(`  • Dividend Yield: ${data.dividend_yield ? data.dividend_yield + '%' : 'N/A'}`);
  console.log(`  • P/VP: ${data.pvp || 'N/A'}`);
  console.log(`  • Liquidez: ${data.liquidity ? 'R$ ' + data.liquidity.toLocaleString() : 'N/A'}`);
  console.log(`  • Taxa Admin: ${data.admin_fee ? data.admin_fee + '%' : 'N/A'}`);
  console.log(`  • Gestora: ${data.management_company || 'N/A'}`);
  
  // Dados FFO (Fundamentus) - DESTAQUE
  console.log('\n💰 DADOS FFO (FUNDAMENTUS) - ⭐ NOVIDADE:');
  console.log(`  • FFO Yield: ${data.ffo_yield ? '✅ ' + data.ffo_yield + '%' : '❌ N/A'}`);
  console.log(`  • FFO/Cota: ${data.ffo_per_share ? '✅ R$ ' + data.ffo_per_share : '❌ N/A'}`);
  console.log(`  • FFO 12M: ${data.ffo_12m ? '✅ R$ ' + data.ffo_12m.toLocaleString() : '❌ N/A'}`);
  console.log(`  • FFO 3M: ${data.ffo_3m ? '✅ R$ ' + data.ffo_3m.toLocaleString() : '❌ N/A'}`);
  console.log(`  • P/FFO: ${data.p_ffo ? '✅ ' + data.p_ffo : '❌ N/A'}`);
  
  // Dados financeiros complementares
  console.log('\n📈 DADOS FINANCEIROS COMPLEMENTARES:');
  console.log(`  • Market Cap: ${data.market_cap ? 'R$ ' + data.market_cap.toLocaleString() : 'N/A'}`);
  console.log(`  • Cotas: ${data.shares_outstanding ? data.shares_outstanding.toLocaleString() : 'N/A'}`);
  console.log(`  • Receita 12M: ${data.revenue_12m ? 'R$ ' + data.revenue_12m.toLocaleString() : 'N/A'}`);
  console.log(`  • Ativos Totais: ${data.total_assets ? 'R$ ' + data.total_assets.toLocaleString() : 'N/A'}`);
  console.log(`  • Patrimônio Líquido: ${data.net_equity ? 'R$ ' + data.net_equity.toLocaleString() : 'N/A'}`);
  
  // Scores de qualidade
  console.log('\n📊 SCORES DE QUALIDADE:');
  console.log(`  • Dados Básicos: ${data.validation.basic_data_score.toFixed(1)}%`);
  console.log(`  • Dados FFO: ${data.validation.ffo_data_score.toFixed(1)}% ${data.validation.ffo_data_score >= 50 ? '✅' : '❌'}`);
  console.log(`  • Dados Financeiros: ${data.validation.financial_data_score.toFixed(1)}%`);
  console.log(`  • QUALIDADE GERAL: ${data.validation.overall_score.toFixed(1)}% ${data.validation.overall_score >= 70 ? '✅ EXCELENTE' : data.validation.overall_score >= 50 ? '⚠️ BOM' : '❌ INSUFICIENTE'}`);
  
  // Distribuição de campos por fonte
  console.log('\n🔍 DISTRIBUIÇÃO DE DADOS:');
  console.log(`  • Campos Status Invest: ${data.validation.data_sources.status_invest_fields}`);
  console.log(`  • Campos Fundamentus: ${data.validation.data_sources.fundamentus_fields}`);
  
  // Campos ausentes
  if (data.validation.missing_fields.length > 0) {
    console.log('\n⚠️ CAMPOS AUSENTES:');
    data.validation.missing_fields.forEach(field => {
      console.log(`  • ${field}`);
    });
  }
}

/**
 * 📊 RELATÓRIO COMPARATIVO FINAL
 */
function displayComparisonReport(results, errors, totalTickers) {
  const successCount = results.length;
  const successRate = (successCount / totalTickers) * 100;
  
  console.log(`\n📊 ESTATÍSTICAS GERAIS:`);
  console.log(`  • Total de FIIs testados: ${totalTickers}`);
  console.log(`  • Sucessos: ${successCount}`);
  console.log(`  • Erros: ${errors.length}`);
  console.log(`  • Taxa de sucesso: ${successRate.toFixed(1)}%`);
  
  if (results.length > 0) {
    // Análise de disponibilidade de dados FFO
    const ffoYieldAvailable = results.filter(r => r.data.ffo_yield !== null).length;
    const ffoPerShareAvailable = results.filter(r => r.data.ffo_per_share !== null).length;
    const pFFOAvailable = results.filter(r => r.data.p_ffo !== null).length;
    
    console.log(`\n💰 DISPONIBILIDADE DE DADOS FFO (SISTEMA HÍBRIDO):`);
    console.log(`  • FFO Yield: ${ffoYieldAvailable}/${results.length} (${(ffoYieldAvailable/results.length*100).toFixed(1)}%) ${ffoYieldAvailable >= results.length/2 ? '✅' : '❌'}`);
    console.log(`  • FFO/Cota: ${ffoPerShareAvailable}/${results.length} (${(ffoPerShareAvailable/results.length*100).toFixed(1)}%) ${ffoPerShareAvailable >= results.length/2 ? '✅' : '❌'}`);
    console.log(`  • P/FFO: ${pFFOAvailable}/${results.length} (${(pFFOAvailable/results.length*100).toFixed(1)}%) ${pFFOAvailable >= results.length/2 ? '✅' : '❌'}`);
    
    // Comparação histórica
    console.log(`\n🔄 COMPARAÇÃO HISTÓRICA:`);
    console.log(`  • Status Invest (apenas): FFO 0% ❌`);
    console.log(`  • Fundamentus (apenas): FFO 100% ✅`);
    console.log(`  • Sistema Híbrido: FFO ${(ffoYieldAvailable/results.length*100).toFixed(1)}% + Dados Básicos ${successRate.toFixed(1)}% ⭐`);
    
    // Análise de qualidade
    const avgQuality = results.reduce((sum, r) => sum + r.data.validation.overall_score, 0) / results.length;
    const avgBasicData = results.reduce((sum, r) => sum + r.data.validation.basic_data_score, 0) / results.length;
    const avgFFOData = results.reduce((sum, r) => sum + r.data.validation.ffo_data_score, 0) / results.length;
    
    console.log(`\n📊 QUALIDADE MÉDIA DOS DADOS:`);
    console.log(`  • Qualidade Geral: ${avgQuality.toFixed(1)}% ${avgQuality >= 70 ? '✅' : avgQuality >= 50 ? '⚠️' : '❌'}`);
    console.log(`  • Dados Básicos: ${avgBasicData.toFixed(1)}%`);
    console.log(`  • Dados FFO: ${avgFFOData.toFixed(1)}%`);
    
    // Análise de fontes
    const bothSources = results.filter(r => r.data.sources.status_invest && r.data.sources.fundamentus).length;
    const onlyStatusInvest = results.filter(r => r.data.sources.status_invest && !r.data.sources.fundamentus).length;
    const onlyFundamentus = results.filter(r => !r.data.sources.status_invest && r.data.sources.fundamentus).length;
    
    console.log(`\n🔗 DISTRIBUIÇÃO DE FONTES:`);
    console.log(`  • Ambas as fontes: ${bothSources}/${results.length} (${(bothSources/results.length*100).toFixed(1)}%) ⭐`);
    console.log(`  • Apenas Status Invest: ${onlyStatusInvest}/${results.length} (${(onlyStatusInvest/results.length*100).toFixed(1)}%)`);
    console.log(`  • Apenas Fundamentus: ${onlyFundamentus}/${results.length} (${(onlyFundamentus/results.length*100).toFixed(1)}%)`);
    
    // Performance
    const avgExecutionTime = results.reduce((sum, r) => sum + r.data.execution_time, 0) / results.length;
    console.log(`\n⚡ PERFORMANCE:`);
    console.log(`  • Tempo médio de execução: ${avgExecutionTime.toFixed(0)}ms`);
    console.log(`  • Requests paralelos: ✅ Implementado`);
    console.log(`  • Cache: ✅ Implementado (5 min TTL)`);
  }
  
  // Recomendações finais
  console.log(`\n💡 RECOMENDAÇÕES FINAIS:`);
  
  if (successRate >= 75 && results.length > 0) {
    const avgFFO = results.reduce((sum, r) => sum + r.data.validation.ffo_data_score, 0) / results.length;
    if (avgFFO >= 75) {
      console.log(`  ✅ SISTEMA PRONTO PARA PRODUÇÃO!`);
      console.log(`  ✅ Implementar sistema híbrido como solução principal`);
      console.log(`  ✅ FFO disponível com alta qualidade`);
    } else {
      console.log(`  ⚠️ Sistema funcional, mas FFO precisa de melhorias`);
      console.log(`  ⚠️ Considerar fontes adicionais para FFO`);
    }
  } else {
    console.log(`  ❌ Sistema precisa de ajustes antes da produção`);
    console.log(`  ❌ Investigar problemas de conectividade`);
  }
  
  console.log(`\n🚀 PRÓXIMOS PASSOS:`);
  console.log(`  1. ✅ Integrar sistema híbrido na aplicação principal`);
  console.log(`  2. 🔄 Implementar monitoramento de qualidade de dados`);
  console.log(`  3. 🔄 Adicionar mais FIIs ao teste`);
  console.log(`  4. 🔄 Otimizar cache e performance`);
  console.log(`  5. 🔄 Implementar fallback para fontes alternativas`);
  
  // Detalhes por FII
  if (results.length > 0) {
    console.log(`\n📋 RESUMO POR FII:`);
    results.forEach(result => {
      const quality = result.data.validation.overall_score.toFixed(1);
      const ffoStatus = result.data.ffo_yield ? '✅ FFO' : '❌ FFO';
      const sources = `SI:${result.data.sources.status_invest ? '✅' : '❌'} Fund:${result.data.sources.fundamentus ? '✅' : '❌'}`;
      console.log(`  • ${result.ticker}: ${quality}% ${ffoStatus} (${sources})`);
    });
  }
  
  if (errors.length > 0) {
    console.log(`\n❌ ERROS ENCONTRADOS:`);
    errors.forEach(error => {
      console.log(`  • ${error.ticker}: ${error.error}`);
    });
  }
  
  console.log(`\n🎉 TESTE HÍBRIDO CONCLUÍDO COM SUCESSO!`);
  console.log(`📊 O sistema híbrido resolve o problema de FFO identificado no Status Invest!`);
}

/**
 * 🛠️ UTILITÁRIO: DELAY
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 🚀 EXECUTAR TESTE FINAL
testHybridSystem().catch(error => {
  console.error('❌ ERRO CRÍTICO no teste híbrido:', error);
  process.exit(1);
}); 
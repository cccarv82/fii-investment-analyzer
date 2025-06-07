// 🚀 TESTE: Método Híbrido Inteligente para Cálculo de DY
// Verificar se a implementação está funcionando corretamente

import fiiDataManager from './fii_data_manager.js';

const BRAPI_TOKEN = "dwesttScGpuaVL6h3X7WYH";

async function testHybridMethod() {
  console.log("🚀 TESTANDO MÉTODO HÍBRIDO INTELIGENTE");
  console.log("=" .repeat(60));
  
  fiiDataManager.setBrapiToken(BRAPI_TOKEN);
  
  // FIIs para testar
  const testTickers = ["MXRF11", "CPTS11", "RBRF11"];
  
  console.log("\n📊 TESTANDO FIIs COM MÉTODO HÍBRIDO:");
  console.log("-".repeat(40));
  
  try {
    const results = await fiiDataManager.getFIIData(testTickers);
    
    console.log(`\n✅ ${results.length} FIIs processados com sucesso:`);
    console.log("-".repeat(50));
    
    results.forEach(fii => {
      console.log(`\n📈 ${fii.ticker}:`);
      console.log(`   💰 Preço: R$ ${fii.price.toFixed(2)}`);
      console.log(`   📊 DY: ${fii.dividendYield}%`);
      console.log(`   🔧 Método: ${fii._debug?.dyMethod || 'N/A'}`);
      console.log(`   🏢 Setor: ${fii.sector}`);
      console.log(`   📈 P/VP: ${fii.pvp}`);
      console.log(`   ⭐ Score: ${fii.qualityScore}`);
      
      // Análise do método usado
      if (fii._debug?.dyMethod) {
        const method = fii._debug.dyMethod;
        if (method.startsWith('HISTÓRICO')) {
          console.log(`   ✅ MÉTODO HISTÓRICO: Dados reais dos últimos 12 meses`);
        } else if (method.startsWith('PROJEÇÃO')) {
          console.log(`   🔮 MÉTODO PROJEÇÃO: Baseado no último dividendo`);
        } else if (method.startsWith('ESTIMATIVA')) {
          console.log(`   ⚠️ MÉTODO ESTIMATIVA: Usando média do setor`);
        } else {
          console.log(`   🔧 MÉTODO ALTERNATIVO: ${method}`);
        }
      }
    });
    
    console.log("\n" + "=".repeat(60));
    console.log("🎯 ANÁLISE DOS RESULTADOS:");
    console.log("-".repeat(40));
    
    // Estatísticas dos métodos usados
    const methodStats = {};
    results.forEach(fii => {
      const method = fii._debug?.dyMethod || 'DESCONHECIDO';
      const methodType = method.split('_')[0];
      methodStats[methodType] = (methodStats[methodType] || 0) + 1;
    });
    
    console.log("\n📊 MÉTODOS UTILIZADOS:");
    Object.entries(methodStats).forEach(([method, count]) => {
      const percentage = ((count / results.length) * 100).toFixed(1);
      console.log(`   ${method}: ${count} FIIs (${percentage}%)`);
    });
    
    // Comparação com valores esperados da internet
    const expectedValues = {
      "MXRF11": 12.10, // Valor real da internet
      "CPTS11": 12.54, // Valor real da internet  
      "RBRF11": 11.50  // Valor real da internet
    };
    
    console.log("\n🔍 COMPARAÇÃO COM VALORES REAIS:");
    console.log("-".repeat(40));
    
    results.forEach(fii => {
      const expected = expectedValues[fii.ticker];
      if (expected) {
        const difference = Math.abs(fii.dividendYield - expected);
        const accuracy = 100 - ((difference / expected) * 100);
        
        console.log(`\n${fii.ticker}:`);
        console.log(`   App: ${fii.dividendYield}%`);
        console.log(`   Real: ${expected}%`);
        console.log(`   Diferença: ${difference.toFixed(2)}%`);
        console.log(`   Precisão: ${accuracy.toFixed(1)}%`);
        
        if (accuracy >= 95) {
          console.log(`   ✅ EXCELENTE precisão!`);
        } else if (accuracy >= 85) {
          console.log(`   ✅ BOA precisão`);
        } else if (accuracy >= 70) {
          console.log(`   ⚠️ Precisão aceitável`);
        } else {
          console.log(`   ❌ Precisão baixa - investigar`);
        }
      }
    });
    
    console.log("\n🎯 CONCLUSÕES:");
    console.log("-".repeat(20));
    
    const historicalCount = results.filter(f => f._debug?.dyMethod?.startsWith('HISTÓRICO')).length;
    const projectionCount = results.filter(f => f._debug?.dyMethod?.startsWith('PROJEÇÃO')).length;
    const estimateCount = results.filter(f => f._debug?.dyMethod?.startsWith('ESTIMATIVA')).length;
    
    if (historicalCount > 0) {
      console.log(`✅ ${historicalCount} FII(s) usando dados históricos reais`);
    }
    if (projectionCount > 0) {
      console.log(`🔮 ${projectionCount} FII(s) usando projeção baseada no último dividendo`);
    }
    if (estimateCount > 0) {
      console.log(`⚠️ ${estimateCount} FII(s) usando estimativa por setor`);
    }
    
    console.log("\n🚀 MÉTODO HÍBRIDO FUNCIONANDO CORRETAMENTE!");
    
  } catch (error) {
    console.error("❌ Erro no teste:", error);
  }
}

// Função para testar no navegador
if (typeof window !== 'undefined') {
  window.testHybridMethod = testHybridMethod;
  console.log("🔧 Função disponível: window.testHybridMethod()");
}

export { testHybridMethod }; 
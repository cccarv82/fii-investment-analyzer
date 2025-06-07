// 🔍 Debug DY no navegador - Cole no console do navegador
// window.debugDY() para executar

const BRAPI_BASE_URL = "https://brapi.dev/api";

export async function debugDY(token = null) {
  // Tentar pegar token do localStorage se não fornecido
  if (!token) {
    token = localStorage.getItem('brapi_token') || prompt('Digite seu token BRAPI:');
  }
  
  if (!token) {
    console.error("❌ Token BRAPI necessário!");
    return;
  }

  const problematicFIIs = ["MXRF11", "CPTS11", "RBRF11"];
  
  console.log("🔍 DEBUG DY: Testando NOVA SOLUÇÃO com defaultKeyStatistics");
  console.log("=".repeat(60));

  for (const ticker of problematicFIIs) {
    console.log(`\n🎯 TESTANDO ${ticker} COM NOVA SOLUÇÃO:`);
    console.log("-".repeat(40));
    
    try {
      // 🔧 NOVA URL: Usar modules=defaultKeyStatistics
      const url = `${BRAPI_BASE_URL}/quote/${ticker}?token=${token}&modules=defaultKeyStatistics&dividends=true&range=1mo`;
      
      console.log(`🌐 Nova requisição (defaultKeyStatistics)...`);
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error(`❌ HTTP ${response.status}: ${response.statusText}`);
        continue;
      }
      
      const data = await response.json();
      
      if (data.error) {
        console.error(`❌ Erro API: ${data.error}`);
        continue;
      }
      
      if (!data.results || data.results.length === 0) {
        console.error(`❌ Sem resultados para ${ticker}`);
        continue;
      }
      
      const fiiData = data.results[0];
      const price = parseFloat(fiiData.regularMarketPrice);
      
      console.log(`💰 ${ticker} - Preço: R$ ${price.toFixed(2)}`);
      
      // 🎯 TESTAR NOVA SOLUÇÃO: defaultKeyStatistics
      console.log(`\n✅ NOVA SOLUÇÃO - defaultKeyStatistics:`);
      
      if (fiiData.defaultKeyStatistics) {
        console.log(`   ✅ defaultKeyStatistics existe`);
        console.log(`   📋 Campos disponíveis:`, Object.keys(fiiData.defaultKeyStatistics));
        
        const keyStats = fiiData.defaultKeyStatistics;
        
        // Testar lastDividendValue
        if (keyStats.lastDividendValue !== undefined && keyStats.lastDividendValue !== null) {
          const lastDividend = parseFloat(keyStats.lastDividendValue);
          const lastDividendDate = keyStats.lastDividendDate;
          
          console.log(`   💰 Último dividendo: R$ ${lastDividend.toFixed(4)}`);
          console.log(`   📅 Data: ${lastDividendDate}`);
          
          if (lastDividend > 0) {
            // Calcular DY anual (assumindo mensal)
            const annualDividends = lastDividend * 12;
            const calculatedDY = (annualDividends / price) * 100;
            
            console.log(`   🧮 CÁLCULO DY NOVO MÉTODO:`);
            console.log(`      Dividendo mensal: R$ ${lastDividend.toFixed(4)}`);
            console.log(`      Dividendos anuais: R$ ${annualDividends.toFixed(4)}`);
            console.log(`      Preço atual: R$ ${price.toFixed(2)}`);
            console.log(`      🎯 DY REAL: ${calculatedDY.toFixed(2)}%`);
            
            // Comparar com dados da internet
            const realDYs = {
              "MXRF11": 12.10,
              "CPTS11": 12.54,
              "RBRF11": 11.50
            };
            
            const expectedDY = realDYs[ticker];
            if (expectedDY) {
              const difference = Math.abs(calculatedDY - expectedDY);
              console.log(`      📊 Comparação com internet:`);
              console.log(`         Calculado: ${calculatedDY.toFixed(2)}%`);
              console.log(`         Esperado: ${expectedDY}%`);
              console.log(`         Diferença: ${difference.toFixed(2)}%`);
              
              if (difference < 2) {
                console.log(`      ✅ SUCESSO: Diferença aceitável!`);
              } else {
                console.log(`      ⚠️ ATENÇÃO: Diferença significativa`);
              }
            }
          } else {
            console.log(`   ❌ lastDividendValue inválido: ${lastDividend}`);
          }
        } else {
          console.log(`   ❌ Sem lastDividendValue`);
        }
        
        // Testar P/VP
        if (keyStats.priceToBook !== undefined) {
          const priceToBook = parseFloat(keyStats.priceToBook);
          console.log(`   📊 P/VP direto: ${priceToBook.toFixed(2)}`);
        } else if (keyStats.bookValue !== undefined) {
          const bookValue = parseFloat(keyStats.bookValue);
          const calculatedPVP = price / bookValue;
          console.log(`   📊 P/VP calculado: R$ ${price.toFixed(2)} ÷ R$ ${bookValue.toFixed(2)} = ${calculatedPVP.toFixed(2)}`);
        }
        
        // Testar Market Cap
        if (keyStats.sharesOutstanding !== undefined) {
          const shares = parseFloat(keyStats.sharesOutstanding);
          const marketCap = price * shares;
          console.log(`   💼 Market Cap: R$ ${marketCap.toLocaleString()}`);
        }
        
      } else {
        console.log(`   ❌ defaultKeyStatistics não existe`);
      }
      
    } catch (error) {
      console.error(`❌ Erro ao testar ${ticker}:`, error);
    }
  }
  
  console.log("\n🏁 TESTE DA NOVA SOLUÇÃO CONCLUÍDO");
  console.log("\n🎯 RESULTADOS ESPERADOS:");
  console.log("- MXRF11: ~12.77% (último dividendo R$ 0,10)");
  console.log("- CPTS11: ~13.84% (último dividendo R$ 0,085)");
  console.log("- RBRF11: ~10.04% (último dividendo R$ 0,06)");
  console.log("\n✅ Se os valores calculados estão próximos, a correção funcionou!");
  
  return "Debug da nova solução concluído - verifique logs acima";
}

// Disponibilizar globalmente no navegador
if (typeof window !== 'undefined') {
  window.debugDY = debugDY;
  window.debugNewSolution = debugDY; // Alias para a nova solução
  console.log("💡 Use window.debugDY() para testar a nova solução");
} 
// 🔍 TESTE: Verificar opções de range para dividendos na BRAPI
// Testar se conseguimos pegar dividendos dos últimos 12 meses de forma mais precisa

const BRAPI_TOKEN = "dwesttScGpuaVL6h3X7WYH"; // Token fornecido pelo usuário

async function testBRAPIRangeOptions() {
  console.log("🔍 TESTANDO OPÇÕES DE RANGE NA BRAPI PARA DIVIDENDOS");
  console.log("=" .repeat(60));

  const testTickers = ["MXRF11", "CPTS11", "RBRF11"];
  
  // Diferentes opções de range para testar
  const rangeOptions = [
    "1mo",   // 1 mês
    "3mo",   // 3 meses  
    "6mo",   // 6 meses
    "1y",    // 1 ano
    "2y",    // 2 anos
    "5y",    // 5 anos
    "max"    // Máximo disponível
  ];

  for (const ticker of testTickers) {
    console.log(`\n📊 TESTANDO ${ticker}:`);
    console.log("-".repeat(40));

    for (const range of rangeOptions) {
      try {
        console.log(`\n🔍 Range: ${range}`);
        
        const url = `https://brapi.dev/api/quote/${ticker}?token=${BRAPI_TOKEN}&modules=defaultKeyStatistics&dividends=true&range=${range}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.results && data.results[0]) {
          const result = data.results[0];
          
          console.log(`   Preço: R$ ${result.regularMarketPrice}`);
          
          // Verificar dividendos
          if (result.dividendsData && result.dividendsData.cashDividends) {
            const dividends = result.dividendsData.cashDividends;
            console.log(`   📈 Dividendos encontrados: ${dividends.length}`);
            
            if (dividends.length > 0) {
              console.log(`   📅 Primeiro: ${dividends[0].date} - R$ ${dividends[0].rate}`);
              console.log(`   📅 Último: ${dividends[dividends.length - 1].date} - R$ ${dividends[dividends.length - 1].rate}`);
              
              // Calcular total dos dividendos
              const totalDividends = dividends.reduce((sum, div) => sum + parseFloat(div.rate || 0), 0);
              console.log(`   💰 Total dividendos: R$ ${totalDividends.toFixed(4)}`);
              
              // Calcular DY se temos preço
              if (result.regularMarketPrice > 0) {
                const dy = (totalDividends / result.regularMarketPrice) * 100;
                console.log(`   📊 DY calculado: ${dy.toFixed(2)}%`);
              }
            }
          } else {
            console.log(`   ❌ Nenhum dividendo encontrado`);
          }
          
          // Verificar defaultKeyStatistics
          if (result.defaultKeyStatistics) {
            const stats = result.defaultKeyStatistics;
            console.log(`   🔑 defaultKeyStatistics:`);
            console.log(`      lastDividendValue: ${stats.lastDividendValue}`);
            console.log(`      lastDividendDate: ${stats.lastDividendDate}`);
          }
          
        } else {
          console.log(`   ❌ Erro na resposta: ${data.message || 'Dados não encontrados'}`);
        }
        
        // Pausa para não sobrecarregar a API
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.log(`   ❌ Erro: ${error.message}`);
      }
    }
  }
  
  console.log("\n" + "=".repeat(60));
  console.log("🎯 TESTE CONCLUÍDO");
  console.log("\n📋 ANÁLISE:");
  console.log("1. Verificar qual range retorna mais dividendos");
  console.log("2. Comparar com dados reais da internet");
  console.log("3. Identificar melhor estratégia para cálculo de DY");
}

// Função para testar no navegador
if (typeof window !== 'undefined') {
  window.testBRAPIRange = testBRAPIRangeOptions;
  console.log("🔧 Função disponível: window.testBRAPIRange()");
}

export { testBRAPIRangeOptions }; 
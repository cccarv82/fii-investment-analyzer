// 🔍 Script de teste para investigar dados da BRAPI
// Usado para debuggar o problema dos DYs incorretos

const BRAPI_BASE_URL = "https://brapi.dev/api";

export async function testBRAPIData(token, tickers = ["MXRF11", "CPTS11", "RBRF11"]) {
  console.log("🔍 TESTE BRAPI - Investigando dados de DY...");
  console.log(`📊 Testando: ${tickers.join(", ")}`);
  
  if (!token) {
    console.error("❌ Token BRAPI não fornecido!");
    return;
  }

  for (const ticker of tickers) {
    console.log(`\n🎯 TESTANDO ${ticker}:`);
    console.log("=".repeat(50));
    
    try {
      // Fazer requisição igual ao nosso código
      const url = `${BRAPI_BASE_URL}/quote/${ticker}?token=${token}&fundamental=true&dividends=true&range=1mo`;
      console.log(`🌐 URL: ${url.replace(token, "***TOKEN***")}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error(`❌ Erro HTTP ${response.status}: ${response.statusText}`);
        continue;
      }
      
      const data = await response.json();
      
      if (data.error) {
        console.error(`❌ Erro API: ${data.error}`);
        continue;
      }
      
      if (!data.results || data.results.length === 0) {
        console.error(`❌ Nenhum resultado para ${ticker}`);
        continue;
      }
      
      const fiiData = data.results[0];
      
      console.log(`✅ Dados recebidos para ${ticker}:`);
      console.log(`   Symbol: ${fiiData.symbol}`);
      console.log(`   Price: R$ ${fiiData.regularMarketPrice}`);
      console.log(`   Short Name: ${fiiData.shortName}`);
      
      // Verificar dados de dividendos
      console.log(`\n📊 DADOS DE DIVIDENDOS:`);
      if (fiiData.dividendsData) {
        console.log(`   ✅ dividendsData existe`);
        
        if (fiiData.dividendsData.cashDividends) {
          const dividends = fiiData.dividendsData.cashDividends;
          console.log(`   ✅ cashDividends: ${dividends.length} registros`);
          
          // Mostrar últimos 5 dividendos
          console.log(`   📅 Últimos dividendos:`);
          dividends.slice(-5).forEach((div, index) => {
            console.log(`     ${index + 1}. ${div.paymentDate || div.date}: R$ ${div.rate}`);
          });
          
          // Calcular DY dos últimos 12 meses
          const now = new Date();
          const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
          
          const recentDividends = dividends.filter(div => {
            const divDate = new Date(div.paymentDate || div.date);
            return divDate >= oneYearAgo;
          });
          
          const totalDividends = recentDividends.reduce((sum, div) => sum + (parseFloat(div.rate) || 0), 0);
          const price = parseFloat(fiiData.regularMarketPrice);
          const calculatedDY = price > 0 ? (totalDividends / price) * 100 : 0;
          
          console.log(`   🧮 CÁLCULO DY 12M:`);
          console.log(`     Dividendos 12m: ${recentDividends.length} pagamentos`);
          console.log(`     Total 12m: R$ ${totalDividends.toFixed(4)}`);
          console.log(`     Preço atual: R$ ${price.toFixed(2)}`);
          console.log(`     DY calculado: ${calculatedDY.toFixed(2)}%`);
          
        } else {
          console.log(`   ❌ cashDividends não existe`);
        }
      } else {
        console.log(`   ❌ dividendsData não existe`);
      }
      
      // Verificar dados fundamentais
      console.log(`\n📈 DADOS FUNDAMENTAIS:`);
      if (fiiData.fundamentalData) {
        console.log(`   ✅ fundamentalData existe`);
        console.log(`   dividendYield: ${fiiData.fundamentalData.dividendYield}`);
        console.log(`   bookValue: ${fiiData.fundamentalData.bookValue}`);
        console.log(`   sharesOutstanding: ${fiiData.fundamentalData.sharesOutstanding}`);
        
        if (fiiData.fundamentalData.dividendYield) {
          const fundamentalDY = parseFloat(fiiData.fundamentalData.dividendYield);
          console.log(`   🧮 DY Fundamental: ${fundamentalDY} (${fundamentalDY * 100}%)`);
        }
      } else {
        console.log(`   ❌ fundamentalData não existe`);
      }
      
      // Verificar outros campos relevantes
      console.log(`\n🔍 OUTROS DADOS:`);
      console.log(`   marketCap: ${fiiData.marketCap}`);
      console.log(`   volume: ${fiiData.regularMarketVolume}`);
      console.log(`   previousClose: ${fiiData.regularMarketPreviousClose}`);
      
    } catch (error) {
      console.error(`❌ Erro ao testar ${ticker}:`, error);
    }
  }
  
  console.log("\n🏁 TESTE CONCLUÍDO");
}

// Função para testar no console do navegador
export function runBRAPITest() {
  // Pegar token do localStorage ou contexto
  const token = localStorage.getItem('brapi_token') || prompt('Digite seu token BRAPI:');
  
  if (!token) {
    console.error("❌ Token BRAPI necessário para teste!");
    return;
  }
  
  testBRAPIData(token);
}

// Exportar para uso global no console
if (typeof window !== 'undefined') {
  window.testBRAPIData = testBRAPIData;
  window.runBRAPITest = runBRAPITest;
} 
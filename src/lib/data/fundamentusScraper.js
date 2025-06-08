// 🚀 FUNDAMENTUS SCRAPER - DADOS FFO E COMPLEMENTARES
// Extração de dados FFO e métricas avançadas do Fundamentus

import { JSDOM } from 'jsdom';

class FundamentusScraper {
  constructor() {
    this.baseUrl = 'https://www.fundamentus.com.br/detalhes.php';
    this.requestDelay = 2000; // 2 segundos entre requests (mais conservador)
    this.maxRetries = 3;
    this.timeout = 30000;
  }

  /**
   * 🎯 MÉTODO PRINCIPAL: Buscar dados FFO de um FII
   */
  async getFIIData(ticker) {
    try {
      console.log(`🔍 Buscando dados FFO do ${ticker} no Fundamentus...`);
      
      const url = `${this.baseUrl}?papel=${ticker.toUpperCase()}`;
      const response = await this.fetchWithRetry(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const html = await response.text();
      const data = this.parseHTML(html, ticker);
      
      console.log(`✅ Dados FFO do ${ticker} extraídos com sucesso!`);
      return data;
      
    } catch (error) {
      console.error(`❌ Erro ao buscar FFO ${ticker}:`, error.message);
      throw error;
    }
  }

  /**
   * 📊 EXTRAÇÃO DE DADOS DO HTML
   */
  parseHTML(html, ticker) {
    // Criar parser DOM
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    
    console.log(`🔍 Analisando HTML do ${ticker} no Fundamentus...`);
    
    // Extrair dados básicos
    const basicData = this.extractBasicData(doc, ticker);
    
    // Extrair dados FFO específicos
    const ffoData = this.extractFFOData(doc);
    
    // Extrair dados financeiros complementares
    const financialData = this.extractFinancialData(doc);
    
    // Extrair dados patrimoniais
    const patrimonialData = this.extractPatrimonialData(doc);
    
    // Combinar todos os dados
    const completeData = {
      ...basicData,
      ...ffoData,
      ...financialData,
      ...patrimonialData,
      
      // Metadados
      source: 'fundamentus',
      scraped_at: new Date().toISOString(),
      url: `${this.baseUrl}?papel=${ticker.toUpperCase()}`
    };
    
    console.log(`✅ Dados FFO extraídos para ${ticker}:`, {
      ffo_yield: completeData.ffo_yield,
      ffo_per_share: completeData.ffo_per_share,
      ffo_12m: completeData.ffo_12m,
      p_ffo: completeData.p_ffo
    });
    
    return completeData;
  }

  /**
   * 🏢 DADOS BÁSICOS DO FII
   */
  extractBasicData(doc, ticker) {
    return {
      ticker: ticker.toUpperCase(),
      name: this.extractText(doc, 'td:contains("Nome")') || ticker,
      price: this.extractPrice(doc),
      market_cap: this.extractMarketCap(doc),
      shares_outstanding: this.extractSharesOutstanding(doc),
      sector: 'Fundos Imobiliários',
      segment: this.extractText(doc, 'td:contains("Segmento")') || 'Híbrido',
      mandate: this.extractText(doc, 'td:contains("Mandato")') || 'Híbrido',
      management_type: this.extractText(doc, 'td:contains("Gestão")') || 'Ativa',
      is_active: true
    };
  }

  /**
   * 💰 EXTRAÇÃO ESPECÍFICA DE DADOS FFO
   */
  extractFFOData(doc) {
    try {
      console.log('🔍 Extraindo dados FFO do Fundamentus...');
      
      const ffoData = {
        ffo_yield: this.extractFFOYield(doc),
        ffo_per_share: this.extractFFOPerShare(doc),
        ffo_12m: this.extractFFO12M(doc),
        ffo_3m: this.extractFFO3M(doc),
        p_ffo: null // Será calculado depois
      };
      
      // Calcular P/FFO se temos preço e FFO por cota
      const price = this.extractPrice(doc);
      if (price && ffoData.ffo_per_share) {
        ffoData.p_ffo = parseFloat((price / ffoData.ffo_per_share).toFixed(2));
        console.log(`✅ P/FFO calculado: ${ffoData.p_ffo}`);
      }
      
      return ffoData;
      
    } catch (error) {
      console.error('❌ Erro ao extrair dados FFO:', error);
      return {
        ffo_yield: null,
        ffo_per_share: null,
        ffo_12m: null,
        ffo_3m: null,
        p_ffo: null
      };
    }
  }

  /**
   * 📊 EXTRAÇÃO DE FFO YIELD
   */
  extractFFOYield(doc) {
    try {
      // Buscar por "FFO Yield" na tabela
      const cells = doc.querySelectorAll('td');
      for (const cell of cells) {
        const text = cell.textContent?.trim();
        if (text && text.includes('FFO Yield')) {
          // Buscar próxima célula com o valor
          const nextCell = cell.nextElementSibling;
          if (nextCell) {
            const valueText = nextCell.textContent?.trim();
            const match = valueText?.match(/(\d+[,.]?\d*)\s*%/);
            if (match) {
              const value = this.parseNumber(match[1]);
              if (value !== null && value >= 0 && value <= 30) {
                console.log(`✅ FFO Yield extraído: ${value}%`);
                return value;
              }
            }
          }
        }
      }
      
      console.warn('⚠️ FFO Yield não encontrado');
      return null;
      
    } catch (error) {
      console.error('❌ Erro ao extrair FFO Yield:', error);
      return null;
    }
  }

  /**
   * 📊 EXTRAÇÃO DE FFO POR COTA
   */
  extractFFOPerShare(doc) {
    try {
      // Buscar por "FFO/Cota" na tabela
      const cells = doc.querySelectorAll('td');
      for (const cell of cells) {
        const text = cell.textContent?.trim();
        if (text && text.includes('FFO/Cota')) {
          // Buscar próxima célula com o valor
          const nextCell = cell.nextElementSibling;
          if (nextCell) {
            const valueText = nextCell.textContent?.trim();
            const value = this.parseNumber(valueText);
            if (value !== null && value >= 0.01 && value <= 100) {
              console.log(`✅ FFO/Cota extraído: ${value}`);
              return value;
            }
          }
        }
      }
      
      console.warn('⚠️ FFO/Cota não encontrado');
      return null;
      
    } catch (error) {
      console.error('❌ Erro ao extrair FFO/Cota:', error);
      return null;
    }
  }

  /**
   * 📊 EXTRAÇÃO DE FFO 12 MESES
   */
  extractFFO12M(doc) {
    try {
      // Buscar na seção "Últimos 12 meses" por "FFO"
      const cells = doc.querySelectorAll('td');
      let inLastTwelveMonths = false;
      
      for (const cell of cells) {
        const text = cell.textContent?.trim();
        
        // Identificar seção "Últimos 12 meses"
        if (text && text.includes('Últimos 12 meses')) {
          inLastTwelveMonths = true;
          continue;
        }
        
        // Se estamos na seção correta e encontramos "FFO"
        if (inLastTwelveMonths && text && text.includes('FFO') && !text.includes('FFO Yield') && !text.includes('FFO/Cota')) {
          const nextCell = cell.nextElementSibling;
          if (nextCell) {
            const valueText = nextCell.textContent?.trim();
            const value = this.parseNumber(valueText);
            if (value !== null && value >= 1000000) { // Pelo menos 1 milhão
              console.log(`✅ FFO 12M extraído: R$ ${value.toLocaleString()}`);
              return value;
            }
          }
        }
        
        // Se saímos da seção, parar
        if (inLastTwelveMonths && text && text.includes('Últimos 3 meses')) {
          break;
        }
      }
      
      // Buscar por padrões alternativos de FFO
      const allText = doc.body.textContent || '';
      const ffoPatterns = [
        /FFO[:\s]*R?\$?\s*(\d+[.,]?\d*)/i,
        /Funds From Operations[:\s]*R?\$?\s*(\d+[.,]?\d*)/i
      ];
      
      for (const pattern of ffoPatterns) {
        const matches = allText.match(new RegExp(pattern.source, 'gi'));
        if (matches) {
          for (const match of matches) {
            const valueMatch = match.match(/(\d+[.,]?\d*)/);
            if (valueMatch) {
              const value = this.parseNumber(valueMatch[1]);
              if (value !== null && value >= 1000000) {
                console.log(`✅ FFO 12M extraído via pattern: R$ ${value.toLocaleString()}`);
                return value;
              }
            }
          }
        }
      }
      
      console.warn('⚠️ FFO 12M não encontrado');
      return null;
      
    } catch (error) {
      console.error('❌ Erro ao extrair FFO 12M:', error);
      return null;
    }
  }

  /**
   * 📊 EXTRAÇÃO DE FFO 3 MESES
   */
  extractFFO3M(doc) {
    try {
      // Buscar na seção "Últimos 3 meses" por "FFO"
      const cells = doc.querySelectorAll('td');
      let inLastThreeMonths = false;
      
      for (const cell of cells) {
        const text = cell.textContent?.trim();
        
        // Identificar seção "Últimos 3 meses"
        if (text && text.includes('Últimos 3 meses')) {
          inLastThreeMonths = true;
          continue;
        }
        
        // Se estamos na seção correta e encontramos "FFO"
        if (inLastThreeMonths && text && text.includes('FFO') && !text.includes('FFO Yield')) {
          const nextCell = cell.nextElementSibling;
          if (nextCell) {
            const valueText = nextCell.textContent?.trim();
            const value = this.parseNumber(valueText);
            if (value !== null && value >= 100000) { // Pelo menos 100 mil
              console.log(`✅ FFO 3M extraído: R$ ${value.toLocaleString()}`);
              return value;
            }
          }
        }
        
        // Se chegamos ao final da tabela, parar
        if (inLastThreeMonths && text && text.includes('Balanço Patrimonial')) {
          break;
        }
      }
      
      return null;
    } catch (error) {
      console.error('❌ Erro ao extrair FFO 3M:', error);
      return null;
    }
  }

  /**
   * 💰 EXTRAÇÃO DE PREÇO
   */
  extractPrice(doc) {
    try {
      // Buscar por "Cotação" na tabela
      const cells = doc.querySelectorAll('td');
      for (const cell of cells) {
        const text = cell.textContent?.trim();
        if (text && (text.includes('Cotação') || text.includes('Cota'))) {
          const nextCell = cell.nextElementSibling;
          if (nextCell) {
            const valueText = nextCell.textContent?.trim();
            const value = this.parseNumber(valueText);
            if (value !== null && value >= 1 && value <= 10000) {
              console.log(`✅ Preço extraído: R$ ${value}`);
              return value;
            }
          }
        }
      }
      
      // Buscar em toda a página por padrões de preço
      const allText = doc.body.textContent || '';
      const pricePatterns = [
        /Cotação[:\s]*R?\$?\s*(\d+[,.]?\d*)/i,
        /Preço[:\s]*R?\$?\s*(\d+[,.]?\d*)/i,
        /Valor[:\s]*R?\$?\s*(\d+[,.]?\d*)/i
      ];
      
      for (const pattern of pricePatterns) {
        const match = allText.match(pattern);
        if (match) {
          const value = this.parseNumber(match[1]);
          if (value !== null && value >= 1 && value <= 10000) {
            console.log(`✅ Preço extraído via pattern: R$ ${value}`);
            return value;
          }
        }
      }
      
      console.warn('⚠️ Preço não encontrado');
      return null;
      
    } catch (error) {
      console.error('❌ Erro ao extrair preço:', error);
      return null;
    }
  }

  /**
   * 💰 EXTRAÇÃO DE VALOR DE MERCADO
   */
  extractMarketCap(doc) {
    try {
      const cells = doc.querySelectorAll('td');
      for (const cell of cells) {
        const text = cell.textContent?.trim();
        if (text && text.includes('Valor de mercado')) {
          const nextCell = cell.nextElementSibling;
          if (nextCell) {
            const valueText = nextCell.textContent?.trim();
            const value = this.parseNumber(valueText);
            if (value !== null && value >= 1000000) {
              console.log(`✅ Market Cap extraído: R$ ${value.toLocaleString()}`);
              return value;
            }
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('❌ Erro ao extrair market cap:', error);
      return null;
    }
  }

  /**
   * 📊 EXTRAÇÃO DE NÚMERO DE COTAS
   */
  extractSharesOutstanding(doc) {
    try {
      const cells = doc.querySelectorAll('td');
      for (const cell of cells) {
        const text = cell.textContent?.trim();
        if (text && text.includes('Nro. Cotas')) {
          const nextCell = cell.nextElementSibling;
          if (nextCell) {
            const valueText = nextCell.textContent?.trim();
            const value = this.parseNumber(valueText);
            if (value !== null && value >= 1000000) {
              console.log(`✅ Número de cotas extraído: ${value.toLocaleString()}`);
              return value;
            }
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('❌ Erro ao extrair número de cotas:', error);
      return null;
    }
  }

  /**
   * 📊 DADOS FINANCEIROS COMPLEMENTARES
   */
  extractFinancialData(doc) {
    return {
      dividend_yield: this.extractDividendYield(doc),
      pvp: this.extractPVP(doc),
      revenue_12m: this.extractRevenue12M(doc),
      revenue_3m: this.extractRevenue3M(doc),
      distributed_income_12m: this.extractDistributedIncome12M(doc),
      distributed_income_3m: this.extractDistributedIncome3M(doc)
    };
  }

  /**
   * 📊 EXTRAÇÃO DE DIVIDEND YIELD
   */
  extractDividendYield(doc) {
    try {
      const cells = doc.querySelectorAll('td');
      for (const cell of cells) {
        const text = cell.textContent?.trim();
        if (text && text.includes('Div. Yield')) {
          const nextCell = cell.nextElementSibling;
          if (nextCell) {
            const valueText = nextCell.textContent?.trim();
            const match = valueText?.match(/(\d+[,.]?\d*)\s*%/);
            if (match) {
              const value = this.parseNumber(match[1]);
              if (value !== null && value >= 0 && value <= 30) {
                return value;
              }
            }
          }
        }
      }
      return null;
    } catch (error) {
      console.error('❌ Erro ao extrair Dividend Yield:', error);
      return null;
    }
  }

  /**
   * 📊 EXTRAÇÃO DE P/VP
   */
  extractPVP(doc) {
    try {
      const cells = doc.querySelectorAll('td');
      for (const cell of cells) {
        const text = cell.textContent?.trim();
        if (text && text.includes('P/VP')) {
          const nextCell = cell.nextElementSibling;
          if (nextCell) {
            const valueText = nextCell.textContent?.trim();
            const value = this.parseNumber(valueText);
            if (value !== null && value >= 0.1 && value <= 5) {
              return value;
            }
          }
        }
      }
      return null;
    } catch (error) {
      console.error('❌ Erro ao extrair P/VP:', error);
      return null;
    }
  }

  /**
   * 📊 EXTRAÇÃO DE RECEITA 12M
   */
  extractRevenue12M(doc) {
    try {
      const cells = doc.querySelectorAll('td');
      let inLastTwelveMonths = false;
      
      for (const cell of cells) {
        const text = cell.textContent?.trim();
        
        if (text && text.includes('Últimos 12 meses')) {
          inLastTwelveMonths = true;
          continue;
        }
        
        if (inLastTwelveMonths && text && text.includes('Receita')) {
          const nextCell = cell.nextElementSibling;
          if (nextCell) {
            const valueText = nextCell.textContent?.trim();
            const value = this.parseNumber(valueText);
            if (value !== null && value >= 1000000) {
              return value;
            }
          }
        }
        
        if (inLastTwelveMonths && text && text.includes('Últimos 3 meses')) {
          break;
        }
      }
      
      return null;
    } catch (error) {
      console.error('❌ Erro ao extrair receita 12M:', error);
      return null;
    }
  }

  /**
   * 📊 EXTRAÇÃO DE RECEITA 3M
   */
  extractRevenue3M(doc) {
    try {
      const cells = doc.querySelectorAll('td');
      let inLastThreeMonths = false;
      
      for (const cell of cells) {
        const text = cell.textContent?.trim();
        
        if (text && text.includes('Últimos 3 meses')) {
          inLastThreeMonths = true;
          continue;
        }
        
        if (inLastThreeMonths && text && text.includes('Receita')) {
          const nextCell = cell.nextElementSibling;
          if (nextCell) {
            const valueText = nextCell.textContent?.trim();
            const value = this.parseNumber(valueText);
            if (value !== null && value >= 100000) {
              return value;
            }
          }
        }
        
        if (inLastThreeMonths && text && text.includes('Balanço Patrimonial')) {
          break;
        }
      }
      
      return null;
    } catch (error) {
      console.error('❌ Erro ao extrair receita 3M:', error);
      return null;
    }
  }

  /**
   * 📊 EXTRAÇÃO DE RENDA DISTRIBUÍDA 12M
   */
  extractDistributedIncome12M(doc) {
    try {
      const cells = doc.querySelectorAll('td');
      let inLastTwelveMonths = false;
      
      for (const cell of cells) {
        const text = cell.textContent?.trim();
        
        if (text && text.includes('Últimos 12 meses')) {
          inLastTwelveMonths = true;
          continue;
        }
        
        if (inLastTwelveMonths && text && text.includes('Rend. Distribuído')) {
          const nextCell = cell.nextElementSibling;
          if (nextCell) {
            const valueText = nextCell.textContent?.trim();
            const value = this.parseNumber(valueText);
            if (value !== null && value >= 1000000) {
              return value;
            }
          }
        }
        
        if (inLastTwelveMonths && text && text.includes('Últimos 3 meses')) {
          break;
        }
      }
      
      return null;
    } catch (error) {
      console.error('❌ Erro ao extrair renda distribuída 12M:', error);
      return null;
    }
  }

  /**
   * 📊 EXTRAÇÃO DE RENDA DISTRIBUÍDA 3M
   */
  extractDistributedIncome3M(doc) {
    try {
      const cells = doc.querySelectorAll('td');
      let inLastThreeMonths = false;
      
      for (const cell of cells) {
        const text = cell.textContent?.trim();
        
        if (text && text.includes('Últimos 3 meses')) {
          inLastThreeMonths = true;
          continue;
        }
        
        if (inLastThreeMonths && text && text.includes('Rend. Distribuído')) {
          const nextCell = cell.nextElementSibling;
          if (nextCell) {
            const valueText = nextCell.textContent?.trim();
            const value = this.parseNumber(valueText);
            if (value !== null && value >= 100000) {
              return value;
            }
          }
        }
        
        if (inLastThreeMonths && text && text.includes('Balanço Patrimonial')) {
          break;
        }
      }
      
      return null;
    } catch (error) {
      console.error('❌ Erro ao extrair renda distribuída 3M:', error);
      return null;
    }
  }

  /**
   * 🏛️ DADOS PATRIMONIAIS
   */
  extractPatrimonialData(doc) {
    return {
      total_assets: this.extractTotalAssets(doc),
      net_equity: this.extractNetEquity(doc),
      equity_per_share: this.extractEquityPerShare(doc)
    };
  }

  /**
   * 📊 EXTRAÇÃO DE ATIVOS TOTAIS
   */
  extractTotalAssets(doc) {
    try {
      const cells = doc.querySelectorAll('td');
      for (const cell of cells) {
        const text = cell.textContent?.trim();
        if (text && text.includes('Ativos')) {
          const nextCell = cell.nextElementSibling;
          if (nextCell) {
            const valueText = nextCell.textContent?.trim();
            const value = this.parseNumber(valueText);
            if (value !== null && value >= 1000000) {
              return value;
            }
          }
        }
      }
      return null;
    } catch (error) {
      console.error('❌ Erro ao extrair ativos totais:', error);
      return null;
    }
  }

  /**
   * 📊 EXTRAÇÃO DE PATRIMÔNIO LÍQUIDO
   */
  extractNetEquity(doc) {
    try {
      const cells = doc.querySelectorAll('td');
      for (const cell of cells) {
        const text = cell.textContent?.trim();
        if (text && text.includes('Patrim Líquido')) {
          const nextCell = cell.nextElementSibling;
          if (nextCell) {
            const valueText = nextCell.textContent?.trim();
            const value = this.parseNumber(valueText);
            if (value !== null && value >= 1000000) {
              return value;
            }
          }
        }
      }
      return null;
    } catch (error) {
      console.error('❌ Erro ao extrair patrimônio líquido:', error);
      return null;
    }
  }

  /**
   * 📊 EXTRAÇÃO DE VP/COTA
   */
  extractEquityPerShare(doc) {
    try {
      const cells = doc.querySelectorAll('td');
      for (const cell of cells) {
        const text = cell.textContent?.trim();
        if (text && text.includes('VP/Cota')) {
          const nextCell = cell.nextElementSibling;
          if (nextCell) {
            const valueText = nextCell.textContent?.trim();
            const value = this.parseNumber(valueText);
            if (value !== null && value >= 1 && value <= 1000) {
              return value;
            }
          }
        }
      }
      return null;
    } catch (error) {
      console.error('❌ Erro ao extrair VP/Cota:', error);
      return null;
    }
  }

  /**
   * 🔄 FETCH COM RETRY E RATE LIMITING
   */
  async fetchWithRetry(url, retries = this.maxRetries) {
    for (let i = 0; i < retries; i++) {
      try {
        if (i > 0) {
          await this.delay(this.requestDelay * (i + 1));
        }
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        
        console.log(`🌐 Fazendo requisição para Fundamentus: ${url} (tentativa ${i + 1}/${retries})`);
        
        const response = await fetch(url, {
          signal: controller.signal,
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        console.log(`✅ Requisição bem-sucedida para Fundamentus`);
        return response;
        
      } catch (error) {
        console.warn(`⚠️ Tentativa ${i + 1}/${retries} falhou:`, error.message);
        
        if (i === retries - 1) {
          throw error;
        }
        
        await this.delay(this.requestDelay * (i + 1));
      }
    }
  }

  /**
   * 🛠️ UTILITÁRIOS
   */
  extractText(doc, selector) {
    try {
      // Usar querySelector simples sem :contains() que não é suportado
      const elements = doc.querySelectorAll('td');
      for (const element of elements) {
        const text = element.textContent?.trim();
        if (text && text !== '' && text !== '-' && text !== 'N/A') {
          // Verificar se o texto contém o termo procurado
          const searchTerm = selector.match(/contains\("([^"]+)"\)/);
          if (searchTerm && text.includes(searchTerm[1])) {
            return text;
          }
        }
      }
    } catch (error) {
      console.warn(`⚠️ Erro no seletor ${selector}:`, error.message);
    }
    return null;
  }

  parseNumber(text) {
    if (!text) return null;
    
    try {
      let cleaned = text.toString().trim();
      
      if (cleaned.length > 15) {
        return null;
      }
      
      // Remover caracteres não numéricos exceto vírgula, ponto e sinal negativo
      cleaned = cleaned.replace(/[^\d,.-]/g, '');
      
      if (!cleaned) return null;
      
      // Lidar com números brasileiros (vírgula como decimal)
      if (cleaned.includes(',') && cleaned.includes('.')) {
        // Formato: 1.234.567,89
        cleaned = cleaned.replace(/\./g, '').replace(',', '.');
      } else if (cleaned.includes(',')) {
        // Formato: 1234,89 ou 1.234,89
        const parts = cleaned.split(',');
        if (parts.length === 2 && parts[1].length <= 2) {
          cleaned = cleaned.replace(',', '.');
        } else {
          cleaned = cleaned.replace(/,/g, '');
        }
      }
      
      const number = parseFloat(cleaned);
      
      if (isNaN(number) || !isFinite(number)) {
        return null;
      }
      
      if (Math.abs(number) > 1000000000000) { // 1 trilhão
        return null;
      }
      
      return number;
    } catch (error) {
      console.warn('⚠️ Erro ao fazer parse do número:', text, error.message);
      return null;
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 📊 BUSCAR MÚLTIPLOS FIIs
   */
  async getFIIsData(tickers, onProgress = null) {
    const results = [];
    const errors = [];
    
    console.log(`🚀 Iniciando scraping FFO de ${tickers.length} FIIs no Fundamentus...`);
    
    for (let i = 0; i < tickers.length; i++) {
      const ticker = tickers[i];
      
      try {
        if (onProgress) {
          onProgress({
            current: i + 1,
            total: tickers.length,
            ticker,
            percentage: Math.round(((i + 1) / tickers.length) * 100)
          });
        }
        
        const data = await this.getFIIData(ticker);
        results.push(data);
        
        // Rate limiting entre requests
        if (i < tickers.length - 1) {
          await this.delay(this.requestDelay);
        }
        
      } catch (error) {
        console.error(`❌ Erro ao processar ${ticker}:`, error.message);
        errors.push({ ticker, error: error.message });
      }
    }
    
    console.log(`✅ Scraping FFO concluído: ${results.length} sucessos, ${errors.length} erros`);
    
    return {
      success: results,
      errors,
      stats: {
        total: tickers.length,
        success_count: results.length,
        error_count: errors.length,
        success_rate: (results.length / tickers.length) * 100
      }
    };
  }
}

// 🚀 EXPORTAR INSTÂNCIA SINGLETON
const fundamentusScraper = new FundamentusScraper();
export default fundamentusScraper; 
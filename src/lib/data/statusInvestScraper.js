// 🚀 STATUS INVEST SCRAPER - SOLUÇÃO DEFINITIVA
// Extração completa de dados fundamentalistas de FIIs

import { JSDOM } from 'jsdom';

class StatusInvestScraper {
  constructor() {
    // 🔧 Usar URL completa do Status Invest
    this.baseUrl = 'https://statusinvest.com.br/fundos-imobiliarios';
    this.requestDelay = 1000; // 1 segundo entre requests
    this.maxRetries = 3;
    this.timeout = 30000; // 30 segundos
  }

  /**
   * 🎯 MÉTODO PRINCIPAL: Buscar dados completos de um FII
   */
  async getFIIData(ticker) {
    try {
      console.log(`🔍 Buscando dados do ${ticker} no Status Invest...`);
      
      const url = `${this.baseUrl}/${ticker.toLowerCase()}`;
      const response = await this.fetchWithRetry(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const html = await response.text();
      const data = this.parseHTML(html, ticker);
      
      console.log(`✅ Dados do ${ticker} extraídos com sucesso!`);
      return data;
      
    } catch (error) {
      console.error(`❌ Erro ao buscar ${ticker}:`, error.message);
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
    
    console.log(`🔍 Analisando HTML do ${ticker}...`);
    
    // Extrair dados básicos
    const basicData = this.extractBasicData(doc, ticker);
    
    // Extrair métricas fundamentalistas
    const metrics = this.extractMetrics(doc);
    
    // Extrair dados operacionais
    const operational = this.extractOperationalData(doc);
    
    // Extrair informações da gestora
    const management = this.extractManagementData(doc);
    
    // Extrair histórico de dividendos
    const dividends = this.extractDividendHistory(doc);
    
    // Combinar todos os dados
    const completeData = {
      ...basicData,
      ...metrics,
      ...operational,
      ...management,
      dividends,
      
      // Metadados
      source: 'status_invest',
      scraped_at: new Date().toISOString(),
      url: `/api/statusinvest/fundos-imobiliarios/${ticker.toLowerCase()}`
    };
    
    // Calcular scores de qualidade
    completeData.quality_score = this.calculateQualityScore(completeData);
    completeData.sustainability_score = this.calculateSustainabilityScore(completeData);
    completeData.growth_score = this.calculateGrowthScore(completeData);
    
    console.log(`✅ Dados extraídos para ${ticker}:`, {
      name: completeData.name,
      price: completeData.price,
      dividend_yield: completeData.dividend_yield,
      pvp: completeData.pvp
    });
    
    return completeData;
  }

  /**
   * 🏢 DADOS BÁSICOS DO FII
   */
  extractBasicData(doc, ticker) {
    return {
      ticker: ticker.toUpperCase(),
      name: this.extractText(doc, [
        'h1.lh-4',
        'h1',
        '.company-name', 
        '[data-cy="company-name"]',
        '.title-company'
      ]) || ticker,
      price: this.extractPrice(doc),
      market_cap: this.extractMarketCap(doc),
      shares_outstanding: null, // Não disponível facilmente
      sector: 'Fundos Imobiliários', // Padrão para FIIs
      segment: this.extractText(doc, [
        '[title*="Segmento"]',
        '.segment',
        '[data-cy="segment"]',
        '[title*="Subsegmento"]'
      ]) || 'Híbrido', // Padrão baseado no que vimos
      is_active: true
    };
  }

  /**
   * 💰 EXTRAÇÃO ESPECÍFICA DE PREÇO
   */
  extractPrice(doc) {
    try {
      // Buscar elementos .value que geralmente contêm o preço
      const valueElements = doc.querySelectorAll('.value');
      
      // O primeiro elemento .value que parece com preço geralmente é o preço atual
      for (let i = 0; i < Math.min(10, valueElements.length); i++) {
        const element = valueElements[i];
        const text = element.textContent?.trim();
        if (text) {
          // Verificar se parece com um preço (formato brasileiro)
          const match = text.match(/^(\d{1,4}[,.]?\d{0,2})$/);
          if (match) {
            const value = this.parseNumber(match[1]);
            if (value !== null && value >= 1 && value <= 10000) {
              console.log(`✅ Preço extraído: R$ ${value} (elemento ${i})`);
              return value;
            }
          }
        }
      }
      
      console.warn('⚠️ Não foi possível extrair preço dos elementos .value');
      return null;
      
    } catch (error) {
      console.error('❌ Erro ao extrair preço:', error);
      return null;
    }
  }

  /**
   * 📊 EXTRAÇÃO ESPECÍFICA DE P/VP
   */
  extractPVP(doc) {
    try {
      // Método 1: Buscar por elementos que contêm "P/VP" no texto
      const allElements = doc.querySelectorAll('*');
      for (const element of allElements) {
        const text = element.textContent?.trim();
        if (text && text.includes('P/VP') && text.length < 50) {
          // Buscar número no próximo elemento ou no mesmo elemento
          const match = text.match(/P\/VP[^0-9]*(\d{1,2}[,.]?\d{0,2})/);
          if (match) {
            const value = this.parseNumber(match[1]);
            if (value !== null && value >= 0.1 && value <= 5) {
              console.log(`✅ P/VP extraído: ${value}`);
              return value;
            }
          }
          
          // Se não encontrou no mesmo elemento, buscar no próximo
          const nextElement = element.nextElementSibling;
          if (nextElement) {
            const nextText = nextElement.textContent?.trim();
            const nextMatch = nextText?.match(/(\d{1,2}[,.]?\d{0,2})/);
            if (nextMatch) {
              const value = this.parseNumber(nextMatch[1]);
              if (value !== null && value >= 0.1 && value <= 5) {
                console.log(`✅ P/VP extraído do próximo elemento: ${value}`);
                return value;
              }
            }
          }
        }
      }
      
      console.warn('⚠️ Não foi possível extrair P/VP');
      return null;
      
    } catch (error) {
      console.error('❌ Erro ao extrair P/VP:', error);
      return null;
    }
  }

  /**
   * 💰 EXTRAÇÃO ESPECÍFICA DE DIVIDEND YIELD
   */
  extractDividendYield(doc) {
    try {
      // Método 1: Buscar elemento com title "Dividend Yield"
      const dyElement = doc.querySelector('[title*="Dividend Yield"]');
      if (dyElement) {
        const text = dyElement.textContent;
        console.log(`🔍 Texto completo do elemento DY: "${text.substring(0, 200)}..."`);
        
        // Buscar padrão de número seguido de %
        const match = text.match(/(\d{1,2}[,.]?\d{0,2})\s*%/);
        if (match) {
          const value = this.parseNumber(match[1]);
          if (value !== null && value >= 0 && value <= 30) {
            console.log(`✅ DY extraído: ${value}%`);
            return value;
          }
        }
      }
      
      console.warn('⚠️ Não foi possível extrair Dividend Yield');
      return null;
      
    } catch (error) {
      console.error('❌ Erro ao extrair Dividend Yield:', error);
      return null;
    }
  }

  /**
   * 💧 EXTRAÇÃO DE LIQUIDEZ
   */
  extractLiquidity(doc) {
    try {
      // Buscar por elementos que contêm "Liquidez" no texto
      const allElements = doc.querySelectorAll('*');
      for (const element of allElements) {
        const text = element.textContent?.trim();
        if (text && text.includes('Liquidez') && !text.includes('necessidade') && text.length < 100) {
          // Buscar valor numérico próximo
          const parent = element.closest('.info, .card, .metric');
          if (parent) {
            const valueElements = parent.querySelectorAll('.value');
            for (const valueEl of valueElements) {
              const valueText = valueEl.textContent?.trim();
              const value = this.parseNumber(valueText);
              if (value !== null && value > 1000) {
                console.log(`✅ Liquidez extraída: ${value}`);
                return value;
              }
            }
          }
        }
      }
      
      console.warn('⚠️ Não foi possível extrair Liquidez');
      return null;
      
    } catch (error) {
      console.error('❌ Erro ao extrair Liquidez:', error);
      return null;
    }
  }

  /**
   * 🏠 EXTRAÇÃO DE TAXA DE VACÂNCIA
   */
  extractVacancy(doc) {
    try {
      // Buscar por elementos que contêm "Vacância" no texto
      const allElements = doc.querySelectorAll('*');
      for (const element of allElements) {
        const text = element.textContent?.trim();
        if (text && text.includes('Vacância') && text.length < 100) {
          // Buscar padrão de porcentagem
          const match = text.match(/(\d{1,2}[,.]?\d{0,2})\s*%/);
          if (match) {
            const value = this.parseNumber(match[1]);
            if (value !== null && value >= 0 && value <= 100) {
              console.log(`✅ Taxa de Vacância extraída: ${value}%`);
              return value;
            }
          }
          
          // Se não encontrou %, pode ser que esteja em "-%"
          if (text.includes('-%')) {
            console.log(`✅ Taxa de Vacância: 0% (indicado como -%)`);
            return 0;
          }
        }
      }
      
      console.warn('⚠️ Não foi possível extrair Taxa de Vacância');
      return null;
      
    } catch (error) {
      console.error('❌ Erro ao extrair Taxa de Vacância:', error);
      return null;
    }
  }

  /**
   * 💼 EXTRAÇÃO DE TAXA DE ADMINISTRAÇÃO
   */
  extractAdminFee(doc) {
    try {
      // Método 1: Buscar por elementos que contêm "Taxa" e "Administração"
      const allElements = doc.querySelectorAll('*');
      for (const element of allElements) {
        const text = element.textContent?.trim();
        if (text && (text.includes('Taxa') || text.includes('Taxas')) && 
            (text.includes('Administração') || text.includes('Adm')) && text.length < 200) {
          
          // Verificar se tem "- % a.a" ou similar (indica taxa zero)
          if (text.includes('- %') || text.includes('-% a.a') || text.includes('- % a.a')) {
            console.log(`✅ Taxa de Administração: 0% (indicado como "- %")`);
            return 0;
          }
          
          // Buscar valor numérico próximo
          const parent = element.closest('.info, .card, .metric');
          if (parent) {
            const valueElements = parent.querySelectorAll('.value');
            for (const valueEl of valueElements) {
              const valueText = valueEl.textContent?.trim();
              
              // Verificar se tem "- %" no valor
              if (valueText && (valueText.includes('- %') || valueText.includes('-% a.a'))) {
                console.log(`✅ Taxa de Administração: 0% (valor "- %")`);
                return 0;
              }
              
              const match = valueText?.match(/(\d{1,2}[,.]?\d{0,2})\s*%/);
              if (match) {
                const value = this.parseNumber(match[1]);
                if (value !== null && value >= 0 && value <= 10) {
                  console.log(`✅ Taxa de Administração extraída: ${value}%`);
                  return value;
                }
              }
            }
          }
        }
      }
      
      // Método 2: Buscar diretamente por padrões de taxa de administração no texto completo
      const bodyText = doc.body?.textContent || '';
      
      // Verificar padrão "- % a.a" primeiro
      if (bodyText.includes('- % a.a') || bodyText.includes('-% a.a') || bodyText.includes('- %')) {
        console.log(`✅ Taxa de Administração: 0% (padrão "- %" encontrado)`);
        return 0;
      }
      
      const adminFeePatterns = [
        /Taxa.*Administração[^0-9]*(\d{1,2}[,.]?\d{0,2})\s*%/i,
        /Taxas.*Adm[^0-9]*(\d{1,2}[,.]?\d{0,2})\s*%/i,
        /(\d{1,2}[,.]?\d{0,2})\s*%.*Taxa.*Administração/i
      ];
      
      for (const pattern of adminFeePatterns) {
        const match = bodyText.match(pattern);
        if (match) {
          const value = this.parseNumber(match[1]);
          if (value !== null && value >= 0 && value <= 10) {
            console.log(`✅ Taxa de Administração extraída por padrão: ${value}%`);
            return value;
          }
        }
      }
      
      console.warn('⚠️ Não foi possível extrair Taxa de Administração');
      return null;
      
    } catch (error) {
      console.error('❌ Erro ao extrair Taxa de Administração:', error);
      return null;
    }
  }

  /**
   * 🏛️ EXTRAÇÃO DE GESTORA/ADMINISTRADOR
   */
  extractManager(doc) {
    try {
      // Método 1: Buscar por elementos que contêm "Administrador" ou "Gestora"
      const allElements = doc.querySelectorAll('*');
      for (const element of allElements) {
        const text = element.textContent?.trim();
        if (text && (text.includes('Administrador') || text.includes('Gestora')) && text.length < 200) {
          
          // Buscar o nome da gestora próximo
          const parent = element.closest('.card, .info, .section');
          if (parent) {
            const textElements = parent.querySelectorAll('*');
            for (const textEl of textElements) {
              const textContent = textEl.textContent?.trim();
              if (textContent && textContent.length > 5 && textContent.length < 100 &&
                  !textContent.includes('Administrador') && !textContent.includes('Gestora') &&
                  !textContent.includes('supervisor_account') && !textContent.includes('Telefone') &&
                  !textContent.includes('Email') && !textContent.includes('@') &&
                  /^[A-Za-z\s&.-]+$/.test(textContent)) {
                console.log(`✅ Gestora extraída: ${textContent}`);
                return textContent;
              }
            }
          }
        }
      }
      
      // Método 2: Buscar por padrões específicos no texto
      const bodyText = doc.body?.textContent || '';
      const managerPatterns = [
        /Administrador[^A-Za-z]*([A-Za-z\s&.-]{10,80})/i,
        /Gestora[^A-Za-z]*([A-Za-z\s&.-]{10,80})/i
      ];
      
      for (const pattern of managerPatterns) {
        const match = bodyText.match(pattern);
        if (match) {
          const managerName = match[1].trim();
          if (managerName && !managerName.includes('Telefone') && !managerName.includes('@')) {
            console.log(`✅ Gestora extraída por padrão: ${managerName}`);
            return managerName;
          }
        }
      }
      
      console.warn('⚠️ Não foi possível extrair Gestora');
      return 'Não informado';
      
    } catch (error) {
      console.error('❌ Erro ao extrair Gestora:', error);
      return 'Não informado';
    }
  }

  /**
   * 📊 MÉTRICAS FUNDAMENTALISTAS ATUALIZADAS
   */
  extractMetrics(doc) {
    return {
      // Métricas principais - CORRIGIDO para Status Invest
      dividend_yield: this.extractDividendYield(doc),
      pvp: this.extractPVP(doc),
      
      // Liquidez
      liquidity: this.extractLiquidity(doc),
      
      // Dados operacionais integrados
      vacancy_rate: this.extractVacancy(doc),
      admin_fee_ratio: this.extractAdminFee(doc),
      
      // Métricas que podem não estar disponíveis - valores padrão
      ffo: this.extractFFO(doc),
      p_ffo: this.extractPFFO(doc, this.extractPrice(doc), this.extractFFO(doc)),
      avg_daily_volume: null,
      roe: null,
      roic: null,
      roa: null,
      debt_ratio: null,
      debt_to_equity: null,
      coverage_ratio: null,
      dividend_growth_1y: null,
      dividend_growth_3y: null,
      revenue_growth_1y: null,
      volatility: null,
      beta: null,
      sharpe_ratio: null,
      max_drawdown: null
    };
  }

  /**
   * 🏭 DADOS OPERACIONAIS ATUALIZADOS
   */
  extractOperationalData(doc) {
    return {
      vacancy_rate: this.extractVacancy(doc),
      last_dividend: null, // Será extraído do histórico de dividendos
      dividend_frequency: 'MENSAL', // Padrão para FIIs
      admin_fee_ratio: this.extractAdminFee(doc),
      occupancy_rate: null, // Calculado como 100 - vacancy_rate se disponível
      contract_duration_avg: null
    };
  }

  /**
   * 🏛️ DADOS DA GESTORA ATUALIZADOS
   */
  extractManagementData(doc) {
    return {
      manager: this.extractManager(doc)
    };
  }

  /**
   * 💰 HISTÓRICO DE DIVIDENDOS
   */
  extractDividendHistory(doc) {
    const dividends = [];
    
    try {
      // Buscar tabela de dividendos
      const dividendRows = doc.querySelectorAll('.dividend-table tr, .dividends-table tr, [data-cy="dividend-row"]');
      
      dividendRows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 3) {
          const dateText = cells[0]?.textContent?.trim();
          const amountText = cells[1]?.textContent?.trim();
          const typeText = cells[2]?.textContent?.trim() || 'DIVIDENDO';
          
          if (dateText && amountText) {
            const date = this.parseDate(dateText);
            const amount = this.parseNumber(amountText);
            
            if (date && amount > 0) {
              dividends.push({
                payment_date: date,
                amount: amount,
                type: typeText.toUpperCase()
              });
            }
          }
        }
      });
      
      // Ordenar por data (mais recente primeiro)
      dividends.sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date));
      
    } catch (error) {
      console.warn('⚠️ Erro ao extrair histórico de dividendos:', error.message);
    }
    
    return dividends;
  }

  /**
   * 🎯 CÁLCULO DE SCORE DE QUALIDADE
   */
  calculateQualityScore(data) {
    let score = 0;
    
    // Dividend Yield (peso 25%)
    if (data.dividend_yield >= 12) score += 2.5;
    else if (data.dividend_yield >= 10) score += 2.0;
    else if (data.dividend_yield >= 8) score += 1.5;
    else if (data.dividend_yield >= 6) score += 1.0;
    else score += 0.5;
    
    // P/VP (peso 20%)
    if (data.pvp <= 0.8) score += 2.0;
    else if (data.pvp <= 1.0) score += 1.5;
    else if (data.pvp <= 1.2) score += 1.0;
    else score += 0.5;
    
    // Liquidez (peso 15%)
    if (data.liquidity >= 1000000) score += 1.5;
    else if (data.liquidity >= 500000) score += 1.0;
    else score += 0.5;
    
    // Market Cap (peso 15%)
    if (data.market_cap >= 1000000000) score += 1.5;
    else if (data.market_cap >= 500000000) score += 1.0;
    else score += 0.5;
    
    // Taxa de Vacância (peso 10%)
    if (!data.vacancy_rate || data.vacancy_rate <= 3) score += 1.0;
    else if (data.vacancy_rate <= 5) score += 0.7;
    else if (data.vacancy_rate <= 10) score += 0.4;
    else score += 0.1;
    
    // FFO (peso 10%)
    if (data.ffo && data.p_ffo) {
      if (data.p_ffo <= 15) score += 1.0;
      else if (data.p_ffo <= 20) score += 0.7;
      else score += 0.3;
    } else {
      score += 0.5; // Neutro se não tiver dados
    }
    
    // Taxa de administração (peso 5%)
    if (data.admin_fee_ratio <= 0.5) score += 0.5;
    else if (data.admin_fee_ratio <= 1.0) score += 0.3;
    else score += 0.1;
    
    return Math.min(10.0, Math.max(0.0, score));
  }

  /**
   * 🌱 CÁLCULO DE SCORE DE SUSTENTABILIDADE
   */
  calculateSustainabilityScore(data) {
    let score = 0;
    
    // Consistência de dividendos (peso 40%)
    const dividendCount = data.dividends?.length || 0;
    if (dividendCount >= 12) score += 4.0;
    else if (dividendCount >= 6) score += 3.0;
    else if (dividendCount >= 3) score += 2.0;
    else score += 1.0;
    
    // Cobertura FFO (peso 30%)
    if (data.coverage_ratio >= 1.5) score += 3.0;
    else if (data.coverage_ratio >= 1.2) score += 2.5;
    else if (data.coverage_ratio >= 1.0) score += 2.0;
    else if (data.coverage_ratio >= 0.8) score += 1.0;
    else score += 0.5;
    
    // Endividamento (peso 20%)
    if (data.debt_ratio <= 30) score += 2.0;
    else if (data.debt_ratio <= 50) score += 1.5;
    else if (data.debt_ratio <= 70) score += 1.0;
    else score += 0.5;
    
    // Ocupação (peso 10%)
    if (data.occupancy_rate >= 95) score += 1.0;
    else if (data.occupancy_rate >= 90) score += 0.8;
    else if (data.occupancy_rate >= 85) score += 0.6;
    else score += 0.3;
    
    return Math.min(10.0, Math.max(0.0, score));
  }

  /**
   * 📈 CÁLCULO DE SCORE DE CRESCIMENTO
   */
  calculateGrowthScore(data) {
    let score = 0;
    
    // Crescimento de dividendos (peso 50%)
    if (data.dividend_growth_1y >= 10) score += 5.0;
    else if (data.dividend_growth_1y >= 5) score += 4.0;
    else if (data.dividend_growth_1y >= 0) score += 3.0;
    else if (data.dividend_growth_1y >= -5) score += 2.0;
    else score += 1.0;
    
    // Crescimento de receita (peso 30%)
    if (data.revenue_growth_1y >= 15) score += 3.0;
    else if (data.revenue_growth_1y >= 10) score += 2.5;
    else if (data.revenue_growth_1y >= 5) score += 2.0;
    else if (data.revenue_growth_1y >= 0) score += 1.5;
    else score += 1.0;
    
    // ROE (peso 20%)
    if (data.roe >= 15) score += 2.0;
    else if (data.roe >= 12) score += 1.5;
    else if (data.roe >= 10) score += 1.0;
    else score += 0.5;
    
    return Math.min(10.0, Math.max(0.0, score));
  }

  /**
   * 🔄 FETCH COM RETRY E RATE LIMITING
   */
  async fetchWithRetry(url, retries = this.maxRetries) {
    for (let i = 0; i < retries; i++) {
      try {
        // Rate limiting
        if (i > 0) {
          await this.delay(this.requestDelay * (i + 1));
        }
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        
        console.log(`🌐 Fazendo requisição para: ${url} (tentativa ${i + 1}/${retries})`);
        
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
        
        console.log(`✅ Requisição bem-sucedida para ${url}`);
        return response;
        
      } catch (error) {
        console.warn(`⚠️ Tentativa ${i + 1}/${retries} falhou:`, error.message);
        
        if (i === retries - 1) {
          throw error;
        }
        
        // Delay progressivo entre tentativas
        await this.delay(this.requestDelay * (i + 1));
      }
    }
  }

  /**
   * 🛠️ UTILITÁRIOS DE EXTRAÇÃO
   */
  extractText(doc, selectors) {
    const selectorsArray = Array.isArray(selectors) ? selectors : [selectors];
    
    for (const selector of selectorsArray) {
      try {
        const element = doc.querySelector(selector);
        if (element) {
          const text = element.textContent?.trim();
          if (text && text !== '' && text !== '-' && text !== 'N/A') {
            return text;
          }
        }
      } catch (error) {
        console.warn(`⚠️ Erro no seletor ${selector}:`, error.message);
      }
    }
    
    // Fallback: buscar por texto específico
    const allElements = doc.querySelectorAll('*');
    for (const element of allElements) {
      const text = element.textContent?.trim();
      if (text && this.isRelevantText(text, selectorsArray)) {
        return text;
      }
    }
    
    return null;
  }

  extractNumber(doc, selectors) {
    const text = this.extractText(doc, selectors);
    return this.parseNumber(text);
  }

  extractPercentage(doc, selectors) {
    const text = this.extractText(doc, selectors);
    const number = this.parseNumber(text);
    return number !== null ? number : null;
  }

  isRelevantText(text, selectors) {
    if (!text || text.length > 100) return false;
    
    // Verificar se o texto contém padrões relevantes
    const patterns = [
      /\d+[,.]?\d*%/,  // Percentuais
      /R\$\s*\d+[,.]?\d*/,  // Valores em reais
      /\d+[,.]?\d*/  // Números
    ];
    
    return patterns.some(pattern => pattern.test(text));
  }

  parseNumber(text) {
    if (!text) return null;
    
    try {
      // Converter para string e limpar
      let cleaned = text.toString().trim();
      
      // Se o texto é muito longo, provavelmente não é um número válido
      if (cleaned.length > 15) {
        console.warn(`⚠️ Texto muito longo para ser número: ${cleaned.substring(0, 20)}...`);
        return null;
      }
      
      // Remover caracteres não numéricos exceto vírgula, ponto e sinal negativo
      cleaned = cleaned.replace(/[^\d,.-]/g, '');
      
      if (!cleaned) return null;
      
      // Se tem muitos dígitos consecutivos, provavelmente é um ID ou timestamp
      if (/\d{8,}/.test(cleaned)) {
        console.warn(`⚠️ Muitos dígitos consecutivos, ignorando: ${cleaned}`);
        return null;
      }
      
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
          // Se tem vírgula mas não parece decimal, remover
          cleaned = cleaned.replace(/,/g, '');
        }
      }
      
      const number = parseFloat(cleaned);
      
      // Verificar se o número é razoável
      if (isNaN(number) || !isFinite(number)) {
        return null;
      }
      
      // Evitar números muito grandes que provavelmente são IDs
      if (Math.abs(number) > 1000000000) { // 1 bilhão
        console.warn(`⚠️ Número muito grande, ignorando: ${number}`);
        return null;
      }
      
      return number;
    } catch (error) {
      console.warn('⚠️ Erro ao fazer parse do número:', text, error.message);
      return null;
    }
  }

  parseDate(text) {
    if (!text) return null;
    
    try {
      // Formatos esperados: DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD
      const cleaned = text.trim();
      
      // Formato brasileiro DD/MM/YYYY
      if (cleaned.includes('/')) {
        const [day, month, year] = cleaned.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      
      // Formato ISO YYYY-MM-DD
      if (cleaned.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return cleaned;
      }
      
      // Tentar parsing direto
      const date = new Date(cleaned);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
      
    } catch (error) {
      console.warn('⚠️ Erro ao fazer parse da data:', text, error.message);
    }
    
    return null;
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
    
    console.log(`🚀 Iniciando scraping de ${tickers.length} FIIs...`);
    
    for (let i = 0; i < tickers.length; i++) {
      const ticker = tickers[i];
      
      try {
        // Callback de progresso
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
    
    console.log(`✅ Scraping concluído: ${results.length} sucessos, ${errors.length} erros`);
    
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

  /**
   * 🔍 VALIDAR DADOS EXTRAÍDOS
   */
  validateData(data) {
    const errors = [];
    
    // Validações obrigatórias mais flexíveis
    if (!data.ticker) errors.push('Ticker é obrigatório');
    if (!data.name || data.name.includes('Não encontramos')) errors.push('Nome inválido');
    if (!data.price || data.price <= 0) errors.push('Preço inválido');
    
    // Validações mais flexíveis para dividend yield
    if (data.dividend_yield !== undefined) {
      if (data.dividend_yield < 0) errors.push('Dividend Yield negativo');
      if (data.dividend_yield > 30) errors.push('Dividend Yield muito alto (>30%)');
    }
    
    // Validações mais flexíveis para P/VP
    if (data.pvp !== undefined) {
      if (data.pvp <= 0) errors.push('P/VP inválido');
      if (data.pvp > 5) errors.push('P/VP muito alto (>5)');
    }
    
    // Setor pode ser padrão se não encontrado
    if (!data.sector) {
      data.sector = 'Fundos Imobiliários';
    }
    
    // Se não tem dividend_yield, usar valor padrão baixo
    if (!data.dividend_yield || data.dividend_yield === 0) {
      data.dividend_yield = 5.0; // Valor padrão conservador
      console.warn(`⚠️ Usando DY padrão para ${data.ticker}: 5.0%`);
    }
    
    // Se não tem P/VP, usar valor padrão
    if (!data.pvp || data.pvp === 0) {
      data.pvp = 1.0; // Valor padrão neutro
      console.warn(`⚠️ Usando P/VP padrão para ${data.ticker}: 1.0`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * 📈 EXTRAÇÃO DE MARKET CAP (SIMPLIFICADA)
   */
  extractMarketCap(doc) {
    try {
      // Buscar por "Valor de mercado" ou "Market Cap" de forma mais simples
      const bodyText = doc.body?.textContent || '';
      
      // Padrões mais específicos para market cap
      const marketCapPatterns = [
        /Valor de mercado[^0-9]*R\$\s*(\d+[.,]?\d*[.,]?\d*)/i,
        /Market Cap[^0-9]*R\$\s*(\d+[.,]?\d*[.,]?\d*)/i,
        /VALOR DE MERCADO[^0-9]*R\$\s*(\d+[.,]?\d*[.,]?\d*)/i
      ];
      
      for (const pattern of marketCapPatterns) {
        const match = bodyText.match(pattern);
        if (match) {
          const value = this.parseNumber(match[1]);
          if (value !== null && value > 1000000) { // Pelo menos 1 milhão
            console.log(`✅ Market Cap extraído: ${value}`);
            return value;
          }
        }
      }
      
      console.warn('⚠️ Market Cap não encontrado (não crítico)');
      return null;
      
    } catch (error) {
      console.error('❌ Erro ao extrair Market Cap:', error);
      return null;
    }
  }

  /**
   * 💰 EXTRAÇÃO ESPECÍFICA DE FFO (RESULTADO LÍQUIDO)
   */
  extractFFO(doc) {
    try {
      console.log('🔍 Extraindo FFO (Resultado Líquido)...');
      
      // Método 1: Buscar na tabela específica de resultados
      const resultTable = doc.querySelector('.fii-result, [class*="fii-result"], [class*="resultado"]');
      if (resultTable) {
        console.log('📊 Tabela de resultados encontrada');
        
        // Buscar por "Resultado Líquido" ou termos similares
        const resultElements = resultTable.querySelectorAll('*');
        for (const element of resultElements) {
          const text = element.textContent?.trim();
          if (text && (
            text.toLowerCase().includes('resultado líquido') ||
            text.toLowerCase().includes('resultado liquido') ||
            text.toLowerCase().includes('lucro líquido') ||
            text.toLowerCase().includes('lucro liquido') ||
            text.toLowerCase().includes('resultado do período') ||
            text.toLowerCase().includes('resultado do periodo')
          )) {
            console.log(`🎯 Termo encontrado: "${text}"`);
            
            // Buscar valor no mesmo elemento ou próximo
            const valueMatch = text.match(/R\$\s*([\d.,]+)/);
            if (valueMatch) {
              const value = this.parseNumber(valueMatch[1]);
              if (value !== null && value >= 100000 && value <= 1000000000) {
                console.log(`✅ FFO extraído da tabela: R$ ${value.toLocaleString()}`);
                return value;
              }
            }
            
            // Buscar no próximo elemento
            const nextElement = element.nextElementSibling;
            if (nextElement) {
              const nextText = nextElement.textContent?.trim();
              const nextMatch = nextText?.match(/R\$\s*([\d.,]+)/);
              if (nextMatch) {
                const value = this.parseNumber(nextMatch[1]);
                if (value !== null && value >= 100000 && value <= 1000000000) {
                  console.log(`✅ FFO extraído do próximo elemento: R$ ${value.toLocaleString()}`);
                  return value;
                }
              }
            }
            
            // Buscar no elemento pai
            const parent = element.parentElement;
            if (parent) {
              const parentText = parent.textContent?.trim();
              const parentMatch = parentText?.match(/R\$\s*([\d.,]+)/);
              if (parentMatch) {
                const value = this.parseNumber(parentMatch[1]);
                if (value !== null && value >= 100000 && value <= 1000000000) {
                  console.log(`✅ FFO extraído do elemento pai: R$ ${value.toLocaleString()}`);
                  return value;
                }
              }
            }
          }
        }
      }
      
      // Método 2: Buscar em todo o documento por padrões específicos
      const allElements = doc.querySelectorAll('*');
      for (const element of allElements) {
        const text = element.textContent?.trim();
        if (text && text.length < 200) {
          // Padrões específicos para FFO/Resultado Líquido
          const patterns = [
            /resultado\s+líquido.*?R\$\s*([\d.,]+)/i,
            /lucro\s+líquido.*?R\$\s*([\d.,]+)/i,
            /resultado\s+do\s+período.*?R\$\s*([\d.,]+)/i,
            /R\$\s*([\d.,]+).*?milhões?.*?resultado/i,
            /R\$\s*([\d.,]+).*?milhões?.*?lucro/i
          ];
          
          for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
              const value = this.parseNumber(match[1]);
              if (value !== null && value >= 100000 && value <= 1000000000) {
                console.log(`✅ FFO extraído por padrão: R$ ${value.toLocaleString()}`);
                return value;
              }
            }
          }
        }
      }
      
      // Método 3: Buscar valores em milhões nas notícias/textos
      const htmlText = doc.documentElement.textContent || '';
      const millionPatterns = [
        /resultado.*?(\d+[,.]?\d*)\s*milhões?/gi,
        /lucro.*?(\d+[,.]?\d*)\s*milhões?/gi,
        /(\d+[,.]?\d*)\s*milhões?.*?resultado/gi,
        /(\d+[,.]?\d*)\s*milhões?.*?lucro/gi
      ];
      
      for (const pattern of millionPatterns) {
        const matches = htmlText.match(pattern);
        if (matches && matches.length > 0) {
          for (const match of matches) {
            const numberMatch = match.match(/(\d+[,.]?\d*)/);
            if (numberMatch) {
              const value = this.parseNumber(numberMatch[1]) * 1000000; // Converter milhões para valor absoluto
              if (value >= 1000000 && value <= 1000000000) {
                console.log(`✅ FFO extraído de texto (milhões): R$ ${value.toLocaleString()}`);
                return value;
              }
            }
          }
        }
      }
      
      console.warn('⚠️ Não foi possível extrair FFO');
      return null;
      
    } catch (error) {
      console.error('❌ Erro ao extrair FFO:', error);
      return null;
    }
  }

  /**
   * 📊 EXTRAÇÃO ESPECÍFICA DE P/FFO
   * P/FFO = Preço da Cota / (FFO por Cota)
   */
  extractPFFO(doc, price = null, ffo = null) {
    try {
      console.log('🔍 Extraindo P/FFO...');
      
      // Primeiro, tentar encontrar P/FFO diretamente
      const pffoPatterns = [
        /P\/FFO[^0-9]*(\d+[,.]?\d*)/gi,
        /P\/ffo[^0-9]*(\d+[,.]?\d*)/gi,
        /pre[çc]o[^0-9]*ffo[^0-9]*(\d+[,.]?\d*)/gi
      ];
      
      const htmlText = doc.documentElement.textContent || doc.documentElement.innerText || '';
      
      for (const pattern of pffoPatterns) {
        const matches = htmlText.match(pattern);
        if (matches) {
          for (const match of matches) {
            const numberMatch = match.match(/(\d+[,.]?\d*)/);
            if (numberMatch) {
              const value = this.parseNumber(numberMatch[1]);
              if (value !== null && value >= 0.1 && value <= 100) {
                console.log(`✅ P/FFO extraído diretamente: ${value}`);
                return value;
              }
            }
          }
        }
      }
      
      // Se não encontrou diretamente, calcular P/FFO
      if (price && ffo) {
        // Precisamos do número de cotas para calcular FFO por cota
        // Vamos estimar baseado no valor patrimonial
        const patrimonio = this.extractPatrimonio(doc);
        const valorPatrimonial = this.extractValorPatrimonial(doc);
        
        if (patrimonio && valorPatrimonial) {
          const numeroCotas = patrimonio / valorPatrimonial;
          const ffoPerShare = ffo / numeroCotas;
          const pffo = price / ffoPerShare;
          
          if (pffo >= 0.1 && pffo <= 100) {
            console.log(`✅ P/FFO calculado: ${pffo.toFixed(2)}`);
            return parseFloat(pffo.toFixed(2));
          }
        }
        
        // Fallback: usar estimativa baseada em P/VP
        const pvp = this.extractPVP(doc);
        if (pvp) {
          // Estimativa: P/FFO geralmente é 0.8-1.2x do P/VP para FIIs
          const estimatedPFFO = pvp * 1.0;
          console.log(`⚠️ P/FFO estimado baseado em P/VP: ${estimatedPFFO.toFixed(2)}`);
          return parseFloat(estimatedPFFO.toFixed(2));
        }
      }
      
      console.warn('⚠️ Não foi possível extrair ou calcular P/FFO');
      return null;
      
    } catch (error) {
      console.error('❌ Erro ao extrair P/FFO:', error);
      return null;
    }
  }

  /**
   * 💰 EXTRAÇÃO DE PATRIMÔNIO LÍQUIDO
   */
  extractPatrimonio(doc) {
    try {
      const patterns = [
        /patrim[ôo]nio\s+l[íi]quido[^0-9]*R\$\s*([\d.,]+)/gi,
        /patrim[ôo]nio[^0-9]*R\$\s*([\d.,]+)\s*milh[õo]es/gi,
        /R\$\s*([\d.,]+)[^0-9]*patrim[ôo]nio/gi
      ];
      
      const htmlText = doc.documentElement.textContent || doc.documentElement.innerText || '';
      
      for (const pattern of patterns) {
        const matches = htmlText.match(pattern);
        if (matches) {
          for (const match of matches) {
            const numberMatch = match.match(/([\d.,]+)/);
            if (numberMatch) {
              let value = this.parseNumber(numberMatch[1]);
              if (value !== null) {
                if (match.toLowerCase().includes('milh')) {
                  value = value * 1000000;
                }
                if (value >= 10000000 && value <= 10000000000) {
                  return value;
                }
              }
            }
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('❌ Erro ao extrair patrimônio:', error);
      return null;
    }
  }

  /**
   * 💰 EXTRAÇÃO DE VALOR PATRIMONIAL POR COTA
   */
  extractValorPatrimonial(doc) {
    try {
      // Buscar elementos que contêm "Valor patrimonial" ou "VP"
      const elements = doc.querySelectorAll('*');
      for (const element of elements) {
        const text = element.textContent?.trim();
        if (text && (text.includes('Valor patrimonial') || text.includes('VP')) && text.length < 100) {
          const match = text.match(/(\d+[,.]?\d*)/);
          if (match) {
            const value = this.parseNumber(match[1]);
            if (value !== null && value >= 1 && value <= 1000) {
              return value;
            }
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('❌ Erro ao extrair valor patrimonial:', error);
      return null;
    }
  }
}

// 🚀 EXPORTAR INSTÂNCIA SINGLETON
const statusInvestScraper = new StatusInvestScraper();
export default statusInvestScraper; 
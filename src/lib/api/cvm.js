import { cache, CacheKeys, withCache } from '../storage/cache.js';
import { CACHE_CONFIG } from '../config.js';

// Base URL para dados abertos da CVM
const CVM_BASE_URL = 'https://dados.cvm.gov.br/dados';

// Mapeamento de endpoints da CVM
const CVM_ENDPOINTS = {
  FII_DEMONSTRACOES: '/FII/DOC/DFP/DADOS',
  FII_INFORMES_TRIMESTRAIS: '/FII/DOC/ITR/DADOS',
  FII_INFORMES_MENSAIS: '/FII/DOC/INF_MENSAL/DADOS',
  FII_INFORMES_ANUAIS: '/FII/DOC/INF_ANUAL/DADOS'
};

// Função para fazer download de arquivos CSV/TXT da CVM
const downloadCVMFile = async (url) => {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const text = await response.text();
    return text;
  } catch (error) {
    console.error('Erro ao baixar arquivo da CVM:', error);
    throw error;
  }
};

// Parser para arquivos CSV da CVM
const parseCSV = (csvText, delimiter = ';') => {
  const lines = csvText.trim().split('\n');
  if (lines.length === 0) return [];
  
  const headers = lines[0].split(delimiter).map(h => h.trim().replace(/"/g, ''));
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(delimiter).map(v => v.trim().replace(/"/g, ''));
    if (values.length === headers.length) {
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      data.push(row);
    }
  }
  
  return data;
};

// Service para dados da CVM
export class CVMAPIService {
  constructor() {
    this.baseURL = CVM_BASE_URL;
  }

  // Buscar demonstrações financeiras de FIIs
  async getFIIDemonstracoes(year = new Date().getFullYear()) {
    const cacheKey = `cvm_demonstracoes_${year}`;
    
    return withCache(
      cacheKey,
      async () => {
        const url = `${this.baseURL}${CVM_ENDPOINTS.FII_DEMONSTRACOES}/dfp_cia_aberta_${year}.csv`;
        const csvData = await downloadCVMFile(url);
        const parsed = parseCSV(csvData);
        
        // Filtrar apenas FIIs (CNPJ que terminam com padrão específico ou nome contém "FII")
        return parsed.filter(item => 
          item.DENOM_CIA && (
            item.DENOM_CIA.includes('FII') || 
            item.DENOM_CIA.includes('FUNDO DE INVESTIMENTO IMOBILIARIO') ||
            item.DENOM_CIA.includes('FUNDO INVESTIMENTO IMOBILIARIO')
          )
        ).map(item => ({
          cnpj: item.CNPJ_CIA,
          nome: item.DENOM_CIA,
          codigoCVM: item.CD_CVM,
          dataReferencia: item.DT_REFER,
          valorConta: parseFloat(item.VL_CONTA) || 0,
          descricaoConta: item.DS_CONTA
        }));
      },
      CACHE_CONFIG.fiis
    );
  }

  // Buscar informes trimestrais
  async getFIIInformesTrimestrais(year = new Date().getFullYear()) {
    const cacheKey = `cvm_informes_trimestrais_${year}`;
    
    return withCache(
      cacheKey,
      async () => {
        const url = `${this.baseURL}${CVM_ENDPOINTS.FII_INFORMES_TRIMESTRAIS}/itr_cia_aberta_${year}.csv`;
        const csvData = await downloadCVMFile(url);
        const parsed = parseCSV(csvData);
        
        return parsed.filter(item => 
          item.DENOM_CIA && item.DENOM_CIA.includes('FII')
        ).map(item => ({
          cnpj: item.CNPJ_CIA,
          nome: item.DENOM_CIA,
          trimestre: item.DT_REFER,
          valorPatrimonio: parseFloat(item.VL_CONTA) || 0
        }));
      },
      CACHE_CONFIG.fundamentals
    );
  }

  // Buscar lista de FIIs cadastrados na CVM
  async getFIIsCadastrados() {
    const cacheKey = 'cvm_fiis_cadastrados';
    
    return withCache(
      cacheKey,
      async () => {
        // Usar dados mais recentes disponíveis
        const currentYear = new Date().getFullYear();
        const demonstracoes = await this.getFIIDemonstracoes(currentYear);
        
        // Agrupar por CNPJ para evitar duplicatas
        const fiisMap = new Map();
        
        demonstracoes.forEach(item => {
          if (!fiisMap.has(item.cnpj)) {
            fiisMap.set(item.cnpj, {
              cnpj: item.cnpj,
              nome: item.nome,
              codigoCVM: item.codigoCVM,
              ultimaAtualizacao: item.dataReferencia
            });
          }
        });
        
        return Array.from(fiisMap.values());
      },
      CACHE_CONFIG.fiis
    );
  }

  // Buscar dados específicos de um FII por CNPJ
  async getFIIByCNPJ(cnpj, year = new Date().getFullYear()) {
    const cacheKey = `cvm_fii_${cnpj}_${year}`;
    
    return withCache(
      cacheKey,
      async () => {
        const demonstracoes = await this.getFIIDemonstracoes(year);
        const fiiData = demonstracoes.filter(item => item.cnpj === cnpj);
        
        if (fiiData.length === 0) {
          return null;
        }
        
        // Agrupar dados por tipo de conta
        const agrupado = {};
        fiiData.forEach(item => {
          if (!agrupado[item.descricaoConta]) {
            agrupado[item.descricaoConta] = [];
          }
          agrupado[item.descricaoConta].push(item);
        });
        
        return {
          cnpj,
          nome: fiiData[0].nome,
          codigoCVM: fiiData[0].codigoCVM,
          contas: agrupado,
          ultimaAtualizacao: Math.max(...fiiData.map(item => 
            new Date(item.dataReferencia).getTime()
          ))
        };
      },
      CACHE_CONFIG.fundamentals
    );
  }

  // Buscar indicadores financeiros calculados
  async getFIIIndicadores(cnpj, year = new Date().getFullYear()) {
    const fiiData = await this.getFIIByCNPJ(cnpj, year);
    
    if (!fiiData) {
      return null;
    }
    
    // Extrair valores importantes das contas
    const contas = fiiData.contas;
    let patrimonio = 0;
    let receitas = 0;
    let despesas = 0;
    let resultado = 0;
    
    // Mapear contas para valores (simplificado)
    Object.keys(contas).forEach(descricao => {
      const valores = contas[descricao];
      const valorTotal = valores.reduce((sum, item) => sum + item.valorConta, 0);
      
      if (descricao.includes('PATRIMONIO') || descricao.includes('ATIVO')) {
        patrimonio += valorTotal;
      } else if (descricao.includes('RECEITA')) {
        receitas += valorTotal;
      } else if (descricao.includes('DESPESA') || descricao.includes('CUSTO')) {
        despesas += valorTotal;
      } else if (descricao.includes('RESULTADO') || descricao.includes('LUCRO')) {
        resultado += valorTotal;
      }
    });
    
    return {
      cnpj,
      nome: fiiData.nome,
      patrimonio,
      receitas,
      despesas,
      resultado,
      margemLiquida: receitas > 0 ? (resultado / receitas) * 100 : 0,
      roe: patrimonio > 0 ? (resultado / patrimonio) * 100 : 0,
      ano: year,
      ultimaAtualizacao: fiiData.ultimaAtualizacao
    };
  }

  // Buscar dados históricos de múltiplos anos
  async getFIIHistorico(cnpj, anos = 3) {
    const currentYear = new Date().getFullYear();
    const promises = [];
    
    for (let i = 0; i < anos; i++) {
      const year = currentYear - i;
      promises.push(this.getFIIIndicadores(cnpj, year));
    }
    
    try {
      const results = await Promise.allSettled(promises);
      return results
        .filter(result => result.status === 'fulfilled' && result.value)
        .map(result => result.value)
        .sort((a, b) => b.ano - a.ano);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      return [];
    }
  }

  // Verificar disponibilidade de dados
  async checkDataAvailability() {
    try {
      const currentYear = new Date().getFullYear();
      const url = `${this.baseURL}${CVM_ENDPOINTS.FII_DEMONSTRACOES}/dfp_cia_aberta_${currentYear}.csv`;
      
      const response = await fetch(url, { method: 'HEAD' });
      return {
        available: response.ok,
        year: currentYear,
        lastModified: response.headers.get('Last-Modified')
      };
    } catch (error) {
      return {
        available: false,
        error: error.message
      };
    }
  }
}

// Instância padrão da API CVM
export const cvmAPI = new CVMAPIService();

// Utilitários para mapear dados CVM com dados de mercado
export const mapCVMToMarketData = (cvmData, marketData) => {
  if (!cvmData || !marketData) return null;
  
  return {
    ticker: marketData.ticker,
    nome: cvmData.nome,
    cnpj: cvmData.cnpj,
    patrimonio: cvmData.patrimonio,
    receitas: cvmData.receitas,
    resultado: cvmData.resultado,
    margemLiquida: cvmData.margemLiquida,
    roe: cvmData.roe,
    preco: marketData.price,
    dividendYield: marketData.dividendYield,
    pvp: marketData.pvp,
    valorMercado: marketData.price * marketData.shares || 0,
    ultimaAtualizacao: Math.max(
      new Date(cvmData.ultimaAtualizacao).getTime(),
      new Date(marketData.lastUpdate).getTime()
    )
  };
};

// Cache específico para dados da CVM (mais longo devido à baixa frequência de atualização)
export const CVMCacheConfig = {
  demonstracoes: 7 * 24 * 60 * 60 * 1000, // 7 dias
  informes: 24 * 60 * 60 * 1000, // 1 dia
  indicadores: 24 * 60 * 60 * 1000 // 1 dia
};


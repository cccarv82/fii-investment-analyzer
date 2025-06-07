// 🚀 SISTEMA AVANÇADO DE CACHE - IndexedDB + Compressão + Background Sync
// Capacidade ilimitada, compressão automática e sincronização em background

import LZString from 'lz-string';
import { autoMigrateCache } from './cacheMigration.js';

class IndexedDBCacheService {
  constructor() {
    this.dbName = 'FII_Investment_Cache';
    this.dbVersion = 1;
    this.storeName = 'quotes_cache';
    this.db = null;
    this.isInitialized = false;
    
    // Configurações
    this.CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas
    this.MARKET_HOURS = { start: 10, end: 18 };
    this.BACKGROUND_SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutos
    this.MAX_CACHE_SIZE = 100 * 1024 * 1024; // 100MB
    
    // Background sync
    this.backgroundSyncTimer = null;
    this.syncCallbacks = new Set();
    
    this.init();
  }

  // 🔧 Inicializar IndexedDB
  async init() {
    try {
      console.log('🔄 Inicializando IndexedDB Cache...');
      this.db = await this.openDatabase();
      this.isInitialized = true;
      console.log('✅ IndexedDB Cache inicializado com sucesso');
      console.log(`📂 Banco: ${this.dbName} v${this.dbVersion}`);
      console.log(`📦 Store: ${this.storeName}`);
      
      // 🔄 NOVO: Migração automática de dados antigos
      try {
        await autoMigrateCache();
        console.log('✅ Migração automática concluída');
      } catch (migrationError) {
        console.warn('⚠️ Erro na migração automática:', migrationError);
        // Não falhar a inicialização por causa da migração
      }
      
      // Iniciar background sync
      this.startBackgroundSync();
      console.log('🔄 Background sync iniciado');
      
      // Limpeza automática na inicialização
      await this.cleanOldCaches();
      console.log('🧹 Limpeza automática concluída');
      
    } catch (error) {
      console.error('❌ Erro ao inicializar IndexedDB:', error);
      console.error('📋 Detalhes do erro:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      // Fallback para localStorage se IndexedDB falhar
      this.fallbackToLocalStorage = true;
      console.warn('⚠️ Usando fallback para localStorage');
    }
  }

  // 📂 Abrir banco de dados IndexedDB
  openDatabase() {
    return new Promise((resolve, reject) => {
      console.log(`🔓 Abrindo banco IndexedDB: ${this.dbName} v${this.dbVersion}`);
      
      // Verificar se IndexedDB está disponível
      if (!window.indexedDB) {
        console.error('❌ IndexedDB não está disponível neste navegador');
        reject(new Error('IndexedDB não suportado'));
        return;
      }
      
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => {
        console.error('❌ Erro ao abrir IndexedDB:', request.error);
        reject(request.error);
      };
      
      request.onsuccess = () => {
        console.log('✅ IndexedDB aberto com sucesso');
        const db = request.result;
        console.log(`📊 Object stores disponíveis: ${Array.from(db.objectStoreNames).join(', ')}`);
        resolve(db);
      };
      
      request.onupgradeneeded = (event) => {
        console.log('🔄 Atualizando estrutura do IndexedDB...');
        const db = event.target.result;
        
        // Criar object store se não existir
        if (!db.objectStoreNames.contains(this.storeName)) {
          console.log(`📦 Criando object store: ${this.storeName}`);
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('type', 'type', { unique: false });
          console.log('✅ Object store criado com sucesso');
        } else {
          console.log(`📦 Object store já existe: ${this.storeName}`);
        }
      };
      
      request.onblocked = () => {
        console.warn('⚠️ IndexedDB bloqueado - feche outras abas do aplicativo');
      };
    });
  }

  // 🗜️ Comprimir dados usando LZ-String
  compressData(data) {
    try {
      const jsonString = JSON.stringify(data);
      const compressed = LZString.compress(jsonString);
      const originalSize = new Blob([jsonString]).size;
      const compressedSize = new Blob([compressed]).size;
      
      console.log(`🗜️ Compressão: ${originalSize} → ${compressedSize} bytes (${((1 - compressedSize/originalSize) * 100).toFixed(1)}% redução)`);
      
      return compressed;
    } catch (error) {
      console.error('❌ Erro na compressão:', error);
      return JSON.stringify(data); // Fallback sem compressão
    }
  }

  // 📤 Descomprimir dados
  decompressData(compressedData) {
    try {
      // Verificar se os dados estão comprimidos
      if (typeof compressedData === 'string' && compressedData.length > 0) {
        const decompressed = LZString.decompress(compressedData);
        if (decompressed) {
          return JSON.parse(decompressed);
        }
      }
      
      // Fallback: tentar parsear diretamente
      return typeof compressedData === 'string' ? JSON.parse(compressedData) : compressedData;
    } catch (error) {
      console.error('❌ Erro na descompressão:', error);
      return null;
    }
  }

  // 🕐 Verificar horário de mercado
  isMarketHours() {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    
    return day >= 1 && day <= 5 && 
           hour >= this.MARKET_HOURS.start && 
           hour < this.MARKET_HOURS.end;
  }

  // 📅 Gerar chave do cache
  getCacheKey(date = new Date()) {
    const dateStr = date.toISOString().split('T')[0];
    return `quotes_${dateStr}`;
  }

  // ✅ Verificar se cache é válido
  isCacheValid(cacheData) {
    if (!cacheData || !cacheData.timestamp || !cacheData.data) {
      return false;
    }

    const now = Date.now();
    const cacheTime = new Date(cacheData.timestamp).getTime();
    const age = now - cacheTime;

    // Cache válido por 24h
    if (age > this.CACHE_DURATION) {
      return false;
    }

    // Durante horário de mercado, cache válido por no máximo 1h
    if (this.isMarketHours() && age > 60 * 60 * 1000) {
      return false;
    }

    return true;
  }

  // 💾 Salvar cotações no IndexedDB
  async saveQuotes(quotes) {
    if (!this.isInitialized) {
      await this.init();
    }

    try {
      const cacheData = {
        id: this.getCacheKey(),
        type: 'quotes',
        timestamp: new Date().toISOString(),
        marketHours: this.isMarketHours(),
        count: Object.keys(quotes).length,
        data: quotes,
        version: '2.0' // Versão com compressão
      };

      // Comprimir dados
      const compressedData = this.compressData(cacheData.data);
      const finalData = {
        ...cacheData,
        data: compressedData,
        compressed: true
      };

      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      await new Promise((resolve, reject) => {
        const request = store.put(finalData);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      console.log(`✅ Cache salvo no IndexedDB: ${cacheData.count} cotações`);
      
      // Limpeza automática
      await this.cleanOldCaches();
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao salvar no IndexedDB:', error);
      
      // Fallback para localStorage
      return this.saveToLocalStorage(quotes);
    }
  }

  // 📖 Carregar cotações do IndexedDB
  async loadQuotes() {
    if (!this.isInitialized) {
      await this.init();
    }

    try {
      const cacheKey = this.getCacheKey();
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      
      const cacheData = await new Promise((resolve, reject) => {
        const request = store.get(cacheKey);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      if (!cacheData) {
        console.log('📭 Cache não encontrado no IndexedDB');
        return null;
      }

      // Descomprimir dados se necessário
      let data = cacheData.data;
      if (cacheData.compressed) {
        data = this.decompressData(cacheData.data);
      }

      const fullCacheData = { ...cacheData, data };

      if (!this.isCacheValid(fullCacheData)) {
        console.log('⏰ Cache inválido, removendo...');
        await this.deleteCache(cacheKey);
        return null;
      }

      const age = Date.now() - new Date(cacheData.timestamp).getTime();
      const ageMinutes = Math.floor(age / (1000 * 60));
      
      console.log(`✅ Cache válido carregado do IndexedDB: ${cacheData.count} cotações (${ageMinutes}min atrás)`);
      
      return data;
    } catch (error) {
      console.error('❌ Erro ao carregar do IndexedDB:', error);
      
      // Fallback para localStorage
      return this.loadFromLocalStorage();
    }
  }

  // 🗑️ Deletar cache específico
  async deleteCache(cacheKey) {
    try {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      await new Promise((resolve, reject) => {
        const request = store.delete(cacheKey);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
      
      console.log(`🗑️ Cache removido: ${cacheKey}`);
    } catch (error) {
      console.error('❌ Erro ao deletar cache:', error);
    }
  }

  // 🧹 Limpeza automática de caches antigos
  async cleanOldCaches() {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 7); // 7 dias atrás
      const cutoffTime = cutoffDate.getTime();

      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('timestamp');
      
      const range = IDBKeyRange.upperBound(cutoffDate.toISOString());
      const request = index.openCursor(range);
      
      let deletedCount = 0;
      
      await new Promise((resolve, reject) => {
        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            cursor.delete();
            deletedCount++;
            cursor.continue();
          } else {
            resolve();
          }
        };
        request.onerror = () => reject(request.error);
      });

      if (deletedCount > 0) {
        console.log(`✅ Limpeza automática: ${deletedCount} caches antigos removidos`);
      }
    } catch (error) {
      console.error('❌ Erro na limpeza automática:', error);
    }
  }

  // 🗑️ Limpar todo o cache
  async clearAllCache() {
    try {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      await new Promise((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
      
      console.log('🗑️ Todo cache IndexedDB limpo');
      return true;
    } catch (error) {
      console.error('❌ Erro ao limpar cache:', error);
      return false;
    }
  }

  // 📊 Obter estatísticas do cache
  async getCacheStats() {
    try {
      const currentCache = await this.loadQuotes();
      const cacheKey = this.getCacheKey();
      
      if (!currentCache) {
        return {
          exists: false,
          count: 0,
          age: 0,
          size: 0,
          isValid: false,
          isMarketHours: this.isMarketHours(),
          storage: 'IndexedDB'
        };
      }

      // Obter dados brutos para calcular tamanho
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      
      const cacheData = await new Promise((resolve, reject) => {
        const request = store.get(cacheKey);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      const age = Date.now() - new Date(cacheData.timestamp).getTime();
      const sizeKB = Math.round(new Blob([JSON.stringify(cacheData)]).size / 1024);

      return {
        exists: true,
        count: Object.keys(currentCache).length,
        age: age,
        ageMinutes: Math.floor(age / (1000 * 60)),
        ageHours: Math.floor(age / (1000 * 60 * 60)),
        size: sizeKB,
        sizeFormatted: `${sizeKB} KB`,
        isValid: this.isCacheValid(cacheData),
        isMarketHours: this.isMarketHours(),
        timestamp: cacheData.timestamp,
        lastUpdate: new Date(cacheData.timestamp).toLocaleString('pt-BR'),
        storage: 'IndexedDB',
        compressed: cacheData.compressed || false,
        version: cacheData.version || '1.0'
      };
    } catch (error) {
      console.error('❌ Erro ao obter stats do cache:', error);
      return { exists: false, error: error.message, storage: 'IndexedDB' };
    }
  }

  // 🔄 Background Sync - Iniciar
  startBackgroundSync() {
    if (this.backgroundSyncTimer) {
      clearInterval(this.backgroundSyncTimer);
    }

    this.backgroundSyncTimer = setInterval(async () => {
      try {
        console.log('🔄 Background Sync: Verificando necessidade de atualização...');
        
        const stats = await this.getCacheStats();
        
        // Verificar se precisa atualizar
        const needsUpdate = !stats.exists || 
                           !stats.isValid || 
                           (stats.isMarketHours && stats.ageMinutes > 30);

        if (needsUpdate) {
          console.log('🔄 Background Sync: Cache precisa ser atualizado');
          
          // Notificar callbacks registrados
          for (const callback of this.syncCallbacks) {
            try {
              await callback();
            } catch (error) {
              console.error('❌ Erro no callback de sync:', error);
            }
          }
        } else {
          console.log('✅ Background Sync: Cache ainda válido');
        }
      } catch (error) {
        console.error('❌ Erro no background sync:', error);
      }
    }, this.BACKGROUND_SYNC_INTERVAL);

    console.log('🔄 Background Sync iniciado (intervalo: 5min)');
  }

  // 🔄 Background Sync - Parar
  stopBackgroundSync() {
    if (this.backgroundSyncTimer) {
      clearInterval(this.backgroundSyncTimer);
      this.backgroundSyncTimer = null;
      console.log('⏹️ Background Sync parado');
    }
  }

  // 🔄 Background Sync - Registrar callback
  onBackgroundSync(callback) {
    this.syncCallbacks.add(callback);
    return () => this.syncCallbacks.delete(callback); // Retorna função para remover
  }

  // 💾 Fallback para localStorage
  saveToLocalStorage(quotes) {
    try {
      const cacheData = {
        timestamp: new Date().toISOString(),
        marketHours: this.isMarketHours(),
        count: Object.keys(quotes).length,
        data: quotes,
        storage: 'localStorage'
      };

      const cacheKey = `fii_quotes_cache_${this.getCacheKey()}`;
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      
      console.log(`✅ Cache salvo no localStorage (fallback): ${cacheData.count} cotações`);
      return true;
    } catch (error) {
      console.error('❌ Erro no fallback localStorage:', error);
      return false;
    }
  }

  // 📖 Fallback para localStorage
  loadFromLocalStorage() {
    try {
      const cacheKey = `fii_quotes_cache_${this.getCacheKey()}`;
      const cached = localStorage.getItem(cacheKey);
      
      if (!cached) {
        return null;
      }

      const cacheData = JSON.parse(cached);
      
      if (!this.isCacheValid(cacheData)) {
        localStorage.removeItem(cacheKey);
        return null;
      }

      console.log(`✅ Cache carregado do localStorage (fallback): ${cacheData.count} cotações`);
      return cacheData.data;
    } catch (error) {
      console.error('❌ Erro no fallback localStorage:', error);
      return null;
    }
  }

  // 🔄 Forçar refresh do cache
  async forceRefresh(fetchFunction, brapiToken) {
    console.log('🔄 Forçando refresh do cache IndexedDB...');
    
    // Limpar cache atual
    const cacheKey = this.getCacheKey();
    await this.deleteCache(cacheKey);
    
    // Buscar dados frescos
    try {
      const freshData = await fetchFunction(brapiToken);
      console.log(`✅ Refresh concluído: ${freshData.length} FIIs atualizados`);
      return freshData;
    } catch (error) {
      console.error('❌ Erro no refresh forçado:', error);
      throw error;
    }
  }
}

// 🎯 Instância singleton do serviço
export const indexedDBCache = new IndexedDBCacheService();

// 🔧 Funções utilitárias para uso direto
export const getCachedQuotes = () => indexedDBCache.loadQuotes();
export const saveCachedQuotes = (quotes) => indexedDBCache.saveQuotes(quotes);
export const clearQuotesCache = () => indexedDBCache.clearAllCache();
export const getQuotesCacheStats = () => indexedDBCache.getCacheStats();
export const onBackgroundSync = (callback) => indexedDBCache.onBackgroundSync(callback);

export default indexedDBCache; 
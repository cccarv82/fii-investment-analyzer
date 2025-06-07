// Sistema de armazenamento local usando localStorage e IndexedDB
class LocalStorage {
  constructor() {
    this.prefix = 'fii_analyzer_';
  }

  // Métodos para localStorage (dados simples)
  set(key, value) {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error);
      return false;
    }
  }

  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(this.prefix + key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Erro ao ler do localStorage:', error);
      return defaultValue;
    }
  }

  remove(key) {
    try {
      localStorage.removeItem(this.prefix + key);
      return true;
    } catch (error) {
      console.error('Erro ao remover do localStorage:', error);
      return false;
    }
  }

  clear() {
    try {
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith(this.prefix)
      );
      keys.forEach(key => localStorage.removeItem(key));
      return true;
    } catch (error) {
      console.error('Erro ao limpar localStorage:', error);
      return false;
    }
  }
}

// Sistema IndexedDB para dados mais complexos
class IndexedDBStorage {
  constructor() {
    this.dbName = 'FIIAnalyzerDB';
    this.version = 1;
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Store para carteira
        if (!db.objectStoreNames.contains('portfolio')) {
          const portfolioStore = db.createObjectStore('portfolio', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          portfolioStore.createIndex('ticker', 'ticker', { unique: false });
          portfolioStore.createIndex('date', 'date', { unique: false });
        }

        // Store para histórico de dividendos
        if (!db.objectStoreNames.contains('dividends')) {
          const dividendsStore = db.createObjectStore('dividends', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          dividendsStore.createIndex('ticker', 'ticker', { unique: false });
          dividendsStore.createIndex('date', 'date', { unique: false });
        }

        // Store para histórico de aportes
        if (!db.objectStoreNames.contains('contributions')) {
          const contributionsStore = db.createObjectStore('contributions', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          contributionsStore.createIndex('date', 'date', { unique: false });
        }

        // Store para cache de dados de FIIs
        if (!db.objectStoreNames.contains('fiis_cache')) {
          const cacheStore = db.createObjectStore('fiis_cache', { 
            keyPath: 'ticker' 
          });
          cacheStore.createIndex('lastUpdate', 'lastUpdate', { unique: false });
        }
      };
    });
  }

  async add(storeName, data) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async update(storeName, data) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async get(storeName, key) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll(storeName) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName, key) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getByIndex(storeName, indexName, value) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

// Instâncias globais
export const localStorage = new LocalStorage();
export const indexedDB = new IndexedDBStorage();


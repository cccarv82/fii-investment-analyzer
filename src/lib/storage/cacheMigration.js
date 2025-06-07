// 🔄 MIGRAÇÃO DE CACHE - localStorage → IndexedDB
// Utilitário para migrar dados existentes do localStorage para o novo sistema IndexedDB

import { indexedDBCache } from './indexedDBCache.js';

class CacheMigrationService {
  constructor() {
    this.OLD_CACHE_PREFIX = 'fii_quotes_cache_';
    this.migrationCompleted = false;
  }

  // 🔍 Verificar se há dados antigos no localStorage
  hasOldCacheData() {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.OLD_CACHE_PREFIX)) {
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('❌ Erro ao verificar cache antigo:', error);
      return false;
    }
  }

  // 📦 Obter dados do localStorage
  getOldCacheData() {
    try {
      const oldData = {};
      const keysToRemove = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key && key.startsWith(this.OLD_CACHE_PREFIX)) {
          try {
            const data = JSON.parse(localStorage.getItem(key));
            if (data && data.data && data.timestamp) {
              // Extrair data da chave
              const dateMatch = key.match(/(\d{4}-\d{2}-\d{2})$/);
              if (dateMatch) {
                oldData[dateMatch[1]] = data;
                keysToRemove.push(key);
              }
            }
          } catch (parseError) {
            console.warn(`⚠️ Erro ao parsear cache antigo ${key}:`, parseError);
            keysToRemove.push(key); // Remover dados corrompidos
          }
        }
      }

      return { oldData, keysToRemove };
    } catch (error) {
      console.error('❌ Erro ao obter dados antigos:', error);
      return { oldData: {}, keysToRemove: [] };
    }
  }

  // 🚀 Migrar dados para IndexedDB
  async migrateToIndexedDB() {
    if (this.migrationCompleted) {
      console.log('✅ Migração já foi concluída anteriormente');
      return true;
    }

    try {
      console.log('🔄 Iniciando migração localStorage → IndexedDB...');

      const { oldData, keysToRemove } = this.getOldCacheData();
      
      if (Object.keys(oldData).length === 0) {
        console.log('📭 Nenhum dado antigo encontrado para migrar');
        this.migrationCompleted = true;
        return true;
      }

      console.log(`📦 Encontrados ${Object.keys(oldData).length} caches antigos para migrar`);

      // Migrar apenas o cache mais recente
      const dates = Object.keys(oldData).sort().reverse();
      const mostRecentDate = dates[0];
      const mostRecentData = oldData[mostRecentDate];

      if (mostRecentData && mostRecentData.data) {
        console.log(`🔄 Migrando cache mais recente: ${mostRecentDate}`);
        
        // Verificar se os dados são válidos
        const age = Date.now() - new Date(mostRecentData.timestamp).getTime();
        const isStillValid = age < (24 * 60 * 60 * 1000); // 24 horas

        if (isStillValid) {
          await indexedDBCache.saveQuotes(mostRecentData.data);
          console.log(`✅ Cache migrado com sucesso: ${Object.keys(mostRecentData.data).length} cotações`);
        } else {
          console.log('⏰ Cache antigo expirado, não será migrado');
        }
      }

      // Limpar dados antigos do localStorage
      console.log(`🧹 Limpando ${keysToRemove.length} entradas antigas do localStorage...`);
      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.warn(`⚠️ Erro ao remover ${key}:`, error);
        }
      });

      // Marcar migração como concluída
      localStorage.setItem('cache_migration_completed', 'true');
      this.migrationCompleted = true;

      console.log('✅ Migração concluída com sucesso!');
      return true;

    } catch (error) {
      console.error('❌ Erro durante migração:', error);
      return false;
    }
  }

  // 🔍 Verificar se migração já foi feita
  isMigrationCompleted() {
    return localStorage.getItem('cache_migration_completed') === 'true';
  }

  // 🚀 Executar migração automática se necessário
  async autoMigrate() {
    if (this.isMigrationCompleted()) {
      console.log('✅ Migração já foi concluída');
      return true;
    }

    if (this.hasOldCacheData()) {
      console.log('🔄 Dados antigos detectados, iniciando migração automática...');
      return await this.migrateToIndexedDB();
    }

    console.log('📭 Nenhum dado antigo encontrado');
    // Marcar como concluída mesmo sem dados para migrar
    localStorage.setItem('cache_migration_completed', 'true');
    return true;
  }

  // 📊 Obter estatísticas da migração
  getMigrationStats() {
    const { oldData } = this.getOldCacheData();
    
    return {
      hasOldData: Object.keys(oldData).length > 0,
      oldCacheCount: Object.keys(oldData).length,
      migrationCompleted: this.isMigrationCompleted(),
      oldDataDates: Object.keys(oldData).sort()
    };
  }
}

// 🎯 Instância singleton
export const cacheMigration = new CacheMigrationService();

// 🔧 Funções utilitárias
export const autoMigrateCache = () => cacheMigration.autoMigrate();
export const getMigrationStats = () => cacheMigration.getMigrationStats();
export const forceMigration = () => cacheMigration.migrateToIndexedDB();

export default cacheMigration; 
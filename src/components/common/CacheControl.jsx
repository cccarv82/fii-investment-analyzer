import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  Database, 
  Clock, 
  HardDrive, 
  Trash2, 
  CheckCircle,
  AlertCircle,
  Info,
  Zap,
  Archive
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { indexedDBCache, getQuotesCacheStats, clearQuotesCache, onBackgroundSync } from '../../lib/storage/indexedDBCache';
import { formatCurrency } from '../../lib/utils/formatters';

const CacheControl = ({ onRefresh, isLoading = false }) => {
  const [cacheStats, setCacheStats] = useState(null);
  const [isClearing, setIsClearing] = useState(false);
  const [lastAction, setLastAction] = useState(null);
  const [backgroundSyncActive, setBackgroundSyncActive] = useState(false);

  // Carregar estatísticas do cache
  const loadCacheStats = async () => {
    try {
      const stats = await getQuotesCacheStats();
      setCacheStats(stats);
    } catch (error) {
      console.error('Erro ao carregar stats:', error);
    }
  };

  // Configurar background sync
  useEffect(() => {
    // Registrar callback para background sync
    const unsubscribe = onBackgroundSync(async () => {
      console.log('🔄 Background sync ativado - atualizando dados...');
      setBackgroundSyncActive(true);
      
      if (onRefresh) {
        await onRefresh(true);
      }
      
      setTimeout(() => setBackgroundSyncActive(false), 2000);
    });

    return unsubscribe; // Cleanup
  }, [onRefresh]);

  // Atualizar stats a cada 30 segundos
  useEffect(() => {
    loadCacheStats();
    const interval = setInterval(loadCacheStats, 30000);
    return () => clearInterval(interval);
  }, []);

  // Limpar cache
  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      await clearQuotesCache();
      setLastAction({
        type: 'clear',
        message: 'Cache IndexedDB limpo com sucesso',
        timestamp: new Date()
      });
      await loadCacheStats();
    } catch (error) {
      setLastAction({
        type: 'error',
        message: `Erro ao limpar cache: ${error.message}`,
        timestamp: new Date()
      });
    } finally {
      setIsClearing(false);
    }
  };

  // Forçar refresh
  const handleForceRefresh = () => {
    if (onRefresh) {
      onRefresh(true); // forceRefresh = true
      setLastAction({
        type: 'refresh',
        message: 'Refresh forçado iniciado',
        timestamp: new Date()
      });
    }
  };

  // Formatar tempo
  const formatAge = (ageMinutes) => {
    if (ageMinutes < 60) {
      return `${ageMinutes}min`;
    } else if (ageMinutes < 1440) {
      return `${Math.floor(ageMinutes / 60)}h ${ageMinutes % 60}min`;
    } else {
      return `${Math.floor(ageMinutes / 1440)}d ${Math.floor((ageMinutes % 1440) / 60)}h`;
    }
  };

  // Status do cache
  const getCacheStatus = () => {
    if (!cacheStats?.exists) {
      return {
        status: 'empty',
        color: 'secondary',
        icon: Database,
        text: 'Cache Vazio'
      };
    }

    if (!cacheStats.isValid) {
      return {
        status: 'expired',
        color: 'destructive',
        icon: AlertCircle,
        text: 'Cache Expirado'
      };
    }

    if (cacheStats.isMarketHours && cacheStats.ageMinutes > 60) {
      return {
        status: 'stale',
        color: 'warning',
        icon: Clock,
        text: 'Cache Desatualizado'
      };
    }

    return {
      status: 'fresh',
      color: 'success',
      icon: CheckCircle,
      text: 'Cache Válido'
    };
  };

  const status = getCacheStatus();
  const StatusIcon = status.icon;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Database className="h-5 w-5" />
              Cache Avançado
              <div className="flex gap-1 ml-2">
                <Badge variant="outline" className="text-xs">
                  <HardDrive className="h-3 w-3 mr-1" />
                  IndexedDB
                </Badge>
                {cacheStats?.compressed && (
                  <Badge variant="outline" className="text-xs">
                    <Archive className="h-3 w-3 mr-1" />
                    Comprimido
                  </Badge>
                )}
                <Badge variant={backgroundSyncActive ? "success" : "outline"} className="text-xs">
                  <Zap className="h-3 w-3 mr-1" />
                  Background Sync
                </Badge>
              </div>
            </CardTitle>
            <CardDescription>
              Sistema avançado com IndexedDB, compressão automática e sincronização em background
            </CardDescription>
          </div>
          <Badge variant={status.color} className="flex items-center gap-1">
            <StatusIcon className="h-3 w-3" />
            {status.text}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Estatísticas do Cache */}
        {cacheStats?.exists && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {cacheStats.count}
              </div>
              <div className="text-xs text-muted-foreground">
                FIIs em Cache
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {formatAge(cacheStats.ageMinutes)}
              </div>
              <div className="text-xs text-muted-foreground">
                Idade do Cache
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {cacheStats.sizeFormatted}
              </div>
              <div className="text-xs text-muted-foreground">
                Tamanho
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {cacheStats.storage}
              </div>
              <div className="text-xs text-muted-foreground">
                Armazenamento
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {cacheStats.version || '1.0'}
              </div>
              <div className="text-xs text-muted-foreground">
                Versão
              </div>
            </div>
          </div>
        )}

        {/* Informações do Cache */}
        {cacheStats?.exists && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Última atualização:</strong> {cacheStats.lastUpdate}
              <br />
              <strong>Status:</strong> {cacheStats.isValid ? 'Válido' : 'Expirado'}
              <br />
              <strong>Armazenamento:</strong> {cacheStats.storage}
              {cacheStats.compressed && (
                <>
                  <br />
                  <strong>Compressão:</strong> Ativa (dados comprimidos automaticamente)
                </>
              )}
              {cacheStats.isMarketHours && (
                <>
                  <br />
                  <strong>Horário de mercado:</strong> Cache expira em 1 hora
                </>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Background Sync Status */}
        <Alert variant={backgroundSyncActive ? "default" : "secondary"}>
          <Zap className="h-4 w-4" />
          <AlertDescription>
            <strong>Background Sync:</strong> {backgroundSyncActive ? 'Sincronizando...' : 'Ativo (verifica a cada 5min)'}
            <br />
            <small>
              Atualiza automaticamente quando cache expira durante horário de mercado
            </small>
          </AlertDescription>
        </Alert>

        {/* Ações */}
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={handleForceRefresh}
            disabled={isLoading}
            variant="default"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Atualizando...' : 'Forçar Refresh'}
          </Button>

          <Button
            onClick={handleClearCache}
            disabled={isClearing || !cacheStats?.exists}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {isClearing ? 'Limpando...' : 'Limpar Cache'}
          </Button>

          <Button
            onClick={loadCacheStats}
            variant="ghost"
            size="sm"
            className="flex items-center gap-2"
          >
            <HardDrive className="h-4 w-4" />
            Atualizar Stats
          </Button>

          <Button
            onClick={async () => {
              console.log('🧪 TESTE INDEXEDDB INICIADO');
              try {
                // Testar salvamento
                const testData = { 
                  TESTE11: { price: 10.50, dividendYield: 8.5 },
                  TESTE22: { price: 15.30, dividendYield: 7.2 }
                };
                
                console.log('💾 Salvando dados de teste...');
                await indexedDBCache.saveQuotes(testData);
                console.log('✅ Dados salvos com sucesso');
                
                // Testar carregamento
                console.log('📤 Carregando dados de teste...');
                const loadedData = await indexedDBCache.loadQuotes();
                console.log('📊 Dados carregados:', loadedData);
                
                if (loadedData && Object.keys(loadedData).length > 0) {
                  console.log('✅ TESTE INDEXEDDB: SUCESSO!');
                  alert('✅ IndexedDB funcionando corretamente!');
                } else {
                  console.log('❌ TESTE INDEXEDDB: FALHOU - Dados não carregados');
                  alert('❌ IndexedDB não está funcionando');
                }
                
                await loadCacheStats();
              } catch (error) {
                console.error('❌ TESTE INDEXEDDB: ERRO', error);
                alert(`❌ Erro no IndexedDB: ${error.message}`);
              }
            }}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Database className="h-4 w-4" />
            Testar IndexedDB
          </Button>
        </div>

        {/* Última Ação */}
        {lastAction && (
          <Alert variant={lastAction.type === 'error' ? 'destructive' : 'default'}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>{lastAction.type === 'error' ? 'Erro' : 'Sucesso'}:</strong> {lastAction.message}
              <br />
              <small>{lastAction.timestamp.toLocaleString('pt-BR')}</small>
            </AlertDescription>
          </Alert>
        )}

        {/* Informações sobre o Cache Avançado */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Recursos Avançados:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>IndexedDB:</strong> Capacidade ilimitada (vs 5-10MB do localStorage)</li>
            <li><strong>Compressão:</strong> Reduz tamanho dos dados em 60-80%</li>
            <li><strong>Background Sync:</strong> Atualização automática a cada 5 minutos</li>
            <li><strong>Fallback:</strong> Usa localStorage se IndexedDB falhar</li>
            <li><strong>Limpeza automática:</strong> Remove caches antigos (&gt;7 dias)</li>
            <li><strong>Horário de mercado:</strong> Cache expira em 1h (10h-18h), 24h fora do horário</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default CacheControl; 
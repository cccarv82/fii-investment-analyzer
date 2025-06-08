# 🚀 API ROUTES - SISTEMA HÍBRIDO FII

## 📡 Servidor da API

**URL Base:** `http://localhost:3001`  
**Porta:** `3001`  
**Tecnologia:** Express.js + Sistema Híbrido (Status Invest + Fundamentus)

## 🎯 Endpoints Disponíveis

### 🏥 Health Check
```http
GET /api/health
```
**Descrição:** Verificar se a API está funcionando  
**Resposta:**
```json
{
  "status": "OK",
  "service": "FII Investment API",
  "timestamp": "2025-06-08T04:18:57.206Z",
  "uptime": 10.2556778,
  "version": "1.0.0"
}
```

### 📋 Listar Endpoints
```http
GET /api
```
**Descrição:** Listar todas as rotas disponíveis  
**Resposta:**
```json
{
  "service": "FII Investment API",
  "version": "1.0.0",
  "endpoints": {
    "POST /api/fii-data/get-data": "Buscar dados de FIIs específicos",
    "GET /api/fii-data/all-fiis": "Buscar todos os FIIs disponíveis",
    "POST /api/fii-data/best-fiis": "Buscar melhores FIIs para IA",
    "POST /api/fii-data/refresh": "Atualizar dados forçadamente",
    "GET /api/fii-data/stats": "Obter estatísticas do sistema",
    "GET /api/fii-data/analysis/:ticker": "Análise fundamentalista",
    "POST /api/fii-data/cleanup": "Limpeza do sistema",
    "GET /api/health": "Health check"
  },
  "documentation": "Sistema Híbrido FII - Status Invest + Fundamentus",
  "timestamp": "2025-06-08T04:18:57.206Z"
}
```

---

## 🔍 Endpoints de Dados FII

### 1. Buscar Dados de FIIs Específicos
```http
POST /api/fii-data/get-data
Content-Type: application/json

{
  "tickers": ["MXRF11", "HGLG11", "XPML11"]
}
```

**Resposta:**
```json
[
  {
    "ticker": "MXRF11",
    "name": "Maxi Renda FII",
    "price": 9.45,
    "dividend_yield": 10.06,
    "pvp": 1.00,
    "sector": "Híbrido",
    "quality_score": 8.5,
    "ffo_yield": 10.06,
    "ffo_per_share": 0.95,
    "p_ffo": 9.89
  }
]
```

### 2. Buscar Todos os FIIs Disponíveis
```http
GET /api/fii-data/all-fiis
```

**Resposta:** Array com todos os FIIs disponíveis no sistema

### 3. Buscar Melhores FIIs para IA
```http
POST /api/fii-data/best-fiis
Content-Type: application/json

{
  "limit": 20,
  "filters": {
    "min_dy": 8.0,
    "max_pvp": 1.2,
    "sectors": ["Logística", "Corporativo"]
  }
}
```

**Resposta:** Array com os melhores FIIs ranqueados por qualidade

### 4. Atualizar Dados Forçadamente
```http
POST /api/fii-data/refresh
Content-Type: application/json

{
  "tickers": ["MXRF11", "HGLG11"] // opcional, se não informar atualiza todos
}
```

**Resposta:**
```json
{
  "success": true,
  "updated_count": 150,
  "timestamp": "2025-06-08T04:18:57.206Z",
  "message": "150 FIIs atualizados com sucesso"
}
```

### 5. Obter Estatísticas do Sistema
```http
GET /api/fii-data/stats
```

**Resposta:**
```json
{
  "total_fiis": 150,
  "last_update": "2025-06-08T04:18:57.206Z",
  "system_status": "OPERATIONAL",
  "data_sources": {
    "status_invest": "ACTIVE",
    "fundamentus": "ACTIVE"
  },
  "performance": {
    "avg_response_time": "1.2s",
    "success_rate": "98.5%"
  }
}
```

### 6. Análise Fundamentalista
```http
GET /api/fii-data/analysis/MXRF11
```

**Resposta:**
```json
{
  "ticker": "MXRF11",
  "name": "Maxi Renda FII",
  "current_price": 9.45,
  "dividend_yield": 10.06,
  "pvp": 1.00,
  "quality_score": 8.5,
  "sustainability_score": 9.0,
  "growth_score": 7.5,
  "risk_level": "MÉDIO",
  "preliminary_rating": "COMPRAR",
  "investment_thesis": "FII híbrido com excelente DY...",
  "investment_highlights": ["DY superior à Selic", "Gestão experiente"],
  "risk_factors": ["Concentração setorial", "Sensibilidade juros"],
  "competitive_advantages": ["Localização premium", "Contratos longos"],
  "dividend_sustainability": "ALTA",
  "growth_potential": "MÉDIO",
  "analysis_timestamp": "2025-06-08T04:18:57.206Z"
}
```

### 7. Limpeza do Sistema
```http
POST /api/fii-data/cleanup
```

**Resposta:**
```json
{
  "success": true,
  "message": "Limpeza do sistema concluída",
  "timestamp": "2025-06-08T04:18:57.206Z"
}
```

---

## 🚀 Como Usar

### 1. Iniciar o Servidor
```bash
# Opção 1: Apenas API
npm run dev:api

# Opção 2: API + Frontend simultaneamente
npm run dev:full

# Opção 3: Script Windows (recomendado)
start-dev.bat
```

### 2. Testar a API
```bash
# Health check
curl http://localhost:3001/api/health

# Listar endpoints
curl http://localhost:3001/api

# Buscar FII específico
curl -X POST http://localhost:3001/api/fii-data/get-data \
  -H "Content-Type: application/json" \
  -d '{"tickers": ["MXRF11"]}'
```

### 3. Integração Frontend
O frontend já está configurado para usar a API através do `fiiDataAPI.js`:

```javascript
import fiiDataAPI from '../lib/api/fiiDataAPI';

// Buscar todos os FIIs
const fiis = await fiiDataAPI.getAllFIIs();

// Buscar FIIs específicos
const fiis = await fiiDataAPI.getFIIData(['MXRF11', 'HGLG11']);

// Buscar melhores para IA
const bestFIIs = await fiiDataAPI.getBestFIIsForAI(20);
```

---

## 🔧 Configuração

### Variáveis de Ambiente
```env
PORT=3001                    # Porta do servidor API
NODE_ENV=development         # Ambiente
```

### Dependências
- **Express.js**: Servidor web
- **CORS**: Permitir requisições cross-origin
- **Sistema Híbrido**: Status Invest + Fundamentus scrapers

---

## 📊 Monitoramento

### Logs
O servidor registra todas as requisições:
```
🌐 2025-06-08T04:18:57.206Z - GET /api/health
🔍 Buscando dados de FIIs: MXRF11, HGLG11
✅ Retornando 2 FIIs
```

### Métricas
- **Uptime**: Disponível no `/api/health`
- **Performance**: Tempo de resposta médio
- **Taxa de Sucesso**: % de requisições bem-sucedidas

---

## 🛡️ Tratamento de Erros

### Códigos de Status
- **200**: Sucesso
- **400**: Requisição inválida
- **404**: Recurso não encontrado
- **500**: Erro interno do servidor

### Formato de Erro
```json
{
  "error": "Descrição do erro",
  "message": "Detalhes técnicos",
  "timestamp": "2025-06-08T04:18:57.206Z"
}
```

---

## ✅ Status Atual

**🟢 SISTEMA TOTALMENTE FUNCIONAL!**

- ✅ Servidor API rodando na porta 3001
- ✅ Frontend conectado e funcionando
- ✅ Sistema híbrido Status Invest + Fundamentus operacional
- ✅ Todas as rotas implementadas e testadas
- ✅ Tratamento de erros implementado
- ✅ Documentação completa

**🎯 Próximos Passos:**
1. Executar script Supabase (`SCRIPT_AJUSTE_SUPABASE.sql`)
2. Configurar Claude API key nas configurações
3. Testar análises de investimento completas 
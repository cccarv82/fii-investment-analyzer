# Guia de Instalação e Configuração

Este guia fornece instruções detalhadas para instalar, configurar e executar o FII Investment Analyzer em diferentes ambientes.

## Índice

1. [Requisitos do Sistema](#requisitos-do-sistema)
2. [Instalação Local](#instalação-local)
3. [Configuração do Ambiente](#configuração-do-ambiente)
4. [Execução em Desenvolvimento](#execução-em-desenvolvimento)
5. [Build para Produção](#build-para-produção)
6. [Deploy](#deploy)
7. [Configuração da IA](#configuração-da-ia)
8. [Troubleshooting](#troubleshooting)

## Requisitos do Sistema

### Software Necessário

- **Node.js**: Versão 18.0.0 ou superior
- **npm**: Versão 8.0.0 ou superior (ou pnpm/yarn)
- **Git**: Para clonar o repositório

### Hardware Recomendado

- **CPU**: Dual-core ou superior
- **RAM**: 4GB ou mais
- **Espaço em Disco**: 500MB para a aplicação

### Navegadores Suportados

- Chrome 90+
- Firefox 90+
- Safari 14+
- Edge 90+

## Instalação Local

### Clonando o Repositório

```bash
# Via HTTPS
git clone https://github.com/seu-usuario/fii-investment-app.git

# Via SSH
git clone git@github.com:seu-usuario/fii-investment-app.git

# Acessar o diretório
cd fii-investment-app
```

### Instalando Dependências

```bash
# Usando npm
npm install

# Usando pnpm
pnpm install

# Usando Yarn
yarn install
```

## Configuração do Ambiente

### Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```
# Configurações da Aplicação
VITE_APP_NAME="FII Investment Analyzer"
VITE_APP_VERSION="1.0.0"

# APIs (opcional)
VITE_PLEXA_API_URL="https://api.plexa.com.br"
VITE_CVM_API_URL="https://dados.cvm.gov.br/dados"

# Configurações de Build
VITE_PUBLIC_URL="/"
```

### Configurações Avançadas

Para personalizar ainda mais a aplicação, você pode modificar os seguintes arquivos:

- `vite.config.js`: Configurações do build e servidor de desenvolvimento
- `tailwind.config.js`: Personalização do tema Tailwind CSS
- `src/lib/config.js`: Configurações gerais da aplicação

## Execução em Desenvolvimento

### Servidor de Desenvolvimento

```bash
# Usando npm
npm run dev

# Usando pnpm
pnpm dev

# Usando Yarn
yarn dev
```

O servidor de desenvolvimento será iniciado em `http://localhost:5173`.

### Opções Adicionais

```bash
# Especificar porta
npm run dev -- --port 3000

# Permitir acesso externo
npm run dev -- --host

# Modo silencioso (menos logs)
npm run dev -- --silent
```

### Hot Reloading

O servidor de desenvolvimento suporta Hot Module Replacement (HMR), permitindo que você veja as alterações em tempo real sem recarregar a página.

## Build para Produção

### Gerando Build Otimizado

```bash
# Usando npm
npm run build

# Usando pnpm
pnpm build

# Usando Yarn
yarn build
```

O build será gerado na pasta `dist/`.

### Testando o Build Localmente

```bash
# Usando npm
npm run preview

# Usando pnpm
pnpm preview

# Usando Yarn
yarn preview
```

O servidor de preview será iniciado em `http://localhost:4173`.

### Otimizações de Build

Para otimizar ainda mais o build, você pode:

1. **Dividir Chunks**: Edite `vite.config.js` para configurar `build.rollupOptions.output.manualChunks`
2. **Comprimir Assets**: Ative a compressão Brotli/Gzip no servidor
3. **Lazy Loading**: Use `React.lazy()` para componentes grandes

## Deploy

### Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy para produção
vercel --prod
```

### Netlify

1. Crie uma conta no [Netlify](https://www.netlify.com/)
2. Conecte seu repositório GitHub
3. Configure as seguintes opções:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `18`

### GitHub Pages

1. Edite `vite.config.js` para adicionar a base URL:

```javascript
export default defineConfig({
  base: '/fii-investment-app/',
  // outras configurações...
});
```

2. Adicione o script de deploy ao `package.json`:

```json
"scripts": {
  "deploy": "gh-pages -d dist"
}
```

3. Instale o pacote gh-pages:

```bash
npm install --save-dev gh-pages
```

4. Execute o deploy:

```bash
npm run build && npm run deploy
```

## Configuração da IA

### Obtendo API Key da OpenAI

1. Crie uma conta na [OpenAI](https://platform.openai.com/)
2. Acesse a seção de API Keys
3. Crie uma nova API Key
4. Copie a chave gerada

### Configurando na Aplicação

1. Acesse a aplicação em execução
2. Navegue até a página "Configurações"
3. Cole sua API Key no campo apropriado
4. Clique em "Salvar"

### Testando a Integração

1. Acesse a página "Análises"
2. Clique em "Analisar Mercado"
3. Verifique se a análise é gerada corretamente

### Modo Demo

A aplicação funciona completamente sem configuração de IA, usando dados simulados para demonstração. Isso é útil para:

- Testar a aplicação sem custos
- Demonstrar funcionalidades para usuários
- Desenvolvimento e testes

## Troubleshooting

### Problemas Comuns

#### Erro de Build

**Problema**: Falha ao executar `npm run build`

**Soluções**:
1. Limpe o cache e reinstale as dependências:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Verifique a versão do Node.js:
   ```bash
   node --version
   ```
   Deve ser 18.0.0 ou superior.

3. Verifique erros de sintaxe no código:
   ```bash
   npm run lint
   ```

#### Erro de API

**Problema**: Falha ao carregar dados de FIIs

**Soluções**:
1. Verifique a conexão com a internet
2. Verifique se as APIs estão disponíveis
3. Limpe o cache do navegador
4. Verifique o console do navegador para erros específicos

#### Problemas de Armazenamento Local

**Problema**: Dados não são salvos ou carregados corretamente

**Soluções**:
1. Verifique se o navegador permite localStorage/IndexedDB
2. Limpe o armazenamento local:
   ```javascript
   localStorage.clear();
   indexedDB.deleteDatabase('FIIPortfolioDB');
   ```
3. Recarregue a aplicação

#### Problemas de Performance

**Problema**: Aplicação lenta ou travando

**Soluções**:
1. Reduza o número de FIIs na carteira
2. Desative animações em dispositivos mais antigos
3. Use o modo de performance:
   ```
   ?perf=1
   ```
   Adicione este parâmetro à URL

### Logs e Diagnóstico

Para habilitar logs detalhados, adicione o seguinte parâmetro à URL:

```
?debug=1
```

Isso ativará logs detalhados no console do navegador.

### Contato para Suporte

Se você encontrar problemas que não consegue resolver, entre em contato:

- **GitHub Issues**: [Abrir Issue](https://github.com/seu-usuario/fii-investment-app/issues)
- **Discussões**: [GitHub Discussions](https://github.com/seu-usuario/fii-investment-app/discussions)

---

## Próximos Passos

Após a instalação e configuração, consulte os seguintes documentos:

- [README.md](README.md): Visão geral do projeto
- [TECHNICAL_DOCS.md](TECHNICAL_DOCS.md): Documentação técnica detalhada
- [CONTRIBUTING.md](CONTRIBUTING.md): Guia para contribuir com o projeto

---

*Este guia de instalação é mantido pela equipe do FII Investment Analyzer. Última atualização: Junho 2025.*


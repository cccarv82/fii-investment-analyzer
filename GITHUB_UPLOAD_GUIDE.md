# 🚀 Guia Completo para Upload no GitHub

Este guia fornece instruções detalhadas para fazer upload do FII Investment Analyzer para o seu repositório GitHub e configurar deploy automático.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter:

- [ ] Conta no GitHub
- [ ] Git instalado no seu computador
- [ ] Projeto funcionando localmente
- [ ] Acesso ao terminal/prompt de comando

## 🔧 Preparação do Repositório Local

### 1. Inicializar Git (se necessário)

Se o projeto ainda não é um repositório Git:

```bash
# Navegar para a pasta do projeto
cd fii-investment-app

# Inicializar repositório Git
git init

# Adicionar todos os arquivos
git add .

# Fazer commit inicial
git commit -m "feat: implementação inicial do FII Investment Analyzer"
```

### 2. Verificar Estrutura do Projeto

Confirme que todos os arquivos essenciais estão presentes:

```
fii-investment-app/
├── .github/
│   └── workflows/
│       └── ci-cd.yml
├── public/
├── src/
├── .env.example
├── .gitignore
├── CONTRIBUTING.md
├── INSTALLATION.md
├── LICENSE
├── README.md
├── TECHNICAL_DOCS.md
├── package.json
├── vercel.json
└── vite.config.js
```

## 🌐 Criando Repositório no GitHub

### 1. Acessar GitHub

1. Acesse [github.com](https://github.com)
2. Faça login na sua conta
3. Clique no botão "+" no canto superior direito
4. Selecione "New repository"

### 2. Configurar Repositório

**Configurações recomendadas:**

- **Repository name**: `fii-investment-analyzer`
- **Description**: `🏢 Análise Inteligente de Fundos de Investimento Imobiliário com IA`
- **Visibility**: Public (recomendado para portfolio)
- **Initialize repository**: ❌ NÃO marcar (já temos arquivos locais)

### 3. Criar Repositório

Clique em "Create repository" - você será redirecionado para a página do repositório vazio.

## 📤 Upload do Código

### 1. Conectar Repositório Local ao GitHub

Copie os comandos da página do GitHub (seção "push an existing repository"):

```bash
# Adicionar remote origin
git remote add origin https://github.com/SEU-USUARIO/fii-investment-analyzer.git

# Renomear branch para main (se necessário)
git branch -M main

# Fazer push inicial
git push -u origin main
```

### 2. Verificar Upload

Após o push, atualize a página do GitHub. Você deve ver todos os arquivos do projeto.

## ⚙️ Configurações do Repositório

### 1. Configurar Descrição e Topics

Na página principal do repositório:

1. Clique no ícone de engrenagem (⚙️) ao lado de "About"
2. Adicione a descrição:
   ```
   🏢 Análise Inteligente de Fundos de Investimento Imobiliário com IA - React, TypeScript, Tailwind CSS
   ```
3. Adicione topics (tags):
   ```
   react, typescript, tailwindcss, fiis, investment, ai, openai, finance, brazil, b3
   ```
4. Marque "Use your repository description"
5. Salve as alterações

### 2. Configurar Branch Protection

Para proteger a branch main:

1. Vá em "Settings" → "Branches"
2. Clique em "Add rule"
3. Configure:
   - Branch name pattern: `main`
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging

### 3. Configurar Issues e Discussions

1. Vá em "Settings" → "General"
2. Na seção "Features":
   - ✅ Issues
   - ✅ Discussions
   - ✅ Projects
   - ✅ Wiki (opcional)

## 🚀 Configuração de Deploy Automático

### Opção 1: Vercel (Recomendado)

#### 1. Criar Conta no Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Clique em "Sign up"
3. Conecte com sua conta GitHub

#### 2. Importar Projeto

1. No dashboard do Vercel, clique em "New Project"
2. Selecione seu repositório `fii-investment-analyzer`
3. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

#### 3. Configurar Variáveis de Ambiente

Na seção "Environment Variables":

```
VITE_APP_NAME=FII Investment Analyzer
VITE_APP_VERSION=1.0.0
```

#### 4. Deploy

1. Clique em "Deploy"
2. Aguarde o build (2-3 minutos)
3. Acesse a URL gerada (ex: `fii-investment-analyzer.vercel.app`)

#### 5. Configurar Deploy Automático

O Vercel automaticamente fará deploy a cada push na branch main.

### Opção 2: Netlify

#### 1. Criar Conta no Netlify

1. Acesse [netlify.com](https://netlify.com)
2. Clique em "Sign up"
3. Conecte com GitHub

#### 2. Importar Projeto

1. Clique em "New site from Git"
2. Selecione GitHub
3. Escolha seu repositório
4. Configure:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

#### 3. Deploy

Clique em "Deploy site" e aguarde o build.

### Opção 3: GitHub Pages

#### 1. Configurar GitHub Actions

O arquivo `.github/workflows/ci-cd.yml` já está configurado para deploy automático.

#### 2. Ativar GitHub Pages

1. Vá em "Settings" → "Pages"
2. Source: "GitHub Actions"
3. Salve as configurações

#### 3. Configurar Base URL

Edite `vite.config.js`:

```javascript
export default defineConfig({
  base: '/fii-investment-analyzer/',
  // outras configurações...
});
```

Faça commit e push da alteração.

## 🔒 Configuração de Secrets (Para CI/CD)

### Para Vercel

Se usar GitHub Actions com Vercel:

1. Vá em "Settings" → "Secrets and variables" → "Actions"
2. Adicione os secrets:
   - `VERCEL_TOKEN`: Token da API do Vercel
   - `ORG_ID`: ID da organização Vercel
   - `PROJECT_ID`: ID do projeto Vercel

### Para OpenAI (Opcional)

Se quiser configurar API key da OpenAI como secret:

1. Adicione secret: `OPENAI_API_KEY`
2. Configure no código para usar a variável de ambiente

## 📊 Configuração de Analytics (Opcional)

### Google Analytics

1. Crie uma propriedade no Google Analytics
2. Adicione o tracking ID nas variáveis de ambiente:
   ```
   VITE_GA_TRACKING_ID=G-XXXXXXXXXX
   ```

### Vercel Analytics

1. No dashboard do Vercel, vá em "Analytics"
2. Ative o Vercel Analytics
3. Adicione o script no `index.html`

## 🏷️ Criando Releases

### 1. Criar Tag

```bash
# Criar tag para versão 1.0.0
git tag -a v1.0.0 -m "Release v1.0.0: Versão inicial do FII Investment Analyzer"

# Push da tag
git push origin v1.0.0
```

### 2. Criar Release no GitHub

1. Vá em "Releases" → "Create a new release"
2. Selecione a tag `v1.0.0`
3. Título: `v1.0.0 - Versão Inicial`
4. Descrição:
   ```markdown
   ## 🎉 Primeira versão do FII Investment Analyzer!
   
   ### ✨ Funcionalidades
   - 📊 Dashboard completo com análise de carteira
   - 🤖 Integração com IA para análises fundamentalistas
   - 📈 Simulações e projeções de investimento
   - 📱 Interface responsiva e moderna
   - 💾 Armazenamento local seguro
   
   ### 🚀 Como usar
   1. Acesse: [fii-investment-analyzer.vercel.app](https://fii-investment-analyzer.vercel.app)
   2. Configure sua API key da OpenAI (opcional)
   3. Comece a analisar seus investimentos!
   
   ### 📋 Próximas versões
   - Integração com corretoras
   - Alertas de preços
   - Análise comparativa
   ```

## 📝 Documentação do Repositório

### 1. README Badges

Adicione badges ao README para mostrar status:

```markdown
![Build Status](https://github.com/SEU-USUARIO/fii-investment-analyzer/workflows/CI%2FCD%20Pipeline/badge.svg)
![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)
![License](https://img.shields.io/badge/License-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.3.1-blue)
```

### 2. Atualizar Links

No README.md, substitua todos os `seu-usuario` pelo seu username real do GitHub.

### 3. Adicionar Screenshots

1. Tire screenshots da aplicação funcionando
2. Crie uma pasta `docs/images/`
3. Adicione as imagens ao README

## 🔄 Workflow de Desenvolvimento

### 1. Branches

Estrutura recomendada:
- `main`: Código de produção
- `develop`: Desenvolvimento ativo
- `feature/*`: Novas funcionalidades
- `hotfix/*`: Correções urgentes

### 2. Commits

Use Conventional Commits:
```bash
git commit -m "feat(portfolio): adicionar simulação de aportes"
git commit -m "fix(api): corrigir timeout na API da Plexa"
git commit -m "docs(readme): atualizar instruções de instalação"
```

### 3. Pull Requests

Template para PRs:
```markdown
## Descrição
Breve descrição das mudanças

## Tipo de mudança
- [ ] Bug fix
- [ ] Nova funcionalidade
- [ ] Breaking change
- [ ] Documentação

## Checklist
- [ ] Testes passando
- [ ] Build funcionando
- [ ] Documentação atualizada
- [ ] Screenshots (se aplicável)
```

## 🎯 Próximos Passos

Após o upload:

1. **Teste o deploy**: Acesse a URL e teste todas as funcionalidades
2. **Configure domínio personalizado** (opcional)
3. **Monitore analytics** e performance
4. **Colete feedback** de usuários
5. **Planeje próximas features**

## 🆘 Troubleshooting

### Problemas Comuns

#### Build falhando no deploy

1. Verifique se `package.json` tem todos os scripts necessários
2. Confirme se as dependências estão corretas
3. Teste o build localmente: `npm run build`

#### Deploy não atualizando

1. Verifique se o commit foi feito corretamente
2. Confirme se o webhook está ativo
3. Force um novo deploy no painel

#### Variáveis de ambiente não funcionando

1. Confirme se começam com `VITE_`
2. Verifique se estão configuradas no painel de deploy
3. Teste localmente com arquivo `.env.local`

## 📞 Suporte

Se encontrar problemas:

1. **Documentação**: Consulte os arquivos de documentação
2. **Issues**: Abra uma issue no repositório
3. **Discussions**: Use GitHub Discussions para dúvidas
4. **Community**: Participe da comunidade React/Vite

---

## ✅ Checklist Final

Antes de considerar o upload completo:

- [ ] Repositório criado no GitHub
- [ ] Código enviado com sucesso
- [ ] Deploy funcionando
- [ ] README atualizado com links corretos
- [ ] Documentação completa
- [ ] Licença configurada
- [ ] CI/CD funcionando
- [ ] Variáveis de ambiente configuradas
- [ ] Primeira release criada
- [ ] Aplicação testada em produção

**Parabéns! 🎉 Seu FII Investment Analyzer está agora disponível para o mundo!**

---

*Este guia foi criado para garantir que seu projeto tenha uma presença profissional no GitHub e esteja pronto para ser usado por outros desenvolvedores e investidores.*


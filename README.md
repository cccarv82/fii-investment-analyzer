# FII Investment Analyzer

## 📊 Análise Inteligente de Fundos de Investimento Imobiliário

Uma aplicação web moderna e completa para análise, gestão e simulação de investimentos em FIIs (Fundos de Investimento Imobiliário) da B3, com integração de inteligência artificial para análises fundamentalistas avançadas.

![FII Investment Analyzer](https://img.shields.io/badge/Status-Produção-green)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.1-blue)
![Vite](https://img.shields.io/badge/Vite-6.3.5-purple)

## 🚀 Funcionalidades Principais

### 💡 Análise Inteligente com IA
- **Análise Fundamentalista Automatizada**: Integração com OpenAI para análises detalhadas
- **Recomendações Personalizadas**: Sugestões baseadas no perfil do investidor
- **Análise de Mercado**: Insights sobre tendências e oportunidades
- **Modo Demo**: Funciona completamente sem configuração de IA

### 📈 Gestão de Carteira
- **Dashboard Completo**: Visão geral dos investimentos e performance
- **Gestão de Posições**: Controle detalhado de cotas e aportes
- **Histórico de Dividendos**: Acompanhamento de proventos recebidos
- **Análise de Performance**: Métricas avançadas de rentabilidade

### 🎯 Simulações e Projeções
- **Simulador de Aportes**: Projeções de patrimônio futuro
- **Cenários Múltiplos**: Análises conservadora, moderada e otimista
- **Métricas Avançadas**: Sharpe Ratio, Beta, Volatilidade, Alpha
- **Gráficos Interativos**: Visualizações profissionais com Recharts

### 📊 Visualizações e Relatórios
- **Gráficos Responsivos**: Charts interativos para todas as métricas
- **Distribuição Setorial**: Análise de diversificação da carteira
- **Relatórios em PDF**: Geração automática de relatórios completos
- **Exportação CSV**: Dados estruturados para análise externa

### 🔧 Recursos Técnicos
- **Interface Responsiva**: Design moderno que funciona em todos os dispositivos
- **Tema Claro/Escuro**: Alternância automática baseada na preferência do sistema
- **Armazenamento Local**: Dados persistidos localmente com segurança
- **Performance Otimizada**: Build otimizado para produção

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18.3.1**: Biblioteca principal para interface
- **Vite 6.3.5**: Build tool moderna e rápida
- **Tailwind CSS 3.4.1**: Framework CSS utilitário
- **Lucide React**: Ícones modernos e consistentes
- **Recharts**: Biblioteca de gráficos responsivos

### Funcionalidades Avançadas
- **OpenAI Integration**: Análises com inteligência artificial
- **jsPDF**: Geração de relatórios em PDF
- **LocalStorage/IndexedDB**: Persistência de dados local
- **Service Workers**: Cache e performance

### Qualidade e Desenvolvimento
- **ESLint**: Linting e qualidade de código
- **Prettier**: Formatação automática
- **TypeScript Ready**: Preparado para migração
- **Responsive Design**: Mobile-first approach

## 📦 Instalação e Configuração

### Pré-requisitos
- Node.js 18+ 
- npm ou pnpm
- Navegador moderno

### Instalação Local

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/fii-investment-app.git
cd fii-investment-app
```

2. **Instale as dependências**
```bash
npm install
# ou
pnpm install
```

3. **Configure variáveis de ambiente (opcional)**
```bash
cp .env.example .env.local
```

4. **Execute em desenvolvimento**
```bash
npm run dev
# ou
pnpm dev
```

5. **Acesse a aplicação**
```
http://localhost:5173
```

### Build para Produção

```bash
# Gerar build otimizado
npm run build

# Testar build localmente
npm run preview
```

## ⚙️ Configuração da IA (Opcional)

Para habilitar análises com inteligência artificial:

1. **Obtenha uma API Key da OpenAI**
   - Acesse [platform.openai.com](https://platform.openai.com/api-keys)
   - Crie uma nova API key

2. **Configure na aplicação**
   - Acesse "Configurações" na aplicação
   - Cole sua API key no campo apropriado
   - A IA será habilitada automaticamente

**Nota**: A aplicação funciona completamente sem configuração de IA, usando dados simulados para demonstração.

## 📱 Como Usar

### 1. Dashboard
- Visualize o resumo da sua carteira
- Acompanhe performance e dividendos
- Veja suas maiores posições

### 2. Investir
- Informe seu orçamento e perfil
- Receba sugestões personalizadas
- Analise recomendações detalhadas

### 3. Carteira
- Gerencie suas posições
- Adicione novos aportes
- Acompanhe histórico de dividendos

### 4. Análises
- Veja análises de mercado
- Obtenha insights sobre sua carteira
- Acesse recomendações de especialistas

### 5. Simulações
- Projete seu patrimônio futuro
- Compare diferentes cenários
- Analise métricas avançadas

## 🔒 Privacidade e Segurança

- **Dados Locais**: Todas as informações ficam no seu dispositivo
- **Sem Servidor**: Não enviamos dados para servidores externos
- **API Key Segura**: Sua chave da OpenAI fica apenas no seu navegador
- **Código Aberto**: Transparência total do funcionamento

## 📊 APIs e Fontes de Dados

### Dados de FIIs
- **Plexa API**: Cotações e dados fundamentalistas
- **CVM Dados Abertos**: Informações regulamentares
- **B3 APIs**: Dados oficiais da bolsa brasileira

### Inteligência Artificial
- **OpenAI GPT-3.5 Turbo**: Análises fundamentalistas
- **Prompts Especializados**: Contexto específico para FIIs
- **Fallback Inteligente**: Funciona sem IA configurada

## 🚀 Deploy e Hospedagem

### Vercel (Recomendado)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Netlify
```bash
# Build
npm run build

# Upload da pasta dist/
```

### GitHub Pages
```bash
# Configurar base no vite.config.js
base: '/nome-do-repositorio/'

# Build e deploy
npm run build
```

## 🤝 Contribuição

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🆘 Suporte

### Problemas Comuns

**Build falhando?**
- Verifique se tem Node.js 18+
- Delete `node_modules` e reinstale
- Verifique se não há caracteres especiais em JSX

**IA não funcionando?**
- Verifique se a API key está correta
- Confirme se tem créditos na OpenAI
- A aplicação funciona sem IA também

**Dados não salvando?**
- Verifique se o navegador permite localStorage
- Limpe o cache se necessário
- Use modo anônimo para testar

### Contato
- **Issues**: [GitHub Issues](https://github.com/seu-usuario/fii-investment-app/issues)
- **Discussões**: [GitHub Discussions](https://github.com/seu-usuario/fii-investment-app/discussions)

## 🎯 Roadmap

### Próximas Funcionalidades
- [ ] Integração com corretoras via API
- [ ] Alertas de preços e dividendos
- [ ] Análise comparativa de FIIs
- [ ] Simulador de rebalanceamento
- [ ] Exportação para Excel avançada
- [ ] Modo offline completo

### Melhorias Técnicas
- [ ] Migração completa para TypeScript
- [ ] Testes automatizados (Jest/Vitest)
- [ ] PWA (Progressive Web App)
- [ ] Internacionalização (i18n)
- [ ] Acessibilidade (WCAG 2.1)

## 📈 Estatísticas do Projeto

- **Linhas de Código**: ~15.000
- **Componentes React**: 25+
- **Páginas**: 6 principais
- **APIs Integradas**: 3+
- **Gráficos**: 8 tipos diferentes
- **Responsividade**: 100% mobile-friendly

## 🏆 Reconhecimentos

- **Dados**: B3, CVM, Plexa API
- **Design**: Inspirado em plataformas financeiras modernas
- **IA**: Powered by OpenAI
- **Comunidade**: React, Tailwind CSS, Vite

---

**Desenvolvido com ❤️ para a comunidade de investidores em FIIs**

*Este projeto é apenas para fins educacionais e informativos. Não constitui recomendação de investimento. Sempre consulte um profissional qualificado antes de tomar decisões de investimento.*


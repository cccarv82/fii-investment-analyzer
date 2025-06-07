# Contribuindo para o FII Investment Analyzer

Obrigado por considerar contribuir para o FII Investment Analyzer! Este documento fornece diretrizes para contribuições.

## Como Contribuir

### Reportando Bugs

1. Verifique se o bug já foi reportado nas [Issues](https://github.com/seu-usuario/fii-investment-app/issues)
2. Se não encontrar, crie uma nova issue com:
   - Descrição clara do problema
   - Passos para reproduzir
   - Comportamento esperado vs atual
   - Screenshots se aplicável
   - Informações do ambiente (OS, navegador, versão)

### Sugerindo Melhorias

1. Abra uma issue com a tag "enhancement"
2. Descreva claramente a melhoria proposta
3. Explique por que seria útil para o projeto
4. Forneça exemplos de uso se possível

### Contribuindo com Código

#### Setup do Ambiente

1. Fork o repositório
2. Clone seu fork:
   ```bash
   git clone https://github.com/seu-usuario/fii-investment-app.git
   ```
3. Instale as dependências:
   ```bash
   npm install
   ```
4. Crie uma branch para sua feature:
   ```bash
   git checkout -b feature/nome-da-feature
   ```

#### Padrões de Código

- Use ESLint e Prettier (configurados no projeto)
- Siga as convenções de nomenclatura:
  - Componentes: PascalCase
  - Funções: camelCase
  - Constantes: UPPER_SNAKE_CASE
- Escreva comentários em português
- Use TypeScript quando possível

#### Estrutura de Commits

Use o padrão Conventional Commits:

```
tipo(escopo): descrição

[corpo opcional]

[rodapé opcional]
```

Tipos válidos:
- `feat`: nova funcionalidade
- `fix`: correção de bug
- `docs`: documentação
- `style`: formatação
- `refactor`: refatoração
- `test`: testes
- `chore`: tarefas de manutenção

Exemplos:
```
feat(portfolio): adicionar simulação de aportes
fix(api): corrigir timeout na API da Plexa
docs(readme): atualizar instruções de instalação
```

#### Pull Requests

1. Certifique-se de que os testes passam:
   ```bash
   npm test
   ```
2. Verifique o build:
   ```bash
   npm run build
   ```
3. Atualize a documentação se necessário
4. Crie o Pull Request com:
   - Título claro e descritivo
   - Descrição detalhada das mudanças
   - Referência às issues relacionadas
   - Screenshots se aplicável

### Contribuindo com Documentação

- Documentação técnica em `TECHNICAL_DOCS.md`
- Guias de usuário no `README.md`
- Comentários no código em português
- Use Markdown para formatação

### Contribuindo com Testes

- Testes unitários com Jest/Vitest
- Testes de integração para APIs
- Testes de componentes com Testing Library
- Cobertura mínima de 80%

## Diretrizes de Desenvolvimento

### Arquitetura

- Mantenha componentes pequenos e focados
- Use Context API para estado global
- Implemente lazy loading para performance
- Siga os padrões de acessibilidade (WCAG 2.1)

### Performance

- Otimize imagens e assets
- Use memoização quando apropriado
- Implemente virtual scrolling para listas grandes
- Monitore o bundle size

### Segurança

- Sanitize todas as entradas do usuário
- Use HTTPS em produção
- Não exponha API keys no código
- Implemente CSP headers

## Processo de Review

1. **Automated Checks**: CI/CD executa testes e linting
2. **Code Review**: Maintainer revisa o código
3. **Testing**: Testa funcionalidades em diferentes ambientes
4. **Documentation**: Verifica se documentação está atualizada
5. **Merge**: Merge após aprovação

## Reconhecimento

Contribuidores são reconhecidos:
- No arquivo `CONTRIBUTORS.md`
- Nos release notes
- No README principal

## Código de Conduta

### Nosso Compromisso

Estamos comprometidos em tornar a participação neste projeto uma experiência livre de assédio para todos.

### Padrões

Comportamentos que contribuem para um ambiente positivo:
- Usar linguagem acolhedora e inclusiva
- Respeitar diferentes pontos de vista
- Aceitar críticas construtivas
- Focar no que é melhor para a comunidade

Comportamentos inaceitáveis:
- Linguagem ou imagens sexualizadas
- Trolling, comentários insultuosos
- Assédio público ou privado
- Publicar informações privadas de outros

### Aplicação

Instâncias de comportamento abusivo podem ser reportadas entrando em contato com a equipe do projeto. Todas as reclamações serão revisadas e investigadas.

## Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a mesma licença do projeto (MIT).

## Dúvidas?

- Abra uma [Discussion](https://github.com/seu-usuario/fii-investment-app/discussions)
- Entre em contato via [Issues](https://github.com/seu-usuario/fii-investment-app/issues)

---

Obrigado por contribuir! 🚀


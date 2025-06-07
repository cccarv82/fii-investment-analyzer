import React, { useState } from 'react';
import { TrendingUp, AlertCircle, Info, PieChart, DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { formatCurrency, formatPercentage } from '../lib/utils/formatters';
import InvestmentForm from '../components/investment/InvestmentForm';
import SuggestionCard from '../components/investment/SuggestionCard';

const Investment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [error, setError] = useState(null);

  // Função para simular a obtenção de sugestões
  const handleSubmitInvestment = (formData) => {
    setIsLoading(true);
    setError(null);
    
    // Simulação de chamada à API
    setTimeout(() => {
      try {
        // Dados mock para demonstração
        const mockSuggestions = {
          allocation: [
            {
              ticker: 'HGLG11',
              name: 'CSHG Logística FII',
              price: 172.50,
              dividendYield: 7.8,
              pvp: 0.95,
              sector: 'Logística',
              percentage: 25,
              recommendedAmount: formData.amount * 0.25,
              shares: Math.floor((formData.amount * 0.25) / 172.50),
              investmentAmount: Math.floor((formData.amount * 0.25) / 172.50) * 172.50,
              reasoning: 'Excelente fundamento com baixo P/VP e alto dividend yield.',
              strengths: ['Alto dividend yield de 7.8%', 'Negociado abaixo do valor patrimonial'],
              weaknesses: []
            },
            {
              ticker: 'XPLG11',
              name: 'XP Log FII',
              price: 105.20,
              dividendYield: 8.2,
              pvp: 0.88,
              sector: 'Logística',
              percentage: 20,
              recommendedAmount: formData.amount * 0.20,
              shares: Math.floor((formData.amount * 0.20) / 105.20),
              investmentAmount: Math.floor((formData.amount * 0.20) / 105.20) * 105.20,
              reasoning: 'Excelente fundamento com baixo P/VP e alto dividend yield.',
              strengths: ['Alto dividend yield de 8.2%', 'Negociado abaixo do valor patrimonial'],
              weaknesses: []
            },
            {
              ticker: 'VISC11',
              name: 'Vinci Shopping Centers FII',
              price: 112.30,
              dividendYield: 7.5,
              pvp: 0.92,
              sector: 'Shoppings',
              percentage: 15,
              recommendedAmount: formData.amount * 0.15,
              shares: Math.floor((formData.amount * 0.15) / 112.30),
              investmentAmount: Math.floor((formData.amount * 0.15) / 112.30) * 112.30,
              reasoning: 'Bom fundamento com pontos fortes como dividend yield consistente.',
              strengths: ['Bom dividend yield de 7.5%'],
              weaknesses: ['Setor com desafios de crescimento']
            },
            {
              ticker: 'KNRI11',
              name: 'Kinea Renda Imobiliária FII',
              price: 142.80,
              dividendYield: 6.8,
              pvp: 0.97,
              sector: 'Corporativo',
              percentage: 15,
              recommendedAmount: formData.amount * 0.15,
              shares: Math.floor((formData.amount * 0.15) / 142.80),
              investmentAmount: Math.floor((formData.amount * 0.15) / 142.80) * 142.80,
              reasoning: 'Bom fundamento com pontos fortes como gestão de qualidade.',
              strengths: ['Gestão de qualidade', 'Baixa vacância'],
              weaknesses: ['P/VP próximo de 1']
            },
            {
              ticker: 'KNCR11',
              name: 'Kinea Rendimentos Imobiliários FII',
              price: 98.50,
              dividendYield: 9.2,
              pvp: 1.02,
              sector: 'Recebíveis',
              percentage: 15,
              recommendedAmount: formData.amount * 0.15,
              shares: Math.floor((formData.amount * 0.15) / 98.50),
              investmentAmount: Math.floor((formData.amount * 0.15) / 98.50) * 98.50,
              reasoning: 'Excelente dividend yield com baixa volatilidade.',
              strengths: ['Alto dividend yield de 9.2%', 'Baixa volatilidade'],
              weaknesses: ['P/VP acima de 1']
            },
            {
              ticker: 'MXRF11',
              name: 'Maxi Renda FII',
              price: 10.20,
              dividendYield: 10.5,
              pvp: 1.05,
              sector: 'Recebíveis',
              percentage: 10,
              recommendedAmount: formData.amount * 0.10,
              shares: Math.floor((formData.amount * 0.10) / 10.20),
              investmentAmount: Math.floor((formData.amount * 0.10) / 10.20) * 10.20,
              reasoning: 'Alto dividend yield, mas com P/VP acima de 1.',
              strengths: ['Alto dividend yield de 10.5%'],
              weaknesses: ['P/VP acima de 1', 'Maior volatilidade']
            }
          ],
          summary: {
            totalAmount: formData.amount,
            totalInvestment: 0, // Será calculado
            remainingAmount: 0, // Será calculado
            expectedYield: 0, // Será calculado
            expectedYieldPercentage: 0, // Será calculado
            diversificationScore: 75
          },
          timestamp: new Date().toISOString()
        };

        // Calcular valores totais
        let totalInvestment = 0;
        let expectedYield = 0;

        mockSuggestions.allocation.forEach(item => {
          totalInvestment += item.investmentAmount;
          expectedYield += (item.investmentAmount * item.dividendYield) / 100;
        });

        mockSuggestions.summary.totalInvestment = totalInvestment;
        mockSuggestions.summary.remainingAmount = formData.amount - totalInvestment;
        mockSuggestions.summary.expectedYield = expectedYield;
        mockSuggestions.summary.expectedYieldPercentage = (expectedYield / totalInvestment) * 100;

        setSuggestions(mockSuggestions);
        setIsLoading(false);
      } catch (err) {
        setError('Erro ao processar sugestões. Tente novamente.');
        setIsLoading(false);
      }
    }, 2000); // Simular delay de 2 segundos
  };

  const handleAddToPortfolio = (suggestion) => {
    // Implementar adição à carteira
    console.log('Adicionar à carteira:', suggestion);
    alert(`${suggestion.ticker} adicionado à carteira!`);
  };

  const handleViewDetails = (ticker) => {
    // Implementar visualização de detalhes
    console.log('Ver detalhes:', ticker);
    alert(`Detalhes de ${ticker}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Investir em FIIs</h1>
        <p className="text-muted-foreground">
          Receba sugestões personalizadas de investimento em FIIs
        </p>
      </div>

      {/* Formulário ou Resultados */}
      {!suggestions ? (
        <InvestmentForm onSubmit={handleSubmitInvestment} isLoading={isLoading} />
      ) : (
        <div className="space-y-6">
          {/* Resumo das Sugestões */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Resumo da Sugestão
              </CardTitle>
              <CardDescription>
                Baseado no seu perfil {suggestions.riskProfile || 'de investimento'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Valor Total</h4>
                  <div className="text-2xl font-bold">
                    {formatCurrency(suggestions.summary.totalAmount)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Valor informado para investimento
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Renda Mensal Estimada</h4>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(suggestions.summary.expectedYield / 12)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatPercentage(suggestions.summary.expectedYieldPercentage)} ao ano
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Diversificação</h4>
                  <div className="text-2xl font-bold">
                    {suggestions.allocation.length} FIIs
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 rounded-full bg-secondary">
                      <div 
                        className="h-full rounded-full bg-primary" 
                        style={{ width: `${suggestions.summary.diversificationScore}%` }}
                      />
                    </div>
                    <span className="text-xs">{suggestions.summary.diversificationScore}%</span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Valor não investido: {formatCurrency(suggestions.summary.remainingAmount)} 
                    ({formatPercentage(suggestions.summary.remainingAmount / suggestions.summary.totalAmount)})
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>

          {/* Tabs para diferentes visualizações */}
          <Tabs defaultValue="cards">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="cards">Cartões</TabsTrigger>
              <TabsTrigger value="table">Tabela</TabsTrigger>
              <TabsTrigger value="chart">Gráfico</TabsTrigger>
            </TabsList>
            
            {/* Visualização em Cartões */}
            <TabsContent value="cards" className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {suggestions.allocation.map((suggestion) => (
                  <SuggestionCard
                    key={suggestion.ticker}
                    suggestion={suggestion}
                    onAddToPortfolio={handleAddToPortfolio}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            </TabsContent>
            
            {/* Visualização em Tabela */}
            <TabsContent value="table">
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="px-4 py-3 text-left text-sm font-medium">FII</th>
                          <th className="px-4 py-3 text-right text-sm font-medium">Preço</th>
                          <th className="px-4 py-3 text-right text-sm font-medium">DY</th>
                          <th className="px-4 py-3 text-right text-sm font-medium">P/VP</th>
                          <th className="px-4 py-3 text-right text-sm font-medium">Alocação</th>
                          <th className="px-4 py-3 text-right text-sm font-medium">Valor</th>
                          <th className="px-4 py-3 text-right text-sm font-medium">Cotas</th>
                          <th className="px-4 py-3 text-center text-sm font-medium">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {suggestions.allocation.map((suggestion) => (
                          <tr key={suggestion.ticker} className="border-b">
                            <td className="px-4 py-3 text-sm font-medium">
                              {suggestion.ticker}
                              <div className="text-xs text-muted-foreground">{suggestion.sector}</div>
                            </td>
                            <td className="px-4 py-3 text-right text-sm">
                              {formatCurrency(suggestion.price)}
                            </td>
                            <td className="px-4 py-3 text-right text-sm">
                              {formatPercentage(suggestion.dividendYield)}
                            </td>
                            <td className="px-4 py-3 text-right text-sm">
                              {suggestion.pvp.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-right text-sm">
                              {formatPercentage(suggestion.percentage)}
                            </td>
                            <td className="px-4 py-3 text-right text-sm">
                              {formatCurrency(suggestion.investmentAmount)}
                            </td>
                            <td className="px-4 py-3 text-right text-sm">
                              {suggestion.shares}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex justify-center gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleAddToPortfolio(suggestion)}
                                >
                                  <DollarSign className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleViewDetails(suggestion.ticker)}
                                >
                                  <Info className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Visualização em Gráfico */}
            <TabsContent value="chart">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Distribuição da Carteira
                  </CardTitle>
                  <CardDescription>
                    Alocação sugerida por FII e por setor
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <PieChart className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Gráfico de distribuição da carteira</p>
                    <p className="text-sm">(Implementação futura)</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              className="flex-1"
              onClick={() => setSuggestions(null)}
              variant="outline"
            >
              Voltar ao Formulário
            </Button>
            <Button className="flex-1">
              <DollarSign className="mr-2 h-4 w-4" />
              Adicionar Todos à Carteira
            </Button>
          </div>
        </div>
      )}

      {/* Mensagem de Erro */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default Investment;


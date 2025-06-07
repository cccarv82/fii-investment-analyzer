import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Percent, Building, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { formatCurrency, formatPercentage } from '../../lib/utils/formatters';

const SuggestionCard = ({ 
  suggestion, 
  onAddToPortfolio, 
  onViewDetails,
  isLoading = false 
}) => {
  const {
    ticker,
    name,
    price,
    dividendYield,
    pvp,
    sector,
    percentage,
    recommendedAmount,
    shares,
    investmentAmount,
    reasoning,
    strengths = [],
    weaknesses = []
  } = suggestion;

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'baixo': return 'bg-green-500';
      case 'medio': return 'bg-yellow-500';
      case 'alto': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getYieldColor = (yield_value) => {
    if (yield_value >= 8) return 'text-green-600';
    if (yield_value >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPVPColor = (pvp_value) => {
    if (pvp_value <= 0.9) return 'text-green-600';
    if (pvp_value <= 1.1) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="w-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building className="h-5 w-5 text-primary" />
              {ticker}
            </CardTitle>
            <CardDescription className="mt-1">
              {name || ticker}
            </CardDescription>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold">{formatCurrency(price)}</div>
            <Badge variant="secondary" className="mt-1">
              {sector || 'N/A'}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Métricas Principais */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Percent className="h-3 w-3" />
              Dividend Yield
            </div>
            <div className={`text-lg font-semibold ${getYieldColor(dividendYield)}`}>
              {formatPercentage(dividendYield)}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              P/VP
            </div>
            <div className={`text-lg font-semibold ${getPVPColor(pvp)}`}>
              {pvp?.toFixed(2) || 'N/A'}
            </div>
          </div>
        </div>

        {/* Alocação Recomendada */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Alocação Recomendada</span>
            <span className="font-medium">{formatPercentage(percentage)}</span>
          </div>
          <Progress value={percentage} className="h-2" />
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Valor: </span>
              <span className="font-medium">{formatCurrency(recommendedAmount)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Cotas: </span>
              <span className="font-medium">{shares}</span>
            </div>
          </div>
          
          <div className="text-sm">
            <span className="text-muted-foreground">Investimento real: </span>
            <span className="font-medium">{formatCurrency(investmentAmount)}</span>
          </div>
        </div>

        {/* Análise */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Análise</h4>
          <p className="text-sm text-muted-foreground">{reasoning}</p>
        </div>

        {/* Pontos Fortes e Fracos */}
        {(strengths.length > 0 || weaknesses.length > 0) && (
          <div className="space-y-2">
            {strengths.length > 0 && (
              <div>
                <h5 className="text-xs font-medium text-green-600 mb-1">Pontos Fortes</h5>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {strengths.slice(0, 2).map((strength, index) => (
                    <li key={index} className="flex items-start gap-1">
                      <Star className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {weaknesses.length > 0 && (
              <div>
                <h5 className="text-xs font-medium text-red-600 mb-1">Pontos de Atenção</h5>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {weaknesses.slice(0, 2).map((weakness, index) => (
                    <li key={index} className="flex items-start gap-1">
                      <TrendingDown className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                      {weakness}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Ações */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => onAddToPortfolio(suggestion)}
            className="flex-1"
            disabled={isLoading}
          >
            <DollarSign className="mr-2 h-4 w-4" />
            Adicionar à Carteira
          </Button>
          
          <Button
            variant="outline"
            onClick={() => onViewDetails(ticker)}
            disabled={isLoading}
          >
            Detalhes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SuggestionCard;


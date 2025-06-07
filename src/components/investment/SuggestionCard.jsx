import React, { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Building,
  Star,
  List,
  Grid3X3,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { formatCurrency, formatPercentage } from "../../lib/utils/formatters";

const SuggestionCard = ({
  suggestion,
  onAddToPortfolio,
  onViewDetails,
  isLoading = false,
  viewMode = "card", // 'card' ou 'list'
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
    weaknesses = [],
    risks = [],
    score,
    targetPrice,
    riskLevel,
    macroAnalysis,
    fundamentalAnalysis,
  } = suggestion;

  const getRiskColor = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case "baixo":
        return "bg-green-500";
      case "médio":
      case "medio":
        return "bg-yellow-500";
      case "alto":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getYieldColor = (yield_value) => {
    if (yield_value >= 8) return "text-green-600";
    if (yield_value >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  const getPVPColor = (pvp_value) => {
    if (pvp_value <= 0.9) return "text-green-600";
    if (pvp_value <= 1.1) return "text-yellow-600";
    return "text-red-600";
  };

  // 🔧 CORREÇÃO DEFINITIVA: Calcular valor corretamente
  const calculateValue = () => {
    // Prioridade: 1. recommendedAmount, 2. shares * price, 3. investmentAmount
    if (
      recommendedAmount &&
      !isNaN(recommendedAmount) &&
      recommendedAmount > 0
    ) {
      return recommendedAmount;
    }

    if (shares && price && !isNaN(shares) && !isNaN(price)) {
      return shares * price;
    }

    if (investmentAmount && !isNaN(investmentAmount) && investmentAmount > 0) {
      return investmentAmount;
    }

    return 0;
  };

  // 🔧 CORREÇÃO DEFINITIVA: Calcular percentage corretamente
  const calculatePercentage = () => {
    if (percentage && !isNaN(percentage) && percentage > 0) {
      return percentage;
    }

    // Se não tem percentage, assumir 25% (4 FIIs = 100%)
    return 25;
  };

  // 🔧 CORREÇÃO DEFINITIVA: Calcular shares corretamente
  const calculateShares = () => {
    if (shares && !isNaN(shares) && shares > 0) {
      return shares;
    }

    const value = calculateValue();
    if (value > 0 && price && !isNaN(price) && price > 0) {
      return Math.floor(value / price);
    }

    return 0;
  };

  // Renderização em lista (compacta)
  if (viewMode === "list") {
    return (
      <Card className="w-full hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            {/* Info básica */}
            <div className="flex items-center gap-4 flex-1">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-primary" />
                <div>
                  <div className="font-semibold">{ticker}</div>
                  <div className="text-sm text-muted-foreground">
                    {name || ticker}
                  </div>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs">
                {sector || "N/A"}
              </Badge>
            </div>

            {/* Métricas */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Preço</div>
                <div className="font-semibold">{formatCurrency(price)}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">DY</div>
                <div
                  className={`font-semibold ${getYieldColor(dividendYield)}`}
                >
                  {formatPercentage(dividendYield)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">P/VP</div>
                <div className={`font-semibold ${getPVPColor(pvp)}`}>
                  {pvp?.toFixed(2) || "N/A"}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Alocação</div>
                <div className="font-semibold">
                  {formatPercentage(calculatePercentage())}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Valor</div>
                <div className="font-semibold">
                  {formatCurrency(calculateValue())}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Cotas</div>
                <div className="font-semibold">{calculateShares()}</div>
              </div>
            </div>

            {/* Ações */}
            <div className="flex gap-2 ml-4">
              <Button
                size="sm"
                onClick={() => onAddToPortfolio(suggestion)}
                disabled={isLoading}
              >
                <DollarSign className="mr-1 h-3 w-3" />
                Adicionar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetails?.(ticker)}
                disabled={isLoading}
              >
                Detalhes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Renderização em card (detalhada) - VERSÃO CORRIGIDA
  return (
    <Card className="w-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building className="h-5 w-5 text-primary" />
              {ticker}
              {score && (
                <Badge variant="outline" className="ml-2">
                  Score: {score}/10
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="mt-1">{name || ticker}</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{formatCurrency(price)}</div>
            <div className="flex gap-2 mt-1">
              <Badge variant="secondary">{sector || "N/A"}</Badge>
              {riskLevel && (
                <Badge className={getRiskColor(riskLevel)}>{riskLevel}</Badge>
              )}
            </div>
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
            <div
              className={`text-lg font-semibold ${getYieldColor(
                dividendYield
              )}`}
            >
              {formatPercentage(dividendYield)}
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              P/VP
            </div>
            <div className={`text-lg font-semibold ${getPVPColor(pvp)}`}>
              {pvp?.toFixed(2) || "N/A"}
            </div>
          </div>
        </div>

        {/* Alocação Recomendada - CORRIGIDA */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Alocação Recomendada</span>
            <span className="font-medium">
              {formatPercentage(calculatePercentage())}
            </span>
          </div>
          <Progress value={calculatePercentage()} className="h-2" />
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Valor: </span>
              <span className="font-medium">
                {formatCurrency(calculateValue())}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Cotas: </span>
              <span className="font-medium">{calculateShares()}</span>
            </div>
          </div>
          {targetPrice && (
            <div className="text-sm">
              <span className="text-muted-foreground">Preço-alvo 12m: </span>
              <span className="font-medium text-green-600">
                {formatCurrency(targetPrice)}
              </span>
            </div>
          )}
        </div>

        {/* Análise */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Análise Fundamentalista</h4>
          <p className="text-sm text-muted-foreground">
            {reasoning || "Análise baseada em métricas fundamentalistas"}
          </p>
        </div>

        {/* Pontos Fortes e Riscos */}
        {(strengths.length > 0 ||
          (risks && risks.length > 0) ||
          weaknesses.length > 0) && (
          <div className="space-y-3">
            {strengths.length > 0 && (
              <div>
                <h5 className="text-xs font-medium text-green-600 mb-1">
                  Pontos Fortes
                </h5>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {strengths.slice(0, 3).map((strength, index) => (
                    <li key={index} className="flex items-start gap-1">
                      <Star className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {((risks && risks.length > 0) || weaknesses.length > 0) && (
              <div>
                <h5 className="text-xs font-medium text-red-600 mb-1">
                  Pontos de Atenção
                </h5>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {(risks || weaknesses).slice(0, 2).map((risk, index) => (
                    <li key={index} className="flex items-start gap-1">
                      <TrendingDown className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Análise Macro (se disponível) */}
        {macroAnalysis && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Contexto Macroeconômico</h4>
            <div className="text-xs text-muted-foreground space-y-1">
              {macroAnalysis.selicImpact && (
                <div>
                  <span className="font-medium">Selic: </span>
                  {macroAnalysis.selicImpact}
                </div>
              )}
              {macroAnalysis.sectorTrends && (
                <div>
                  <span className="font-medium">Setor: </span>
                  {macroAnalysis.sectorTrends}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Botões de Ação */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={() =>
              onAddToPortfolio({
                ...suggestion,
                shares: calculateShares(),
                recommendedAmount: calculateValue(),
                percentage: calculatePercentage(),
              })
            }
            disabled={isLoading}
            className="flex-1"
          >
            <DollarSign className="mr-2 h-4 w-4" />
            Adicionar à Carteira
          </Button>
          {onViewDetails && (
            <Button
              variant="outline"
              onClick={() => onViewDetails(ticker)}
              disabled={isLoading}
            >
              Detalhes
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// 🎯 Componente para lista de sugestões
export const SuggestionsList = ({
  suggestions,
  onAddToPortfolio,
  viewMode = "card",
}) => {
  const [currentViewMode, setCurrentViewMode] = useState(viewMode);

  if (!suggestions || suggestions.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <Building className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="font-medium">Nenhuma sugestão disponível</h3>
              <p className="text-sm text-muted-foreground">
                Execute uma análise para ver sugestões de investimento
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header com controles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Carteira Sugerida
              </CardTitle>
              <CardDescription>
                {suggestions.length} FIIs recomendados pela análise IA SUPREMA
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={currentViewMode === "card" ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentViewMode("card")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={currentViewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Lista de sugestões */}
      <div className={currentViewMode === "card" ? "grid gap-6" : "space-y-4"}>
        {suggestions.map((suggestion, index) => (
          <SuggestionCard
            key={`${suggestion.ticker}-${index}`}
            suggestion={suggestion}
            onAddToPortfolio={onAddToPortfolio}
            viewMode={currentViewMode}
          />
        ))}
      </div>
    </div>
  );
};

export default SuggestionCard;

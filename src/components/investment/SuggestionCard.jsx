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

  // ✅ CORREÇÃO CRÍTICA: Calcular valor corretamente - PRIORIDADE INVERTIDA
  const calculateValue = () => {
    // ✅ PRIORIDADE CORRIGIDA: shares * price primeiro (cálculo real)
    if (shares && price && !isNaN(shares) && !isNaN(price)) {
      return shares * price; // Cálculo real e preciso
    }

    // Fallback para recommendedAmount (valor da IA)
    if (
      recommendedAmount &&
      !isNaN(recommendedAmount) &&
      recommendedAmount > 0
    ) {
      return recommendedAmount;
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
              {score && (
                <Badge variant="outline" className="text-xs">
                  Score: {score}/10
                </Badge>
              )}
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

  // Renderização em card (detalhada) - MODO PADRÃO
  return (
    <Card className="w-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
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
                <Badge
                  variant="outline"
                  className={`text-white ${getRiskColor(riskLevel)}`}
                >
                  {riskLevel}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Métricas principais */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                💰 Dividend Yield
              </span>
              <span className={`font-semibold ${getYieldColor(dividendYield)}`}>
                {formatPercentage(dividendYield)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">⚖️ P/VP</span>
              <span className={`font-semibold ${getPVPColor(pvp)}`}>
                {pvp?.toFixed(2) || "N/A"}
              </span>
            </div>
            {/* ✅ NOVO: Potencial de Valorização */}
            {targetPrice && price > 0 && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">📈 Valorização</span>
                <span className="font-semibold text-green-600">
                  {formatPercentage(((targetPrice - price) / price) * 100)}
                </span>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                🎯 Alocação
              </span>
              <span className="font-semibold">
                {formatPercentage(calculatePercentage())}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                💵 Valor Total
              </span>
              <span className="font-semibold">
                {formatCurrency(calculateValue())}
              </span>
            </div>
            {/* ✅ MELHORADO: Renda Mensal de Dividendos */}
            {dividendYield > 0 && calculateValue() > 0 && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">💰 Dividendos/Mês</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency((calculateValue() * dividendYield / 100) / 12)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Barra de progresso da alocação */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Alocação na Carteira</span>
            <span>{formatPercentage(calculatePercentage())}</span>
          </div>
          <Progress value={calculatePercentage()} className="h-2" />
        </div>

        {/* ✅ MELHORADO: Investimento detalhado com mais informações */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium">💰 Investimento:</span>
            <span className="font-semibold">
              {formatCurrency(calculateValue())}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium">📊 Cotas:</span>
            <span className="font-semibold">{calculateShares()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium">💵 Preço/Cota:</span>
            <span className="font-semibold">{formatCurrency(price)}</span>
          </div>
          {targetPrice && (
            <div className="flex justify-between">
              <span className="text-sm font-medium">🎯 Meta 12m:</span>
              <span className="font-semibold text-green-600">
                {formatCurrency(targetPrice)}
              </span>
            </div>
          )}
          {/* ✅ MELHORADO: Renda anual de dividendos */}
          {dividendYield > 0 && calculateValue() > 0 && (
            <div className="flex justify-between border-t pt-2">
              <span className="text-sm font-medium">💰 Dividendos Anuais:</span>
              <span className="font-semibold text-green-600">
                {formatCurrency(calculateValue() * dividendYield / 100)}
              </span>
            </div>
          )}
        </div>

        {/* ✅ MELHORADO: Análise da IA (unificada) */}
        {reasoning && (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              🤖 Análise da IA
              {score && (
                <Badge variant="outline" className="text-xs">
                  {score}/10
                </Badge>
              )}
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {reasoning}
            </p>
          </div>
        )}

        {/* ✅ MELHORADO: Pontos Fortes e Riscos lado a lado */}
        {((strengths && strengths.length > 0) || (risks && risks.length > 0)) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pontos Fortes */}
            {strengths && strengths.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-green-600 flex items-center gap-1">
                  ✅ Pontos Fortes
                </h4>
                <ul className="space-y-1">
                  {strengths.slice(0, 3).map((strength, index) => (
                    <li
                      key={index}
                      className="text-sm text-muted-foreground flex items-start gap-2"
                    >
                      <span className="text-green-500 flex-shrink-0 mt-0.5">•</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Riscos */}
            {risks && risks.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-red-600 flex items-center gap-1">
                  ⚠️ Principais Riscos
                </h4>
                <ul className="space-y-1">
                  {risks.slice(0, 3).map((risk, index) => (
                    <li
                      key={index}
                      className="text-sm text-muted-foreground flex items-start gap-2"
                    >
                      <span className="text-red-500 flex-shrink-0 mt-0.5">•</span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* ✅ NOVO: Magic Number */}
        {dividendYield > 0 && price > 0 && (
          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
            {(() => {
              // ✅ CORREÇÃO: Calcular dividendo mensal por cota corretamente
              const dividendoMensalPorCota = (price * dividendYield / 100) / 12;
              
              // ✅ CORREÇÃO: Magic Number = preço da cota ÷ dividendo mensal por cota
              const magicNumber = Math.ceil(price / dividendoMensalPorCota);
              
              // ✅ CORREÇÃO: Dividendos mensais totais = magic number × dividendo por cota
              const dividendosMensaisTotais = magicNumber * dividendoMensalPorCota;
              
              return (
                <>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        🪄 Magic Number
                      </span>
                      <span className="text-xs text-blue-600 dark:text-blue-400">
                        (cotas para comprar 1 nova TODO MÊS com dividendos)
                      </span>
                    </div>
                    <span className="font-bold text-blue-700 dark:text-blue-300">
                      {magicNumber} cotas
                    </span>
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    💡 Com {magicNumber} cotas, você recebe ~{formatCurrency(dividendosMensaisTotais)} mensais = 1 nova cota/mês
                  </div>
                  <div className="text-xs text-blue-500 dark:text-blue-400 mt-1 font-medium">
                    📊 {formatCurrency(dividendoMensalPorCota)}/cota/mês × {magicNumber} cotas = {formatCurrency(dividendosMensaisTotais)}/mês
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* Botão de ação */}
        <div className="pt-4">
          <Button
            className="w-full"
            onClick={() => onAddToPortfolio(suggestion)}
            disabled={isLoading}
          >
            <DollarSign className="mr-2 h-4 w-4" />
            Adicionar à Carteira
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Componente para lista de sugestões
export const SuggestionsList = ({
  suggestions = [],
  onAddToPortfolio,
  onViewDetails,
  isLoading = false,
}) => {
  const [viewMode, setViewMode] = useState("card");

  if (!suggestions || suggestions.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Nenhuma sugestão disponível no momento.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header com controles */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Sugestões de Investimento</h3>
          <p className="text-sm text-muted-foreground">
            {suggestions.length} FII{suggestions.length !== 1 ? "s" : ""}{" "}
            recomendado{suggestions.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "card" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("card")}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Lista de sugestões */}
      <div
        className={
          viewMode === "card"
            ? "grid gap-6 md:grid-cols-2 lg:grid-cols-1"
            : "space-y-3"
        }
      >
        {suggestions.map((suggestion, index) => (
          <SuggestionCard
            key={suggestion.ticker || index}
            suggestion={suggestion}
            onAddToPortfolio={onAddToPortfolio}
            onViewDetails={onViewDetails}
            isLoading={isLoading}
            viewMode={viewMode}
          />
        ))}
      </div>
    </div>
  );
};

export default SuggestionCard;

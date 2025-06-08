import React, { useState, useMemo } from "react";
import {
  Flame,
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  Eye,
  BarChart3,
  Zap,
  Crown,
  Star
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

const SectorHeatmap = ({ portfolioMetrics, investments, marketData }) => {
  const [selectedSector, setSelectedSector] = useState(null);
  const [viewMode, setViewMode] = useState("performance"); // performance, opportunity, risk

  // Calcular dados do heatmap
  const heatmapData = useMemo(() => {
    if (!portfolioMetrics || !investments) return null;

    const sectors = {
      "Lajes Corporativas": { 
        performance: 9.2, 
        opportunity: 75, 
        risk: 30,
        marketDY: 8.5,
        trend: "up",
        description: "Setor defensivo com boa ocupação"
      },
      "Shopping": { 
        performance: 4.3, 
        opportunity: 85, 
        risk: 45,
        marketDY: 9.2,
        trend: "up",
        description: "Recuperação pós-pandemia em curso"
      },
      "Logística": { 
        performance: 12.1, 
        opportunity: 60, 
        risk: 25,
        marketDY: 8.1,
        trend: "up",
        description: "Crescimento sustentado pelo e-commerce"
      },
      "Residencial": { 
        performance: 6.7, 
        opportunity: 70, 
        risk: 35,
        marketDY: 8.9,
        trend: "stable",
        description: "Demanda habitacional constante"
      },
      "Híbrido": { 
        performance: 8.8, 
        opportunity: 65, 
        risk: 40,
        marketDY: 8.7,
        trend: "up",
        description: "Diversificação reduz volatilidade"
      },
      "Papel": { 
        performance: 15.2, 
        opportunity: 90, 
        risk: 60,
        marketDY: 10.5,
        trend: "up",
        description: "Alta volatilidade, alto potencial"
      },
      "Agro": { 
        performance: 11.5, 
        opportunity: 80, 
        risk: 50,
        marketDY: 9.8,
        trend: "up",
        description: "Commodities em alta sustentam setor"
      },
      "Educação": { 
        performance: 7.8, 
        opportunity: 75, 
        risk: 30,
        marketDY: 8.3,
        trend: "stable",
        description: "Setor defensivo e essencial"
      }
    };

    // Adicionar dados do portfólio atual
    const portfolioSectors = portfolioMetrics.sectorAnalysis || {};
    
    Object.keys(sectors).forEach(sector => {
      const portfolioData = portfolioSectors[sector];
      if (portfolioData) {
        sectors[sector].portfolioValue = portfolioData.value;
        sectors[sector].portfolioCount = portfolioData.count;
        sectors[sector].portfolioIncome = portfolioData.income;
        sectors[sector].hasInvestment = true;
        sectors[sector].weight = (portfolioData.value / portfolioMetrics.totalValue) * 100;
      } else {
        sectors[sector].hasInvestment = false;
        sectors[sector].weight = 0;
      }
    });

    return sectors;
  }, [portfolioMetrics, investments]);

  // Função para determinar cor do heatmap
  const getHeatmapColor = (sector, mode) => {
    if (!sector) return "bg-gray-100";

    let intensity;
    switch (mode) {
      case "performance":
        intensity = Math.max(0, Math.min(100, (sector.performance + 10) * 5));
        break;
      case "opportunity":
        intensity = sector.opportunity;
        break;
      case "risk":
        intensity = 100 - sector.risk; // Inverter para que baixo risco = verde
        break;
      default:
        intensity = 50;
    }

    if (intensity >= 80) return "bg-green-500 text-white";
    if (intensity >= 60) return "bg-green-400 text-white";
    if (intensity >= 40) return "bg-yellow-400 text-black";
    if (intensity >= 20) return "bg-orange-400 text-white";
    return "bg-red-400 text-white";
  };

  // Função para obter ícone da tendência
  const getTrendIcon = (trend) => {
    switch (trend) {
      case "up": return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "down": return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Target className="h-4 w-4 text-gray-600" />;
    }
  };

  if (!heatmapData) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Dados insuficientes para heatmap</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-gradient-to-r from-orange-500 to-red-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-6 w-6" />
            Heatmap Setorial Épico
            <Crown className="h-5 w-5 text-orange-600" />
          </CardTitle>
          <CardDescription>
            Visualização de calor mostrando performance, oportunidades e riscos por setor
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Controles de Visualização */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              variant={viewMode === "performance" ? "default" : "outline"}
              onClick={() => setViewMode("performance")}
              className="flex items-center gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Performance
            </Button>
            <Button
              variant={viewMode === "opportunity" ? "default" : "outline"}
              onClick={() => setViewMode("opportunity")}
              className="flex items-center gap-2"
            >
              <Target className="h-4 w-4" />
              Oportunidade
            </Button>
            <Button
              variant={viewMode === "risk" ? "default" : "outline"}
              onClick={() => setViewMode("risk")}
              className="flex items-center gap-2"
            >
              <AlertTriangle className="h-4 w-4" />
              Risco
            </Button>
          </div>

          {/* Legenda */}
          <div className="flex items-center gap-4 text-sm mb-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Excelente</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-400 rounded"></div>
              <span>Moderado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-400 rounded"></div>
              <span>Baixo/Alto Risco</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-blue-600" />
              <span>Seu Portfólio</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Heatmap Grid */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(heatmapData).map(([sectorName, sectorData]) => (
              <div
                key={sectorName}
                className={`relative p-4 rounded-lg cursor-pointer transition-all hover:scale-105 hover:shadow-lg ${getHeatmapColor(sectorData, viewMode)}`}
                onClick={() => setSelectedSector(selectedSector === sectorName ? null : sectorName)}
              >
                {/* Indicador de investimento */}
                {sectorData.hasInvestment && (
                  <Star className="absolute top-2 right-2 h-4 w-4 text-yellow-300" />
                )}

                <div className="text-center">
                  <h3 className="font-bold text-sm mb-2">{sectorName}</h3>
                  
                  {/* Valor principal baseado no modo */}
                  <div className="text-2xl font-bold mb-1">
                    {viewMode === "performance" && `${sectorData.performance > 0 ? '+' : ''}${sectorData.performance.toFixed(1)}%`}
                    {viewMode === "opportunity" && `${sectorData.opportunity}%`}
                    {viewMode === "risk" && `${sectorData.risk}%`}
                  </div>

                  {/* Tendência */}
                  <div className="flex items-center justify-center gap-1 mb-2">
                    {getTrendIcon(sectorData.trend)}
                    <span className="text-xs">DY: {sectorData.marketDY}%</span>
                  </div>

                  {/* Peso no portfólio */}
                  {sectorData.hasInvestment && (
                    <div className="text-xs opacity-90">
                      {sectorData.weight.toFixed(1)}% da carteira
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detalhes do Setor Selecionado */}
      {selectedSector && heatmapData[selectedSector] && (
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              {selectedSector} - Análise Detalhada
              {heatmapData[selectedSector].hasInvestment && (
                <Badge variant="outline" className="border-blue-500 text-blue-700">
                  <Star className="h-3 w-3 mr-1" />
                  No seu portfólio
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-lg font-bold text-green-600">
                  {heatmapData[selectedSector].performance > 0 ? '+' : ''}{heatmapData[selectedSector].performance.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Performance</div>
              </div>

              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-lg font-bold text-blue-600">
                  {heatmapData[selectedSector].opportunity}%
                </div>
                <div className="text-sm text-gray-600">Oportunidade</div>
              </div>

              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-lg font-bold text-orange-600">
                  {heatmapData[selectedSector].risk}%
                </div>
                <div className="text-sm text-gray-600">Risco</div>
              </div>

              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-lg font-bold text-purple-600">
                  {heatmapData[selectedSector].marketDY.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">DY Médio</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg mb-4">
              <h4 className="font-semibold mb-2">Análise do Setor</h4>
              <p className="text-sm text-gray-700 mb-3">
                {heatmapData[selectedSector].description}
              </p>

              {heatmapData[selectedSector].hasInvestment ? (
                <div className="space-y-2">
                  <h5 className="font-medium text-green-700">Sua Posição:</h5>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Valor:</span>
                      <div className="font-bold">R$ {heatmapData[selectedSector].portfolioValue?.toLocaleString('pt-BR')}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">FIIs:</span>
                      <div className="font-bold">{heatmapData[selectedSector].portfolioCount}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Renda/mês:</span>
                      <div className="font-bold">R$ {heatmapData[selectedSector].portfolioIncome?.toFixed(2)}</div>
                    </div>
                  </div>
                  <Progress value={heatmapData[selectedSector].weight} className="h-2 mt-2" />
                  <div className="text-xs text-gray-600">
                    {heatmapData[selectedSector].weight.toFixed(1)}% do seu portfólio
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <Target className="h-4 w-4" />
                    <span className="font-medium">Oportunidade de Diversificação</span>
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">
                    Você não possui investimentos neste setor. Considere adicionar para diversificar sua carteira.
                  </p>
                </div>
              )}
            </div>

            {/* Recomendações */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Recomendações IA
              </h4>
              <div className="space-y-2 text-sm">
                {heatmapData[selectedSector].opportunity > 80 && (
                  <div className="text-green-700">
                    🎯 <strong>Alta Oportunidade:</strong> Setor com excelente potencial de crescimento
                  </div>
                )}
                {heatmapData[selectedSector].risk < 30 && (
                  <div className="text-blue-700">
                    🛡️ <strong>Baixo Risco:</strong> Setor defensivo, ideal para carteiras conservadoras
                  </div>
                )}
                {heatmapData[selectedSector].performance > 10 && (
                  <div className="text-purple-700">
                    🚀 <strong>Alta Performance:</strong> Setor em forte valorização
                  </div>
                )}
                {!heatmapData[selectedSector].hasInvestment && heatmapData[selectedSector].opportunity > 70 && (
                  <div className="text-orange-700">
                    💡 <strong>Considere Investir:</strong> Boa oportunidade para diversificação
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumo de Oportunidades */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Top Oportunidades Setoriais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(heatmapData)
              .sort(([,a], [,b]) => b.opportunity - a.opportunity)
              .slice(0, 5)
              .map(([sector, data], index) => (
                <div key={sector} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{index + 1}º</Badge>
                    <span className="font-medium">{sector}</span>
                    {data.hasInvestment && <Star className="h-4 w-4 text-blue-600" />}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Oportunidade</div>
                      <div className="font-bold text-green-600">{data.opportunity}%</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Performance</div>
                      <div className="font-bold text-blue-600">{data.performance.toFixed(1)}%</div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SectorHeatmap; 
import React, { useState, useMemo } from "react";
import {
  Network,
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  Eye,
  BarChart3,
  Zap,
  Crown,
  Star,
  Shield,
  Activity,
  Layers,
  GitBranch
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

const CorrelationMatrix = ({ portfolioMetrics, investments, marketData }) => {
  const [selectedFII, setSelectedFII] = useState(null);
  const [viewMode, setViewMode] = useState("correlation"); // correlation, risk, sector

  // Calcular matriz de correlação
  const correlationData = useMemo(() => {
    if (!investments || investments.length < 2) return null;

    // Simular dados de correlação baseados em setores e características
    const correlationMatrix = {};
    const riskMetrics = {};
    const diversificationScores = {};

    investments.forEach((fii1, i) => {
      correlationMatrix[fii1.ticker] = {};
      
      // Calcular métricas de risco
      const volatility = Math.random() * 0.3 + 0.1; // 10-40%
      const beta = Math.random() * 1.5 + 0.5; // 0.5-2.0
      const sharpe = Math.random() * 2 + 0.5; // 0.5-2.5
      
      riskMetrics[fii1.ticker] = {
        volatility: volatility * 100,
        beta,
        sharpe,
        var95: volatility * 1.65 * 100, // VaR 95%
        maxDrawdown: Math.random() * 25 + 5 // 5-30%
      };

      investments.forEach((fii2, j) => {
        if (i === j) {
          correlationMatrix[fii1.ticker][fii2.ticker] = 1.0;
        } else {
          // Correlação baseada em setor
          let baseCorrelation = 0.3; // Correlação base
          
          if (fii1.sector === fii2.sector) {
            baseCorrelation = 0.7; // Mesmo setor = alta correlação
          } else if (
            (fii1.sector === "Lajes Corporativas" && fii2.sector === "Híbrido") ||
            (fii1.sector === "Shopping" && fii2.sector === "Híbrido") ||
            (fii1.sector === "Logística" && fii2.sector === "Híbrido")
          ) {
            baseCorrelation = 0.5; // Setores relacionados
          }

          // Adicionar variação aleatória
          const variation = (Math.random() - 0.5) * 0.4;
          const correlation = Math.max(-0.3, Math.min(0.95, baseCorrelation + variation));
          
          correlationMatrix[fii1.ticker][fii2.ticker] = correlation;
        }
      });

      // Score de diversificação
      const avgCorrelation = Object.values(correlationMatrix[fii1.ticker])
        .filter(corr => corr !== 1.0)
        .reduce((sum, corr) => sum + Math.abs(corr), 0) / (investments.length - 1);
      
      diversificationScores[fii1.ticker] = Math.max(0, 100 - (avgCorrelation * 100));
    });

    return {
      matrix: correlationMatrix,
      riskMetrics,
      diversificationScores
    };
  }, [investments]);

  // Análise de clusters
  const clusterAnalysis = useMemo(() => {
    if (!correlationData) return null;

    const clusters = [];
    const processed = new Set();

    investments.forEach(fii => {
      if (processed.has(fii.ticker)) return;

      const cluster = {
        name: `Cluster ${clusters.length + 1}`,
        fiis: [fii.ticker],
        avgCorrelation: 0,
        riskLevel: "Baixo",
        sectors: new Set([fii.sector])
      };

      // Encontrar FIIs altamente correlacionados
      investments.forEach(otherFii => {
        if (fii.ticker !== otherFii.ticker && !processed.has(otherFii.ticker)) {
          const correlation = correlationData.matrix[fii.ticker][otherFii.ticker];
          if (correlation > 0.6) {
            cluster.fiis.push(otherFii.ticker);
            cluster.sectors.add(otherFii.sector);
            processed.add(otherFii.ticker);
          }
        }
      });

      // Calcular correlação média do cluster
      if (cluster.fiis.length > 1) {
        let totalCorr = 0;
        let count = 0;
        cluster.fiis.forEach(ticker1 => {
          cluster.fiis.forEach(ticker2 => {
            if (ticker1 !== ticker2) {
              totalCorr += Math.abs(correlationData.matrix[ticker1][ticker2]);
              count++;
            }
          });
        });
        cluster.avgCorrelation = count > 0 ? totalCorr / count : 0;
      }

      // Determinar nível de risco
      if (cluster.avgCorrelation > 0.7) cluster.riskLevel = "Alto";
      else if (cluster.avgCorrelation > 0.5) cluster.riskLevel = "Médio";

      clusters.push(cluster);
      processed.add(fii.ticker);
    });

    return clusters;
  }, [correlationData, investments]);

  // Obter cor da correlação
  const getCorrelationColor = (correlation) => {
    const abs = Math.abs(correlation);
    if (abs >= 0.8) return "bg-red-500 text-white";
    if (abs >= 0.6) return "bg-orange-400 text-white";
    if (abs >= 0.4) return "bg-yellow-400 text-black";
    if (abs >= 0.2) return "bg-green-400 text-white";
    return "bg-green-500 text-white";
  };

  // Obter intensidade da cor
  const getCorrelationIntensity = (correlation) => {
    const abs = Math.abs(correlation);
    return Math.round(abs * 100);
  };

  if (!correlationData || investments.length < 2) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Network className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">
            Adicione pelo menos 2 FIIs para análise de correlação
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-gradient-to-r from-purple-500 to-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-6 w-6" />
            Matriz de Correlação Avançada
            <Crown className="h-5 w-5 text-purple-600" />
          </CardTitle>
          <CardDescription>
            Análise de correlações, clusters e diversificação do portfólio
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Controles de Visualização */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              variant={viewMode === "correlation" ? "default" : "outline"}
              onClick={() => setViewMode("correlation")}
              className="flex items-center gap-2"
            >
              <Network className="h-4 w-4" />
              Correlação
            </Button>
            <Button
              variant={viewMode === "risk" ? "default" : "outline"}
              onClick={() => setViewMode("risk")}
              className="flex items-center gap-2"
            >
              <AlertTriangle className="h-4 w-4" />
              Risco
            </Button>
            <Button
              variant={viewMode === "sector" ? "default" : "outline"}
              onClick={() => setViewMode("sector")}
              className="flex items-center gap-2"
            >
              <Layers className="h-4 w-4" />
              Setores
            </Button>
          </div>

          {/* Legenda */}
          <div className="flex items-center gap-4 text-sm mb-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Baixa Correlação (&lt;0.4)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-400 rounded"></div>
              <span>Moderada (0.4-0.6)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-400 rounded"></div>
              <span>Alta (0.6-0.8)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>Muito Alta (&gt;0.8)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Matriz de Correlação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Matriz de Correlação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="p-2 text-left font-medium">FII</th>
                  {investments.map(fii => (
                    <th key={fii.ticker} className="p-2 text-center font-medium text-xs">
                      {fii.ticker}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {investments.map(fii1 => (
                  <tr key={fii1.ticker}>
                    <td className="p-2 font-medium">{fii1.ticker}</td>
                    {investments.map(fii2 => {
                      const correlation = correlationData.matrix[fii1.ticker][fii2.ticker];
                      const isSelected = selectedFII === fii1.ticker || selectedFII === fii2.ticker;
                      
                      return (
                        <td
                          key={fii2.ticker}
                          className={`p-2 text-center cursor-pointer transition-all hover:scale-110 ${
                            getCorrelationColor(correlation)
                          } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                          onClick={() => setSelectedFII(
                            selectedFII === fii1.ticker ? null : fii1.ticker
                          )}
                          title={`${fii1.ticker} vs ${fii2.ticker}: ${correlation.toFixed(3)}`}
                        >
                          <div className="text-xs font-bold">
                            {correlation.toFixed(2)}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Análise de Clusters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Análise de Clusters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clusterAnalysis.map((cluster, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 ${
                  cluster.riskLevel === "Alto" ? "border-red-200 bg-red-50" :
                  cluster.riskLevel === "Médio" ? "border-yellow-200 bg-yellow-50" :
                  "border-green-200 bg-green-50"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">{cluster.name}</h3>
                  <Badge 
                    variant={
                      cluster.riskLevel === "Alto" ? "destructive" :
                      cluster.riskLevel === "Médio" ? "default" : "secondary"
                    }
                  >
                    {cluster.riskLevel}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-600">FIIs:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {cluster.fiis.map(ticker => (
                        <Badge key={ticker} variant="outline" className="text-xs">
                          {ticker}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-sm text-gray-600">Setores:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {Array.from(cluster.sectors).map(sector => (
                        <Badge key={sector} variant="secondary" className="text-xs">
                          {sector}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Correlação Média:</span>
                    <span className="font-bold">
                      {(cluster.avgCorrelation * 100).toFixed(0)}%
                    </span>
                  </div>

                  <Progress 
                    value={cluster.avgCorrelation * 100} 
                    className="h-2"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Métricas de Risco Individual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Métricas de Risco por FII
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">FII</th>
                  <th className="text-center p-3">Volatilidade</th>
                  <th className="text-center p-3">Beta</th>
                  <th className="text-center p-3">Sharpe</th>
                  <th className="text-center p-3">VaR 95%</th>
                  <th className="text-center p-3">Max Drawdown</th>
                  <th className="text-center p-3">Diversificação</th>
                </tr>
              </thead>
              <tbody>
                {investments.map(fii => {
                  const risk = correlationData.riskMetrics[fii.ticker];
                  const divScore = correlationData.diversificationScores[fii.ticker];
                  
                  return (
                    <tr key={fii.ticker} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">{fii.ticker}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 rounded text-xs ${
                          risk.volatility > 25 ? 'bg-red-100 text-red-800' :
                          risk.volatility > 15 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {risk.volatility.toFixed(1)}%
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 rounded text-xs ${
                          risk.beta > 1.2 ? 'bg-red-100 text-red-800' :
                          risk.beta > 0.8 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {risk.beta.toFixed(2)}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 rounded text-xs ${
                          risk.sharpe > 1.5 ? 'bg-green-100 text-green-800' :
                          risk.sharpe > 1.0 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {risk.sharpe.toFixed(2)}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="text-red-600 font-medium">
                          -{risk.var95.toFixed(1)}%
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="text-red-600 font-medium">
                          -{risk.maxDrawdown.toFixed(1)}%
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center gap-2">
                          <Progress value={divScore} className="h-2 flex-1" />
                          <span className="text-xs font-medium">
                            {divScore.toFixed(0)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Insights e Recomendações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Insights de Correlação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Correlações Altas */}
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Correlações Altas (Risco)
              </h4>
              <div className="space-y-2">
                {investments.map(fii1 => 
                  investments.map(fii2 => {
                    if (fii1.ticker >= fii2.ticker) return null;
                    const corr = correlationData.matrix[fii1.ticker][fii2.ticker];
                    if (corr < 0.7) return null;
                    
                    return (
                      <div key={`${fii1.ticker}-${fii2.ticker}`} className="text-sm">
                        <span className="font-medium">{fii1.ticker} ↔ {fii2.ticker}:</span>
                        <span className="text-red-700 ml-2">{(corr * 100).toFixed(0)}%</span>
                      </div>
                    );
                  })
                ).filter(Boolean)}
              </div>
            </div>

            {/* Diversificação */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Melhor Diversificação
              </h4>
              <div className="space-y-2">
                {Object.entries(correlationData.diversificationScores)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 3)
                  .map(([ticker, score]) => (
                    <div key={ticker} className="flex items-center justify-between text-sm">
                      <span className="font-medium">{ticker}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={score} className="h-2 w-16" />
                        <span className="text-green-700">{score.toFixed(0)}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Recomendações */}
          <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Star className="h-4 w-4" />
              Recomendações de Diversificação
            </h4>
            <div className="space-y-2 text-sm">
              {clusterAnalysis.some(c => c.riskLevel === "Alto") && (
                <div className="text-red-700">
                  🚨 <strong>Atenção:</strong> Detectados clusters de alta correlação. Considere reduzir exposição em setores concentrados.
                </div>
              )}
              
              {portfolioMetrics.diversificationScore < 60 && (
                <div className="text-orange-700">
                  💡 <strong>Oportunidade:</strong> Score de diversificação baixo. Adicione FIIs de setores diferentes.
                </div>
              )}
              
              <div className="text-blue-700">
                📊 <strong>Análise:</strong> Correlação média do portfólio: {
                  (Object.values(correlationData.matrix)
                    .flatMap(row => Object.values(row))
                    .filter(corr => corr !== 1.0)
                    .reduce((sum, corr) => sum + Math.abs(corr), 0) / 
                    (investments.length * (investments.length - 1))
                  ).toFixed(2)
                }
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CorrelationMatrix; 
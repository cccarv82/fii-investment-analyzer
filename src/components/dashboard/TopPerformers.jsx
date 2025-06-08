import React, { useMemo } from "react";
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Crown,
  Medal,
  Star,
  Zap,
  Target,
  DollarSign,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Award,
  Gem,
  AlertTriangle
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";

const TopPerformers = ({ portfolioData, portfolioMetrics }) => {
  // Calcular performers com dados mais detalhados
  const performersData = useMemo(() => {
    if (!portfolioData?.length) return null;

    const performers = portfolioData
      .map(inv => {
        const invested = inv.total_invested || 0;
        const current = inv.current_value || invested;
        const performance = invested > 0 ? ((current - invested) / invested) * 100 : 0;
        const gain = current - invested;
        const monthlyIncome = inv.monthly_income || 0;
        const dy = inv.dividend_yield_monthly || 0;
        
        return {
          ...inv,
          performance,
          gain,
          monthlyIncome,
          dy,
          value: current,
          invested,
          weight: portfolioMetrics?.totalValue > 0 ? (current / portfolioMetrics.totalValue) * 100 : 0
        };
      })
      .sort((a, b) => b.performance - a.performance);

    return {
      topPerformers: performers.slice(0, 5),
      worstPerformers: performers.slice(-3).reverse(),
      allPerformers: performers
    };
  }, [portfolioData, portfolioMetrics]);

  if (!performersData) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Adicione investimentos para ver os performers</p>
        </CardContent>
      </Card>
    );
  }

  const { topPerformers, worstPerformers } = performersData;

  const getPerformanceColor = (performance) => {
    if (performance >= 15) return "text-green-600 bg-green-50 border-green-200";
    if (performance >= 5) return "text-blue-600 bg-blue-50 border-blue-200";
    if (performance >= 0) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    if (performance >= -5) return "text-orange-600 bg-orange-50 border-orange-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getPerformanceIcon = (performance, index) => {
    if (index === 0 && performance > 0) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (index === 1 && performance > 0) return <Medal className="h-5 w-5 text-gray-400" />;
    if (index === 2 && performance > 0) return <Award className="h-5 w-5 text-amber-600" />;
    if (performance >= 0) return <TrendingUp className="h-4 w-4" />;
    return <TrendingDown className="h-4 w-4" />;
  };

  const getRankBadge = (index, performance) => {
    if (index === 0 && performance > 0) return { text: "🥇 CAMPEÃO", variant: "default", className: "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white" };
    if (index === 1 && performance > 0) return { text: "🥈 VICE", variant: "secondary", className: "bg-gradient-to-r from-gray-400 to-gray-600 text-white" };
    if (index === 2 && performance > 0) return { text: "🥉 3º LUGAR", variant: "outline", className: "bg-gradient-to-r from-amber-400 to-amber-600 text-white" };
    if (performance >= 10) return { text: "⭐ DESTAQUE", variant: "outline", className: "border-green-500 text-green-700" };
    if (performance >= 5) return { text: "📈 BOM", variant: "outline", className: "border-blue-500 text-blue-700" };
    if (performance >= 0) return { text: "➡️ NEUTRO", variant: "outline", className: "border-gray-500 text-gray-700" };
    return { text: "📉 ATENÇÃO", variant: "destructive", className: "border-red-500 text-red-700" };
  };

  return (
    <div className="space-y-6">
      {/* Header Épico */}
      <Card className="border-2 border-gradient-to-r from-yellow-400 to-orange-500 bg-gradient-to-r from-yellow-50 to-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Trophy className="h-8 w-8 text-yellow-600" />
            Hall da Fama - Top Performers
            <Sparkles className="h-6 w-6 text-yellow-500 animate-pulse" />
          </CardTitle>
          <CardDescription className="text-lg">
            Os campeões da sua carteira de investimentos
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Top 5 Performers */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Star className="h-6 w-6 text-yellow-500" />
          🏆 Top 5 Performers
        </h3>
        
        <div className="grid gap-4">
          {topPerformers.map((performer, index) => {
            const badge = getRankBadge(index, performer.performance);
            const colorClass = getPerformanceColor(performer.performance);
            
            return (
              <Card key={performer.ticker} className={`border-2 hover:shadow-xl transition-all duration-300 ${colorClass}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    {/* Lado Esquerdo - Info Principal */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getPerformanceIcon(performer.performance, index)}
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xl font-bold">{performer.ticker}</h4>
                            <Badge className={badge.className}>
                              {badge.text}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{performer.sector || 'Setor não informado'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Centro - Métricas */}
                    <div className="grid grid-cols-4 gap-6 text-center">
                      <div>
                        <div className="flex items-center justify-center gap-1 mb-1">
                          {performer.performance >= 0 ? (
                            <ArrowUpRight className="h-4 w-4 text-green-600" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 text-red-600" />
                          )}
                          <span className={`text-2xl font-bold ${performer.performance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {performer.performance.toFixed(1)}%
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">Performance</p>
                      </div>

                      <div>
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <DollarSign className="h-4 w-4 text-blue-600" />
                          <span className="text-lg font-bold text-blue-600">
                            R$ {performer.gain.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">Ganho/Perda</p>
                      </div>

                      <div>
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Percent className="h-4 w-4 text-purple-600" />
                          <span className="text-lg font-bold text-purple-600">
                            {performer.dy.toFixed(1)}%
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">DY Mensal</p>
                      </div>

                      <div>
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Target className="h-4 w-4 text-orange-600" />
                          <span className="text-lg font-bold text-orange-600">
                            {performer.weight.toFixed(1)}%
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">Peso</p>
                      </div>
                    </div>

                    {/* Lado Direito - Valor */}
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-800">
                        R$ {performer.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-sm text-gray-600">
                        Valor Atual
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Investido: R$ {performer.invested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>

                  {/* Barra de Performance */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Performance vs Carteira</span>
                      <span className="text-sm text-gray-600">
                        {performer.performance > (portfolioMetrics?.performance || 0) ? '🚀 Acima' : '📉 Abaixo'} da média
                      </span>
                    </div>
                    <Progress 
                      value={Math.max(0, Math.min(100, performer.performance + 50))} 
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Piores Performers (se houver) */}
      {worstPerformers.some(p => p.performance < 0) && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2 text-red-600">
            <TrendingDown className="h-6 w-6" />
            ⚠️ Atenção Especial
          </h3>
          
          <div className="grid gap-3">
            {worstPerformers.filter(p => p.performance < 0).map((performer, index) => (
              <Card key={performer.ticker} className="border-2 border-red-200 bg-red-50 hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <TrendingDown className="h-5 w-5 text-red-600" />
                      <div>
                        <h4 className="font-bold text-red-800">{performer.ticker}</h4>
                        <p className="text-sm text-red-600">{performer.sector}</p>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-xl font-bold text-red-600">
                        {performer.performance.toFixed(1)}%
                      </div>
                      <div className="text-sm text-red-500">
                        R$ {performer.gain.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>

                    <Badge variant="destructive">
                      Revisar Estratégia
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Resumo Estatístico */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gem className="h-5 w-5 text-blue-600" />
            Estatísticas dos Performers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white rounded-lg border">
              <Zap className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <div className="text-xl font-bold text-green-600">
                {topPerformers[0]?.performance.toFixed(1) || '0'}%
              </div>
              <div className="text-sm text-gray-600">Melhor Performance</div>
            </div>

            <div className="text-center p-4 bg-white rounded-lg border">
              <Target className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <div className="text-xl font-bold text-blue-600">
                {(topPerformers.reduce((sum, p) => sum + p.performance, 0) / topPerformers.length).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Média Top 5</div>
            </div>

            <div className="text-center p-4 bg-white rounded-lg border">
              <DollarSign className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <div className="text-xl font-bold text-purple-600">
                R$ {topPerformers.reduce((sum, p) => sum + p.gain, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-gray-600">Ganho Total Top 5</div>
            </div>

            <div className="text-center p-4 bg-white rounded-lg border">
              <Percent className="h-6 w-6 mx-auto mb-2 text-orange-600" />
              <div className="text-xl font-bold text-orange-600">
                {(topPerformers.reduce((sum, p) => sum + p.weight, 0)).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Peso Total Top 5</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TopPerformers; 
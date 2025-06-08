import React, { useState, useEffect, useMemo } from "react";
import {
  Bell,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Target,
  Zap,
  Eye,
  Clock,
  Star,
  Crown,
  Flame,
  Shield,
  DollarSign,
  BarChart3,
  X,
  Settings,
  Volume2,
  VolumeX
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";

const SmartAlerts = ({ portfolioMetrics, investments, marketData }) => {
  const [alerts, setAlerts] = useState([]);
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());
  const [alertSettings, setAlertSettings] = useState({
    performance: true,
    opportunities: true,
    risks: true,
    goals: true,
    market: true,
    soundEnabled: true
  });
  const [showSettings, setShowSettings] = useState(false);

  // Gerar alertas inteligentes
  const generateSmartAlerts = useMemo(() => {
    if (!portfolioMetrics || !investments) return [];

    const newAlerts = [];
    const now = new Date();

    // 🚀 ALERTAS DE PERFORMANCE
    if (alertSettings.performance) {
      // Performance excepcional
      if (portfolioMetrics.performance > 15) {
        newAlerts.push({
          id: `perf-high-${Date.now()}`,
          type: "success",
          category: "performance",
          priority: "high",
          icon: TrendingUp,
          title: "Performance Excepcional! 🚀",
          message: `Seu portfólio está ${portfolioMetrics.performance.toFixed(1)}% valorizado! Considere realizar lucros parciais.`,
          action: "Avaliar Realização",
          timestamp: now,
          autoHide: false
        });
      }

      // Performance negativa significativa
      if (portfolioMetrics.performance < -10) {
        newAlerts.push({
          id: `perf-low-${Date.now()}`,
          type: "warning",
          category: "performance",
          priority: "high",
          icon: TrendingDown,
          title: "Queda Significativa",
          message: `Portfólio com -${Math.abs(portfolioMetrics.performance).toFixed(1)}%. Oportunidade de aporte em ativos descontados.`,
          action: "Analisar Aportes",
          timestamp: now,
          autoHide: false
        });
      }
    }

    // 🎯 ALERTAS DE OPORTUNIDADES
    if (alertSettings.opportunities) {
      // Dividend yield alto
      if (portfolioMetrics.averageDY > 10) {
        newAlerts.push({
          id: `dy-high-${Date.now()}`,
          type: "info",
          category: "opportunities",
          priority: "medium",
          icon: DollarSign,
          title: "Alto Dividend Yield",
          message: `DY médio de ${portfolioMetrics.averageDY.toFixed(1)}% está acima da média. Monitore sustentabilidade.`,
          action: "Monitorar",
          timestamp: now,
          autoHide: true
        });
      }

      // Baixa diversificação
      if (portfolioMetrics.diversificationScore < 40) {
        newAlerts.push({
          id: `div-low-${Date.now()}`,
          type: "warning",
          category: "opportunities",
          priority: "medium",
          icon: Target,
          title: "Baixa Diversificação",
          message: `Score de diversificação: ${portfolioMetrics.diversificationScore}/100. Considere novos setores.`,
          action: "Diversificar",
          timestamp: now,
          autoHide: false
        });
      }
    }

    // ⚠️ ALERTAS DE RISCO
    if (alertSettings.risks) {
      // Alta concentração
      if (portfolioMetrics.concentrationRisk > 40) {
        newAlerts.push({
          id: `conc-high-${Date.now()}`,
          type: "error",
          category: "risks",
          priority: "high",
          icon: AlertTriangle,
          title: "Alta Concentração de Risco",
          message: `${portfolioMetrics.concentrationRisk.toFixed(1)}% do portfólio em um único setor. Risco elevado!`,
          action: "Rebalancear",
          timestamp: now,
          autoHide: false
        });
      }

      // Análise de FIIs individuais
      investments.forEach(inv => {
        const weight = (inv.current_value / portfolioMetrics.totalValue) * 100;
        if (weight > 25) {
          newAlerts.push({
            id: `fii-conc-${inv.ticker}-${Date.now()}`,
            type: "warning",
            category: "risks",
            priority: "medium",
            icon: Shield,
            title: `Concentração em ${inv.ticker}`,
            message: `${weight.toFixed(1)}% do portfólio em um único FII. Considere reduzir exposição.`,
            action: "Rebalancear",
            timestamp: now,
            autoHide: false
          });
        }
      });
    }

    // 🏆 ALERTAS DE METAS
    if (alertSettings.goals) {
      const monthlyIncome = portfolioMetrics.totalMonthlyIncome || 0;
      
      // Metas atingidas
      const goals = [
        { value: 500, label: "Primeira Meta" },
        { value: 1000, label: "Independência Básica" },
        { value: 2000, label: "Conforto Financeiro" },
        { value: 5000, label: "Liberdade Total" }
      ];

      goals.forEach(goal => {
        if (monthlyIncome >= goal.value && monthlyIncome < goal.value * 1.1) {
          newAlerts.push({
            id: `goal-${goal.value}-${Date.now()}`,
            type: "success",
            category: "goals",
            priority: "high",
            icon: Star,
            title: `🎉 ${goal.label} Atingida!`,
            message: `Parabéns! Você atingiu R$ ${goal.value}/mês de renda passiva!`,
            action: "Celebrar",
            timestamp: now,
            autoHide: false
          });
        }
      });

      // Próximo da meta
      goals.forEach(goal => {
        const progress = (monthlyIncome / goal.value) * 100;
        if (progress >= 80 && progress < 100) {
          newAlerts.push({
            id: `goal-near-${goal.value}-${Date.now()}`,
            type: "info",
            category: "goals",
            priority: "medium",
            icon: Target,
            title: `Próximo da Meta: ${goal.label}`,
            message: `Faltam apenas R$ ${(goal.value - monthlyIncome).toFixed(2)} para atingir R$ ${goal.value}/mês!`,
            action: "Acelerar",
            timestamp: now,
            autoHide: true
          });
        }
      });
    }

    // 📈 ALERTAS DE MERCADO
    if (alertSettings.market && marketData) {
      // Comparação com IFIX
      const vsIfix = portfolioMetrics.performance - (marketData.ifix?.performance || 8.5);
      if (Math.abs(vsIfix) > 5) {
        newAlerts.push({
          id: `market-ifix-${Date.now()}`,
          type: vsIfix > 0 ? "success" : "info",
          category: "market",
          priority: "low",
          icon: BarChart3,
          title: vsIfix > 0 ? "Superando o IFIX!" : "Abaixo do IFIX",
          message: `Seu portfólio está ${vsIfix > 0 ? '+' : ''}${vsIfix.toFixed(1)}% vs IFIX.`,
          action: "Analisar",
          timestamp: now,
          autoHide: true
        });
      }

      // Selic vs DY
      const selic = marketData.selic || 11.75;
      if (portfolioMetrics.averageDY < selic) {
        newAlerts.push({
          id: `selic-dy-${Date.now()}`,
          type: "warning",
          category: "market",
          priority: "medium",
          icon: TrendingDown,
          title: "DY Abaixo da Selic",
          message: `Seu DY (${portfolioMetrics.averageDY.toFixed(1)}%) está abaixo da Selic (${selic}%).`,
          action: "Revisar Estratégia",
          timestamp: now,
          autoHide: false
        });
      }
    }

    return newAlerts.filter(alert => !dismissedAlerts.has(alert.id));
  }, [portfolioMetrics, investments, marketData, alertSettings, dismissedAlerts]);

  // Atualizar alertas
  useEffect(() => {
    const newAlerts = generateSmartAlerts;
    setAlerts(newAlerts);

    // Tocar som para alertas de alta prioridade
    if (alertSettings.soundEnabled && newAlerts.some(alert => alert.priority === "high")) {
      // Aqui você pode adicionar um som de notificação
      console.log("🔔 Alerta de alta prioridade!");
    }
  }, [generateSmartAlerts, alertSettings.soundEnabled]);

  // Dispensar alerta
  const dismissAlert = (alertId) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
  };

  // Limpar alertas dispensados
  const clearDismissed = () => {
    setDismissedAlerts(new Set());
  };

  // Obter cor do alerta
  const getAlertColor = (type) => {
    switch (type) {
      case "success": return "border-green-500 bg-green-50";
      case "warning": return "border-yellow-500 bg-yellow-50";
      case "error": return "border-red-500 bg-red-50";
      case "info": return "border-blue-500 bg-blue-50";
      default: return "border-gray-500 bg-gray-50";
    }
  };

  // Obter ícone de prioridade
  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "high": return <Flame className="h-4 w-4 text-red-600" />;
      case "medium": return <Zap className="h-4 w-4 text-yellow-600" />;
      case "low": return <Eye className="h-4 w-4 text-blue-600" />;
      default: return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  // Filtrar alertas por categoria
  const alertsByCategory = useMemo(() => {
    return alerts.reduce((acc, alert) => {
      if (!acc[alert.category]) acc[alert.category] = [];
      acc[alert.category].push(alert);
      return acc;
    }, {});
  }, [alerts]);

  const categoryLabels = {
    performance: "Performance",
    opportunities: "Oportunidades",
    risks: "Riscos",
    goals: "Metas",
    market: "Mercado"
  };

  const categoryIcons = {
    performance: TrendingUp,
    opportunities: Target,
    risks: AlertTriangle,
    goals: Star,
    market: BarChart3
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-gradient-to-r from-red-500 to-orange-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-6 w-6" />
              <div>
                <CardTitle className="flex items-center gap-2">
                  Sistema de Alertas Inteligentes
                  <Crown className="h-5 w-5 text-orange-600" />
                </CardTitle>
                <CardDescription>
                  Monitoramento em tempo real com IA • {alerts.length} alertas ativos
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-4 w-4" />
              </Button>
              {alertSettings.soundEnabled ? (
                <Volume2 className="h-5 w-5 text-green-600" />
              ) : (
                <VolumeX className="h-5 w-5 text-gray-400" />
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Configurações */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Configurações de Alertas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(alertSettings).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Switch
                    id={key}
                    checked={value}
                    onCheckedChange={(checked) => 
                      setAlertSettings(prev => ({ ...prev, [key]: checked }))
                    }
                  />
                  <Label htmlFor={key} className="capitalize">
                    {key === "soundEnabled" ? "Som" : categoryLabels[key] || key}
                  </Label>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" onClick={clearDismissed}>
                Restaurar Alertas
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumo de Alertas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(categoryLabels).map(([category, label]) => {
          const categoryAlerts = alertsByCategory[category] || [];
          const IconComponent = categoryIcons[category];
          const highPriorityCount = categoryAlerts.filter(a => a.priority === "high").length;
          
          return (
            <Card key={category} className={`${categoryAlerts.length > 0 ? 'border-orange-200' : 'border-gray-200'}`}>
              <CardContent className="pt-4">
                <div className="text-center">
                  <IconComponent className={`h-6 w-6 mx-auto mb-2 ${categoryAlerts.length > 0 ? 'text-orange-600' : 'text-gray-400'}`} />
                  <div className="text-2xl font-bold">
                    {categoryAlerts.length}
                  </div>
                  <div className="text-sm text-gray-600">{label}</div>
                  {highPriorityCount > 0 && (
                    <Badge variant="destructive" className="mt-1">
                      {highPriorityCount} urgente{highPriorityCount > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Lista de Alertas */}
      {alerts.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-green-600" />
            <h3 className="text-lg font-semibold text-green-600 mb-2">Tudo Sob Controle! ✅</h3>
            <p className="text-gray-600">
              Nenhum alerta ativo. Seu portfólio está funcionando perfeitamente.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(alertsByCategory).map(([category, categoryAlerts]) => (
            <Card key={category}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  {React.createElement(categoryIcons[category], { className: "h-5 w-5" })}
                  {categoryLabels[category]}
                  <Badge variant="outline">{categoryAlerts.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categoryAlerts
                    .sort((a, b) => {
                      const priorityOrder = { high: 3, medium: 2, low: 1 };
                      return priorityOrder[b.priority] - priorityOrder[a.priority];
                    })
                    .map((alert) => {
                      const IconComponent = alert.icon;
                      return (
                        <Alert key={alert.id} className={`${getAlertColor(alert.type)} border-l-4`}>
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <IconComponent className="h-5 w-5 mt-0.5" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold">{alert.title}</span>
                                  {getPriorityIcon(alert.priority)}
                                  <Badge variant="outline" size="sm">
                                    {alert.priority}
                                  </Badge>
                                </div>
                                <AlertDescription className="text-sm mb-2">
                                  {alert.message}
                                </AlertDescription>
                                <div className="flex items-center gap-2">
                                  <Button variant="outline" size="sm">
                                    {alert.action}
                                  </Button>
                                  <span className="text-xs text-gray-500">
                                    <Clock className="h-3 w-3 inline mr-1" />
                                    {alert.timestamp.toLocaleTimeString('pt-BR', { 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => dismissAlert(alert.id)}
                              className="ml-2"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </Alert>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Estatísticas dos Alertas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Estatísticas de Monitoramento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {alerts.filter(a => a.priority === "high").length}
              </div>
              <div className="text-sm text-red-600">Alertas Urgentes</div>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {alerts.filter(a => a.priority === "medium").length}
              </div>
              <div className="text-sm text-yellow-600">Alertas Moderados</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {dismissedAlerts.size}
              </div>
              <div className="text-sm text-blue-600">Alertas Dispensados</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartAlerts; 
import React, { useState, useEffect, useMemo } from "react";
import {
  FileText,
  Download,
  Mail,
  Share2,
  Calendar,
  Clock,
  Crown,
  Star,
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Target,
  Zap,
  Eye,
  Settings,
  Printer,
  Save,
  Send,
  FileImage,
  FileSpreadsheet,
  Globe,
  Building,
  DollarSign,
  Activity
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
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";

const ProfessionalReports = ({ portfolioMetrics, investments, marketData }) => {
  const [reportConfig, setReportConfig] = useState({
    type: "complete",
    period: "monthly",
    format: "pdf",
    includeCharts: true,
    includeAnalysis: true,
    includeRecommendations: true,
    includeRiskAssessment: true,
    includeProjections: true,
    language: "pt-BR",
    template: "executive"
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReports, setGeneratedReports] = useState([]);
  const [reportPreview, setReportPreview] = useState(null);

  // Tipos de relatório disponíveis
  const reportTypes = {
    complete: {
      name: "Relatório Completo",
      description: "Análise completa do portfólio com todos os módulos",
      pages: "15-25 páginas",
      sections: ["Resumo Executivo", "Performance", "Análise de Risco", "Recomendações", "Projeções"]
    },
    executive: {
      name: "Resumo Executivo",
      description: "Relatório conciso para tomada de decisão",
      pages: "5-8 páginas",
      sections: ["KPIs Principais", "Performance", "Alertas", "Próximos Passos"]
    },
    performance: {
      name: "Análise de Performance",
      description: "Foco na performance e comparação com benchmarks",
      pages: "8-12 páginas",
      sections: ["Retornos", "Benchmarks", "Atribuição", "Rankings"]
    },
    risk: {
      name: "Relatório de Risco",
      description: "Análise detalhada de riscos e exposições",
      pages: "10-15 páginas",
      sections: ["VaR", "Stress Tests", "Correlações", "Concentração"]
    },
    monthly: {
      name: "Relatório Mensal",
      description: "Acompanhamento mensal padronizado",
      pages: "6-10 páginas",
      sections: ["Resumo do Mês", "Performance", "Mudanças", "Outlook"]
    }
  };

  // Templates disponíveis
  const templates = {
    executive: {
      name: "Executivo",
      description: "Design profissional para C-Level",
      style: "Formal, gráficos limpos, cores corporativas"
    },
    modern: {
      name: "Moderno",
      description: "Design contemporâneo com visualizações avançadas",
      style: "Visual, interativo, cores vibrantes"
    },
    classic: {
      name: "Clássico",
      description: "Layout tradicional e conservador",
      style: "Tradicional, tabelas, preto e branco"
    },
    investor: {
      name: "Investidor",
      description: "Focado em métricas e performance",
      style: "Dados intensivos, benchmarks, comparações"
    }
  };

  // Gerar dados para o relatório
  const generateReportData = useMemo(() => {
    if (!investments || !portfolioMetrics) return null;

    // Calcular métricas principais
    const totalInvested = investments.reduce((sum, inv) => sum + (inv.quantity * inv.average_price), 0);
    const currentValue = investments.reduce((sum, inv) => sum + (inv.quantity * inv.current_price), 0);
    const totalReturn = ((currentValue - totalInvested) / totalInvested) * 100;
    const monthlyIncome = investments.reduce((sum, inv) => sum + (inv.dividend_yield_monthly || 0), 0);

    // Performance por setor
    const sectorPerformance = investments.reduce((acc, inv) => {
      const sector = inv.sector || "Outros";
      if (!acc[sector]) {
        acc[sector] = { invested: 0, current: 0, count: 0 };
      }
      acc[sector].invested += inv.quantity * inv.average_price;
      acc[sector].current += inv.quantity * inv.current_price;
      acc[sector].count += 1;
      return acc;
    }, {});

    // Top performers
    const topPerformers = investments
      .map(inv => ({
        ticker: inv.ticker,
        return: ((inv.current_price - inv.average_price) / inv.average_price) * 100,
        sector: inv.sector
      }))
      .sort((a, b) => b.return - a.return)
      .slice(0, 5);

    // Dados para gráficos
    const chartData = {
      sectorAllocation: Object.entries(sectorPerformance).map(([sector, data]) => ({
        name: sector,
        value: data.current,
        percentage: (data.current / currentValue) * 100
      })),
      performance: topPerformers,
      monthlyEvolution: Array.from({ length: 12 }, (_, i) => ({
        month: new Date(2024, i, 1).toLocaleDateString('pt-BR', { month: 'short' }),
        portfolio: totalReturn + (Math.random() - 0.5) * 5,
        ifix: 8.5 + (Math.random() - 0.5) * 3,
        cdi: 11.75 + (Math.random() - 0.5) * 1
      }))
    };

    return {
      summary: {
        totalInvested,
        currentValue,
        totalReturn,
        monthlyIncome,
        fiiCount: investments.length,
        diversificationScore: Math.min(100, (Object.keys(sectorPerformance).length / 6) * 100)
      },
      sectors: sectorPerformance,
      topPerformers,
      charts: chartData,
      generatedAt: new Date(),
      period: "Janeiro 2024"
    };
  }, [investments, portfolioMetrics]);

  // Gerar relatório
  const generateReport = async () => {
    setIsGenerating(true);

    // Simular tempo de geração
    await new Promise(resolve => setTimeout(resolve, 3000));

    const reportData = generateReportData;
    const reportId = `RPT-${Date.now()}`;
    
    const newReport = {
      id: reportId,
      type: reportConfig.type,
      format: reportConfig.format,
      template: reportConfig.template,
      generatedAt: new Date(),
      data: reportData,
      fileName: `Portfolio_Report_${reportData.period.replace(' ', '_')}.${reportConfig.format}`,
      size: "2.4 MB",
      pages: reportTypes[reportConfig.type].pages,
      status: "completed"
    };

    setGeneratedReports(prev => [newReport, ...prev]);
    setReportPreview(newReport);
    setIsGenerating(false);
  };

  // Cores para gráficos
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  if (!generateReportData) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Dados insuficientes para gerar relatórios</p>
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
            <FileText className="h-6 w-6" />
            Professional Report Generator
            <Crown className="h-5 w-5 text-purple-600" />
            <Badge variant="outline" className="border-purple-500 text-purple-700">
              <Star className="h-3 w-3 mr-1" />
              Premium
            </Badge>
          </CardTitle>
          <CardDescription>
            Geração de relatórios profissionais em PDF com análises avançadas
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Configuração do Relatório */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuração do Relatório
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Tipo de Relatório */}
            <div>
              <label className="text-sm font-medium mb-3 block">Tipo de Relatório</label>
              <div className="space-y-2">
                {Object.entries(reportTypes).map(([key, type]) => (
                  <div
                    key={key}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      reportConfig.type === key 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setReportConfig(prev => ({ ...prev, type: key }))}
                  >
                    <div className="font-medium mb-1">{type.name}</div>
                    <div className="text-xs text-gray-600 mb-1">{type.description}</div>
                    <div className="text-xs text-blue-600">{type.pages}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Template */}
            <div>
              <label className="text-sm font-medium mb-3 block">Template</label>
              <div className="space-y-2">
                {Object.entries(templates).map(([key, template]) => (
                  <div
                    key={key}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      reportConfig.template === key 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setReportConfig(prev => ({ ...prev, template: key }))}
                  >
                    <div className="font-medium mb-1">{template.name}</div>
                    <div className="text-xs text-gray-600 mb-1">{template.description}</div>
                    <div className="text-xs text-purple-600">{template.style}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Opções */}
            <div>
              <label className="text-sm font-medium mb-3 block">Opções</label>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Formato</span>
                  <div className="flex gap-2">
                    {["pdf", "docx", "xlsx"].map(format => (
                      <Button
                        key={format}
                        variant={reportConfig.format === format ? "default" : "outline"}
                        size="sm"
                        onClick={() => setReportConfig(prev => ({ ...prev, format }))}
                      >
                        {format.toUpperCase()}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Período</span>
                  <div className="flex gap-2">
                    {["monthly", "quarterly", "annual"].map(period => (
                      <Button
                        key={period}
                        variant={reportConfig.period === period ? "default" : "outline"}
                        size="sm"
                        onClick={() => setReportConfig(prev => ({ ...prev, period }))}
                      >
                        {period === "monthly" ? "Mensal" : 
                         period === "quarterly" ? "Trimestral" : "Anual"}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  {[
                    { key: "includeCharts", label: "Incluir Gráficos" },
                    { key: "includeAnalysis", label: "Incluir Análise IA" },
                    { key: "includeRecommendations", label: "Incluir Recomendações" },
                    { key: "includeRiskAssessment", label: "Incluir Avaliação de Risco" },
                    { key: "includeProjections", label: "Incluir Projeções" }
                  ].map(option => (
                    <div key={option.key} className="flex items-center justify-between">
                      <span className="text-sm">{option.label}</span>
                      <input
                        type="checkbox"
                        checked={reportConfig[option.key]}
                        onChange={(e) => setReportConfig(prev => ({ 
                          ...prev, 
                          [option.key]: e.target.checked 
                        }))}
                        className="rounded"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-4">
            <Button 
              onClick={generateReport} 
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Gerando...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  Gerar Relatório
                </>
              )}
            </Button>
            
            <Button variant="outline" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Visualizar Preview
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview do Relatório */}
      {reportPreview && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Preview do Relatório
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white border rounded-lg p-6 space-y-6">
              {/* Cabeçalho do Relatório */}
              <div className="border-b pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold">Relatório de Investimentos FII</h1>
                    <p className="text-gray-600">{reportPreview.data.period}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Gerado em</div>
                    <div className="font-medium">
                      {reportPreview.generatedAt.toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Resumo Executivo */}
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Resumo Executivo
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      R$ {reportPreview.data.summary.currentValue.toLocaleString('pt-BR')}
                    </div>
                    <div className="text-sm text-blue-600">Valor Atual</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {reportPreview.data.summary.totalReturn.toFixed(1)}%
                    </div>
                    <div className="text-sm text-green-600">Retorno Total</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      R$ {reportPreview.data.summary.monthlyIncome.toFixed(2)}
                    </div>
                    <div className="text-sm text-purple-600">Renda Mensal</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {reportPreview.data.summary.fiiCount}
                    </div>
                    <div className="text-sm text-orange-600">FIIs</div>
                  </div>
                </div>
              </div>

              {/* Gráficos */}
              {reportConfig.includeCharts && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Alocação por Setor */}
                  <div>
                    <h3 className="font-semibold mb-3">Alocação por Setor</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <RechartsPieChart>
                        <Pie
                          data={reportPreview.data.charts.sectorAllocation}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                        >
                          {reportPreview.data.charts.sectorAllocation.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Performance vs Benchmarks */}
                  <div>
                    <h3 className="font-semibold mb-3">Performance vs Benchmarks</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={reportPreview.data.charts.monthlyEvolution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                        <Legend />
                        <Line type="monotone" dataKey="portfolio" stroke="#8884d8" name="Portfólio" />
                        <Line type="monotone" dataKey="ifix" stroke="#82ca9d" name="IFIX" />
                        <Line type="monotone" dataKey="cdi" stroke="#ffc658" name="CDI" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Top Performers */}
              <div>
                <h3 className="font-semibold mb-3">Top Performers</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">FII</th>
                        <th className="text-left p-2">Setor</th>
                        <th className="text-right p-2">Retorno</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportPreview.data.topPerformers.map((performer, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2 font-medium">{performer.ticker}</td>
                          <td className="p-2">{performer.sector}</td>
                          <td className={`p-2 text-right font-medium ${
                            performer.return > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {performer.return > 0 ? '+' : ''}{performer.return.toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recomendações */}
              {reportConfig.includeRecommendations && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Recomendações
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="font-medium text-green-800">Manter Diversificação</div>
                      <div className="text-sm text-green-700">
                        Portfólio bem diversificado com score de {reportPreview.data.summary.diversificationScore.toFixed(0)}%. 
                        Manter distribuição atual entre setores.
                      </div>
                    </div>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="font-medium text-blue-800">Oportunidade de Crescimento</div>
                      <div className="text-sm text-blue-700">
                        Considerar aumentar posição em FIIs de logística devido ao crescimento do e-commerce.
                      </div>
                    </div>
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="font-medium text-yellow-800">Monitorar Concentração</div>
                      <div className="text-sm text-yellow-700">
                        Acompanhar exposição aos top performers para evitar concentração excessiva.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Relatórios Gerados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Relatórios Gerados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {generatedReports.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">Nenhum relatório gerado ainda</p>
              <p className="text-sm text-gray-500">Configure e gere seu primeiro relatório acima</p>
            </div>
          ) : (
            <div className="space-y-4">
              {generatedReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">{report.fileName}</div>
                      <div className="text-sm text-gray-600">
                        {reportTypes[report.type].name} • {report.size} • {report.pages}
                      </div>
                      <div className="text-xs text-gray-500">
                        Gerado em {report.generatedAt.toLocaleDateString('pt-BR')} às {report.generatedAt.toLocaleTimeString('pt-BR')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      {report.status === "completed" ? "Concluído" : "Processando"}
                    </Badge>
                    
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        Download
                      </Button>
                      <Button size="sm" variant="outline" className="flex items-center gap-1">
                        <Share2 className="h-3 w-3" />
                        Compartilhar
                      </Button>
                      <Button size="sm" variant="outline" className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        Enviar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Templates Personalizados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Templates Personalizados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg text-center">
              <div className="p-3 bg-purple-100 rounded-lg w-fit mx-auto mb-3">
                <Building className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="font-semibold mb-2">Template Corporativo</h4>
              <p className="text-sm text-gray-600 mb-3">
                Design profissional com logo da empresa e cores personalizadas
              </p>
              <Button variant="outline" size="sm">Personalizar</Button>
            </div>

            <div className="p-4 border rounded-lg text-center">
              <div className="p-3 bg-green-100 rounded-lg w-fit mx-auto mb-3">
                <BarChart3 className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="font-semibold mb-2">Template Analítico</h4>
              <p className="text-sm text-gray-600 mb-3">
                Foco em dados e métricas com gráficos avançados
              </p>
              <Button variant="outline" size="sm">Personalizar</Button>
            </div>

            <div className="p-4 border rounded-lg text-center">
              <div className="p-3 bg-blue-100 rounded-lg w-fit mx-auto mb-3">
                <Globe className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="font-semibold mb-2">Template Internacional</h4>
              <p className="text-sm text-gray-600 mb-3">
                Suporte a múltiplos idiomas e moedas
              </p>
              <Button variant="outline" size="sm">Personalizar</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfessionalReports; 
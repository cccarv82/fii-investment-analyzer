import React, { useState, useEffect, useMemo } from "react";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Newspaper,
  MessageSquare,
  BarChart3,
  Zap,
  Crown,
  Star,
  AlertTriangle,
  Eye,
  Clock,
  Globe,
  Activity,
  Flame,
  Target,
  ThumbsUp,
  ThumbsDown,
  Meh
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";

const MarketSentimentEngine = ({ portfolioMetrics, investments, marketData }) => {
  const [sentimentData, setSentimentData] = useState(null);
  const [newsAnalysis, setNewsAnalysis] = useState([]);
  const [socialSentiment, setSocialSentiment] = useState({});
  const [selectedTimeframe, setSelectedTimeframe] = useState("24h");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sentimentHistory, setSentimentHistory] = useState([]);

  // Simular análise de sentimento em tempo real
  useEffect(() => {
    const generateSentimentData = () => {
      const now = new Date();
      const timeframes = {
        "1h": 1,
        "24h": 24,
        "7d": 168,
        "30d": 720
      };

      const hours = timeframes[selectedTimeframe];
      const data = [];

      for (let i = hours; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000);
        const baseScore = 65 + Math.sin(i / 10) * 15;
        const noise = (Math.random() - 0.5) * 20;
        const score = Math.max(0, Math.min(100, baseScore + noise));

        data.push({
          time: time.toISOString(),
          sentiment: score,
          bullish: Math.max(0, score - 50),
          bearish: Math.max(0, 50 - score),
          neutral: 100 - Math.abs(score - 50) * 2,
          volume: Math.random() * 1000 + 500
        });
      }

      setSentimentHistory(data);

      // Análise geral do mercado
      const overallSentiment = {
        score: data[data.length - 1]?.sentiment || 50,
        trend: data.length > 1 ? 
          (data[data.length - 1].sentiment > data[data.length - 2].sentiment ? "up" : "down") : "neutral",
        confidence: 85 + Math.random() * 10,
        sources: {
          news: 45 + Math.random() * 20,
          social: 35 + Math.random() * 30,
          technical: 55 + Math.random() * 25,
          institutional: 60 + Math.random() * 20
        },
        keywords: [
          { word: "FIIs", sentiment: 72, mentions: 1250 },
          { word: "Selic", sentiment: 45, mentions: 890 },
          { word: "Inflação", sentiment: 35, mentions: 670 },
          { word: "Logística", sentiment: 78, mentions: 540 },
          { word: "Shopping", sentiment: 62, mentions: 420 },
          { word: "Lajes", sentiment: 68, mentions: 380 }
        ]
      };

      setSentimentData(overallSentiment);
    };

    generateSentimentData();
    const interval = setInterval(generateSentimentData, 30000); // Atualizar a cada 30s

    return () => clearInterval(interval);
  }, [selectedTimeframe]);

  // Gerar análise de notícias simulada
  useEffect(() => {
    const generateNewsAnalysis = () => {
      const news = [
        {
          id: 1,
          title: "FIIs de Logística Apresentam Forte Performance no Trimestre",
          source: "InfoMoney",
          sentiment: 85,
          impact: "high",
          time: "2h atrás",
          summary: "Setor de logística continua aquecido com crescimento do e-commerce",
          relevantTickers: ["XPLG11", "HGLG11", "VILG11"],
          category: "performance"
        },
        {
          id: 2,
          title: "Banco Central Mantém Selic em 11,75% - Impacto nos FIIs",
          source: "Valor Econômico",
          sentiment: 60,
          impact: "medium",
          time: "4h atrás",
          summary: "Decisão do Copom mantém atratividade dos FIIs frente à renda fixa",
          relevantTickers: ["HGRE11", "BCFF11", "XPML11"],
          category: "monetary"
        },
        {
          id: 3,
          title: "Shopping Centers Mostram Sinais de Recuperação Pós-Pandemia",
          source: "Exame",
          sentiment: 75,
          impact: "medium",
          time: "6h atrás",
          summary: "Ocupação e vendas em shoppings voltam aos patamares pré-2020",
          relevantTickers: ["HGBS11", "MALL11", "JSRE11"],
          category: "sector"
        },
        {
          id: 4,
          title: "Inflação Desacelera: Boas Notícias para o Mercado Imobiliário",
          source: "CNN Brasil",
          sentiment: 70,
          impact: "high",
          time: "8h atrás",
          summary: "IPCA de 4,2% alivia pressões sobre o setor imobiliário",
          relevantTickers: ["HGRE11", "BCFF11", "XPML11"],
          category: "economic"
        },
        {
          id: 5,
          title: "Fundos de Papel Enfrentam Volatilidade com Alta dos Juros",
          source: "Money Times",
          sentiment: 40,
          impact: "medium",
          time: "12h atrás",
          summary: "FIIs de papel sofrem com cenário de juros elevados",
          relevantTickers: ["KNCR11", "RNGO11", "FIIB11"],
          category: "risk"
        }
      ];

      setNewsAnalysis(news);
    };

    generateNewsAnalysis();
  }, []);

  // Análise de sentimento por setor
  const sectorSentiment = useMemo(() => {
    if (!investments || !sentimentData) return {};

    const sectors = {};
    
    // Simular sentimento por setor baseado em dados reais
    const sectorData = {
      "Lajes Corporativas": { sentiment: 68, trend: "up", confidence: 82 },
      "Shopping": { sentiment: 62, trend: "up", confidence: 75 },
      "Logística": { sentiment: 78, trend: "up", confidence: 88 },
      "Residencial": { sentiment: 65, trend: "stable", confidence: 70 },
      "Híbrido": { sentiment: 70, trend: "up", confidence: 80 },
      "Papel": { sentiment: 45, trend: "down", confidence: 65 },
      "Agro": { sentiment: 72, trend: "up", confidence: 78 },
      "Educação": { sentiment: 58, trend: "stable", confidence: 72 }
    };

    return sectorData;
  }, [investments, sentimentData]);

  // Obter cor do sentimento
  const getSentimentColor = (score) => {
    if (score >= 70) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 50) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  // Obter ícone do sentimento
  const getSentimentIcon = (score) => {
    if (score >= 70) return <ThumbsUp className="h-4 w-4" />;
    if (score >= 50) return <Meh className="h-4 w-4" />;
    return <ThumbsDown className="h-4 w-4" />;
  };

  // Obter cor do impacto
  const getImpactColor = (impact) => {
    switch (impact) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (!sentimentData) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400 animate-pulse" />
          <p className="text-gray-600">Analisando sentimento do mercado...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-gradient-to-r from-purple-500 to-pink-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6" />
            Market Sentiment Analysis Engine
            <Crown className="h-5 w-5 text-purple-600" />
            <Badge variant="outline" className="border-purple-500 text-purple-700">
              <Activity className="h-3 w-3 mr-1" />
              Tempo Real
            </Badge>
          </CardTitle>
          <CardDescription>
            Análise de sentimento em tempo real usando IA, notícias e redes sociais
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Controles de Timeframe */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium">Período de Análise:</span>
          </div>
          <div className="flex gap-2">
            {["1h", "24h", "7d", "30d"].map((timeframe) => (
              <Button
                key={timeframe}
                variant={selectedTimeframe === timeframe ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTimeframe(timeframe)}
              >
                {timeframe}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sentimento Geral */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={`border-2 ${getSentimentColor(sentimentData.score)}`}>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {getSentimentIcon(sentimentData.score)}
                <span className="font-medium">Sentimento Geral</span>
              </div>
              <div className="text-3xl font-bold mb-2">
                {sentimentData.score.toFixed(0)}%
              </div>
              <div className="text-sm opacity-75">
                {sentimentData.trend === "up" ? "↗️ Otimista" : 
                 sentimentData.trend === "down" ? "↘️ Pessimista" : "➡️ Neutro"}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Target className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {sentimentData.confidence.toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600">Confiança</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Newspaper className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-green-600 mb-2">
                {newsAnalysis.length}
              </div>
              <div className="text-sm text-gray-600">Notícias Analisadas</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <MessageSquare className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {sentimentData.keywords.reduce((sum, k) => sum + k.mentions, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Menções Sociais</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Sentimento Histórico */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Evolução do Sentimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={sentimentHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="time" 
                tickFormatter={(time) => new Date(time).toLocaleTimeString('pt-BR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              />
              <YAxis domain={[0, 100]} />
              <Tooltip 
                labelFormatter={(time) => new Date(time).toLocaleString('pt-BR')}
                formatter={(value, name) => [`${value.toFixed(1)}%`, name]}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="sentiment" 
                stroke="#8884d8" 
                fill="#8884d8" 
                fillOpacity={0.6}
                name="Sentimento Geral"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Análise por Fontes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Análise por Fontes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(sentimentData.sources).map(([source, score]) => (
              <div key={source} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold mb-2">
                  {score.toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600 capitalize">{source}</div>
                <Progress value={score} className="h-2 mt-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sentimento por Setor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Sentimento por Setor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(sectorSentiment).map(([sector, data]) => (
              <div key={sector} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{sector}</span>
                  <Badge variant="outline" className={getSentimentColor(data.sentiment)}>
                    {data.sentiment.toFixed(0)}%
                  </Badge>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Tendência</div>
                    <div className="font-medium">
                      {data.trend === "up" ? "📈 Alta" : 
                       data.trend === "down" ? "📉 Baixa" : "➡️ Estável"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Confiança</div>
                    <div className="font-medium">{data.confidence}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Análise de Notícias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="h-5 w-5" />
            Análise de Notícias Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {newsAnalysis.map((news) => (
              <div key={news.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 mb-1">{news.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{news.summary}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{news.source}</span>
                      <span>•</span>
                      <span>{news.time}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 ml-4">
                    <Badge variant="outline" className={getSentimentColor(news.sentiment)}>
                      {getSentimentIcon(news.sentiment)}
                      {news.sentiment}%
                    </Badge>
                    <Badge className={getImpactColor(news.impact)}>
                      {news.impact}
                    </Badge>
                  </div>
                </div>
                
                {news.relevantTickers.length > 0 && (
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-xs text-gray-600">FIIs Relacionados:</span>
                    <div className="flex gap-1">
                      {news.relevantTickers.map((ticker) => (
                        <Badge key={ticker} variant="secondary" className="text-xs">
                          {ticker}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Palavras-chave Trending */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5" />
            Palavras-chave em Alta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {sentimentData.keywords.map((keyword, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{keyword.word}</span>
                  <Badge variant="outline" className={getSentimentColor(keyword.sentiment)}>
                    {keyword.sentiment}%
                  </Badge>
                </div>
                <div className="text-sm text-gray-600">
                  {keyword.mentions.toLocaleString()} menções
                </div>
                <Progress value={(keyword.mentions / 1500) * 100} className="h-1 mt-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights e Recomendações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Insights de Sentimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sentimentData.score > 70 && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 text-green-800 mb-2">
                  <ThumbsUp className="h-4 w-4" />
                  <span className="font-medium">Sentimento Muito Positivo</span>
                </div>
                <p className="text-sm text-green-700">
                  O mercado está otimista! Momento favorável para considerar novos investimentos.
                </p>
              </div>
            )}

            {sentimentData.score < 40 && (
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 text-red-800 mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Sentimento Negativo</span>
                </div>
                <p className="text-sm text-red-700">
                  Cautela recomendada. Considere aguardar melhora no sentimento antes de novos aportes.
                </p>
              </div>
            )}

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 text-blue-800 mb-2">
                <Star className="h-4 w-4" />
                <span className="font-medium">Setores em Destaque</span>
              </div>
              <p className="text-sm text-blue-700">
                Logística e Lajes Corporativas apresentam sentimento mais positivo nas últimas 24h.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketSentimentEngine; 
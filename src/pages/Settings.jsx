import React, { useState, useEffect } from "react";
import {
  Brain,
  Key,
  Shield,
  Zap,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  ExternalLink,
  Info,
  Trash2,
  Save,
  RefreshCw,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { useAI } from "../contexts/AIContext";

const Settings = () => {
  const {
    apiKey,
    isConfigured,
    loading,
    error,
    configureApiKey,
    removeApiKey,
    clearError,
  } = useAI();

  const [newApiKey, setNewApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [showNewApiKey, setShowNewApiKey] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Limpar mensagens após 3 segundos
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Validar formato da API key
  const isValidApiKey = (key) => {
    return key && key.startsWith("sk-") && key.length >= 20;
  };

  const handleConfigureApiKey = async (e) => {
    e.preventDefault();

    if (!newApiKey.trim()) {
      return;
    }

    if (!isValidApiKey(newApiKey.trim())) {
      setSuccessMessage("");
      return;
    }

    setIsSaving(true);
    clearError();

    try {
      const success = await configureApiKey(newApiKey.trim());
      if (success) {
        setNewApiKey("");
        setShowNewApiKey(false);
        setSuccessMessage("API Key configurada com sucesso!");
      }
    } catch (err) {
      console.error("Erro ao configurar API key:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveApiKey = async () => {
    const confirmed = window.confirm(
      "Tem certeza que deseja remover a API key?\n\nAs análises com IA serão desabilitadas e você voltará ao modo demo."
    );

    if (!confirmed) return;

    setIsRemoving(true);
    clearError();

    try {
      const success = await removeApiKey();
      if (success) {
        setSuccessMessage("API Key removida com sucesso!");
        setShowApiKey(false);
      }
    } catch (err) {
      console.error("Erro ao remover API key:", err);
    } finally {
      setIsRemoving(false);
    }
  };

  const handleClearForm = () => {
    setNewApiKey("");
    setShowNewApiKey(false);
    clearError();
    setSuccessMessage("");
  };

  // Mascarar API key para exibição
  const getMaskedApiKey = () => {
    if (!apiKey || apiKey.length < 8) return "";
    return `${apiKey.substring(0, 7)}${"•".repeat(20)}${apiKey.substring(
      apiKey.length - 4
    )}`;
  };

  const maskedApiKey = getMaskedApiKey();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Configure a integração com IA e outras preferências
        </p>
      </div>

      {/* Mensagem de Sucesso */}
      {successMessage && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Erro */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            {error}
            <Button variant="ghost" size="sm" onClick={clearError}>
              Fechar
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs defaultValue="ai">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ai">Integração IA</TabsTrigger>
          <TabsTrigger value="preferences">Preferências</TabsTrigger>
          <TabsTrigger value="about">Sobre</TabsTrigger>
        </TabsList>

        {/* Integração IA */}
        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Análise Fundamentalista com IA
              </CardTitle>
              <CardDescription>
                Configure a integração com OpenAI para análises fundamentalistas
                avançadas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status da Configuração */}
              <div
                className={`flex items-center gap-3 p-4 border rounded-lg ${
                  isConfigured
                    ? "border-green-200 bg-green-50"
                    : "border-orange-200 bg-orange-50"
                }`}
              >
                {isConfigured ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div className="flex-1">
                      <p className="font-medium text-green-700">
                        IA Configurada e Ativa
                      </p>
                      <p className="text-sm text-green-600">
                        Análises fundamentalistas com OpenAI habilitadas
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    <div className="flex-1">
                      <p className="font-medium text-orange-700">
                        IA Não Configurada
                      </p>
                      <p className="text-sm text-orange-600">
                        Configure sua API key para habilitar análises reais
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Configuração da API Key */}
              {isConfigured ? (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">
                      API Key Configurada
                    </Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        type={showApiKey ? "text" : "password"}
                        value={showApiKey ? apiKey : maskedApiKey}
                        readOnly
                        className="flex-1 bg-gray-50"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="px-3"
                      >
                        {showApiKey ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      API key armazenada com segurança no seu navegador
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      onClick={handleRemoveApiKey}
                      disabled={isRemoving}
                      className="flex items-center gap-2"
                    >
                      {isRemoving ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      {isRemoving ? "Removendo..." : "Remover API Key"}
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleConfigureApiKey} className="space-y-4">
                  <div>
                    <Label htmlFor="api-key" className="text-sm font-medium">
                      API Key da OpenAI
                    </Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        id="api-key"
                        type={showNewApiKey ? "text" : "password"}
                        value={newApiKey}
                        onChange={(e) => setNewApiKey(e.target.value)}
                        placeholder="sk-proj-..."
                        className="flex-1"
                        autoComplete="off"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowNewApiKey(!showNewApiKey)}
                        className="px-3"
                      >
                        {showNewApiKey ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {/* Validação visual */}
                    {newApiKey && (
                      <div className="mt-1">
                        {isValidApiKey(newApiKey) ? (
                          <p className="text-xs text-green-600 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Formato válido
                          </p>
                        ) : (
                          <p className="text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Deve começar com 'sk-' e ter pelo menos 20
                            caracteres
                          </p>
                        )}
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground mt-1">
                      Sua API key é armazenada localmente e nunca enviada para
                      nossos servidores
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={!isValidApiKey(newApiKey) || isSaving}
                      className="flex items-center gap-2"
                    >
                      {isSaving ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      {isSaving ? "Configurando..." : "Configurar IA"}
                    </Button>

                    {newApiKey && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleClearForm}
                      >
                        Limpar
                      </Button>
                    )}
                  </div>
                </form>
              )}

              {/* Informações sobre a IA */}
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">
                      Como funciona a análise com IA:
                    </p>
                    <ul className="text-sm space-y-1 ml-4">
                      <li>• Análise fundamentalista detalhada de cada FII</li>
                      <li>
                        • Recomendações personalizadas baseadas no seu perfil
                      </li>
                      <li>• Justificativas técnicas para cada sugestão</li>
                      <li>• Análise de mercado e tendências setoriais</li>
                      <li>
                        • Estratégias baseadas em Warren Buffett e Ray Dalio
                      </li>
                    </ul>
                    <div className="flex items-center gap-2 mt-3">
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href="https://platform.openai.com/api-keys"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1"
                        >
                          Obter API Key
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Recursos da IA */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Recursos Disponíveis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <Brain className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Análise Fundamentalista</h4>
                    <p className="text-sm text-muted-foreground">
                      Avaliação detalhada de P/VP, DY, qualidade dos ativos e
                      gestão
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Análise de Risco</h4>
                    <p className="text-sm text-muted-foreground">
                      Avaliação de volatilidade, correlação e diversificação
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <Zap className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">
                      Recomendações Personalizadas
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Sugestões baseadas no seu perfil de risco e objetivos
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <Key className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Análise Setorial</h4>
                    <p className="text-sm text-muted-foreground">
                      Tendências e oportunidades por setor imobiliário
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferências */}
        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Preferências Gerais</CardTitle>
              <CardDescription>
                Configure suas preferências de uso da aplicação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Funcionalidades de preferências serão implementadas em versões
                futuras.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sobre */}
        <TabsContent value="about" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sobre o FII Investment Analyzer</CardTitle>
              <CardDescription>
                Informações sobre a aplicação e tecnologias utilizadas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Tecnologias</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• React 18.3.1 + Vite</li>
                  <li>• Tailwind CSS + Shadcn/UI</li>
                  <li>• OpenAI GPT-4 para análises</li>
                  <li>• BRAPI para dados da B3</li>
                  <li>• IndexedDB para persistência local</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">Funcionalidades</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Análise fundamentalista com IA</li>
                  <li>• Gestão completa de carteira</li>
                  <li>• Simulações e projeções</li>
                  <li>• Dados reais da B3</li>
                  <li>• Interface responsiva</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;

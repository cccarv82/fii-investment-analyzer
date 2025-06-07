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
  // 🎯 Usando as funções CORRETAS do AIContext
  const { isConfigured, setApiKey, removeApiKey, getApiKey } = useAI();

  const [newApiKey, setNewApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [showNewApiKey, setShowNewApiKey] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Limpar mensagens após 3 segundos
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // Validar formato da API key
  const isValidApiKey = (key) => {
    return key && key.startsWith("sk-") && key.length >= 20;
  };

  // 🔧 Função CORRIGIDA para configurar API key
  const handleConfigureApiKey = async (e) => {
    e.preventDefault();

    if (!newApiKey.trim()) {
      setErrorMessage("Por favor, insira uma API key válida.");
      return;
    }

    if (!isValidApiKey(newApiKey.trim())) {
      setErrorMessage(
        "API key deve começar com 'sk-' e ter pelo menos 20 caracteres."
      );
      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    try {
      // 🎯 Usando setApiKey (função correta)
      setApiKey(newApiKey.trim());

      setNewApiKey("");
      setShowNewApiKey(false);
      setSuccessMessage("API Key configurada com sucesso!");
    } catch (err) {
      console.error("Erro ao configurar API key:", err);
      setErrorMessage("Erro ao configurar API key. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  // 🔧 Função CORRIGIDA para remover API key
  const handleRemoveApiKey = async () => {
    const confirmed = window.confirm(
      "Tem certeza que deseja remover a API key?\n\nAs análises com IA serão desabilitadas."
    );

    if (!confirmed) return;

    setIsRemoving(true);
    setErrorMessage("");

    try {
      // 🎯 Usando removeApiKey (função correta)
      removeApiKey();

      setSuccessMessage("API Key removida com sucesso!");
      setShowApiKey(false);
    } catch (err) {
      console.error("Erro ao remover API key:", err);
      setErrorMessage("Erro ao remover API key. Tente novamente.");
    } finally {
      setIsRemoving(false);
    }
  };

  const handleClearForm = () => {
    setNewApiKey("");
    setShowNewApiKey(false);
    setErrorMessage("");
    setSuccessMessage("");
  };

  // 🔧 Função CORRIGIDA para mascarar API key
  const getMaskedApiKey = () => {
    const apiKey = getApiKey();
    if (!apiKey || apiKey.length < 8) return "";
    return `${apiKey.substring(0, 7)}${"•".repeat(20)}${apiKey.substring(
      apiKey.length - 4
    )}`;
  };

  const maskedApiKey = getMaskedApiKey();
  const currentApiKey = getApiKey();

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

      {/* Mensagem de Erro */}
      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            {errorMessage}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setErrorMessage("")}
            >
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
                        value={showApiKey ? currentApiKey : maskedApiKey}
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
                    <div className="flex items-center gap-2 mt-2">
                      {newApiKey && (
                        <div className="flex items-center gap-1">
                          {isValidApiKey(newApiKey) ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span
                            className={`text-xs ${
                              isValidApiKey(newApiKey)
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {isValidApiKey(newApiKey)
                              ? "Formato válido"
                              : "Formato inválido"}
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Sua API key será armazenada localmente no navegador
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
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClearForm}
                    >
                      Limpar
                    </Button>
                  </div>
                </form>
              )}

              {/* Informações sobre a OpenAI */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-blue-900">
                      Como obter sua API Key da OpenAI
                    </p>
                    <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                      <li>Acesse platform.openai.com/api-keys</li>
                      <li>Faça login na sua conta OpenAI</li>
                      <li>Clique em "Create new secret key"</li>
                      <li>Copie a chave (começa com sk-)</li>
                      <li>Cole aqui e configure</li>
                    </ol>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() =>
                        window.open(
                          "https://platform.openai.com/api-keys",
                          "_blank"
                        )
                      }
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Abrir OpenAI Platform
                    </Button>
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
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Preferências Gerais
              </CardTitle>
              <CardDescription>
                Configure suas preferências de uso da aplicação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Funcionalidades de preferências serão implementadas em versões
                futuras.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sobre */}
        <TabsContent value="about" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Sobre o FII Investment Analyzer
              </CardTitle>
              <CardDescription>
                Informações sobre a aplicação e tecnologias utilizadas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium">Versão</h4>
                  <p className="text-sm text-muted-foreground">1.0.0</p>
                </div>
                <div>
                  <h4 className="font-medium">Tecnologias</h4>
                  <p className="text-sm text-muted-foreground">
                    React, Vite, Tailwind CSS, OpenAI GPT-4, BRAPI
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Funcionalidades</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Análise fundamentalista com IA</li>
                    <li>• Gestão completa de carteira</li>
                    <li>• Dados reais da B3 via BRAPI</li>
                    <li>• Simulações e projeções</li>
                    <li>• Gráficos interativos</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;

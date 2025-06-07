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
  Database,
  Server,
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
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

const Settings = () => {
  // 🔐 Auth context para usuário atual
  const { user } = useAuth();

  // 🎯 Estados para configurações
  const [settings, setSettings] = useState({
    openai_api_key: "",
    brapi_token: "",
  });
  const [newSettings, setNewSettings] = useState({
    openai_api_key: "",
    brapi_token: "",
  });

  // 🎯 Estados da interface
  const [showApiKey, setShowApiKey] = useState(false);
  const [showNewApiKey, setShowNewApiKey] = useState(false);
  const [showBrapiToken, setShowBrapiToken] = useState(false);
  const [showNewBrapiToken, setShowNewBrapiToken] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // 🔄 Carregar configurações do Supabase
  useEffect(() => {
    if (user) {
      loadUserSettings();
    }
  }, [user]);

  // 🔄 Limpar mensagens após tempo
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(""), 6000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // 📥 Carregar configurações do usuário do Supabase
  const loadUserSettings = async () => {
    try {
      setIsLoading(true);
      console.log("🔄 Carregando configurações do usuário...");

      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned (primeira vez)
        throw error;
      }

      if (data) {
        console.log("✅ Configurações carregadas:", data);
        setSettings({
          openai_api_key: data.openai_api_key || "",
          brapi_token: data.brapi_token || "",
        });
      } else {
        console.log("📝 Nenhuma configuração encontrada - primeira vez");
        setSettings({
          openai_api_key: "",
          brapi_token: "",
        });
      }
    } catch (err) {
      console.error("❌ Erro ao carregar configurações:", err);
      setErrorMessage("Erro ao carregar configurações. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  // 💾 Salvar configurações no Supabase
  const saveUserSettings = async (settingsToSave) => {
    try {
      console.log("💾 Salvando configurações no Supabase...");

      const { data, error } = await supabase
        .from("user_settings")
        .upsert(
          {
            user_id: user.id,
            ...settingsToSave,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id",
          }
        )
        .select()
        .single();

      if (error) throw error;

      console.log("✅ Configurações salvas:", data);
      return data;
    } catch (err) {
      console.error("❌ Erro ao salvar configurações:", err);
      throw err;
    }
  };

  // 🔧 Validações
  const isValidApiKey = (key) => {
    return key && key.startsWith("sk-") && key.length >= 20;
  };

  const isValidBrapiToken = (token) => {
    return token && token.length >= 10;
  };

  // 🔧 Configurar OpenAI API Key
  const handleConfigureApiKey = async (e) => {
    e.preventDefault();
    if (!newSettings.openai_api_key.trim()) {
      setErrorMessage("Por favor, insira uma API key válida.");
      return;
    }

    if (!isValidApiKey(newSettings.openai_api_key.trim())) {
      setErrorMessage(
        "API key deve começar com 'sk-' e ter pelo menos 20 caracteres."
      );
      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    try {
      const updatedSettings = {
        ...settings,
        openai_api_key: newSettings.openai_api_key.trim(),
      };

      await saveUserSettings(updatedSettings);
      setSettings(updatedSettings);
      setNewSettings({ ...newSettings, openai_api_key: "" });
      setShowNewApiKey(false);
      setSuccessMessage("✅ OpenAI API Key configurada com sucesso!");
    } catch (err) {
      console.error("Erro ao configurar API key:", err);
      setErrorMessage("Erro ao configurar API key. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  // 🔧 Configurar BRAPI Token
  const handleConfigureBrapiToken = async (e) => {
    e.preventDefault();
    if (!newSettings.brapi_token.trim()) {
      setErrorMessage("Por favor, insira um token BRAPI válido.");
      return;
    }

    if (!isValidBrapiToken(newSettings.brapi_token.trim())) {
      setErrorMessage("Token BRAPI deve ter pelo menos 10 caracteres.");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    try {
      const updatedSettings = {
        ...settings,
        brapi_token: newSettings.brapi_token.trim(),
      };

      await saveUserSettings(updatedSettings);
      setSettings(updatedSettings);
      setNewSettings({ ...newSettings, brapi_token: "" });
      setShowNewBrapiToken(false);
      setSuccessMessage("✅ BRAPI Token configurado com sucesso!");
    } catch (err) {
      console.error("Erro ao configurar BRAPI token:", err);
      setErrorMessage("Erro ao configurar BRAPI token. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  // 🗑️ Remover OpenAI API Key
  const handleRemoveApiKey = async () => {
    const confirmed = window.confirm(
      "Tem certeza que deseja remover a OpenAI API key?\n\nAs análises com IA serão desabilitadas."
    );
    if (!confirmed) return;

    setIsRemoving(true);
    setErrorMessage("");

    try {
      const updatedSettings = {
        ...settings,
        openai_api_key: "",
      };

      await saveUserSettings(updatedSettings);
      setSettings(updatedSettings);
      setShowApiKey(false);
      setSuccessMessage("✅ OpenAI API Key removida com sucesso!");
    } catch (err) {
      console.error("Erro ao remover API key:", err);
      setErrorMessage("Erro ao remover API key. Tente novamente.");
    } finally {
      setIsRemoving(false);
    }
  };

  // 🗑️ Remover BRAPI Token
  const handleRemoveBrapiToken = async () => {
    const confirmed = window.confirm(
      "Tem certeza que deseja remover o BRAPI token?\n\nO carregamento de dados de FIIs será desabilitado."
    );
    if (!confirmed) return;

    setIsRemoving(true);
    setErrorMessage("");

    try {
      const updatedSettings = {
        ...settings,
        brapi_token: "",
      };

      await saveUserSettings(updatedSettings);
      setSettings(updatedSettings);
      setShowBrapiToken(false);
      setSuccessMessage("✅ BRAPI Token removido com sucesso!");
    } catch (err) {
      console.error("Erro ao remover BRAPI token:", err);
      setErrorMessage("Erro ao remover BRAPI token. Tente novamente.");
    } finally {
      setIsRemoving(false);
    }
  };

  // 🔧 Limpar formulários
  const handleClearForm = () => {
    setNewSettings({
      openai_api_key: "",
      brapi_token: "",
    });
    setShowNewApiKey(false);
    setShowNewBrapiToken(false);
    setErrorMessage("");
    setSuccessMessage("");
  };

  // 🔧 Mascarar chaves
  const getMaskedKey = (key) => {
    if (!key || key.length < 8) return "";
    return `${key.substring(0, 7)}${"•".repeat(20)}${key.substring(
      key.length - 4
    )}`;
  };

  // 🎯 Estados derivados
  const isOpenAIConfigured =
    settings.openai_api_key && settings.openai_api_key.length > 0;
  const isBrapiConfigured =
    settings.brapi_token && settings.brapi_token.length > 0;
  const isFullyConfigured = isOpenAIConfigured && isBrapiConfigured;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-lg">Carregando configurações...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Configure suas integrações e preferências do sistema
        </p>
      </div>

      {/* Status Geral */}
      <Card
        className={`border-2 ${
          isFullyConfigured
            ? "border-green-200 bg-green-50"
            : "border-orange-200 bg-orange-50"
        }`}
      >
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            {isFullyConfigured ? (
              <>
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div className="flex-1">
                  <p className="font-semibold text-green-700">
                    Sistema Totalmente Configurado
                  </p>
                  <p className="text-sm text-green-600">
                    OpenAI e BRAPI configurados - Todas as funcionalidades
                    ativas
                  </p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="h-6 w-6 text-orange-600" />
                <div className="flex-1">
                  <p className="font-semibold text-orange-700">
                    Configuração Incompleta
                  </p>
                  <p className="text-sm text-orange-600">
                    Configure OpenAI e BRAPI para ativar todas as
                    funcionalidades
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Mensagens */}
      {successMessage && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

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
      <Tabs defaultValue="apis">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="apis">APIs & Integrações</TabsTrigger>
          <TabsTrigger value="preferences">Preferências</TabsTrigger>
          <TabsTrigger value="about">Sobre</TabsTrigger>
        </TabsList>

        {/* APIs & Integrações */}
        <TabsContent value="apis" className="space-y-6">
          {/* OpenAI Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                OpenAI API Key
              </CardTitle>
              <CardDescription>
                Configure sua API key da OpenAI para análises fundamentalistas
                com IA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status OpenAI */}
              <div
                className={`flex items-center gap-3 p-4 border rounded-lg ${
                  isOpenAIConfigured
                    ? "border-green-200 bg-green-50"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                {isOpenAIConfigured ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div className="flex-1">
                      <p className="font-medium text-green-700">
                        OpenAI Configurada
                      </p>
                      <p className="text-sm text-green-600">
                        Análises com IA habilitadas
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-gray-600" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-700">
                        OpenAI Não Configurada
                      </p>
                      <p className="text-sm text-gray-600">
                        Configure para habilitar análises com IA
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Configuração OpenAI */}
              {isOpenAIConfigured ? (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">
                      API Key Configurada
                    </Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        type={showApiKey ? "text" : "password"}
                        value={
                          showApiKey
                            ? settings.openai_api_key
                            : getMaskedKey(settings.openai_api_key)
                        }
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
                  </div>
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
              ) : (
                <form onSubmit={handleConfigureApiKey} className="space-y-4">
                  <div>
                    <Label
                      htmlFor="openai-api-key"
                      className="text-sm font-medium"
                    >
                      Nova API Key da OpenAI
                    </Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        id="openai-api-key"
                        type={showNewApiKey ? "text" : "password"}
                        value={newSettings.openai_api_key}
                        onChange={(e) =>
                          setNewSettings({
                            ...newSettings,
                            openai_api_key: e.target.value,
                          })
                        }
                        placeholder="sk-..."
                        className="flex-1"
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
                    <p className="text-xs text-muted-foreground mt-1">
                      Obtenha sua API key em{" "}
                      <a
                        href="https://platform.openai.com/api-keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline inline-flex items-center gap-1"
                      >
                        platform.openai.com
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={isSaving || !newSettings.openai_api_key.trim()}
                      className="flex items-center gap-2"
                    >
                      {isSaving ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      {isSaving ? "Salvando..." : "Salvar API Key"}
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
            </CardContent>
          </Card>

          {/* BRAPI Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                BRAPI Token
              </CardTitle>
              <CardDescription>
                Configure seu token da BRAPI para carregar dados de FIIs em
                tempo real
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status BRAPI */}
              <div
                className={`flex items-center gap-3 p-4 border rounded-lg ${
                  isBrapiConfigured
                    ? "border-green-200 bg-green-50"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                {isBrapiConfigured ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div className="flex-1">
                      <p className="font-medium text-green-700">
                        BRAPI Configurada
                      </p>
                      <p className="text-sm text-green-600">
                        Dados de FIIs em tempo real
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-gray-600" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-700">
                        BRAPI Não Configurada
                      </p>
                      <p className="text-sm text-gray-600">
                        Configure para carregar dados de FIIs
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Configuração BRAPI */}
              {isBrapiConfigured ? (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">
                      Token Configurado
                    </Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        type={showBrapiToken ? "text" : "password"}
                        value={
                          showBrapiToken
                            ? settings.brapi_token
                            : getMaskedKey(settings.brapi_token)
                        }
                        readOnly
                        className="flex-1 bg-gray-50"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowBrapiToken(!showBrapiToken)}
                        className="px-3"
                      >
                        {showBrapiToken ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={handleRemoveBrapiToken}
                    disabled={isRemoving}
                    className="flex items-center gap-2"
                  >
                    {isRemoving ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    {isRemoving ? "Removendo..." : "Remover Token"}
                  </Button>
                </div>
              ) : (
                <form
                  onSubmit={handleConfigureBrapiToken}
                  className="space-y-4"
                >
                  <div>
                    <Label
                      htmlFor="brapi-token"
                      className="text-sm font-medium"
                    >
                      Novo Token da BRAPI
                    </Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        id="brapi-token"
                        type={showNewBrapiToken ? "text" : "password"}
                        value={newSettings.brapi_token}
                        onChange={(e) =>
                          setNewSettings({
                            ...newSettings,
                            brapi_token: e.target.value,
                          })
                        }
                        placeholder="Seu token da BRAPI..."
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowNewBrapiToken(!showNewBrapiToken)}
                        className="px-3"
                      >
                        {showNewBrapiToken ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Obtenha seu token em{" "}
                      <a
                        href="https://brapi.dev"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline inline-flex items-center gap-1"
                      >
                        brapi.dev
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={isSaving || !newSettings.brapi_token.trim()}
                      className="flex items-center gap-2"
                    >
                      {isSaving ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      {isSaving ? "Salvando..." : "Salvar Token"}
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferências */}
        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Preferências do Sistema
              </CardTitle>
              <CardDescription>
                Configure suas preferências de uso e privacidade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Funcionalidades de preferências serão implementadas em breve.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sobre */}
        <TabsContent value="about" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Sobre o Sistema
              </CardTitle>
              <CardDescription>
                Informações sobre o FII Investment Analyzer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="font-medium">FII Investment Analyzer</p>
                <p className="text-sm text-muted-foreground">
                  Sistema avançado de análise de Fundos de Investimento
                  Imobiliário com IA
                </p>
              </div>
              <div className="space-y-2">
                <p className="font-medium">Tecnologias</p>
                <p className="text-sm text-muted-foreground">
                  React, Supabase, OpenAI GPT-4, BRAPI, Tailwind CSS
                </p>
              </div>
              <div className="space-y-2">
                <p className="font-medium">Dados Seguros</p>
                <p className="text-sm text-muted-foreground">
                  Todas as configurações são armazenadas com segurança no
                  Supabase com criptografia
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;

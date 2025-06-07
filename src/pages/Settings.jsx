import React, { useState } from 'react';
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
  Info
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useAI } from '../contexts/AIContext';

const Settings = () => {
  const {
    apiKey,
    isConfigured,
    loading,
    error,
    configureApiKey,
    removeApiKey,
    clearError
  } = useAI();

  const [newApiKey, setNewApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [showNewApiKey, setShowNewApiKey] = useState(false);

  const handleConfigureApiKey = (e) => {
    e.preventDefault();
    if (newApiKey.trim()) {
      const success = configureApiKey(newApiKey.trim());
      if (success) {
        setNewApiKey('');
        setShowNewApiKey(false);
      }
    }
  };

  const handleRemoveApiKey = () => {
    if (confirm('Tem certeza que deseja remover a API key? As análises com IA serão desabilitadas.')) {
      removeApiKey();
    }
  };

  const maskedApiKey = apiKey ? `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}` : '';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Configure a integração com IA e outras preferências
        </p>
      </div>

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
                Configure a integração com OpenAI para análises fundamentalistas avançadas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status da Configuração */}
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                {isConfigured ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div className="flex-1">
                      <p className="font-medium text-green-600">IA Configurada</p>
                      <p className="text-sm text-muted-foreground">
                        Análises fundamentalistas habilitadas
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    <div className="flex-1">
                      <p className="font-medium text-orange-600">IA Não Configurada</p>
                      <p className="text-sm text-muted-foreground">
                        Usando análises simuladas (modo demo)
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Configuração da API Key */}
              {isConfigured ? (
                <div className="space-y-4">
                  <div>
                    <Label>API Key Configurada</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        type={showApiKey ? 'text' : 'password'}
                        value={showApiKey ? apiKey : maskedApiKey}
                        readOnly
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="destructive" onClick={handleRemoveApiKey}>
                      <Key className="mr-2 h-4 w-4" />
                      Remover API Key
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleConfigureApiKey} className="space-y-4">
                  <div>
                    <Label htmlFor="api-key">API Key da OpenAI</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        id="api-key"
                        type={showNewApiKey ? 'text' : 'password'}
                        value={newApiKey}
                        onChange={(e) => setNewApiKey(e.target.value)}
                        placeholder="sk-..."
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowNewApiKey(!showNewApiKey)}
                      >
                        {showNewApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Sua API key é armazenada localmente e nunca enviada para nossos servidores
                    </p>
                  </div>
                  
                  <Button type="submit" disabled={!newApiKey.trim() || loading}>
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Key className="mr-2 h-4 w-4" />
                    )}
                    Configurar IA
                  </Button>
                </form>
              )}

              {/* Informações sobre a IA */}
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">Como funciona a análise com IA:</p>
                    <ul className="text-sm space-y-1 ml-4">
                      <li>• Análise fundamentalista detalhada de cada FII</li>
                      <li>• Recomendações personalizadas baseadas no seu perfil</li>
                      <li>• Justificativas técnicas para cada sugestão</li>
                      <li>• Análise de mercado e tendências setoriais</li>
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
                      Avaliação detalhada de indicadores financeiros
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Análise de Risco</h4>
                    <p className="text-sm text-muted-foreground">
                      Identificação de riscos e oportunidades
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <Zap className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Recomendações Personalizadas</h4>
                    <p className="text-sm text-muted-foreground">
                      Sugestões baseadas no seu perfil de investidor
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <Brain className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Análise de Carteira</h4>
                    <p className="text-sm text-muted-foreground">
                      Avaliação da diversificação e balanceamento
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
              <CardTitle>Preferências do Usuário</CardTitle>
              <CardDescription>
                Personalize sua experiência na aplicação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center h-32 border-2 border-dashed border-muted rounded-lg">
                <div className="text-center text-muted-foreground">
                  <p className="text-sm">Configurações de preferências</p>
                  <p className="text-xs">Serão implementadas em breve</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sobre */}
        <TabsContent value="about" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>FII Investment Analyzer</CardTitle>
              <CardDescription>
                Análise inteligente de Fundos de Investimento Imobiliário
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Versão</span>
                  <span className="text-sm font-medium">1.0.0</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Tecnologias</span>
                  <span className="text-sm font-medium">React, Vite, Tailwind CSS</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">IA</span>
                  <span className="text-sm font-medium">OpenAI GPT-3.5 Turbo</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Dados</span>
                  <span className="text-sm font-medium">APIs públicas da B3</span>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Esta aplicação foi desenvolvida para auxiliar na análise e gestão de investimentos em FIIs. 
                  As informações fornecidas não constituem recomendação de investimento. 
                  Sempre consulte um profissional qualificado antes de tomar decisões de investimento.
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


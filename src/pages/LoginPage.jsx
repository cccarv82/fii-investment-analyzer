import React, { useState } from "react";
import { Mail, Lock, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";
import { useAuth } from "../contexts/AuthContext";

const LoginPage = () => {
  const [email, setEmail] = useState("cccarv82@gmail.com");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success', 'error', 'info'
  const [emailSent, setEmailSent] = useState(false);

  const { signInWithEmail, signInWithGoogle } = useAuth();

  // 🔐 Fazer login com email
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await signInWithEmail(email);
      setEmailSent(true);
      setMessage(
        "Link de acesso enviado para seu email! Verifique sua caixa de entrada."
      );
      setMessageType("success");
    } catch (error) {
      console.error("Erro no login:", error);
      setMessage(error.message || "Erro ao enviar link de acesso");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // 🔐 Fazer login com Google
  const handleGoogleLogin = async () => {
    setLoading(true);
    setMessage("");

    try {
      await signInWithGoogle();
      setMessage("Redirecionando para Google...");
      setMessageType("info");
    } catch (error) {
      console.error("Erro no login Google:", error);
      setMessage(error.message || "Erro ao fazer login com Google");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Reenviar email
  const handleResendEmail = async () => {
    setLoading(true);
    try {
      await signInWithEmail(email);
      setMessage("Novo link enviado para seu email!");
      setMessageType("success");
    } catch (error) {
      setMessage(error.message || "Erro ao reenviar email");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">FII</span>
            </div>
            <h1 className="text-2xl font-bold text-white">
              Investment Analyzer
            </h1>
          </div>
          <p className="text-slate-400">
            Análise inteligente de Fundos de Investimento Imobiliário
          </p>
        </div>

        {/* Login Card */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center text-white">
              {emailSent ? "Verifique seu Email" : "Acesso Restrito"}
            </CardTitle>
            <CardDescription className="text-center text-slate-400">
              {emailSent
                ? "Clique no link enviado para acessar o sistema"
                : "Apenas usuários autorizados podem acessar"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {!emailSent ? (
              <>
                {/* Formulário de Login */}
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">
                      Email Autorizado
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="cccarv82@gmail.com"
                        className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading || email !== "cccarv82@gmail.com"}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Enviar Link de Acesso
                      </>
                    )}
                  </Button>
                </form>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-600" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-slate-800 px-2 text-slate-400">ou</span>
                  </div>
                </div>

                {/* Google Login */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  )}
                  Continuar com Google
                </Button>
              </>
            ) : (
              /* Email Enviado */
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>

                <div className="space-y-2">
                  <p className="text-slate-300">
                    Enviamos um link de acesso para:
                  </p>
                  <p className="font-medium text-white">{email}</p>
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-slate-400">
                    Não recebeu o email? Verifique sua pasta de spam ou clique
                    abaixo para reenviar.
                  </p>

                  <Button
                    variant="outline"
                    className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                    onClick={handleResendEmail}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Reenviando...
                      </>
                    ) : (
                      "Reenviar Email"
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Mensagens */}
            {message && (
              <Alert
                className={`${
                  messageType === "success"
                    ? "border-green-500 bg-green-500/10"
                    : messageType === "error"
                    ? "border-red-500 bg-red-500/10"
                    : "border-blue-500 bg-blue-500/10"
                }`}
              >
                {messageType === "success" ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : messageType === "error" ? (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-blue-500" />
                )}
                <AlertDescription
                  className={`${
                    messageType === "success"
                      ? "text-green-400"
                      : messageType === "error"
                      ? "text-red-400"
                      : "text-blue-400"
                  }`}
                >
                  {message}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-slate-500">
          <p>Sistema de acesso restrito</p>
          <p>Apenas usuários autorizados podem acessar</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

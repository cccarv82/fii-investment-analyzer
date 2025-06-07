import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase, authConfig, isAuthorizedUser } from "../lib/supabase";

// 🔐 Contexto de Autenticação
const AuthContext = createContext();

// 🎯 Provider de Autenticação
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // 🔍 Verificar sessão inicial
    const checkInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Erro ao verificar sessão:", error);
        } else if (session) {
          setSession(session);
          setUser(session.user);
          setIsAuthorized(isAuthorizedUser(session.user.email));
        }
      } catch (error) {
        console.error("Erro ao verificar sessão inicial:", error);
      } finally {
        setLoading(false);
      }
    };

    checkInitialSession();

    // 🔄 Listener para mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);

      setSession(session);
      setUser(session?.user || null);
      setIsAuthorized(
        session?.user ? isAuthorizedUser(session.user.email) : false
      );
      setLoading(false);

      // 🎯 Criar perfil automaticamente se necessário
      if (event === "SIGNED_IN" && session?.user) {
        await createUserProfileIfNeeded(session.user);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // 🔧 Criar perfil do usuário se não existir
  const createUserProfileIfNeeded = async (user) => {
    try {
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      if (!existingProfile) {
        const { error } = await supabase.from("profiles").insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email.split("@")[0],
          created_at: new Date().toISOString(),
        });

        if (error) {
          console.error("Erro ao criar perfil:", error);
        } else {
          console.log("✅ Perfil criado com sucesso");
        }
      }
    } catch (error) {
      console.error("Erro ao verificar/criar perfil:", error);
    }
  };

  // 🔐 Fazer login com email (Magic Link)
  const signInWithEmail = async (email) => {
    if (!isAuthorizedUser(email)) {
      throw new Error(
        "Email não autorizado. Apenas cccarv82@gmail.com pode acessar."
      );
    }

    const { data, error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      throw error;
    }

    return data;
  };

  // 🔐 Fazer login com Google (se configurado)
  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      throw error;
    }

    return data;
  };

  // 🚪 Fazer logout
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  };

  // 🔄 Reenviar email de confirmação
  const resendConfirmation = async (email) => {
    const { data, error } = await supabase.auth.resend({
      type: "signup",
      email: email,
    });

    if (error) {
      throw error;
    }

    return data;
  };

  // 🔍 Verificar se usuário está autenticado
  const isAuthenticated = () => {
    return !!user && !!session;
  };

  // 🛡️ Verificar se usuário está autorizado
  const isUserAuthorized = () => {
    return isAuthenticated() && isAuthorized;
  };

  // 📊 Obter dados do usuário
  const getUserData = () => {
    return {
      id: user?.id,
      email: user?.email,
      name: user?.user_metadata?.full_name || user?.email?.split("@")[0],
      avatar: user?.user_metadata?.avatar_url,
      createdAt: user?.created_at,
    };
  };

  const value = {
    user,
    session,
    loading,
    isAuthorized,
    signInWithEmail,
    signInWithGoogle,
    signOut,
    resendConfirmation,
    isAuthenticated,
    isUserAuthorized,
    getUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 🎯 Hook para usar autenticação
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};

// 🛡️ Componente de proteção de rotas
export const ProtectedRoute = ({ children, fallback = null }) => {
  const { loading, isUserAuthorized } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isUserAuthorized()) {
    return fallback;
  }

  return children;
};

export default AuthContext;

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { supabase, authConfig, isAuthorizedUser } from "../lib/supabase";

// 🔐 Contexto de Autenticação
const AuthContext = createContext();

// 🎯 Provider de Autenticação
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // 🔧 Criar perfil do usuário se não existir (memoizado)
  const createUserProfileIfNeeded = useCallback(async (user) => {
    try {
      console.log("🔍 Verificando perfil para:", user.email);

      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      if (!existingProfile) {
        console.log("🆕 Criando novo perfil...");
        const { error } = await supabase.from("profiles").insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email.split("@")[0],
          created_at: new Date().toISOString(),
        });

        if (error) {
          console.error("❌ Erro ao criar perfil:", error);
        } else {
          console.log("✅ Perfil criado com sucesso");
        }
      } else {
        console.log("✅ Perfil já existe");
      }
    } catch (error) {
      console.error("❌ Erro ao verificar/criar perfil:", error);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // 🔍 Verificar sessão inicial
    const checkInitialSession = async () => {
      try {
        console.log("🔍 Verificando sessão inicial...");
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (!mounted) return; // ✅ Evitar atualizações se componente foi desmontado

        if (error) {
          console.error("❌ Erro ao verificar sessão:", error);
        } else if (session) {
          console.log("✅ Sessão encontrada:", session.user.email);
          setSession(session);
          setUser(session.user);
          setIsAuthorized(isAuthorizedUser(session.user.email));
        } else {
          console.log("ℹ️ Nenhuma sessão encontrada");
        }
      } catch (error) {
        console.error("❌ Erro ao verificar sessão inicial:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkInitialSession();

    // 🔄 Listener para mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return; // ✅ Evitar atualizações se componente foi desmontado

      console.log("🔄 Auth state changed:", event, session?.user?.email);

      setSession(session);
      setUser(session?.user || null);
      setIsAuthorized(
        session?.user ? isAuthorizedUser(session.user.email) : false
      );
      setLoading(false);

      // 🎯 Criar perfil automaticamente se necessário (apenas no SIGNED_IN)
      if (event === "SIGNED_IN" && session?.user) {
        // ✅ CORREÇÃO: Usar setTimeout para evitar loop
        setTimeout(() => {
          if (mounted) {
            createUserProfileIfNeeded(session.user);
          }
        }, 100);
      }
    });

    // 🧹 Cleanup
    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []); // ✅ CORREÇÃO: Dependências vazias para evitar loop

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
  const isAuthenticated = useCallback(() => {
    return !!user && !!session;
  }, [user, session]);

  // 🛡️ Verificar se usuário está autorizado
  const isUserAuthorized = useCallback(() => {
    return isAuthenticated() && isAuthorized;
  }, [isAuthenticated, isAuthorized]);

  // 📊 Obter dados do usuário
  const getUserData = useCallback(() => {
    return {
      id: user?.id,
      email: user?.email,
      name: user?.user_metadata?.full_name || user?.email?.split("@")[0],
      avatar: user?.user_metadata?.avatar_url,
      createdAt: user?.created_at,
    };
  }, [user]);

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
